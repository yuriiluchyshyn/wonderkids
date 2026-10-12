package com.pulsarkids.api;

import com.pulsarkids.api.core.Env;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * The API of Pulsar Kids — one Spring Boot service behind `/api`, deployed
 * apart from the game and the site (its own Vercel project, a container image:
 * `Dockerfile.vercel`). A new endpoint is a new method of a controller in
 * `web/`; nothing counts them.
 */
@SpringBootApplication
public class App {
  public static void main(String[] args) {
    // A developer's `.env.local` (the backend's own, or the game's) — never on Vercel.
    Env.loadLocalFiles();
    SpringApplication.run(App.class, args);
  }
}
