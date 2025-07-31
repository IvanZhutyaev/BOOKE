<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db_connect.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Метод не поддерживается');
    }

    $telegramId = $_POST['telegramId'] ?? null;
    
    if (!$telegramId) {
        throw new Exception('Не указан Telegram ID');
    }

    // Рассчитываем текущие pending_rewards
    $stmt = $pdo->prepare("SELECT COUNT(*) as direct_refs FROM users WHERE referredBy = ?");
    $stmt->execute([$telegramId]);
    $directRefs = $stmt->fetch(PDO::FETCH_ASSOC)['direct_refs'] ?? 0;
    
    // Получаем количество косвенных рефералов
    $stmt2 = $pdo->prepare("
        SELECT COUNT(*) as indirect_refs 
        FROM users u1 
        JOIN users u2 ON u1.referredBy = u2.userId 
        WHERE u2.referredBy = ?
    ");
    $stmt2->execute([$telegramId]);
    $indirectRefs = $stmt2->fetch(PDO::FETCH_ASSOC)['indirect_refs'] ?? 0;
    
    // Рассчитываем общие награды
    $totalRewards = ($directRefs * 10) + ($indirectRefs * 2);
    
    // Получаем уже полученные награды
    $stmt3 = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) as collected_rewards FROM referral_rewards_history WHERE telegram_id = ?");
    $stmt3->execute([$telegramId]);
    $collectedRewards = $stmt3->fetch(PDO::FETCH_ASSOC)['collected_rewards'] ?? 0;
    
    // Рассчитываем доступные для получения награды
    $pendingRewards = max(0, $totalRewards - $collectedRewards);
    
    if ($pendingRewards <= 0) {
        throw new Exception('Нет накопившихся наград для получения');
    }

    // Начинаем транзакцию
    $pdo->beginTransaction();

    try {
        // Начисляем RBC на баланс пользователя
        $stmt = $pdo->prepare("UPDATE users SET rbc_balance = rbc_balance + ? WHERE telegram_id = ?");
        $stmt->execute([$pendingRewards, $telegramId]);

        // Записываем в историю транзакций
        $stmt = $pdo->prepare("INSERT INTO referral_rewards_history (telegram_id, amount, collected_at) VALUES (?, ?, NOW())");
        $stmt->execute([$telegramId, $pendingRewards]);

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Награда успешно начислена',
            'amount' => $pendingRewards,
            'direct_refs' => $directRefs,
            'indirect_refs' => $indirectRefs
        ]);

    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 