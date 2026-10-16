package com.pulsarkids.api.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.IntNode;
import com.pulsarkids.api.core.Availability;
import com.pulsarkids.api.core.Json;
import com.pulsarkids.api.core.Marketing;
import com.pulsarkids.api.core.Secrets;
import com.pulsarkids.api.core.Tts;
import com.pulsarkids.api.model.AdminPart;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.model.Lang;
import com.pulsarkids.api.model.SpeechAudience;
import com.pulsarkids.api.model.Wire;
import com.pulsarkids.api.service.AccountService;
import com.pulsarkids.api.service.MarketingService;
import com.pulsarkids.api.service.SchemaService;
import com.pulsarkids.api.service.SpeechService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin: accounts →  GET    /api/admin/users
 *                    PUT    /api/admin/users  { parentId, speechEnabled }
 *                    PUT    /api/admin/users  { parentId, enabled }
 *                    DELETE /api/admin/users?id=…   (with all children and their data)
 * The PUT switches Google Speech — or, with `enabled`, the whole account —
 * on/off for one account. Keys themselves are managed in /api/admin/speech.
 * Requires `x-admin-key`.
 *
 * With `?part=…` the same address serves the owner's side of the product:
 *
 *   GET    ?part=settings                        → { settings }
 *   PUT    ?part=settings  { demoMinutes?, trialSpeech?: { enabled, key? }, voices?, paidMode? }  → { settings }
 *          (`trialSpeech` — the trial game's own Google key and its switch; an empty `key` keeps the stored one;
 *          `voices` — `{ accounts?: { uk?: "uk-UA-…" | "" }, trial?: { … } }`, the voice each language is read in
 *          for every account and for the trial game, "" back to the default; languages not named stay as they are;
 *          `paidMode` — the paid mode on or off: off, everything is free and nothing of paying is seen)
 *   GET    ?part=links[&days=30]                 → { links, visits }   (days=0 — all time)
 *   POST   ?part=links     { name, mode, code?, note? }   a new link
 *   PUT    ?part=links     { id, name, note? }             rename one
 *   DELETE ?part=links&id=…                                its visits stay
 *   GET    ?part=availability                    → { availability }   what is offered where
 *   PUT    ?part=availability  { availability }  → { availability }   as it was kept (cleaned)
 *
 * (The parts share this address because the Node API they came from could not
 * afford an endpoint each; the admin panel still asks here.)
 */
@RestController
@RequiredArgsConstructor
@RequestMapping(Routes.ADMIN_USERS)
public class AdminUsersController extends ApiController {
  private final AccountService accounts;
  private final MarketingService marketing;
  private final SpeechService speech;
  private final SchemaService schema;

  private ResponseEntity<Object> notAllowed(RequestMethod... allowed) {
    String allow = Arrays.stream(allowed).map(Enum::name).collect(Collectors.joining(", "));
    return ResponseEntity.status(ApiError.METHOD_NOT_ALLOWED.getStatus()).header(HttpHeaders.ALLOW, allow).body(refusal(ApiError.METHOD_NOT_ALLOWED));
  }

  /** A whole number out of a query parameter, or null. */
  private static Integer whole(String text) {
    double value = Json.number(text);
    return text == null || Double.isNaN(value) || value != Math.rint(value) ? null : (int) value;
  }

