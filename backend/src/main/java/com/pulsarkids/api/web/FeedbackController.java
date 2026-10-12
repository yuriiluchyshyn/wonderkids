package com.pulsarkids.api.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.pulsarkids.api.core.Env;
import com.pulsarkids.api.core.FeedbackRules;
import com.pulsarkids.api.core.Json;
import com.pulsarkids.api.core.Mail;
import com.pulsarkids.api.core.Secrets;
import com.pulsarkids.api.core.Vars;
import com.pulsarkids.api.data.entity.Feedback;
import com.pulsarkids.api.data.repo.FeedbackRepository;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.FeedbackKind;
import com.pulsarkids.api.model.FeedbackStatus;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.model.Lang;
import com.pulsarkids.api.model.Text;
import com.pulsarkids.api.model.Wire;
import com.pulsarkids.api.service.FeedbackService;
import com.pulsarkids.api.service.SchemaService;
import jakarta.servlet.http.HttpServletRequest;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;
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
 * Letters from the public site («Написати нам») →
 *
 * Anyone:
 *   POST /api/feedback  { kind, message, email?, files: [{ name, type, size }] }
 *        stores the text. Without files the letter is forwarded to the owner's
 *        mailbox at once; with files → `{ id, token }` to send them with.
 *   PUT  /api/feedback  { id, token, file, part, data }   one base64 piece of a file
 *   POST /api/feedback  { id, token, finish: true }       forward it, files attached
 *
 * Admin (`x-admin-key`):
 *   GET    /api/feedback                     every letter with its replies
 *   PUT    /api/feedback  { id, reply }      answer by email
 *   PUT    /api/feedback  { id, status }     new | answered | done
 *   PUT    /api/feedback  { id, resend }     forward to the mailbox once more
 *   DELETE /api/feedback?id=…
 *
 * Photos and videos are never kept: they wait in the database only until the
 * email with them has left (see `FeedbackRules` for the limits). The form that
 * writes here is on another origin; what a foreign page may send is decided by
 * `CorsFilter`.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping(Routes.FEEDBACK)
public class FeedbackController extends ApiController {
  /** Where the owner's side of the letters is, on the parents' portal. */
  private static final String ADMIN_PAGE = "/admin/feedback";
  /** What a letter's upload ticket is made from. */
  private static final String TICKET = "feedback:";

  /** How a letter is laid out, whatever its language. */
  private static final String RULE = "—";
  private static final String LIST = ", ";
  private static final String QUOTE = "> ";
  private static final String SIGNATURE = "— Pulsar Kids";
  private static final Pattern LOCAL = Pattern.compile("^(localhost|127\\.|10\\.|192\\.168\\.)|\\.vercel\\.app$");
  private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("dd.MM.yyyy").withZone(ZoneId.of("Europe/Kyiv"));

  private final FeedbackService feedback;
  private final SchemaService schema;

  /** Lets the sender of a letter — and nobody else — add its files. */
  private static String uploadToken(long id) {
    return Secrets.ticket(TICKET + id);
  }

  /** The sender's address is kept only as a hash, to count letters per sender. */
  private static String ipHash(HttpServletRequest request) {
    return Secrets.sha256Hex(Env.jwtSecret() + ":" + Requests.clientIp(request)).substring(0, 32);
  }

  /** Where the owner answers: the admin page lives on the parents' portal. */
  static String adminUrl(String host) {
    String own = Env.get(Vars.PARENTS_URL, "").strip().replaceFirst("/+$", "");
    if (!own.isEmpty()) return own + ADMIN_PAGE;
    // A developer's machine: the game's dev server holds both portals.
    if (host.isEmpty() || LOCAL.matcher(host).find()) return "http://" + (host.isEmpty() ? "localhost" : host.replaceFirst(":\\d+$", "")) + ":4321/admin/feedback";
    return "https://parents." + host.replaceFirst("^(www|play|parents|api)\\.", "") + ADMIN_PAGE;
  }

  /** The language the owner reads their mail in (`OWNER_LANG`; Ukrainian unless said otherwise). */
  private static Lang ownerLang() {
    Lang lang = Wire.of(Lang.class, Env.get(Vars.OWNER_LANG));
    return lang == null ? Lang.DEFAULT : lang;
  }

  /** The language a letter was written in — the one its sender is answered in. */
  private static Lang langOf(Feedback letter) {
    Lang lang = Wire.of(Lang.class, letter.getLang());
    return lang == null ? Lang.DEFAULT : lang;
  }

  private String megabytes(long bytes, Lang lang) {
    return messages.of(Text.MAIL_LETTER_MEGABYTES, lang, String.format(Locale.ROOT, "%.1f", bytes / 1024.0 / 1024.0));
  }

  private ResponseEntity<Object> page() {
    return ok(Fields.LETTERS, feedback.list(), Fields.MAIL_READY, Mail.ready());
  }

