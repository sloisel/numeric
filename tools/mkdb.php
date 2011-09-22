<?php
$n = file_get_contents('../lib/numeric.js') or die('Could not get file');
$ne = mysql_real_escape_string($n);
$h = hash('sha256',$n) or die('Could not get hash');
$link = mysql_connect() or die('Could not connect to db: ' . mysql_error());
mysql_select_db('sloisel_numeric') or die('Could not select db: ' . mysql_error());
mysql_query('create table if not exists blobs (k char(64) primary key, v longtext)') or die('Could not create table: ' . mysql_error());
$q = "insert ignore into blobs value ('$h','$ne')";
mysql_query($q) or die('Could not insert value into db: ' . mysql_error());
?>
