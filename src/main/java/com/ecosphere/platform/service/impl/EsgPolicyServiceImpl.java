package com.ecosphere.platform.service.impl;

import com.ecosphere.platform.entity.EsgPolicy;
import com.ecosphere.platform.entity.PolicyAcknowledgement;
import com.ecosphere.platform.entity.User;
import com.ecosphere.platform.exception.BadRequestException;
import com.ecosphere.platform.exception.ResourceNotFoundException;
import com.ecosphere.platform.repository.EsgPolicyRepository;
import com.ecosphere.platform.repository.PolicyAcknowledgementRepository;
import com.ecosphere.platform.repository.UserRepository;
import com.ecosphere.platform.service.EsgPolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EsgPolicyServiceImpl implements EsgPolicyService {

    @Autowired
    private EsgPolicyRepository esgPolicyRepository;

    @Autowired
    private PolicyAcknowledgementRepository acknowledgementRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public EsgPolicy createPolicy(EsgPolicy policy) {
        return esgPolicyRepository.save(policy);
    }

    @Override
    @Transactional
    public EsgPolicy updatePolicy(Long id, EsgPolicy policy) {
        EsgPolicy existing = getPolicyById(id);
        existing.setTitle(policy.getTitle());
        existing.setDescription(policy.getDescription());
        existing.setContent(policy.getContent());
        existing.setEffectiveDate(policy.getEffectiveDate());
        existing.setStatus(policy.getStatus());
        return esgPolicyRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public EsgPolicy getPolicyById(Long id) {
        return esgPolicyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ESG Policy not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EsgPolicy> getPolicies(String search, String status, Pageable pageable) {
        return esgPolicyRepository.searchPolicies(search, status, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EsgPolicy> getAllPolicies() {
        return esgPolicyRepository.findAll();
    }

    @Override
    @Transactional
    public void deletePolicy(Long id) {
        EsgPolicy policy = getPolicyById(id);
        esgPolicyRepository.delete(policy);
    }

    @Override
    @Transactional
    public PolicyAcknowledgement acknowledgePolicy(Long policyId, String username) {
        EsgPolicy policy = getPolicyById(policyId);
        User employee = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (acknowledgementRepository.existsByPolicyIdAndEmployeeId(policyId, employee.getId())) {
            throw new BadRequestException("Policy already acknowledged by this user");
        }

        PolicyAcknowledgement ack = PolicyAcknowledgement.builder()
                .policy(policy)
                .employee(employee)
                .acknowledgedAt(LocalDateTime.now())
                .build();
        return acknowledgementRepository.save(ack);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PolicyAcknowledgement> getAcknowledgements(Long employeeId, Long policyId, Pageable pageable) {
        return acknowledgementRepository.filterAcknowledgements(employeeId, policyId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasAcknowledged(Long policyId, String username) {
        User employee = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return acknowledgementRepository.existsByPolicyIdAndEmployeeId(policyId, employee.getId());
    }
}
