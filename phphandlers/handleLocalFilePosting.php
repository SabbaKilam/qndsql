<?php
ini_set('display_errors','off');
session_start();
$_SESSION['id'] = session_id();
//$_SESSION['topFolderPath'] = "C:/xampp/htdocs/dbfiles/";
$_SESSION['topFolderPath'] =  $_SERVER['DOCUMENT_ROOT'] . "/dbfiles/";
$_SESSION['targetFolderPath'] = $_SESSION['topFolderPath'] . $_SESSION['id'] . "/";

$_SESSION['filename'] = ($_SERVER['HTTP_FILENAME'])? $_SERVER['HTTP_FILENAME']: false; 
//create the target folder (if doesn't already exist):
if (  !file_exists($_SESSION['targetFolderPath'])  ){
    mkdir($_SESSION['topFolderPath']. session_id() . "/");
    $_SESSION['targetFolderPath'] = $_SESSION['topFolderPath']. session_id() . "/";
}
$_SESSION['fullFilePath'] = $_SESSION['targetFolderPath'] . $_SESSION['filename'] ;
file_put_contents( $_SESSION['fullFilePath'], file_get_contents('php://input') ); 

//=============actions=============
$message = file_exists($_SESSION['fullFilePath']) ? $_SESSION['fullFilePath'] : "File not saved to server.";
exit($_SESSION['filename']);
//=================================
?>