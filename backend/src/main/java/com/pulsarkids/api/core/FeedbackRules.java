package com.pulsarkids.api.core;

import com.fasterxml.jackson.databind.JsonNode;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.FeedbackKind;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.model.Wire;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Rules of the «Написати нам» form on the public site — pure, no I/O.
 *
 * A letter is text plus up to MAX_FILES photos / videos. Vercel accepts at
 * most 4.5 MB per request, so a file travels in pieces of PART_BYTES, each a
 * base64 string. PART_BYTES is a multiple of 3, so the pieces of a file glued
 * together are again valid base64 — the attachment as the mail API wants it.
 * The same limits are repeated in `site/src/scripts/letter/limits.ts` — change both.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class FeedbackRules {
  public static final int MIN_MESSAGE = 5;
  public static final int MAX_MESSAGE = 4000;
  public static final int MAX_EMAIL = 200;
  public static final int MAX_FILES = 5;
  public static final long MAX_FILE_BYTES = 15L * 1024 * 1024;
  public static final long MAX_TOTAL_BYTES = 18L * 1024 * 1024;
  public static final int PART_BYTES = 3 * (1 << 19);
  public static final int PART_CHARS = (PART_BYTES / 3) * 4;

  /** One sender may write this many letters an hour; the site as a whole, this many a day. */
  public static final int MAX_PER_HOUR = 5;
  public static final int MAX_PER_DAY = 200;
  /** Files of a letter must arrive within this time after its text. */
  public static final long UPLOAD_WINDOW_MS = 60 * 60 * 1000;

  private static final Pattern FILE_TYPE = Pattern.compile("^(image/(jpeg|png|webp|gif|heic|heif)|video/(mp4|quicktime|webm))$");
  private static final Pattern EMAIL = Pattern.compile("^[^\\s@<>]+@[^\\s@<>]+\\.[^\\s@<>]{2,}$", Pattern.UNICODE_CHARACTER_CLASS);
  private static final Pattern BASE64 = Pattern.compile("^[A-Za-z0-9+/]+={0,2}$");

  /** An attached file as the letter announces it. */
  public record FileInfo(String name, String type, long size) {}

  public record Draft(FeedbackKind kind, String message, String email, List<FileInfo> files) {}

  /** A checked letter, or what is wrong with it. */
  public record Checked(Draft letter, ApiError error) {
    static Checked refused(ApiError error) {
      return new Checked(null, error);
    }
  }

  public static long partCount(long size) {
    return (size + PART_BYTES - 1) / PART_BYTES;
  }

  /** A file name safe to put on an attachment. */
  private static String cleanName(String name, int index) {
    String[] pieces = (name == null ? "" : name).split("[/\\\\]", -1);
    String base = pieces[pieces.length - 1]
        .replaceAll("[\\u0000-\\u001f\\u007f:*?\"<>|]", "")
        .replaceAll("^\\.+", "")
        .strip();
    if (base.length() > 80) base = base.substring(base.length() - 80);
    return base.isEmpty() ? "file-" + (index + 1) : base;
  }

  /** Check a new letter. */
  public static Checked validateLetter(JsonNode body) {
    FeedbackKind kind = Wire.of(FeedbackKind.class, Json.at(body, Fields.KIND), FeedbackKind.OTHER);
    String rawMessage = Json.text(Json.at(body, Fields.MESSAGE));
    String message = rawMessage == null ? "" : rawMessage.strip();
    if (message.length() < MIN_MESSAGE) return Checked.refused(ApiError.MESSAGE_TOO_SHORT);
    if (message.length() > MAX_MESSAGE) return Checked.refused(ApiError.MESSAGE_TOO_LONG);

    String rawEmail = Json.text(Json.at(body, Fields.EMAIL));
    String email = rawEmail == null ? "" : rawEmail.strip();
    if (!email.isEmpty() && (email.length() > MAX_EMAIL || !EMAIL.matcher(email).matches())) return Checked.refused(ApiError.INVALID_EMAIL);

    JsonNode list = Json.at(body, Fields.FILES);
    List<FileInfo> files = new ArrayList<>();
    if (Json.present(list)) {
      if (!list.isArray() || list.size() > MAX_FILES) return Checked.refused(ApiError.TOO_MANY_FILES);
      int index = 0;
      long total = 0;
      for (JsonNode file : list) {
        JsonNode rawType = Json.at(file, Fields.TYPE);
        String type = (Json.present(rawType) ? rawType.asText() : "").toLowerCase();
        if (!FILE_TYPE.matcher(type).matches()) return Checked.refused(ApiError.INVALID_FILE_TYPE);
        JsonNode size = Json.at(file, Fields.SIZE);
        if (!Json.isInt(size) || Json.intOf(size) <= 0 || Json.intOf(size) > MAX_FILE_BYTES) return Checked.refused(ApiError.FILE_TOO_BIG);
        JsonNode name = Json.at(file, Fields.NAME);
        files.add(new FileInfo(cleanName(Json.present(name) ? name.asText() : "", index), type, Json.intOf(size)));
        total += Json.intOf(size);
        index += 1;
      }
      if (total > MAX_TOTAL_BYTES) return Checked.refused(ApiError.FILES_TOO_BIG);
    }
    return new Checked(new Draft(kind, message, email, files), null);
  }

  /** Is this a piece the letter is still waiting for? `createdAt` is the letter's time as an ISO string. */
  public static boolean validPart(List<FileInfo> files, boolean closed, String createdAt, JsonNode fileNo, JsonNode partNo, JsonNode data, long now) {
    if (!Json.isInt(fileNo) || Json.intOf(fileNo) < 0 || Json.intOf(fileNo) >= files.size()) return false;
    FileInfo file = files.get((int) Json.intOf(fileNo));
    String text = Json.text(data);
    return !closed
        && now - Instant.parse(createdAt).toEpochMilli() < UPLOAD_WINDOW_MS
        && Json.isInt(partNo)
        && Json.intOf(partNo) >= 0
        && Json.intOf(partNo) < partCount(file.size())
        && text != null
        && !text.isEmpty()
        && text.length() <= PART_CHARS
        && BASE64.matcher(text).matches();
  }
}
