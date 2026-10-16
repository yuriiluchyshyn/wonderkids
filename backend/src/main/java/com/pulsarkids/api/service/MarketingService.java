package com.pulsarkids.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.BooleanNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.pulsarkids.api.core.Availability;
import com.pulsarkids.api.core.Json;
import com.pulsarkids.api.core.Marketing;
import com.pulsarkids.api.data.entity.Link;
import com.pulsarkids.api.data.entity.Setting;
import com.pulsarkids.api.data.entity.Visit;
import com.pulsarkids.api.data.repo.LinkRepository;
import com.pulsarkids.api.data.repo.ParentRepository;
import com.pulsarkids.api.data.repo.SettingRepository;
import com.pulsarkids.api.data.repo.VisitRepository;
import com.pulsarkids.api.model.Device;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.model.VisitEvent;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * The owner's links, the visits by them, and the product's settings — among
 * them the rules of what is offered where (`Availability`).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MarketingService {
  public static final String DEMO_MINUTES_KEY = "demo_minutes";
  public static final String AVAILABILITY_KEY = "availability";
  /**
   * The paid mode — off until the owner switches it on (`/admin/settings`). Off,
   * Pulsar Kids is wholly free and nothing of paying is seen anywhere: no page of
   * prices, no links to it, no plans served, no limit, no paywall. Every paid
   * feature asks `paidModeOn()` first.
   */
  public static final String PAID_MODE_KEY = "paid_mode";
  /** Whether a family gets a letter with its invoice after every payment — on unless the owner switched it off. */
  public static final String INVOICE_EMAILS_KEY = "invoice_emails";

  /** The owner's rules are read at most this often by one running instance; a change shows within it. */
  private static final long RULES_TTL_MS = 30_000;
  /**
   * The paid mode is read at most this often by one running instance. Vercel runs
   * several instances at once and a save reaches only one of them, so the others
   * learn it within this — kept short, the switch is pressed and looked at.
   */
  private static final long PAID_MODE_TTL_MS = 10_000;

  private final SettingRepository settings;
  private final LinkRepository links;
  private final VisitRepository visits;
  private final ParentRepository parents;
  private final SchemaService schema;
  private final TransactionTemplate tx;

  private volatile ObjectNode rules;
  private volatile long rulesAt;
  private volatile Boolean paidMode;
  private volatile long paidModeAt;

  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------

  /** One setting of the product, or null when it was never set. */
  @Transactional(readOnly = true)
  public JsonNode setting(String key) {
    return settings.findById(key).map((row) -> row.getValue()).orElse(null);
  }

  @Transactional
  public void setSetting(String key, JsonNode value) {
    Setting row = settings.findById(key).orElseGet(() -> {
      Setting made = new Setting();
      made.setKey(key);
      return made;
    });
    row.setValue(value);
    row.setUpdatedAt(Instant.now());
    settings.save(row);
  }

  /** How long the trial game lasts, in minutes — the owner's setting, or the default. */
  public int demoMinutes() {
    Integer minutes = Marketing.cleanDemoMinutes(tx.execute((status) -> settings.findById(DEMO_MINUTES_KEY).map((row) -> row.getValue()).orElse(null)));
    return minutes == null ? Marketing.DEMO_MINUTES_DEFAULT : minutes;
  }

  /**
   * Whether the paid mode is on, for the site and the game: read at most every
   * `PAID_MODE_TTL_MS`; never throws — with the database out of reach everything
   * stays free, as it is until the owner switches the mode on.
   */
  public boolean paidModeOn() {
    Boolean kept = paidMode;
    if (kept != null && System.currentTimeMillis() - paidModeAt < PAID_MODE_TTL_MS) return kept;
    try {
      boolean on = paidModeStored();
      paidMode = on;
      paidModeAt = System.currentTimeMillis();
      return on;
    } catch (Exception err) {
      log.error("[billing] paid mode not read: {}", err.getMessage());
      return false;
    }
  }

  /**
   * The paid mode as the database has it this moment, never a cached copy — what
   * the admin panel shows: an instance that has not yet re-read the switch must
   * not show the owner the old value just after they saved the new one.
   */
  public boolean paidModeStored() {
    schema.ensure();
    JsonNode value = tx.execute((status) -> settings.findById(PAID_MODE_KEY).map((row) -> row.getValue()).orElse(null));
    return value != null && value.isBoolean() && value.booleanValue();
  }

  /** Whether invoices are mailed to the families: on unless the owner switched it off. Read anew each time — a webhook is rare. */
  public boolean invoiceEmailsOn() {
    schema.ensure();
    JsonNode value = tx.execute((status) -> settings.findById(INVOICE_EMAILS_KEY).map((row) -> row.getValue()).orElse(null));
    return value == null || !value.isBoolean() || value.booleanValue();
  }

  public void setInvoiceEmails(boolean on) {
    setSetting(INVOICE_EMAILS_KEY, BooleanNode.valueOf(on));
  }

  /** The owner switched the paid mode on or off: this instance knows it at once, the others within `PAID_MODE_TTL_MS`. */
  public void setPaidMode(boolean on) {
    setSetting(PAID_MODE_KEY, BooleanNode.valueOf(on));
    paidMode = on;
    paidModeAt = System.currentTimeMillis();
  }

  // ---------------------------------------------------------------------------
  // What is offered to a visitor
  // ---------------------------------------------------------------------------

  /** The owner's rules, clean. Throws when the database cannot be read. */
  public ObjectNode availabilityRules() {
    ObjectNode kept = rules;
    if (kept != null && System.currentTimeMillis() - rulesAt < RULES_TTL_MS) return kept;
    schema.ensure();
    ObjectNode config = Availability.clean(tx.execute((status) -> settings.findById(AVAILABILITY_KEY).map((row) -> row.getValue()).orElse(null)));
    rules = config;
    rulesAt = System.currentTimeMillis();
    return config;
  }

  /** The rules were just changed: this instance reads them anew at once. */
  public void forgetAvailabilityRules() {
    rules = null;
  }

  /**
   * What the site and the game offer a visitor from `country`. Never throws:
   * with the database out of reach nothing is restricted — the game must open.
   */
  public Map<String, Object> availabilityOf(String country) {
    try {
      return Availability.forCountry(availabilityRules(), country);
    } catch (Exception err) {
      log.error("[availability] rules not read: {}", err.getMessage());
      return Availability.forCountry(Availability.empty(), country);
    }
  }

  // ---------------------------------------------------------------------------
  // Links and visits
  // ---------------------------------------------------------------------------

  /**
   * Every link, newest first, with what it has brought: arrivals, different
   * visitors, trial games played to the end, «create an account» presses and
   * the accounts created by it.
   */
  @Transactional(readOnly = true)
  public List<Map<String, Object>> listLinks() {
    Map<String, VisitRepository.LinkStats> stats = new HashMap<>();
    for (VisitRepository.LinkStats row : visits.statsByLink()) stats.put(row.getLinkCode(), row);
    Map<String, Long> accounts = new HashMap<>();
    for (Object[] row : parents.countBySignupLink()) accounts.put((String) row[0], (Long) row[1]);

    List<Map<String, Object>> out = new ArrayList<>();
    for (Link link : links.findAllByOrderByCreatedAtDesc()) {
      VisitRepository.LinkStats s = stats.get(link.getCode());
      out.add(Json.map(
          Fields.ID, link.getId(),
          Fields.CODE, link.getCode(),
          Fields.NAME, link.getName(),
          Fields.MODE, link.getMode(),
          Fields.NOTE, link.getNote(),
          Fields.CREATED_AT, Json.iso(link.getCreatedAt()),
          Fields.VISITS, s == null ? 0 : s.getVisits(),
          Fields.VISITORS, s == null ? 0 : s.getVisitors(),
          Fields.DEMOS, s == null ? 0 : s.getDemos(),
          Fields.EXPIRED, s == null ? 0 : s.getExpired(),
          Fields.CTA, s == null ? 0 : s.getCta(),
          Fields.ACCOUNTS, accounts.getOrDefault(link.getCode(), 0L),
          Fields.LAST_VISIT_AT, s == null ? null : Json.iso(s.getLastVisitAt())));
    }
    return out;
  }

  /** Is there a link with this code? */
  @Transactional(readOnly = true)
  public boolean linkExists(String code) {
    return links.existsByCode(code);
  }

  /** False when the code is already taken. */
  @Transactional
  public boolean createLink(Marketing.Link link) {
    return links.insertIfFree(link.code(), link.name(), link.mode().wire(), link.note()) > 0;
  }

  /** A link's name and note may change; its code and mode are what was handed out. */
  @Transactional
  public boolean renameLink(int id, String name, String note) {
    return links.rename(id, name, note) > 0;
  }

  /** The visits it brought stay in the statistics under its code. */
  @Transactional
  public boolean deleteLink(int id) {
    return links.remove(id) > 0;
  }

  /** How many arrivals this visitor has had counted within the last hour. */
  @Transactional(readOnly = true)
  public int countRecentVisits(String visitor) {
    return visits.countByVisitorAndCreatedAtAfter(visitor, Instant.now().minus(Duration.ofHours(1)));
  }

  /** Count an arrival; returns its id. */
  @Transactional
  public long recordVisit(Marketing.Visit arrival, String country, Device device, String visitor) {
    Visit visit = new Visit();
    visit.setLinkCode(arrival.link());
    visit.setMode(arrival.mode().wire());
    visit.setVia(arrival.via().wire());
    visit.setCountry(country);
    visit.setLang(arrival.lang());
    visit.setDevice(device == null ? null : device.wire());
    visit.setReferrer(arrival.referrer());
    visit.setGame(arrival.game());
    visit.setVisitor(visitor);
    return visits.save(visit).getId();
  }

  /** What became of a trial game: its time ran out (`expired`) or «create an account» was pressed (`cta`). Kept once. */
  @Transactional
  public void markVisit(long id, VisitEvent event) {
    if (event == VisitEvent.CTA) visits.markCta(id, Instant.now());
    else visits.markExpired(id, Instant.now());
  }

  /** Arrivals of the last `days` days (0 — all of them), newest first, at most `limit`. */
  @Transactional(readOnly = true)
  public List<Map<String, Object>> listVisits(int days, int limit) {
    Map<String, String> names = new HashMap<>();
    for (Link link : links.findAll()) names.put(link.getCode(), link.getName());
    List<Visit> rows = days == 0
        ? visits.findNewest(PageRequest.of(0, limit))
        : visits.findSince(Instant.now().minus(Duration.ofDays(days)), PageRequest.of(0, limit));

    List<Map<String, Object>> out = new ArrayList<>();
    for (Visit row : rows) {
      out.add(Json.map(
          Fields.ID, row.getId(),
          Fields.LINK, row.getLinkCode(),
          Fields.LINK_NAME, row.getLinkCode() == null ? null : names.get(row.getLinkCode()),
          Fields.MODE, row.getMode(),
          Fields.VIA, row.getVia(),
          Fields.COUNTRY, row.getCountry(),
          Fields.LANG, row.getLang(),
          Fields.DEVICE, row.getDevice(),
          Fields.REFERRER, row.getReferrer(),
          Fields.GAME, row.getGame(),
          // Only to tell visitors apart in the browser — a short piece of the hash.
          Fields.VISITOR, row.getVisitor().length() > 10 ? row.getVisitor().substring(0, 10) : row.getVisitor(),
          Fields.EXPIRED_AT, Json.iso(row.getExpiredAt()),
          Fields.CTA_AT, Json.iso(row.getCtaAt()),
          Fields.CREATED_AT, Json.iso(row.getCreatedAt())));
    }
    return out;
  }
}
