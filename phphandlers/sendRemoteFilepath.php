<?php
ini_set('display_errors','off');
session_start();
//======================================
$_SESSION['id'] = session_id();
//$_SESSION['topFolderPath'] = "C:/xampp/htdocs/dbfiles/";
$_SESSION['topFolderPath'] = $_SERVER['DOCUMENT_ROOT'] . "/dbfiles/";

$_SESSION['targetFolderPath'] = $_SESSION['topFolderPath'] . $_SESSION['id'] . "/";
$_SESSION['fullFilePath'] = $_SESSION['targetFolderPath'] . $_SESSION['filename'];
//======================================
//include_once "C:/xampp/htdocs/adodb/adodb.inc.php";
require_once $_SERVER['DOCUMENT_ROOT'] . "/adodb/adodb.inc.php";
$fullFilePath = $_SESSION['fullFilePath'];
if (!file_exists($fullFilePath)) {
    die("Could not find database file");
}
else{
    exit('http://qndsql.com/dbfiles/'. $_SESSION['id'] . '/');//for live web app
    //exit($_SESSION['topFolderPath']. $_SESSION['id'] . '/');
}