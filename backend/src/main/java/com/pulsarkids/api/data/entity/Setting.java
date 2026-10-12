package com.pulsarkids.api.data.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** A setting of the whole product, set in the admin panel (one row each). */
@Getter
@Setter
@Entity
@Table(name = "wk_settings")
public class Setting {
  @Id
  private String key;

  @JdbcTypeCode(SqlTypes.JSON)
  private JsonNode value;

  private Instant updatedAt = Instant.now();
}
