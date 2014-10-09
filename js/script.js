//dropBox's options variable
//Source: https://www.dropbox.com/developers/dropins/chooser/js
options = {

    // Required. Called when a user selects an item in the Chooser.
    success: function(files) {
        toggleButtons(true);
        currentFilename = files[0].name;
        var url = files[0].link;
        var form = new FormData();
        ajaxSendDbxFile.open('POST','phphandlers/handleDropboxFilePosting.php',true);
        form.append('dblink',url);
        ajaxSendDbxFile.send(form);
        O(textArea).value = "";
        S(hourGlass).opacity = 1;
    },

    // Optional. Called when the user closes the dialog without selecting a file
    // and does not include any parameters.
    cancel: function() {
        toggleButtons(false);
        //alert("Cancelled: No file chosen from Dropbox.");
    },

    // Optional. "preview" (default) is a preview link to the document for sharing,
    // "direct" is an expiring link to download the contents of the file. For more
    // information about link types, see Link types below.
    linkType: "direct", // or "preview"

    // Optional. A value of false (default) limits selection to a single file, while
    // true enables multiple file selection.
    multiselect: false, // or true

    // Optional. This is a list of file extensions. If specified, the user will
    // only be able to select files with these extensions. You may also specify
    // file types, such as "video" or "images" in the list. For more information,
    // see File types below. By default, all extensions are allowed.
    extensions: ['.accdb', '.mdb'],
};
O('getDropboxFile').onclick = function(){
    toggleButtons(true);
    Dropbox.choose(options);
};
//==========================================
var ajaxSendLocalFile = new XMLHttpRequest();
var ajaxSendDbxFile = new XMLHttpRequest();
var ajaxKillSession = new XMLHttpRequest();
var ajaxGetTableNames = new XMLHttpRequest();
var ajaxSendQuery = new XMLHttpRequest();
var ajaxGetRemoteFilepath = new XMLHttpRequest();
var currentTableArray = [];
var currentFilename = "nodatabase";
var saveFromUrl = "http://qndsql.com/dbfiles/nodatabase/" + currentFilename;
var currentQuery = "";
var raw = "";
var progBarWidth = 200;
var resultSetCsv = "";
var fieldCount = "";
//var recordCount = "";
var fraction = 0;
var header = "";
var firstLocalFile = true;
//===============imported data===============
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
//, RecordCounter = id("RecordCounter")
, matchOrMatches = id("matchOrMatches")
;
//=========handlers=========================
window.onload = function(){
    adjustShroudSize();
    O('textArea').focus();
};
window.onresize = function(){
    adjustShroudSize();
    O('textArea').focus();
};
//------------------------------------------
function adjustShroudSize(){
    if( window.outerHeight >= O(modalShroud).offsetHeight ){
        S(modalShroud).height =  window.outerHeight + "px";
    }
    else{
        S(modalShroud).height = ( O(rsTable).offsetHeight + 100 ) + "px";  
    }
    S(modalShroud).width = window.innerWidth + "px";
}
setInterval(adjustShroudSize,100);
//------------------------------------------
document.onkeyup = function(e){
    exitShroud(e);
};
function exitShroud(e){
    if( keyPressed(e) === 27){
        O(rsTable).innerHTML = "";
        window.innerHeight = O(rsTable).offsetHeight  + "px";
        adjustShroudSize();
        S(modalShroud).visibility = 'hidden';
    }
}
function showShroud(){
        adjustShroudSize();
        S(modalShroud).visibility = 'visible';
}
O(modalShroud).onclick = adjustShroudSize;
O('getLocalFile').onclick = function(){
    O('localFile').click();
};

