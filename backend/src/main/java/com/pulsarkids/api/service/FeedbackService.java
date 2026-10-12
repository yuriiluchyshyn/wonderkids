package com.pulsarkids.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.pulsarkids.api.core.FeedbackRules;
import com.pulsarkids.api.core.Json;
import com.pulsarkids.api.data.entity.Feedback;
import com.pulsarkids.api.data.entity.FeedbackReply;
import com.pulsarkids.api.data.repo.FeedbackPartRepository;
import com.pulsarkids.api.data.repo.FeedbackReplyRepository;
import com.pulsarkids.api.data.repo.FeedbackRepository;
import com.pulsarkids.api.model.FeedbackStatus;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.model.Lang;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Letters from the public site: the text is kept, the files wait here only until the email with them has left. */
@Service
@RequiredArgsConstructor
public class FeedbackService {
  private final FeedbackRepository letters;
  private final FeedbackPartRepository parts;
  private final FeedbackReplyRepository replies;

  /** The files a letter announced. */
  public static List<FeedbackRules.FileInfo> filesOf(Feedback letter) {
    List<FeedbackRules.FileInfo> files = new ArrayList<>();
    if (letter.getFiles() != null && letter.getFiles().isArray()) {
      for (JsonNode file : letter.getFiles()) files.add(new FeedbackRules.FileInfo(file.path(Fields.NAME).asText(), file.path(Fields.TYPE).asText(), file.path(Fields.SIZE).asLong()));
    }
    return files;
  }

  private static Map<String, Object> present(Feedback row) {
    return Json.map(
        Fields.ID, row.getId(),
        Fields.KIND, row.getKind(),
        Fields.MESSAGE, row.getMessage(),
        Fields.EMAIL, row.getEmail(),
        Fields.FILES, row.getFiles() == null ? Json.array() : row.getFiles(),
        Fields.STATUS, row.getStatus(),
        Fields.CLOSED, row.isClosed(),
        Fields.MAILED_AT, Json.iso(row.getMailedAt()),
        Fields.MAIL_ERROR, row.getMailError(),
        Fields.USER_AGENT, row.getUserAgent(),
        Fields.CREATED_AT, Json.iso(row.getCreatedAt()));
  }

  @Transactional(readOnly = true)
  public FeedbackRepository.Recent countRecent(String ipHash) {
    return letters.countRecent(ipHash);
  }

  /** Store a letter. `closed: false` leaves it open for its files to arrive. */
  @Transactional
  public Feedback create(FeedbackRules.Draft draft, boolean closed, String ipHash, String userAgent, Lang lang) {
    // Files nobody came back for (a failed delivery, a closed tab).
    parts.deleteStale();
    Feedback letter = new Feedback();
    letter.setKind(draft.kind().wire());
    letter.setLang(lang.getCode());
    letter.setMessage(draft.message());
    letter.setEmail(draft.email());
    letter.setFiles(Json.MAPPER.valueToTree(draft.files()));
    letter.setClosed(closed);
    letter.setIpHash(ipHash);
    letter.setUserAgent(userAgent);
    return letters.save(letter);
  }

  @Transactional(readOnly = true)
  public Feedback get(int id) {
    return letters.findById(id).orElse(null);
  }

  /** One base64 piece of an attached file; sending a piece again replaces it. */
  @Transactional
  public void savePart(int id, int fileNo, int partNo, String data) {
    parts.upsert(id, fileNo, partNo, data);
  }

  /** No more files will come. False when the letter was closed already. */
  @Transactional
  public boolean close(int id) {
    return letters.close(id) > 0;
  }

  /** The pieces of one attached file, in order (base64). */
  @Transactional(readOnly = true)
  public List<String> fileParts(int id, int fileNo) {
    return parts.piecesOf(id, fileNo);
  }

  /** The letter reached the mailbox (its files are dropped) or did not (`error`). */
  @Transactional
  public void markMailed(int id, String error) {
    if (error != null) {
      letters.setMailError(id, error.length() > 300 ? error.substring(0, 300) : error);
      return;
    }
    letters.markMailed(id, Instant.now());
    parts.deleteOf(id);
  }

  /** Every letter with its replies, newest first. */
  @Transactional(readOnly = true)
  public List<Map<String, Object>> list() {
    List<FeedbackReply> allReplies = replies.findAllByOrderByIdAsc();
    Set<Integer> withFiles = new HashSet<>(parts.lettersWithFiles());
    List<Map<String, Object>> out = new ArrayList<>();
    for (Feedback row : letters.findTop500ByOrderByIdDesc()) {
      Map<String, Object> letter = present(row);
      // The attached files are still here, so the letter can be sent once more.
      letter.put(Fields.FILES_WAITING, withFiles.contains(row.getId()));
      letter.put(Fields.REPLIES, allReplies.stream()
          .filter((r) -> row.getId().equals(r.getFeedbackId()))
          .map((r) -> Json.map(Fields.ID, r.getId(), Fields.BODY, r.getBody(), Fields.MAILED, r.isMailed(), Fields.CREATED_AT, Json.iso(r.getCreatedAt())))
          .toList());
      out.add(letter);
    }
    return out;
  }

  @Transactional
  public void addReply(int id, String body, boolean mailed) {
    FeedbackReply reply = new FeedbackReply();
    reply.setFeedbackId(id);
    reply.setBody(body);
    reply.setMailed(mailed);
    replies.saveAndFlush(reply);
    letters.markAnswered(id);
  }

  @Transactional
  public boolean setStatus(int id, FeedbackStatus status) {
    return letters.setStatus(id, status.wire()) > 0;
  }

  @Transactional
  public boolean delete(int id) {
    return letters.remove(id) > 0;
  }
}
