

--
-- Database: `4Insights`
--

-- --------------------------------------------------------


SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+02:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


-- --------------------------------------------------------


--
-- Table structure for table `site_info`
--

CREATE TABLE IF NOT EXISTS `site_info` (
    `site_id` INT NOT NULL AUTO_INCREMENT, -- Primary key
    `site_name` VARCHAR(255) NOT NULL, -- Name of the website
    `public_token` VARCHAR(255) NOT NULL, -- Token used by tracker
    `retention_days` INT NOT NULL DEFAULT 30, -- Data retention period (30 days by default)
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Timestamp
    PRIMARY KEY (`site_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;


--
-- Table structure for table `event_type`
--

CREATE TABLE IF NOT EXISTS `event_type` (
    `event_type_id` INT NOT NULL AUTO_INCREMENT, -- Primary key
    `event_name` VARCHAR(255) NOT NULL, -- Name of the event
    `description` TEXT NOT NULL, -- Description of the event
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Timestamp
    PRIMARY KEY (`event_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;


--
-- Table structure for table `routeParams_info`
--

CREATE TABLE IF NOT EXISTS `routeParams_info` (
    `routeParams_id` INT NOT NULL AUTO_INCREMENT, -- Primary key
    `route_param_name` VARCHAR(255) NOT NULL, -- Name of the route parameter
    Primary KEY (`routeParams_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;


--
-- Table structure for table `metadata_templates`
--

CREATE TABLE IF NOT EXISTS `metadata_templates` (
    `metadata_id` INT NOT NULL AUTO_INCREMENT, -- Primary key
    `metadata_url` VARCHAR(255) NOT NULL, -- URL of the metadata template
    `url_path` VARCHAR(255) NOT NULL, -- URL path where the template is applied
    `host_name` VARCHAR(255) NOT NULL, -- Host name
    `hash_value` VARCHAR(255) NOT NULL, -- Hash value for integrity
    `query_params` VARCHAR(255) NULL, -- Optional query parameters
    `routeParams` INT NULL, -- Optional route parameters
    PRIMARY KEY (`metadata_id`),
    UNIQUE KEY `unique_metadata` (`metadata_url`, `url_path`, `host_name`),
    FOREIGN KEY (`routeParams`) REFERENCES `routeParams_info`(`routeParams_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;


--
-- Table structure for table `event_logs`
--

CREATE TABLE IF NOT EXISTS `event_logs` (
    `event_id` INT NOT NULL AUTO_INCREMENT, -- Primary key
    `site_info_id` INT NOT NULL, -- Foreign key to site_info
    `event_type_id` INT NOT NULL, -- Foreign key to event_type
    `path` VARCHAR(2048) NOT NULL, -- Path where the event occurred
    `referrer` VARCHAR(255) NULL, -- Optional referrer
    `screen_w` INT NOT NULL, -- screen_w – Screen width
    `screen_h` INT NOT NULL, -- screen_h – Screen height
    `metadata_templates_id` INT NOT NULL, -- Reference metadata_templates and retrieve data as a JSON object
    `received_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Timestamp of the event
    PRIMARY KEY (`event_id`),
    FOREIGN KEY (`site_info_id`) REFERENCES `site_info`(`site_id`) ON DELETE CASCADE,
    FOREIGN KEY (`event_type_id`) REFERENCES `event_type`(`event_type_id`) ON DELETE CASCADE,
    FOREIGN KEY (`metadata_templates_id`) REFERENCES `metadata_templates`(`metadata_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;


--
-- Table structure for table `session_type`
--

-- this table stores info about user if is on free or paid session
CREATE TABLE IF NOT EXISTS `session_type` (
    `session_type_id` INT NOT NULL AUTO_INCREMENT, -- Primary key
    `type_name` NOT NULL ENUM('free_mode', 'paid_seesion'), -- Type of session
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Timestamp
    PRIMARY KEY (`session_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;


--
-- Table structure for table `free_mode_session`
--

-- this table stores info about user if is on free or paid session
CREATE TABLE IF NOT EXISTS `free_mode_session` (
    `session_id` INT NOT NULL AUTO_INCREMENT, -- Primary key
    `session_type_id` INT NOT NULL, -- Foreign key to session_type
    `user_identifier` VARCHAR(255) NOT NULL, -- Unique identifier for the user
    `session_script` TEXT NOT NULL, -- Session script data
    `expires_at` TIMESTAMP NOT NULL DEFAULT (DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 HOUR)), -- Expiry timestamp (after an hour)
    PRIMARY KEY (`session_id`),
    FOREIGN KEY (`session_type_id`) REFERENCES `session_type`(`session_type_id`) ON DELETE CASCADE,
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;
