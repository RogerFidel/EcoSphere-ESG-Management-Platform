-- =====================================================
-- EcoSphere ESG Management Platform - Database Schema
-- PostgreSQL DDL (Hibernate will auto-create via ddl-auto=update)
-- This file is for documentation and manual setup reference
-- =====================================================

-- 1. DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(100) NOT NULL UNIQUE,
    head VARCHAR(255),
    parent_id BIGINT REFERENCES departments(id),
    employee_count INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    xp INT NOT NULL DEFAULT 0,
    points INT NOT NULL DEFAULT 0,
    department_id BIGINT REFERENCES departments(id),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- 4. EMISSION FACTORS
CREATE TABLE IF NOT EXISTS emission_factors (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(100) NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- 5. PRODUCT ESG PROFILES
CREATE TABLE IF NOT EXISTS product_esg_profiles (
    id BIGSERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL UNIQUE,
    carbon_footprint DOUBLE PRECISION NOT NULL,
    recycling_percentage DOUBLE PRECISION NOT NULL,
    packaging_material VARCHAR(255),
    water_usage DOUBLE PRECISION,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- 6. ENVIRONMENTAL GOALS
CREATE TABLE IF NOT EXISTS environmental_goals (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    target_value DOUBLE PRECISION NOT NULL,
    current_value DOUBLE PRECISION NOT NULL DEFAULT 0,
    unit VARCHAR(100) NOT NULL,
    deadline DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- 7. ESG POLICIES
CREATE TABLE IF NOT EXISTS esg_policies (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    content TEXT NOT NULL,
    effective_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- 8. BADGES
CREATE TABLE IF NOT EXISTS badges (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(500),
    unlock_rule VARCHAR(255) NOT NULL,
    icon VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- 9. REWARDS
CREATE TABLE IF NOT EXISTS rewards (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    points_required INT NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- 10. ESG CONFIGURATION
CREATE TABLE IF NOT EXISTS esg_configurations (
    id BIGSERIAL PRIMARY KEY,
    auto_emission_calculation BOOLEAN NOT NULL DEFAULT TRUE,
    evidence_requirement BOOLEAN NOT NULL DEFAULT TRUE,
    badge_auto_award BOOLEAN NOT NULL DEFAULT TRUE,
    env_weight DOUBLE PRECISION NOT NULL DEFAULT 40.0,
    social_weight DOUBLE PRECISION NOT NULL DEFAULT 30.0,
    gov_weight DOUBLE PRECISION NOT NULL DEFAULT 30.0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- 11. CARBON TRANSACTIONS
CREATE TABLE IF NOT EXISTS carbon_transactions (
    id BIGSERIAL PRIMARY KEY,
    department_id BIGINT NOT NULL REFERENCES departments(id),
    source_type VARCHAR(100) NOT NULL,
    source_id VARCHAR(255),
    consumption_value DOUBLE PRECISION NOT NULL,
    emission_value DOUBLE PRECISION NOT NULL,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- 12. CSR ACTIVITIES
CREATE TABLE IF NOT EXISTS csr_activities (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    category_id BIGINT REFERENCES categories(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    points_to_award INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- 13. EMPLOYEE PARTICIPATIONS (CSR)
CREATE TABLE IF NOT EXISTS employee_participations (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES users(id),
    activity_id BIGINT NOT NULL REFERENCES csr_activities(id),
    proof_file_url VARCHAR(500),
    approval_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    points_earned INT DEFAULT 0,
    completion_date DATE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- 14. CHALLENGES
CREATE TABLE IF NOT EXISTS challenges (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category_id BIGINT REFERENCES categories(id),
    description VARCHAR(1000),
    xp INT NOT NULL DEFAULT 0,
    difficulty VARCHAR(50) NOT NULL DEFAULT 'EASY',
    evidence_required BOOLEAN NOT NULL DEFAULT FALSE,
    deadline DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- 15. CHALLENGE PARTICIPATIONS
CREATE TABLE IF NOT EXISTS challenge_participations (
    id BIGSERIAL PRIMARY KEY,
    challenge_id BIGINT NOT NULL REFERENCES challenges(id),
    employee_id BIGINT NOT NULL REFERENCES users(id),
    progress INT NOT NULL DEFAULT 0,
    proof_file_url VARCHAR(500),
    approval_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    xp_awarded INT DEFAULT 0,
    completion_date DATE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- 16. POLICY ACKNOWLEDGEMENTS
CREATE TABLE IF NOT EXISTS policy_acknowledgements (
    id BIGSERIAL PRIMARY KEY,
    policy_id BIGINT NOT NULL REFERENCES esg_policies(id),
    employee_id BIGINT NOT NULL REFERENCES users(id),
    acknowledged_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    UNIQUE(policy_id, employee_id)
);

-- 17. AUDITS
CREATE TABLE IF NOT EXISTS audits (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    auditor_name VARCHAR(255) NOT NULL,
    audit_date DATE NOT NULL,
    score DOUBLE PRECISION NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- 18. COMPLIANCE ISSUES
CREATE TABLE IF NOT EXISTS compliance_issues (
    id BIGSERIAL PRIMARY KEY,
    audit_id BIGINT REFERENCES audits(id),
    severity VARCHAR(50) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    owner_id BIGINT NOT NULL REFERENCES users(id),
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- 19. DEPARTMENT SCORES
CREATE TABLE IF NOT EXISTS department_scores (
    id BIGSERIAL PRIMARY KEY,
    department_id BIGINT NOT NULL REFERENCES departments(id),
    environmental_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    social_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    governance_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    total_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    calculated_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- 20. EMPLOYEE BADGES
CREATE TABLE IF NOT EXISTS employee_badges (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES users(id),
    badge_id BIGINT NOT NULL REFERENCES badges(id),
    awarded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    UNIQUE(employee_id, badge_id)
);

-- 21. REWARD REDEMPTIONS
CREATE TABLE IF NOT EXISTS reward_redemptions (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES users(id),
    reward_id BIGINT NOT NULL REFERENCES rewards(id),
    points_spent INT NOT NULL,
    redeemed_at TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- 22. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient_id BIGINT NOT NULL REFERENCES users(id),
    message VARCHAR(1000) NOT NULL,
    type VARCHAR(100) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- 23. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details VARCHAR(2000),
    timestamp TIMESTAMP NOT NULL
);

-- =====================================================
-- SEED DATA: Default ESG Configuration
-- =====================================================
INSERT INTO esg_configurations (auto_emission_calculation, evidence_requirement, badge_auto_award, env_weight, social_weight, gov_weight, created_at)
VALUES (TRUE, TRUE, TRUE, 40.0, 30.0, 30.0, NOW())
ON CONFLICT DO NOTHING;

-- Seed default emission factors
INSERT INTO emission_factors (name, value, unit, activity_type, status, created_at) VALUES
  ('Fleet Diesel', 2.68, 'kg CO2e/liter', 'FLEET', 'ACTIVE', NOW()),
  ('Grid Electricity', 0.233, 'kg CO2e/kWh', 'MANUFACTURING', 'ACTIVE', NOW()),
  ('Business Travel Air', 0.255, 'kg CO2e/km', 'EXPENSE', 'ACTIVE', NOW()),
  ('Purchased Goods Default', 1.5, 'kg CO2e/unit', 'PURCHASE', 'ACTIVE', NOW())
ON CONFLICT DO NOTHING;

-- Seed default badges
INSERT INTO badges (name, description, unlock_rule, icon, status, created_at) VALUES
  ('Green Starter', 'Earned 100 XP on sustainability challenges', 'XP_100', 'leaf', 'ACTIVE', NOW()),
  ('Eco Champion', 'Earned 500 XP from challenges', 'XP_500', 'trophy', 'ACTIVE', NOW()),
  ('Challenge Accepted', 'Completed 3 challenges', 'CHALLENGES_3', 'star', 'ACTIVE', NOW()),
  ('Sustainability Hero', 'Completed 10 challenges', 'CHALLENGES_10', 'shield', 'ACTIVE', NOW())
ON CONFLICT DO NOTHING;
