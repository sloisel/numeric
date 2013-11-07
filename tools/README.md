The /tools directory
====================

This directory contains build/test scripts for numeric.js as well as 
js libraries needed by the Workshop.

Building
========

Run the /tools/build.sh script to build and test numeric.js and numeric-min.js. Please do this
before sending me patches and make sure that all the tests pass. The tests are run in node or d8 or
jsdb, whichever is available. The same tests can be run in Selenium -- that's the tools/selenium_tests.py
script.

Hosting your own Javascript Workshop
====================================

The rest of this README explains how to host Javascript Workshop. This is mostly so I can reproduce
it later if I need to rebuild the server, but you could in principle clone Javascript Workshop
to your own web site.

Setting up a Javascript Workshop server
---------------------------------------

I assume you have two machines. The dev machine is where you do your development, and
the server is where it all gets deployed when ready.

1. Set up Apache, MySQL and PHP. I denote the webroot by $webroot. For example, your
webroot might be $webroot=/var/www/html. I will call this "the server".

2. On the server, set up a file $webroot/.htaccess that will redirect traffic
appropriately. This is what I have:
RewriteEngine On
RewriteRule ^staging/(.*)$     staging/$1 [L]
RewriteRule ^numeric/(.*)$     numeric/$1 [L]
RewriteRule ^(.*)$             numeric/$1 [L]
Options +Includes
AddType text/html .html
AddHandler server-parsed .html

3. On your dev machine, edit tools/deploy/config.sh. I have:
user=ec2-user
server=numericjs.com
webroot='/var/www/html'

4. On your dev machine, run tools/deploy/stage.sh. This will run for a few minutes.
Your server should now have a staging version of the web site eg. at numericjs.com/staging

5. On your dev machine, run tools/deploy/test.sh. This will run the Selenium tests
in browsers. Right now there's some complicated thing in there to run the IE test on my
Mac (urgh). Check the results of the unit tests as appropriate on the web site (eg. at
numericjs.com/staging)

6. If all went well, use tools/deploy/deploy.sh to "flip the switch" and move the staging
web site to the live web site. The previous live web site will be deleted.

Dev machine as web server
-------------------------

You can also run a web server on the dev machine. Do the .htaccess as above and put your git tree in
$webroot/numeric. I don't use the tools/deploy scripts for this.
