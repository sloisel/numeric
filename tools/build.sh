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
cat ../src/numeric.js ../src/seedrandom.js > ../lib/numeric.js
cp ../src/documentation.html ..
php mkdb.php noversion
cd ..
runjs=`which d8 || which jsdb`
echo Using $runjs
$runjs ./tools/unit2.js &
echo $! > tools/nodepid.log
cd tools
#java -jar closure-compiler/compiler.jar --compilation_level WHITESPACE_ONLY --js=../lib/numeric.js --js_output_file=../lib/numeric-min.js > ../log/closure-compiler.log 2>&1
./mkdoc.sh > ../log/jsdoc.log 2>&1
wait
rm -f buildpid.log
rm -f nodepid.log

