The /tools directory
====================

This directory contains build/test scripts for numeric.js as well as 
js libraries needed by the Workshop. I'm trying to keep things
documented -- I hope this file doesn't bitrot.

Hosting your own Javascript Workshop
====================================

You can host your own server that runs Javascript Workshop.  You will
need to set up MySQL, Apache and PHP and run either Linux or MacOS.

Setting up a Javascript Workshop server
---------------------------------------

To set up a server that runs the Javascript Workshop, proceed as
follows:

1. Set up Apache, MySQL and PHP. I use MacOS but Linux works too.  In
the rest of this, I denote the webroot by $webroot. For example, your
webroot might be $webroot=~/public_html

2. Set up a file $webroot/.htaccess that will redirect traffic
appropriately. This is what I have:
RewriteEngine On
RewriteRule ^staging/(.*)$     staging/$1 [L]
RewriteRule ^scripts/(.*)$     scripts/$1 [L]
RewriteRule ^numeric/(.*)$     numeric/$1 [L]
RewriteRule ^(.*)$             numeric/$1 [L]
The last rule ensures that, "by default", Apache reads from the
numeric subdirectory. Therefore, accessing any content will look
at the numeric subdirectory. The exception is that anything that
starts with staging/ or scripts/. In that case, it is looked
up in the staging/ or scripts/ subdirectory. This ensures that
you can deploy to staging/ and test before you really deploy
to numeric/.

3. Get the git tree into $webroot/numeric

4. Decompress $webroot/numeric/tools/scripts.tar.gz and move it to
$webroot/scripts

5. Run $webroot/numeric/tools/mkdb.php at the command-line.

Then, every time you make some changes to anything, run the mkdb.php
command again.

Deploying to a live server
--------------------------

There is a two-step procedure for deploying to a live server so that
the server hopefully never breaks. See the numeric/tools/deploy
discussion below.

Hacking numeric.js
==================

You can easily make small local modifications to numeric.js.  However,
to make bigger changes, to use the regression testing suite, to run
the Selenium tests, etc..., you will need a more complete development
environment.

Build dependencies
------------------

You will need standard Linux/MacOS tools such as python, php, bash,
etc... You also need to set up your machine to run Apache, MySQL and
PHP as above and make sure that it runs Javascript Workshop as
above. Furthermore, you will need to install the Selenium python
bindings. For me, it was sufficient to do sudo easy_install selenium
There is also some java stuff in the numeric/tools subdirectory
(e.g. jsdoc-toolkit). I also have an eclipse project that
automatically rebuilds the library every time I modify it and also
automatically runs the regression suite. (I actually use Aptana
Studio.) You will also need d8 (the developer console that comes
with Google v8).

Building
--------

I usually edit the files in the numeric/src directory. To produce the
library from those files, run the numeric/tools/build.sh script (or
cat the files together yourself but don't forget the numeric_header.js
and numeric_footer.js in the tools subdirectory). In addition to
performing this concatenation, the build.sh also runs a regression
testing suite and also builds the documentation usign jsdoc-toolkit.

Main scripts
------------

The numeric/tools subdirectory contains the following custom tools:

* numeric/tools/build.sh: 
Concatenates files and produces /lib/numeric.js, runs the unit tests
by running numeric/tools/unit3.js in d8, builds the documentation
by calling numeric/tools/mkdoc.sh. I set it up so that it is
automatically called by eclipse every time I modify a file.

Note that Eclipse has no qualms about calling build.sh while another
instance is still running. As a result, build.sh makes a small attempt
at killing a previous instance. If you trigger build.sh very rapidly 
(milliseconds) it is conceivable that this mechanism would fail to
catch it and then you would get multiple build.sh running at the same
time, which is not really a big deal.

Note: build.sh expects to be called with its current directory set
to numeric/tools.

Deployment scripts
------------------

To deploy to a live web site without downtime, I have a two-step
procedure. In this approach, the tree will be deployed to
$webroot/vXXX, where XXX is a time stamp. Then, the symlink
$webroot/staging -> $webroot/vXXX is created. Several tests are performed.
If all is well then the symlink $webroot/numeric -> $webroot/vXXX is
created, which deploys to the main web page.

* numeric/tools/deploy/stage.sh
This shell script makes a tarball of the current tree and uploads it
to the web site (as specified in numeric/tools/deploy/config.sh).
The new tarball is unpacked on the web server under $webroot/vXXX and
then creates the symlink $webroot/staging -> $webroot/vXXX. 
Subsequently, the test suites are run and the results are stored in
$webroot/report.html

* numeric/tools/deploy/deploy.sh
After running stage.sh, you normally check report.html and perhaps
manually check the staging/ folder on the web site. If all is good,
the deploy.sh will move this staging deployment to the main web site.
Assuming that we have the symlinks $webroot/numeric -> $webroot/vYYY
and $webroot/staging -> $webroot/vXXX, first the link $webroot/numeric
is deleted. Then, the symlink $webroot/numeric -> $webroot/vXXX is
created. Finally, the symlink $webroot/staging is deleted. Any directory
$webroot/v* which is no longer linked is deleted with rm -rf.

After juggling the symlinks, a quick Selenium test is performed to
ensure that the web site works properly.

Auxiliary scripts
-----------------

* numeric/tools/unit2.js:
It gets all the @example comments from /lib/numeric.js (also stuff in
<pre>). Each line that begins with "> " is a test and the next line(s)
is the expected output.  Then unit2.js executes each line and checks
the output, neglecting whitespace.

* numeric/tools/mkdoc.sh:
Calls jsdoc-toolkit.

* numeric/tools/mkdb.php:
Stores numeric/lib/numeric.js into the database so that it can be used
in workshop. Then, it produces numeric/index.php from
numeric/tools/index_in.php by making sure that the correct version of
numeric.js is used. The file workshop.html also gets included.

* numeric/tools/selenium_tests.py:
Runs all the unit tests in one or more browsers using Selenium.

* numeric/tools/selenium_links.py:
Checks that the links in index.php go somewhere reasonable.

* numeric/tools/make_demo.py:
Uses Selenium to load the index.php and put in the demo. Then,
it saves this demo using the permalink button. Finally, it downloads
the demo into demo.php.
