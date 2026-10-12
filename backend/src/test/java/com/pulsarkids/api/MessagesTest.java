package com.pulsarkids.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.Currency;
import com.pulsarkids.api.model.FeedbackKind;
import com.pulsarkids.api.model.Lang;
import com.pulsarkids.api.model.Text;
import com.pulsarkids.api.model.Wire;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Properties;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;

/**
 * The message files: every language has every text the code can ask for, none
 * has a text nobody asks for, and a text has the same holes in every language.
 */
class MessagesTest {
  private static final Pattern HOLE = Pattern.compile("\\{(\\d+)}");

  private static String fileOf(Lang lang) {
    return lang == Lang.FALLBACK ? "/messages.properties" : "/messages_" + lang.getCode() + ".properties";
  }

  private static Properties read(Lang lang) throws Exception {
    Properties texts = new Properties();
    var in = MessagesTest.class.getResourceAsStream(fileOf(lang));
    assertNotNull(in, "a language of ours has no message file: " + fileOf(lang));
    try (var reader = new InputStreamReader(in, StandardCharsets.UTF_8)) {
      texts.load(reader);
    }
    return texts;
  }

  private static Set<String> wanted() {
    Set<String> keys = new TreeSet<>();
    for (ApiError error : ApiError.values()) keys.add(error.messageKey());
    for (Text text : Text.values()) keys.add(text.getKey());
    for (FeedbackKind kind : FeedbackKind.values()) keys.add(Text.keyOf(kind));
    return keys;
  }

  private static Set<String> holes(String text) {
    Set<String> found = new HashSet<>();
    Matcher hole = HOLE.matcher(text);
    while (hole.find()) found.add(hole.group(1));
    return found;
  }

  @Test
  void everyLanguageHasEveryTextAndNoneSpare() throws Exception {
    Properties original = read(Lang.FALLBACK);
    List<String> problems = new ArrayList<>();
    for (Lang lang : Lang.values()) {
      Properties texts = read(lang);
      for (String key : wanted()) {
        String text = texts.getProperty(key);
        if (text == null || text.isBlank()) problems.add(lang + ": no text for " + key);
        else if (!holes(text).equals(holes(original.getProperty(key, "")))) problems.add(lang + ": other holes in " + key);
      }
      for (String key : texts.stringPropertyNames()) {
        if (!wanted().contains(key)) problems.add(lang + ": nobody asks for " + key);
      }
    }
    assertTrue(problems.isEmpty(), String.join("\n", problems));
  }

  @Test
  void aCodeTheClientsKnowIsNeverTwoRefusalsWithOneStatus() {
    Set<String> seen = new HashSet<>();
    for (ApiError error : ApiError.values()) {
      assertTrue(seen.add(error.getCode() + " " + error.getStatus()), error + " repeats a code and a status");
      assertTrue(error.getCode().matches("[a-z0-9_]+"), error.getCode());
    }
  }

  @Test
  void theNamesThatTravelAreWhatTheClientsWrite() {
    assertEquals(List.of("uk", "en", "pl"), Wire.names(Lang.class));
    assertEquals(List.of("UAH", "EUR", "USD", "GBP", "PLN"), Wire.names(Currency.class));
    assertEquals(Lang.PL, Wire.of(Lang.class, "pl"));
    assertEquals(Lang.EN, Lang.of(java.util.Locale.forLanguageTag("en-GB")));
    assertFalse(Wire.names(Lang.class).contains("xx"));
    for (Lang lang : Lang.values()) assertTrue(lang.getCloudVoice().toLowerCase().startsWith(lang.getCode() + "-"), lang + " reads with a voice of another language");
  }
}
