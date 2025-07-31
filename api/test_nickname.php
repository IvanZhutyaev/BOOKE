<?php
header('Content-Type: text/html; charset=utf-8');

require_once 'referral_db.php';

echo "<h1>Тест API никнеймов и информации пользователя</h1>";

try {
    $pdo = getPDO();
    
    // Проверяем таблицу users_data
    $stmt = $pdo->query("SHOW TABLES LIKE 'users_data'");
    if ($stmt->rowCount() > 0) {
        echo "<p style='color: green;'>✓ Таблица users_data существует</p>";
        
        // Показываем структуру таблицы
        $stmt = $pdo->query("DESCRIBE users_data");
        echo "<h3>Структура таблицы users_data:</h3>";
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>Поле</th><th>Тип</th><th>Null</th><th>Ключ</th><th>По умолчанию</th></tr>";
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "<tr>";
            echo "<td>" . $row['Field'] . "</td>";
            echo "<td>" . $row['Type'] . "</td>";
            echo "<td>" . $row['Null'] . "</td>";
            echo "<td>" . $row['Key'] . "</td>";
            echo "<td>" . $row['Default'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
        
        // Показываем существующие записи
        $stmt = $pdo->query("SELECT * FROM users_data LIMIT 10");
        echo "<h3>Существующие записи (первые 10):</h3>";
        if ($stmt->rowCount() > 0) {
            echo "<table border='1' style='border-collapse: collapse;'>";
            echo "<tr><th>ID</th><th>User ID</th><th>Username</th><th>Name</th><th>Surname</th></tr>";
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                echo "<tr>";
                echo "<td>" . $row['id'] . "</td>";
                echo "<td>" . $row['user_id'] . "</td>";
                echo "<td>" . htmlspecialchars($row['username'] ?? 'NULL') . "</td>";
                echo "<td>" . htmlspecialchars($row['name'] ?? 'NULL') . "</td>";
                echo "<td>" . htmlspecialchars($row['surname'] ?? 'NULL') . "</td>";
                echo "</tr>";
            }
            echo "</table>";
        } else {
            echo "<p>Записей в таблице пока нет</p>";
        }
        
    } else {
        echo "<p style='color: red;'>✗ Таблица users_data не существует</p>";
    }
    
    // Проверяем таблицу users
    $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
    if ($stmt->rowCount() > 0) {
        echo "<p style='color: green;'>✓ Таблица users существует</p>";
        
        // Показываем существующие записи в users
        $stmt = $pdo->query("SELECT * FROM users LIMIT 10");
        echo "<h3>Записи в таблице users (первые 10):</h3>";
        if ($stmt->rowCount() > 0) {
            echo "<table border='1' style='border-collapse: collapse;'>";
            echo "<tr><th>ID</th><th>User ID</th><th>Referred By</th><th>Join Date</th><th>Referral Count</th></tr>";
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                echo "<tr>";
                echo "<td>" . $row['id'] . "</td>";
                echo "<td>" . $row['userId'] . "</td>";
                echo "<td>" . ($row['referredBy'] ?? 'NULL') . "</td>";
                echo "<td>" . $row['joinDate'] . "</td>";
                echo "<td>" . $row['referral_cnt'] . "</td>";
                echo "</tr>";
            }
            echo "</table>";
        } else {
            echo "<p>Записей в таблице users пока нет</p>";
        }
        
    } else {
        echo "<p style='color: red;'>✗ Таблица users не существует</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>Ошибка: " . $e->getMessage() . "</p>";
}

echo "<h2>Тест API endpoints:</h2>";
echo "<p><a href='get_nickname.php?userId=12345678' target='_blank'>Тест GET /api/get_nickname.php?userId=12345678</a></p>";
echo "<p><a href='get_user_info.php?userId=12345678' target='_blank'>Тест GET /api/get_user_info.php?userId=12345678</a></p>";
echo "<p>Для тестирования POST запроса используйте curl или Postman:</p>";
echo "<pre>curl -X POST http://localhost/api/update_nickname.php \\
  -H 'Content-Type: application/json' \\
  -d '{\"userId\": 12345678, \"nickname\": \"TestUser\"}'</pre>";
?> 