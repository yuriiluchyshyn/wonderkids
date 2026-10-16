package com.pulsarkids.api.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * The texts the API writes itself — in a forwarded letter, an answer to its
 * sender, the sample a voice key is tried with. Their words are in
 * `messages_<lang>.properties` under `key`; see `Messages`.
 */
@Getter
@RequiredArgsConstructor
public enum Text {
  MAIL_LETTER_SUBJECT("mail.letter.subject"),
  MAIL_LETTER_KIND("mail.letter.kind"),
  MAIL_LETTER_FROM("mail.letter.from"),
  MAIL_LETTER_NO_ADDRESS("mail.letter.noAddress"),
  MAIL_LETTER_FILES("mail.letter.files"),
  MAIL_LETTER_MEGABYTES("mail.letter.megabytes"),
  MAIL_LETTER_LOST("mail.letter.lost"),
  MAIL_LETTER_BROWSER("mail.letter.browser"),
  MAIL_LETTER_ANSWER_AT("mail.letter.answerAt"),
  MAIL_REPLY_SUBJECT("mail.reply.subject"),
  MAIL_REPLY_YOU_WROTE("mail.reply.youWrote"),
  MAIL_INVOICE_SUBJECT("mail.invoice.subject"),
  MAIL_INVOICE_BODY("mail.invoice.body"),
  MAIL_CHILDREN_SUBJECT("mail.children.subject"),
  MAIL_CHILDREN_BODY("mail.children.body"),
  MAIL_CHILDREN_BODY_TRIAL("mail.children.bodyTrial"),
  SPEECH_SAMPLE("speech.sample"),
  CHILD_DEFAULT_NAME("child.defaultName");

  private final String key;

  /** The name of a kind of letter («Idea», «Помилка»). */
  public static String keyOf(FeedbackKind kind) {
    return "mail.kind." + kind.name();
  }
}
