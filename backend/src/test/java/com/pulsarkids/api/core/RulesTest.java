package com.pulsarkids.api.core;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.Device;
import com.pulsarkids.api.model.FeedbackKind;
import com.pulsarkids.api.model.Lang;
import com.pulsarkids.api.model.LinkMode;
import com.pulsarkids.api.model.VisitVia;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/** The pure rules: mailboxes, sources, links and visits, letters, what is offered where. */
class RulesTest {
  private static JsonNode json(String text) {
    return Json.parse(text.replace('\'', '"'));
  }

  // ---- mailboxes -----------------------------------------------------------

  @Test
  void emailsAreStoredTrimmedAndLowerCased() {
    assertEquals("mama@example.com", Emails.normalise("  Mama@Example.COM "));
    assertTrue(Emails.isValid(" a@b.co "));
    assertFalse(Emails.isValid("a@b"));
    assertFalse(Emails.isValid("no at.sign"));
    assertFalse(Emails.isValid(null));
  }

  @Test
  void everySpellingOfOneGmailMailboxHasTheSameKey() {
    for (String spelling : List.of(
        "yura.lychushun@gmail.com", "Yura.Lychushun@Gmail.com", "yuralychushun@gmail.com", "y.u.r.a.lychushun@gmail.com",
        "yura.lychushun+kids@gmail.com", "yura.lychushun@googlemail.com", "  yura.lychushun@gmail.com  ")) {
      assertEquals("yuralychushun@gmail.com", Emails.key(spelling), spelling);
    }
  }

  @Test
  void otherProvidersKeepDotsAndPlusTags() {
    assertEquals("a.b@ukr.net", Emails.key("a.b@ukr.net"));
    assertNotEquals(Emails.key("a.b@ukr.net"), Emails.key("ab@ukr.net"));
    assertEquals("a.b+x@outlook.com", Emails.key("A.B+x@Outlook.com"));
    assertNotEquals(Emails.key("olena@gmail.com"), Emails.key("olena1@gmail.com"));
    assertNotEquals(Emails.key("olena@gmail.com"), Emails.key("olena@ukr.net"));
  }

  @Test
  void aMistypedWellKnownDomainGetsASuggestion() {
    assertEquals("yura.l@gmail.com", Emails.suggest("Yura.L@gamil.com"));
    assertEquals("mama@gmail.com", Emails.suggest("mama@gmail.con"));
    assertEquals("tato@ukr.net", Emails.suggest("tato@urk.net"));
    assertNull(Emails.suggest("ok@gmail.com"));
    assertNull(Emails.suggest("boss@company.ua"));
  }

  // ---- where an account came from -------------------------------------------

  @Test
  void theLabelsOfALinkAreKeptLowerCased() {
    assertEquals(new Source("instagram", "social", "parents-ua", null), Source.clean(json("{'source':' Instagram ','medium':'Social','campaign':'parents-ua'}")));
    assertEquals(new Source("l.facebook.com", "referral", null, null), Source.clean(json("{'source':'l.facebook.com','medium':'referral'}")));
    assertEquals(new Source("youtube", null, null, null), Source.clean(json("{'source':'youtube','medium':42,'campaign':'a b'}")));
    assertEquals("insta-bio", Source.clean(json("{'source':'insta-bio','medium':'link','link':'Insta-Bio'}")).link());
    assertNull(Source.clean(json("{'source':'ig','link':'a b'}")).link());
  }

  @Test
  void noSourceOrOneThatIsNotAPlainLabelIsNoSourceAtAll() {
    assertNull(Source.clean(null));
    assertNull(Source.clean(json("'instagram'")));
    assertNull(Source.clean(json("{'medium':'paid'}")));
    assertNull(Source.clean(json("{'source':''}")));
    assertNull(Source.clean(json("{'source':'<script>'}")));
    assertNull(Source.clean(json("{'source':'" + "x".repeat(61) + "'}")));
  }

  // ---- links and visits ------------------------------------------------------

  @Test
  void theTrialGameLastsAWholeNumberOfMinutes() {
    assertEquals(5, Marketing.cleanDemoMinutes(json("5")));
    assertEquals(10, Marketing.cleanDemoMinutes(json("'10'")));
    for (String bad : List.of("0", "61", "2.5", "'five'", "null")) assertNull(Marketing.cleanDemoMinutes(json(bad)), bad);
    assertNull(Marketing.cleanDemoMinutes(null));
  }

