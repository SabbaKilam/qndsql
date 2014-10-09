<?php
ini_set('display_errors','off');
session_start();
$_SESSION['id'] = session_id();
//$_SESSION['topFolderPath'] = "C:/xampp/htdocs/dbfiles/";
$_SESSION['topFolderPath'] = $_SERVER['DOCUMENT_ROOT'] . "/dbfiles/";
$_SESSION['targetFolderPath'] = $_SESSION['topFolderPath'] . $_SESSION['id'] . "/";
if($_POST['dblink']){
    $sourceFilename = $_POST['dblink'];
    $_SESSION['filename'] = basename($sourceFilename); 
    $_SESSION['fullFilePath'] = $_SESSION['targetFolderPath'] . $_SESSION['filename'];    
    if($_SESSION['filename']){
        $targetFilename = $_SESSION['fullFilePath'];       
        if (!file_exists($_SESSION['targetFolderPath'])){
            mkdir($_SESSION['targetFolderPath']);
        }
        $fpSource = fopen($sourceFilename, "rb"); 
        $fpTarget = fopen($targetFilename, "wb");
        //for PHP 5+
        $contents = stream_get_contents($fpSource);
        fwrite($fpTarget, $contents);
            
        if ($fpSource) fclose($fpSource); 
        if ($fpTarget) fclose($fpTarget);
    }
}
    $_SESSION['filename'] = basename($_POST['dblink']); 
?>