O('localFile').onchange = sendLocalFile;
function sendLocalFile(){
    O(textArea).value = "";       
    var realFileArray = O(localFile).files;
    if(firstLocalFile){
        firstLocalFile = false; 
        //--------build Binary Large Object (blob) as text file---------------------------
        // Source: https://developer.mozilla.org/en-US/docs/Web/API/BlobBuilder
        var textFileContents = ['bogus'];        
        var bogusFile = new Blob(textFileContents, {type : 'text/html'}); // the blob
        //--------------------------------------------------------------------------------        
        var ajaxForBogusFile = new XMLHttpRequest();
        ajaxForBogusFile.open('POST','phphandlers/handleLocalFilePosting.php',true);
        ajaxForBogusFile.setRequestHeader("FILENAME", 'bogus');
        ajaxForBogusFile.send(bogusFile);
        ajaxForBogusFile.onload = sendRealFile;
    }        
    else if(!firstLocalFile)
    toggleButtons(true);
    ajaxSendLocalFile.open("POST", "phphandlers/handleLocalFilePosting.php", true);
    ajaxSendLocalFile.setRequestHeader("FILENAME", O('localFile').files[0].name);
    ajaxSendLocalFile.send(O('localFile').files[0]);
    O(textArea).value = "";      
    showUploadProgress(ajaxSendLocalFile);    
    S(hourGlass).opacity = 1;
    //------helper function sendRealFile() ----
    function sendRealFile(){
        toggleButtons(true);
        ajaxSendLocalFile.open("POST", "phphandlers/handleLocalFilePosting.php", true);
        ajaxSendLocalFile.setRequestHeader("FILENAME", realFileArray[0].name);
        ajaxSendLocalFile.send(realFileArray[0]);        
        showUploadProgress(ajaxSendLocalFile);     
        S(hourGlass).opacity = 1;    
    }
};
ajaxSendLocalFile.onload = function(){
    toggleButtons(false);
    flashFileLoadSuccess();
    O('localFilePostMessage').innerHTML = this.responseText;
    currentFilename = this.responseText;
    O('btnTableNames').click();
    ajaxGetRemoteFilepath.open('POST','phphandlers/sendRemoteFilepath.php',true);
    ajaxGetRemoteFilepath.send();

};
ajaxSendLocalFile.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
       flashFileLoadSuccess();
    }
};
ajaxGetRemoteFilepath.onload = function(){
    saveFromUrl = this.responseText + currentFilename;
    saveOptions.files[0].url = saveFromUrl;
    saveOptions.files[0].filename = currentFilename;
    //alert(saveFromUrl);
    //O(textArea).value = saveFromUrl;
  
};  
//--------------------------------------------------
O('btnTableNames').onclick = function(){
    ajaxGetTableNames.open('POST','phphandlers/sendTableNames.php',true);
    ajaxGetTableNames.send();
};
ajaxGetTableNames.onload = function(){
    fillTableSelect(ajaxGetTableNames.responseText);
    O(resultSetDiv).innerHTML = "";
    O(fieldsCount).innerHTML="";
};
function fillTableSelect(tableString){
    /*create array of table names from a 
    'back-tick-separated list in a string
    */
    //clear textArea? (Maybe not)
    //O(textArea).value="";
    var tableArray = tableString.split('``');
    //O(tableLegend).innerHTML = tableArray[0];
    O(tableLegend).innerHTML = currentFilename;//O('localFilePostMessage').innerHTML;
    tableArray[0] = tableArray[0].replace( currentFilename,'');    
    currentTableArray = tableArray;    
 
    // get and show the count of tables
    var numberOfTables = tableArray.length;
    O(tableCount).innerHTML = numberOfTables + ( (numberOfTables != 1)?" Tables:":" Table:" ); 
    /* 0. clear out and initialize table select element
       1. create an option element for each table
       2. add table name as text
       3. append option element to select element    
    */
    O(selectTable).innerHTML="";    
    var option = document.createElement('option');
    option.innerHTML = '&dArr; Select a Table &dArr;';
    O(selectTable).appendChild(option);
    for(var i = 0; i < numberOfTables; i++){
        var option = document.createElement('option');
        var text = document.createTextNode( ((i+1>9)?"":"0")+(i+1) + ". " + tableArray[i]);
        option.appendChild(text);     
        O(selectTable).appendChild(option);        
    }
    //============fix zero table problem ==========
    /*
        If there is a single table in the dropdown whose text is "01."
            1. Remove the option
            2. change the label to say "0 tables"
    */
    var optionCount = O(selectTable).length;
    var tableOneText = O(selectTable).options[1].text;
    //alert("Option count"++"\n"    );
    if(optionCount === 2 && tableOneText === "01." ){
        O(selectTable).remove(1);
        O(tableCount).innerHTML = 0 + " Tables:";         
    }
    //==============================================
}
//--------------------------------------------------
O('killSession').onclick = function(){
    var affirm = confirm("OK to Delete Files?\n   (If not, Cancel)");
    if(affirm){
        S(hourGlass).opacity = 1;
        ajaxKillSession.open('POST','dbfiles/killSession.php',true);
        ajaxKillSession.send();
    }
};
window.onbeforeunload = function(){ 
    ajaxKillSession.open('POST','dbfiles/killSession.php',true);
    ajaxKillSession.send();
};
window.onunload = function(){ 
    ajaxKillSession.open('POST','dbfiles/killSession.php',true);
    ajaxKillSession.send();
};
ajaxKillSession.onload = function(){
    if(ajaxKillSession.status === 200){
        document.location.assign('');
    }
    else{
        alert(ajaxKillSession.responseText);
    }    
};

