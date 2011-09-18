<?php
function mkpath($path) {
    if(@mkdir($path) or file_exists($path)) return true;
    return (mkpath(dirname($path)) and mkdir($path));
}


function gethash($z) {
	if(file_exists('/usr/bin/node')) { $node = '/usr/bin/node'; }
	else { $node = '~sl398/usr/bin/node'; }
	$out = null;
	$n = tempnam('/tmp','njw');
	$handle = fopen($n, "w");
	fwrite($handle, $z);
	fclose($handle);
	$foo = exec($node . ' ./tools/checkfile.js ' . $n);
	unlink($n);
	return $foo;
}
if(isset($_POST['savedata'])) {
	header('Location: workshop.php?link=' . $_GET['link']);
	$data = $_POST['savedata'];
	if (get_magic_quotes_gpc())  
 		$data = stripslashes($data);
	$f = gethash($data);
	if($f === "") { exit; }
	$p = ('../numericdb/' . substr($f,0,2) . '/' . substr($f,2,2) . '/' . substr($f,4,2) 
	       . '/' . substr($f,6,2) . '/' . substr($f,8,2));
	mkpath($p);
	$fh = fopen($p . '/' . $f, 'w') or die("<html><body>Can't open file");
	fwrite($fh, $data);
	fclose($fh);
	exit;
}

include('workshop.html');

if(isset($_GET['link'])) {
	$f = $_GET['link'];
	if(!preg_match('/^[0-9a-fA-F]*$/',$f)) { exit; }
	$p = ('../numericdb/' . substr($f,0,2) . '/' . substr($f,2,2) . '/' . substr($f,4,2) 
	       . '/' . substr($f,6,2) . '/' . substr($f,8,2) . '/' . $f);
	$restore = file_get_contents($p);
	$foo = <<<EOT
<script>
(function () {
	var foo = $restore;
	workshop.download(foo);
}());
</script>
EOT;
	echo($foo);
}
?>
