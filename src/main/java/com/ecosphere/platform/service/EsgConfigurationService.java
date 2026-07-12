package com.ecosphere.platform.service;

import com.ecosphere.platform.entity.EsgConfiguration;

public interface EsgConfigurationService {
    EsgConfiguration getConfiguration();
    EsgConfiguration updateConfiguration(EsgConfiguration configuration);
}
