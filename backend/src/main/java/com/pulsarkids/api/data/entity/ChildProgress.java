package com.pulsarkids.api.data.entity;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** The path step a child has reached in one game (or `…#plays` — levels played). */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "wk_child_progress")
public class ChildProgress extends FreshRow<ChildProgress.Key> {
  @Embeddable
  public record Key(String childId, String moduleId, String subId) {}

  @EmbeddedId
  private Key id;

  private int step = 1;

  public ChildProgress(String childId, String moduleId, String subId, int step) {
    this.id = new Key(childId, moduleId, subId);
    this.step = step;
  }
}
