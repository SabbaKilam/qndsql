<?php
ini_set('display_errors','off');
session_start();
//======================================
$_SESSION['id'] = session_id();
//$_SESSION['topFolderPath'] = "C:/xampp/htdocs/dbfiles/";
$_SERVER['DOCUMENT_ROOT'] . "/dbfiles/";
$_SESSION['targetFolderPath'] = $_SESSION['topFolderPath'] . $_SESSION['id'] . "/";
$_SESSION['fullFilePath'] = $_SESSION['targetFolderPath'] . $_SESSION['filename'];
//======================================
//include_once "C:/xampp/htdocs/adodb/adodb.inc.php";
require_once $_SERVER['DOCUMENT_ROOT'] . "/adodb/adodb.inc.php";
$fullFilePath = $_SESSION['fullFilePath'];
if (!file_exists($fullFilePath)) {
    die("Could not find database file");
}

$db = ADONewConnection('access');
$db->debug = true;
$dsn = "DRIVER={Microsoft Access Driver (*.mdb, *.accdb)}; DBQ=" . $fullFilePath ."; Uid=; Pwd=;";
$db->Connect($dsn);
$aryTables = $db->MetaTables();
$tableCount = count($aryTables);

$strTables = ""; 
for($i = 0; $i <$tableCount ; $i++){
    $strTables .= ( ( $i < ($tableCount -1) ) ? ( $aryTables[$i] . '``') : $aryTables[$i] );
}
$_SESSION['tables'] = $strTables;
$tableOrTables = ($tableCount === 1)?" table":" tables";
exit($strTables);
//-----------------------------
?>