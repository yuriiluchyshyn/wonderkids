package com.pulsarkids.api.data.repo;

import com.pulsarkids.api.data.entity.BillingAccount;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BillingAccountRepository extends JpaRepository<BillingAccount, Integer> {
  Optional<BillingAccount> findFirstByStripeSubscriptionId(String subscriptionId);

  Optional<BillingAccount> findFirstByStripeCustomerId(String customerId);

  /** The account's row, made unless it is there — two requests at once cannot both make it. */
  @Modifying
  @Query(value = "INSERT INTO wk_billing_accounts (parent_id) VALUES (:parentId) ON CONFLICT DO NOTHING", nativeQuery = true)
  int insertIfAbsent(@Param("parentId") Integer parentId);
}
