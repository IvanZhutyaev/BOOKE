<?php
require_once __DIR__ . '/referral_db.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['success'=>false,'error'=>'POST only']); exit(); }

$me      = isset($_POST['telegramId']) ? intval($_POST['telegramId']) : 0;
$referer = isset($_POST['refererId'])  ? intval($_POST['refererId'])  : 0;
if ($me<=0) { echo json_encode(['success'=>false,'error'=>'telegramId required']); exit(); }

try{
    $pdo = getPDO();
    $pdo->beginTransaction();
    $stmt=$pdo->prepare('SELECT referredBy FROM users WHERE userId=? LIMIT 1');
    $stmt->execute([$me]);
    $exists=$stmt->fetch(PDO::FETCH_ASSOC);
    if(!$exists){
        $pdo->prepare('INSERT INTO users(userId, referredBy) VALUES(?, ?)')->execute([$me, $referer ?: null]);
    }
    if($referer && $referer!=$me){
        $pdo->prepare('UPDATE users SET referral_cnt = referral_cnt+1, rbc_balance = rbc_balance+2 WHERE userId=?')->execute([$referer]);
    }
    $pdo->commit();
    echo json_encode(['success'=>true]);
}catch(Throwable $e){
    if($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['success'=>false,'error'=>$e->getMessage()]);
} 