package com.pulsarkids.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.pulsarkids.api.core.Emails;
import com.pulsarkids.api.core.Json;
import com.pulsarkids.api.core.ScreenTime;
import com.pulsarkids.api.core.Source;
import com.pulsarkids.api.data.entity.Child;
import com.pulsarkids.api.data.entity.ChildProgress;
import com.pulsarkids.api.data.entity.ChildSettings;
import com.pulsarkids.api.data.entity.ChildStats;
import com.pulsarkids.api.data.entity.ChildTreasure;
import com.pulsarkids.api.data.entity.Milestone;
import com.pulsarkids.api.data.entity.Parent;
import com.pulsarkids.api.data.entity.ScreenTimeRow;
import com.pulsarkids.api.data.repo.ChildProgressRepository;
import com.pulsarkids.api.data.repo.ChildRepository;
import com.pulsarkids.api.data.repo.ChildSettingsRepository;
import com.pulsarkids.api.data.repo.ChildStatsRepository;
import com.pulsarkids.api.data.repo.ChildTreasureRepository;
import com.pulsarkids.api.data.repo.MilestoneRepository;
import com.pulsarkids.api.data.repo.ParentRepository;
import com.pulsarkids.api.data.repo.ScreenTimeRepository;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.ChildLoginStatus;
import com.pulsarkids.api.model.Currency;
import com.pulsarkids.api.model.Defaults;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.model.Gender;
import com.pulsarkids.api.model.Lang;
import com.pulsarkids.api.model.Text;
import com.pulsarkids.api.model.Wire;
import com.pulsarkids.api.web.HttpError;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Parent accounts, their children and the save.
 *
 * The client sends the save as one JSON object; here it is taken apart into
 * the normalised `wk_*` tables (`saveState`) and put together again
 * (`getState`). Adding a persisted field therefore touches the store types and
 * `migrateChild` on the client, and here the table (`schema.sql`), its entity
 * and both of those methods.
 */
@Service
@RequiredArgsConstructor
public class AccountService {
  private final ParentRepository parents;
  private final ChildRepository children;
  private final ChildSettingsRepository settingsRepo;
  private final ChildStatsRepository statsRepo;
  private final ChildProgressRepository progressRepo;
  private final ChildTreasureRepository treasureRepo;
  private final MilestoneRepository milestoneRepo;
  private final ScreenTimeRepository screenRepo;
  private final Messages messages;

  // ---------------------------------------------------------------------------
  // Accounts
  // ---------------------------------------------------------------------------

  /** The account that owns this mailbox, however the address was typed (or null). */
  @Transactional(readOnly = true)
  public Parent findParentByEmail(String email) {
    return parents.findByMailbox(Emails.key(email), Emails.normalise(email)).orElse(null);
  }

  /**
   * Create the account for a mailbox. Safe against a double submit: if another
   * request created it a moment ago, that account is returned instead.
   * `source` is where the parent came from, when the browser knew (or null).
   */
  @Transactional
  public Parent createParent(String email, Source source) {
    parents.insertIfAbsent(
        Emails.normalise(email),
        Emails.key(email),
        source == null ? null : source.source(),
        source == null ? null : source.medium(),
        source == null ? null : source.campaign(),
        source == null ? null : source.link());
    return parents.findByMailbox(Emails.key(email), Emails.normalise(email)).orElse(null);
  }

  /** Admin: remove an account with all its children and their data. False for an unknown account. */
  @Transactional
  public boolean deleteParent(int parentId) {
    if (!parents.existsById(parentId)) return false;
    // The children's tables cascade from wk_children, and wk_children from wk_parents.
    parents.deleteById(parentId);
    return true;
  }

  /** Is a child nickname free across all accounts? `exceptParentId` (may be null) is not counted. */
  @Transactional(readOnly = true)
  public boolean isNicknameAvailable(String nickname, Integer exceptParentId) {
    String nick = nickname.strip().toLowerCase();
    return exceptParentId == null ? !children.nicknameTaken(nick) : !children.nicknameTakenByOther(nick, exceptParentId);
  }

