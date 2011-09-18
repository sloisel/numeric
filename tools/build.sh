#!/bin/bash
rm -f ../numeric*.zip
cat numeric_header.js ../src/*.js numeric_footer.js > ../lib/numeric.js
node ./unit2.js &
java -jar closure-compiler/compiler.jar --compilation_level WHITESPACE_ONLY --js=../lib/numeric.js --js_output_file=../lib/numeric-min.js > ../log/closure-compiler.log 2>&1
./mkdoc.sh > ../log/jsdoc.log 2>&1
wait
cd ../..
zip -r numeric-1.0.zip numeric > numeric-zip.log 2>&1
mv numeric-1.0.zip numeric
