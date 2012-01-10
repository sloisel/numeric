#!/bin/bash
set -e
version=`date "+%Y-%m-%d_%H-%M-%S"`
cd `dirname $0`
rm -f version.txt
echo $version > version.txt
source config.sh
cd ..
echo "stage.sh: making db"
php ./mkdb.php $version
echo "stage.sh: making demo"
python ./make_demo.py
cd ../..
rm -f numeric.tar.gz
echo "stage.sh: preparing tarball"
tar cvfz numeric.tar.gz numeric
echo "stage.sh: uploading tarball"
scp -P 2222 numeric.tar.gz $user@$server:./
echo "stage.sh: linking staging to v$version on $server"
ssh $server -p 2222 -l $user "( tar xvfz numeric.tar.gz && mv numeric $webroot/v$version && cd $webroot && rm -f staging && ln -s v$version staging && cd staging/tools && php mkdb.php $version && deploy/clean.sh && echo Staging successful. ) || echo FAIL: Staging."
echo "stage.sh: done"
