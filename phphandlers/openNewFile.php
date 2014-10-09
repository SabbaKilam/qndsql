<?php
ini_set('display_errors','off');
session_start();
$_SESSION['id'] = session_id();
$_SESSION['topFolderPath'] = $_SERVER['DOCUMENT_ROOT']. "/dbfiles/";
$_SESSION['targetFolderPath'] = $_SESSION['topFolderPath'] . $_SESSION['id'] . "/";
$fileVersion = $_POST['version'] ?  $_POST['version'] : false;
$rawFilename = $_POST['filename'] ? $_POST['filename'] : false;
if ($fileVersion && $rawFilename){
    //create the target folder (if doesn't already exist):
    if (  !file_exists($_SESSION['targetFolderPath'])  ){
        mkdir($_SESSION['topFolderPath']. session_id() . "/");
        $_SESSION['targetFolderPath'] = $_SESSION['topFolderPath']. session_id() . "/";
    }
    $_SESSION['filename'] = fixFilename($rawFilename). "." . $fileVersion;
    $_SESSION['fullFilePath'] = $_SESSION['targetFolderPath'] . $_SESSION['filename']  ;
    //copy new file under the user's 'cleaned-up' chosen name
    $source = $_SERVER['DOCUMENT_ROOT']."/dbtemplates/";
    if($fileVersion == "mdb"){
        $source .= "access2003.mdb";
    }else if ($fileVersion == "accdb"){
        $source .= "access2007.accdb";    
    }
    
    $destination = $_SESSION['fullFilePath'];
    // copy new file
    file_put_contents( $destination, file_get_contents($source) );     
}
//return "cleaned-up" file name
exit( $_SESSION['filename'] );
//=================================
function fixFilename($raw){
    $filename = $raw;
    // ensure a safe filename
    $filename = preg_replace("/[^A-Z0-9._-]/i", "_", $filename);
    return $filename;
}
?>