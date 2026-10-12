package com.pulsarkids.api.data.repo;

import com.pulsarkids.api.data.entity.Setting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SettingRepository extends JpaRepository<Setting, String> {}
