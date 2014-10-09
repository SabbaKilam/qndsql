//-----------------Abbas' JS Library -----------
//===============make DOM node element object from ID====
function o(s){
return document.getElementById(s);
}
//---------------------------------------------
function id(s){
return document.getElementById(s);
}
//---------------------------------------------
function _id(s){
return document.getElementById(s);
}
//---------------------------------------------
function on(e,o,h){
    if ( typeof o.addEventListener == "function" ){
        o.addEventListener(e, h, false);    
        if(e == "mousewheel"){
            o.addEventListener("DOMMouseScroll", h, false);
        }
        if(e == "DOMMouseScroll"){
            o.addEventListener("mousewheel", h, false);
        }        
    }else{
        o.attachEvent("on" + e, h);
    }
}
//==============Attach handler to an object for an event ====
function objectEventHandler(o,e,h){
    on(e,o,h);
};
//-----------------------------------------------
//variation: event listed as first argument
function whenUserDoesA(e,o,h){
    on(e,o,h);
}
//-----------------------------------------------
//variation: the function name is a more explicit verb: attach
function attachEventHandler(o,e,h){
    on(e,o,h);  
};
//================Create Ajax object=========================
Ajax = function(){//return XMLHttpRequest object or Error
  try{
    return new XMLHttpRequest();
  }
  catch(error){}
  try{
    return new ActiveXObject(Microsoft.XMLHTTP);
  }
  catch(error){}
  try{
    return new ActiveXObject(Msxml2.XMLHTTP);
  }
  catch(error){}
   
  throw new Error("Could not make AJAX request object.");
};
//==================================================
HttpObject = function(){//return XMLHttpRequest object or Error
  try{
    return new XMLHttpRequest();
  }
  catch(error){}
  try{
    return new ActiveXObject(Microsoft.XMLHTTP);
  }
  catch(error){}
  try{
    return new ActiveXObject(Msxml2.XMLHTTP);
  }
  catch(error){}
   
  throw new Error("Could not make AJAX request object.");
};
//============check for substring inside main string===========
function inStr(main,sub){
  var flag=false;
  if(main.indexOf(sub) !== -1){
    flag=true;  
  }
  return flag;
};
//==========check if ajax uploads files. Returns true or false=========================
ajaxUploadsFiles = function() {//http://blog.new-bamboo.co.uk/2012/01/10/ridiculously-simple-ajax-uploads-with-formdata
    return supportFileAPI() && supportAjaxUploadProgressEvents() && supportFormData();
//------------------internal functions-----------------------    
    function supportFileAPI() {
        var fi = document.createElement('INPUT');
        fi.type = 'file';
        return 'files' in fi;
    }
//------------------------------------------------------------    
    function supportAjaxUploadProgressEvents() {
        var xhr = new XMLHttpRequest();
        return !! (xhr && ('upload' in xhr) && ('onprogress' in xhr.upload));
    }
//------------------------------------------------------------    
    function supportFormData() {
        return !! window.FormData;
   }
};    
//=========================================================================
    function tagArray(o,s){
        return o.getElementsByTagName(s);
    }
//=======================================================    
function forAll(array, aFunction) {
  for (var i = 0; i < array.length; i++)
    aFunction(array[i]);
}
//=================================================
function forTwoArrays(ary1, ary2, action){
    if (ary1.length != ary2.length) return false;
    for(var i=0; i < ary1.length; i++){
        action(ary1[i],ary2[i]);
    }
    return true;
};
//===================================================
function forTwinArrays(ary1, ary2, action){
    if (ary1.length != ary2.length) return false;
    for(var i=0; i < ary1.length; i++){
        action(ary1[i],ary2[i]);
    }
    return true;
};
//===================================================
function callAfterMilliseconds(functionName,delay){
    return  setTimeout(functionName, delay);
}
//===================================================
function callAfterSeconds(functionName,delay){
    return  setTimeout(functionName, delay * 1000);
}
//=====================================================
function forBothDo(things1, things2, action){
    for(var i = 0; i < things1.length; i++ ){
        for(var j = 0; j < things2.length; j++){
            //action on the ordered pair Cartesian product things[i] X things[j] = (things1[i],things2[j]
            action(things1[i],things2[j]);
        }
    }
}
//=====================================================
function forBoth(things1, things2, action){
    for(var i = 0; i < things1.length; i++ ){
        for(var j = 0; j < things2.length; j++){
            action(things1[i],things2[j]);
        }
    }
}
//=====================================================
/* A function that retruns a boolean if its
** string argument is a finite number
*/
function isNumber(arg){
  return !isNaN(parseFloat(arg))  &&  isFinite(parseFloat(arg));
}
//====================================================
function forTripletArrays(a1,a2,a3,action){
	for(var i = 0; i < m.length; i++){
		action(a1[i],a2[i],a3[i]);
	}
}
//====================================================
function _forTripletArrays(a1,a2,a3,action){
	for(var i = 0; i < a2.length; i++){
		action(a1[i],a2[i],a3[i]);
	}
}
//==================================================
function keyPressed(e){
    var theKey=0;
    e=(window.event)?event:e;
    theKey=(e.keyCode)?e.keyCode:e.charCode;
    return theKey;
}    
//==================================================
/*
    A Suite of three wrappers for common DOM utilities.
    1.  A wrapper for document.getElementById(obj)
        Clever: you can use the object reference or its id string!
    2.  Wrapper for style property; again obj or id can be used.
    3.  C(className) returns a collection (array) of all elements in the DOM with class name className.
        Objects with multiple classes have only the first assigned class checked.
*/
function O(obj){
    if (typeof obj == 'object') return obj;
    else return document.getElementById(obj);
}

function S(obj){
    return O(obj).style;
}

function C(className){
    var elements = document.getElementsByTagName('*');
    var objects = [];
    for (var i = 0 ; i < elements.length ; ++i){
        if (elements[i].className == className){
            objects.push(elements[i]);
        }
    }
    return objects;
}
//=================================================================




    