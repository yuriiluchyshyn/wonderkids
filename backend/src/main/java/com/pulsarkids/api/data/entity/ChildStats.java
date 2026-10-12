package com.pulsarkids.api.data.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "wk_child_stats")
public class ChildStats {
  @Id
  private String childId;

  private int artifacts;
  private int tasksCompleted;
  private int hintsSurfaced;
}
