package com.pulsarkids.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.pulsarkids.api.core.Env;
import com.pulsarkids.api.core.FeedbackRules;
import com.pulsarkids.api.core.Json;
import com.sun.net.httpserver.HttpServer;
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

/**
 * The whole service over HTTP, against a real PostgreSQL started for the test
 * (never the production database) and stand-ins for Google Speech and Resend.
 * The tests are one story told in order: an account, its children, their play
 * time, the owner's side.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ApiTest {
  private static final String ADMIN_KEY = "test-admin-key";
  private static final HttpClient HTTP = HttpClient.newHttpClient();

  private static EmbeddedPostgres postgres;
  private static HttpServer outside;
  /** What was asked of Google Speech and of Resend. */
  private static final List<JsonNode> spoken = new CopyOnWriteArrayList<>();
  private static final List<JsonNode> mailed = new CopyOnWriteArrayList<>();

  private static String parentToken;
  private static String childToken;
  private static long parentId;

  @LocalServerPort
  int port;

  @BeforeAll
  static void start() throws Exception {
    postgres = EmbeddedPostgres.builder().start();
    outside = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
    outside.createContext("/tts", (exchange) -> {
      spoken.add(Json.MAPPER.readTree(exchange.getRequestBody()));
      byte[] answer = "{\"audioContent\":\"TVAz\"}".getBytes(StandardCharsets.UTF_8);
      exchange.sendResponseHeaders(200, answer.length);
      exchange.getResponseBody().write(answer);
      exchange.close();
    });
    outside.createContext("/mail", (exchange) -> {
      mailed.add(Json.MAPPER.readTree(exchange.getRequestBody()));
      byte[] answer = "{\"id\":\"1\"}".getBytes(StandardCharsets.UTF_8);
      exchange.sendResponseHeaders(200, answer.length);
      exchange.getResponseBody().write(answer);
      exchange.close();
    });
    outside.start();
    String there = "http://127.0.0.1:" + outside.getAddress().getPort();

    Env.set("DATABASE_URL", "postgres://postgres:postgres@localhost:" + postgres.getPort() + "/postgres");
    Env.set("JWT_SECRET", "test-secret");
    Env.set("ADMIN_KEY", ADMIN_KEY);
    Env.set("VITE_AUTH0_DOMAIN", "");
    Env.set("VITE_AUTH0_CLIENT_ID", "");
    Env.set("GOOGLE_TTS_ENDPOINT", there + "/tts");
    Env.set("RESEND_ENDPOINT", there + "/mail");
    Env.set("RESEND_API_KEY", "re_test");
    Env.set("FEEDBACK_TO", "owner@example.com");
    Env.set("FEEDBACK_FROM", "");
    Env.set("PARENTS_URL", "");
  }

  @AfterAll
  static void stop() throws Exception {
    outside.stop(0);
    postgres.close();
  }

  private record Answer(int status, JsonNode body, HttpResponse<String> raw) {
    String text(String field) {
      return body.path(field).asText(null);
    }
  }

  private Answer call(String method, String path, Object body, String... headers) throws Exception {
    HttpRequest.Builder request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path));
    request.method(method, body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body instanceof String s ? s : Json.write(body)));
    if (body != null) request.header("Content-Type", "application/json");
    for (int i = 0; i < headers.length; i += 2) request.header(headers[i], headers[i + 1]);
    HttpResponse<String> res = HTTP.send(request.build(), HttpResponse.BodyHandlers.ofString());
    return new Answer(res.statusCode(), res.body().isEmpty() ? Json.object() : Json.parse(res.body()), res);
  }

  private Answer asParent(String method, String path, Object body) throws Exception {
    return call(method, path, body, "Authorization", "Bearer " + parentToken);
  }

  private Answer asAdmin(String method, String path, Object body) throws Exception {
    return call(method, path, body, "x-admin-key", ADMIN_KEY);
  }

  private static JsonNode json(String text) {
    return Json.parse(text.replace('\'', '"'));
  }

  @Test
  @Order(1)
  void healthAnswersAndTellsWhatIsOffered() throws Exception {
    Answer health = call("GET", "/api/health", null, "x-vercel-ip-country", "pl");
    assertEquals(200, health.status());
    assertTrue(health.body().get("ok").asBoolean());
    assertEquals("PL", health.text("country"));
    assertEquals(json("{'langs':{'site':null,'game':null},'games':{'hidden':[],'soon':[]},'galaxies':{'hidden':[],'soon':[]}}"), health.body().get("availability"));
    assertEquals("no-store", health.raw().headers().firstValue("Cache-Control").orElse(""));
    assertTrue(call("GET", "/api/health", null).body().get("country").isNull());

    // A refusal is a code for the client's logic and a text for the person, in the language asked for.
    assertEquals(json("{'error':'not_found','message':'Nothing was found at this address.'}"), call("GET", "/api/nothing-here", null).body());
    assertEquals("За цією адресою нічого немає.", call("GET", "/api/nothing-here", null, "Accept-Language", "uk").text("message"));
    assertEquals("Pod tym adresem nic nie ma.", call("GET", "/api/nothing-here", null, "Accept-Language", "pl-PL,pl;q=0.9,en;q=0.8").text("message"));
    // A browser of a language we do not speak is answered in the first of its list that we do, else in English.
    assertEquals("Сеанс завершився. Увійдіть ще раз.", call("GET", "/api/state", null, "Accept-Language", "de-DE,de;q=0.9,uk;q=0.8").text("message"));
    assertEquals("Your session has ended. Please sign in again.", call("GET", "/api/state", null, "Accept-Language", "de").text("message"));
    Answer wrong = call("DELETE", "/api/state", null);
    assertEquals(405, wrong.status());
    assertEquals("method_not_allowed", wrong.text("error"));
    Answer unreadable = call("POST", "/api/auth/login", "{not json", "Accept-Language", "pl");
    assertEquals(400, unreadable.status());
    assertEquals(json("{'error':'invalid_json','message':'Nie udało się odczytać żądania.'}"), unreadable.body());
  }

  @Test
  @Order(2)
  void aParentSignsInOnlyAfterSayingTheAccountIsNew() throws Exception {
    assertEquals("invalid_email", call("POST", "/api/auth/login", Map.of("email", "nobody")).text("error"));

    Answer unknown = call("POST", "/api/auth/login", Map.of("email", " Mama.Test+kids@Gamil.com "));
    assertEquals(404, unknown.status());
    assertEquals("account_not_found", unknown.text("error"));
    assertEquals("mama.test+kids@gamil.com", unknown.text("email"));
    assertEquals("mama.test+kids@gmail.com", unknown.text("suggestion"));
    assertFalse(unknown.body().get("suggestionExists").asBoolean());

    Answer created = call("POST", "/api/auth/login", json("{'email':'Mama.Test+kids@gmail.com','create':true,'source':{'source':'Instagram','medium':'social','link':'insta-bio'}}"));
    assertEquals(200, created.status());
    assertTrue(created.body().get("created").asBoolean());
    assertEquals("mama.test+kids@gmail.com", created.body().at("/user/email").asText());
    parentToken = created.text("token");
    parentId = created.body().at("/user/id").asLong();

    // Another spelling of the same mailbox is the same account.
    Answer again = call("POST", "/api/auth/login", Map.of("email", "mamatest@googlemail.com"));
    assertEquals(200, again.status());
    assertFalse(again.body().get("created").asBoolean());
    assertEquals(parentId, again.body().at("/user/id").asLong());
    assertTrue(call("POST", "/api/auth/login", Map.of("email", "mamatest@gamil.com")).body().get("suggestionExists").asBoolean());
  }

  private static final String SAVE = """
      {'state': {
        'activeChildId': 'kid-1', 'parentLang': 'pl',
        'children': [
          { 'id': 'kid-1',
            'profile': { 'name': 'Марко', 'nickname': 'Marko_Speed', 'pin': '1234', 'gender': 'boy', 'birthYear': 2019 },
            'themeId': 'lego', 'artifacts': 12, 'tasksCompleted': 30, 'hintsSurfaced': 2,
            'progress': { 'math:add': 4, 'math:add#plays': 7, 'bad-key': 3 },
            'treasures': ['world:lego:b1', 'tip:hub', 'tip:hub'],
            'milestones': [{ 'id': 'm1', 'amount': 50, 'reward': 'Морозиво' }, { 'id': 'm2', 'amount': 100, 'reward': 'Зоопарк' }],
            'settings': { 'soundOn': false, 'currency': 'PLN', 'currencyChosen': true, 'gameLang': 'pl', 'voiceLang': 'xx',
                          'hiddenGames': ['math:shop', 5], 'voice': { 'hints': false },
                          'timeControl': { 'sessionDurationMinutes': 20, 'cooldownMinutes': 30, 'maxDailyMinutes': 0 } } },
          { 'id': 'kid-2', 'profile': { 'name': 'Оля' } }
        ] } }""";

  @Test
  @Order(3)
  void theSaveIsTakenApartAndPutTogetherAgain() throws Exception {
    assertEquals(401, call("GET", "/api/state", null).status());
    Answer empty = asParent("GET", "/api/state", null);
    assertEquals(json("{'children':[],'activeChildId':null,'parentLang':null}"), empty.body().get("state"));
    assertFalse(empty.body().at("/features/cloudTts").asBoolean());
    assertEquals("invalid_state", asParent("PUT", "/api/state", Map.of("state", List.of())).text("error"));

    Answer saved = asParent("PUT", "/api/state", json(SAVE));
    assertEquals(200, saved.status(), saved.body().toString());
    assertTrue(saved.text("updatedAt").matches("\\d{4}-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\d\\.\\d{3}Z"));

    JsonNode state = asParent("GET", "/api/state", null).body().get("state");
    assertEquals("kid-1", state.get("activeChildId").asText());
    assertEquals("pl", state.get("parentLang").asText());
    JsonNode marko = state.at("/children/0");
    assertEquals(
        json("{'name':'Марко','nickname':'marko_speed','pin':'1234','email':'','password':'','birthYear':2019,'gender':'boy'}"),
        marko.get("profile"));
    assertEquals("lego", marko.get("themeId").asText());
    assertEquals(12, marko.get("artifacts").asInt());
    assertEquals(json("{'math:add':4,'math:add#plays':7}"), marko.get("progress"));
    assertEquals(List.of("tip:hub", "world:lego:b1"), sorted(marko.get("treasures")));
    assertEquals(json("[{'id':'m1','amount':50,'reward':'Морозиво'},{'id':'m2','amount':100,'reward':'Зоопарк'}]"), marko.get("milestones"));
    JsonNode settings = marko.get("settings");
    assertFalse(settings.get("soundOn").asBoolean());
    assertTrue(settings.get("voiceOn").asBoolean());
    assertEquals("PLN", settings.get("currency").asText());
    assertTrue(settings.get("currencyChosen").asBoolean());
    assertEquals("pl", settings.get("gameLang").asText());
    assertTrue(settings.get("voiceLang").isNull(), "a language that is not ours is no choice");
    assertEquals(json("['math:shop']"), settings.get("hiddenGames"));
    assertEquals(json("{'hints':false}"), settings.get("voice"));
    assertEquals(json("{'sessionDurationMinutes':20,'cooldownMinutes':30,'maxDailyMinutes':0}"), settings.get("timeControl"));
    // A child who has never played: today, a full tank.
    assertTrue(marko.at("/screenTime/dayKey").asText().matches("\\d{4}-\\d\\d-\\d\\d"));
    ((com.fasterxml.jackson.databind.node.ObjectNode) marko.get("screenTime")).remove("dayKey");
    assertEquals(json("{'minutesUsedToday':0,'sessionElapsedMs':0,'sessionStartedAt':null,'cooldownUntil':null,'lastSessionEndedAt':null}"), marko.get("screenTime"));

    JsonNode olia = state.at("/children/1");
    assertEquals(json("{'name':'Оля','nickname':'','pin':'','email':'','password':'','gender':'girl'}"), olia.get("profile"));
    assertTrue(olia.get("themeId").isNull());
    assertFalse(olia.get("settings").has("currencyChosen"));
    assertEquals(json("{'sessionDurationMinutes':15,'cooldownMinutes':45,'maxDailyMinutes':60}"), olia.at("/settings/timeControl"));
  }

  private static List<String> sorted(JsonNode array) {
    List<String> out = new ArrayList<>();
    array.forEach((node) -> out.add(node.asText()));
    return out.stream().sorted().toList();
  }

  @Test
  @Order(4)
  void aChildSignsInByNicknameAndPin() throws Exception {
    assertFalse(asParent("GET", "/api/nickname?nick=MARKO_speed", null).body().isEmpty());
    assertTrue(asParent("GET", "/api/nickname?nick=marko_speed", null).body().get("available").asBoolean(), "the account's own nickname is not taken for it");
    assertEquals("invalid_nickname", asParent("GET", "/api/nickname?nick=a", null).text("error"));
    assertEquals("Нікнейм — це 3–12 латинських літер, цифр або підкреслень.", call("GET", "/api/nickname?nick=a", null, "Authorization", "Bearer " + parentToken, "Accept-Language", "uk").text("message"));

    // Another account sees the nickname as taken.
    String other = call("POST", "/api/auth/login", json("{'email':'tato@example.com','create':true}")).text("token");
    assertFalse(call("GET", "/api/nickname?nick=marko_speed", null, "Authorization", "Bearer " + other).body().get("available").asBoolean());

    assertEquals("invalid_credentials", call("POST", "/api/auth/child-login", Map.of("identifier", " ")).text("error"));
    assertEquals(404, call("POST", "/api/auth/child-login", Map.of("identifier", "nobody", "pin", "1")).status());
    Answer badPin = call("POST", "/api/auth/child-login", Map.of("identifier", "marko_speed", "pin", "0000"));
    assertEquals(401, badPin.status());
    assertEquals("invalid_pin", badPin.text("error"));

    Answer in = call("POST", "/api/auth/child-login", Map.of("identifier", " Marko_Speed ", "pin", "1234"));
    assertEquals(200, in.status());
    assertEquals("kid-1", in.text("childId"));
    assertEquals(parentId, in.body().at("/user/id").asLong());
    childToken = in.text("token");

    // The parent opens a child's game without the PIN; a child's token cannot, nor can another account.
    assertEquals("kid-2", asParent("POST", "/api/auth/child-login", Map.of("childId", "kid-2")).text("childId"));
    assertEquals(401, call("POST", "/api/auth/child-login", Map.of("childId", "kid-2"), "Authorization", "Bearer " + childToken).status());
    assertEquals(404, call("POST", "/api/auth/child-login", Map.of("childId", "kid-2"), "Authorization", "Bearer " + other).status());
  }

  @Test
  @Order(5)
  void aSaveCannotTakeAChildOfAnotherAccount() throws Exception {
    String other = call("POST", "/api/auth/login", Map.of("email", "tato@example.com")).text("token");
    // The stranger knows the child's id (ids are made by browsers) and names it in a save of their own.
    Answer theft = call("PUT", "/api/state", json("""
        {'state': {'activeChildId': 'kid-1', 'children': [
          { 'id': 'their-own', 'profile': { 'name': 'Свій' } },
          { 'id': 'kid-1', 'profile': { 'name': 'Чужий', 'nickname': 'marko_speed', 'pin': '0000' }, 'progress': {}, 'treasures': [] } ] } }"""),
        "Authorization", "Bearer " + other, "Accept-Language", "uk");
    assertEquals(409, theft.status());
    assertEquals("child_id_taken", theft.text("error"));
    assertEquals("Цей профіль належить іншому акаунту, тож його не збережено.", theft.text("message"));

    // Nothing of that save was kept — not even the stranger's own child…
    assertEquals(0, call("GET", "/api/state", null, "Authorization", "Bearer " + other).body().at("/state/children").size());
    // …and the child is where it was, with its name, its PIN and its progress.
    JsonNode marko = asParent("GET", "/api/state", null).body().at("/state/children/0");
    assertEquals("Марко", marko.at("/profile/name").asText());
    assertEquals("1234", marko.at("/profile/pin").asText());
    assertEquals(json("{'math:add':4,'math:add#plays':7}"), marko.get("progress"));
    assertEquals(401, call("POST", "/api/auth/child-login", Map.of("identifier", "marko_speed", "pin", "0000")).status());
    assertEquals(200, call("POST", "/api/auth/child-login", Map.of("identifier", "marko_speed", "pin", "1234")).status());
    // The stranger cannot reach the child's play time either.
    assertEquals(404, call("POST", "/api/v1/session/reset", Map.of("child_profile_id", "kid-1"), "Authorization", "Bearer " + other).status());

    // A child without a name is called «friend» in the language of the request.
    call("PUT", "/api/state", json("{'state':{'children':[{'id':'nameless'}]}}"), "Authorization", "Bearer " + other, "Accept-Language", "pl");
    assertEquals("Przyjacielu", call("GET", "/api/state", null, "Authorization", "Bearer " + other).body().at("/state/children/0/profile/name").asText());
    call("PUT", "/api/state", json("{'state':{'children':[]}}"), "Authorization", "Bearer " + other);
  }

  @Test
  @Order(6)
  void theServerCountsPlayTime() throws Exception {
    Answer started = call("POST", "/api/v1/session/start", Map.of("tz_offset_min", -180), "Authorization", "Bearer " + childToken);
    assertEquals(200, started.status(), started.body().toString());
    assertEquals("kid-1", started.text("child_profile_id"));
    assertEquals(20 * 60, started.body().get("remaining_time_seconds").asInt());
    assertTrue(started.body().get("daily_remaining_seconds").isNull(), "no daily cap");
    assertFalse(started.body().get("in_cooldown").asBoolean());
    assertTrue(started.body().get("screen_time").get("dayKey").asText().matches("\\d{4}-\\d\\d-\\d\\d"));

    Answer beat = call("PUT", "/api/v1/session/heartbeat", Map.of("tz_offset_min", -180, "end", "pause"), "Authorization", "Bearer " + childToken);
    assertEquals(200, beat.status());
    assertFalse(beat.body().get("depleted").asBoolean());

    // A child's token acts on its own profile only, and cannot refill the tank.
    assertEquals("parent_only", call("POST", "/api/v1/session/reset", Map.of(), "Authorization", "Bearer " + childToken).text("error"));
    assertEquals("invalid_child_profile_id", asParent("POST", "/api/v1/session/reset", Map.of()).text("error"));
    assertEquals(404, asParent("POST", "/api/v1/session/start", Map.of("child_profile_id", "someone-else")).status());
    Answer reset = asParent("POST", "/api/v1/session/reset", Map.of("child_profile_id", "kid-2", "tz_offset_min", 0));
    assertEquals(15 * 60, reset.body().get("remaining_time_seconds").asInt());
    assertEquals(60 * 60, reset.body().get("daily_remaining_seconds").asInt());

    // A child who has not played today is not shown the minutes of the day they last played.
    try (var conn = postgres.getPostgresDatabase().getConnection(); var statement = conn.createStatement()) {
      statement.executeUpdate("UPDATE wk_screen_time SET day_key = '2020-01-01', minutes_used_today = 55, session_elapsed_ms = 120000, cooldown_until = 1 WHERE child_id = 'kid-2'");
    }
    JsonNode stale = asParent("GET", "/api/state?tz_offset_min=-180", null).body().at("/state/children/1/screenTime");
    assertEquals(0, stale.get("minutesUsedToday").asInt(), stale.toString());
    assertEquals(0, stale.get("sessionElapsedMs").asInt());
    assertTrue(stale.get("cooldownUntil").isNull());
    assertTrue(stale.get("dayKey").asText().startsWith("202") && !stale.get("dayKey").asText().equals("2020-01-01"));

    // A save never touches what the server has counted.
    asParent("PUT", "/api/state", json(SAVE));
    assertFalse(asParent("GET", "/api/state", null).body().at("/state/children/0/screenTime/dayKey").asText().isEmpty());
  }

  @Test
  @Order(7)
  void aSaveReplacesTheListsAndDropsTheChildrenItNoLongerNames() throws Exception {
    Answer saved = asParent("PUT", "/api/state", json("""
        {'state': {'activeChildId': 'kid-1', 'children': [
          { 'id': 'kid-1', 'profile': { 'name': 'Марко', 'nickname': 'marko_speed', 'pin': '1234' },
            'progress': { 'math:add': 5 }, 'treasures': ['tip:hub'], 'milestones': [] } ] } }"""));
    assertEquals(200, saved.status(), saved.body().toString());
    JsonNode state = asParent("GET", "/api/state", null).body().get("state");
    assertEquals(1, state.get("children").size());
    assertEquals("pl", state.get("parentLang").asText(), "a language not sent stays as it was");
    assertEquals(json("{'math:add':5}"), state.at("/children/0/progress"));
    assertEquals(json("['tip:hub']"), state.at("/children/0/treasures"));
    assertEquals(0, state.at("/children/0/milestones").size());
  }

  @Test
  @Order(8)
  void theOwnerSeesTheAccounts() throws Exception {
    assertEquals(401, call("GET", "/api/admin/users", null).status());
    assertEquals("invalid_admin_key", call("GET", "/api/admin/users", null, "x-admin-key", "wrong-admin-key").text("error"));

    JsonNode accounts = asAdmin("GET", "/api/admin/users", null).body().get("accounts");
    assertEquals(2, accounts.size());
    JsonNode mama = accounts.get(0).get("id").asLong() == parentId ? accounts.get(0) : accounts.get(1);
    assertEquals(json("{'source':'instagram','medium':'social','campaign':null,'link':'insta-bio'}"), mama.get("signup"));
    assertFalse(mama.get("duplicateMailbox").asBoolean());
    assertTrue(mama.get("createdAt").asText().endsWith("Z"));
    assertEquals("marko_speed", mama.at("/children/0/nickname").asText());
    assertEquals(json("{'math:add':5}"), mama.at("/children/0/progress"));
    assertTrue(mama.at("/children/0/birthYear").isNull());

    assertEquals(5, asAdmin("GET", "/api/admin/users?part=settings", null).body().at("/settings/demoMinutes").asInt());
    Answer tooLong = asAdmin("PUT", "/api/admin/users?part=settings", Map.of("demoMinutes", 99));
    assertEquals("invalid_demo_minutes", tooLong.text("error"));
    assertEquals("The trial game lasts a whole number of minutes, from 1 to 60.", tooLong.text("message"), "the limits in a text are the rule's own");
    assertEquals(8, asAdmin("PUT", "/api/admin/users?part=settings", Map.of("demoMinutes", 8)).body().at("/settings/demoMinutes").asInt());
    assertEquals("unknown_part", asAdmin("GET", "/api/admin/users?part=nonsense", null).text("error"));
  }

  @Test
  @Order(9)
  void arrivalsByTheOwnersLinksAreCounted() throws Exception {
    Answer made = asAdmin("POST", "/api/admin/users?part=links", Map.of("name", "Інстаграм, біо", "mode", "demo"));
    assertEquals(200, made.status(), made.body().toString());
    assertEquals("instahram-bio", made.body().at("/links/0/code").asText());
    assertEquals("code_taken", asAdmin("POST", "/api/admin/users?part=links", Map.of("name", "x", "mode", "site", "code", "instahram-bio")).text("error"));

    // The site is counted only by a link that exists; the trial game always.
    assertFalse(call("POST", "/api/health", Map.of("mode", "site", "link", "no-such-link")).body().has("visit"));
    Answer arrival = call("POST", "/api/health", Map.of("mode", "demo", "link", "instahram-bio", "lang", "uk", "referrer", "l.instagram.com"),
        "x-vercel-ip-country", "UA", "user-agent", "Mozilla/5.0 (iPhone) Mobile", "x-forwarded-for", "203.0.113.7, 10.0.0.1");
    assertEquals(8, arrival.body().get("demoMinutes").asInt());
    long visit = arrival.body().get("visit").asLong();
    assertEquals(403, call("PUT", "/api/health", Map.of("visit", visit, "token", "forged", "event", "cta")).status());
    assertEquals("invalid_event", call("PUT", "/api/health", Map.of("visit", visit, "token", arrival.text("token"), "event", "won")).text("error"));
    assertEquals(200, call("PUT", "/api/health", Map.of("visit", visit, "token", arrival.text("token"), "event", "cta")).status());

    JsonNode page = asAdmin("GET", "/api/admin/users?part=links&days=0", null).body();
    JsonNode link = page.at("/links/0");
    assertEquals(1, link.get("visits").asInt());
    assertEquals(1, link.get("visitors").asInt());
    assertEquals(1, link.get("demos").asInt());
    assertEquals(1, link.get("cta").asInt());
    assertEquals(0, link.get("expired").asInt());
    assertNotNull(link.get("lastVisitAt").asText(null));
    JsonNode seen = page.at("/visits/0");
    assertEquals("instahram-bio", seen.get("link").asText());
    assertEquals("Інстаграм, біо", seen.get("linkName").asText());
    assertEquals("UA", seen.get("country").asText());
    assertEquals("mobile", seen.get("device").asText());
    assertEquals(10, seen.get("visitor").asText().length());
    assertFalse(seen.get("ctaAt").isNull());
    assertTrue(seen.get("expiredAt").isNull());

    int id = link.get("id").asInt();
    assertEquals("Біо", asAdmin("PUT", "/api/admin/users?part=links", Map.of("id", id, "name", " Біо ")).body().at("/links/0/name").asText());
    JsonNode after = asAdmin("DELETE", "/api/admin/users?part=links&days=7&id=" + id, null).body();
    assertEquals(0, after.get("links").size());
    assertEquals(1, after.get("visits").size(), "the visits a link brought stay");
    assertTrue(after.at("/visits/0/linkName").isNull());
  }

  @Test
  @Order(10)
  void whatIsOfferedDependsOnTheCountry() throws Exception {
    Answer kept = asAdmin("PUT", "/api/admin/users?part=availability", json("""
        {'availability': {
          'regions': [{ 'id': 'north-america', 'name': 'Північна Америка', 'countries': ['us', 'ca'] }],
          'langRules': [{ 'where': ['@north-america'], 'site': ['en'], 'game': ['en'] }],
          'items': { 'galaxy:art': { 'status': 'soon' }, 'game:math:shop': { 'status': 'on', 'scope': 'only', 'where': ['PL'] }, 'junk': {} } } }"""));
    assertEquals(200, kept.status(), kept.body().toString());
    assertEquals(json("['US','CA']"), kept.body().at("/availability/regions/0/countries"));
    assertFalse(kept.body().at("/availability/items").has("junk"));
    assertEquals(kept.body(), asAdmin("GET", "/api/admin/users?part=availability", null).body());

    JsonNode us = call("GET", "/api/health", null, "x-vercel-ip-country", "US").body().get("availability");
    assertEquals(json("{'site':['en'],'game':['en']}"), us.get("langs"));
    assertEquals(json("{'hidden':['math:shop'],'soon':[]}"), us.get("games"));
    assertEquals(json("{'hidden':[],'soon':['art']}"), us.get("galaxies"));
    assertEquals(json("{'hidden':[],'soon':[]}"), call("GET", "/api/health", null, "x-vercel-ip-country", "PL").body().at("/availability/games"));
  }

  @Test
  @Order(11)
  void theCloudVoiceSpeaksWithTheOwnersKeyAndEachPhraseIsPaidForOnce() throws Exception {
    assertEquals("tts_disabled", asParent("POST", "/api/tts", Map.of("text", "Привіт")).text("error"));
    assertEquals("invalid_key", asAdmin("POST", "/api/admin/speech", Map.of("label", "x", "scope", "global")).text("error"));
    assertEquals("invalid_voice", asAdmin("POST", "/api/admin/speech", Map.of("key", "AIza-secret-1234", "voice", "nonsense", "scope", "global")).text("error"));

    Answer made = asAdmin("POST", "/api/admin/speech", Map.of("label", " Головний ", "key", "AIza-secret-1234", "voice", "uk-UA-Wavenet-B", "scope", "global", "accountIds", List.of()));
    assertEquals(200, made.status(), made.body().toString());
    JsonNode key = made.body().at("/keys/0");
    assertEquals("Головний", key.get("label").asText());
    assertEquals("…1234", key.get("keyHint").asText());
    assertTrue(key.get("readable").asBoolean());
    assertTrue(key.get("isGlobal").asBoolean());
    assertFalse(key.has("encryptedKey"), "a stored key never leaves the server");
    assertFalse(made.body().toString().contains("AIza-secret"));
    int keyId = made.body().get("id").asInt();

    assertTrue(asParent("GET", "/api/state", null).body().at("/features/cloudTts").asBoolean());
    assertEquals("invalid_text", asParent("POST", "/api/tts", Map.of("text", "  ")).text("error"));
    assertEquals("TVAz", asParent("POST", "/api/tts", Map.of("text", "Привіт,   світе!")).text("audio"));
    assertEquals("TVAz", asParent("POST", "/api/tts", Map.of("text", "Привіт, світе!")).text("audio"));
    assertEquals(1, spoken.size(), "the second time the phrase comes from the cache");
    assertEquals(json("{'input':{'text':'Привіт, світе!'},'voice':{'languageCode':'uk-UA','name':'uk-UA-Wavenet-B'},'audioConfig':{'audioEncoding':'MP3','speakingRate':0.95}}"), spoken.get(0));
    // A Ukrainian voice is never handed a Polish phrase.
    asParent("POST", "/api/tts", Map.of("text", "Cześć", "lang", "pl"));
    assertEquals("pl-PL-Wavenet-A", spoken.get(1).at("/voice/name").asText());

    assertTrue(asAdmin("POST", "/api/admin/speech?test=1", Map.of("keyId", keyId)).body().get("ok").asBoolean());
    assertTrue(spoken.get(2).at("/input/text").asText().startsWith("Привіт!"), "a voice is tried with a phrase of its own language");
    assertEquals("no_key", asAdmin("POST", "/api/admin/speech?test=1", Map.of("keyId", 9999)).text("error"));

    // Switched off for one account; then the key is given to that account alone.
    assertTrue(asAdmin("PUT", "/api/admin/users", Map.of("parentId", parentId, "speechEnabled", false)).body().get("speechOff").asBoolean());
    assertEquals("tts_disabled", asParent("POST", "/api/tts", Map.of("text", "Привіт, світе!")).text("error"));
    asAdmin("PUT", "/api/admin/users", Map.of("parentId", parentId, "speechEnabled", true));
    Answer scoped = asAdmin("PUT", "/api/admin/speech", Map.of("id", keyId, "label", "Лише мама", "key", "", "voice", "", "scope", "accounts", "accountIds", List.of(parentId)));
    assertEquals(json("[" + parentId + "]"), scoped.body().at("/keys/0/accountIds"));
    assertFalse(scoped.body().at("/keys/0/isGlobal").asBoolean());
    assertEquals("…1234", scoped.body().at("/keys/0/keyHint").asText(), "an empty key keeps the stored secret");
    assertEquals("uk-UA-Wavenet-A", scoped.body().at("/keys/0/voice").asText());
    assertTrue(asParent("GET", "/api/state", null).body().at("/features/cloudTts").asBoolean());
    assertEquals(404, asAdmin("PUT", "/api/admin/speech", Map.of("id", 9999, "scope", "global")).status());

    assertEquals(0, asAdmin("DELETE", "/api/admin/speech?id=" + keyId, null).body().get("keys").size());
    assertFalse(asParent("GET", "/api/state", null).body().at("/features/cloudTts").asBoolean());
  }

  @Test
  @Order(12)
  void aLetterFromTheSiteIsKeptAndForwardedWithItsFiles() throws Exception {
    assertEquals("message_too_short", call("POST", "/api/feedback", Map.of("message", "hi")).text("error"));
    assertEquals(200, call("POST", "/api/feedback", Map.of("message", "I am a robot", "trap", "x")).status());
    assertEquals(0, mailed.size());

    Answer plain = call("POST", "/api/feedback", Map.of("kind", "idea", "message", "Додайте гру про космос", "email", "mama@example.com"), "x-forwarded-host", "play.pulsarkids.com", "Accept-Language", "pl");
    assertEquals(json("{'ok':true}"), plain.body());
    assertEquals(1, mailed.size());
    JsonNode mail = mailed.get(0);
    assertEquals(json("['owner@example.com']"), mail.get("to"));
    assertEquals("mama@example.com", mail.get("reply_to").asText());
    assertTrue(mail.get("subject").asText().startsWith("Pulsar Kids · Ідея №"));
    assertTrue(mail.get("text").asText().contains("Відповісти: https://parents.pulsarkids.com/admin/feedback"), mail.get("text").asText());
    assertFalse(mail.has("attachments"));

    byte[] picture = new byte[2000];
    for (int i = 0; i < picture.length; i += 1) picture[i] = (byte) i;
    Answer open = call("POST", "/api/feedback", json("{'kind':'bug','message':'Кнопка не працює','files':[{'name':'../знімок.png','type':'image/png','size':2000}]}"));
    int id = open.body().get("id").asInt();
    String token = open.text("token");
    assertEquals(1, mailed.size(), "a letter with files waits for them");
    String data = Base64.getEncoder().encodeToString(picture);
    assertEquals(403, call("PUT", "/api/feedback", Map.of("id", id, "token", "forged", "file", 0, "part", 0, "data", data)).status());
    assertEquals("invalid_part", call("PUT", "/api/feedback", Map.of("id", id, "token", token, "file", 0, "part", 1, "data", data)).text("error"));
    assertEquals(200, call("PUT", "/api/feedback", Map.of("id", id, "token", token, "file", 0, "part", 0, "data", data)).status());
    assertEquals(1, FeedbackRules.partCount(2000));
    assertEquals(200, call("POST", "/api/feedback", Map.of("id", id, "token", token, "finish", true)).status());
    assertEquals(2, mailed.size());
    assertEquals(json("[{'filename':'знімок.png','content':'" + data + "'}]"), mailed.get(1).get("attachments"));
    assertEquals("invalid_part", call("PUT", "/api/feedback", Map.of("id", id, "token", token, "file", 0, "part", 0, "data", data)).text("error"), "a closed letter takes no more files");

    // The owner's side needs the key.
    assertEquals(401, call("GET", "/api/feedback", null).status());
    JsonNode list = asAdmin("GET", "/api/feedback", null).body();
    assertTrue(list.get("mailReady").asBoolean());
    assertEquals(2, list.get("letters").size());
    JsonNode bug = list.at("/letters/0");
    assertEquals(id, bug.get("id").asInt());
    assertEquals(json("[{'name':'знімок.png','type':'image/png','size':2000}]"), bug.get("files"));
    assertFalse(bug.get("mailedAt").isNull());
    assertFalse(bug.get("filesWaiting").asBoolean(), "the files are gone once the letter has left");
    assertEquals("no_reply_address", asAdmin("PUT", "/api/feedback", Map.of("id", id, "reply", "Дякуємо!")).text("error"));

    int ideaId = list.at("/letters/1/id").asInt();
    JsonNode answered = asAdmin("PUT", "/api/feedback", Map.of("id", ideaId, "reply", " Дякуємо, зробимо! ")).body();
    assertEquals("answered", answered.at("/letters/1/status").asText());
    assertEquals("Дякуємо, зробимо!", answered.at("/letters/1/replies/0/body").asText());
    assertEquals(json("['mama@example.com']"), mailed.get(2).get("to"));
    assertTrue(mailed.get(2).get("text").asText().contains("> Додайте гру про космос"));
    // The owner reads their mail in their own language; the sender is answered in the one they wrote in.
    assertTrue(mail.get("text").asText().contains("Тип: Ідея"), mail.get("text").asText());
    assertEquals("Odpowiedź od Pulsar Kids", mailed.get(2).get("subject").asText());
    assertTrue(mailed.get(2).get("text").asText().contains("napisano:"), mailed.get(2).get("text").asText());
    assertEquals("done", asAdmin("PUT", "/api/feedback", Map.of("id", ideaId, "status", "done")).body().at("/letters/1/status").asText());
    assertEquals("invalid_request", asAdmin("PUT", "/api/feedback", Map.of("id", ideaId, "status", "lost")).text("error"));
    assertEquals(200, asAdmin("PUT", "/api/feedback", Map.of("id", ideaId, "resend", true)).status());
    assertEquals(4, mailed.size());
    assertEquals(1, asAdmin("DELETE", "/api/feedback?id=" + ideaId, null).body().get("letters").size());
    assertEquals(404, asAdmin("DELETE", "/api/feedback?id=" + ideaId, null).status());
  }

  @Test
  @Order(13)
  void ourOwnPagesMaySendEverythingAForeignPageOnlyToThePublicAddresses() throws Exception {
    Answer own = call("OPTIONS", "/api/state", null, "Origin", "https://parents.pulsarkids.com", "Access-Control-Request-Method", "PUT");
    assertEquals(204, own.status());
    assertEquals("https://parents.pulsarkids.com", own.raw().headers().firstValue("Access-Control-Allow-Origin").orElse(null));
    assertTrue(own.raw().headers().firstValue("Access-Control-Allow-Headers").orElse("").contains("x-admin-key"));
    assertEquals("http://192.168.1.20:4321", call("GET", "/api/health", null, "Origin", "http://192.168.1.20:4321").raw().headers().firstValue("Access-Control-Allow-Origin").orElse(null));

    Answer foreign = call("OPTIONS", "/api/state", null, "Origin", "https://evil-pulsarkids.com");
    assertNull(foreign.raw().headers().firstValue("Access-Control-Allow-Origin").orElse(null));
    Answer open = call("OPTIONS", "/api/feedback", null, "Origin", "https://example.org");
    assertEquals("*", open.raw().headers().firstValue("Access-Control-Allow-Origin").orElse(null));
    assertEquals("Content-Type", open.raw().headers().firstValue("Access-Control-Allow-Headers").orElse(null));
  }

  @Test
  @Order(14)
  void anAccountIsRemovedWithEverythingOfIts() throws Exception {
    assertEquals(200, asAdmin("DELETE", "/api/admin/users?id=" + parentId, null).status());
    assertEquals(404, asAdmin("DELETE", "/api/admin/users?id=" + parentId, null).status());
    assertEquals(1, asAdmin("GET", "/api/admin/users", null).body().get("accounts").size());
    assertTrue(asParent("GET", "/api/state", null).body().get("state").isNull());
    assertEquals(404, call("POST", "/api/auth/child-login", Map.of("identifier", "marko_speed", "pin", "1234")).status());
  }
}
