<?php
require_once 'referral_db.php';       // тот же файл, что используют API
try{
    $pdo = getPDO();
    echo 'OK, connection success!<br>';
    echo 'DB user: '. $pdo->query('SELECT USER()')->fetchColumn() .'<br>';
    echo 'Tables:<br>';
    foreach($pdo->query('SHOW TABLES') as $row){
        echo $row[0].'<br>';
    }
}catch(Throwable $e){
    echo 'ERROR: '.$e->getMessage();
}