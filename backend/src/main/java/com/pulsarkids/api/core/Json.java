package com.pulsarkids.api.core;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.MissingNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * JSON as the browser sends and expects it. A request body is read as a tree
 * (`JsonNode`), because the clients' bodies are loose: a field may be missing,
 * null or of another type, and each handler says what it does then.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class Json {
  public static final ObjectMapper MAPPER = new ObjectMapper();
  private static final DateTimeFormatter ISO = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").withZone(ZoneOffset.UTC);

  public static ObjectNode object() {
    return MAPPER.createObjectNode();
  }

  public static ArrayNode array() {
    return MAPPER.createArrayNode();
  }

  /** `map("ok", true, "id", 5)` — an object with its keys in the order written. */
  public static Map<String, Object> map(Object... pairs) {
    Map<String, Object> out = new LinkedHashMap<>();
    for (int i = 0; i < pairs.length; i += 2) out.put((String) pairs[i], pairs[i + 1]);
    return out;
  }

  /** A field of an object; a missing node (never null) when there is none, or `node` is no object. */
  public static JsonNode at(JsonNode node, String field) {
    JsonNode value = node == null ? null : node.get(field);
    return value == null ? MissingNode.getInstance() : value;
  }

  /** Neither missing nor null — JavaScript's `value != null`. */
  public static boolean present(JsonNode node) {
    return node != null && !node.isMissingNode() && !node.isNull();
  }

  /** The text of a string node, or null for anything else. */
  public static String text(JsonNode node) {
    return node != null && node.isTextual() ? node.textValue() : null;
  }

  /** A whole number, however it was written (`5` or `5.0`) — JavaScript's `Number.isInteger`. */
  public static boolean isInt(JsonNode node) {
    if (node == null || !node.isNumber()) return false;
    if (node.isIntegralNumber()) return true;
    double value = node.doubleValue();
    return !Double.isInfinite(value) && !Double.isNaN(value) && value == Math.rint(value);
  }

  /** The whole number of a node `isInt` accepted. */
  public static long intOf(JsonNode node) {
    return node.isIntegralNumber() ? node.longValue() : (long) node.doubleValue();
  }

  /** JavaScript's `Number(value)`: numbers, numeric strings, booleans; NaN for the rest. */
  public static double number(JsonNode node) {
    if (node == null || node.isMissingNode()) return Double.NaN;
    if (node.isNull()) return 0;
    if (node.isNumber()) return node.doubleValue();
    if (node.isBoolean()) return node.booleanValue() ? 1 : 0;
    if (node.isTextual()) return number(node.textValue());
    return Double.NaN;
  }

  public static double number(String text) {
    if (text == null) return Double.NaN;
    String trimmed = text.strip();
    if (trimmed.isEmpty()) return 0;
    try {
      return Double.parseDouble(trimmed);
    } catch (NumberFormatException err) {
      return Double.NaN;
    }
  }

  /** A double that holds a whole number is written without `.0`, as JavaScript writes it. */
  public static Number tidy(double value) {
    if (value == Math.rint(value) && Math.abs(value) < 9e15) return (long) value;
    return value;
  }

  /** An instant as `Date#toISOString` writes it. */
  public static String iso(Instant instant) {
    return instant == null ? null : ISO.format(instant);
  }

  public static String write(Object value) {
    try {
      return MAPPER.writeValueAsString(value);
    } catch (Exception err) {
      throw new IllegalStateException(err);
    }
  }

  public static JsonNode parse(String text) {
    try {
      return MAPPER.readTree(text);
    } catch (Exception err) {
      throw new IllegalArgumentException("invalid_json");
    }
  }
}