ajaxSendDbxFile.onload = function(){
    toggleButtons(false);    
    flashFileLoadSuccess();
    //============================
    ajaxGetRemoteFilepath.open('POST','phphandlers/sendRemoteFilepath.php',true);
    ajaxGetRemoteFilepath.send();  
    //=============================
    O('dropboxresponse').innerHTML = ajaxSendDbxFile.responseText;
    O('btnTableNames').click();     
}

//====
function showUploadProgress(xhr){    
    xhr.upload.onprogress = function(e){
        currentStatus(e);
    }
    //===helper function====
    function currentStatus(e){
        if (fraction > 0.01){S(hourGlass).opacity = 0;}
        else{S(hourGlass).opacity = 1;}
        //S(hourGlass).opacity = 1;
        S(progressHolder).opacity = 1;
        S(uploadProgress).opacity = 1;    
        if (e.lengthComputable){
            fraction = (e.loaded/e.total);
            if (fraction >= 1){
                setTimeout(function(){
                    S(uploadProgress).opacity = 0;
                    S(progressHolder).opacity = 0;                 
                    O(percentUpload).innerHTML = "0 %";
                    S(uploadProgress).border = '0 solid hsla(0, 100%, 10% ,0)'; //1px;
                    S(percentUpload).color = "black";
                    fraction = 0;
                    return;
                },1000);                    
            }
            else{
				//S(progressHolder).backgroundColor ='hsla(0, 100%, ' + (90*(1-fraction)+10) + '% ,1)';			
                S(uploadProgress).border = '0 solid hsla(0, 100%, ' + (90*fraction +10) + '% ,0)'; //1px?
                //====================================================
                //=Some older browsers will widen the entire div, so we must shorten it back:
                S(uploadProgress).width = progBarWidth*(1 - fraction)+ "px";
                var temp = O(uploadProgress).offsetTop;               
                //==============================================                
                S(uploadProgress).borderLeft = parseInt(progBarWidth*fraction) +
                'px solid hsla(0, 100%, ' + (90*fraction+10) + '% ,1)';
                //var temp = O(uploadProgress).offsetTop;  
                // ===============================================
                S(percentUpload).color = 'hsla(0, 100%, ' + (90*fraction+10) + '% ,1)';   
                O(percentUpload).innerHTML = parseInt(fraction*100)+' %';
                var temp = S('content').top;
            }
        }
        else{            
             S(progressHolder).opacity = 0;
             S(uploadProgress).opacity = 0;
             S(hourGlass).opacity = 0;            
        }
    }
}
//=================
function toggleButtons(flag){
    forAll(C('browse'), function(x){
        if(x.id !== 'killSession'){
            x.disabled = flag;
        }
    });
}
//=========================
O(selectTable).onchange = function(){
    O(btnClearSearch).click();
    var sqlStatement;
    if ( O(selectTable).selectedIndex != 0 ){
        sqlStatement = "SELECT * FROM [" +
            currentTableArray[O(selectTable).selectedIndex-1] +
        "]";
        O(textArea).value = sqlStatement;
        O(btnSendQuery).click();
    }
    else{
        O(textArea).value = "";
    }
};
//=================================
O(btnSendQuery).onclick = function(){
    if( O(textArea).value !="" && currentFilename != ""){
        sendQuery( O(textArea).value );
        O(btnClearSearch).click();
    }           
}
//=================================
function sendQuery(query){
    //-------clear previous query results------
    
    raw = "";
    O(fieldsCount).innerHTML = "";
    O(resultSetDiv).innerHTML = "";
    O(rsTable).innerHTML = "";
    O(recordNumber).innerHTML = "";
    
    //---------------------------------------
    S(hourGlass).opacity = 1;
    O(resultSetDiv).innerHTML="";
    var form = new FormData();
    ajaxSendQuery.open('POST','phphandlers/getQuerySendResultSet.php',true);
    form.append('query',query);
    form.append('filename',currentFilename);
    ajaxSendQuery.send(form);
}
//---------------------------------
O(ajaxSendQuery).onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
        S(hourGlass).opacity = 0;    
        //test for the string 'getTables' indicating that the query had no result set
        if ( ! RegExp('Warning').test(this.responseText) && ! RegExp('getTables').test(this.responseText)){
            //alert(this.responseText);
            // make an array of back-tick-separated field values ..
            // the first member of which is the list of field names
            raw = this.responseText;
            resultSetCsv = this.responseText.split('\r');
            recordCount = resultSetCsv.length - 2; //subtracts 1 for the header & 1 for final CR
            header = resultSetCsv[0].split('``');
            //---------build 'records' global variable defined in search.js
            records = [];
            for(var i=1; i < recordCount+1 ; i++){
                records[i-1] = resultSetCsv[i];
            }
            //----------------
            fieldCount = header.length;
            O(fieldsCount).innerHTML = ( (recordCount === -1) ? 0 : recordCount ) + 
                ( (recordCount != 1) ? " Records " : " Record " )+
                "&nbsp;&nbsp;&nbsp;" +
                ( (recordCount === -1) ? 0 : fieldCount ) +
                ( (fieldCount != 1 || recordCount === -1 ) ? " Fields" : " Field" );// +  " per record";
                    
            //----------------
            O(resultSetDiv).innerHTML="";
            var fieldTable = document.createElement('table');
            var i = 0;
            var value = "";
            var firstRecordArray = [];
            try{
                firstRecordArray = records[0].split('``');
            }
            catch(e){ records[0]="";}//dummy try-catch to satisfy browser
            forAll(header, function(aField){
                var fieldLabel = document.createTextNode(aField);
                var textBox = document.createElement('input');
                //name the fields in order like field5, field6, etc.
                textBox.setAttribute('id','field' + i);
                //-------find and show initial field data ------- 
                value = firstRecordArray[i];
                textBox.setAttribute('value','  ' + value);//buffer space left of field 
                //-----------------------------------------------            
                textBox.readOnly = true;
                textBox.setAttribute('size','30');
                S(textBox).backgroundColor = 'lightgray';
                S(textBox).borderRadius = "5px";
                var fieldRow = document.createElement('tr');
                var data1 = document.createElement('td');
                S(data1).textAlign = "right";
                var data2 = document.createElement('td');
                data1.appendChild(fieldLabel);
                data2.appendChild(textBox);
                fieldRow.appendChild(data1);
                fieldRow.appendChild(data2)
                fieldTable.appendChild(fieldRow);
                i++;
            });
            O(resultSetDiv).appendChild(fieldTable);
            S(fieldTable).display = "inline-block";
            //S(fieldTable).paddingTop = "10px";
            recordPointer = 0;
            nowShowRecord();

        }
        else{
            //no or bad resultSet: 1.) clear previous resultSet (and tables) 2.) call php to return table list;
            if(this.readyState == 4){
                S(hourGlass).opacity = 0; 
                O('btnTableNames').click(); 
            }
        }
        this.responseText = "";
    }
};
//==========================
function flashFileLoadSuccess(){
    S(uploadProgress).width = 0;	
    S(uploadProgress).border = '0 solid white';
    S(uploadProgress).borderLeft = progBarWidth + 'px solid white';
    O(percentUpload).innerHTML = "100 %";
    S(percentUpload).color = "white";    
    S(uploadProgress).opacity = 1;
    S(progressHolder).opacity = 1;
    setTimeout(function(){
        S(uploadProgress).border = '1px solid black';
        O(percentUpload).innerHTML = "100 %";
        S(percentUpload).color = "white";
        S(uploadProgress).opacity = 0;
        S(progressHolder).opacity = 0;
        S(hourGlass).opacity = 0;        
    },750);
}
//================================
O(textArea).ondblclick = function(){
    O(btnSendQuery).click();
};
O(textArea).onkeyup = function(e){
    enhanceQuery(e);
}
function enhanceQuery(e){
    //http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area
    //O(textArea).value
    /* If last word is "select" (ignore case)
       1. tack on: "\nFROM" + " "
       2. move cursor back to end of "select" keyword, plus one space
    */
    /*If last word is "like" (ignore case)
        1. tack on: " "+ "'%%'"
        2. move cursor between percent signs (%%)
    */
    // adds newline and FROM for typed SELECT = SELECT \nFROM, cursor after SELECT.
    if( O(textArea).value.length -  O(textArea).value.toLowerCase().lastIndexOf('select') === 6  &&
       O(textArea).value.toLowerCase().lastIndexOf('select') !== -1 ){
        O(textArea).value += " " + "\nFROM" + " ";
        setCaretToPos(O(textArea), O(textArea).value.length - 6 );         
    }
    // adds wildcard string '%%' for typed LIKE = LIKE '%%', cursor between wildcard characters.
    if( O(textArea).value.length -  O(textArea).value.toLowerCase().lastIndexOf(" "+'like'+ " ") === 6  &&
       O(textArea).value.toLowerCase().lastIndexOf(" "+'like'+ " ") !== -1 ){
        O(textArea).value += " " + "'%%'";
        setCaretToPos(O(textArea), O(textArea).value.length - 2 );    
    }
    // adds INTO for typed INSERT = INSERT INTO, cursor after INTO.
    if( O(textArea).value.length -  O(textArea).value.toLowerCase().lastIndexOf('insert') === 6  &&
       O(textArea).value.toLowerCase().lastIndexOf('insert') !== -1 ){
        O(textArea).value += " " + "INTO" + " ";
        setCaretToPos(O(textArea), O(textArea).value.length + 1 );         
    }  
    // -----------helper functions: -------------------
    function setSelectionRange(input, selectionStart, selectionEnd) {
      if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
      }
      else if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
      }
    }
    function setCaretToPos (input, pos) {
      setSelectionRange(input, pos, pos);
    }
    // ----------------------------------------------------
}
//================================
//====send dropbox link to get file from dropbox server
// Now done (above) with DropBox options (JSON object).
/*
on('DbxChooserSuccess', O('dBxFile'),function(e){
    var url = e.files[0].link;
    var form = new FormData();
    ajaxSendDbxFile.open('POST','phphandlers/handleDropboxFilePosting.php',true);
    form.append('dblink',url);
    ajaxSendDbxFile.send(form);
    showUploadProgress(ajaxSendDbxFile);   
});
*/
//================================================================================================
//================ combining js code from showing one record at a time ===========================
//================================================================================================

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

    if ( notTooFar() ) {
        pointToNextRecord();
    }
    else {
        pointToFirstRecord();
    }
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
       recordPointer = 0;//recordPointer = 1;
    }
    else{
        indexPointer = 0;
        recordPointer = matchIndexes[indexPointer];    
    }
}
//------------------------------------------------
function nowShowRecord(){
    try{
        //recordCounter.style.visibility = "visible";
        var record = [];
        record = records[recordPointer].split("``");                   
        for( var i = 0; i< record.length; i++ ) {
            id("field"+i.toString()).value = " " + record[i];
        }
        id("recordNumber").innerHTML = recordPointer +1;
        if( matchCount != 0 ){
            id('matchIndex').innerHTML = indexPointer +1;
        }
    }
    catch(err){ }//alert('nowShowRecord() ERROR caught:\n' + err.toString());}
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
        if ( recordPointer - 1 >= 0 ) return true;// was > 0; now works
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
        currentMatch = "";
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
    for ( var i = 0; i < recordCount; i++){//was i = 1, now fixed
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
//===========================================
ajaxSendDbxFile.onreadystatechange = function(){
    if(ajaxSendDbxFile.readyState === 1){
        setTimeout("showProgress(25/100)",20);
    }
    else if(ajaxSendDbxFile.readyState === 2){
        setTimeout(" showProgress(50/100)",20);
    }
    else if(ajaxSendDbxFile.readyState === 3){
        setTimeout("showProgress(75/100)",20);                
    }
    else if(ajaxSendDbxFile.readyState === 4){
        setTimeout("showProgress(100/100)",20);                
        //--------------------------------
        setTimeout(function(){
            S(uploadProgress).opacity = 0;
            S(progressHolder).opacity = 0;                 
            O(percentUpload).innerHTML = "0 %";
            S(uploadProgress).border = '1px solid hsla(0, 100%, 10% ,0)'; 
            S(percentUpload).color = "black";
            fraction = 0;
            return;
        },1250);                 
        //--------------------------------
    }
};// END readystatechange handler
//====helper function showProgress(percent){
function showProgress(fraction){
    //alert(fraction);
    S(progressHolder).opacity = 1;
    S(percentUpload).opacity = 1;
    S(uploadProgress).opacity = 1;
    //-----------------------------
    S(uploadProgress).border = '0 solid hsla(0, 100%, ' + (90*fraction +10) + '% ,0)';  //"1px" ? 
    //-----------------------------------------------
    /*
        Some older browsers will widen the entire div, so we must shorten it back.
        Will not work id CSS has box-sizing: border-box active.
    */
	//S(progressHolder).backgroundColor ='hsla(0, 100%, ' + (90*(1-fraction)+10) + '% ,1)';
    S(uploadProgress).width = progBarWidth*(1 - fraction)+ "px";    
    //--------------------------------------------------    
    S(uploadProgress).borderLeft = parseInt(progBarWidth*fraction) + 'px solid hsla(0, 100%, ' + (90*fraction+10) + '% ,1)';
    //-------------------------------------------------------------------------
    S(percentUpload).color = 'hsla(0, 100%, ' + (90*fraction+10) + '% ,1)';   
    O(percentUpload).innerHTML = parseInt(fraction*100)+' %';
    var temp = O('content').offsetHeight;            
    //-----------------------------  
}
O(popOut).onclick = function(){    
    buildResultSetTable(raw);
    seperateWindow(rsTable);
    //S(modalShroud).visibility = "visible";
}
O(closeShroud).onclick = function(){
    O(rsTable).innerHTML = "";
    window.innerHeight = O(rsTable).offsetHeight  + "px";
    adjustShroudSize();
    S(modalShroud).visibility = 'hidden';
};

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
        //don't include header and extra spurious record        
        var recordCount = aryRecords.length - 1;
        var tbl = element("table");
        tbl.id="popTable";
        tbl.border = "0";
        //----build record view window
        O(rsTable).innerHTML = ""; //clear the previous record-set view
        // append styling, etc. for printing purposes:
        O(rsTable).innerHTML += '<!doctype html>';
        O(rsTable).innerHTML += '<head>'        
        O(rsTable).innerHTML += '<link rel="icon" href="http://qndsql.com/favico.ico" type="image/x-icon">';        
        O(rsTable).innerHTML += '<title>Quick-n-Dirty Pop-Out</title>';

        var tr = element("tr");
        tr.id = "topRow";
        O(rsTable).innerHTML += '<style type="text/css"> #popTable{margin: 0 auto; font-family: Georgia serif; font-size: 0.8em; font-weight: bold;} @media print{ body {font-family: "Times New Roman" serif; font-size: 0.35cm; font-weight: bold;  page-break-inside: avoid;}} #topRow {font-weight: bold; font-size: 1em;}</style></head>';
        
        //======================
        var centerTag = document.createElement('center');        
        var breakTag = document.createElement('br');        
        var fileNameTextNode = document.createTextNode(currentFilename);
        
        O(rsTable).appendChild(centerTag);
        O(centerTag).appendChild(fileNameTextNode);
        
        O(rsTable).appendChild(breakTag);        
        
        var node = document.createTextNode( O(textArea).value +': ' + O(match).value  );
        var spanTag = document.createElement('span');   
        var centerTag2 = document.createElement('center');
        var breakTag2 = document.createElement('br');        
        
        O(rsTable).appendChild(spanTag);
        O(spanTag).appendChild(centerTag2);
        O(centerTag2).appendChild(node);
        
        O(rsTable).appendChild(breakTag2);
        //=======================        
        tr.style.textAlign = "left";
        for(var i = 0; i < fieldCount; i++){// i = -1
            var td = element("td");
            td.style.background = "white";
            td.style.textAlign = "left";
            if ( i != -1 ){td.appendChild(text(aryFieldNames[i]));}
            else{td.innerHTML = "Headings &rArr;"}
            tr.appendChild(td);
        }

        tbl.appendChild(tr); 
        //=================building the guts:    
        var maxRecords = 0;
        if(matchCount === 0){
            maxRecords = recordCount;
        }
        else{
            maxRecords = matchCount+1;
        }
        var r = 0;
        var c = 0;
        for ( r = 1; r < maxRecords; r++ ){
            if(matchCount === 0){
                var row = aryRecords[r].split("``");                        
            }
            else{
                var row = aryRecords[matchIndexes[r-1]+1].split("``");                          
            }
            var tr = element("tr");
            for ( c = 0; c < fieldCount; c++ ){ // c = -1                                
                //string = text(row[c]);
                td = element("td");
                if ( r%2 != 0 && c !=-1 ){td.style.background = "#e8e8e8";}
                /*if ( c == -1 && r%40 == 0 ){td.innerHTML = "<a href='#top'>&uArr;GO TO TOP&uArr;</a>";} */
                if ( c == -1 && (r%40 == 0 || r == maxRecords -1) ){td.innerHTML = "<a href='#top'>&uArr;GO TO TOP&uArr;</a>";}
                else if ( c != -1 ){td.innerHTML = row[c];}
                tr.appendChild(td);
            }
            tbl.appendChild(tr);
        }
        //=================================================    
        O(rsTable).appendChild(tbl);
        S(popTable).overflow = "auto";
        //Position the shroud icons near the URC of table:
        var iconsPosition = (innerWidth + O(popTable).offsetWidth)/2 ;
        if ( iconsPosition < (innerWidth + 100) ){
            S(popupIcons).left = (iconsPosition - 100) + "px";
        }else{
            S(popupIcons).left = (innerWidth - 100) + "px";   
        }  
    }
    catch(err){} //just to satisfy the browser's error catcher. 
         
}
//==============================================
O(printShroud).onclick = printRsTable;
function printRsTable(){
    printDiv(rsTable);
}
var newWin = {};
function printDiv(printArea) {
    var divToPrint = O(printArea);
    newWin = window.open();
    newWin.document.write(divToPrint.innerHTML);
    newWin.document.close();
    newWin.focus();
    newWin.print();
    newWin.close();
}
function seperateWindow(printArea){
    //S(hourGlass).opacity = 1;
    var divToPrint = O(printArea);
    newWin = window.open();
    newWin.document.write(divToPrint.innerHTML);
    newWin.document.close();
    newWin.focus();
}

