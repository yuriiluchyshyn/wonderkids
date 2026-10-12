package com.pulsarkids.api.data.entity;

import com.pulsarkids.api.model.Gender;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

/** One child profile of an account. Its id is made by the browser that created it. */
@Getter
@Setter
@Entity
@Table(name = "wk_children")
public class Child {
  @Id
  private String id;

  private Integer parentId;
  private int sortIndex;
  private String name;
  /** Unique across all accounts: the child signs in with it. */
  private String nickname;
  private String email;
  private String pin = "";
  private String password = "";
  private String gender = Gender.GIRL.wire();
  private Integer birthYear;
  private Integer birthMonth;
  /** NULL until the child picks a world. */
  private String themeId;

  @Column(updatable = false)
  private Instant createdAt = Instant.now();
}
