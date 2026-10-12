package com.pulsarkids.api.core;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;
import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.bouncycastle.crypto.generators.SCrypt;

/**
 * Encryption at rest for third-party credentials (a Google Cloud API key).
 * AES-256-GCM with a key derived from SECRETS_KEY (falls back to JWT_SECRET so
 * local dev works without extra setup).
 *
 * The derivation — scrypt (N=16384, r=8, p=1) with the salt
 * `wonderkids.secrets.v1` — and the stored format are those of the Node API
 * this service replaced, so the keys saved then are still readable. Neither
 * may ever change.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class Secrets {
  /** The ciphers, as Java names them, and the version mark of a stored secret. */
  private static final String AES_GCM = "AES/GCM/NoPadding";
  private static final String AES = "AES";
  private static final String HMAC_SHA256 = "HmacSHA256";
  private static final String SHA256 = "SHA-256";
  private static final String V1 = "v1";

  private static final String SALT = "wonderkids.secrets.v1";
  private static final Base64.Encoder B64 = Base64.getUrlEncoder().withoutPadding();
  private static final Base64.Decoder UNB64 = Base64.getUrlDecoder();
  private static final SecureRandom RANDOM = new SecureRandom();

  private static String keyOf;
  private static byte[] key;

  private static synchronized byte[] key() {
    String master = Env.get(Vars.SECRETS_KEY);
    if (master == null) master = Env.jwtSecret();
    if (!master.equals(keyOf)) {
      key = SCrypt.generate(master.getBytes(StandardCharsets.UTF_8), SALT.getBytes(StandardCharsets.UTF_8), 16384, 8, 1, 32);
      keyOf = master;
    }
    return key;
  }

  /** → "v1.<iv>.<tag>.<ciphertext>" (base64url parts). */
  public static String encrypt(String plain) {
    try {
      byte[] iv = new byte[12];
      RANDOM.nextBytes(iv);
      Cipher cipher = Cipher.getInstance(AES_GCM);
      cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key(), AES), new GCMParameterSpec(128, iv));
      // Java appends the 16-byte tag to the ciphertext; the stored format keeps them apart.
      byte[] sealed = cipher.doFinal(plain.getBytes(StandardCharsets.UTF_8));
      int split = sealed.length - 16;
      byte[] data = java.util.Arrays.copyOfRange(sealed, 0, split);
      byte[] tag = java.util.Arrays.copyOfRange(sealed, split, sealed.length);
      return "v1." + B64.encodeToString(iv) + "." + B64.encodeToString(tag) + "." + B64.encodeToString(data);
    } catch (Exception err) {
      throw new IllegalStateException(err);
    }
  }

  /** Returns the plaintext, or null when the value is missing or unreadable. */
  public static String decrypt(String stored) {
    if (stored == null || stored.isEmpty()) return null;
    try {
      String[] parts = stored.split("\\.", -1);
      if (parts.length < 4 || !parts[0].equals(V1)) return null;
      byte[] iv = UNB64.decode(parts[1]);
      byte[] tag = UNB64.decode(parts[2]);
      byte[] data = UNB64.decode(parts[3]);
      byte[] sealed = new byte[data.length + tag.length];
      System.arraycopy(data, 0, sealed, 0, data.length);
      System.arraycopy(tag, 0, sealed, data.length, tag.length);
      Cipher cipher = Cipher.getInstance(AES_GCM);
      cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(key(), AES), new GCMParameterSpec(tag.length * 8, iv));
      return new String(cipher.doFinal(sealed), StandardCharsets.UTF_8);
    } catch (Exception err) {
      return null;
    }
  }

  /** Constant-time string comparison (null is the empty string). */
  public static boolean safeEqual(String a, String b) {
    return MessageDigest.isEqual((a == null ? "" : a).getBytes(StandardCharsets.UTF_8), (b == null ? "" : b).getBytes(StandardCharsets.UTF_8));
  }

  public static byte[] hmacSha256(byte[] secret, byte[] message) {
    try {
      Mac mac = Mac.getInstance(HMAC_SHA256);
      mac.init(new SecretKeySpec(secret.length == 0 ? new byte[1] : secret, HMAC_SHA256));
      return mac.doFinal(message);
    } catch (Exception err) {
      throw new IllegalStateException(err);
    }
  }

  /** A ticket only the server can make: HMAC-SHA256 of `message` under the session secret, in hex. */
  public static String ticket(String message) {
    return HexFormat.of().formatHex(hmacSha256(Env.jwtSecret().getBytes(StandardCharsets.UTF_8), message.getBytes(StandardCharsets.UTF_8)));
  }

  public static String sha256Hex(String text) {
    try {
      return HexFormat.of().formatHex(MessageDigest.getInstance(SHA256).digest(text.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception err) {
      throw new IllegalStateException(err);
    }
  }
}
