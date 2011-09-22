<?php

function con() {
    mysql_connect() or die('Could not connect: '.mysql_error);
    mysql_select_db('sloisel_numeric') or die('Could not select db: ' . mysql_error());
}

if(isset($_POST['savedata'])) {
	$data = $_POST['savedata'];
	if (get_magic_quotes_gpc())  
 		$data = stripslashes($data);
	json_decode($data) or die("json error");
	$f = hash('sha256',$data);
	if($f === "") { exit; }
	con();
	$d = mysql_real_escape_string($data);
	$q = "insert ignore into blobs value ('$f','$d')";
	$result = mysql_query($q) or die('Could save script: ' . mysql_error());
	header('Location: /numeric/index.php?link=' . $_GET['link']);
	exit;
}

$incs = NULL;
if(isset($_GET['link'])) {
	$f = $_GET['link'];
	if(!preg_match('/^[0-9a-fA-F]*$/',$f)) { exit; }
	con();
	$q = "select v from blobs where k = '".$f."'";
	$result = mysql_query($q) or die('Could not fetch script: ' . mysql_error());
	$s = mysql_fetch_row($result) or die ('Could not fetch field: ' . mysql_error());
	$restore = $s[0];
	$foo = json_decode($restore,true) or die("json error");
	$incs = $foo['scripts'];
	if(is_null($incs)) {
		$incs = array(1 => '/scripts/numeric.js?key=8daede8011a2fecdd1cc10a78e51b167004b33cd6c00f9453a674742a80a1ab1');
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
	$incs = array(1 => '/scripts/numeric.js?key=8daede8011a2fecdd1cc10a78e51b167004b33cd6c00f9453a674742a80a1ab1');
	$footer = ""; 
}
include('workshop.html');

echo $footer;
?>