  /**
   * Forward a letter to the owner's mailbox with whatever files have arrived —
   * in the owner's language. Never throws: the outcome is written to the letter
   * (`mailedAt` / `mailError`), and the files stay in the database until the
   * letter has really left.
   */
  private boolean deliver(Feedback letter, String host) {
    try {
      Lang lang = ownerLang();
      List<FeedbackRules.FileInfo> files = FeedbackService.filesOf(letter);
      List<Mail.Attachment> attachments = new ArrayList<>();
      List<String> lost = new ArrayList<>();
      for (int index = 0; index < files.size(); index += 1) {
        FeedbackRules.FileInfo file = files.get(index);
        List<String> parts = feedback.fileParts(letter.getId(), index);
        if (parts.size() == FeedbackRules.partCount(file.size())) attachments.add(new Mail.Attachment(file.name(), String.join("", parts)));
        else lost.add(file.name());
      }
      FeedbackKind kind = Wire.of(FeedbackKind.class, letter.getKind());
      String kindName = kind == null ? letter.getKind() : messages.of(kind, lang);
      boolean noAddress = letter.getEmail() == null || letter.getEmail().isEmpty();
      List<String> lines = new ArrayList<>(List.of(
          letter.getMessage(),
          "",
          RULE,
          messages.of(Text.MAIL_LETTER_KIND, lang, kindName),
          messages.of(Text.MAIL_LETTER_FROM, lang, noAddress ? messages.of(Text.MAIL_LETTER_NO_ADDRESS, lang) : letter.getEmail())));
      if (!files.isEmpty()) {
        lines.add(messages.of(Text.MAIL_LETTER_FILES, lang, String.join(LIST, files.stream().map((f) -> f.name() + " (" + megabytes(f.size(), lang) + ")").toList())));
      }
      if (!lost.isEmpty()) lines.add(messages.of(Text.MAIL_LETTER_LOST, lang, String.join(LIST, lost)));
      lines.add(messages.of(Text.MAIL_LETTER_BROWSER, lang, letter.getUserAgent() == null || letter.getUserAgent().isEmpty() ? RULE : letter.getUserAgent()));
      lines.add(messages.of(Text.MAIL_LETTER_ANSWER_AT, lang, adminUrl(host)));

      Mail.send(
          Mail.ownerMailbox(),
          messages.of(Text.MAIL_LETTER_SUBJECT, lang, kindName, String.valueOf(letter.getId())),
          String.join("\n", lines),
          noAddress ? null : letter.getEmail(),
          attachments);
      feedback.markMailed(letter.getId(), null);
      return true;
    } catch (Exception err) {
      log.error("[feedback] letter {} not mailed: {}", letter.getId(), err.getMessage());
      try {
        feedback.markMailed(letter.getId(), String.valueOf(err.getMessage()));
      } catch (Exception ignored) {
        // the letter itself is kept; only the note about the failure is lost
      }
      return false;
    }
  }

  /** The owner's answer, sent to the address the letter came with — in the language the letter was written in. */
  private void mailReply(Feedback letter, String reply) {
    Lang lang = langOf(letter);
    StringBuilder quoted = new StringBuilder();
    for (String line : letter.getMessage().split("\n", -1)) quoted.append(quoted.isEmpty() ? "" : "\n").append(QUOTE).append(line);
    String owner = Mail.ownerMailbox();
    Mail.send(
        letter.getEmail(),
        messages.of(Text.MAIL_REPLY_SUBJECT, lang),
        reply + "\n\n" + SIGNATURE + "\n\n" + messages.of(Text.MAIL_REPLY_YOU_WROTE, lang, DAY.format(letter.getCreatedAt())) + "\n" + quoted,
        owner.isEmpty() ? null : owner,
        List.of());
  }

  /** A letter comes in (or, with `finish`, its last file has). */
  @PostMapping
  public ResponseEntity<Object> receive(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
    schema.ensure();
    JsonNode finish = Json.at(body, Fields.FINISH);
    if (truthy(finish)) {
      JsonNode id = Json.at(body, Fields.ID);
      if (!Json.isInt(id) || !Secrets.safeEqual(Json.text(Json.at(body, Fields.TOKEN)), uploadToken(Json.intOf(id)))) return refuse(ApiError.INVALID_TICKET);
      Feedback letter = feedback.get((int) Json.intOf(id));
      if (letter == null) return refuse(ApiError.NOT_FOUND);
      if (feedback.close(letter.getId())) deliver(letter, Requests.host(request));
      return ok(Fields.OK, true);
    }

    // A field no person sees or fills: whoever did is a robot. It gets its "ok".
    if (truthy(Json.at(body, Fields.TRAP))) return ok(Fields.OK, true);

    FeedbackRules.Checked checked = FeedbackRules.validateLetter(body);
    if (checked.error() != null) return refuse(checked.error());

    String sender = ipHash(request);
    FeedbackRepository.Recent recent = feedback.countRecent(sender);
    if (recent.getMine() >= FeedbackRules.MAX_PER_HOUR || recent.getEveryone() >= FeedbackRules.MAX_PER_DAY) return refuse(ApiError.TOO_MANY);

    String agent = Requests.userAgent(request);
    Feedback letter = feedback.create(checked.letter(), checked.letter().files().isEmpty(), sender, agent.length() > 300 ? agent.substring(0, 300) : agent, messages.lang());
    if (letter.isClosed()) {
      deliver(letter, Requests.host(request));
      return ok(Fields.OK, true);
    }
    return ok(Fields.OK, true, Fields.ID, letter.getId(), Fields.TOKEN, uploadToken(letter.getId()));
  }

