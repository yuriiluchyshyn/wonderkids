package com.pulsarkids.api.data.entity;

import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PostLoad;
import jakarta.persistence.PostPersist;
import jakarta.persistence.Transient;
import org.springframework.data.domain.Persistable;

/**
 * A row whose key is given, not generated, and which is only ever written as a
 * new one (a child's lists are deleted and written again on every save). Saying
 * so spares Spring Data a SELECT per row and lets Hibernate insert in batches.
 */
@MappedSuperclass
public abstract class FreshRow<K> implements Persistable<K> {
  @Transient
  private boolean fresh = true;

  @Override
  public boolean isNew() {
    return fresh;
  }

  @PostLoad
  @PostPersist
  void stored() {
    fresh = false;
  }
}
