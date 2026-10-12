package com.pulsarkids.api.data.repo;

import com.pulsarkids.api.data.entity.FeedbackReply;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedbackReplyRepository extends JpaRepository<FeedbackReply, Integer> {
  List<FeedbackReply> findAllByOrderByIdAsc();
}
