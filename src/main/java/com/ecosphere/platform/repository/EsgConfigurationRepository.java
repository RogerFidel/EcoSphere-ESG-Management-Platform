package com.ecosphere.platform.repository;

import com.ecosphere.platform.entity.EsgConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EsgConfigurationRepository extends JpaRepository<EsgConfiguration, Long> {

    @Query("SELECT ec FROM EsgConfiguration ec ORDER BY ec.id ASC LIMIT 1")
    Optional<EsgConfiguration> findFirstConfig();
}