  /** One piece of an attached file (anyone, with the letter's token) — or the owner managing a letter. */
  @PutMapping
  public ResponseEntity<Object> update(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
    if (!Json.at(body, Fields.PART).isMissingNode()) {
      schema.ensure();
      JsonNode id = Json.at(body, Fields.ID);
      if (!Json.isInt(id) || !Secrets.safeEqual(Json.text(Json.at(body, Fields.TOKEN)), uploadToken(Json.intOf(id)))) return refuse(ApiError.INVALID_TICKET);
      Feedback letter = feedback.get((int) Json.intOf(id));
      JsonNode file = Json.at(body, Fields.FILE);
      JsonNode part = Json.at(body, Fields.PART);
      JsonNode data = Json.at(body, Fields.DATA);
      if (letter == null
          || !FeedbackRules.validPart(FeedbackService.filesOf(letter), letter.isClosed(), Json.iso(letter.getCreatedAt()), file, part, data, System.currentTimeMillis())) {
        return refuse(ApiError.INVALID_PART);
      }
      feedback.savePart(letter.getId(), (int) Json.intOf(file), (int) Json.intOf(part), data.textValue());
      return ok(Fields.OK, true);
    }

    Requests.requireAdmin(request);
    schema.ensure();
    return manage(request, body);
  }

  @GetMapping
  public ResponseEntity<Object> list(HttpServletRequest request) {
    Requests.requireAdmin(request);
    schema.ensure();
    return page();
  }

  @DeleteMapping
  public ResponseEntity<Object> delete(HttpServletRequest request, @RequestParam(name = Fields.ID, required = false) String rawId) {
    Requests.requireAdmin(request);
    schema.ensure();
    double id = Json.number(rawId);
    if (rawId == null || Double.isNaN(id) || id != Math.rint(id) || !feedback.delete((int) id)) return refuse(ApiError.NOT_FOUND);
    return page();
  }

  /** The owner answers a letter, files it away or sends it to the mailbox again. */
  private ResponseEntity<Object> manage(HttpServletRequest request, JsonNode body) {
    JsonNode id = Json.at(body, Fields.ID);
    Feedback letter = Json.isInt(id) ? feedback.get((int) Json.intOf(id)) : null;
    if (letter == null) return refuse(ApiError.NOT_FOUND);

    String reply = Json.text(Json.at(body, Fields.REPLY));
    FeedbackStatus status = Wire.of(FeedbackStatus.class, Json.at(body, Fields.STATUS));
    if (reply != null) {
      String text = reply.strip();
      if (text.isEmpty() || text.length() > FeedbackRules.MAX_MESSAGE) return refuse(ApiError.INVALID_REPLY);
      if (letter.getEmail() == null || letter.getEmail().isEmpty()) return refuse(ApiError.NO_REPLY_ADDRESS);
      try {
        mailReply(letter, text);
      } catch (Exception err) {
        return mailFailed(String.valueOf(err.getMessage()));
      }
      feedback.addReply(letter.getId(), text, true);
    } else if (truthy(Json.at(body, Fields.RESEND))) {
      if (!deliver(letter, Requests.host(request))) {
        Feedback failed = feedback.get(letter.getId());
        return mailFailed(failed == null || failed.getMailError() == null ? "" : failed.getMailError());
      }
    } else if (status != null) {
      feedback.setStatus(letter.getId(), status);
    } else {
      return refuse(ApiError.INVALID_REQUEST);
    }
    return page();
  }

  /** The email did not go out: the refusal, with the mail service's own reason. */
  private ResponseEntity<Object> mailFailed(String detail) {
    Map<String, Object> body = refusal(ApiError.MAIL_FAILED);
    body.put(Fields.DETAIL, detail);
    return ResponseEntity.status(ApiError.MAIL_FAILED.getStatus()).body(body);
  }

  /** JavaScript's idea of «set»: not missing, null, false, 0 or an empty string. */
  private static boolean truthy(JsonNode node) {
    if (!Json.present(node)) return false;
    if (node.isBoolean()) return node.booleanValue();
    if (node.isNumber()) return node.doubleValue() != 0;
    if (node.isTextual()) return !node.textValue().isEmpty();
    return true;
  }
}
