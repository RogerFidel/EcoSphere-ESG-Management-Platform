package com.ecosphere.platform.service;

import com.ecosphere.platform.entity.EsgPolicy;
import com.ecosphere.platform.entity.PolicyAcknowledgement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EsgPolicyService {
    EsgPolicy createPolicy(EsgPolicy policy);
    EsgPolicy updatePolicy(Long id, EsgPolicy policy);
    EsgPolicy getPolicyById(Long id);
    Page<EsgPolicy> getPolicies(String search, String status, Pageable pageable);
    List<EsgPolicy> getAllPolicies();
    void deletePolicy(Long id);

    PolicyAcknowledgement acknowledgePolicy(Long policyId, String username);
    Page<PolicyAcknowledgement> getAcknowledgements(Long employeeId, Long policyId, Pageable pageable);
    boolean hasAcknowledged(Long policyId, String username);
}
