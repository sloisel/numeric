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

WORKSHOPHTML

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
		$incs = array(1 => 'lib/numeric-VERSIONSTRING.js');
	}
	echo <<<EOT
workshop._restore = $restore;
EOT;
} else {
	echo <<<EOT
workshop._restore = ((typeof localStorage.savedata === "string")?
	                (JSON.parse(localStorage.savedata)):
	                {inputs: [], outputs: [], 
	                 scripts: ["lib/numeric-VERSIONSTRING.js"] });
EOT;
}
?>

workshop.version = "VERSIONSTRING";
workshop.updateVersion = "lib/numeric-VERSIONSTRING.js";
workshop.preload(workshop._restore);
</script>

<script>
workshop.restore(workshop._restore);
</script>


