//================================================================================================
//================ combining js code from showing one record at a time ===========================
//================================================================================================

var records = []
, recordCount = 0
, recordPointer = 1
, greenLight = true
, stepping = false
, delay = 100
, matchIndexes = []
, indexPointer = 0
, matchCount = 0
, currentMatch = ""
, RecordCounter = id("RecordCounter")
, matchOrMatches = id("matchOrMatches")
;
//===========Handlers and Functions for single record viewer======
//=================================================
objectEventHandler( id("btnForward"), "click", forward );
//=================================================
objectEventHandler( id("btnBackward"), "click", reverse );
//=========================================================
objectEventHandler( id("btnFastForward"), "mousedown", fastForward );
//---------------------------------------------------------
objectEventHandler( id("btnFastForward"), "mouseup", stopFastForward );
//---------------------------------------------------------
objectEventHandler( id("btnFastForward"), "mouseout", shortRedLight );
//=========================================================
objectEventHandler( id("btnRewind"), "mousedown", fastReverse );
//---------------------------------------------------------
objectEventHandler( id("btnRewind"), "mouseup", stopFastReverse );
//---------------------------------------------------------
objectEventHandler( id("btnRewind"), "mouseout", shortRedLight );
//=========================================================
objectEventHandler( id("btnFirstRecord"), "click", reverseStop );
//=================================================
objectEventHandler( id("btnLastRecord"), "click", forwardStop );
//=================================================
objectEventHandler( id("match"), "keyup", function(e){
    search(e);
});
//=================================================
objectEventHandler(document.body, "keydown", function(e){
    step(e);
});
//=================================================
objectEventHandler(id("btnClearSearch"), "click", clearSearch );
//==============Forward Button Handler=============
function forward(){
    if ( notTooFar() ) pointToNextRecord();
    else pointToFirstRecord();
    nowShowRecord();
}
//----------Details of forward button handler-------
function notTooFar(){//var notTooFar = function(){
    if ( id("match").value === ""  ){
        if ( recordPointer +1 < recordCount ) return true;
        else return false;
    }
    else{
        if ( indexPointer +1 < matchCount) return true;
        else return false;       
    }
}
//-------------------------------------------------
function pointToNextRecord(){//var pointToNextRecord = function(){
    if( id("match").value === "" ){
        recordPointer++;
    }
    else{
        recordPointer = matchIndexes[++indexPointer];
    }
}
//-------------------------------------------------
function pointToFirstRecord(){
    if( id("match").value === "" ){
        recordPointer = 1;
    }
    else{
        indexPointer = 0;
        recordPointer = matchIndexes[indexPointer];    
    }
}
//------------------------------------------------
function nowShowRecord(){
    try{
        recordCounter.style.visibility = "visible";
        var record = [];
        record = records[recordPointer].split("``");
        for( var i = 0; i< record.length; i++ ) {
            id("field"+i.toString()).value = " " + record[i];
        }
        id("c").innerHTML = recordPointer;
        if( matchCount != 0 ){
            id('matchIndex').innerHTML = indexPointer +1;
        }
    }
    catch(err){}
}
//=============Reverse Button Handler===========
function reverse(){
    if ( notTooFarBack() ) pointToPreviousRecord();
    else pointToFinalRecord();
    nowShowRecord();
}
//--------Details of Reverse  button handler-----
function notTooFarBack(){
    if ( id("match").value === "" ){
        if ( recordPointer - 1 > 0 ) return true;
        else return false;
    }
    else{
        if ( indexPointer - 1 >= 0 ) return true;
        else return false;
    }
}
//------------------------------------------------
function pointToPreviousRecord(){
    if( id("match").value === "" ){
        recordPointer--;
    }
    else{
        recordPointer = matchIndexes[--indexPointer];    
    }
}
//------------------------------------------------
function pointToFinalRecord(){
    if( id("match").value === ""  ){
        recordPointer = recordCount - 1;
    }
    else{
        indexPointer = matchCount-1;
        recordPointer = matchIndexes[matchCount-1];    
    }
}
//============fast forward=========================
function fastForward(){
    if(greenLight){
        forward();
        setTimeout(fastForward, delay);
    }
    else greenLight = true;        
}
//----------------Stop fast forward---------------
function stopFastForward(){
    greenLight = false;
}
//============fast reverse ========================
function fastReverse(){
    if(greenLight){
        reverse();
        setTimeout(fastReverse, delay);
    }
    else greenLight = true;
}
//------------Stop fast reverse--------------------
function stopFastReverse(){
    greenLight = false;   
}
//============Reverse Stop========================
function reverseStop(){
    pointToFirstRecord();
    nowShowRecord(); 
}
//=============Forward Stop========================
function forwardStop(){
    pointToFinalRecord();
    nowShowRecord();
}
//=================================================
function shortRedLight(){
    greenLight = false;
    setTimeout(function(){greenLight = true;},2*delay);
}

