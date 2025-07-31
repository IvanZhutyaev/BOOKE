<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'referral_db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['userId']) || !isset($input['nickname'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required parameters']);
    exit;
}

$userId = (int)$input['userId'];
$nickname = trim($input['nickname']);

// Валидация никнейма
if (empty($nickname) || strlen($nickname) > 50) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid nickname. Must be 1-50 characters long.']);
    exit;
}

// Проверяем, не занят ли никнейм другим пользователем
try {
    $pdo = getPDO();
    
    // Проверяем, существует ли пользователь с таким никнеймом
    $stmt = $pdo->prepare("SELECT user_id FROM users_data WHERE username = ? AND user_id != ?");
    $stmt->execute([$nickname, $userId]);
    
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Nickname already taken']);
        exit;
    }
    
    // Обновляем или создаем запись в users_data
    $stmt = $pdo->prepare("INSERT INTO users_data (user_id, username) VALUES (?, ?) 
                          ON DUPLICATE KEY UPDATE username = ?");
    $stmt->execute([$userId, $nickname, $nickname]);
    
    echo json_encode(['success' => true, 'nickname' => $nickname]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
?> 