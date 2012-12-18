<html>
<head>
<meta name="google-site-verification" content="wRToy1IFW5JCMZF58VL7Y4Bo0-twB2EGpk1pmMrKsk8" />
<link rel="SHORTCUT ICON" href="favicon.ico">
<link href='http://fonts.googleapis.com/css?family=Lato' rel='stylesheet' type='text/css'>
<link rel="stylesheet" type="text/css" href="resources/style.css">
<title>Numeric Javascript</title>
<body>
<?php
require("resources/header.html"); 
define('WP_USE_THEMES', false);
require('../wordpress/wp-blog-header.php');
?>
<div style="margin-left: 100px; margin-right: 100px;">
<h1>Numerical analysis in Javascript</h1>
The <a href="http://www.numericjs.com/">Numeric Javascript</a> library allows you to perform
sophisticated numerical computations in pure javascript in the browser and elsewhere.<br><br>

<b>From the <a href="/wordpress/">blog</a>...</b>
<ul style="margin-top:0;">
<?php query_posts('showposts=3'); ?>
<?php while (have_posts()) : the_post(); ?>
<li><a href="<?php the_permalink() ?>" rel="bookmark" title="Permanent Link to <?php the_title(); ?>"><?php the_title(); ?></a> <small>(<?php the_time('F j, Y'); ?>)</small>
<?php endwhile;?>
</ul>
<a href="/wordpress/">More from the blog...</a>

<?php
if(file_exists('../wordpress/leaderboard.html')) require('../wordpress/leaderboard.html');
?>
<div style="float:right; text-align:center; margin-top:15px;">
<a href="workshop.php"><img src="resources/workshop.png" width=400><br>
Numeric Workshop</a>
</div>


<h1>Examples</h1>

Each of these examples runs in the <a href="workshop.php">Workshop</a>.
<ul>
    <li> <a href="workshop.php?link=bf9eb195e289cf58fe226b11ff9e70d3360865f1aa1565d23990ad12673fd7de">Linear algebra</a>
    <li> <a href="workshop.php?link=ca14363bad73fd337ba4e8ba6ff48b282894946396d845450e4d885cb04701c9">Complex numbers</a>
    <li> <a href="workshop.php?link=f33555dc9b8f8232b567ebd6cb367f8b72e870392cc579563b6c8bd2b16015d8">Splines</a>
    <li> <a href="workshop.php?link=fdd38094da018f6071cb2d51d47c7fb3de869cb5dd0b4f3b677b480ce7ffbd31">ODE solver</a>
    <li> <a href="workshop.php?link=4d89edb9e548da48eaf09578f5b3a3aa215b18e3933141ff643b9b0e4865d27f">Unconstrained optimization</a>
    <li> <a href="workshop.php?link=10db8ddaa8499c109058efe8aabd7b418e62b2ec5e0cfa368b9832f83b5b4166">PDE and sparse linear algebra</a>
</ul>


<h1>Workshop</h1>

The <a href="workshop.php">Workshop</a> is a Javascript console that can be used to experiment with
Numeric Javascript by writing a "Worksheet" of Javascript commands. This Worksheet can be saved and
shared simply by sharing a permanent link to the Worksheet.<br><br>

The Workshop also includes plotting facilities using the
<a href="http://code.google.com/p/flot/">Flot</a> plotting library.


<h1>Performance</h1>

Although Javascript does not reach the same performance as native programs, the Numeric Javascript
library is carefully tuned to obtain the best possible performance for a Javascript program. You
can compare the performance of Numeric, <a href="http://sylvester.jcoglan.com/">Sylvester</a> and
<a href="http://code.google.com/closure/">Google Closure</a>'s 
<a href="http://code.google.com/p/closure-library/source/browse/trunk/closure/goog/math/matrix.js">Matrix</a>
object using our <a href="benchmark.html">Benchmark</a>.


<h1>Correctness</h1>

Numeric Javascript contains a set of unit tests that are automatically run in several browsers. You can
view the <a href="report.html">report</a> that is automatically generated.


<h1>Community</h1>

Join the discussion on our <a href="http://groups.google.com/group/numericjs">Google Group</a>.
We have a public <a href="https://github.com/sloisel/numeric/">github</a> repository.


<h1>About the Author</h1>

I am <a href="http://www.ma.hw.ac.uk/~loisel/">S&eacute;bastien Loisel</a>.
You can use the following bibtex entry:

<pre>
@misc{
numericjs,
Author = {S{\'e}bastien Loisel},
Title = {Numeric Javascript},
howpublished = {\url{http://www.numericjs.com/}} }
</pre>

<br><br><br>
</div>