//================================================
function keyPressed(e){
    var theKey=0;
    e=(window.event)?event:e;
    theKey=(e.keyCode)?e.keyCode:e.charCode;
    return theKey;
}  

//=================================================
function search(e){
    if ( id("match").value === "" ) {
        shortRedLight();
        clearSearch();
        matchCount = 0;
        matchOrMatches.innerHTML = ( ( matchCount == 1 ) ? "match" : "matches" );
        currentMatch = ""
        return;
    }
    //---------------------------------------------
    //if ( window.event.keyCode === 13 ){     
    if ( keyPressed(e) == 13 ){ 
        forward();
        return;
    }
    else if( id("match").value.toLowerCase() == currentMatch.toLowerCase() ){
        return;
    }
    matchCount = 0;
    matchOrMatches.innerHTML = ( ( matchCount == 1 ) ? "match" : "matches" );
    matchIndexes.length = 0;
    for ( var i = 1; i < recordCount; i++){
        if ( matchFound(i) ) {
            matchIndexes.push(i);
            matchCount += 1;
            matchOrMatches.innerHTML = ( ( matchCount == 1 ) ? "match" : "matches" );
        }
    }
    currentMatch = id("match").value.toLowerCase();
    
    indexPointer = 0;    
    if ( matchCount !== 0 ){
        recordPointer = matchIndexes[0];
        id('matchIndex').innerHTML = "1";
        nowShowRecord();
    }
    else{
        id('totalMatches').innerHTML = "0";
        matchOrMatches.innerHTML = ( ( matchCount == 1 ) ? "match" : "matches" );        
        id('matchIndex').innerHTML = "0";
    }
    id('totalMatches').innerHTML = matchCount.toString();
    matchOrMatches.innerHTML = ( ( matchCount == 1 ) ? "match" : "matches" );
    //return false;
}
//=================================================
function matchFound(n){
    return records[n].toLowerCase().indexOf(id("match").value.toLowerCase() ) != -1;
}
//=================================================
function clearSearch(){
    id("match").value = "";
    id("match").focus();
    id('totalMatches').innerHTML = "0";
    matchOrMatches.innerHTML = ( ( matchCount == 1 ) ? "match" : "matches" );
    id('matchIndex').innerHTML = "0";
    indexPointer = 0;
    matchCount = 0;
    matchOrMatches.innerHTML = ( ( matchCount == 1 ) ? "match" : "matches" );    
}