  @Test
  void aLinksCodeIsShortPlainAndLowerCase() {
    assertEquals("insta-bio", Marketing.cleanCode(" Insta-Bio "));
    for (String bad : List.of("a", "-abc", "a b", "<script>", "x".repeat(41))) assertNull(Marketing.cleanCode(bad), bad);
    assertNull(Marketing.cleanCode(null));
    assertEquals("instahram-bio", Marketing.codeFromName("Інстаграм, біо"));
    assertEquals("facebook-ads-spring-2026", Marketing.codeFromName("Facebook Ads / Spring 2026"));
    assertNull(Marketing.codeFromName("🚀"));
    assertTrue(Marketing.randomCode().matches("^[a-z0-9]{7}$"));
  }

  @Test
  void aNewLinkNeedsANameAndAMode() {
    assertEquals(new Marketing.Link("Флаєр у садочку", "flayer-u-sadochku", LinkMode.DEMO, ""), Marketing.cleanLink(json("{'name':' Флаєр у садочку ','mode':'demo'}")).link());
    assertEquals("tt-1", Marketing.cleanLink(json("{'name':'TikTok','mode':'site','code':'TT-1'}")).link().code());
    assertEquals(ApiError.INVALID_NAME, Marketing.cleanLink(json("{'name':'','mode':'demo'}")).error());
    assertEquals(ApiError.INVALID_NAME, Marketing.cleanLink(null).error());
    assertEquals(ApiError.INVALID_MODE, Marketing.cleanLink(json("{'name':'x','mode':'game'}")).error());
    assertEquals(ApiError.INVALID_CODE, Marketing.cleanLink(json("{'name':'x','mode':'demo','code':'a b'}")).error());
    assertTrue(Marketing.cleanLink(json("{'name':'🚀','mode':'demo'}")).link().code().matches("^[a-z0-9]{7}$"));
  }

  @Test
  void anArrivalKeepsOnlyWhatIsPlainlyWritten() {
    assertEquals(
        new Marketing.Visit("insta-bio", LinkMode.SITE, VisitVia.LINK, "pl", "l.instagram.com", null),
        Marketing.cleanVisit(json("{'link':'Insta-Bio','mode':'site','via':'link','lang':'PL','referrer':'L.Instagram.com'}")));
    assertEquals(
        new Marketing.Visit(null, LinkMode.DEMO, VisitVia.LINK, "en", null, null),
        Marketing.cleanVisit(json("{'link':'<x>','mode':'admin','via':'magic','lang':'english','referrer':'a b'}")));
    // A game's page on the site leads straight into that game — and only what is written like a game's id is kept.
    assertEquals(
        new Marketing.Visit(null, LinkMode.DEMO, VisitVia.PAGE, "pl", null, "geography:flags"),
        Marketing.cleanVisit(json("{'mode':'demo','via':'page','lang':'pl','game':' geography:flags '}")));
    assertNull(Marketing.cleanVisit(json("{'mode':'demo','game':'../admin'}")).game());
    assertEquals(LinkMode.DEMO, Marketing.cleanVisit(null).mode());
  }

  @Test
  void theDeviceIsReadOffTheBrowsersName() {
    assertEquals(Device.MOBILE, Marketing.deviceOf("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148"));
    assertEquals(Device.TABLET, Marketing.deviceOf("Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit Safari"));
    assertEquals(Device.DESKTOP, Marketing.deviceOf("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari"));
    assertNull(Marketing.deviceOf(""));
  }

  // ---- letters -----------------------------------------------------------------

  private static String photo(long size, String name) {
    return "{'name':'" + name + "','type':'image/jpeg','size':" + size + "}";
  }

  private static FeedbackRules.Checked letter(String... files) {
    return FeedbackRules.validateLetter(json("{'message':'hello there','files':[" + String.join(",", files) + "]}"));
  }

