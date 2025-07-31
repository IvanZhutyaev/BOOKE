<?php
function getPDO(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO('mysql:host=localhost;dbname=users;charset=utf8mb4', 'booke_user', 'Nikitos_2020');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    return $pdo;
}
// ensure users table exists
try {
    $pdo = getPDO();
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId BIGINT NOT NULL UNIQUE,
        referredBy BIGINT NULL,
        joinDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        referral_cnt INT DEFAULT 0,
        rbc_balance INT DEFAULT 0,
        reward_claimed TINYINT DEFAULT 0,
        INDEX(referredBy)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // таблица профиля для отображения имён/аватарок
    $pdo->exec("CREATE TABLE IF NOT EXISTS users_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNIQUE,
        name VARCHAR(255),
        surname VARCHAR(255),
        username VARCHAR(255),
        profile_photo TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
} catch (Throwable $e) {} 