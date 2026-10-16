package com.pulsarkids.api.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.pulsarkids.api.core.Json;
import com.pulsarkids.api.core.Secrets;
import com.pulsarkids.api.core.Tts;
import com.pulsarkids.api.data.entity.TtsKey;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.model.Lang;
import com.pulsarkids.api.model.SpeechAudience;
import com.pulsarkids.api.model.SpeechScope;
import com.pulsarkids.api.model.Text;
import com.pulsarkids.api.model.Wire;
import com.pulsarkids.api.service.SchemaService;
import com.pulsarkids.api.service.SpeechService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin: Google Speech keys →
 *   GET    /api/admin/speech                 all keys + who each one serves
 *   GET    /api/admin/speech?voices=1        → { voices: { uk: [{ name, gender }], en, pl } }  the voices Google
 *          offers per language (asked with the global key, else any stored one, else the trial game's)
 *   POST   /api/admin/speech  { label, key, voice, scope, accountIds }
 *   PUT    /api/admin/speech  { id, label, key?, voice, scope, accountIds }
 *   DELETE /api/admin/speech?id=…
 *   POST   /api/admin/speech?test=1  { keyId | trial: true | audience, text?, lang?, voice? }   try a stored
 *          key (or the trial game's) — on a sample phrase of the voice's language, or on `text` read in `lang`;
 *          `audience` ("accounts" / "trial") tries the voice that audience hears in `lang` — or `voice`, before
 *          it is chosen — with whatever key there is
 * `scope`: "global" (serves every account; there is one global key at a time)
 * or "accounts" (serves exactly `accountIds`). Requires `x-admin-key`.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping(Routes.ADMIN_SPEECH)
public class AdminSpeechController extends ApiController {
  private final SpeechService speech;
  private final SchemaService schema;

  /** Never send a stored key back — only its last 4 characters. */
  private List<Map<String, Object>> keys() {
    List<Map<String, Object>> out = new ArrayList<>();
    for (Map<String, Object> key : speech.listKeys()) {
      String plain = Secrets.decrypt((String) key.remove(Fields.ENCRYPTED_KEY));
      String voice = (String) key.get(Fields.VOICE);
      key.put(Fields.VOICE, voice == null || voice.isEmpty() ? Tts.DEFAULT_VOICE : voice);
      key.put(Fields.KEY_HINT, plain == null || plain.isEmpty() ? "" : "…" + plain.substring(Math.max(0, plain.length() - 4)));
      // False when the secret can no longer be decrypted (SECRETS_KEY changed).
      key.put(Fields.READABLE, plain != null && !plain.isEmpty());
      out.add(key);
    }
    return out;
  }

  @GetMapping
  public ResponseEntity<Object> list(HttpServletRequest request, @RequestParam(name = Fields.VOICES, required = false) String voices) {
    Requests.requireAdmin(request);
    schema.ensure();
    if (voices != null && !voices.isEmpty()) return voices();
    return ok(Fields.KEYS, keys(), Fields.DEFAULT_VOICE, Tts.DEFAULT_VOICE);
  }

  /** The voices Google offers for each of our languages; `{ ok: false, error, detail }` when it cannot be asked. */
  private ResponseEntity<Object> voices() {
    String apiKey = Secrets.decrypt(speech.anyKey(SpeechAudience.ACCOUNTS));
    if (apiKey == null || apiKey.isEmpty()) return ok(Fields.OK, false, Fields.ERROR, ApiError.NO_KEY.getCode(), Fields.DETAIL, messages.of(ApiError.NO_KEY));
    Map<String, Object> byLang = new LinkedHashMap<>();
    try {
      for (Lang lang : Lang.values()) {
        byLang.put(lang.wire(), Tts.voicesOf(apiKey, lang).stream().map((v) -> Json.map(Fields.NAME, v.name(), Fields.GENDER, v.gender())).toList());
      }
    } catch (Tts.Failed err) {
      return ok(Fields.OK, false, Fields.ERROR, err.getError().getCode(), Fields.DETAIL, err.getMessage());
    }
    return ok(Fields.OK, true, Fields.VOICES, byLang);
  }

  @PostMapping
  public ResponseEntity<Object> create(
      HttpServletRequest request, @RequestParam(name = Fields.TEST, required = false) String test, @RequestBody(required = false) JsonNode body) {
    Requests.requireAdmin(request);
    schema.ensure();
    if (test != null && !test.isEmpty()) return testKey(body);
    return save(body, true);
  }

  @PutMapping
  public ResponseEntity<Object> update(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
    Requests.requireAdmin(request);
    schema.ensure();
    return save(body, false);
  }

  @DeleteMapping
  public ResponseEntity<Object> delete(HttpServletRequest request, @RequestParam(name = Fields.ID, required = false) String rawId) {
    Requests.requireAdmin(request);
    schema.ensure();
    double id = Json.number(rawId);
    if (rawId == null || Double.isNaN(id) || id != Math.rint(id)) return refuse(ApiError.INVALID_ID);
    if (!speech.deleteKey((int) id)) return refuse(ApiError.KEY_NOT_FOUND);
    return ok(Fields.KEYS, keys());
  }

  /**
   * Try a stored key. Always calls Google (no cache) so a bad key shows up
   * immediately: `{ ok: true, audio }` or `{ ok: false, error, detail }` with
   * Google's reason.
   */
  private ResponseEntity<Object> testKey(JsonNode body) {
    boolean trial = Json.at(body, Fields.TRIAL).asBoolean(false);
    SpeechAudience audience = Wire.of(SpeechAudience.class, Json.at(body, Fields.AUDIENCE), null);
    Lang lang = Wire.of(Lang.class, Json.at(body, Fields.LANG), null);
    String apiKey;
    String voice;
    if (audience != null) {
      // The voice this audience hears (or the one about to be chosen), whatever key reads it.
      if (lang == null) lang = Lang.DEFAULT;
      String asked = Json.text(Json.at(body, Fields.VOICE));
      if (asked != null && !asked.isEmpty() && !Tts.speaks(lang, asked)) return refuse(ApiError.INVALID_VOICE);
      apiKey = Secrets.decrypt(speech.anyKey(audience));
      voice = asked != null && !asked.isEmpty() ? asked : Tts.voiceFor(lang, speech.chosenVoice(audience, lang), null);
    } else if (trial) {
      apiKey = Secrets.decrypt(speech.trialSpeech().encryptedKey());
      voice = lang == null ? null : speech.chosenVoice(SpeechAudience.TRIAL, lang);
    } else {
      JsonNode keyId = Json.at(body, Fields.KEY_ID);
      if (!Json.isInt(keyId)) return refuse(ApiError.INVALID_ID);
      TtsKey key = speech.key((int) Json.intOf(keyId));
      apiKey = key == null ? null : Secrets.decrypt(key.getEncryptedKey());
      voice = key == null ? null : key.getVoice();
      // A phrase in a language is read as the accounts hear it: the voice chosen for it wins over the key's.
      String chosen = lang == null ? null : speech.chosenVoice(SpeechAudience.ACCOUNTS, lang);
      if (chosen != null) voice = chosen;
    }
    if (apiKey == null || apiKey.isEmpty()) return ok(Fields.OK, false, Fields.ERROR, ApiError.NO_KEY.getCode(), Fields.DETAIL, messages.of(ApiError.NO_KEY));

    String raw = Json.text(Json.at(body, Fields.TEXT));
    String text = raw == null ? "" : raw.replaceAll("(?U)\\s+", " ").strip();
    if (Tts.lengthOf(text) > Tts.MAX_TTS_CHARS) return refuse(ApiError.INVALID_TEXT);
    // Read by the voice of `lang` when one is named (the key's own when it is of that language), else by the key's voice.
    String reader = lang != null ? Tts.voiceFor(lang, voice) : Tts.normaliseVoice(voice);
    try {
      String said = text.isEmpty() ? messages.of(Text.SPEECH_SAMPLE, Tts.langOfVoice(reader)) : text;
      return ok(Fields.OK, true, Fields.AUDIO, Tts.synthesize(apiKey, reader, said));
    } catch (Tts.Failed err) {
      return ok(Fields.OK, false, Fields.ERROR, err.getError().getCode(), Fields.DETAIL, err.getMessage());
    }
  }

  private ResponseEntity<Object> save(JsonNode body, boolean creating) {
    JsonNode id = Json.at(body, Fields.ID);
    if (!creating && !Json.isInt(id)) return refuse(ApiError.INVALID_ID);

    String rawKey = Json.text(Json.at(body, Fields.KEY));
    String secret = rawKey == null ? "" : rawKey.strip();
    if (secret.length() > 200 || (creating && secret.isEmpty())) return refuse(ApiError.INVALID_KEY);

    String rawVoice = Json.text(Json.at(body, Fields.VOICE));
    String voiceName = rawVoice == null ? "" : rawVoice.strip();
    if (!voiceName.isEmpty() && !Tts.VOICE_RE.matcher(voiceName).matches()) return refuse(ApiError.INVALID_VOICE);

    SpeechScope scope = Wire.of(SpeechScope.class, Json.at(body, Fields.SCOPE));
    if (scope == null) return refuse(ApiError.INVALID_SCOPE);
    List<Integer> ids = new ArrayList<>();
    JsonNode accountIds = Json.at(body, Fields.ACCOUNT_IDS);
    if (accountIds.isArray()) {
      for (JsonNode accountId : accountIds) {
        if (!Json.isInt(accountId)) return refuse(ApiError.INVALID_ACCOUNT_IDS);
        ids.add((int) Json.intOf(accountId));
      }
    }

    String rawLabel = Json.text(Json.at(body, Fields.LABEL));
    String label = rawLabel == null ? "" : rawLabel.strip();
    if (label.length() > 80) label = label.substring(0, 80);

    Integer savedId = speech.saveKey(
        creating ? null : (int) Json.intOf(id),
        label,
        secret.isEmpty() ? null : Secrets.encrypt(secret),
        voiceName.isEmpty() ? null : voiceName,
        scope == SpeechScope.GLOBAL,
        ids);
    if (savedId == null) return refuse(ApiError.KEY_NOT_FOUND);
    return ok(Fields.ID, savedId, Fields.KEYS, keys());
  }
}
