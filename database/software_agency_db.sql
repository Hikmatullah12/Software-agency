-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 24, 2026 at 10:42 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `software_agency_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `role` enum('superadmin','admin') NOT NULL DEFAULT 'admin',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `email`, `password_hash`, `full_name`, `role`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'admin@example.com', '$2b$12$43UFDNIoT0BfLn.CzdZrAOVDbl4IXoW5eidvkAhpjqNVLnrKNs9qC', 'Site Administrator', 'superadmin', 1, '2026-08-23 16:06:52', '2026-08-23 12:48:08', '2026-08-23 16:06:52');

-- --------------------------------------------------------

--
-- Table structure for table `inquiries`
--

CREATE TABLE `inquiries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `service_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` enum('new','in_progress','completed','rejected') NOT NULL DEFAULT 'new',
  `source` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inquiries`
--

INSERT INTO `inquiries` (`id`, `service_id`, `name`, `email`, `phone`, `message`, `status`, `source`, `created_at`, `updated_at`) VALUES
(1, 1, 'Marcus Vance', 'marcus.vance@techcorp.io', '+1 (555) 234-5678', 'We are looking to rebuild our customer portal from Angular to React/Node.js with multi-tenant role permissions. Target launch Q3.', 'in_progress', 'Website Main Inquiry Form', '2026-08-24 13:43:43', '2026-08-24 13:43:43'),
(2, 2, 'Dr. Amanda Sterling', 'sterling@medconnect.org', '+1 (555) 876-5432', 'Need an iOS & Android app for patient prescription refills and secure doctor messaging with HIPAA compliance.', 'new', 'AI Advisor Recommendation', '2026-08-24 13:43:43', '2026-08-24 13:43:43'),
(3, 4, 'David Chen', 'dchen@logistics-plus.com', '+1 (555) 345-9876', 'Our PostgreSQL database is experiencing slow query bottlenecks during peak hour traffic. Seeking full optimization and indexing audit.', 'completed', 'Website Main Inquiry Form', '2026-08-24 13:43:43', '2026-08-24 13:43:43');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `service_id` int(10) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `technologies` text NOT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `client` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('planned','active','completed','archived') NOT NULL DEFAULT 'active',
  `cover_image` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `service_id`, `title`, `slug`, `technologies`, `short_description`, `description`, `client`, `start_date`, `end_date`, `status`, `cover_image`, `created_at`, `updated_at`) VALUES
(1, 1, 'Fintech Core Payment Processing Engine', 'fintech-core-payment-gateway', 'React, TypeScript, Node.js, PostgreSQL, Redis, Stripe, Docker', 'Engineered a PCI-compliant real-time payment gateway processing over $12M monthly with 99.99% uptime.', 'A high-throughput distributed payment settlement platform built for modern financial institutions. Features multi-currency reconciliation, automated fraud detection triggers, and microservice resilience patterns.', 'Apex Global Financial Corp', '2024-03-01', '2024-08-15', 'completed', 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1000&q=80', '2026-08-24 13:43:43', '2026-08-24 13:43:43'),
(2, 2, 'HealthSync Telehealth & Vitals Monitoring', 'healthsync-telehealth-ios-android', 'Flutter, WebRTC, Node.js, Cloud SQL, Firebase, HIPAA Compliance', 'HIPAA-compliant telemedicine platform with encrypted video consultations and real-time Bluetooth vitals sync.', 'A cross-platform mobile ecosystem connecting over 45,000 active patients with certified clinical specialists. Integrated with smart BLE health sensors and real-time medical chart updates.', 'BioHealth Networks', '2024-06-10', '2024-11-20', 'completed', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80', '2026-08-24 13:43:43', '2026-08-24 13:43:43'),
(3, 4, 'Global Logistics Real-Time Analytics Pipeline', 'global-logistics-realtime-analytics', 'PostgreSQL, Apache Kafka, ClickHouse, Next.js, Tailwind CSS', 'Real-time telemetry and supply chain monitoring tracking 150,000+ freight shipments simultaneously across 18 countries.', 'Architected a sub-second distributed analytics engine capable of ingesting 2.4 million sensor events per minute, driving automated route re-dispatching and carbon-reduction analytics.', 'Vanguard TransGlobal Logistics', '2024-09-01', '2025-01-30', 'completed', 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1000&q=80', '2026-08-24 13:43:43', '2026-08-24 13:43:43'),
(4, 5, 'Zero-Trust Identity & API Hardening Suite', 'zero-trust-identity-suite', 'OAuth2, OpenID Connect, Node.js, Envoy Proxy, Redis Sentinel, Docker', 'Enterprise zero-trust perimeter defense and access control for 8,500 internal employees and 420 microservices.', 'Complete overhaul of authentication architecture replacing legacy VPNs with context-aware, biometric-enforced zero-trust gateway routing and automated anomaly blocking.', 'CyberShield Enterprise Solutions', '2024-11-01', NULL, 'active', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80', '2026-08-24 13:43:43', '2026-08-24 13:43:43');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `summary` varchar(500) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `image_path` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `name`, `slug`, `summary`, `description`, `price`, `image_path`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Full-Stack Web Development', 'web-development', 'High-performance React, Vue, Next.js, and Node.js enterprise web applications with responsive architecture.', 'We engineer end-to-end full-stack web applications tailored for enterprise scale. From decoupled TypeScript frontends to high-throughput backend APIs, we deliver secure, accessible, and ultra-fast web platforms.', 2499.00, 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80', 1, '2026-08-24 13:43:43', '2026-08-24 13:43:43'),
(2, 'Cross-Platform Mobile Apps', 'mobile-development', 'Native and hybrid iOS and Android solutions built with Flutter and React Native with offline-first capabilities.', 'Deliver seamless user experiences across mobile platforms. We specialize in Flutter and React Native architectures featuring real-time data sync, push notification systems, biometric authentication, and high frame-rate animations.', 2999.00, 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80', 1, '2026-08-24 13:43:43', '2026-08-24 13:43:43'),
(3, 'Enterprise UI/UX Design Systems', 'uiux-design', 'Human-centered user experience design, comprehensive design systems, interactive prototypes, and UX audits.', 'We design intuitive, conversion-focused software interfaces. Our team creates scalable Figma tokenized design systems, WCAG AA compliant palettes, and interactive user flows validated through usability tests.', 1799.00, 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=1200&q=80', 1, '2026-08-24 13:43:43', '2026-08-24 13:43:43'),
(4, 'Cloud Database & Big Data Solutions', 'database-solutions', 'High-availability SQL & NoSQL clusters, data pipeline engineering, query optimization, and cloud migration.', 'Design, optimize, and maintain high-performance database infrastructures. We architect normalized relational schemas, implement Redis cache tiers, and configure automated failover replication.', 3499.00, 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80', 1, '2026-08-24 13:43:43', '2026-08-24 13:43:43'),
(5, 'Cybersecurity & Zero-Trust Hardening', 'cybersecurity', 'Vulnerability audits, penetration testing, automated rate-limiting, and zero-trust authentication protocols.', 'Protect your digital assets with enterprise-grade security protocols. We implement JWT lifecycle rotation, OWASP vulnerability remediation, CSRF protections, automated WAF policies, and security compliance audits.', 3999.00, 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80', 1, '2026-08-24 13:43:43', '2026-08-24 13:43:43'),
(6, 'Digital Transformation & IT Consulting', 'it-consulting', 'Strategic technical advisory, legacy codebase modernization, CI/CD pipeline automation, and tech stack audits.', 'Bridge the gap between strategic business objectives and technology execution. We audit legacy codebases, design cloud migration blueprints, and establish modern DevOps release pipelines.', 1999.00, 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80', 1, '2026-08-24 13:43:43', '2026-08-24 13:43:43');

-- --------------------------------------------------------

--
-- Table structure for table `team_members`
--

CREATE TABLE `team_members` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `role` varchar(150) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `photo` varchar(500) DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `team_members`
--

INSERT INTO `team_members` (`id`, `full_name`, `role`, `bio`, `email`, `photo`, `linkedin`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Hikmatullah (Hikmat)', 'Founder & Principal Architect', 'Principal systems architect with 10+ years engineering high-load cloud architectures, full-stack enterprise systems, and zero-trust web infrastructure.', 'hikmat@hikmat.tech', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'https://linkedin.com', 1, '2026-08-24 13:43:43', '2026-08-24 13:43:43'),
(2, 'Sarah Jenkins', 'Lead Frontend & UI Systems Architect', 'Students', NULL, '/uploads/team/1787479106357-395f031a-7284-42dc-8862-7f9d5330f999.png', NULL, 1, '2026-08-23 14:58:26', '2026-08-24 13:43:43'),
(3, 'Tariq Al-Mansoor', 'Head of Cloud & Database Infrastructure', 'student', NULL, '/uploads/team/1787480166271-c201b1e2-f526-45bf-8ced-337c3f4aa08c.png', NULL, 1, '2026-08-23 15:16:06', '2026-08-24 13:43:43'),
(4, 'Elena Rostova', 'Chief Information Security Officer (CISO)', 'Certified ethical hacker (CEH, CISSP) managing zero-trust API hardening, penetration testing protocols, and client compliance audits.', 'elena.r@hikmat.tech', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', 'https://linkedin.com', 1, '2026-08-24 13:43:43', '2026-08-24 13:43:43');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uix_admins_email` (`email`),
  ADD KEY `idx_admins_last_login` (`last_login`);

--
-- Indexes for table `inquiries`
--
ALTER TABLE `inquiries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_inquiries_service_id` (`service_id`),
  ADD KEY `idx_inquiries_email` (`email`),
  ADD KEY `idx_inquiries_status` (`status`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uix_projects_slug` (`slug`),
  ADD KEY `idx_projects_service_id` (`service_id`),
  ADD KEY `idx_projects_status` (`status`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uix_services_name` (`name`),
  ADD UNIQUE KEY `uix_services_slug` (`slug`),
  ADD KEY `idx_services_is_active` (`is_active`);

--
-- Indexes for table `team_members`
--
ALTER TABLE `team_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_team_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `inquiries`
--
ALTER TABLE `inquiries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `team_members`
--
ALTER TABLE `team_members`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `inquiries`
--
ALTER TABLE `inquiries`
  ADD CONSTRAINT `fk_inquiries_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `fk_projects_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