function downloadFile(url){
    var downloadWindow;
    downloadWindow = window.open(url);
    downloadWindow.focus();
    
    setTimeout(function(){
        downloadWindow.close();
    },2000);
    
}
//=====================================
O(btnSaveFile).onclick = function(e){
    e.stopPropagation();
    e.preventDefault();    
    S(saveFilePanel).visibility = "visible";
}

O(saveFilePanel).onclick = function(){
    closeOpenSavePanel();
}

O(download).onclick = function(){
    downloadFile(saveFromUrl);
}
//======================================
var saveOptions = {
    files:[
        {'url': saveFromUrl, 'filename': currentFilename}
    ],
    success: function(){
        alert("Success: File saved to Dropbox.");
    },
    error: function(){
        alert("Error: File not saved to Dropbox.");
    }
}
O(saveToDropbox).onclick = function(){    
    //Dropbox.save(saveFromUrl,currentFilename);
    Dropbox.save(saveOptions);
}
//===================================
// ====== New OPEN AND SAVE area below
//===================================
closeOpenSavePanelOnMenuHover();
//----------------------------------
function closeOpenSavePanelOnMenuHover(){
    forAll( C('menu'), function(aMenu){
        aMenu.onmouseover = closeOpenSavePanel;    
    });
}
function closeOpenSavePanel(){
    S(saveFilePanel).visibility = 'hidden';
    S(saveFileChoices).visibility = 'hidden';
    S(openFileChoices).visibility = 'hidden';
    S(download).visibility = 'hidden' ;  
    S(saveToDropbox).visibility = 'hidden' ; 
    S(getFromDropbox).visibility = 'hidden' ; 
    S(getLocal).visibility = 'hidden';
    S(x).visibility = "hidden";
    S(newFileChoices).visibility = "hidden";
    S(access2003).visibility = "hidden";
    S(access2007).visibility = "hidden";    
}
function showOpenOptions(){
    S(saveFilePanel).visibility = 'visible';
    S(openFileChoices).visibility = 'visible';    
    S(getLocal).visibility = 'visible';
    S(getFromDropbox).visibility = 'visible';
    S(x).visibility = "visible";
}
function showSaveOptions(){
    S(saveFilePanel).visibility = 'visible';
    S(saveFileChoices).visibility = 'visible';
    S(download).visibility = 'visible';
    S(saveToDropbox).visibility = 'visible';
    S(x).visibility = "visible";    
}
function showFileOptions(){
    S(saveFilePanel).visibility = 'visible';
    S(x).visibility = "visible";
    S(newFileChoices).visibility = 'visible';
    S(access2003).visibility = "visible";
    S(access2007).visibility = "visible";   

}
//=========Menu choices====================
O(save).onclick = function(){   
    showSaveOptions();
    setTimeout("closeOpenSavePanel()", 50);
    setTimeout("showSaveOptions()", 100);
    O(btnSaveFile).click();
};
O(ohpen).onclick = function(){
    showOpenOptions(); 
    setTimeout("closeOpenSavePanel()", 50);
    setTimeout("showOpenOptions()", 100);    
};
O(deleet).onclick = function(){
    O(killSession).click();
};
O(nu).onclick = function(){
   showFileOptions();
    setTimeout("closeOpenSavePanel()", 50);
    setTimeout("showFileOptions()", 100);   
};
//=============open a file======================
O(getLocal).onclick = function(){
    closeOpenSavePanel();
    O(getLocalFile).click();
};
O(getFromDropbox).onclick = function(){
    closeOpenSavePanel();
    O(getDropboxFile).click();
};
//===============new file======================
O(accdb).onkeyup = function(e){
    newFileChoice(e, 'accdb', 'mdb');
}
//---------------------
O(mdb).onkeyup = function(e){
    newFileChoice(e, 'mdb', 'accdb');
}
//==============================================
function newFileChoice(eventObject, keep, toss){
    //clear filename in other file version box
    O(toss).setAttribute('value',' ');
    O(toss).value = '';    
    if(keyPressed(eventObject)=== 13){
        createNewFile(keep,toss);
    }
}
//==================================
O(createFile).onclick = function(){
    if( O(mdb).value == "" && O(accdb).value == "" ){
        alert("Type in a file name.");
        return;
    }
    else if(O(mdb).value == ""){
        createNewFile('accdb', 'mdb'); 
    }
    else if(O(accdb).value == ""){
        createNewFile('mdb', 'accdb');  
    }
}
//===================================
function createNewFile(keep, toss){
    //-----------------------------
    S(hourGlass).opacity = 1;
    O(textArea).value = '';
    var ajaxOpenNewFile = new XMLHttpRequest();
    var form = new FormData();
    ajaxOpenNewFile.open('POST', 'phphandlers/openNewFile.php', true );
    form.append('version', keep);
    form.append('filename', O(keep).value);
    ajaxOpenNewFile.send(form);
    //---
    closeOpenSavePanel();
    O(keep).setAttribute('value','');
    O(keep).value = '';
    //---------------------------------
    ajaxOpenNewFile.onload = function(){
        toggleButtons(false);
        flashFileLoadSuccess();
        O('localFilePostMessage').innerHTML = this.responseText;
        currentFilename = this.responseText;
        O('btnTableNames').click();
        ajaxGetRemoteFilepath.open('POST','phphandlers/sendRemoteFilepath.php',true);
        ajaxGetRemoteFilepath.send();            
    }
    //----------------------------------
}
//==========================================
window.onkeyup = function(e){
    if(keyPressed(e) === 27){
        closeOpenSavePanel();    
    }
};
//==========================================
var logoMessage =""+
"          Practice SQL Queries\n"+
"on Microsoft Access database files\n"+
"                 'Hassle-Free.'\n\n"+
"Create new files, or load existing files\n"+
"  from your device or from Dropbox!\n\n"+
"        Great for 'What-If' testing\n"+
"     before committing your queries\n"+
"         to production databases.\n\n"+
"    (Don't forget to save your files!)\n\n"
;
O(logo).onclick = function(){
    alert(logoMessage);
}