  @Test
  void aLetterNeedsAFewWordsAndIfGivenARealAddress() {
    assertEquals(ApiError.MESSAGE_TOO_SHORT, FeedbackRules.validateLetter(json("{'message':' hi '}")).error());
    assertEquals(ApiError.MESSAGE_TOO_LONG, FeedbackRules.validateLetter(json("{'message':'" + "x".repeat(4001) + "'}")).error());
    assertEquals(ApiError.INVALID_EMAIL, FeedbackRules.validateLetter(json("{'message':'hello there','email':'nobody@'}")).error());
    assertEquals(
        new FeedbackRules.Draft(FeedbackKind.IDEA, "hello there", "a@b.ua", List.of()),
        FeedbackRules.validateLetter(json("{'kind':'idea','message':' hello there ','email':' a@b.ua '}")).letter());
    assertEquals(FeedbackKind.OTHER, FeedbackRules.validateLetter(json("{'kind':'nonsense','message':'hello there'}")).letter().kind());
  }

  @Test
  void onlyPhotosAndVideosWithinTheLimits() {
    long max = FeedbackRules.MAX_FILE_BYTES;
    assertEquals(ApiError.INVALID_FILE_TYPE, letter("{'name':'a.exe','type':'application/x-msdownload','size':10}").error());
    assertEquals(ApiError.FILE_TOO_BIG, letter(photo(max + 1, "a.jpg")).error());
    assertEquals(ApiError.FILE_TOO_BIG, letter(photo(0, "a.jpg")).error());
    assertEquals(ApiError.TOO_MANY_FILES, letter(photo(1, "a"), photo(1, "a"), photo(1, "a"), photo(1, "a"), photo(1, "a"), photo(1, "a")).error());
    assertEquals(ApiError.FILES_TOO_BIG, letter(photo(max, "a.jpg"), photo(FeedbackRules.MAX_TOTAL_BYTES - max + 1, "b.jpg")).error());
    assertNull(letter(photo(max, "a.jpg"), photo(FeedbackRules.MAX_TOTAL_BYTES - max, "b.jpg")).error());
  }

  @Test
  void aFileNameCannotCarryAPath() {
    ObjectNode body = Json.object();
    body.put("message", "hello there");
    for (String name : List.of("../../etc/фото 1.jpg", "C:\\x\\..hidden.jpg", "")) {
      body.withArray("files").addObject().put("name", name).put("type", "image/jpeg").put("size", 5);
    }
    assertEquals(List.of("фото 1.jpg", "hidden.jpg", "file-3"), FeedbackRules.validateLetter(body).letter().files().stream().map(FeedbackRules.FileInfo::name).toList());
  }

  @Test
  void piecesGluedTogetherAreValidBase64() {
    assertEquals(0, FeedbackRules.PART_BYTES % 3);
    byte[] whole = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
    String glued = Base64.getEncoder().encodeToString(java.util.Arrays.copyOfRange(whole, 0, 6)) + Base64.getEncoder().encodeToString(java.util.Arrays.copyOfRange(whole, 6, 10));
    assertEquals(List.of((byte) 0, (byte) 9), List.of(Base64.getDecoder().decode(glued)[0], Base64.getDecoder().decode(glued)[9]));
    assertEquals(1, FeedbackRules.partCount(FeedbackRules.PART_BYTES));
    assertEquals(2, FeedbackRules.partCount(FeedbackRules.PART_BYTES + 1));
  }

  @Test
  void aPieceIsTakenOnlyForAnOpenLetterAndAFileItAnnounced() {
    long now = System.currentTimeMillis();
    String createdAt = Json.iso(Instant.ofEpochMilli(now));
    List<FeedbackRules.FileInfo> files = List.of(new FeedbackRules.FileInfo("a.jpg", "image/jpeg", FeedbackRules.PART_BYTES + 1));
    assertTrue(FeedbackRules.validPart(files, false, createdAt, json("0"), json("1"), json("'AAAA'"), now));
    assertFalse(FeedbackRules.validPart(files, false, createdAt, json("0"), json("2"), json("'AAAA'"), now));
    assertFalse(FeedbackRules.validPart(files, false, createdAt, json("1"), json("0"), json("'AAAA'"), now));
    assertFalse(FeedbackRules.validPart(files, false, createdAt, json("0"), json("0"), json("'not base64!'"), now));
    assertFalse(FeedbackRules.validPart(files, false, createdAt, json("0"), json("0"), json("'" + "A".repeat(FeedbackRules.PART_CHARS + 4) + "'"), now));
    assertFalse(FeedbackRules.validPart(files, true, createdAt, json("0"), json("0"), json("'AAAA'"), now));
    assertFalse(FeedbackRules.validPart(files, false, createdAt, json("0"), json("0"), json("'AAAA'"), now + FeedbackRules.UPLOAD_WINDOW_MS));
  }

