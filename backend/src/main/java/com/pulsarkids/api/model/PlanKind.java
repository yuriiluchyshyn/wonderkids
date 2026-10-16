package com.pulsarkids.api.model;

import lombok.RequiredArgsConstructor;

/**
 * What a Stripe product of Pulsar Kids is (its `metadata.kind`): a plan with no
 * payment, a paid plan, or what is added to a paid plan for each child beyond
 * those it includes. A product without one of these is not shown.
 */
@RequiredArgsConstructor
public enum PlanKind implements Wire {
  FREE("free"),
  PAID("paid"),
  EXTRA_CHILD("extra_child");

  private final String wire;

  @Override
  public String wire() {
    return wire;
  }
}
