-- =====================================================================
-- Hikmat Tech Solutions — Admin Portal Upgrade Migration
-- Run this AFTER importing software_agency_db.sql (your existing dump).
-- Every statement below is additive and safe to re-run: it only adds
-- columns/tables that do not already exist and never drops data.
-- =====================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;

-- ---------------------------------------------------------------------
-- team_members: add Skills tags + GitHub link (LinkedIn/email/is_active
-- already exist in the provided schema)
-- ---------------------------------------------------------------------
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'team_members' AND COLUMN_NAME = 'skills'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE team_members ADD COLUMN skills TEXT NULL AFTER bio',
  'SELECT "team_members.skills already exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'team_members' AND COLUMN_NAME = 'github'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE team_members ADD COLUMN github VARCHAR(255) NULL AFTER linkedin',
  'SELECT "team_members.github already exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------
-- services: add category, technologies, features, delivery_time, icon
-- ---------------------------------------------------------------------
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'services' AND COLUMN_NAME = 'category');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE services ADD COLUMN category VARCHAR(100) NULL AFTER slug', 'SELECT "services.category already exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'services' AND COLUMN_NAME = 'technologies');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE services ADD COLUMN technologies TEXT NULL AFTER description', 'SELECT "services.technologies already exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'services' AND COLUMN_NAME = 'features');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE services ADD COLUMN features TEXT NULL AFTER technologies', 'SELECT "services.features already exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'services' AND COLUMN_NAME = 'delivery_time');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE services ADD COLUMN delivery_time VARCHAR(100) NULL AFTER price', 'SELECT "services.delivery_time already exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'services' AND COLUMN_NAME = 'icon');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE services ADD COLUMN icon VARCHAR(100) NULL AFTER image_path', 'SELECT "services.icon already exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------
-- projects: add category, live_demo_url, github_url, challenge,
-- solution, impact_metrics (short_description, client, start_date,
-- end_date, status already exist in the provided schema)
-- ---------------------------------------------------------------------
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects' AND COLUMN_NAME = 'category');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE projects ADD COLUMN category VARCHAR(100) NULL AFTER slug', 'SELECT "projects.category already exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects' AND COLUMN_NAME = 'live_demo_url');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE projects ADD COLUMN live_demo_url VARCHAR(500) NULL AFTER cover_image', 'SELECT "projects.live_demo_url already exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects' AND COLUMN_NAME = 'github_url');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE projects ADD COLUMN github_url VARCHAR(500) NULL AFTER live_demo_url', 'SELECT "projects.github_url already exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects' AND COLUMN_NAME = 'challenge');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE projects ADD COLUMN challenge TEXT NULL AFTER description', 'SELECT "projects.challenge already exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects' AND COLUMN_NAME = 'solution');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE projects ADD COLUMN solution TEXT NULL AFTER challenge', 'SELECT "projects.solution already exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects' AND COLUMN_NAME = 'impact_metrics');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE projects ADD COLUMN impact_metrics TEXT NULL AFTER solution', 'SELECT "projects.impact_metrics already exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------
-- inquiries: add budget, timeline; expand status enum to the full
-- pipeline requested, remapping existing values so no data is lost:
--   in_progress -> in_review, completed -> converted, rejected -> archived
-- ---------------------------------------------------------------------
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'inquiries' AND COLUMN_NAME = 'budget');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE inquiries ADD COLUMN budget VARCHAR(100) NULL AFTER message', 'SELECT "inquiries.budget already exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'inquiries' AND COLUMN_NAME = 'timeline');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE inquiries ADD COLUMN timeline VARCHAR(100) NULL AFTER budget', 'SELECT "inquiries.timeline already exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @needs_enum_upgrade := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'inquiries' AND COLUMN_NAME = 'status'
    AND COLUMN_TYPE NOT LIKE '%in_review%'
);
SET @sql := IF(@needs_enum_upgrade > 0,
  "ALTER TABLE inquiries MODIFY COLUMN status ENUM('new','in_progress','completed','rejected','in_review','contacted','proposal_sent','converted','archived') NOT NULL DEFAULT 'new'",
  'SELECT "inquiries.status already upgraded"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE inquiries SET status = 'in_review' WHERE status = 'in_progress';
UPDATE inquiries SET status = 'converted' WHERE status = 'completed';
UPDATE inquiries SET status = 'archived' WHERE status = 'rejected';

SET @sql := "ALTER TABLE inquiries MODIFY COLUMN status ENUM('new','in_review','contacted','proposal_sent','converted','archived') NOT NULL DEFAULT 'new'";
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------
-- project_team_assignments: many-to-many between projects and team_members
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `project_team_assignments` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id` bigint(20) UNSIGNED NOT NULL,
  `team_member_id` bigint(20) UNSIGNED NOT NULL,
  `role_on_project` varchar(150) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uix_project_team` (`project_id`, `team_member_id`),
  KEY `idx_pta_project` (`project_id`),
  KEY `idx_pta_team_member` (`team_member_id`),
  CONSTRAINT `fk_pta_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pta_team_member` FOREIGN KEY (`team_member_id`) REFERENCES `team_members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;

-- =====================================================================
-- After running this file, your schema supports:
--   team_members.skills, team_members.github
--   services.category / technologies / features / delivery_time / icon
--   projects.category / live_demo_url / github_url / challenge / solution / impact_metrics
--   inquiries.budget / timeline / expanded status pipeline
--   project_team_assignments (many-to-many projects <-> team_members)
-- =====================================================================
