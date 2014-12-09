# ************************************************************
# Sequel Pro SQL dump
# Version 4096
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Host: localhost (MySQL 5.6.21)
# Database: txtapp
# Generation Time: 2014-12-09 13:00:48 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table alert
# ------------------------------------------------------------

DROP TABLE IF EXISTS `alert`;

CREATE TABLE `alert` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sms` varchar(160) NOT NULL,
  `audio` text,
  `send` int(11) DEFAULT NULL,
  `connectSenior` tinyint(1) DEFAULT NULL,
  `connectJunior` tinyint(1) DEFAULT NULL,
  `connectRepresentative` tinyint(1) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT '0',
  `connectCustom` varchar(12) DEFAULT NULL,
  `connectCustomTitle` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table campaign_categories
# ------------------------------------------------------------

DROP TABLE IF EXISTS `campaign_categories`;

CREATE TABLE `campaign_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `campaign_categories_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `subscription_categories` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table campaign_target_sets
# ------------------------------------------------------------

DROP TABLE IF EXISTS `campaign_target_sets`;

CREATE TABLE `campaign_target_sets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `alert_id` int(11) NOT NULL,
  `target_set_id` int(11) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table rep_types
# ------------------------------------------------------------

DROP TABLE IF EXISTS `rep_types`;

CREATE TABLE `rep_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rep` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `rep_types` WRITE;
/*!40000 ALTER TABLE `rep_types` DISABLE KEYS */;

INSERT INTO `rep_types` (`id`, `rep`)
VALUES
	(1,'Senior Senator'),
	(2,'Junior Senator'),
	(3,'Represenative'),
	(4,'all');

/*!40000 ALTER TABLE `rep_types` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table sent
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sent`;

CREATE TABLE `sent` (
  `user_id` int(11) NOT NULL,
  `alert_id` int(11) NOT NULL,
  `status` int(11) DEFAULT NULL,
  `sid` varchar(45) NOT NULL,
  `sent_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`sid`),
  KEY `fk_subscriber_has_alert_subscriber` (`user_id`),
  KEY `fk_subscriber_has_alert_alert1` (`alert_id`),
  CONSTRAINT `fk_subscriber_has_alert_alert1` FOREIGN KEY (`alert_id`) REFERENCES `alert` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_subscriber_has_alert_subscriber` FOREIGN KEY (`user_id`) REFERENCES `subscriber` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table subscriber
# ------------------------------------------------------------

DROP TABLE IF EXISTS `subscriber`;

CREATE TABLE `subscriber` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `number` varchar(12) NOT NULL,
  `first_name` varchar(45) DEFAULT NULL,
  `last_name` varchar(45) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text,
  `city` varchar(45) DEFAULT NULL,
  `state` varchar(2) DEFAULT NULL,
  `zipcode` varchar(5) DEFAULT NULL,
  `lat` varchar(12) DEFAULT NULL,
  `long` varchar(12) DEFAULT NULL,
  `district` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT '0',
  `timestamp` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table subscription_categories
# ------------------------------------------------------------

DROP TABLE IF EXISTS `subscription_categories`;

CREATE TABLE `subscription_categories` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `created` int(11) DEFAULT NULL,
  `name` varchar(160) NOT NULL,
  `description` varchar(160) NOT NULL,
  `status` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table target_sets
# ------------------------------------------------------------

DROP TABLE IF EXISTS `target_sets`;

CREATE TABLE `target_sets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rep_id` int(11) DEFAULT NULL,
  `district` int(11) DEFAULT NULL,
  `geo_target` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `target_sets` WRITE;
/*!40000 ALTER TABLE `target_sets` DISABLE KEYS */;

