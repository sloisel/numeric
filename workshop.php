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

header('Expires: '.gmdate('D, d M Y H:i:s \G\M\T', time() + 86400));
?>

<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="description" content="Numerical analysis in javascript: library and console." />
<meta name="keywords" content="Javascript,HTML,simplex,matrix,vector,linear algebra" />
<meta name="author" content="Sébastien Loisel" />
<link rel="SHORTCUT ICON" href="favicon.ico">
<link rel="stylesheet" type="text/css" href="resources/style.css">
<title>Numeric Javascript: Workshop</title>
<!--[if lte IE 9]><script language="javascript" type="text/javascript" src="tools/excanvas.min.js"></script><![endif]-->
<script src="tools/jquery-1.7.1.min.js"></script>
<script src="tools/jquery.flot.min.js"></script>
<script src="tools/Crypto-JS v2.4.0/crypto/crypto-min.js"></script>
<script src="tools/Crypto-JS v2.4.0/crypto-sha256/crypto-sha256.js"></script>
<script src="tools/json2.js"></script>
<body onload="workshop.startup()">
<a href="https://github.com/sloisel/numeric"><img style="position: absolute; top: 0; right: 0; border: 0;" src="resources/forkme.png" alt="Fork me on GitHub"></a>
<table class="nav"><tr class="nav">
<td class="nav" style="width:150px;"><img src="resources/paperplane-small.png">
<td class="navmain">
<b>Numeric Javascript: Workshop</b>
<ul class="nav">
	<li class="nav"><a id = "linkhome" class="nav" href="index.html">HOME</a></li>
	<li class="nav"><a id = "linkworkshop" class="nav" href="workshop.php">WORKSHOP</a></li>
	<li class="nav"><a id = "linkbenchmarks" class="nav" href="benchmark.html">BENCHMARKS</a></li>
	<li class="nav"><a id = "linkdoc" class="nav" href="documentation.html">DOCUMENTATION</a></li>
</ul>
<ul class="nav">
	<li class="sep">DOWNLOADS:</li>
	<li class="nav"><a id = "linklib" class="dl" href="lib/numeric.js">numeric.js</a></li>
	<li class="nav"><a id = "linklibmin" class="dl" href="lib/numeric-min.js">numeric-min.js</a></li>
</ul>
</table>

<div style="display:none;border:5px solid green;margin:10px;" id="divupdate">
There is a more recent version of <tt>numeric.js</tt> than the one that is loaded in this worksheet.
<a href="javascript: workshop.update();">Click here</a> to reload the page with the latest version of the library.
</div>

<form name="myform" action="workshop.php" method="post">
<ul class="nav">
	<li class="nav"><a id = "NEW" class="nav" href="#" onclick="workshop.reset();">START OVER</a></li>
	<li class="nav"><a href="javascript: workshop.submit();" class="nav" id="permalink">MAKE PERMALINK</a>
</ul>
<input type="hidden" name="savedata" value="">
</form>

