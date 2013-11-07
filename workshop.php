<?php

function con() {
    mysql_connect() or die('Could not connect: '.mysql_error);
    mysql_select_db('sloisel_numeric') or die('Could not select db: ' . mysql_error());
}
con();

if(isset($_POST['savedata'])) {
	$data = $_POST['savedata'];
	if (get_magic_quotes_gpc())  
 		$data = stripslashes($data);
	json_decode($data) or die("json error");
	$f = hash('sha256',$data);
	if($f === "") { exit; }
	$d = mysql_real_escape_string($data);
	$q = "insert ignore into blobs value ('$f','$d')";
	$result = mysql_query($q) or die('Could not save script: ' . mysql_error());
	header('Location: workshop.php?link=' . $_GET['link']);
	exit;
}
?>


<!doctype html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="description" content="Numerical analysis in javascript: library and console." />
<meta name="keywords" content="Javascript,HTML,simplex,matrix,vector,linear algebra" />
<meta name="author" content="Sébastien Loisel" />
<link rel="SHORTCUT ICON" href="favicon.ico">
<link href='http://fonts.googleapis.com/css?family=Lato' rel='stylesheet' type='text/css'>
<link rel="stylesheet" type="text/css" href="resources/style.css">
<title>Numeric Javascript: Workshop</title>
<!--[if lte IE 10]>
<script language="javascript" type="text/javascript" src="tools/excanvas.min.js"></script>
<![endif]-->
<script src="tools/megalib.js"></script>
    <style>
        div.master {
            margin: 0px;
            padding: 0px;
            border: 0px;
        }
        div.inout {
            margin: 0px;
            padding: 0px;
            border: 0px;
            font-family: sans-serif;
            font-size: 8px;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -o-user-select: none;
            user-select: none;
        }
        div.input,div.output {
            margin-left: 30px; 
            margin-right: 15px;
            margin-top: 0px;
            margin-bottom: 0px;
            position: relative;            
            margin: 0px;
            padding: 0px;
            border: 0px;
        }
        div.input {
            margin-top:5px;
        }
        a.button {
            color: blue;
            font-family: sans-serif;
            font-size: 16px;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -o-user-select: none;
            user-select: none;
            text-decoration: none;
        }
        textarea.in0, textarea.in1, div.out {
            font-family: monospace;
            font-size: 14px;
            color: #000000;
            white-space: pre-wrap;
            width: 100%;
        }
        textarea.in0, textarea.in1 {
            resize: none;
            overflow: hidden;
        }
        textarea.in0, textarea.in1 {
            margin: 0px 0px 0px 0px;
            border: 2px #0000ff solid;
            padding: 0px;
        }
        div.out {
            margin: 0px;
            padding: 0px;
            border: 2px black none;
            line-height: 100%;
            margin: 0;
            padding: 0;
        }
        textarea.in0 {
            background-color: #b0b0ff;
        }
    </style>
<body onload="workshop.restore2();">
<?php $label = ": Workshop"; include "resources/header.html"; ?>


<form name="myform" action="workshop.php" method="post">
<table cellspacing=20px cellpadding=0>
<tr><td>
<ul class="nav">
	<li class="nav"><a id = "NEW" class="nav" href="#" onclick="workshop.reset();">START OVER</a></li>
	<li class="nav"><a href="javascript: workshop.submit();" class="nav" id="permalink">MAKE PERMALINK</a>
</ul>
</td>
<td style="margin:10px; font-size:12px;" id="divupdate">
</td>
</tr>
</table>
<input type="hidden" name="savedata" value="">
</form>

    <div id="master_0" class="master">
        <div class="output" id="output_0" style="margin-left: 30px; margin-right: 15px; position: relative;">
        <div class="inout" style="position: absolute; left: -30px; top: 5px;">
        
        </div>
        <a href="#" onclick="workshop.mkdiv(0);" class="button" style="position: absolute; right: -15px; bottom: -10px;">&#x21A9;</a>
        <div class="out" id="out_0"></div>
        </div>
    </div>

