
DROP DATABASE IF EXISTS `devel`;
CREATE DATABASE `devel` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `devel`;

CREATE TABLE `accounts` (
                            `id` char(36) NOT NULL,
                            `email` varchar(512) NOT NULL,
                            `password` varchar(255) NOT NULL,
                            `status` tinyint(4) DEFAULT NULL,
                            `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
                            `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            PRIMARY KEY (`id`),
                            UNIQUE KEY `id_UNIQUE` (`id`),
                            UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB;

insert into accounts (id, email, password, status) values
(uuid(), 'mainacc@mail.com', md5('password1'), 2),
(uuid(), 'pendingacc@mail.com', md5('password1'), 1),
(uuid(), 'declinedacc@mail.com', md5('password1'), 3);


CREATE TABLE `accountStatus` (
                                 `id` tinyint(1) NOT NULL,
                                 `status` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
                                 PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


insert into accountStatus (id, status) values
                                           (1, 'pending'), (2, 'approved'), (3, 'declined'), (4, 'suspended');