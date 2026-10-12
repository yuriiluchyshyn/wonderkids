package com.pulsarkids.api.config;

import com.pulsarkids.api.core.Env;
import com.pulsarkids.api.core.Json;
import com.pulsarkids.api.core.Vars;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;
import javax.sql.DataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * The connection pool, made from `DATABASE_URL` as every Postgres host hands it
 * out (`postgres://user:password@host/db?sslmode=require`) — the same variable
 * the Node API read, so the Vercel project's settings carry over as they are.
 */
@Configuration
public class DataSourceConfig {
  /** What the PostgreSQL driver calls its settings. */
  private static final String DRIVER = "org.postgresql.Driver";
  private static final String SSL_MODE = "sslmode";
  private static final String SSL_REQUIRE = "require";
  private static final String SSL_VERIFY_FULL = "verify-full";
  private static final String SSL_FACTORY = "sslfactory";
  private static final String SSL_FACTORY_JAVA = "org.postgresql.ssl.DefaultJavaSSLFactory";
  private static final String OPTIONS = "options";
  private static final String PREPARE_THRESHOLD = "prepareThreshold";
  private static final String APPLICATION_NAME = "ApplicationName";
  private static final String POOL_NAME = "pulsar-db";
  private static final String SERVICE_NAME = "pulsar-api";
  private static final String ON = "true";
  private static final String DEFAULT_POOL_MAX = "5";
  private static final Pattern WANTS_SSL = Pattern.compile("sslmode=require|neon\\.tech|\\.rds\\.amazonaws\\.com", Pattern.CASE_INSENSITIVE);

  @Bean(destroyMethod = "close")
  public DataSource dataSource() {
    String url = Env.get(Vars.DATABASE_URL);
    // A developer without one gets the Docker database of the workspace's docker-compose.yml.
    if ((url == null || url.isEmpty()) && !Env.onVercel()) url = Env.LOCAL_DATABASE_URL;
    if (url == null || url.isEmpty()) throw new IllegalStateException("DATABASE_URL is not set");

    URI uri = URI.create(url.replaceFirst("^postgres(ql)?://", "http://"));
    HikariConfig config = new HikariConfig();
    config.setDriverClassName(DRIVER);
    config.setJdbcUrl("jdbc:postgresql://" + uri.getHost() + (uri.getPort() > 0 ? ":" + uri.getPort() : "") + uri.getPath());
    String userInfo = uri.getRawUserInfo();
    if (userInfo != null) {
      int colon = userInfo.indexOf(':');
      config.setUsername(URLDecoder.decode(colon < 0 ? userInfo : userInfo.substring(0, colon), StandardCharsets.UTF_8));
      if (colon >= 0) config.setPassword(URLDecoder.decode(userInfo.substring(colon + 1), StandardCharsets.UTF_8));
    }
    if (WANTS_SSL.matcher(url).find() || ON.equals(Env.get(Vars.PGSSL))) {
      if (ON.equals(Env.get(Vars.PGSSL_INSECURE))) {
        config.addDataSourceProperty(SSL_MODE, SSL_REQUIRE);
      } else {
        // The server must show a certificate of a known authority, issued for its host.
        config.addDataSourceProperty(SSL_MODE, SSL_VERIFY_FULL);
        config.addDataSourceProperty(SSL_FACTORY, SSL_FACTORY_JAVA);
      }
    }
    String query = uri.getRawQuery();
    if (query != null) {
      for (String pair : query.split("&")) {
        // Neon's way of naming the endpoint for clients without SNI.
        if (pair.startsWith(OPTIONS + "=")) config.addDataSourceProperty(OPTIONS, URLDecoder.decode(pair.substring(OPTIONS.length() + 1), StandardCharsets.UTF_8));
      }
    }
    // Managed Postgres is reached through a transaction pooler (PgBouncer),
    // which does not keep server-side prepared statements between transactions.
    config.addDataSourceProperty(PREPARE_THRESHOLD, "0");
    config.addDataSourceProperty(APPLICATION_NAME, SERVICE_NAME);
    config.setMaximumPoolSize((int) Math.max(1, Json.number(Env.get(Vars.DB_POOL_MAX, DEFAULT_POOL_MAX))));
    // An instance that serves nobody holds no connection.
    config.setMinimumIdle(0);
    config.setIdleTimeout(30_000);
    config.setMaxLifetime(5 * 60_000);
    config.setConnectionTimeout(10_000);
    // The service starts without the database: `/api/health` must answer anyway.
    config.setInitializationFailTimeout(-1);
    config.setPoolName(POOL_NAME);
    return new HikariDataSource(config);
  }
}
