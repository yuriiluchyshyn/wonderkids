package com.pulsarkids.api.config;

import com.pulsarkids.api.model.Lang;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Enumeration;
import java.util.Locale;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.DispatcherServlet;
import org.springframework.web.servlet.LocaleResolver;

/**
 * The language a request is answered in. The game and the site name the
 * language on their screen in `Accept-Language` (one code: `pl`); a browser
 * left to itself sends its own list (`de-DE,de;q=0.9,en;q=0.8`). The first of
 * them that we speak decides; when none is ours — `Lang.FALLBACK`.
 */
@Component(DispatcherServlet.LOCALE_RESOLVER_BEAN_NAME)
public class LangResolver implements LocaleResolver {
  /** The language of a request (never null). */
  public static Lang langOf(HttpServletRequest request) {
    if (request.getHeader(HttpHeaders.ACCEPT_LANGUAGE) != null) {
      // In the order of the client's preference.
      Enumeration<Locale> asked = request.getLocales();
      while (asked.hasMoreElements()) {
        Lang ours = Lang.of(asked.nextElement());
        if (ours != null) return ours;
      }
    }
    return Lang.FALLBACK;
  }

  @Override
  public Locale resolveLocale(HttpServletRequest request) {
    return langOf(request).locale();
  }

  @Override
  public void setLocale(HttpServletRequest request, HttpServletResponse response, Locale locale) {
    throw new UnsupportedOperationException("The language is the client's to name, in Accept-Language");
  }
}
