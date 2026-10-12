package com.pulsarkids.api.core;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Our own session tokens: JWT, HS256, signed with JWT_SECRET — the same tokens
 * the Node API issued (`jsonwebtoken`), so a session opened before the move to
 * Java keeps working. The subject is the PARENT account id; a child's session
 * carries `childId` as well.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class Auth {
  /** The words of a JWT (RFC 7519) and of the `Authorization` header. */
  private static final String ALG = "alg";
  private static final String HS256 = "HS256";
  private static final String IAT = "iat";
  private static final String EXP = "exp";
  private static final String NBF = "nbf";
  private static final String SUB = "sub";
  private static final String CLAIM_EMAIL = "email";
  private static final String CLAIM_CHILD_ID = "childId";
  private static final String BEARER = "Bearer";
  /** How long a session lasts when JWT_EXPIRES_IN does not say. */
  private static final String DEFAULT_SPAN = "30d";

  private static final Base64.Encoder B64 = Base64.getUrlEncoder().withoutPadding();
  private static final Base64.Decoder UNB64 = Base64.getUrlDecoder();
  private static final String HEADER = B64.encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
  private static final Pattern SPAN = Pattern.compile("^(\\d+(?:\\.\\d+)?)\\s*(ms|s|m|h|d|w|y)?$");

  /** Who a request comes from. `childId` is set only for a child's session. */
  public record User(long id, String email, String childId) {}

  /** `JWT_EXPIRES_IN` in seconds: `30d` (the default), `12h`, `3600`. */
  static long expiresInSeconds() {
    Matcher span = SPAN.matcher(Env.get(Vars.JWT_EXPIRES_IN, DEFAULT_SPAN).strip().toLowerCase());
    if (!span.matches()) return 30L * 86_400;
    double amount = Double.parseDouble(span.group(1));
    double unit = switch (span.group(2) == null ? "s" : span.group(2)) {
      case "ms" -> 0.001;
      case "m" -> 60;
      case "h" -> 3600;
      case "d" -> 86_400;
      case "w" -> 7 * 86_400;
      case "y" -> 365.25 * 86_400;
      default -> 1;
    };
    return Math.max(1, (long) Math.floor(amount * unit));
  }

  private static String sign(ObjectNode payload, long userId) {
    long now = System.currentTimeMillis() / 1000;
    payload.put(IAT, now);
    payload.put(EXP, now + expiresInSeconds());
    payload.put(SUB, String.valueOf(userId));
    String body = HEADER + "." + B64.encodeToString(Json.write(payload).getBytes(StandardCharsets.UTF_8));
    return body + "." + B64.encodeToString(signature(body));
  }

  private static byte[] signature(String signed) {
    return Secrets.hmacSha256(Env.jwtSecret().getBytes(StandardCharsets.UTF_8), signed.getBytes(StandardCharsets.US_ASCII));
  }

  /** Sign a token identifying a (parent) account user. */
  public static String signToken(long userId, String email) {
    ObjectNode payload = Json.object();
    payload.put(CLAIM_EMAIL, email);
    return sign(payload, userId);
  }

  /** Sign a child session token (subject = owning account id, plus childId). */
  public static String signChildToken(long userId, String childId) {
    ObjectNode payload = Json.object();
    payload.put(CLAIM_CHILD_ID, childId);
    return sign(payload, userId);
  }

  /** The user a token names, or null when it is not ours, was tampered with or has expired. */
  public static User verify(String token) {
    try {
      String[] parts = token.split("\\.", -1);
      if (parts.length != 3) return null;
      JsonNode header = Json.MAPPER.readTree(UNB64.decode(parts[0]));
      if (!HS256.equals(Json.text(header.get(ALG)))) return null;
      if (!MessageDigest.isEqual(signature(parts[0] + "." + parts[1]), UNB64.decode(parts[2]))) return null;

      JsonNode payload = Json.MAPPER.readTree(UNB64.decode(parts[1]));
      long now = System.currentTimeMillis() / 1000;
      JsonNode exp = payload.get(EXP);
      if (exp != null && (!exp.isNumber() || now >= exp.asLong())) return null;
      JsonNode nbf = payload.get(NBF);
      if (nbf != null && (!nbf.isNumber() || now < nbf.asLong())) return null;

      double id = Json.number(payload.get(SUB));
      if (Double.isNaN(id) || id != Math.rint(id)) return null;
      return new User((long) id, Json.text(payload.get(CLAIM_EMAIL)), Json.text(payload.get(CLAIM_CHILD_ID)));
    } catch (Exception err) {
      return null;
    }
  }

  /** Verify the Bearer token of an `Authorization` header; null when it is missing or invalid. */
  public static User userOf(String header) {
    if (header == null) return null;
    String[] parts = header.split(" ");
    if (parts.length < 2 || !parts[0].equals(BEARER) || parts[1].isEmpty()) return null;
    return verify(parts[1]);
  }
}