//=================================================
function step(e){
     if ( keyPressed(e) == "39" ) forward();
     else if( keyPressed(e) == "37" ) reverse();
}
/*
//=================================================
//----build record view
buildRecordView = function(csvRecordSet){
    //-----announce start of bulding process (the end will be announced by the builder of the total record set)
    buildingResultSet = true;
    id("rsProgress").style.visibility = "visible";
    oneRecordProgress.style.visibility = "visible";
    showOneRecord.innerHTML = ""; //clear the previous recordset view
    records = csvRecordSet.split("\r");
    recordCount = records.length - 1;//subtracting 1 to correct unknown error
    recordPointer = 1;
    id("c").innerHTML = recordPointer;
    id("m").innerHTML = recordCount - 1;//don't count the csv header 
    
    //----build record view window
    //-----get field names as array
    var aryFieldName = records[0].split("``");//break up csv header
    var fieldCount = aryFieldName.length;//number of fields
    
    showOneRecord.innerHTML = "<table>";
    //----build one tableTRow at a time
    for(var i = 0; i < fieldCount; i++){
        showOneRecord.innerHTML += "<tr><td>" + aryFieldName[i] +
            "&nbsp;&nbsp;</td>" +
            //"<td> <input id='field+" + i + "' readonly size='25'" + "</td>" +
            "<input id='field" + i + "' readonly size='30'" +           
            "</tr><br>"
        ;
    }
    showOneRecord.innerHTML += "</table>";
    //-----show first record    
    nowShowRecord(); 
    oneRecordProgress.style.visibility = "hidden";        
};
*/
//-----clear single record viewer
clearViewer = function(){
    //clear fields table
    showOneRecord.innerHTML = "";    
    //clear record counter
    recordCounter.style.visibility = "hidden";    
    //clear search window
    clearSearch();    
    //clear reault set table
    rsTable.innerHTML = "";    
};
/*
//-----show full result set
function buildResultSetTable(csvRecordSet){
    try{
        //-------
        function element(tag){
            return document.createElement(tag);
        }
        
        //-------
        function text(string){
            return document.createTextNode(string);
        }

        var aryRecords = csvRecordSet.split("\r");
        var aryFieldNames = aryRecords[0].split("``");
        var fieldCount = aryFieldNames.length;    
        var recordCount = aryRecords.length - 1;//don't include header and extra spurious record

        var tbl = element("table");
        tbl.border = "1";
        //----build record view window
        rsTable.innerHTML = ""; //clear the previous recordset view
        var tr = element("tr");
        tr.style.textalign = "center";
        for(var i = -1; i < fieldCount; i++){
            var td = element("td");
            td.style.background = "white";
            td.style.textalign = "center";
            if ( i != -1 ){td.appendChild(text(aryFieldNames[i]));}
            else{td.innerHTML = "Headings &rArr;"}
            tr.appendChild(td);
        }
        tbl.appendChild(tr);        
  
        var r = 0;
        var c = 0;
        for ( r = 1; r < recordCount; r++ ){
                var row = aryRecords[r].split("``");
                var tr = element("tr");
            for ( c = -1; c < fieldCount; c++ ){                                 
                //string = text(row[c]);
                td = element("td");
                if ( r%2 != 0 && c !=-1 ){td.style.background = "#f0f0f0";}
                if ( c == -1 && r%10 == 0 ){td.innerHTML = "<a href='#btnLocalFile'>&uArr;GO TO TOP&uArr;</a>";}  
                else if ( c != -1 ){td.innerHTML = row[c];}
                tr.appendChild(td);
                               
            }
        tbl.appendChild(tr);
        }        
        rsTable.appendChild(tbl);
        //-----announce end of build
        buildingResultSet = false;
    }
    catch(err){} //just to satisfy the browser's error catcher.
}
var buildTableList = function(backtickSeparatedList){
 
    tableList = backtickSeparatedList;//save list that was sent 
    var aryTableNames = tableList.split("``");//break it into the individual table names
    if ( currentResultSet.indexOf("dummyTable") == -1 ){ tableCount = aryTableNames.length; }
    else { tableCount = aryTableNames.length - 1; }
    clearTables();    
    //-----add new list of tables
    for(var i = 1; i <= tableCount; i++){            
        var objOption = document.createElement("option");
        objOption.text = aryTableNames[i-1];
        tableSelection.add(objOption,(i));
    }
    tableSelection.selectedIndex = 0;
};
//==============================================
*/