<script>
"use strict";
var _indexOf;
if(typeof Array.indexOf === "undefined") {
    _indexOf = function(t,obj){
   for(var i=0; i<t.length; i++){
    if(t[i]==obj){
     return i;
    }
   }
   return -1;
  }
} else _indexOf = function(t,obj) { return t.indexOf(obj); }

var _retarded = false;
if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){ _retarded = true; }

if(_retarded) {
    _queue = [];
	_onmessage = function(ev) { _queue.push(ev); }
	_loaded = 0;
	window.Worker = function(f) {
		var worker = this;
		worker.queue = [];
		worker.onmessage = function(ev) {};
		worker.postMessage = function(ev) { _onmessage({data: ev}); };
		var scr = document.createElement('script');
		scr.src = f;
		scr.type = 'text/javascript';
        scr.onreadystatechange = function () {
            var k;
            if (scr.readyState == 'loaded' || scr.readyState == 'complete') {
                for(k=0;k<_queue.length;k++) { _onmessage(_queue[k]); }
            }
        }
		document.getElementsByTagName('head')[0].appendChild(scr);
		workerPostMessage = function(ev) { worker.onmessage({data: ev}); }
	}
	importScripts = function(z) {
	    var scr = document.createElement('script');
        scr.src = z;
        scr.type = 'text/javascript';
        document.getElementsByTagName('head')[0].appendChild(scr);
	};
}
var workshop = (function () {

function resize(input) {
	if(input.scrollHeight > input.clientHeight) {
		input.style.height = (input.scrollHeight+10)+"px";
	}
}

function elementPos(e){
	var x = 0, y = 0, dx = e.offsetWidth, dy = e.offsetHeight;
    while(e !== null){
    	x += e.offsetLeft;
    	y += e.offsetTop;
    	e = e.offsetParent;
  	}
  	return {x:x, y:y, dx:dx, dy:dy};
}

function checkpos(e) {
	var foo = elementPos(e);
	var y = window.pageYOffset, dy = window.innerHeight;
	if(foo.y < y+10 || foo.y+foo.dy > y+dy-10) {
		window.scrollTo(window.pageXOffset,Math.max(0,Math.round(foo.y-0.5*dy)));
	}	
}

function myfocus(e) {
	checkpos(e);
	e.focus();
}

var savedata;
var cache = [];
var count = 0;
var clear = [];
var divcount = 0;
var divorder = [0];

var w = new Worker('myworker.js');
var plotcount = 0;

function plotit(plotid,x) {
	var k;
    try {
		if(typeof x.s === "object") $('#'+plotid).css(x.s);
		$.plot($("#"+plotid), x.p, x.o);
    } catch(e) {
		var _foo = e.toString();
       	if(typeof e.stack !== "undefined" && typeof e.stack.toString !== "undefined") {
       		_foo += "\n\n"+e.stack.toString();
       	}
       	_foo = _foo.replace(/&/g,'&amp;').replace(/>/g,'&gt;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
       	$('#'+plotid).after(_foo);
    	$('#'+plotid).remove();
    }
}

var savereq = false;
function saveit() {
	if(!savereq) {
		savereq = true;
		setTimeout(function () {
			savereq = false;
			localStorage.savedata = JSON.stringify(savedata);
		},1000);
	}
}

function outputChanged(k,o) {
	var i = _indexOf(divorder,k);
	savedata.outputs[i].push(o);
	saveit();
}

w.onmessage = function(ev) {
	var x = JSON.parse(ev.data);
	var y = $('#out_'+x.k.toString())[0];
	if(clear[x.k]) { y.innerHTML = ''; savedata.outputs[_indexOf(divorder,x.k)] = []; }
	if(typeof x.p !== "undefined") {
		var plotid = "plot_"+plotcount.toString();
		plotcount++;
		y.innerHTML += '<div class="plot" id="'+plotid+'"></div>';
		(function () { 
			setTimeout(function () { 
				plotit(plotid,x); 
				setTimeout(function () { 
					outputChanged(x.k,x); 
				},0); 
			},0); 
		}());
		clear[x.k] = false;
		return;
	} 
	else { 
		y.innerHTML += x.o;
		(function () {
			setTimeout(function() { 
				outputChanged(x.k,x.o); },0) 
			}());
		clear[x.k] = false;
	}
	if(y.innerHTML === '') { y.innerHTML = ' '; clear[x.k] = true; }
}
function mkdiv(i) {
	divcount++;
	var foo = _indexOf(divorder,i);
	divorder.splice(foo+1,0,divcount);
	savedata.inputs.splice(foo+1,0,'');
	savedata.outputs.splice(foo+1,0,[]);
	$('#master_'+i.toString()).after(
	    '<div id="master_'+divcount.toString()+'" class="master">'+
	    '<div class="input">'+
        '<div class="inout" style="position: absolute; left: -30px; top: 2px;">'+
        'IN>'+
        '</div>'+
        '<a href="#" onclick="workshop.rmdiv('+divcount.toString()+')" class="button" style="position: absolute; right: -15px; top: 0px;">&#x2716;</a>'+
        '<textarea rows=1 class="in0" spellcheck="false" id="text_'+divcount.toString()+'" onkeydown="workshop.mykeydown(event,'+divcount.toString()+');"></textarea>'+
        '</div>'+
        '<div class="output" id="output_'+divcount.toString()+'">'+
        '<div class="inout" style="position: absolute; left: -30px; top: 2px;">'+
        'OUT>'+
        '</div>'+
        '<a href="#" onclick="workshop.mkdiv('+divcount.toString()+');" class="button" style="position: absolute; right: -15px; bottom: -10px;">&#x21A9;</a>'+
        '<div class="out" id="out_'+divcount.toString()+'"> </div>'+
        '</div></div>'
    );
}
function rmdiv(i) {
	var foo = _indexOf(divorder,i);
	divorder.splice(foo,1);
	$('#master_'+i.toString()).remove();
	savedata.inputs.splice(foo,1);
	savedata.outputs.splice(foo,1);
}

function go(k) {
	var input = $('#text_'+k.toString())[0];
    var n = _indexOf(divorder,k);
    var foo = divorder[n+1];
    if(typeof foo === "number") {
       	myfocus($('#text_'+foo.toString())[0]);
    } else {
    	mkdiv(k);
    	foo = divorder[n+1];
    }
    input.className = "in1";
    cache[k] = input.value;
	myfocus($('#text_'+foo.toString())[0]);
	clear[k] = true;
	$('#out_'+k.toString())[0].innerHTML = "<img src=\"resources/wait16.gif\">";
    var runit = function() { w.postMessage(JSON.stringify({k:k,n:n,e:input.value})); }
	setTimeout(runit,0);
}

function inputChanged(k){
	var i = _indexOf(divorder,k);
	var input = $('#text_'+k.toString())[0];
	if(input.value === cache[k]) input.className = "in1";
	else { input.className = "in0"; cache[k] = null; }
	savedata.inputs[i] = input.value;
	saveit();
}

var _foo;
var rc = 0;
function restore2(foo) {
    if(foo) _foo = foo;
    rc++;
    if(rc<2) return;
    foo = _foo;
	savedata = { inputs: [], outputs: [], scripts: foo.scripts };
	var baz = 'Version: <tt>'+foo.scripts[0]+'</tt>';
	if(_indexOf(foo.scripts,workshop.updateVersion)<0) {
	    baz = baz + ' (Update to <tt><a href="javascript: workshop.update();">'+workshop.updateVersion+'</a></tt>)';
	}
	$('#divupdate')[0].innerHTML = baz;
	if(foo.inputs.length === 0) { mkdiv(0); return; }
	var input,output,i,j,f0;
	for(i=1;i<foo.inputs.length;i++) {
		mkdiv(i-1);
		input = $('#text_'+i.toString())[0];
		input.value = foo.inputs[i];
		f0 = (function(in0) { return function() { resize(in0); }; }(input));
		setTimeout(f0,0);
		output = $('#out_'+i.toString())[0];
		output.innerHTML = '';
		if(typeof foo.outputs[i] === "undefined") { continue; }
		for(j=0;j<foo.outputs[i].length;j++) {
			if(typeof foo.outputs[i][j] === "string") {
				output.innerHTML += foo.outputs[i][j];
			} else {
				(function(i,j) {
					var plotid = "plot_"+plotcount.toString();
					plotcount++;
					output.innerHTML += '<div class="plot" id="'+plotid+'"></div>';
					setTimeout(function () { 
						plotit(plotid,{k:i, o:foo.outputs[i][j].o, p:foo.outputs[i][j].p});
					},0);
				}(i,j));
			}
		}
		if(output.innerHTML === '') { output.innerHTML = ' '; clear[i] = true; }
	}
	savedata = foo;
	workshop.savedata = savedata;
}

function restore(savedata) {
    w.postMessage(JSON.stringify({imports:savedata.scripts}));
	restore2(savedata);
}

function preload(savedata) {
    var k;
    var client;

    for(k=0;k<savedata.scripts.length;k++) {
        client = new XMLHttpRequest();
        client.open("GET", savedata.scripts[k]);
        client.send();
    }
}

function mykeydown(e,i) {
	var input = $('#text_'+i.toString())[0];
	checkpos(input);
	resize(input);
	setTimeout(function () { resize(input); },0);
	var e = window.event?window.event:e;
    if(e.keyCode === 13 && e.shiftKey === false) {
		setTimeout(function () { inputChanged(i); go(i); },0);
		if(window.event) e.returnValue = false;
		else e.preventDefault();
	} else {
		setTimeout(function () { inputChanged(i); },0)
	};
}
function reset() {
	localStorage.clear();
	window.location.replace('workshop.php');
}
function update() {
	savedata.scripts = [workshop.updateVersion];
	localStorage.savedata = JSON.stringify(savedata);
	window.location.replace('workshop.php');
}

function submit() {
	var f = document.myform;
	var foo = JSON.stringify(savedata);
	var digest = Crypto.SHA256(foo, { asBytes: true });
	var s = document.myform.savedata;
	s.value = foo;
	digest = Crypto.util.bytesToHex(digest);
	f.action = "workshop.php?link="+digest;
	f.submit();
}

return {
	    print:print,
	    mkdiv:mkdiv,
	    rmdiv:rmdiv,
	    mykeydown:mykeydown,
	    w:w,
	    savedata:savedata,
	    restore:restore,
	    restore2:restore2,
	    reset:reset,
	    resize:resize,
	    submit:submit,
	    update:update,
	    preload:preload
	    }
}());
</script>

<br><br><br>


<script>
<?php
$incs = NULL;

if(isset($_GET['link'])) {
	$f = $_GET['link'];
	if(!preg_match('/^[0-9a-fA-F]*$/',$f)) { exit; }
	$q = "select v from blobs where k = '".$f."'";
	$result = mysql_query($q) or die('Could not fetch script: ' . mysql_error());
	$s = mysql_fetch_row($result) or die ('Could not fetch field: ' . mysql_error());
	$restore = $s[0];
	$foo = json_decode($restore,true) or die("json error");
	$incs = $foo['scripts'];
	if(is_null($incs)) {
		$incs = array(1 => 'lib/numeric-1.2.6.js');
	}
	echo <<<EOT
workshop._restore = $restore;
EOT;
} else {
	echo <<<EOT
workshop._restore = ((typeof localStorage.savedata === "string")?
	                (JSON.parse(localStorage.savedata)):
	                {inputs: [], outputs: [], 
	                 scripts: ["lib/numeric-1.2.6.js"] });
EOT;
}
?>

workshop.version = "1.2.6";
workshop.updateVersion = "lib/numeric-1.2.6.js";
workshop.preload(workshop._restore);
</script>

<script>
workshop.restore(workshop._restore);
</script>


