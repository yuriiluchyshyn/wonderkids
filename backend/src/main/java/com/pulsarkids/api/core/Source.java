package com.pulsarkids.api.core;

import com.fasterxml.jackson.databind.JsonNode;
import com.pulsarkids.api.model.Fields;
import java.util.regex.Pattern;

/**
 * Where a new account came from: the labels of the link that brought the parent
 * (`utm_source`, `utm_medium`, `utm_campaign`), or the site that sent them.
 * `link` is the code of one of the owner's own links (`?l=…`, see Marketing).
 * They arrive from the browser, so only short plain labels are kept.
 */
public record Source(String source, String medium, String campaign, String link) {
  private static final Pattern LABEL = Pattern.compile("^[a-z0-9][a-z0-9._-]{0,59}$");

  private static String label(JsonNode value) {
    String text = Json.text(value);
    if (text == null) return null;
    text = text.strip().toLowerCase();
    return LABEL.matcher(text).matches() ? text : null;
  }

  /** Clean labels, or null when there is no usable source. */
  public static Source clean(JsonNode raw) {
    if (raw == null || !raw.isObject()) return null;
    String source = label(raw.get(Fields.SOURCE));
    if (source == null) return null;
    return new Source(source, label(raw.get(Fields.MEDIUM)), label(raw.get(Fields.CAMPAIGN)), label(raw.get(Fields.LINK)));
  }
}
