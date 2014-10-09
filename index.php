<?php
/*
To avoid server errors, edit the php.ini file as follows:

    memory_limit = 256M
    upload_max_filesize = 50M
    post_max_size = 50M
    max_execution_time = 60

Then, reboot the server.
*/
ini_set('display_errors','on');
session_start();
$_SESSION['filename'] = "asYetUnknown";
$_SESSION['id'] = session_id();
$_SESSION['topFolderPath'] = "C:/xampp/htdocs/dbfiles/";
$_SESSION['targetFolderPath'] = $_SESSION['topFolderPath'] . $_SESSION['id'] . "/";
$_SESSION['fullFilePath'] = $_SESSION['targetFolderPath'] . $_SESSION['filename'];
include_once "index.html.php";
?>

