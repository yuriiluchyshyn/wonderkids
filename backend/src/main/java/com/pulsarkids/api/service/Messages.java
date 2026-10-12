package com.pulsarkids.api.service;

import com.pulsarkids.api.core.FeedbackRules;
import com.pulsarkids.api.core.Marketing;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.FeedbackKind;
import com.pulsarkids.api.model.Lang;
import com.pulsarkids.api.model.Text;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

/**
 * The words of the API, in the language asked for. They are kept in
 * `src/main/resources/messages.properties` (English, and the fallback of the
 * others), `messages_uk.properties` and `messages_pl.properties` — never in the
 * code. A new language is a constant of `Lang` and a file of its own.
 */
@Service
@RequiredArgsConstructor
public class Messages {
  private static final long MEGABYTE = 1024 * 1024;

  private final MessageSource source;

  /** The language of the request being answered (see `LangResolver`). */
  public Lang lang() {
    Lang lang = Lang.of(LocaleContextHolder.getLocale());
    return lang == null ? Lang.FALLBACK : lang;
  }

  /** What fills the holes of a refusal's text — the limits themselves, so the text cannot disagree with the rule. */
  private static Object[] holes(ApiError error) {
    return switch (error) {
      case INVALID_DEMO_MINUTES -> new Object[] {Marketing.DEMO_MINUTES_MIN, Marketing.DEMO_MINUTES_MAX};
      case INVALID_VOICE -> new Object[] {Lang.DEFAULT.getCloudVoice()};
      case MESSAGE_TOO_LONG, INVALID_REPLY -> new Object[] {String.valueOf(FeedbackRules.MAX_MESSAGE)};
      case TOO_MANY_FILES -> new Object[] {FeedbackRules.MAX_FILES};
      case FILE_TOO_BIG -> new Object[] {FeedbackRules.MAX_FILE_BYTES / MEGABYTE};
      case FILES_TOO_BIG -> new Object[] {FeedbackRules.MAX_TOTAL_BYTES / MEGABYTE};
      default -> new Object[0];
    };
  }

  /** A refusal's text for the person, in the language of the request. */
  public String of(ApiError error) {
    return of(error, lang());
  }

  public String of(ApiError error, Lang lang) {
    return source.getMessage(error.messageKey(), holes(error), lang.locale());
  }

  public String of(Text text, Lang lang, Object... holes) {
    return source.getMessage(text.getKey(), holes, lang.locale());
  }

  /** The name of a kind of letter. */
  public String of(FeedbackKind kind, Lang lang) {
    return source.getMessage(Text.keyOf(kind), null, lang.locale());
  }
}
