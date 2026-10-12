package com.pulsarkids.api.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.Accessors;

/** The parts of the owner's side served at /api/admin/users?part=… */
@Getter
@Accessors(fluent = true)
@RequiredArgsConstructor
public enum AdminPart implements Wire {
  SETTINGS("settings"),
  LINKS("links"),
  AVAILABILITY("availability");

  private final String wire;
}
