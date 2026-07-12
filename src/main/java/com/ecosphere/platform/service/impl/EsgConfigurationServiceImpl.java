package com.ecosphere.platform.service.impl;

import com.ecosphere.platform.entity.EsgConfiguration;
import com.ecosphere.platform.exception.ResourceNotFoundException;
import com.ecosphere.platform.repository.EsgConfigurationRepository;
import com.ecosphere.platform.service.EsgConfigurationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EsgConfigurationServiceImpl implements EsgConfigurationService {

    @Autowired
    private EsgConfigurationRepository esgConfigurationRepository;

    @Override
    @Transactional(readOnly = true)
    public EsgConfiguration getConfiguration() {
        return esgConfigurationRepository.findFirstConfig()
                .orElseGet(() -> {
                    EsgConfiguration defaultConfig = new EsgConfiguration();
                    return esgConfigurationRepository.save(defaultConfig);
                });
    }

    @Override
    @Transactional
    public EsgConfiguration updateConfiguration(EsgConfiguration configuration) {
        EsgConfiguration existing = esgConfigurationRepository.findFirstConfig()
                .orElseThrow(() -> new ResourceNotFoundException("No ESG configuration found"));
        existing.setAutoEmissionCalculation(configuration.getAutoEmissionCalculation());
        existing.setEvidenceRequirement(configuration.getEvidenceRequirement());
        existing.setBadgeAutoAward(configuration.getBadgeAutoAward());
        existing.setEnvWeight(configuration.getEnvWeight());
        existing.setSocialWeight(configuration.getSocialWeight());
        existing.setGovWeight(configuration.getGovWeight());
        return esgConfigurationRepository.save(existing);
    }
}
