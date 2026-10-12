package com.pulsarkids.api.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.pulsarkids.api.core.Json;
import com.pulsarkids.api.core.Secrets;
import com.pulsarkids.api.core.Tts;
import com.pulsarkids.api.data.entity.TtsKey;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.model.SpeechScope;
import com.pulsarkids.api.model.Text;
import com.pulsarkids.api.model.Wire;
import com.pulsarkids.api.service.SchemaService;
import com.pulsarkids.api.service.SpeechService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
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
 *   POST   /api/admin/speech  { label, key, voice, scope, accountIds }
 *   PUT    /api/admin/speech  { id, label, key?, voice, scope, accountIds }
 *   DELETE /api/admin/speech?id=…
 *   POST   /api/admin/speech?test=1  { keyId }   try a stored key
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
  public ResponseEntity<Object> list(HttpServletRequest request) {
    Requests.requireAdmin(request);
    schema.ensure();
    return ok(Fields.KEYS, keys(), Fields.DEFAULT_VOICE, Tts.DEFAULT_VOICE);
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
    JsonNode keyId = Json.at(body, Fields.KEY_ID);
    if (!Json.isInt(keyId)) return refuse(ApiError.INVALID_ID);
    TtsKey key = speech.key((int) Json.intOf(keyId));
    String apiKey = key == null ? null : Secrets.decrypt(key.getEncryptedKey());
    if (apiKey == null || apiKey.isEmpty()) return ok(Fields.OK, false, Fields.ERROR, ApiError.NO_KEY.getCode(), Fields.DETAIL, messages.of(ApiError.NO_KEY));
    String voice = Tts.normaliseVoice(key.getVoice());
    try {
      // The sample is in the language the voice reads: a Polish voice says a Polish phrase.
      return ok(Fields.OK, true, Fields.AUDIO, Tts.synthesize(apiKey, voice, messages.of(Text.SPEECH_SAMPLE, Tts.langOfVoice(voice))));
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