  @RequestMapping(method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
  public ResponseEntity<Object> users(
      HttpServletRequest request,
      @RequestParam(name = Fields.PART, required = false) String part,
      @RequestParam(name = Fields.ID, required = false) String rawId,
      @RequestParam(name = Fields.DAYS, required = false) String rawDays,
      @RequestBody(required = false) JsonNode body) {
    Requests.requireAdmin(request);
    schema.ensure();
    RequestMethod method = RequestMethod.valueOf(request.getMethod());

    if (part != null && !part.isEmpty()) {
      AdminPart asked = Wire.of(AdminPart.class, part);
      if (asked == null) return refuse(ApiError.UNKNOWN_PART);
      return switch (asked) {
        case SETTINGS -> settings(method, body);
        case LINKS -> links(method, body, rawId, rawDays);
        case AVAILABILITY -> availability(method, body);
      };
    }

    switch (method) {
      case GET:
        return ok(Fields.ACCOUNTS, accounts.listAccounts());
      case PUT: {
        JsonNode parentId = Json.at(body, Fields.PARENT_ID);
        JsonNode speechEnabled = Json.at(body, Fields.SPEECH_ENABLED);
        if (!Json.isInt(parentId)) return refuse(ApiError.INVALID_PARENT_ID);
        JsonNode enabled = Json.at(body, Fields.ENABLED);
        if (!enabled.isMissingNode()) {
          if (!enabled.isBoolean()) return refuse(ApiError.INVALID_ENABLED);
          if (!accounts.setDisabled((int) Json.intOf(parentId), !enabled.booleanValue())) return refuse(ApiError.PARENT_NOT_FOUND);
          return ok(Fields.OK, true, Fields.PARENT_ID, Json.intOf(parentId), Fields.DISABLED, !enabled.booleanValue());
        }
        if (!speechEnabled.isBoolean()) return refuse(ApiError.INVALID_SPEECH_ENABLED);
        if (!accounts.setSpeechOff((int) Json.intOf(parentId), !speechEnabled.booleanValue())) return refuse(ApiError.PARENT_NOT_FOUND);
        return ok(Fields.OK, true, Fields.PARENT_ID, Json.intOf(parentId), Fields.SPEECH_OFF, !speechEnabled.booleanValue());
      }
      case DELETE: {
        Integer id = whole(rawId);
        if (id == null) return refuse(ApiError.INVALID_PARENT_ID);
        if (!accounts.deleteParent(id)) return refuse(ApiError.PARENT_NOT_FOUND);
        return ok(Fields.OK, true);
      }
      default:
        return notAllowed(RequestMethod.GET, RequestMethod.PUT, RequestMethod.DELETE);
    }
  }

  private Map<String, Object> settingsView() {
    return Json.map(
        Fields.DEMO_MINUTES, marketing.demoMinutes(),
        Fields.DEMO_MINUTES_DEFAULT, Marketing.DEMO_MINUTES_DEFAULT,
        Fields.DEMO_MINUTES_MIN, Marketing.DEMO_MINUTES_MIN,
        Fields.DEMO_MINUTES_MAX, Marketing.DEMO_MINUTES_MAX,
        Fields.TRIAL_SPEECH, trialSpeechView(speech.trialSpeech()),
        Fields.VOICES, speech.chosenVoices(),
        Fields.DEFAULT_VOICES, defaultVoices(),
        Fields.PAID_MODE, marketing.paidModeOn());
  }

  /** The voice each language is read in when the owner chose none. */
  private static Map<String, Object> defaultVoices() {
    Map<String, Object> out = new LinkedHashMap<>();
    for (Lang lang : Lang.values()) out.put(lang.wire(), lang.getCloudVoice());
    return out;
  }

  /** The changes of `voices` in a PUT, or null when one of them is not a voice of its language. */
  private static Map<SpeechAudience, Map<Lang, String>> voiceChanges(JsonNode voices) {
    Map<SpeechAudience, Map<Lang, String>> changes = new EnumMap<>(SpeechAudience.class);
    for (SpeechAudience who : SpeechAudience.values()) {
      JsonNode byLang = Json.at(voices, who.wire());
      if (!Json.present(byLang)) continue;
      Map<Lang, String> choices = new EnumMap<>(Lang.class);
      for (Lang lang : Lang.values()) {
        JsonNode raw = Json.at(byLang, lang.wire());
        if (!Json.present(raw)) continue;
        String voice = Json.text(raw);
        if (voice == null) return null;
        voice = voice.strip();
        if (!voice.isEmpty() && !Tts.speaks(lang, voice)) return null;
        choices.put(lang, voice.isEmpty() ? null : voice);
      }
      changes.put(who, choices);
    }
    return changes;
  }

  /** The trial game's voice as the admin panel sees it — never the key, only its last 4 characters. */
  private static Map<String, Object> trialSpeechView(SpeechService.TrialSpeech trial) {
    String plain = Secrets.decrypt(trial.encryptedKey());
    boolean readable = plain != null && !plain.isEmpty();
    return Json.map(
        Fields.ENABLED, trial.enabled(),
        Fields.KEY_HINT, readable ? "…" + plain.substring(Math.max(0, plain.length() - 4)) : "",
        // False when there is no key, or it can no longer be decrypted (SECRETS_KEY changed).
        Fields.READABLE, readable);
  }

  private ResponseEntity<Object> settings(RequestMethod method, JsonNode body) {
    if (method == RequestMethod.GET) return ok(Fields.SETTINGS, settingsView());
    if (method == RequestMethod.PUT) {
      JsonNode rawMinutes = Json.at(body, Fields.DEMO_MINUTES);
      JsonNode trial = Json.at(body, Fields.TRIAL_SPEECH);
      JsonNode voices = Json.at(body, Fields.VOICES);
      JsonNode paid = Json.at(body, Fields.PAID_MODE);
      boolean hasMinutes = Json.present(rawMinutes);
      Integer minutes = hasMinutes ? Marketing.cleanDemoMinutes(rawMinutes) : null;
      if ((hasMinutes || !(Json.present(trial) || Json.present(voices) || Json.present(paid))) && minutes == null) return refuse(ApiError.INVALID_DEMO_MINUTES);
      if (Json.present(paid) && !paid.isBoolean()) return refuse(ApiError.INVALID_ENABLED);
      Map<SpeechAudience, Map<Lang, String>> voiceChanges = Json.present(voices) ? voiceChanges(voices) : Map.of();
      if (voiceChanges == null) return refuse(ApiError.INVALID_VOICE);
      if (Json.present(trial)) {
        JsonNode enabled = Json.at(trial, Fields.ENABLED);
        if (!enabled.isBoolean()) return refuse(ApiError.INVALID_ENABLED);
        String rawKey = Json.text(Json.at(trial, Fields.KEY));
        String secret = rawKey == null ? "" : rawKey.strip();
        if (secret.length() > 200) return refuse(ApiError.INVALID_KEY);
        // Switched on with no key to speak with: nothing would be heard.
        if (enabled.booleanValue() && secret.isEmpty() && Secrets.decrypt(speech.trialSpeech().encryptedKey()) == null) return refuse(ApiError.INVALID_KEY);
        speech.saveTrialSpeech(enabled.booleanValue(), secret.isEmpty() ? null : Secrets.encrypt(secret));
      }
      if (!voiceChanges.isEmpty()) speech.saveVoices(voiceChanges);
      if (minutes != null) marketing.setSetting(MarketingService.DEMO_MINUTES_KEY, IntNode.valueOf(minutes));
      if (Json.present(paid)) marketing.setPaidMode(paid.booleanValue());
      return ok(Fields.SETTINGS, settingsView());
    }
    return notAllowed(RequestMethod.GET, RequestMethod.PUT);
  }

  private ResponseEntity<Object> links(RequestMethod method, JsonNode body, String rawId, String rawDays) {
    Integer asked = rawDays == null ? Integer.valueOf(30) : whole(rawDays);
    int days = asked != null && asked >= 0 ? asked : 30;

    switch (method) {
      case GET:
        break;
      case POST: {
        Marketing.LinkResult cleaned = Marketing.cleanLink(body);
        if (cleaned.error() != null) return refuse(cleaned.error());
        if (!marketing.createLink(cleaned.link())) return refuse(ApiError.CODE_TAKEN);
        break;
      }
      case PUT: {
        JsonNode id = Json.at(body, Fields.ID);
        String rawName = Json.text(Json.at(body, Fields.NAME));
        String name = rawName == null ? "" : rawName.strip();
        if (name.length() > 80) name = name.substring(0, 80);
        if (!Json.isInt(id) || name.isEmpty()) return refuse(ApiError.INVALID_NAME);
        String rawNote = Json.text(Json.at(body, Fields.NOTE));
        String note = rawNote == null ? "" : rawNote.strip();
        if (note.length() > 300) note = note.substring(0, 300);
        if (!marketing.renameLink((int) Json.intOf(id), name, note)) return refuse(ApiError.LINK_NOT_FOUND);
        break;
      }
      case DELETE: {
        Integer id = whole(rawId);
        if (id == null || !marketing.deleteLink(id)) return refuse(ApiError.LINK_NOT_FOUND);
        break;
      }
      default:
        return notAllowed(RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE);
    }
    return ok(Fields.LINKS, marketing.listLinks(), Fields.VISITS, marketing.listVisits(days, 5000));
  }

  private ResponseEntity<Object> availability(RequestMethod method, JsonNode body) {
    if (method == RequestMethod.PUT) {
      JsonNode raw = Json.at(body, Fields.AVAILABILITY);
      if (!raw.isObject()) return refuse(ApiError.INVALID_AVAILABILITY);
      marketing.setSetting(MarketingService.AVAILABILITY_KEY, Availability.clean(raw));
    } else if (method != RequestMethod.GET) {
      return notAllowed(RequestMethod.GET, RequestMethod.PUT);
    }
    marketing.forgetAvailabilityRules();
    return ok(Fields.AVAILABILITY, marketing.availabilityRules());
  }
}
