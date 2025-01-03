SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';


DROP SCHEMA IF EXISTS `db` ;

CREATE SCHEMA IF NOT EXISTS `db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `db` ;


DROP TABLE IF EXISTS `db`.`user` ;

CREATE TABLE IF NOT EXISTS `db`.`user` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `tag` VARCHAR(45) NOT NULL,
    `firstName` VARCHAR(45) NOT NULL,
    `lastName` VARCHAR(45) NULL DEFAULT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`, `tag`),
    UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
    UNIQUE INDEX `tag_UNIQUE` (`tag` ASC) VISIBLE)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `db`.`chat` ;

CREATE TABLE IF NOT EXISTS `db`.`chat` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `tag` VARCHAR(45) NOT NULL,
    `name` VARCHAR(45) NULL DEFAULT NULL,
    PRIMARY KEY (`id`, `tag`),
    UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
    UNIQUE INDEX `tag_UNIQUE` (`tag` ASC) VISIBLE)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `db`.`chatUser` ;

CREATE TABLE IF NOT EXISTS `db`.`chatUser` (
    `chatId` INT UNSIGNED NOT NULL,
    `userId` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`chatId`, `userId`),
    INDEX `fk_chatUser_chat_idx` (`chatId` ASC) VISIBLE,
    INDEX `fk_chatUser_user_idx` (`userId` ASC) VISIBLE,
    CONSTRAINT `fk_chatUser_chat`
    FOREIGN KEY (`chatId`)
    REFERENCES `db`.`chat` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
    CONSTRAINT `fk_chatUser_user`
    FOREIGN KEY (`userId`)
    REFERENCES `db`.`user` (`id`)
    ON DELETE CASCADE
    ON UPDATE RESTRICT)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `db`.`message` ;

CREATE TABLE IF NOT EXISTS `db`.`message` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `body` VARCHAR(1024) NOT NULL,
    `timestamp` BIGINT NOT NULL,
    `chatId` INT UNSIGNED NOT NULL,
    `userId` INT UNSIGNED NULL DEFAULT NULL,
    PRIMARY KEY (`id`, `chatId`),
    UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
    INDEX `fk_message_user_idx` (`userId` ASC) VISIBLE,
    INDEX `fk_message_chat_idx` (`chatId` ASC) VISIBLE,
    CONSTRAINT `fk_message_chat`
    FOREIGN KEY (`chatId`)
    REFERENCES `db`.`chat` (`id`)
    ON DELETE CASCADE
    ON UPDATE RESTRICT,
    CONSTRAINT `fk_message_user`
    FOREIGN KEY (`userId`)
    REFERENCES `db`.`user` (`id`)
    ON DELETE SET NULL)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `db`.`session` ;

CREATE TABLE IF NOT EXISTS `db`.`session` (
    `token` VARCHAR(32) NOT NULL,
    `data` JSON NOT NULL,
    `createdAt` BIGINT NOT NULL,
    PRIMARY KEY (`token`),
    UNIQUE INDEX `token_UNIQUE` (`token` ASC) VISIBLE)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
