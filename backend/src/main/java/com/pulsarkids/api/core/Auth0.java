package com.pulsarkids.api.core;

import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigInteger;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.RSAPublicKeySpec;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Auth0 for the parent login: verifies the ID token the browser got from
 * Auth0 Universal Login. The API keeps issuing its own session token (`Auth`)
 * — Auth0 only proves who the parent is.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class Auth0 {
  /** The words of a JWT and of a key set (RFC 7517, 7519). */
  private static final String KEYS_FIELD = "keys";
  private static final String USE = "use";
  private static final String KID = "kid";
  private static final String KTY = "kty";
  private static final String RSA = "RSA";
  private static final String SIG = "sig";
  private static final String MODULUS = "n";
  private static final String EXPONENT = "e";
  private static final String ALG = "alg";
  private static final String RS256 = "RS256";
  private static final String EXP = "exp";
  private static final String NBF = "nbf";
  private static final String AUD = "aud";
  private static final String ISS = "iss";
  private static final String RSA_SHA256 = "SHA256withRSA";
  private static final String JWKS_PATH = "/.well-known/jwks.json";
  private static final String HTTPS = "https://";

  private static final Base64.Decoder UNB64 = Base64.getUrlDecoder();
  private static final HttpClient HTTP = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

  /** Where a tenant's signing keys are read from; tests put a stand-in here. */
  public interface KeySource {
    JsonNode jwks(String domain) throws Exception;
  }

  private static final KeySource NETWORK = (domain) -> {
    HttpRequest request = HttpRequest.newBuilder(URI.create(HTTPS + domain + JWKS_PATH)).timeout(Duration.ofSeconds(10)).build();
    HttpResponse<byte[]> res = HTTP.send(request, HttpResponse.BodyHandlers.ofByteArray());
    if (res.statusCode() / 100 != 2) throw new IllegalStateException("jwks_http_" + res.statusCode());
    return Json.MAPPER.readTree(res.body());
  };

  private static volatile KeySource keySource = NETWORK;

  /** Signing keys by `kid`, per tenant; refetched when a token names a new key. */
  private static final Map<String, PublicKey> KEYS = new ConcurrentHashMap<>();

  public record Config(String domain, String clientId) {}

  /**
   * Tenant domain and SPA client id. Both are public values the frontend needs
   * too, so the API reads the same `VITE_AUTH0_*` variables instead of asking
   * for a second copy.
   */
  public static Config config() {
    String domain = Env.get(Vars.VITE_AUTH0_DOMAIN, "").strip().replaceFirst("^https?://", "").replaceFirst("/+$", "");
    String clientId = Env.get(Vars.VITE_AUTH0_CLIENT_ID, "").strip();
    return !domain.isEmpty() && !clientId.isEmpty() ? new Config(domain, clientId) : null;
  }

  /** Without both variables the parent login stays email-only. */
  public static boolean enabled() {
    return config() != null;
  }

  /** For tests: read the keys from somewhere else (null — from the network again) and forget those read. */
  public static void useKeySource(KeySource source) {
    keySource = source == null ? NETWORK : source;
    KEYS.clear();
  }

  private static PublicKey signingKey(String domain, String kid) throws Exception {
    String cacheKey = domain + "|" + kid;
    if (!KEYS.containsKey(cacheKey)) {
      for (JsonNode jwk : Json.at(keySource.jwks(domain), KEYS_FIELD)) {
        String use = Json.text(jwk.get(USE));
        String id = Json.text(jwk.get(KID));
        if (!RSA.equals(Json.text(jwk.get(KTY))) || id == null || id.isEmpty() || !(use == null || use.equals(SIG))) continue;
        BigInteger modulus = new BigInteger(1, UNB64.decode(jwk.get(MODULUS).asText()));
        BigInteger exponent = new BigInteger(1, UNB64.decode(jwk.get(EXPONENT).asText()));
        KEYS.put(domain + "|" + id, KeyFactory.getInstance(RSA).generatePublic(new RSAPublicKeySpec(modulus, exponent)));
      }
    }
    PublicKey key = KEYS.get(cacheKey);
    if (key == null) throw new IllegalStateException("unknown_signing_key");
    return key;
  }

  /**
   * Verify an Auth0 ID token: RS256 signature against the tenant's keys, issued
   * by our tenant, for our application, not expired. Returns its claims; throws
   * on anything else.
   */
  public static JsonNode verifyIdToken(String idToken) throws Exception {
    Config config = config();
    if (config == null) throw new IllegalStateException("auth0_not_configured");

    String[] parts = String.valueOf(idToken).split("\\.", -1);
    if (parts.length != 3) throw new IllegalStateException("malformed_token");
    JsonNode header;
    JsonNode claims;
    try {
      header = Json.MAPPER.readTree(UNB64.decode(parts[0]));
      claims = Json.MAPPER.readTree(UNB64.decode(parts[1]));
    } catch (Exception err) {
      throw new IllegalStateException("malformed_token");
    }
    String kid = Json.text(Json.at(header, KID));
    if (kid == null || kid.isEmpty() || claims == null || !claims.isObject()) throw new IllegalStateException("malformed_token");
    // A token "signed" with a shared secret must never pass as RS256.
    if (!RS256.equals(Json.text(header.get(ALG)))) throw new IllegalStateException("invalid_algorithm");

    Signature verifier = Signature.getInstance(RSA_SHA256);
    verifier.initVerify(signingKey(config.domain(), kid));
    verifier.update((parts[0] + "." + parts[1]).getBytes(StandardCharsets.US_ASCII));
    if (!verifier.verify(UNB64.decode(parts[2]))) throw new IllegalStateException("invalid_signature");

    long now = System.currentTimeMillis() / 1000;
    JsonNode exp = claims.get(EXP);
    if (exp != null && (!exp.isNumber() || now >= exp.asLong())) throw new IllegalStateException("token_expired");
    JsonNode nbf = claims.get(NBF);
    if (nbf != null && (!nbf.isNumber() || now < nbf.asLong())) throw new IllegalStateException("token_not_active");
    if (!(HTTPS + config.domain() + "/").equals(Json.text(claims.get(ISS)))) throw new IllegalStateException("invalid_issuer");

    JsonNode aud = claims.get(AUD);
    boolean forUs = false;
    if (aud != null && aud.isArray()) {
      for (JsonNode one : aud) forUs |= config.clientId().equals(Json.text(one));
    } else {
      forUs = config.clientId().equals(Json.text(aud));
    }
    if (!forUs) throw new IllegalStateException("invalid_audience");
    return claims;
  }
}