  /** How a child's sign-in ended, and — when it worked — whose child it is. */
  public record ChildLogin(ChildLoginStatus status, Integer parentId, String childId) {
    static ChildLogin failed(ChildLoginStatus status) {
      return new ChildLogin(status, null, null);
    }
  }

  

  /** Resolve a child login by unique nickname (or email) + parent-set PIN. */
  @Transactional(readOnly = true)
  public ChildLogin resolveChildLogin(String identifier, String pin) {
    String id = identifier == null ? "" : identifier.strip().toLowerCase();
    if (id.isEmpty()) return ChildLogin.failed(ChildLoginStatus.NOT_FOUND);
    List<Child> found = children.findByLogin(id);
    if (found.isEmpty()) return ChildLogin.failed(ChildLoginStatus.NOT_FOUND);
    for (Child child : found) {
      if ((child.getPin() == null ? "" : child.getPin()).equals(pin == null ? "" : pin)) return new ChildLogin(ChildLoginStatus.OK, child.getParentId(), child.getId());
    }
    return ChildLogin.failed(ChildLoginStatus.BAD_PIN);
  }

  /** Whether this child profile belongs to this parent account. */
  @Transactional(readOnly = true)
  public boolean ownsChild(int parentId, String childId) {
    return children.existsByIdAndParentId(childId, parentId);
  }

  // ---------------------------------------------------------------------------
  // The save: out of the tables
  // ---------------------------------------------------------------------------

  private static <T> Map<String, List<T>> grouped(List<T> rows, java.util.function.Function<T, String> childId) {
    Map<String, List<T>> map = new HashMap<>();
    for (T row : rows) map.computeIfAbsent(childId.apply(row), (key) -> new ArrayList<>()).add(row);
    return map;
  }

