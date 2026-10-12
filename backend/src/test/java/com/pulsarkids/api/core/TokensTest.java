package com.pulsarkids.api.core;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.pulsarkids.api.model.Lang;
import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.Signature;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Sessions, stored secrets and Auth0 ID tokens. The fixtures were made by the
 * Node API this service replaced (`jsonwebtoken`, `node:crypto`): what it
 * issued and stored must still be read here.
 */
class TokensTest {
  private static final String SECRET = "fixture-secret";
  private static final String NODE_PARENT_TOKEN =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hbWFAZXhhbXBsZS5jb20iLCJpYXQiOjE3OTE3OTIwMzEsImV4cCI6NDk0NTM5MjAzMSwic3ViIjoiNDIifQ.9_F57DK-CPa5NHNs8w5Qd4APx5jdEc39qcoycGIP7lA";
  private static final String NODE_CHILD_TOKEN =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaGlsZElkIjoia2lkLTEiLCJpYXQiOjE3OTE3OTIwMzEsImV4cCI6NDk0NTM5MjAzMSwic3ViIjoiNDIifQ.0kh-Fxg_TxnMsEGupOCCv9YwS5INixqcrZzWb89wuN4";
  private static final String NODE_ENCRYPTED = "v1.O-tABfYBQ0FRhXUK.-OKzWnITSEgPMxXLCnHnWg.kHMjd_SuhNxh4bkniGDGRAXVzAgDdKwb";

  private static final String DOMAIN = "tenant.example.auth0.com";
  private static final String CLIENT_ID = "client-123";
  private static final Base64.Encoder B64 = Base64.getUrlEncoder().withoutPadding();
  private static KeyPair tenant;
  private static KeyPair stranger;

  @BeforeAll
  static void keys() throws Exception {
    KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
    generator.initialize(2048);
    tenant = generator.generateKeyPair();
    stranger = generator.generateKeyPair();
  }

  @AfterEach
  void reset() {
    for (String name : new String[] {"JWT_SECRET", "SECRETS_KEY", "JWT_EXPIRES_IN", "VITE_AUTH0_DOMAIN", "VITE_AUTH0_CLIENT_ID"}) Env.set(name, null);
    Auth0.useKeySource(null);
  }

  // ---- our own sessions ------------------------------------------------------

  @Test
  void sessionsIssuedByTheNodeApiAreStillValid() {
    Env.set("JWT_SECRET", SECRET);
    assertEquals(new Auth.User(42, "mama@example.com", null), Auth.verify(NODE_PARENT_TOKEN));
    assertEquals(new Auth.User(42, null, "kid-1"), Auth.verify(NODE_CHILD_TOKEN));
    assertEquals(new Auth.User(42, "mama@example.com", null), Auth.userOf("Bearer " + NODE_PARENT_TOKEN));
    assertNull(Auth.userOf("Basic " + NODE_PARENT_TOKEN));
    assertNull(Auth.userOf(null));
  }

  @Test
  void aTokenOfAnotherSecretOrATamperedOneIsRefused() {
    Env.set("JWT_SECRET", "another-secret");
    assertNull(Auth.verify(NODE_PARENT_TOKEN));
    Env.set("JWT_SECRET", SECRET);
    String[] parts = NODE_PARENT_TOKEN.split("\\.");
    String forged = B64.encodeToString("{\"email\":\"x@y.z\",\"sub\":\"1\",\"exp\":4945392031}".getBytes(StandardCharsets.UTF_8));
    assertNull(Auth.verify(parts[0] + "." + forged + "." + parts[2]));
    // «alg: none» is not a signature.
    assertNull(Auth.verify(B64.encodeToString("{\"alg\":\"none\"}".getBytes(StandardCharsets.UTF_8)) + "." + parts[1] + "."));
    assertNull(Auth.verify("not-a-token"));
  }

  @Test
  void aSessionIsSignedReadBackAndExpires() {
    Env.set("JWT_SECRET", SECRET);
    assertEquals(new Auth.User(7, "tato@example.com", null), Auth.verify(Auth.signToken(7, "tato@example.com")));
    assertEquals(new Auth.User(7, null, "kid-9"), Auth.verify(Auth.signChildToken(7, "kid-9")));
    assertEquals(30L * 86_400, Auth.expiresInSeconds());
    Env.set("JWT_EXPIRES_IN", "12h");
    assertEquals(12L * 3600, Auth.expiresInSeconds());

    String header = B64.encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
    String payload = B64.encodeToString(("{\"sub\":\"7\",\"exp\":" + (System.currentTimeMillis() / 1000 - 60) + "}").getBytes(StandardCharsets.UTF_8));
    String signature = B64.encodeToString(Secrets.hmacSha256(SECRET.getBytes(StandardCharsets.UTF_8), (header + "." + payload).getBytes(StandardCharsets.UTF_8)));
    assertNull(Auth.verify(header + "." + payload + "." + signature));
  }

  // ---- stored secrets ----------------------------------------------------------

  @Test
  void aKeyStoredByTheNodeApiIsStillReadable() {
    Env.set("JWT_SECRET", SECRET);
    assertEquals("AIzaSy-тест-key-1234", Secrets.decrypt(NODE_ENCRYPTED));
    String stored = Secrets.encrypt("AIzaSy-тест-key-1234");
    assertNotEquals(NODE_ENCRYPTED, stored);
    assertEquals("AIzaSy-тест-key-1234", Secrets.decrypt(stored));
    assertNull(Secrets.decrypt(stored.substring(0, stored.length() - 2) + "xx"));
    assertNull(Secrets.decrypt(null));
    Env.set("SECRETS_KEY", "something-else");
    assertNull(Secrets.decrypt(NODE_ENCRYPTED));
  }

