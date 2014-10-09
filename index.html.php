<!doctype html>
<!-- -->
<html lang="en"> 
<head>
    <meta charset = "utf-8">
    <!--<meta name="viewport" content="width=device-width, minimum-scale=0.5, maximum-scale=1.5, user-scalable=yes">--> 
    <meta name="viewport" content="width=device-width, scale=1, user-scalable=no">    
    <title>Quick-n-Dirty SQL</title>
    <link rel="stylesheet" href="css/normalize.css">    
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/print.css">    
    <link rel="icon" href="favico.ico" type="image/x-icon">    
    <script type="text/javascript" src="https://www.dropbox.com/static/api/1/dropins.js" id="dropboxjs" data-app-key="t143rt1irstw775"></script>    
    <script src="js/AbbasLib.js"></script>
</head>
<body>
    <div id="modalShroud">
        <a name="top" id="top"></a>
        <div id="popupIcons">
            <div id="closeShroud" class="btnShroud" title="close"></div>
            <div id="printShroud" class="btnShroud" title="print"></div> 
        </div>
        <div id="rsTable" class="page-break"></div>
    </div><!-- End modalShroud-->  
    <div id="outerContainer">
    <div id="logo">
        <em>Quick-n-Dirty</em> SQL
    </div>    
        <div id="content">
            <div id="newFileChoices">
                <div id="createFile">create file</div>    
                <div id="access2007" class="access">
                    File - <span class="yellow">Access 2007</span><br>
                    <input type="text" id="accdb" size="10">.accdb
                </div>
                <!--<span>&nbsp;&nbsp;&nbsp;</span>-->
                <div id="access2003" class="access">
                    File - <span class="yellow">Access 2003</span><br>
                    <input type="text" id="mdb" size="10">.mdb
                </div>
            </div> 
                <!-- try saveFilePanel here  -->
                <div id="saveFilePanel" class="choices">
                    <div id="x"></div>              
                    <div id="saveFileChoices">
                        <div id="download" class="saveFile"><span class="yellow">Save</span> File Locally</div>
                        <span>&nbsp;</span>
                        <div id="saveToDropbox" class="saveFile">
                            <span><span class="yellow">Save</span> To Dropbox</span>
                            <span>&nbsp;</span>                            
                            <image class="dbLogo">                            
                        </div>
                    </div>
                    <div id="openFileChoices">
                        <div id="getLocal" class="saveFile"><span class="yellow">Open</span> Local File</div>
                        <span>&nbsp;</span>
                        <div id="getFromDropbox" class="saveFile" >
                            <span><span class="yellow">Open</span> from Dropbox</span>
                            <span>&nbsp;</span>
                            <image class="dbLogo">
                        </div>
                    </div>
                </div><!--   end of saveFilePanel-->


<!--  end of try saveFilePanel here  -->
            
            <div id="menu">
                <div id="nu" class="menu">New</div>
                <div id="ohpen" class="menu">Open</div>
                <div id="save" class="menu">Save</div>                                
                <div id="deleet" class="menu">Delete</div><!--mis-spelled to avoid using a javaScript keyword when referring to this element -->          
            </div>
            <br>
            <div id="hourGlass">&nbsp;&nbsp;<span>wait</span></div>
            <div id="fileButtons">
                <button id="getLocalFile" class="btn" >Get Local File</button>
                <button id="getDropboxFile" class="btn">Get Dropbox File</button>
                <button id="killSession" class="btn">Delete&nbsp;</button>
                <br>
                <div id="progressHolder">
                    <span id="percentUpload">0%</span>
                    <div id="uploadProgress"></div>
                </div><!-- END progressHolder -->
            </div><!-- end of file buttons -->
            <!-- ===========START old spot for selectTable div =========  -->

            <!-- ==========END old spot for selectTable div ==============   -->            
            
            <div id="editor">
                <fieldset>
                    <legend>
                        SQL Editor Window
                        <div id="querySearchDiv">
                            <button id="btnSendQuery" class="btn">Send Query</button>
                        </div> 
                    </legend>
                        <textarea id="textArea" width="60"></textarea>
                </fieldset>
            </div><!-- END editor --> 
            <!-- ============================-->
            <div id="selectTableDiv" class="outputInfo">
                <!-- ========Save File Panel=====-->

                <!-- ===END of=====Save File Panel=====-->                
                <fieldset>
                    <legend id="tableLegend">Filename</legend>
                    <b><span id="tableCount">&nbsp;Tables:</span></b>
                    <br>   
                        <select id="selectTable">
                            <option>&dArr; Select a Table &dArr;</option>
                        </select>                      
                        <button id="btnSaveFile" class="btn" class="choices"> Save File </button>
                </fieldset>
            </div><!-- END selectTableDiv -->            
            <!-- ============================-->            
            <div id="fieldsDiv" class="outputInfo">
				<fieldset>
                    <legend id="fieldsLegend">
                        <b><span id="fieldsCount">&nbsp;Fields:</span></b>
                    </legend> 
                    <div id="popOut">Pop Out</div>
                <!--  ===================================   -->                
                <div id="innerSearchPanel" class="outputInfo">
                    <div id="matchReportDiv">
                        <span id="matchIndex">0</span> of <span id="totalMatches">0</span>&nbsp;
                        <span id="matchOrMatches">matches</span>
                    </div>
                    <div id="searchWindowDiv">
                        Search: <input id="match" type="text" size="20">
                        <br>
                        <br>
                        <input type="button" id="btnClearSearch" value="Clear Search">
                    </div>
                </div>    
                <!--  ===================================   -->
                    <div id="searchButtons" class="searchButtons">
                        <div id="btnFirstRecord" class="searchButton"></div>
                        <div id="btnRewind" class="searchButton"></div>
                        <div id="btnBackward" class="searchButton"></div>
                        <span>&nbsp;&nbsp;&nbsp;<span>
                        <div id="btnForward" class="searchButton"></div>
                        <div id="btnFastForward"class="searchButton"></div>
                        <div id="btnLastRecord"class="searchButton"></div>
                    </div>
                <!--  ===================================   -->                 
                    <div>Record number&nbsp;<span id="recordNumber"></span></div>
                
                    <div id="resultSetDiv"></div>                  
                </fieldset>            
            </div><!-- END fieldsDiv -->
            <div id="controls">
                <input type="file" id="localFile" accept=".mdb, .accdb" >
                <b><span id="localFilePostMessage" style="visibility: hidden"></span></b>
                <button id="btnTableNames" class="btn">Get Table Names</button>
                <br>
                <span id="tableNames"></span>
                <!--
                <input type="dropbox-chooser" id="dBxFile" name="dBxFile" data-link-type="direct" style="visibility: hidden;"/>
                -->
                <span id="dropboxresponse"></span>
            </div>
        </div><!-- END content -->        
    </div><!-- END outerContainer-->
</body>
<script src="js/script.js"></script>
<!--<script src="js/search.js" defer></script>-->
</html> 