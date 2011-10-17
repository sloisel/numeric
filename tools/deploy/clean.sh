#!/bin/bash
set -e
cd `dirname $0`
cd ../../..
numeric=`readlink numeric || echo ""`
staging=`readlink staging || echo ""`
for x in v*; do
    if [ "z$x" != "z$numeric" -a "z$x" != "z$staging" ]; then
	rm -rf $x
    fi
done
