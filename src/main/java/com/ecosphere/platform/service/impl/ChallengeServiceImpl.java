package com.ecosphere.platform.service.impl;

import com.ecosphere.platform.entity.*;
import com.ecosphere.platform.exception.BadRequestException;
import com.ecosphere.platform.exception.ResourceNotFoundException;
import com.ecosphere.platform.repository.*;
import com.ecosphere.platform.service.BadgeService;
import com.ecosphere.platform.service.ChallengeService;
import com.ecosphere.platform.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class ChallengeServiceImpl implements ChallengeService {

    @Autowired
    private ChallengeRepository challengeRepository;

    @Autowired
    private ChallengeParticipationRepository participationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private BadgeService badgeService;

    @Override
    @Transactional
    public Challenge createChallenge(Challenge challenge) {
        return challengeRepository.save(challenge);
    }

    @Override
    @Transactional
    public Challenge updateChallenge(Long id, Challenge challenge) {
        Challenge existing = getChallengeById(id);
        existing.setTitle(challenge.getTitle());
        existing.setCategory(challenge.getCategory());
        existing.setDescription(challenge.getDescription());
        existing.setXp(challenge.getXp());
        existing.setDifficulty(challenge.getDifficulty());
        existing.setEvidenceRequired(challenge.getEvidenceRequired());
        existing.setDeadline(challenge.getDeadline());
        existing.setStatus(challenge.getStatus());
        return challengeRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public Challenge getChallengeById(Long id) {
        return challengeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Challenge not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Challenge> getChallenges(String search, Long categoryId, String difficulty, String status, Pageable pageable) {
        return challengeRepository.filterChallenges(search, categoryId, difficulty, status, pageable);
    }

    @Override
    @Transactional
    public void deleteChallenge(Long id) {
        Challenge challenge = getChallengeById(id);
        challengeRepository.delete(challenge);
    }

    @Override
    @Transactional
    public ChallengeParticipation joinChallenge(Long challengeId, String username) {
        Challenge challenge = getChallengeById(challengeId);
        User employee = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (!"ACTIVE".equals(challenge.getStatus())) {
            throw new BadRequestException("This challenge is not active");
        }

        ChallengeParticipation participation = ChallengeParticipation.builder()
                .challenge(challenge)
                .employee(employee)
                .progress(0)
                .approvalStatus("PENDING")
                .xpAwarded(0)
                .build();
        return participationRepository.save(participation);
    }

    @Override
    @Transactional
    public ChallengeParticipation submitEvidence(Long participationId, String proofFileUrl, Integer progress, String username) {
        ChallengeParticipation participation = participationRepository.findById(participationId)
                .orElseThrow(() -> new ResourceNotFoundException("Participation not found with ID: " + participationId));

        User employee = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (!participation.getEmployee().getId().equals(employee.getId())) {
            throw new BadRequestException("You can only update your own challenge participation");
        }

        participation.setProofFileUrl(proofFileUrl);
        participation.setProgress(progress != null ? progress : participation.getProgress());
        return participationRepository.save(participation);
    }

    @Override
    @Transactional
    public ChallengeParticipation approveParticipation(Long participationId, String approvalStatus, String approverUsername) {
        ChallengeParticipation participation = participationRepository.findById(participationId)
                .orElseThrow(() -> new ResourceNotFoundException("Participation not found with ID: " + participationId));

        if (!"PENDING".equals(participation.getApprovalStatus())) {
            throw new BadRequestException("Participation is already " + participation.getApprovalStatus());
        }

        participation.setApprovalStatus(approvalStatus);

        if ("APPROVED".equals(approvalStatus)) {
            int xpToAward = participation.getChallenge().getXp();
            participation.setXpAwarded(xpToAward);
            participation.setProgress(100);
            participation.setCompletionDate(LocalDate.now());

            User employee = participation.getEmployee();
            employee.setXp(employee.getXp() + xpToAward);
            userRepository.save(employee);

            notificationService.sendNotification(
                    employee.getId(),
                    "Your challenge '" + participation.getChallenge().getTitle() + "' was approved! You earned " + xpToAward + " XP.",
                    "APPROVAL_DECISION"
            );

            badgeService.checkAndAwardBadges(employee.getId());
        } else if ("REJECTED".equals(approvalStatus)) {
            notificationService.sendNotification(
                    participation.getEmployee().getId(),
                    "Your challenge '" + participation.getChallenge().getTitle() + "' submission was rejected.",
                    "APPROVAL_DECISION"
            );
        }

        return participationRepository.save(participation);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ChallengeParticipation> getParticipations(Long employeeId, Long challengeId, String status, Pageable pageable) {
        return participationRepository.filterParticipations(employeeId, challengeId, status, pageable);
    }
}