  private Map<String, Object> assembleChild(
      Child row, ChildSettings s, ChildStats st, ScreenTimeRow sc, List<ChildProgress> progressRows, List<ChildTreasure> treasureRows, List<Milestone> milestoneRows, int tzOffsetMin) {
    if (s == null) s = new ChildSettings();
    if (st == null) st = new ChildStats();
    if (sc == null) sc = new ScreenTimeRow();

    Map<String, Object> progress = new LinkedHashMap<>();
    for (ChildProgress p : progressRows) progress.put(p.getId().moduleId() + ":" + p.getId().subId(), p.getStep());

    // What the gauge shows before a game opens. The row holds the day the child
    // last played: a new day (in the child's own time zone) starts with a full
    // tank, and the time away has already given some of today's tank back. The
    // row itself is updated by the next /session/start.
    long now = System.currentTimeMillis();
    ScreenTime.State rested = ScreenTime.refillIfRested(
        ScreenTime.peek(
            new ScreenTime.State(sc.getDayKey(), sc.getMinutesUsedToday(), sc.getSessionElapsedMs(), sc.getCooldownUntil(), sc.getLastSessionEndedAt(), sc.getLastHeartbeatAt()),
            now,
            tzOffsetMin),
        new ScreenTime.Limits(s.getSessionDurationMin(), s.getCooldownMin(), s.getMaxDailyMin()),
        now);

    Map<String, Object> profile = Json.map(Fields.NAME, row.getName(), Fields.NICKNAME, row.getNickname() == null ? "" : row.getNickname(), Fields.PIN, row.getPin() == null ? "" : row.getPin());
    profile.put(Fields.EMAIL, row.getEmail() == null ? "" : row.getEmail());
    profile.put(Fields.PASSWORD, row.getPassword() == null ? "" : row.getPassword());
    // Not known — the field is not there at all (the client tells that from null).
    if (row.getBirthYear() != null) profile.put(Fields.BIRTH_YEAR, row.getBirthYear());
    if (row.getBirthMonth() != null) profile.put(Fields.BIRTH_MONTH, row.getBirthMonth());
    profile.put(Fields.GENDER, row.getGender());

    Map<String, Object> settings = Json.map(
        Fields.SOUND_ON, s.isSoundOn(),
        Fields.VOICE_ON, s.isVoiceOn(),
        Fields.SHOW_TEXT, s.isShowText(),
        Fields.COMPANION_SPEED, s.getCompanionSpeed(),
        Fields.CELEBRATION, s.getCelebration(),
        Fields.GAME_MODE, s.getGameMode(),
        Fields.MIN_TASKS_PER_LEVEL, s.getMinTasksPerLevel(),
        Fields.CHOICES_GRID_SIZE, s.getChoicesGridSize(),
        Fields.TTS_BUTTONS, s.isTtsButtons(),
        Fields.FUN_FACTS, s.isFunFacts(),
        Fields.CURRENCY, s.getCurrency() == null ? Currency.DEFAULT.wire() : s.getCurrency());
    if (s.getCurrencyChosen() != null) settings.put(Fields.CURRENCY_CHOSEN, s.getCurrencyChosen());
    settings.put(Fields.GAME_LANG, s.getGameLang());
    settings.put(Fields.VOICE_LANG, s.getVoiceLang());
    settings.put(Fields.HIDDEN_GAMES, s.getHiddenGames() != null && s.getHiddenGames().isArray() ? s.getHiddenGames() : Json.array());
    settings.put(Fields.VOICE, s.getVoice() != null && !s.getVoice().isNull() ? s.getVoice() : Json.object());
    settings.put(Fields.TIME_CONTROL, Json.map(
        Fields.SESSION_DURATION_MINUTES, s.getSessionDurationMin(),
        Fields.COOLDOWN_MINUTES, s.getCooldownMin(),
        Fields.MAX_DAILY_MINUTES, s.getMaxDailyMin()));

    List<String> treasures = new ArrayList<>();
    for (ChildTreasure t : treasureRows) treasures.add(t.getId().treasureKey());
    List<Map<String, Object>> milestones = new ArrayList<>();
    for (Milestone m : milestoneRows) milestones.add(Json.map(Fields.ID, m.getId().milestoneId(), Fields.AMOUNT, m.getAmount(), Fields.REWARD, m.getReward()));

    return Json.map(
        Fields.ID, row.getId(),
        Fields.PROFILE, profile,
        Fields.THEME_ID, row.getThemeId(),
        Fields.ARTIFACTS, st.getArtifacts(),
        Fields.TASKS_COMPLETED, st.getTasksCompleted(),
        Fields.HINTS_SURFACED, st.getHintsSurfaced(),
        Fields.PROGRESS, progress,
        Fields.TREASURES, treasures,
        Fields.MILESTONES, milestones,
        Fields.SETTINGS, settings,
        Fields.SCREEN_TIME, Json.map(
            Fields.DAY_KEY, rested.dayKey(),
            Fields.MINUTES_USED_TODAY, Json.tidy(rested.minutesUsedToday()),
            Fields.SESSION_ELAPSED_MS, Json.tidy(rested.sessionElapsedMs()),
            // Never running on load: the client opens a segment via /session/start.
            Fields.SESSION_STARTED_AT, null,
            Fields.COOLDOWN_UNTIL, rested.cooldownUntil(),
            Fields.LAST_SESSION_ENDED_AT, sc.getLastSessionEndedAt()));
  }

