<?php
require_once __DIR__ . '/referral_db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$uid = isset($_GET['telegramId']) ? intval($_GET['telegramId']) : 0;
if(!$uid){echo json_encode(['success'=>false,'error'=>'telegramId required']);exit();}
try{
    $pdo=getPDO();

    // проверяем, существует ли таблица Refs2, чтобы присоединить имена
    $sql = 'SELECT u.userId, u.joinDate, u.reward_claimed,
                   COALESCE(d.name, "")   AS name,
                   COALESCE(d.surname, "") AS surname,
                   COALESCE(d.username, "") AS username,
                   COALESCE(d.profile_photo, "") AS profile_photo
            FROM users u
            LEFT JOIN users_data d ON u.userId = d.user_id
            WHERE u.referredBy = ?
            ORDER BY u.joinDate';
    $st=$pdo->prepare($sql);
    $st->execute([$uid]);
    echo json_encode(['success'=>true,'friends'=>$st->fetchAll(PDO::FETCH_ASSOC)]);
}catch(Throwable $e){
    echo json_encode(['success'=>false,'error'=>$e->getMessage()]);
} 