INSERT INTO `target_sets` (`id`, `rep_id`, `district`, `geo_target`)
VALUES

	(7,1,NULL,'AL'),
	(8,1,NULL,'AL'),
	(9,1,NULL,'AL'),
	(10,1,NULL,'AL'),
	(11,1,NULL,'AL'),
	(12,1,NULL,'00'),
	(13,1,NULL,'00'),
	(14,1,NULL,'00'),
	(21,1,NULL,'AZ'),
	(22,1,NULL,'AK'),
	(23,1,NULL,'AR'),
	(24,1,NULL,'CA'),
	(25,1,NULL,'CO'),
	(26,1,NULL,'CT'),
	(27,1,NULL,'DE'),
	(28,1,NULL,'DC'),
	(29,1,NULL,'FL'),
	(30,1,NULL,'GA'),
	(31,1,NULL,'HI'),
	(32,1,NULL,'ID'),
	(33,1,NULL,'IL'),
	(34,1,NULL,'IN'),
	(35,1,NULL,'IA'),
	(36,1,NULL,'KS'),
	(37,1,NULL,'KY'),
	(38,1,NULL,'LA'),
	(39,1,NULL,'ME'),
	(40,1,NULL,'MD'),
	(41,1,NULL,'MA'),
	(42,1,NULL,'MI'),
	(43,1,NULL,'MN'),
	(44,1,NULL,'MS'),
	(45,1,NULL,'MO'),
	(46,1,NULL,'MT'),
	(47,1,NULL,'NE'),
	(48,1,NULL,'NV'),
	(49,1,NULL,'NH'),
	(50,1,NULL,'NJ'),
	(51,1,NULL,'NM'),
	(52,1,NULL,'NY'),
	(53,1,NULL,'NC'),
	(54,1,NULL,'ND'),
	(55,1,NULL,'OH'),
	(56,1,NULL,'OK'),
	(57,1,NULL,'OR'),
	(58,1,NULL,'PA'),
	(59,1,NULL,'RI'),
	(60,1,NULL,'SC'),
	(61,1,NULL,'SD'),
	(62,1,NULL,'TN'),
	(63,1,NULL,'TX'),
	(64,1,NULL,'UT'),
	(65,1,NULL,'VT'),
	(66,1,NULL,'VA'),
	(67,1,NULL,'WA'),
	(68,1,NULL,'WV'),
	(69,1,NULL,'WI'),
	(70,1,NULL,'WY'),
	(71,2,NULL,'00'),
	(72,2,NULL,'AL'),
	(73,2,NULL,'AK'),
	(74,2,NULL,'AZ'),
	(75,2,NULL,'AR'),
	(76,2,NULL,'CA'),
	(77,2,NULL,'CO'),
	(78,2,NULL,'CT'),
	(79,2,NULL,'DE'),
	(80,2,NULL,'DC'),
	(81,2,NULL,'FL'),
	(82,2,NULL,'GA'),
	(83,2,NULL,'HI'),
	(84,2,NULL,'ID'),
	(85,2,NULL,'IL'),
	(86,2,NULL,'IN'),
	(87,2,NULL,'IA'),
	(88,2,NULL,'KS'),
	(89,2,NULL,'KY'),
	(90,2,NULL,'LA'),
	(91,2,NULL,'ME'),
	(92,2,NULL,'MD'),
	(93,2,NULL,'MA'),
	(94,2,NULL,'MI'),
	(95,2,NULL,'MN'),
	(96,2,NULL,'MS'),
	(97,2,NULL,'MO'),
	(98,2,NULL,'MT'),
	(99,2,NULL,'NE'),
	(100,2,NULL,'NV'),
	(101,2,NULL,'NH'),
	(102,2,NULL,'NJ'),
	(103,2,NULL,'NM'),
	(104,2,NULL,'NY'),
	(105,2,NULL,'NC'),
	(106,2,NULL,'ND'),
	(107,2,NULL,'OH'),
	(108,2,NULL,'OK'),
	(109,2,NULL,'OR'),
	(110,2,NULL,'PA'),
	(111,2,NULL,'RI'),
	(112,2,NULL,'SC'),
	(113,2,NULL,'SD'),
	(114,2,NULL,'TN'),
	(115,2,NULL,'TX'),
	(116,2,NULL,'UT'),
	(117,2,NULL,'VT'),
	(118,2,NULL,'VA'),
	(119,2,NULL,'WA'),
	(120,2,NULL,'WV'),
	(121,2,NULL,'WI'),
	(122,2,NULL,'WY'),
	(123,3,NULL,'00'),
	(124,3,NULL,'AL'),
	(125,3,NULL,'AK'),
	(126,3,NULL,'AZ'),
	(127,3,NULL,'AR'),
	(128,3,NULL,'CA'),
	(129,3,NULL,'CO'),
	(130,3,NULL,'CT'),
	(131,3,NULL,'DE'),
	(132,3,NULL,'DC'),
	(133,3,NULL,'FL'),
	(134,3,NULL,'GA'),
	(135,3,NULL,'HI'),
	(136,3,NULL,'ID'),
	(137,3,NULL,'IL'),
	(138,3,NULL,'IN'),
	(139,3,NULL,'IA'),
	(140,3,NULL,'KS'),
	(141,3,NULL,'KY'),
	(142,3,NULL,'LA'),
	(143,3,NULL,'ME'),
	(144,3,NULL,'MD'),
	(145,3,NULL,'MA'),
	(146,3,NULL,'MI'),
	(147,3,NULL,'MN'),
	(148,3,NULL,'MS'),
	(149,3,NULL,'MO'),
	(150,3,NULL,'MT'),
	(151,3,NULL,'NE'),
	(152,3,NULL,'NV'),
	(153,3,NULL,'NH'),
	(154,3,NULL,'NJ'),
	(155,3,NULL,'NM'),
	(156,3,NULL,'NY'),
	(157,3,NULL,'NC'),
	(158,3,NULL,'ND'),
	(159,3,NULL,'OH'),
	(160,3,NULL,'OK'),
	(161,3,NULL,'OR'),
	(162,3,NULL,'PA'),
	(163,3,NULL,'RI'),
	(164,3,NULL,'SC'),
	(165,3,NULL,'SD'),
	(166,3,NULL,'TN'),
	(167,3,NULL,'TX'),
	(168,3,NULL,'UT'),
	(169,3,NULL,'VT'),
	(170,3,NULL,'VA'),
	(171,3,NULL,'WA'),
	(172,3,NULL,'WV'),
	(173,3,NULL,'WI'),
	(174,3,NULL,'WY'),
	(175,4,NULL,'00'),
	(176,4,NULL,'AL'),
	(177,4,NULL,'AK'),
	(178,4,NULL,'AZ'),
	(179,4,NULL,'AR'),
	(180,4,NULL,'CA'),
	(181,4,NULL,'CO'),
	(182,4,NULL,'CT'),
	(183,4,NULL,'DE'),
	(184,4,NULL,'DC'),
	(185,4,NULL,'FL'),
	(186,4,NULL,'GA'),
	(187,4,NULL,'HI'),
	(188,4,NULL,'ID'),
	(189,4,NULL,'IL'),
	(190,4,NULL,'IN'),
	(191,4,NULL,'IA'),
	(192,4,NULL,'KS'),
	(193,4,NULL,'KY'),
	(194,4,NULL,'LA'),
	(195,4,NULL,'ME'),
	(196,4,NULL,'MD'),
	(197,4,NULL,'MA'),
	(198,4,NULL,'MI'),
	(199,4,NULL,'MN'),
	(200,4,NULL,'MS'),
	(201,4,NULL,'MO'),
	(202,4,NULL,'MT'),
	(203,4,NULL,'NE'),
	(204,4,NULL,'NV'),
	(205,4,NULL,'NH'),
	(206,4,NULL,'NJ'),
	(207,4,NULL,'NM'),
	(208,4,NULL,'NY'),
	(209,4,NULL,'NC'),
	(210,4,NULL,'ND'),
	(211,4,NULL,'OH'),
	(212,4,NULL,'OK'),
	(213,4,NULL,'OR'),
	(214,4,NULL,'PA'),
	(215,4,NULL,'RI'),
	(216,4,NULL,'SC'),
	(217,4,NULL,'SD'),
	(218,4,NULL,'TN'),
	(219,4,NULL,'TX'),
	(220,4,NULL,'UT'),
	(221,4,NULL,'VT'),
	(222,4,NULL,'VA'),
	(223,4,NULL,'WA'),
	(224,4,NULL,'WV'),
	(225,4,NULL,'WI'),
	(226,4,NULL,'WY');

/*!40000 ALTER TABLE `target_sets` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
