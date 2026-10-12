package com.pulsarkids.api.data.entity;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** One key of a child's `treasures`: a treasure, a thing built in the world, a tip seen. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "wk_child_treasures")
public class ChildTreasure extends FreshRow<ChildTreasure.Key> {
  @Embeddable
  public record Key(String childId, String treasureKey) {}

  @EmbeddedId
  private Key id;

  public ChildTreasure(String childId, String treasureKey) {
    this.id = new Key(childId, treasureKey);
  }
}
