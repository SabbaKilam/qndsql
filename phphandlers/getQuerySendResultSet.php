<?php
ini_set('display_errors','off');
header("Content-Type: text/plain");
session_start();
//$adodbPath = "C:/xampp/htdocs/adodb/adodb.inc.php";
$adodbPath = $_SERVER['DOCUMENT_ROOT'] . "/adodb/adodb.inc.php";
$query = $_POST['query'];
$filename = $_POST['filename'];
$fullFilePath = $_SESSION['fullFilePath'];
$strConn = "DRIVER={Microsoft Access Driver (*.mdb, *.accdb)}; DBQ=" . $fullFilePath ."; Uid=; Pwd=;";
if ( !file_exists($fullFilePath) ) die ("File was deleted or timed out.");
include_once($adodbPath);
//====================================
$count = 0;
$conn = ADONewConnection('access');
$conn->Connect($strConn);
$conn->SetFetchMode(ADODB_FETCH_ASSOC);
$resultSet = $conn->execute($query);
//====================================
if( ! hasDataDefinitions($query) && $resultSet ){
//if($resultSet){
    $count = $resultSet->FieldCount();
    $fields = "";
    $i = 0;
    foreach( $resultSet->fields  as $key => $value ){ 
        $i++;
        /*
        make back-tick-separated list of field names
        don't add back-ticks to the final field name (add "\r") 
        */
        $fields .= $key . ( ($i < $count ) ? "``" : "\r" );
    }
    //-----connect again for all records
    $conn->SetFetchMode(ADODB_FETCH_NUM);    
    $resultSet = $conn->GetAll($query);
    //"iterate" through resultset to collect records
    $longCSV = $fields;// filed names header of double-backtick seperated value list
    foreach ($resultSet as $row) {
        for ($i = 0; $i < $count; $i++){ //not sure if $i should start with field 0 or field1
            $longCSV .= $row[$i] . ( ( $i < ($count-1) ) ? "``" : "\r" );      
        }
    }
    //----------------------------------------------------------
    // close up and exit
    $conn->Close();
    exit($longCSV);
}
else{//if(!$resultSet){
    /*
      if there is no resultSet, assume there were changes made in the tables
      so return a new set of tables, or ask the client (javascript) to request tables again  
    */
    $conn->Close();            
    //die('Error in ->getAll($query): <br>' . $conn->ErrorMsg());}
    exit("getTables");
}
// ===================================================
// A function that checks for DDL terms in the query, and if so, returns true:
function hasDataDefinitions($queryString){
    $result = false;
    //================================================
    $ddlWords = array("create","into","insert","drop","alter","rename","update","delete","set");
    // see if the query string contains a  DDL word (case IN-sensitive).
    // probably should use foreach instead of for:
    for($i = 0; $i < count($ddlWords); $i++){
        if( stripos($queryString,$ddlWords[$i]) !== false ){
            $result = true;
            break;
        }
    }
    //================================================
    return $result;
}

?>