  @Test
  void aPhraseHasTheCacheKeyTheNodeApiGaveIt() {
    assertEquals("4bbb17b3d54fcd839f9eb3b22c10f73c6ec75208b6bf36779712833224e39802", Tts.hash("uk-UA-Wavenet-A", "Привіт, світе!"));
    assertEquals("pl-PL-Wavenet-A", Tts.voiceFor(Lang.PL, "uk-UA-Wavenet-B"));
    assertEquals("uk-UA-Wavenet-B", Tts.voiceFor(Lang.UK, "uk-UA-Wavenet-B"));
    assertTrue(Secrets.safeEqual("abc", "abc"));
    assertFalse(Secrets.safeEqual("abc", null));
  }

  // ---- Auth0 ---------------------------------------------------------------------

  private static void configure() {
    Env.set("VITE_AUTH0_DOMAIN", "https://" + DOMAIN + "/");
    Env.set("VITE_AUTH0_CLIENT_ID", CLIENT_ID);
    // The tenant's key set, served without a network.
    Auth0.useKeySource((domain) -> {
      assertEquals(DOMAIN, domain);
      RSAPublicKey key = (RSAPublicKey) tenant.getPublic();
      ObjectNode jwks = Json.object();
      jwks.putArray("keys").addObject()
          .put("kty", "RSA").put("kid", "key-1").put("use", "sig").put("alg", "RS256")
          .put("n", B64.encodeToString(unsigned(key.getModulus().toByteArray())))
          .put("e", B64.encodeToString(unsigned(key.getPublicExponent().toByteArray())));
      return jwks;
    });
  }

  private static byte[] unsigned(byte[] bytes) {
    return bytes.length > 1 && bytes[0] == 0 ? java.util.Arrays.copyOfRange(bytes, 1, bytes.length) : bytes;
  }

  private static ObjectNode claims() {
    long now = System.currentTimeMillis() / 1000;
    return Json.object().put("iss", "https://" + DOMAIN + "/").put("aud", CLIENT_ID).put("email", "mama@example.com")
        .put("email_verified", true).put("sub", "auth0|1").put("iat", now).put("exp", now + 300);
  }

  private static String idToken(ObjectNode claims, PrivateKey key, String kid, String alg) throws Exception {
    String signed = B64.encodeToString(("{\"alg\":\"" + alg + "\",\"typ\":\"JWT\",\"kid\":\"" + kid + "\"}").getBytes(StandardCharsets.UTF_8))
        + "." + B64.encodeToString(Json.write(claims).getBytes(StandardCharsets.UTF_8));
    byte[] signature;
    if (alg.equals("RS256")) {
      Signature signer = Signature.getInstance("SHA256withRSA");
      signer.initSign(key);
      signer.update(signed.getBytes(StandardCharsets.US_ASCII));
      signature = signer.sign();
    } else {
      signature = Secrets.hmacSha256("secret".getBytes(StandardCharsets.UTF_8), signed.getBytes(StandardCharsets.US_ASCII));
    }
    return signed + "." + B64.encodeToString(signature);
  }

  @Test
  void auth0IsOffUntilBothVariablesAreSet() {
    Env.set("VITE_AUTH0_DOMAIN", "");
    Env.set("VITE_AUTH0_CLIENT_ID", "");
    assertFalse(Auth0.enabled());
    Env.set("VITE_AUTH0_DOMAIN", DOMAIN);
    assertFalse(Auth0.enabled());
    configure();
    assertTrue(Auth0.enabled());
    assertEquals(new Auth0.Config(DOMAIN, CLIENT_ID), Auth0.config());
  }

  @Test
  void aTokenSignedByTheTenantForThisAppIsAccepted() throws Exception {
    configure();
    JsonNode verified = Auth0.verifyIdToken(idToken(claims(), tenant.getPrivate(), "key-1", "RS256"));
    assertEquals("mama@example.com", verified.get("email").asText());
    assertTrue(verified.get("email_verified").asBoolean());
  }

  @Test
  void tokensForAnotherAppTenantOrKeyAreRejected() throws Exception {
    configure();
    assertThrows(Exception.class, () -> Auth0.verifyIdToken(idToken(claims().put("aud", "someone-else"), tenant.getPrivate(), "key-1", "RS256")));
    assertThrows(Exception.class, () -> Auth0.verifyIdToken(idToken(claims().put("iss", "https://evil.example.com/"), tenant.getPrivate(), "key-1", "RS256")));
    assertThrows(Exception.class, () -> Auth0.verifyIdToken(idToken(claims(), tenant.getPrivate(), "unknown-key", "RS256")));
    assertThrows(Exception.class, () -> Auth0.verifyIdToken(idToken(claims(), stranger.getPrivate(), "key-1", "RS256")));
    // A token "signed" with a shared secret must never pass as RS256.
    assertThrows(Exception.class, () -> Auth0.verifyIdToken(idToken(claims(), null, "key-1", "HS256")));
    assertThrows(Exception.class, () -> Auth0.verifyIdToken("not-a-token"));
  }

  @Test
  void anExpiredTokenIsRejected() throws Exception {
    configure();
    ObjectNode expired = claims().put("exp", System.currentTimeMillis() / 1000 - 60);
    assertThrows(Exception.class, () -> Auth0.verifyIdToken(idToken(expired, tenant.getPrivate(), "key-1", "RS256")));
  }
}