  // ---- what is offered where -----------------------------------------------------

  private static final ObjectNode CONFIG = Availability.clean(json("""
      {
        'regions': [
          { 'id': 'north-america', 'name': 'Північна Америка', 'countries': ['us', 'CA', 'usa', 'US'] },
          { 'id': 'Bad Id', 'name': 'x', 'countries': ['DE'] }
        ],
        'langRules': [
          { 'where': ['@north-america'], 'site': ['en'], 'game': ['EN'] },
          { 'where': ['PL', '@nowhere'], 'site': ['pl', 'en'], 'game': [] },
          { 'where': [], 'site': ['uk'], 'game': ['uk'] },
          { 'where': ['DE'], 'site': [], 'game': [] }
        ],
        'items': {
          'game:math:shop': { 'status': 'soon' },
          'game:history:poland_people': { 'status': 'on', 'scope': 'only', 'where': ['PL'] },
          'game:geography:flags': { 'status': 'on', 'scope': 'except', 'where': ['@north-america', 'pl'] },
          'galaxy:art': { 'status': 'hidden' },
          'galaxy:music': { 'status': 'soon', 'scope': 'only', 'where': ['US'] },
          'game:math:add': { 'status': 'on', 'scope': 'only', 'where': [] },
          'not a key': { 'status': 'hidden' }
        }
      }"""));

  @SuppressWarnings("unchecked")
  private static List<String> listed(Map<String, Object> view, String kind, String state) {
    return ((Map<String, List<String>>) view.get(kind)).get(state).stream().sorted().toList();
  }

  @Test
  void theRulesAreKeptClean() {
    assertEquals(json("[{'id':'north-america','name':'Північна Америка','countries':['US','CA']}]"), CONFIG.get("regions"));
    assertEquals(json("[{'where':['@north-america'],'site':['en'],'game':['en']},{'where':['PL'],'site':['pl','en'],'game':[]}]"), CONFIG.get("langRules"));
    assertEquals(
        List.of("galaxy:art", "galaxy:music", "game:geography:flags", "game:history:poland_people", "game:math:shop"),
        CONFIG.get("items").properties().stream().map(Map.Entry::getKey).sorted().toList());
    assertEquals(Availability.empty(), Availability.clean(null));
    assertEquals(CONFIG, Availability.clean(CONFIG));
  }

  @Test
  void aVisitorFromTheUnitedStatesGetsEnglishOnlyAndWhatIsTheirs() {
    Map<String, Object> us = Availability.forCountry(CONFIG, "US");
    assertEquals(Json.map("site", List.of("en"), "game", List.of("en")), us.get("langs"));
    assertEquals(List.of("geography:flags", "history:poland_people"), listed(us, "games", "hidden"));
    assertEquals(List.of("math:shop"), listed(us, "games", "soon"));
    assertEquals(List.of("art"), listed(us, "galaxies", "hidden"));
    assertEquals(List.of("music"), listed(us, "galaxies", "soon"));
  }

  @Test
  void aRuleMayLimitTheSiteAndLeaveTheGameAlone() {
    Map<String, Object> pl = Availability.forCountry(CONFIG, "PL");
    assertEquals(Json.map("site", List.of("pl", "en"), "game", null), pl.get("langs"));
    assertEquals(List.of("geography:flags"), listed(pl, "games", "hidden"));
    assertEquals(List.of("art", "music"), listed(pl, "galaxies", "hidden"));
  }

  @Test
  void elsewhereAndWhereTheCountryIsNotKnownNoPlaceMatches() {
    for (String country : new String[] {"UA", null}) {
      Map<String, Object> there = Availability.forCountry(CONFIG, country);
      assertEquals(Json.map("site", null, "game", null), there.get("langs"));
      assertEquals(List.of("history:poland_people"), listed(there, "games", "hidden"));
      assertEquals(List.of("math:shop"), listed(there, "games", "soon"));
      assertEquals(List.of("art", "music"), listed(there, "galaxies", "hidden"));
      assertEquals(List.of(), listed(there, "galaxies", "soon"));
    }
    assertEquals(
        "{\"langs\":{\"site\":null,\"game\":null},\"games\":{\"hidden\":[],\"soon\":[]},\"galaxies\":{\"hidden\":[],\"soon\":[]}}",
        Json.write(Availability.forCountry(Availability.empty(), "US")));
  }
}
