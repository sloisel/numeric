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
	$result = mysql_query($q) or die('Could save script: ' . mysql_error());
	header('Location: index.php?link=' . $_GET['link']);
	exit;
}

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
		$incs = array(1 => '/scripts/numeric.js?key=59a7b9cb649f989ca3d34a409dbf42f82afe51e0071a8f92b0246f0ddcb849aa');
	}
	$footer = <<<EOT
<script>
(function () {
	var foo = $restore;
	workshop.download(foo);
}());
</script>
EOT;
} else {
	$incs = array(1 => '/scripts/numeric.js?key=59a7b9cb649f989ca3d34a409dbf42f82afe51e0071a8f92b0246f0ddcb849aa');
	$footer = ""; 
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
<style>

div.notsaved {
	font-weight:bold;
	text-align:center;
	color: #ff0000;
}

td.button {
	font-size: 12px;
	font-weight: bold;
	vertical-align: top;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -o-user-select: none;
    user-select: none;
}
td.button2 {
	font-size: 10px;
	font-weight: bold;
	vertical-align: bottom;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -o-user-select: none;
    user-select: none;
}
td.menu {
	font-size: 10px;
	font-weight: bold;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -o-user-select: none;
    user-select: none;
}
textarea.input {
        resize:none;
        overflow:hidden;
        font-family:monospace;
        font-size:14px;
        margin-top:0px;
        margin-left:1px;
        margin-bottom:1px;
        padding:1px;
        border:2px solid #0000ff;
        background-color: #f0f0ff;
        width: 100%;
		box-sizing: border-box;
		-webkit-box-sizing:border-box;
		-moz-box-sizing: border-box;
		-ms-box-sizing: border-box;
}
textarea.runned {
        resize:none;
        overflow:hidden;
        font-family:monospace;
        font-size:14px;
        margin-top:0px;
        margin-left:1px;
        margin-bottom:1px;
        padding:1px;
        border:2px solid #0000ff;
        width: 100%;
		box-sizing: border-box;
		-webkit-box-sizing:border-box;
		-moz-box-sizing: border-box;
		-ms-box-sizing: border-box;
}
td.interactions { width:100%; }
tr.interactions { width:100%; }
td.spacer { width:5px; }
table.inner { width:100%; }
tr:inner { width:100%; }
td:inner { width:100%; }

table.interactions { width:100%; }

body {
	font-family: sans-serif;
	font-size: 14px;
	margin-top: 10px;
	margin-left: 20px;
	margin-right: 20px;
	margin-bottom: 50px;
}

input.unsaved {
	background-color: #ff0000;
}

input.saved {
	background-color: #ffffff;
}
select.loader {
	width:200;
}
td.input {
	font-family: monospace;
	font-size: 12px;
	vertical-align: top;
	width: 100%;
}
td.output {
	font-family: monospace;
	font-size: 14px;
	color: #000000;
	vertical-align: top;
	white-space: pre-wrap;
	width: 100%;
	padding-left:5px;
}
td.caret {
	padding-top: 8px;
	font-family: sans-serif;
	color: #0000ff;
	vertical-align:top;
	text-align: right;
	font-size: 8px;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -o-user-select: none;
    user-select: none;
}
td.out {
	padding-top: 4px;
	padding-bottom: 4px;
	font-family: sans-serif;
	color: #000000;
	vertical-align:top;
	text-align: right;
	font-size: 8px;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -o-user-select: none;
    user-select: none;
}
a.button:link { text-decoration: none; color: #0000ff; }
a.button:visited { text-decoration: none; color: #0000ff; }
a.button:active { text-decoration: none; color: #0000ff; }
a.button:hover { text-decoration: none; color: #ff0000; }
a.menu:link { text-decoration: none; color: #0000ff; text-decoration: underline; }
a.menu:visited { text-decoration: none; color: #0000ff; text-decoration: underline; }
a.menu:active { text-decoration: none; color: #0000ff; text-decoration: underline; }
a.menu:hover { text-decoration: none; color: #ff0000; }
</style>
<title>Numeric Javascript Workshop</title>
<?php
foreach($incs as $i) {
   echo '<script src="' . $i . '"></script>';
}
?>
<script src="tools/Crypto-JS v2.4.0/crypto/crypto-min.js"></script>
<script src="tools/Crypto-JS v2.4.0/crypto-sha256/crypto-sha256.js"></script>
<script src="tools/json2.js"></script>
<script src="tools/date.js"></script>
<body itemscope itemtype="http://schema.org/WebPage">
<table><tr valign="center">
	<td><img src="resources/paperplane-small.png"></td>
	<td>
		<font size=+2><b>Numeric Javascript Workshop.</b></font> <font color="#b0b0b0">(Beta)</font><br>
		<table>
			<tr>
	 			<td>
	 				<input type="text" size=50 value="Untitled" id = "title" onchange="workshop.settitle();" class="unsaved">
					<select id = "loader" onchange="workshop.loadit();" class="loader"><option>Load...</select>
				</td>
			</tr>
			<tr>
				<td class="menu">
<!--					<a href="#" onclick="workshop.runall();" class="menu">[RUN]</a>-->
					<form name="myform" action="index.php" method="post">
					<a href="/" class="menu">[NEW]</a>
					<a href="#" onclick="workshop.del();" class="menu">[DELETE FILE]</a>
<!--					<a href="about.html" class="menu">[ABOUT]</a>-->
					<a href="javascript: workshop.submit();" class="menu" id="permalink">[PERMALINK]</a>
					<input type="hidden" name="savedata" value="">
					</form>
				</td>
			</tr>
			<tr>
				<td>
					<b>
					Try the <a href="demo.html" itemprop="breadcrumb" id="demolink">Demo</a>,
					or you can read more <a href="about.html" itemprop="breadcrumb" id="aboutlink">about Numeric Javascript</a>.					
					</b><br>
					<a href="lib/numeric.js" itemprop="breadcrumb" id="downloadlink">Download numeric.js</a> |
				 	<a href="lib/numeric-min.js" itemprop="breadcrumb" id="downloadminlink">numeric-min.js</a> | 
				 	<a href="https://github.com/sloisel/numeric/" itemprop="breadcrumb" id="githublink">github repo</a> |
				 	<a href="doc/symbols/numeric.html" itemprop="breadcrumb" id="doclink">Documentation</a><br>
					Author: <a href="http://www.ma.hw.ac.uk/~loisel/" itemprop="breadcrumb" id="authorlink">S&eacute;bastien Loisel</a>.
					Copyright 2011. <a href="license.txt" itemprop="breadcrumb" id="licenselink">MIT License</a>
				</td>
			</tr>
		</table>
	</td>
<!--	<td valign="top">Includes:<br>
		<a href="#" class="button">&#x2716;</a> numeric.js
</td>-->
</tr></table>


<table id = "interactions" class="interactions">
<tr>
	<td></td>
	<td></td>
	<td class = "button2"><a href="#" onclick="workshop.mkinput(0);" class="button">&#x21A9;</a></td>	
</tr>
</table>

<div id="notsaved" class="notsaved"></div>
<script>
"use strict";
if(!Array.indexOf){
  Array.prototype.indexOf = function(obj){
   for(var i=0; i<this.length; i++){
    if(this[i]==obj){
     return i;
    }
   }
   return -1;
  }
}


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

var interactions = document.getElementById("interactions");
var title = document.getElementById("title");
var loader = document.getElementById("loader");
var notsaved = document.getElementById("notsaved");

function resize(input) {
	if(input.scrollHeight > input.clientHeight) {
		input.style.height = (input.scrollHeight+10)+"px";
	}
}

var inputs = [];
var outputs = [];
var order = [];
var saver = { console:[] };
var savename = null;
var saves = [];
var k;
function save() {
	if(savename === null) { return; }
    localStorage.setItem(savename,JSON.stringify(saver));	
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

var current = -1;
var clear = true;
function print(html) {
	if(current<0) { return; }
	if(typeof html !== "undefined") {
		clear = false;
		outputs[current].innerHTML = html;
	} else { if(clear) { return ""; } }
	return outputs[current].innerHTML;
}
var w = new Worker('myworker.js');
w.onmessage = function(ev) { alert(ev.data); }
w.postMessage(JSON.stringify({imports:[<?php
$foo = 0;
foreach($incs as $i) {
   if($foo != 0) { echo ","; }
   $foo = 1;
   echo '"'.$i.'"';
}
?>]}));
w.onmessage = function(ev) {
	var x = JSON.parse(ev.data);
	outputs[x.k].innerHTML = x.o;
	saver.console[x.n].output = x.o;
	save();
}
function go(k) {
	var input = inputs[k];
    var n = order.indexOf(k);
    var foo = order[n+1];
    if(typeof foo === "number") {
       	myfocus(inputs[foo]);
    } else {
    	foo = order.length;
    	mkinput(foo);
    	foo = order[n+1];
    }
    saver.console[n] = {};
    saver.console[n].input = input.value;
    save();
    input.className = "runned";
	myfocus(inputs[order[n+1]]);
	clear = true;
	current = k;
	outputs[k].innerHTML = "<img src=\"resources/wait16.gif\">";
	var f1;
    var runit = function() { w.postMessage(JSON.stringify({k:k,n:n,e:input.value})); }
	setTimeout(runit,0);
}

function keydown(e,k) {
	var input = inputs[k];
	checkpos(input);
	resize(input);
	setTimeout(function () { resize(input); },0);
	var e = window.event?window.event:e;
    if(e.keyCode === 13 && e.shiftKey === false) {
		setTimeout(function () { go(k); },0);
		if(window.event) e.returnValue = false;
		else e.preventDefault();
	}
}

function titlecolor() {
	if(savename === null) { title.className = "unsaved"; notsaved.innerHTML = "Choose a title to save this file to your browser's local storage."; }
	else { title.className = "saved"; title.value = savename; notsaved.innerHTML = ""; }
}

function mksel() {
	var n = loader.options.length;
	var i;
	for(i=n-1;i>=0;i--) { loader.remove(i); }
	saves = [];
	var option = document.createElement("option");
	option.text = "Load...";
	if(_retarded) loader.add(option);
	else loader.add(option,null);
	for(k=0;k<localStorage.length;k++) { 
		saves[k] = localStorage.key(k);
		option = document.createElement("option");
		option.text = saves[k];
		if(_retarded) loader.add(option);
		else loader.add(option,null);
	}
}
mksel();

function settitle(e) {
	var foo;
	if(title.value !== savename) {
		foo = saves.indexOf(title.value);
		if(foo >= 0) { savename = null; titlecolor(); return; }
	}
	if(savename !== null) { localStorage.removeItem(savename); }
	savename = title.value;
	save();
	titlecolor();
	mksel();
}

var count = 0;
function mkinput(i) {
	var row1 = interactions.insertRow(2*i+1);
	row1.className = "interactions";
	var cell2 = row1.insertCell(0);
	var cell3 = row1.insertCell(1);
	var cell1 = row1.insertCell(2);
	var row2 = interactions.insertRow(2*i+2);
	var cell5 = row2.insertCell(0);
	var cell6 = row2.insertCell(1);
	var cell4 = row2.insertCell(2);

	cell1.className = "button";
	cell4.className = "button2";
	
	cell2.className = "caret";
	cell2.innerHTML = "IN&#x276F;";
	cell5.className = "out";
	cell5.innerHTML = "OUT&#x276F;";
	
	cell3.className = "input";
    var ti = document.createElement("textarea");
    ti.className = "input";
    ti.rows = 1;
    ti.spellcheck = false;
    ti.id = "in"+count;
    cell3.appendChild(ti);

	cell6.className = "output";
	cell6.id = "out"+count;
    count++;
	
    var n = inputs.length;
    inputs[n] = ti;
    outputs[n] = cell6;
    order.splice(i,0,n);
    saver.console.splice(i,0,n);
    saver.console[i] = {input:"", output:""};
    
    var aadder = document.createElement("a");
    aadder.href = '#';
    aadder.className = "button";
    aadder.innerHTML = "&#x21A9;";
    cell4.appendChild(aadder);

    var acloser = document.createElement("a");
    acloser.href = '#';
    acloser.innerHTML = "&#x2716;";
    acloser.className = "button";
    cell1.appendChild(acloser);


    ti.onkeydown = function(e) { return keydown(e,n); }
    acloser.onclick = function(e) { return clicked(e,n); }
    aadder.onclick = function(e) { mkinput(order.indexOf(n)+1); }
    myfocus(ti);

	save();
}

function clicked(e,n) {
	if(order.length <= 1) { return; }
    var n = order.indexOf(n);
    interactions.deleteRow(2*n+1);
    interactions.deleteRow(2*n+1);
    delete inputs[order[n]];
    delete outputs[order[n]];
    saver.console.splice(n,1);
    order.splice(n,1);
    save();
}

function restore() {
	var foo,bar;
	if(savename !== null) {
		foo = localStorage.getItem(savename);
		if(foo === null) { return; }
		bar = savename;
		reset();
		savename = bar;
		title.value = bar;
		var i;
		foo = JSON.parse(foo);
		var bar = foo.console;
		for(i=0;i<bar.length;i++) { mkinput(i); }
		for(i=0;i<bar.length;i++) {
			inputs[i].value = bar[i].input;
			resize(inputs[i]);
			outputs[i].innerHTML = bar[i].output;
		}
		saver = foo;
		save();
		return;
	}
}

function download(saved) {
	reset();
	var data = saved.console;
	var i;
	for(i=0;i<data.length;i++) { mkinput(i); }
	for(i=0;i<data.length;i++) {
		inputs[i].value = data[i].input;
		resize(inputs[i]);
		outputs[i].innerHTML = data[i].output;
	}
	saver = saved;
	var foo = JSON.stringify(saver);
	for(i=0;i<localStorage.length;i++) {
		var k = localStorage.key(i);
		if(localStorage.getItem(k) === foo) {
			savename = k;
			title.value = k;
			titlecolor();
			return;
		}
	}
}

function loadit(e) {
	var foo = loader.selectedIndex;
	if(foo<=0) { return; }
	var bar = loader.options[foo].text;
	savename = bar;
	restore();
	titlecolor();
	loader.selectedIndex = 0;
}

function reset() {
	var i,n=order.length;
	for(i=0;i<n;i++) { interactions.deleteRow(1); interactions.deleteRow(1); }
	order = [];
	inputs = [];
	outputs = [];
	saver = {console:[]};
	savename = null;
	title.value = "Untitled";
	titlecolor();
}

function del() {
	if(savename === null) { return; }
	localStorage.removeItem(savename);
	savename = null; 
	title.value = "Untitled";
	mksel();
	titlecolor();
}

function submit() {
	var f = document.myform;
	var foo = JSON.stringify(saver);
	var digest = Crypto.SHA256(foo, { asBytes: true });
	var s = document.myform.savedata;
	s.value = foo;
	digest = Crypto.util.bytesToHex(digest);
	f.action = "index.php?link="+digest;
	f.submit();
}

function runone(i,n) { if(i<n-1) { go(order[i]); setTimeout(function () { runone(i+1,n); } ); } }
// This is a workaround for a google chrome bug
function runall() {  runone(0,order.length); }
return {restore:restore,
	    reset:reset,
	    clicked:clicked,
	    mkinput:mkinput,
	    runall:runall,
	    settitle:settitle,
	    loadit:loadit,
	    del:del,
	    print:print,
	    submit:submit,
	    download:download,
	    w:w
	    }
}());
workshop.reset();
workshop.mkinput(0);
</script>



<?php
echo $footer;
?>

<script type="text/javascript">

workshop.version = "2011-10-23_17-56-19";

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-23862738-2']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>

