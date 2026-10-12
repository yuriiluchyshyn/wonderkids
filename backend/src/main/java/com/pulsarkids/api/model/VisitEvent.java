package com.pulsarkids.api.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.Accessors;

/** What may happen to a trial game later: its time ran out, «create an account» was pressed. */
@Getter
@Accessors(fluent = true)
@RequiredArgsConstructor
public enum VisitEvent implements Wire {
  EXPIRED("expired"),
  CTA("cta");

  private final String wire;
}
