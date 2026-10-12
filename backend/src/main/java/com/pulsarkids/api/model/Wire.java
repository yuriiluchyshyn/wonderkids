package com.pulsarkids.api.model;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.Arrays;
import java.util.List;

/**
 * A closed set of names that travel as text — in a request, an answer or a
 * column of the database. Each is an enum whose constant knows how it is
 * written (`wire()`); nothing else in the code spells the word.
 */
public interface Wire {
  /** The name as the clients and the database write it. */
  String wire();

  /** The constant written so, or null when there is none. */
  static <E extends Enum<E> & Wire> E of(Class<E> type, String text) {
    if (text == null) return null;
    for (E constant : type.getEnumConstants()) {
      if (constant.wire().equals(text)) return constant;
    }
    return null;
  }

  /** The constant a JSON string names, or null for anything else. */
  static <E extends Enum<E> & Wire> E of(Class<E> type, JsonNode node) {
    return node != null && node.isTextual() ? of(type, node.textValue()) : null;
  }

  /** The constant written so, or `fallback`. */
  static <E extends Enum<E> & Wire> E of(Class<E> type, JsonNode node, E fallback) {
    E found = of(type, node);
    return found == null ? fallback : found;
  }

  static <E extends Enum<E> & Wire> List<String> names(Class<E> type) {
    return Arrays.stream(type.getEnumConstants()).map(Wire::wire).toList();
  }
}
