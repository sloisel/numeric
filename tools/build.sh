#!/bin/bash -e
home=`dirname $0`
cd $home
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
cat > ../resources/header.html <<XXXXX
<a href="https://github.com/sloisel/numeric"><img style="position: absolute; top: 0; right: 0; border: 0;" src="/numeric/resources/forkme.png" alt="Fork me on GitHub"></a>
<div class="nav" style="position: relative;">
<img src="/resources/paperplane-small.png" style="position: absolute; top: 0; left: 0;">
<div style="margin-left:200px;">
<b>Numeric Javascript</b>
<ul class="nav">
    <li class="nav"><a id = "linkhome" class="nav" href="index.php">HOME</a></li>
    <li class="nav"><a id = "linkworkshop" class="nav" href="workshop.php">WORKSHOP</a></li>
    <li class="nav"><a id = "linkbenchmarks" class="nav" href="benchmark.html">BENCHMARKS</a></li>
    <li class="nav"><a id = "linkdoc" class="nav" href="documentation.html">DOCUMENTATION</a></li>
    <li class="nav"><a id = "linkblog" class="nav" href="/wordpress/">BLOG</a></li>
</ul>
<ul class="nav">
    <li class="sep">DOWNLOADS:</li>
  <li class="nav"><a id = "linklib" class="dl" href="lib/numeric-$ver.js">numeric-$ver.js</a></li>
  <li class="nav"><a id = "linklibmin" class="dl" href="lib/numeric-$ver.min.js">numeric-$ver.min.js</a></li>
</ul>
</div>
</div>
<div style="clear:both; height:30px;"></div>
XXXXX
cp ../src/documentation.html ..
rm -f ../workshop.php
sed -e '/WORKSHOPHTML/r workshop.html' -e 's/WORKSHOPHTML//' -e "s/VERSIONSTRING/$ver/" workshop_in.php > ../workshop.php
cd ..
runjs=`which d8 || which jsdb || which node`
echo Using $runjs
$runjs ./tools/unit2.js &
echo $! > tools/nodepid.log

cd lib
rm -rf numeric-$ver
mkdir numeric-$ver
cp numeric-$ver.js numeric-$ver
cp numeric-$ver.min.js numeric-$ver
cat > numeric-$ver/package.json <<EOF
{
"name": "numeric",
"version": "$ver",
"author": "Sébastien Loisel",
"description": "Numerical analysis in javascript",
"keywords": [
"numeric",
"analysis",
"math"
],
"homepage": "http://numericjs.com",
"main": "numeric-$ver.js",
"repository": {
"type": "git",
"url": "https://github.com/sloisel/numeric.git"
}
}
EOF
cp ../README.md numeric-$ver
rm -f numeric-$ver.tar.gz
tar cfz numeric-$ver.tar.gz numeric-$ver
rm -rf numeric-$ver
cd ../tools
wait
rm -f buildpid.log
rm -f nodepid.log
echo "Build complete"
