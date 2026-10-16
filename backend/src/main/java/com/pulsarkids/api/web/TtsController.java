package com.pulsarkids.api.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.pulsarkids.api.core.Auth;
import com.pulsarkids.api.core.Json;
import com.pulsarkids.api.core.Secrets;
import com.pulsarkids.api.core.Tts;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.model.Lang;
import com.pulsarkids.api.model.Wire;
import com.pulsarkids.api.service.SchemaService;
import com.pulsarkids.api.service.SpeechService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Natural voice →
 *   POST /api/tts        { text, lang? }  →  { audio }  (base64 MP3)   a signed-in account
 *   GET  /api/tts/trial                   →  { enabled }               does the trial game speak with it?
 *   POST /api/tts/trial  { text, lang? }  →  { audio }                 the trial game (no account)
 *
 * `lang` (`uk` — the default —, `en`, `pl`) names the language of the phrase,
 * and with it the voice that reads it. The text may carry stress marks
 * (U+0301, `game/src/core/language/stress.ts`); they are not counted in its length.
 *
 * An account speaks with the Google Cloud key the admin configured for it; the
 * trial game with the key of its own the owner set in the settings. Phrases are
 * cached in the database (the game repeats the same lines constantly), so each
 * one is paid for once — and one visitor of the trial game may have at most
 * `Tts.TRIAL_PHRASES_PER_HOUR` new ones an hour. 404 `tts_disabled` (and 429
 * `tts_busy`) tell the client to fall back to the browser's own voice.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping(Routes.TTS)
public class TtsController extends ApiController {
  private static final String HOUR = ":";
  /** Past this many visitors counted, the hours gone by are forgotten. */
  private static final int VISITORS_KEPT = 10_000;

  private final SpeechService speech;
  private final SchemaService schema;

  /** New phrases made for the trial game, per visitor and hour (`<address hash>:<hour>`). Lost with the instance — that is fine. */
  private final Map<String, AtomicInteger> trialPhrases = new ConcurrentHashMap<>();

  @PostMapping
  public ResponseEntity<Object> speak(HttpServletRequest request, @RequestBody(required = false) JsonNode body) throws Tts.Failed {
    Auth.User user = Requests.requireUser(request);
    String text = textOf(body);

    schema.ensure();
    SpeechService.Config config = speech.configOf((int) user.id());
    String apiKey = config.enabled() ? Secrets.decrypt(config.encryptedKey()) : null;
    if (apiKey == null || apiKey.isEmpty()) throw new HttpError(ApiError.TTS_DISABLED);

    String voice = Tts.voiceFor(Wire.of(Lang.class, Json.at(body, Fields.LANG), Lang.DEFAULT), config.voice());
    return ok(Fields.AUDIO, speechOf(apiKey, voice, text, null));
  }

  @GetMapping(Routes.TRIAL)
  public ResponseEntity<Object> trialEnabled() {
    schema.ensure();
    return ok(Fields.ENABLED, speech.trialSpeech().live());
  }

  @PostMapping(Routes.TRIAL)
  public ResponseEntity<Object> speakInTrial(HttpServletRequest request, @RequestBody(required = false) JsonNode body) throws Tts.Failed {
    String text = textOf(body);
    schema.ensure();
    SpeechService.TrialSpeech trial = speech.trialSpeech();
    String apiKey = trial.live() ? Secrets.decrypt(trial.encryptedKey()) : null;
    if (apiKey == null || apiKey.isEmpty()) throw new HttpError(ApiError.TTS_DISABLED);

    String voice = Wire.of(Lang.class, Json.at(body, Fields.LANG), Lang.DEFAULT).getCloudVoice();
    return ok(Fields.AUDIO, speechOf(apiKey, voice, text, Requests.clientIp(request)));
  }

  /** The phrase asked for, its spaces tidied; refused when empty or too long. */
  private static String textOf(JsonNode body) {
    String raw = Json.text(Json.at(body, Fields.TEXT));
    String text = raw == null ? "" : raw.replaceAll("(?U)\\s+", " ").strip();
    if (text.isEmpty() || Tts.lengthOf(text) > Tts.MAX_TTS_CHARS) throw new HttpError(ApiError.INVALID_TEXT);
    return text;
  }

  /**
   * The phrase from the cache, or made by Google and cached. `visitor` (an
   * address) is counted against the trial's allowance; null — an account, not counted.
   */
  private String speechOf(String apiKey, String voice, String text, String visitor) throws Tts.Failed {
    String hash = Tts.hash(voice, text);
    String audio = speech.cachedSpeech(hash);
    if (audio != null) return audio;
    if (visitor != null && !allowNewPhrase(visitor)) throw new HttpError(ApiError.TTS_BUSY);
    audio = Tts.synthesize(apiKey, voice, text);
    speech.cacheSpeech(hash, voice, audio);
    return audio;
  }

  /** One more new phrase for this visitor of the trial game, if the hour's allowance has room. */
  private boolean allowNewPhrase(String visitor) {
    long hour = System.currentTimeMillis() / 3_600_000L;
    String suffix = HOUR + hour;
    if (trialPhrases.size() > VISITORS_KEPT) trialPhrases.keySet().removeIf((key) -> !key.endsWith(suffix));
    String key = Secrets.sha256Hex(visitor).substring(0, 16) + suffix;
    return trialPhrases.computeIfAbsent(key, (k) -> new AtomicInteger()).incrementAndGet() <= Tts.TRIAL_PHRASES_PER_HOUR;
  }

  /** The voice could not be made: the client falls back to the browser's. */
  @ExceptionHandler(Tts.Failed.class)
  public ResponseEntity<Object> noSpeech(Tts.Failed err) {
    log.error("[tts] failed: {} {}", err.getError().getCode(), err.getMessage());
    return refuse(err.getError());
  }

  @Override
  protected ApiError failure() {
    return ApiError.TTS_FAILED;
  }
}
