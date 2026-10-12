package com.pulsarkids.api.config;

import com.pulsarkids.api.core.Json;
import com.pulsarkids.api.model.ApiError;
import com.pulsarkids.api.model.Fields;
import com.pulsarkids.api.service.Messages;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/** The refusals no controller gets to make itself: an address that is not there, a method it does not take. */
@RestControllerAdvice
@RequiredArgsConstructor
public class ApiErrors {
  private final Messages messages;

  private ResponseEntity.BodyBuilder refuse(ApiError error) {
    return ResponseEntity.status(error.getStatus());
  }

  private Object body(ApiError error) {
    return Json.map(Fields.ERROR, error.getCode(), Fields.MESSAGE, messages.of(error));
  }

  @ExceptionHandler({NoHandlerFoundException.class, NoResourceFoundException.class})
  public ResponseEntity<Object> notFound() {
    return refuse(ApiError.NOT_FOUND).body(body(ApiError.NOT_FOUND));
  }

  @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
  public ResponseEntity<Object> methodNotAllowed(HttpRequestMethodNotSupportedException err) {
    HttpHeaders headers = new HttpHeaders();
    if (err.getSupportedMethods() != null) headers.set(HttpHeaders.ALLOW, String.join(", ", err.getSupportedMethods()));
    return refuse(ApiError.METHOD_NOT_ALLOWED).headers(headers).body(body(ApiError.METHOD_NOT_ALLOWED));
  }
}
