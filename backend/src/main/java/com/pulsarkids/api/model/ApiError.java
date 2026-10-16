package com.pulsarkids.api.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Every refusal the API can answer with: `{ error: <code>, message: <text> }`
 * and the HTTP status. The code is what the clients branch on and never
 * changes; the text is for a person and comes from `messages_<lang>.properties`
 * under `error.<CONSTANT>`, in the language the client asked for (see `Messages`).
 * A new refusal is a new constant here and a line in each of those files —
 * `MessagesTest` fails when a language lacks one.
 */
@Getter
@RequiredArgsConstructor
public enum ApiError {
  SERVER_ERROR(500, "server_error"),
  NOT_FOUND(404, "not_found"),
  METHOD_NOT_ALLOWED(405, "method_not_allowed"),
  INVALID_JSON(400, "invalid_json"),
  INVALID_REQUEST(400, "invalid_request"),
  INVALID_TOKEN(401, "invalid_token"),
  INVALID_TICKET(403, "invalid_token"),
  MALFORMED_TOKEN(400, "invalid_token"),
  LOGIN_FAILED(500, "login_failed"),
  INVALID_EMAIL(400, "invalid_email"),
  ACCOUNT_NOT_FOUND(404, "account_not_found"),
  ACCOUNT_DISABLED(403, "account_disabled"),
  AUTH0_REQUIRED(403, "auth0_required"),
  EMAIL_MISSING(403, "email_missing"),
  EMAIL_NOT_VERIFIED(403, "email_not_verified"),
  INVALID_CREDENTIALS(400, "invalid_credentials"),
  INVALID_PIN(401, "invalid_pin"),
  CHILD_NOT_FOUND(404, "child_not_found"),
  INVALID_CHILD_PROFILE_ID(400, "invalid_child_profile_id"),
  PARENT_ONLY(403, "parent_only"),
  INVALID_STATE(400, "invalid_state"),
  CHILD_ID_TAKEN(409, "child_id_taken"),
  INVALID_NICKNAME(400, "invalid_nickname"),
  CHECK_FAILED(500, "check_failed"),
  INVALID_TEXT(400, "invalid_text"),
  TTS_DISABLED(404, "tts_disabled"),
  TTS_FAILED(502, "tts_failed"),
  TTS_UNREACHABLE(502, "tts_unreachable"),
  TTS_KEY_REJECTED(502, "tts_key_rejected"),
  TTS_BUSY(429, "tts_busy"),
  NO_KEY(200, "no_key"),
  ADMIN_NOT_CONFIGURED(503, "admin_not_configured"),
  INVALID_ADMIN_KEY(401, "invalid_admin_key"),
  BILLING_OFF(503, "billing_off"),
  BILLING_UNREACHABLE(502, "billing_unreachable"),
  INVALID_PLAN(400, "invalid_plan"),
  INVALID_CHILDREN(400, "invalid_children"),
  INVALID_SESSION(400, "invalid_session"),
  INVALID_SIGNATURE(400, "invalid_signature"),
  OFFER_INACTIVE(400, "offer_inactive"),
  NO_SUBSCRIPTION(409, "no_subscription"),
  ALREADY_PAID(409, "already_paid"),
  PRICE_CHANGED(409, "price_changed"),
  PAYMENT_FAILED(402, "payment_failed"),
  CHILDREN_IN_USE(409, "children_in_use"),
  CHILD_LIMIT(403, "child_limit"),
  PLAN_REQUIRED(403, "plan_required"),
  CHILDREN_BLOCKED(403, "children_blocked"),
  INVALID_PARENT_ID(400, "invalid_parent_id"),
  INVALID_SPEECH_ENABLED(400, "invalid_speech_enabled"),
  INVALID_ENABLED(400, "invalid_enabled"),
  PARENT_NOT_FOUND(404, "parent_not_found"),
  UNKNOWN_PART(400, "unknown_part"),
  INVALID_DEMO_MINUTES(400, "invalid_demo_minutes"),
  INVALID_NAME(400, "invalid_name"),
  INVALID_MODE(400, "invalid_mode"),
  INVALID_CODE(400, "invalid_code"),
  CODE_TAKEN(409, "code_taken"),
  LINK_NOT_FOUND(404, "link_not_found"),
  INVALID_AVAILABILITY(400, "invalid_availability"),
  INVALID_ID(400, "invalid_id"),
  INVALID_KEY(400, "invalid_key"),
  INVALID_VOICE(400, "invalid_voice"),
  INVALID_SCOPE(400, "invalid_scope"),
  INVALID_ACCOUNT_IDS(400, "invalid_account_ids"),
  KEY_NOT_FOUND(404, "key_not_found"),
  INVALID_EVENT(400, "invalid_event"),
  MESSAGE_TOO_SHORT(400, "message_too_short"),
  MESSAGE_TOO_LONG(400, "message_too_long"),
  TOO_MANY_FILES(400, "too_many_files"),
  INVALID_FILE_TYPE(400, "invalid_file_type"),
  FILE_TOO_BIG(400, "file_too_big"),
  FILES_TOO_BIG(400, "files_too_big"),
  TOO_MANY(429, "too_many"),
  INVALID_PART(400, "invalid_part"),
  INVALID_REPLY(400, "invalid_reply"),
  NO_REPLY_ADDRESS(400, "no_reply_address"),
  MAIL_FAILED(502, "mail_failed");

  /** The HTTP status this refusal is answered with. */
  private final int status;
  /** What the clients read in `error`. */
  private final String code;

  /** Where its text is kept in the message files. */
  public String messageKey() {
    return "error." + name();
  }
}