  /**
   * Load a parent's whole save, reassembled into the client blob (or null for
   * an unknown account). `tzOffsetMin` is the device's `Date#getTimezoneOffset()`:
   * it says which day it is for the child.
   */
  @Transactional(readOnly = true)
  public Map<String, Object> getState(int userId, int tzOffsetMin) {
    Parent parent = parents.findById(userId).orElse(null);
    if (parent == null) return null;

    List<Child> rows = children.findByParentIdOrderBySortIndexAscCreatedAtAsc(userId);
    List<Map<String, Object>> assembled = new ArrayList<>();
    if (!rows.isEmpty()) {
      List<String> ids = rows.stream().map((c) -> c.getId()).toList();
      Map<String, ChildSettings> settings = new HashMap<>();
      for (ChildSettings s : settingsRepo.findAllById(ids)) settings.put(s.getChildId(), s);
      Map<String, ChildStats> stats = new HashMap<>();
      for (ChildStats s : statsRepo.findAllById(ids)) stats.put(s.getChildId(), s);
      Map<String, ScreenTimeRow> screen = new HashMap<>();
      for (ScreenTimeRow s : screenRepo.findAllById(ids)) screen.put(s.getChildId(), s);
      Map<String, List<ChildProgress>> progress = grouped(progressRepo.findOf(ids), (p) -> p.getId().childId());
      Map<String, List<ChildTreasure>> treasures = grouped(treasureRepo.findOf(ids), (t) -> t.getId().childId());
      Map<String, List<Milestone>> milestones = grouped(milestoneRepo.findOf(ids), (m) -> m.getId().childId());

      for (Child row : rows) {
        assembled.add(assembleChild(
            row,
            settings.get(row.getId()),
            stats.get(row.getId()),
            screen.get(row.getId()),
            progress.getOrDefault(row.getId(), List.of()),
            treasures.getOrDefault(row.getId(), List.of()),
            milestones.getOrDefault(row.getId(), List.of()),
            tzOffsetMin));
      }
    }
    return Json.map(Fields.CHILDREN, assembled, Fields.ACTIVE_CHILD_ID, parent.getActiveChildId(), Fields.PARENT_LANG, parent.getLang());
  }

  // ---------------------------------------------------------------------------
  // The save: into the tables
  // ---------------------------------------------------------------------------

  private static String str(JsonNode node, String fallback) {
    return Json.present(node) ? node.asText() : fallback;
  }

  private static boolean bool(JsonNode node, boolean fallback) {
    return node != null && node.isBoolean() ? node.booleanValue() : fallback;
  }

  private static int whole(JsonNode node, int fallback) {
    if (!Json.present(node)) return fallback;
    double value = Json.number(node);
    return Double.isNaN(value) || Double.isInfinite(value) ? fallback : (int) Math.round(value);
  }

  private static Integer wholeOrNull(JsonNode node) {
    if (!Json.present(node)) return null;
    double value = Json.number(node);
    return Double.isNaN(value) || Double.isInfinite(value) ? null : (int) Math.round(value);
  }

  /** A non-empty text, trimmed and lower-cased, or null. */
  private static String lowerOrNull(JsonNode node) {
    String text = Json.present(node) ? node.asText().strip().toLowerCase() : "";
    return text.isEmpty() ? null : text;
  }

  /** The code of a language of ours, or null. */
  private static String langCode(JsonNode node) {
    Lang lang = Wire.of(Lang.class, node);
    return lang == null ? null : lang.getCode();
  }

