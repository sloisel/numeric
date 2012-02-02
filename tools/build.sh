#!/bin/bash -e
if [ -f buildpid.log ]; then
	buildpid=`cat buildpid.log`
	kill -9 $buildpid || true
	rm -f buildpid.log
fi
echo $$ > buildpid.log
if [ -f nodepid.log ]; then
	nodepid=`cat nodepid.log`
	kill -9 $nodepid || true
	rm -f nodepid.log
fi
ver=`grep 'numeric.version.*=.*"' ../src/numeric.js | sed 's/numeric.version[ =]*"\([0-9.]*\)".*/\1/'`
echo "Version is $ver"
cat ../src/numeric.js ../src/seedrandom.js ../src/quadprog.js ../src/svd.js > ../lib/numeric-$ver.js
uglifyjs ../lib/numeric-$ver.js > ../lib/numeric-$ver.min.js
cat jquery-1.7.1.min.js jquery.flot.min.js 'Crypto-JS v2.4.0/crypto/crypto-min.js' 'Crypto-JS v2.4.0/crypto-sha256/crypto-sha256.js' json2.js > megalib.js
echo "" | cat closurelib.js sylvester.js - ../lib/numeric-$ver.min.js jquery-1.7.1.min.js jquery.flot.min.js  > benchlib.js
cp ../src/documentation.html ..
rm -f ../workshop.php
sed -e '/WORKSHOPHTML/r workshop.html' -e 's/WORKSHOPHTML//' -e "s/VERSIONSTRING/$ver/" workshop_in.php > ../workshop.php
cd ..
runjs=`which d8 || which jsdb`
echo Using $runjs
$runjs ./tools/unit2.js &
echo $! > tools/nodepid.log
cd tools
wait
rm -f buildpid.log
rm -f nodepid.log

