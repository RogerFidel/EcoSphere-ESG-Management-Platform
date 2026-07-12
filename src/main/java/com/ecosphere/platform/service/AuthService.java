package com.ecosphere.platform.service;

import com.ecosphere.platform.dto.AuthRequest;
import com.ecosphere.platform.dto.AuthResponse;
import com.ecosphere.platform.dto.RegisterRequest;
import com.ecosphere.platform.entity.User;

public interface AuthService {
    AuthResponse authenticate(AuthRequest request);
    User register(RegisterRequest request);
}