  /**
   * Replace a parent's whole save by decomposing the client blob into tables.
   * Returns when it was saved (ISO). `lang` is the language of the request —
   * what a child without a name is called in.
   *
   * A child's id is made by the browser, so it proves nothing: a save may only
   * name children that are new or already this account's. One that names a
   * child of ANOTHER account is refused whole (`CHILD_ID_TAKEN`) and changes
   * nothing — it used to move that child, with its progress and its login,
   * over to the account that sent it.
   */
  @Transactional
  public String saveState(int userId, JsonNode state, Lang lang) {
    JsonNode list = Json.at(state, Fields.CHILDREN);
    List<JsonNode> kids = new ArrayList<>();
    Set<String> childIds = new LinkedHashSet<>();
    if (list.isArray()) {
      for (JsonNode c : list) {
        String id = str(Json.at(c, Fields.ID), "").strip();
        // A child without an id cannot be kept; one listed twice is kept once.
        if (!id.isEmpty() && childIds.add(id)) kids.add(c);
      }
    }

    if (!childIds.isEmpty() && children.existsByIdInAndParentIdNot(childIds, userId)) throw new HttpError(ApiError.CHILD_ID_TAKEN);

    // The children the save no longer lists are gone — before anything is loaded.
    if (childIds.isEmpty()) children.deleteAllOf(userId);
    else children.deleteOthers(userId, childIds);

    Parent parent = parents.findById(userId).orElse(null);
    if (parent != null) {
      parent.setActiveChildId(Json.text(Json.at(state, Fields.ACTIVE_CHILD_ID)));
      // Not chosen yet (null) — the column keeps what it had.
      String parentLang = langCode(Json.at(state, Fields.PARENT_LANG));
      if (parentLang != null) parent.setLang(parentLang);
    }

    int index = 0;
    for (JsonNode c : kids) {
      String id = str(c.get(Fields.ID), "").strip();
      JsonNode p = Json.at(c, Fields.PROFILE);
      JsonNode s = Json.at(c, Fields.SETTINGS);
      JsonNode tc = Json.at(s, Fields.TIME_CONTROL);

      Child child = children.findById(id).orElseGet(() -> {
        Child made = new Child();
        made.setId(id);
        return made;
      });
      child.setParentId(userId);
      child.setSortIndex(index);
      child.setName(str(p.get(Fields.NAME), messages.of(Text.CHILD_DEFAULT_NAME, lang)));
      child.setNickname(lowerOrNull(p.get(Fields.NICKNAME)));
      child.setEmail(lowerOrNull(p.get(Fields.EMAIL)));
      child.setPin(str(p.get(Fields.PIN), ""));
      child.setPassword(str(p.get(Fields.PASSWORD), ""));
      child.setGender(str(p.get(Fields.GENDER), Gender.GIRL.wire()));
      child.setBirthYear(wholeOrNull(p.get(Fields.BIRTH_YEAR)));
      child.setBirthMonth(wholeOrNull(p.get(Fields.BIRTH_MONTH)));
      child.setThemeId(Json.present(c.get(Fields.THEME_ID)) ? c.get(Fields.THEME_ID).asText() : null);
      // The child must be in its table before the rows that point at it.
      children.saveAndFlush(child);

      ChildSettings settings = settingsRepo.findById(id).orElseGet(() -> {
        ChildSettings made = new ChildSettings();
        made.setChildId(id);
        return made;
      });
      settings.setSoundOn(bool(s.get(Fields.SOUND_ON), true));
      settings.setVoiceOn(bool(s.get(Fields.VOICE_ON), true));
      settings.setShowText(bool(s.get(Fields.SHOW_TEXT), true));
      settings.setCompanionSpeed(str(s.get(Fields.COMPANION_SPEED), Defaults.COMPANION_SPEED));
      settings.setCelebration(str(s.get(Fields.CELEBRATION), Defaults.CELEBRATION));
      settings.setGameMode(str(s.get(Fields.GAME_MODE), Defaults.GAME_MODE));
      settings.setMinTasksPerLevel(whole(s.get(Fields.MIN_TASKS_PER_LEVEL), Defaults.MIN_TASKS_PER_LEVEL));
      settings.setChoicesGridSize(whole(s.get(Fields.CHOICES_GRID_SIZE), Defaults.CHOICES_GRID_SIZE));
      settings.setVoice(Json.present(s.get(Fields.VOICE)) ? s.get(Fields.VOICE) : Json.object());
      settings.setSessionDurationMin(whole(tc.get(Fields.SESSION_DURATION_MINUTES), Defaults.SESSION_MINUTES));
      settings.setCooldownMin(whole(tc.get(Fields.COOLDOWN_MINUTES), Defaults.COOLDOWN_MINUTES));
      settings.setMaxDailyMin(whole(tc.get(Fields.MAX_DAILY_MINUTES), Defaults.MAX_DAILY_MINUTES));
      settings.setTtsButtons(bool(s.get(Fields.TTS_BUTTONS), true));
      settings.setFunFacts(bool(s.get(Fields.FUN_FACTS), true));
      settings.setCurrency(Wire.of(Currency.class, s.get(Fields.CURRENCY), Currency.DEFAULT).wire());
      settings.setGameLang(langCode(s.get(Fields.GAME_LANG)));
      settings.setVoiceLang(langCode(s.get(Fields.VOICE_LANG)));
      ArrayNode hidden = Json.array();
      JsonNode hiddenGames = s.get(Fields.HIDDEN_GAMES);
      if (hiddenGames != null && hiddenGames.isArray()) {
        for (JsonNode game : hiddenGames) {
          if (game.isTextual() && hidden.size() < Defaults.MAX_HIDDEN_GAMES) hidden.add(game.textValue());
        }
      }
      settings.setHiddenGames(hidden);
      JsonNode chosen = s.get(Fields.CURRENCY_CHOSEN);
      settings.setCurrencyChosen(chosen != null && chosen.isBoolean() ? chosen.booleanValue() : null);
      settingsRepo.save(settings);

      ChildStats stats = statsRepo.findById(id).orElseGet(() -> {
        ChildStats made = new ChildStats();
        made.setChildId(id);
        return made;
      });
      stats.setArtifacts(whole(c.get(Fields.ARTIFACTS), 0));
      stats.setTasksCompleted(whole(c.get(Fields.TASKS_COMPLETED), 0));
      stats.setHintsSurfaced(whole(c.get(Fields.HINTS_SURFACED), 0));
      statsRepo.save(stats);

      // Play time is server-owned (see ScreenTimeService): a save only makes sure
      // the row exists and never overwrites what the server has counted.
      screenRepo.insertIfAbsent(id);

      progressRepo.deleteOf(id);
      List<ChildProgress> progress = new ArrayList<>();
      JsonNode progressNode = c.get(Fields.PROGRESS);
      if (progressNode != null && progressNode.isObject()) {
        for (Map.Entry<String, JsonNode> entry : progressNode.properties()) {
          int colon = entry.getKey().indexOf(':');
          if (colon <= 0) continue;
          int step = whole(entry.getValue(), 1);
          progress.add(new ChildProgress(id, entry.getKey().substring(0, colon), entry.getKey().substring(colon + 1), step == 0 ? 1 : step));
        }
      }
      progressRepo.saveAll(progress);

      treasureRepo.deleteOf(id);
      Set<String> treasureKeys = new LinkedHashSet<>();
      JsonNode treasuresNode = c.get(Fields.TREASURES);
      if (treasuresNode != null && treasuresNode.isArray()) {
        for (JsonNode t : treasuresNode) {
          if (t.isTextual() && !t.textValue().isEmpty()) treasureKeys.add(t.textValue());
        }
      }
      treasureRepo.saveAll(treasureKeys.stream().map((key) -> new ChildTreasure(id, key)).toList());

      milestoneRepo.deleteOf(id);
      List<Milestone> milestones = new ArrayList<>();
      JsonNode milestonesNode = c.get(Fields.MILESTONES);
      if (milestonesNode != null && milestonesNode.isArray()) {
        int m = 0;
        for (JsonNode ms : milestonesNode) {
          int place = m++;
          String milestoneId = str(Json.at(ms, Fields.ID), "");
          if (milestoneId.isEmpty()) continue;
          int amount = whole(Json.at(ms, Fields.AMOUNT), 1);
          milestones.add(new Milestone(id, milestoneId, amount == 0 ? 1 : amount, str(Json.at(ms, Fields.REWARD), ""), place));
        }
      }
      milestoneRepo.saveAll(milestones);

      index += 1;
    }

    return Json.iso(Instant.now());
  }

