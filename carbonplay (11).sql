-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 24, 2025 at 01:02 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `carbonplay`
--

-- --------------------------------------------------------

--
-- Table structure for table `challenges`
--

CREATE TABLE `challenges` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `target_reduction` decimal(10,2) DEFAULT NULL COMMENT 'DEPRECATED: Use challenge_type and target_value instead',
  `target_mode` enum('percent_reduction','absolute_accumulate','absolute_ceiling') DEFAULT 'percent_reduction' COMMENT 'DEPRECATED: Use challenge_type instead',
  `target_value` decimal(10,2) DEFAULT NULL,
  `challenge_type` enum('daily_limit','total_limit','activity_count','consecutive_days') DEFAULT 'daily_limit',
  `target_unit` varchar(50) DEFAULT 'kg_co2e',
  `metric` enum('co2e','quantity') DEFAULT 'co2e' COMMENT 'DEPRECATED: Use target_unit instead',
  `duration_days` int(11) DEFAULT 30,
  `badge_name` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `challenges`
--

INSERT INTO `challenges` (`id`, `name`, `description`, `target_reduction`, `target_mode`, `target_value`, `challenge_type`, `target_unit`, `metric`, `duration_days`, `badge_name`, `is_active`, `created_at`) VALUES
(1, 'Daily car_gasoline Limit', 'Keep your daily car_gasoline emissions under 4.0 kg CO2e', NULL, 'percent_reduction', 4.04, 'daily_limit', 'kg_co2e', 'co2e', 7, 'car_gasoline Saver', 1, '2025-10-23 21:29:30'),
(2, 'Daily beef Limit', 'Keep your daily beef emissions under 270.0 kg CO2e', NULL, 'percent_reduction', 270.00, 'daily_limit', 'kg_co2e', 'co2e', 7, 'beef Saver', 1, '2025-10-23 22:00:01');

-- --------------------------------------------------------

--
-- Table structure for table `challenge_daily_logs`
--

