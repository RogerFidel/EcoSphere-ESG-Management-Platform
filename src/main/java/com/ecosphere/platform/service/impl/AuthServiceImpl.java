package com.ecosphere.platform.service.impl;

import com.ecosphere.platform.config.JwtUtils;
import com.ecosphere.platform.dto.AuthRequest;
import com.ecosphere.platform.dto.AuthResponse;
import com.ecosphere.platform.dto.RegisterRequest;
import com.ecosphere.platform.entity.Department;
import com.ecosphere.platform.entity.Role;
import com.ecosphere.platform.entity.User;
import com.ecosphere.platform.exception.BadRequestException;
import com.ecosphere.platform.exception.ResourceNotFoundException;
import com.ecosphere.platform.repository.DepartmentRepository;
import com.ecosphere.platform.repository.UserRepository;
import com.ecosphere.platform.service.AuthService;
import com.ecosphere.platform.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuditLogService auditLogService;

    @Override
    @Transactional
    public AuthResponse authenticate(AuthRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateToken(request.getUsername());

            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUsername()));

            auditLogService.log(user.getUsername(), "USER_LOGIN", "User logged in successfully");

            return AuthResponse.builder()
                    .token(jwt)
                    .username(user.getUsername())
                    .role(user.getRole().name())
                    .build();
        } catch (BadCredentialsException e) {
            throw new BadRequestException("Invalid username or password");
        }
    }

    @Override
    @Transactional
    public User register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        Department dept = null;
        if (request.getDepartmentId() != null) {
            dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        }

        Role userRole;
        try {
            userRole = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role. Role must be ADMIN, MANAGER, or EMPLOYEE");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .role(userRole)
                .department(dept)
                .xp(0)
                .points(0)
                .status("ACTIVE")
                .build();

        User savedUser = userRepository.save(user);

        // Update department employee count if department is assigned
        if (dept != null) {
            dept.setEmployeeCount(dept.getEmployeeCount() + 1);
            departmentRepository.save(dept);
        }

        auditLogService.log(savedUser.getUsername(), "USER_REGISTER", "Registered user with role: " + savedUser.getRole());

        return savedUser;
    }
}
//