  // ---------------------------------------------------------------------------
  // Admin
  // ---------------------------------------------------------------------------

  /** Every account with its children and their progress, newest first. */
  @Transactional(readOnly = true)
  public List<Map<String, Object>> listAccounts() {
    Map<String, ChildStats> stats = new HashMap<>();
    for (ChildStats s : statsRepo.findAll()) stats.put(s.getChildId(), s);
    Map<String, ScreenTimeRow> screen = new HashMap<>();
    for (ScreenTimeRow s : screenRepo.findAll()) screen.put(s.getChildId(), s);
    Map<String, Map<String, Object>> progressByChild = new HashMap<>();
    for (ChildProgress p : progressRepo.findAll()) {
      progressByChild.computeIfAbsent(p.getId().childId(), (key) -> new LinkedHashMap<>()).put(p.getId().moduleId() + ":" + p.getId().subId(), p.getStep());
    }

    Map<Integer, List<Map<String, Object>>> childrenByParent = new HashMap<>();
    for (Child c : children.findAllByOrderByParentIdAscSortIndexAscCreatedAtAsc()) {
      ChildStats st = stats.getOrDefault(c.getId(), new ChildStats());
      ScreenTimeRow sc = screen.getOrDefault(c.getId(), new ScreenTimeRow());
      childrenByParent.computeIfAbsent(c.getParentId(), (key) -> new ArrayList<>()).add(Json.map(
          Fields.ID, c.getId(),
          Fields.NAME, c.getName(),
          Fields.NICKNAME, c.getNickname() == null ? "" : c.getNickname(),
          Fields.GENDER, c.getGender(),
          Fields.BIRTH_YEAR, c.getBirthYear(),
          Fields.BIRTH_MONTH, c.getBirthMonth(),
          Fields.THEME_ID, c.getThemeId(),
          Fields.CREATED_AT, Json.iso(c.getCreatedAt()),
          Fields.ARTIFACTS, st.getArtifacts(),
          Fields.TASKS_COMPLETED, st.getTasksCompleted(),
          Fields.HINTS_SURFACED, st.getHintsSurfaced(),
          Fields.PLAYED_TODAY_MINUTES, Json.tidy(sc.getMinutesUsedToday() + sc.getSessionElapsedMs() / 60_000.0),
          Fields.PLAYED_DAY, sc.getDayKey() == null ? "" : sc.getDayKey(),
          Fields.LAST_SESSION_ENDED_AT, sc.getLastSessionEndedAt(),
          Fields.PROGRESS, progressByChild.getOrDefault(c.getId(), Map.of())));
    }

    List<Map<String, Object>> accounts = new ArrayList<>();
    for (Parent p : parents.findAllByOrderByCreatedAtDesc()) {
      accounts.add(Json.map(
          Fields.ID, p.getId(),
          Fields.EMAIL, p.getEmail(),
          Fields.CREATED_AT, Json.iso(p.getCreatedAt()),
          // NULL key = an older row that shares its mailbox with another account.
          Fields.DUPLICATE_MAILBOX, p.getEmailKey() == null,
          Fields.DISABLED, p.isDisabled(),
          Fields.SPEECH_OFF, p.isTtsOff(),
          Fields.SPEECH_KEY_ID, p.getTtsKeyId(),
          // The channel that brought the account; null for one registered without a label.
          Fields.SIGNUP, p.getSignupSource() == null || p.getSignupSource().isEmpty()
              ? null
              : Json.map(Fields.SOURCE, p.getSignupSource(), Fields.MEDIUM, p.getSignupMedium(), Fields.CAMPAIGN, p.getSignupCampaign(), Fields.LINK, p.getSignupLink()),
          Fields.CHILDREN, childrenByParent.getOrDefault(p.getId(), List.of())));
    }
    return accounts;
  }

  /** Switch the cloud voice on/off for one account. False for an unknown account. */
  @Transactional
  public boolean setSpeechOff(int parentId, boolean off) {
    Parent parent = parents.findById(parentId).orElse(null);
    if (parent == null) return false;
    parent.setTtsOff(off);
    return true;
  }

  /**
   * Admin: switch an account off or back on. A switched-off account keeps
   * everything it has, but nobody signs in to it and its save is out of reach
   * (`requireEnabled`). False for an unknown account.
   */
  @Transactional
  public boolean setDisabled(int parentId, boolean disabled) {
    Parent parent = parents.findById(parentId).orElse(null);
    if (parent == null) return false;
    parent.setDisabled(disabled);
    return true;
  }

  /** Refuses an account the owner switched off: 403 `account_disabled`. */
  @Transactional(readOnly = true)
  public void requireEnabled(int parentId) {
    if (parents.findById(parentId).map(Parent::isDisabled).orElse(false)) throw new HttpError(ApiError.ACCOUNT_DISABLED);
  }
}
