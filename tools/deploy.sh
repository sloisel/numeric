#!/bin/bash
dx=`dirname $0`
cd $dx
d0=`pwd`
cd ..
d1=`pwd`
v=`basename $d1`
cd ..
d2=`pwd`
if [ $v != "numeric" ]; then
    rm numeric && ln -s $v numeric
fi
cd $d0
echo "deploy.sh: making db"
php ./mkdb.php
#echo "deploy.sh: fetching index"
#curl http://$HOSTNAME/numeric/ > $d2/index.html
if [ "x$1" != "x--nodemo" ]; then
	echo "deploy.sh: making demo"
	python ./make_demo.py
fi
echo "deploy.sh: done"
