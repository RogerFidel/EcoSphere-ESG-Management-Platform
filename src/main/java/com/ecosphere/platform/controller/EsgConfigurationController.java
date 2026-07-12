package com.ecosphere.platform.controller;

import com.ecosphere.platform.entity.EsgConfiguration;
import com.ecosphere.platform.service.AuditLogService;
import com.ecosphere.platform.service.EsgConfigurationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/esg-configuration")
@Tag(name = "ESG Configuration", description = "Global platform configuration for ESG calculations and toggles")
public class EsgConfigurationController {

    @Autowired private EsgConfigurationService esgConfigurationService;
    @Autowired private AuditLogService auditLogService;

    @GetMapping
    @Operation(summary = "Get the current ESG platform configuration")
    public ResponseEntity<EsgConfiguration> getConfiguration() {
        return ResponseEntity.ok(esgConfigurationService.getConfiguration());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update ESG configuration (Admin only) — controls auto-calculation, badge-award, and score weights")
    public ResponseEntity<EsgConfiguration> updateConfiguration(
            @RequestBody EsgConfiguration configuration,
            Authentication auth) {
        EsgConfiguration updated = esgConfigurationService.updateConfiguration(configuration);
        auditLogService.log(auth.getName(), "UPDATE_ESG_CONFIG",
                "ESG config updated: envWeight=" + updated.getEnvWeight()
                + ", socialWeight=" + updated.getSocialWeight()
                + ", govWeight=" + updated.getGovWeight()
                + ", autoEmission=" + updated.getAutoEmissionCalculation()
                + ", badgeAutoAward=" + updated.getBadgeAutoAward());
        return ResponseEntity.ok(updated);
    }
}
