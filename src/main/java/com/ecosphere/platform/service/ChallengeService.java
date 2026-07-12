package com.ecosphere.platform.service;

import com.ecosphere.platform.entity.Challenge;
import com.ecosphere.platform.entity.ChallengeParticipation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ChallengeService {
    Challenge createChallenge(Challenge challenge);
    Challenge updateChallenge(Long id, Challenge challenge);
    Challenge getChallengeById(Long id);
    Page<Challenge> getChallenges(String search, Long categoryId, String difficulty, String status, Pageable pageable);
    void deleteChallenge(Long id);
    ChallengeParticipation joinChallenge(Long challengeId, String username);
    ChallengeParticipation submitEvidence(Long participationId, String proofFileUrl, Integer progress, String username);
    ChallengeParticipation approveParticipation(Long participationId, String approvalStatus, String approverUsername);
    Page<ChallengeParticipation> getParticipations(Long employeeId, Long challengeId, String status, Pageable pageable);
}