CREATE TABLE `challenge_daily_logs` (
  `id` int(11) NOT NULL,
  `user_challenge_id` int(11) NOT NULL,
  `day_number` int(11) NOT NULL COMMENT '1 to duration_days',
  `log_date` date NOT NULL COMMENT 'Actual calendar date for this day',
  `value_logged` decimal(10,2) DEFAULT NULL COMMENT 'CO2e amount or activity count logged',
  `notes` text DEFAULT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  `logged_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `challenge_daily_logs`
--

INSERT INTO `challenge_daily_logs` (`id`, `user_challenge_id`, `day_number`, `log_date`, `value_logged`, `notes`, `is_completed`, `logged_at`, `created_at`) VALUES
(1, 1, 1, '2025-10-23', 3.00, NULL, 1, '2025-10-23 21:49:13', '2025-10-23 21:49:13'),
(2, 2, 1, '2025-10-23', 270.00, 'Test', 1, '2025-10-23 22:00:30', '2025-10-23 22:00:30');

-- --------------------------------------------------------

--
-- Table structure for table `emission_factors`
--

CREATE TABLE `emission_factors` (
  `id` int(11) NOT NULL,
  `category` varchar(50) NOT NULL,
  `activity_type` varchar(100) NOT NULL,
  `region` varchar(50) DEFAULT 'global',
  `co2e_per_unit` decimal(10,6) NOT NULL,
  `unit` varchar(20) NOT NULL,
  `source` varchar(50) DEFAULT NULL,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `emission_factors`
--

INSERT INTO `emission_factors` (`id`, `category`, `activity_type`, `region`, `co2e_per_unit`, `unit`, `source`, `last_updated`) VALUES
(1, 'transport', 'car_gasoline', 'US', 0.404000, 'kg_per_mile', 'climatiq', '2025-10-02 21:52:57'),
(2, 'transport', 'bus', 'US', 0.089000, 'kg_per_mile', 'climatiq', '2025-10-02 21:52:57'),
(3, 'transport', 'bicycle', 'global', 0.000000, 'kg_per_mile', 'manual', '2025-10-02 21:52:57'),
(4, 'diet', 'beef', 'global', 27.000000, 'kg_per_kg', 'coolclimate', '2025-10-02 21:52:57'),
(5, 'diet', 'chicken', 'global', 6.900000, 'kg_per_kg', 'coolclimate', '2025-10-02 21:52:57'),
(6, 'diet', 'vegetables', 'global', 2.000000, 'kg_per_kg', 'coolclimate', '2025-10-02 21:52:57'),
(7, 'energy', 'electricity', 'US', 0.385000, 'kg_per_kwh', 'climatiq', '2025-10-02 21:52:57');

-- --------------------------------------------------------

--
-- Table structure for table `scenarios`
--

CREATE TABLE `scenarios` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `total_co2e` decimal(10,2) DEFAULT 0.00,
  `vs_baseline` decimal(10,2) DEFAULT 0.00,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `scenarios`
--

INSERT INTO `scenarios` (`id`, `user_id`, `name`, `description`, `total_co2e`, `vs_baseline`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Test', 'Test', 0.00, 0.00, 0, '2025-10-23 21:19:48', '2025-10-23 21:28:32'),
(2, 3, 'Car', 'Car', 0.81, 0.00, 1, '2025-10-23 21:28:04', '2025-10-23 21:28:08'),
(3, 1, 'Meat', 'meat', 54.00, 0.00, 1, '2025-10-23 21:28:39', '2025-10-23 21:28:50');

-- --------------------------------------------------------

--
-- Table structure for table `scenario_activities`
--

CREATE TABLE `scenario_activities` (
  `id` int(11) NOT NULL,
  `scenario_id` int(11) NOT NULL,
  `category` enum('transport','diet','energy','waste','other') NOT NULL,
  `activity_type` varchar(100) NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `unit` varchar(20) NOT NULL,
  `co2e_amount` decimal(10,2) NOT NULL,
  `api_source` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `scenario_activities`
--

INSERT INTO `scenario_activities` (`id`, `scenario_id`, `category`, `activity_type`, `value`, `unit`, `co2e_amount`, `api_source`, `created_at`) VALUES
(1, 2, 'transport', 'car_gasoline', 2.00, 'miles', 0.81, 'default', '2025-10-23 21:28:08'),
(2, 3, 'diet', 'beef', 2.00, 'kg', 54.00, 'coolclimate', '2025-10-23 21:28:50');

-- --------------------------------------------------------

--
-- Table structure for table `social_likes`
--

CREATE TABLE `social_likes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `milestone_user_id` int(11) NOT NULL COMMENT 'User whose milestone is being liked',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `social_tips`
--

CREATE TABLE `social_tips` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `tip_type` enum('general','transport','diet','energy','waste') DEFAULT 'general',
  `likes_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `social_tips`
--

INSERT INTO `social_tips` (`id`, `user_id`, `content`, `tip_type`, `likes_count`, `created_at`, `updated_at`) VALUES
(1, 1, 'I love carbon reduction!', 'general', 0, '2025-10-23 22:02:25', '2025-10-23 22:02:25');

-- --------------------------------------------------------

--
-- Table structure for table `social_tip_likes`
--

CREATE TABLE `social_tip_likes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `tip_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Maria_cutie', 'kimjensenyebes@gmail.com', '$2b$10$k5Fk5UT7L7Vtd8JO7IY2p.iUMp6RWxhjDDJgrNOcp3Yb1Fcrw8o1W', 'user', 1, '2025-10-02 22:00:56', '2025-10-23 22:54:40'),
(2, 'maria_labi58', 'emlabi@gmail.com', '$2b$10$0u1A6nd3jesBTuH6pCMI6e1wbv1Npt0IYVp3/WZycVc1GR4rICNP.', 'user', 1, '2025-10-17 18:34:47', '2025-10-17 18:34:47'),
(3, 'second_acc69', 'secondacc@gmail.com', '$2b$10$ODyjeUuThUJW1kl75wU2zuA0ZdG5.rP.6uesbW8nZ/PIZ6sWrAqIO', 'user', 1, '2025-10-23 21:27:52', '2025-10-23 21:27:52'),
(4, 'third_account80', 'thirdaccount@gmail.com', '$2b$10$12AAE8OgtlTCmYFS3gFeNOWhfuZvy/JBDOtJN7bEJuhUYgJwlq0MO', 'user', 1, '2025-10-23 22:55:00', '2025-10-23 22:55:00');

-- --------------------------------------------------------

--
-- Table structure for table `user_challenges`
--

CREATE TABLE `user_challenges` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `challenge_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `starting_co2e` decimal(10,2) DEFAULT NULL,
  `current_co2e` decimal(10,2) DEFAULT NULL,
  `completed` tinyint(1) DEFAULT 0,
  `scope_type` enum('all','scenario','category','activity') DEFAULT 'all',
  `scope_ref_id` int(11) DEFAULT NULL,
  `scope_value` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `current_day` int(11) DEFAULT 1 COMMENT 'Current unlocked day (1 to duration_days)',
  `last_log_date` date DEFAULT NULL COMMENT 'Last date user logged data',
  `total_progress` decimal(10,2) DEFAULT 0.00 COMMENT 'Total value logged across all days',
  `days_completed` int(11) DEFAULT 0 COMMENT 'Number of days completed'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_challenges`
--

INSERT INTO `user_challenges` (`id`, `user_id`, `challenge_id`, `start_date`, `end_date`, `starting_co2e`, `current_co2e`, `completed`, `scope_type`, `scope_ref_id`, `scope_value`, `created_at`, `current_day`, `last_log_date`, `total_progress`, `days_completed`) VALUES
(1, 1, 1, '2025-10-24', NULL, 0.00, 0.00, 0, 'all', NULL, NULL, '2025-10-23 21:37:57', 1, '2025-10-24', 3.00, 1),
(2, 1, 2, '2025-10-24', NULL, 0.00, 0.00, 0, 'all', NULL, NULL, '2025-10-23 22:00:07', 1, '2025-10-24', 270.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_profiles`
--

CREATE TABLE `user_profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `country` varchar(50) DEFAULT 'US',
  `household_size` int(11) DEFAULT 1,
  `baseline_calculated` tinyint(1) DEFAULT 0,
  `baseline_co2e` decimal(10,2) DEFAULT 0.00,
  `profile_picture` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_profiles`
--

INSERT INTO `user_profiles` (`id`, `user_id`, `country`, `household_size`, `baseline_calculated`, `baseline_co2e`, `profile_picture`, `created_at`, `updated_at`) VALUES
(1, 1, 'US', 1, 0, 0.00, '/uploads/profiles/profilePicture-1761249550940-714436096.jpg', '2025-10-02 22:00:56', '2025-10-23 19:59:10'),
(2, 2, 'US', 1, 0, 0.00, NULL, '2025-10-17 18:34:47', '2025-10-17 18:34:47'),
(3, 3, 'US', 1, 0, 0.00, NULL, '2025-10-23 21:27:52', '2025-10-23 21:27:52'),
(4, 4, 'US', 1, 0, 0.00, NULL, '2025-10-23 22:55:00', '2025-10-23 22:55:00');

-- --------------------------------------------------------

--
-- Table structure for table `user_xp`
--

CREATE TABLE `user_xp` (
  `user_id` int(11) NOT NULL,
  `xp_total` int(11) NOT NULL DEFAULT 0,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_xp`
--

INSERT INTO `user_xp` (`user_id`, `xp_total`, `last_updated`) VALUES
(1, 72, '2025-10-23 22:00:30');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `challenges`
--
ALTER TABLE `challenges`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `challenge_daily_logs`
--
ALTER TABLE `challenge_daily_logs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_challenge_day` (`user_challenge_id`,`day_number`),
  ADD KEY `idx_user_challenge` (`user_challenge_id`),
  ADD KEY `idx_log_date` (`log_date`),
  ADD KEY `idx_challenge_day` (`user_challenge_id`,`day_number`),
  ADD KEY `idx_completion` (`user_challenge_id`,`is_completed`);

--
-- Indexes for table `emission_factors`
--
ALTER TABLE `emission_factors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_factor` (`category`,`activity_type`,`region`);

--
-- Indexes for table `scenarios`
--
ALTER TABLE `scenarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_active` (`user_id`,`is_active`);

--
-- Indexes for table `scenario_activities`
--
ALTER TABLE `scenario_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_scenario_category` (`scenario_id`,`category`);

--
-- Indexes for table `social_likes`
--
ALTER TABLE `social_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_like` (`user_id`,`milestone_user_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `milestone_user_id` (`milestone_user_id`);

--
-- Indexes for table `social_tips`
--
ALTER TABLE `social_tips`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `social_tip_likes`
--
ALTER TABLE `social_tip_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_tip_like` (`user_id`,`tip_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `tip_id` (`tip_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- Indexes for table `user_challenges`
--
ALTER TABLE `user_challenges`
  ADD PRIMARY KEY (`id`),
  ADD KEY `challenge_id` (`challenge_id`),
  ADD KEY `idx_user_active` (`user_id`,`completed`),
  ADD KEY `idx_scope` (`scope_type`,`scope_ref_id`);

--
-- Indexes for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user_xp`
--
ALTER TABLE `user_xp`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `challenges`
--
ALTER TABLE `challenges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `challenge_daily_logs`
--
ALTER TABLE `challenge_daily_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `emission_factors`
--
ALTER TABLE `emission_factors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `scenarios`
--
ALTER TABLE `scenarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `scenario_activities`
--
ALTER TABLE `scenario_activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `social_likes`
--
ALTER TABLE `social_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `social_tips`
--
ALTER TABLE `social_tips`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `social_tip_likes`
--
ALTER TABLE `social_tip_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_challenges`
--
ALTER TABLE `user_challenges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_profiles`
--
ALTER TABLE `user_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `challenge_daily_logs`
--
ALTER TABLE `challenge_daily_logs`
  ADD CONSTRAINT `fk_challenge_daily_user_challenge` FOREIGN KEY (`user_challenge_id`) REFERENCES `user_challenges` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `scenarios`
--
ALTER TABLE `scenarios`
  ADD CONSTRAINT `scenarios_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `scenario_activities`
--
ALTER TABLE `scenario_activities`
  ADD CONSTRAINT `scenario_activities_ibfk_1` FOREIGN KEY (`scenario_id`) REFERENCES `scenarios` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `social_likes`
--
ALTER TABLE `social_likes`
  ADD CONSTRAINT `social_likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `social_likes_ibfk_2` FOREIGN KEY (`milestone_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `social_tips`
--
ALTER TABLE `social_tips`
  ADD CONSTRAINT `social_tips_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `social_tip_likes`
--
ALTER TABLE `social_tip_likes`
  ADD CONSTRAINT `social_tip_likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `social_tip_likes_ibfk_2` FOREIGN KEY (`tip_id`) REFERENCES `social_tips` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_challenges`
--
ALTER TABLE `user_challenges`
  ADD CONSTRAINT `user_challenges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_challenges_ibfk_2` FOREIGN KEY (`challenge_id`) REFERENCES `challenges` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD CONSTRAINT `user_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_xp`
--
ALTER TABLE `user_xp`
  ADD CONSTRAINT `user_xp_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
