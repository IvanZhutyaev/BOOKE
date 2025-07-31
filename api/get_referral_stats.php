<?php
require_once __DIR__ . '/referral_db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$uid = isset($_GET['telegramId']) ? intval($_GET['telegramId']) : 0;
if(!$uid){echo json_encode(['success'=>false,'error'=>'telegramId required']);exit();}
try{
    $pdo=getPDO();
    
    // Получаем основную статистику пользователя
    $st=$pdo->prepare('SELECT referral_cnt, rbc_balance FROM users WHERE userId=? LIMIT 1');
    $st->execute([$uid]);
    $data=$st->fetch(PDO::FETCH_ASSOC) ?: ['referral_cnt'=>0,'rbc_balance'=>0];
    
    // Получаем количество прямых рефералов
    $st2=$pdo->prepare('SELECT COUNT(*) as direct_refs FROM users WHERE referredBy=?');
    $st2->execute([$uid]);
    $directRefs = $st2->fetch(PDO::FETCH_ASSOC)['direct_refs'] ?? 0;
    
    // Получаем количество косвенных рефералов (рефералы рефералов)
    $st3=$pdo->prepare('
        SELECT COUNT(*) as indirect_refs 
        FROM users u1 
        JOIN users u2 ON u1.referredBy = u2.userId 
        WHERE u2.referredBy = ?
    ');
    $st3->execute([$uid]);
    $indirectRefs = $st3->fetch(PDO::FETCH_ASSOC)['indirect_refs'] ?? 0;
    
    // Рассчитываем pending_rewards: 10 RBC за прямого реферала + 2 RBC за косвенного
    $pendingRewards = ($directRefs * 10) + ($indirectRefs * 2);
    
    // Получаем уже полученные награды из истории
    $st4=$pdo->prepare('SELECT COALESCE(SUM(amount), 0) as collected_rewards FROM referral_rewards_history WHERE telegram_id = ?');
    $st4->execute([$uid]);
    $collectedRewards = $st4->fetch(PDO::FETCH_ASSOC)['collected_rewards'] ?? 0;
    
    // Итоговые pending_rewards = общие награды - уже полученные
    $finalPendingRewards = max(0, $pendingRewards - $collectedRewards);
    
    // Объединяем данные
    $result = array_merge($data, [
        'pending_rewards' => $finalPendingRewards,
        'direct_refs' => $directRefs,
        'indirect_refs' => $indirectRefs,
        'total_earned' => $pendingRewards,
        'collected_rewards' => $collectedRewards
    ]);
    
    echo json_encode(['success'=>true]+$result);
}catch(Throwable $e){
    echo json_encode(['success'=>false,'error'=>$e->getMessage()]);
} 