package com.pulsarkids.api.data.entity;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A family goal: so many artifacts for such a reward. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "wk_milestones")
public class Milestone extends FreshRow<Milestone.Key> {
  @Embeddable
  public record Key(String childId, String milestoneId) {}

  @EmbeddedId
  private Key id;

  private int amount = 1;
  private String reward = "";
  private int sortIndex;

  public Milestone(String childId, String milestoneId, int amount, String reward, int sortIndex) {
    this.id = new Key(childId, milestoneId);
    this.amount = amount;
    this.reward = reward;
    this.sortIndex = sortIndex;
  }
}
