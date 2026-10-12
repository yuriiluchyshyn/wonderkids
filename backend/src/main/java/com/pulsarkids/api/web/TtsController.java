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
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Natural voice → POST /api/tts  { text, lang? }  →  { audio }  (base64 MP3)
 *
 * `lang` (`uk` — the default —, `en`, `pl`) names the language of the phrase,
 * and with it the voice that reads it.
 *
 * Uses the Google Cloud key the admin configured for this account. Phrases are
 * cached in the database (the game repeats the same lines constantly), so each
 * one is paid for once. 404 `tts_disabled` tells the client to fall back to the
 * browser's own voice.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping(Routes.TTS)
public class TtsController extends ApiController {
  private final SpeechService speech;
  private final SchemaService schema;

  @PostMapping
  public ResponseEntity<Object> speak(HttpServletRequest request, @RequestBody(required = false) JsonNode body) throws Tts.Failed {
    Auth.User user = Requests.requireUser(request);
    String raw = Json.text(Json.at(body, Fields.TEXT));
    String text = raw == null ? "" : raw.replaceAll("(?U)\\s+", " ").strip();
    if (text.isEmpty() || text.length() > Tts.MAX_TTS_CHARS) throw new HttpError(ApiError.INVALID_TEXT);

    schema.ensure();
    SpeechService.Config config = speech.configOf((int) user.id());
    String apiKey = config.enabled() ? Secrets.decrypt(config.encryptedKey()) : null;
    if (apiKey == null || apiKey.isEmpty()) throw new HttpError(ApiError.TTS_DISABLED);

    String voice = Tts.voiceFor(Wire.of(Lang.class, Json.at(body, Fields.LANG), Lang.DEFAULT), config.voice());
    String hash = Tts.hash(voice, text);
    String audio = speech.cachedSpeech(hash);
    if (audio == null) {
      audio = Tts.synthesize(apiKey, voice, text);
      speech.cacheSpeech(hash, voice, audio);
    }
    return ok(Fields.AUDIO, audio);
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