<div class="interactions">
	<div class="inner" id = "output_0">
		<div class="out"></div>
		<div class="output"></div>
		<div class="button2"><a href="#" onclick="workshop.mkdiv(0);" class="button">&#x21A9;</a></div>
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
	_onmessage = function(ev) {}
	_loaded = 0;
	window.Worker = function(f) {
		var worker = this;
		worker.onmessage = function(ev) {};
		worker.postMessage = function(ev) { _onmessage({data: ev}); };
		var scr = document.createElement('script');
		scr.src = f;
		scr.type = 'text/javascript';
		scr.onload = function() { _loaded = 1; }
		document.body.appendChild(scr);
		workerPostMessage = function(ev) { worker.onmessage({data: ev}); }
	}
	importScripts = function(z) {};
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
		console.log(numeric.prettyPrint(x));
		$.plot($("#"+plotid), x.p, x.o);
    } catch(e) {
		var _foo = numeric.prettyPrint(e);
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
		});
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
}
function mkdiv(i) {
	divcount++;
	var foo = _indexOf(divorder,i);
	divorder.splice(foo+1,0,divcount);
	savedata.inputs.splice(foo+1,0,'');
	savedata.outputs.splice(foo+1,0,[]);
	$('#output_'+i.toString()).after(
	'<div class="inner" id = "input_'+divcount.toString()+'">'+
		'<div class="caret">IN&#x276F;</div>'+
		'<div class="input"><textarea rows=1 id = "text_'+divcount.toString()+'" class="input" onkeydown="workshop.mykeydown(event,'+divcount.toString()+');"></textarea></div>'+
		'<div class="button"><a href="#" onclick="workshop.rmdiv('+divcount.toString()+')" class="button">&#x2716;</a></div>'+
	'</div>'+
	'<div class="inner" id = "output_'+divcount.toString()+'">'+
		'<div class="out">OUT&#x276F;</div>'+
		'<div id = "out_'+divcount.toString()+'" class="output"></div>'+
		'<div class="button2"><a href="#" onclick="workshop.mkdiv('+divcount.toString()+');" class="button">&#x21A9;</a></div>'+
	'</div>'
	);
}
function rmdiv(i) {
	var foo = _indexOf(divorder,i);
	divorder.splice(foo,1);
	$('#input_'+i.toString()).remove();
	$('#output_'+i.toString()).remove();
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
    input.className = "runned";
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
	if(input.value === cache[k]) input.className = "runned";
	else { input.className = "input"; cache[k] = null; }
	savedata.inputs[i] = input.value;
	saveit();
}

function restore2(foo) {
	savedata = { inputs: [], outputs: [], scripts: foo.scripts };
	if(_indexOf(foo.scripts,workshop.updateVersion)<0) {
		$("#divupdate").css({display: 'block'});
	}
	if(foo.inputs.length === 0) { mkdiv(0); return; }
	var input,output,i,j,f0;
	for(i=1;i<foo.inputs.length;i++) {
		mkdiv(i-1);
		input = $('#text_'+i.toString())[0];
		input.value = foo.inputs[i];
		f0 = (function(in0) { return function() { resize(in0); }; }(input));
		setTimeout(f0,0);
		output = $('#out_'+i.toString())[0];
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
	}
	savedata = foo;
	workshop.savedata = savedata;
}

function restore(savedata) {
	var count=0;
	var k;
	for(k=0;k<savedata.scripts.length;k++) {
		$.getScript(savedata.scripts[k],function() {
			count++;
			if(count === savedata.scripts.length) { restore2(savedata); }
		})
	w.postMessage(JSON.stringify({imports:savedata.scripts}));
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
	window.location.reload();
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
	    reset:reset,
	    resize:resize,
	    submit:submit,
	    update:update
	    }
}());
//workshop.reset();
//workshop.restore();
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
		$incs = array(1 => '/scripts/numeric.js?key=33ceef221424c3ff1c6a413f013fcb3e927b1dc3c3e68775f9657f56a6df93c9');
	}
	echo <<<EOT
workshop.startup = (function () {
	var _restore = $restore;
	workshop.restore(_restore);
});
EOT;
} else {
	echo <<<EOT
workshop.startup = (function () {
	var _restore = ((typeof localStorage.savedata === "string")?
	                (JSON.parse(localStorage.savedata)):
	                {inputs: [], outputs: [], 
	                 scripts: ["/scripts/numeric.js?key=33ceef221424c3ff1c6a413f013fcb3e927b1dc3c3e68775f9657f56a6df93c9"] });
	workshop.restore(_restore);
});
EOT;
}
?>

workshop.version = "noversion";
workshop.updateVersion = "/scripts/numeric.js?key=33ceef221424c3ff1c6a413f013fcb3e927b1dc3c3e68775f9657f56a6df93c9";

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-23862738-2']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>

