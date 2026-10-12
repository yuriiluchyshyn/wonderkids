package com.pulsarkids.api.core;

import com.fasterxml.jackson.databind.JsonNode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Outgoing email through Resend's HTTP API (https://resend.com/docs/api-reference/emails/send-email).
 * Three variables: RESEND_API_KEY, FEEDBACK_TO (the owner's mailbox, where
 * letters from the site are forwarded) and optionally FEEDBACK_FROM (a sender
 * on a domain verified in Resend). RESEND_ENDPOINT points it at a stand-in
 * server in tests.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class Mail {
  /** Resend's API: its address and the fields of a letter. */
  private static final String RESEND_URL = "https://api.resend.com/emails";
  private static final String BEARER = "Bearer ";
  private static final String FROM = "from";
  private static final String TO = "to";
  private static final String SUBJECT = "subject";
  private static final String TEXT = "text";
  private static final String REPLY_TO = "reply_to";
  private static final String ATTACHMENTS = "attachments";
  private static final String REASON = "message";
  private static final String AUTHORIZATION = "Authorization";
  private static final String CONTENT_TYPE = "Content-Type";
  private static final String JSON_TYPE = "application/json";

  private static final String DEFAULT_FROM = "Pulsar Kids <feedback@pulsarkids.com>";
  private static final Duration TIMEOUT = Duration.ofSeconds(60);
  private static final HttpClient HTTP = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

  /** One attached file: its name and its content in base64. */
  public record Attachment(String filename, String content) {}

  private static String endpoint() {
    String own = Env.get(Vars.RESEND_ENDPOINT);
    return own == null || own.isEmpty() ? RESEND_URL : own;
  }

  public static String ownerMailbox() {
    return Env.get(Vars.FEEDBACK_TO, "").strip();
  }

  /** True when letters can be forwarded to the owner. */
  public static boolean ready() {
    String key = Env.get(Vars.RESEND_API_KEY);
    return key != null && !key.isEmpty() && !ownerMailbox().isEmpty();
  }

  /**
   * Send one plain-text email. Throws an exception whose message says why it
   * did not go. `replyTo` may be null.
   */
  public static void send(String to, String subject, String text, String replyTo, List<Attachment> attachments) {
    String apiKey = Env.get(Vars.RESEND_API_KEY);
    if (apiKey == null || apiKey.isEmpty()) throw new IllegalStateException("mail_not_configured");
    if (to == null || to.isEmpty()) throw new IllegalStateException("no_recipient");

    String from = Env.get(Vars.FEEDBACK_FROM, "").strip();
    Map<String, Object> mail = Json.map(FROM, from.isEmpty() ? DEFAULT_FROM : from, TO, List.of(to), SUBJECT, subject, TEXT, text);
    if (replyTo != null && !replyTo.isEmpty()) mail.put(REPLY_TO, replyTo);
    if (!attachments.isEmpty()) mail.put(ATTACHMENTS, attachments);

    HttpResponse<String> res;
    try {
      HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint()))
          .timeout(TIMEOUT)
          .header(AUTHORIZATION, BEARER + apiKey)
          .header(CONTENT_TYPE, JSON_TYPE)
          .POST(HttpRequest.BodyPublishers.ofString(Json.write(mail), StandardCharsets.UTF_8))
          .build();
      res = HTTP.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
    } catch (InterruptedException err) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("mail_unreachable: " + err.getMessage());
    } catch (Exception err) {
      throw new IllegalStateException("mail_unreachable: " + err.getMessage());
    }
    if (res.statusCode() / 100 != 2) {
      String detail = null;
      try {
        JsonNode body = Json.MAPPER.readTree(res.body());
        detail = Json.text(Json.at(body, REASON));
      } catch (Exception ignored) {
        // not JSON: no details
      }
      throw new IllegalStateException("mail_rejected (" + res.statusCode() + "): " + (detail == null ? "no details" : detail));
    }
  }
}
