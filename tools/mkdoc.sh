#!/bin/bash
d0=`dirname $0`
d1=`cd $d0/.. && pwd`
djsdoc=$d1/tools/jsdoc-toolkit
djs=$d1/lib
ddoc=$d1/doc

cd $djsdoc
echo "JSDoc:"
rm -rf $ddoc
mkdir $ddoc
echo '*' > $ddoc/.gitignore
java -jar jsrun.jar app/run.js -t=templates/jsdoc -d=$ddoc -r -v $djs/numeric.js
