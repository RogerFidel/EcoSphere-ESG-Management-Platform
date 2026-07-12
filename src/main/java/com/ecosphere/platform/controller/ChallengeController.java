package com.ecosphere.platform.controller;

import com.ecosphere.platform.entity.Challenge;
import com.ecosphere.platform.entity.ChallengeParticipation;
import com.ecosphere.platform.service.ChallengeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/challenges")
@Tag(name = "Challenges", description = "Gamified sustainability challenges and employee participation")
public class ChallengeController {

    @Autowired
    private ChallengeService challengeService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Create a new challenge")
    public ResponseEntity<Challenge> create(@RequestBody Challenge challenge) {
        return ResponseEntity.ok(challengeService.createChallenge(challenge));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Update a challenge")
    public ResponseEntity<Challenge> update(@PathVariable Long id, @RequestBody Challenge challenge) {
        return ResponseEntity.ok(challengeService.updateChallenge(id, challenge));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a challenge by ID")
    public ResponseEntity<Challenge> getById(@PathVariable Long id) {
        return ResponseEntity.ok(challengeService.getChallengeById(id));
    }

    @GetMapping
    @Operation(summary = "Search challenges with pagination, difficulty and category filters")
    public ResponseEntity<Page<Challenge>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(challengeService.getChallenges(search, categoryId, difficulty, status, PageRequest.of(page, size, sort)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a challenge")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        challengeService.deleteChallenge(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{challengeId}/join")
    @Operation(summary = "Join a challenge (Employee)")
    public ResponseEntity<ChallengeParticipation> join(@PathVariable Long challengeId, Authentication auth) {
        return ResponseEntity.ok(challengeService.joinChallenge(challengeId, auth.getName()));
    }

    @PatchMapping("/participations/{participationId}/evidence")
    @Operation(summary = "Submit evidence for a challenge participation (Employee)")
    public ResponseEntity<ChallengeParticipation> submitEvidence(
            @PathVariable Long participationId,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        String proofUrl = (String) body.get("proofFileUrl");
        Integer progress = body.get("progress") != null ? ((Number) body.get("progress")).intValue() : null;
        return ResponseEntity.ok(challengeService.submitEvidence(participationId, proofUrl, progress, auth.getName()));
    }

    @PatchMapping("/participations/{participationId}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Approve or reject a challenge participation")
    public ResponseEntity<ChallengeParticipation> approve(
            @PathVariable Long participationId,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        return ResponseEntity.ok(challengeService.approveParticipation(participationId, body.get("approvalStatus"), auth.getName()));
    }

    @GetMapping("/participations")
    @Operation(summary = "Get challenge participations with filtering by employee, challenge, status")
    public ResponseEntity<Page<ChallengeParticipation>> getParticipations(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long challengeId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(challengeService.getParticipations(employeeId, challengeId, status, PageRequest.of(page, size)));
    }
}
