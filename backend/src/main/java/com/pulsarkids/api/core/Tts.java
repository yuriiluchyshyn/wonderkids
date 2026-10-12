package com.pulsarkids.api.core;

import com.fasterxml.jackson.databind.JsonNode;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.Lang;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.regex.Pattern;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Google Cloud Text-to-Speech (natural voice) — server side only, so the API
 * key never reaches a browser.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class Tts {
  /** Google Cloud Text-to-Speech: its address and the fields of a request and an answer. */
  private static final String GOOGLE_URL = "https://texttospeech.googleapis.com/v1/text:synthesize";
  private static final String INPUT = "input";
  private static final String TEXT = "text";
  private static final String VOICE = "voice";
  private static final String LANGUAGE_CODE = "languageCode";
  private static final String NAME = "name";
  private static final String AUDIO_CONFIG = "audioConfig";
  private static final String AUDIO_ENCODING = "audioEncoding";
  private static final String MP3 = "MP3";
  private static final String SPEAKING_RATE_FIELD = "speakingRate";
  private static final String AUDIO_CONTENT = "audioContent";
  private static final String ERROR = "error";
  private static final String REASON = "message";
  private static final String API_KEY_HEADER = "X-Goog-Api-Key";
  private static final String CONTENT_TYPE = "Content-Type";
  private static final String JSON_TYPE = "application/json";

  /** The voice a key reads in when none is stored with it (each language's own is named in `Lang`). */
  public static final String DEFAULT_VOICE = Lang.DEFAULT.getCloudVoice();
  public static final int MAX_TTS_CHARS = 400;
  /** Slightly slower than normal — clearer for small listeners. */
  private static final double SPEAKING_RATE = 0.95;

  public static final Pattern VOICE_RE = Pattern.compile("^[a-z]{2,3}-[A-Z]{2}-[A-Za-z0-9-]{1,40}$");
  private static final HttpClient HTTP = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

  /** Speech that could not be made: `error` is the reason for the client, the message Google's own explanation. */
  @Getter
  public static final class Failed extends Exception {
    private final ApiError error;

    public Failed(ApiError error, String message) {
      super(message);
      this.error = error;
    }
  }

  private static String endpoint() {
    return Env.get(Vars.GOOGLE_TTS_ENDPOINT, GOOGLE_URL);
  }

  public static String normaliseVoice(String voice) {
    String v = voice == null ? "" : voice.strip();
    return VOICE_RE.matcher(v).matches() ? v : DEFAULT_VOICE;
  }

  /**
   * The voice that reads `lang` for an account: the one configured with its key
   * when that is a voice of this language, the language's own otherwise — a
   * Ukrainian voice must never be handed a Polish or an English phrase.
   */
  public static String voiceFor(Lang lang, String configured) {
    String voice = normaliseVoice(configured);
    return voice.toLowerCase().startsWith(lang.getCode() + "-") ? voice : lang.getCloudVoice();
  }

  /** The language a voice reads (`pl-PL-Wavenet-A` → Polish); the default one for a voice of a language we do not speak. */
  public static Lang langOfVoice(String voice) {
    for (Lang lang : Lang.values()) {
      if (voice.toLowerCase().startsWith(lang.getCode() + "-")) return lang;
    }
    return Lang.DEFAULT;
  }

  /** Cache identity of one spoken phrase (the same as the Node API made, so its cache is still hit). */
  public static String hash(String voice, String text) {
    return Secrets.sha256Hex(voice + "|" + SPEAKING_RATE + "|" + text);
  }

  /** Synthesises `text` → base64 MP3. */
  public static String synthesize(String apiKey, String voice, String text) throws Failed {
    String[] pieces = voice.split("-");
    String languageCode = pieces.length >= 2 ? pieces[0] + "-" + pieces[1] : voice;
    String payload = Json.write(Json.map(
        INPUT, Json.map(TEXT, text),
        VOICE, Json.map(LANGUAGE_CODE, languageCode, NAME, voice),
        AUDIO_CONFIG, Json.map(AUDIO_ENCODING, MP3, SPEAKING_RATE_FIELD, SPEAKING_RATE)));

    HttpResponse<String> res;
    try {
      HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint()))
          .timeout(Duration.ofSeconds(10))
          .header(CONTENT_TYPE, JSON_TYPE)
          .header(API_KEY_HEADER, apiKey)
          .POST(HttpRequest.BodyPublishers.ofString(payload, StandardCharsets.UTF_8))
          .build();
      res = HTTP.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
    } catch (InterruptedException err) {
      Thread.currentThread().interrupt();
      throw new Failed(ApiError.TTS_UNREACHABLE, String.valueOf(err.getMessage()));
    } catch (Exception err) {
      throw new Failed(ApiError.TTS_UNREACHABLE, String.valueOf(err.getMessage()));
    }

    JsonNode data;
    try {
      data = Json.MAPPER.readTree(res.body());
    } catch (Exception err) {
      data = Json.object();
    }
    String audio = Json.text(Json.at(data, AUDIO_CONTENT));
    boolean ok = res.statusCode() / 100 == 2;
    if (!ok || audio == null || audio.isEmpty()) {
      String reason = Json.text(Json.at(Json.at(data, ERROR), REASON));
      if (reason == null) reason = "HTTP " + res.statusCode();
      throw new Failed(res.statusCode() == 400 || res.statusCode() == 403 ? ApiError.TTS_KEY_REJECTED : ApiError.TTS_FAILED, reason);
    }
    return audio;
  }
}
