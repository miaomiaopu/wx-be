-- 创建并选择数据库
CREATE DATABASE IF NOT EXISTS `wxzk` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `wxzk`;

-- 创建表
CREATE TABLE IF NOT EXISTS `users` (
  `openid` VARCHAR(28) NOT NULL COMMENT '用户唯一标识',
  `session_key` VARCHAR(128) COMMENT '用户会话凭据',
  `phone_number` VARCHAR(20) COMMENT '用户手机号码',
  `nickname` VARCHAR(28) NOT NULL DEFAULT '小小只' COMMENT '用户昵称',
  PRIMARY KEY (`openid`)
) COMMENT = '用户表';

CREATE TABLE IF NOT EXISTS `datas`(
  `data_id` INT UNSIGNED AUTO_INCREMENT NOT NULL COMMENT '用户数据唯一标识',
  `openid` VARCHAR(28) NOT NULL COMMENT '用户唯一标识-外键',
  `today_study` INT UNSIGNED DEFAULT 0 NOT NULL COMMENT '今日学习卡片数',
  `today_review` INT UNSIGNED DEFAULT 0 NOT NULL COMMENT '今日复习卡片数',
  `today_duration` INT UNSIGNED COMMENT '今日学习时长/分钟',
  `total_learn` INT UNSIGNED DEFAULT 0 NOT NULL COMMENT '累计学习卡片数',
  `total_duration` INT UNSIGNED COMMENT '累计学习时长/分钟',
  `total_check_ins` INT UNSIGNED COMMENT '累计签到天数',
  PRIMARY KEY (`data_id`)
) COMMENT = '用户数据表';

CREATE TABLE IF NOT EXISTS `checkins`(
  `check_ins_id` INT UNSIGNED AUTO_INCREMENT NOT NULL COMMENT '签到日志唯一标识',
  `openid` VARCHAR(28) NOT NULL COMMENT '用户唯一标识-外键',
  `check_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '用户签到日期, 创建字段时自动创建',
  PRIMARY KEY (`check_ins_id`)
) COMMENT = '签到日志表';

CREATE TABLE IF NOT EXISTS `themes` (
  `theme_id` INT UNSIGNED AUTO_INCREMENT NOT NULL COMMENT '主题唯一标识',
  `openid` VARCHAR(28) NOT NULL COMMENT '用户唯一标识-外键',
  `theme_name` VARCHAR(128) NOT NULL COMMENT '主题名称',
  `theme_picture` MEDIUMBLOB NOT NULL COMMENT '主题图片',
  `total_subscription` INT UNSIGNED DEFAULT 0 NOT NULL COMMENT '主题总订阅数',
  PRIMARY KEY (`theme_id`)
) COMMENT = '主题表';

CREATE TABLE IF NOT EXISTS `theme_subscriber_conn`(
  `theme_id` INT UNSIGNED NOT NULL COMMENT '主题唯一标识-外键',
  `openid` VARCHAR(28) NOT NULL COMMENT '用户唯一标识-外键',
  PRIMARY KEY (`theme_id`, `openid`)
) COMMENT = '主题和订阅者关联表';

CREATE TABLE IF NOT EXISTS `tags` (
  `tag_id` INT UNSIGNED AUTO_INCREMENT NOT NULL COMMENT '标签唯一标识',
  `tag_name` VARCHAR(10) NOT NULL COMMENT '标签内容',
  PRIMARY KEY (`tag_id`)
) COMMENT = '主题标签表';

CREATE TABLE IF NOT EXISTS `theme_tag_conn` (
  `theme_id` INT UNSIGNED NOT NULL COMMENT '主题唯一标识-外键',
  `tag_id` INT UNSIGNED NOT NULL COMMENT '标签唯一标识-外键',
  PRIMARY KEY (`theme_id`, `tag_id`)
) COMMENT = '主题和标签关联表';

CREATE TABLE IF NOT EXISTS `cards` (
  `card_id` INT UNSIGNED AUTO_INCREMENT NOT NULL COMMENT '卡片唯一标识',
  `theme_id` INT UNSIGNED NOT NULL COMMENT '主题唯一标识-外键',
  `card_title` VARCHAR(128) NOT NULL COMMENT '卡片标题',
  `card_content` VARCHAR(1024) NOT NULL COMMENT '卡片内容',
  `total_likes` INT UNSIGNED DEFAULT 0 NOT NULL COMMENT '卡片点赞总数',
  `card_modified_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '卡片修改时间',
  PRIMARY KEY (`card_id`)
) COMMENT = '卡片表';

CREATE TABLE IF NOT EXISTS `card_pictures` (
  `card_picture_id` INT UNSIGNED AUTO_INCREMENT NOT NULL COMMENT '卡片内容图片唯一标识',
  `blob` MEDIUMBLOB NOT NULL COMMENT '卡片图片十六进制编码',
  PRIMARY KEY (`card_picture_id`)
) COMMENT = '卡片内容图片表';

CREATE TABLE IF NOT EXISTS `theme_card_conn` (
  `theme_id` INT UNSIGNED NOT NULL COMMENT '主题唯一标识-外键',
  `card_id` INT UNSIGNED NOT NULL COMMENT '卡片唯一标识-外键',
  PRIMARY KEY (`theme_id`, `card_id`)
) COMMENT = '卡片和主题关联表';

CREATE TABLE IF NOT EXISTS `card_like_conn` (
  `card_id` INT UNSIGNED NOT NULL COMMENT '卡片唯一标识-外键',
  `openid` VARCHAR(28) NOT NULL COMMENT '用户唯一标识-外键',
  PRIMARY KEY (`card_id`, `openid`)
) COMMENT = '卡片和点赞关联表';

CREATE TABLE IF NOT EXISTS `comments` (
  `comment_id` INT UNSIGNED AUTO_INCREMENT NOT NULL COMMENT '评论唯一标识',
  `openid` VARCHAR(28) NOT NULL COMMENT '用户唯一标识-外键',
  `card_id` INT UNSIGNED NOT NULL COMMENT '卡片唯一标识-外键',
  `comment_content` VARCHAR(1024) NOT NULL COMMENT '评论内容',
  `comment_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '评论时间',
  PRIMARY KEY (`comment_id`)
) COMMENT = '评论表';

CREATE TABLE IF NOT EXISTS `card_study_time` (
  `openid` VARCHAR(28) NOT NULL COMMENT '用户唯一标识-外键',
  `card_id` INT UNSIGNED NOT NULL COMMENT '卡片唯一标识-外键',
  `last_study_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '上次学习的时间',
  PRIMARY KEY (`openid`, `card_id`)
) COMMENT = '卡片学习时间表';