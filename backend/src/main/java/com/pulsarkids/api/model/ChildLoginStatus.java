package com.pulsarkids.api.model;

/** How a child's sign-in by nickname and PIN ended. */
public enum ChildLoginStatus {
  OK,
  BAD_PIN,
  NOT_FOUND
}
