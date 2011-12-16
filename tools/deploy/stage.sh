#!/bin/bash
set -e
version=`date "+%Y-%m-%d_%H-%M-%S"`
cd `dirname $0`
source config.sh
rm -f wintests.log mactests.txt
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
echo "stage.sh: launching IE unit tests"
cd numeric/tools
if [ "x$1" == "x--without-IE" ]; then
    echo Skipping IE...
    echo Skipped IE > deploy/wintests.log
else
    osascript deploy/launchie.scpt
fi
echo "stage.sh: checking links on $server/staging"
logfile=deploy/mactests.txt
rm -f $logfile
touch $logfile
tail -f $logfile &
tailpid=$!
python -u selenium_links.py Firefox http://$server/staging/ >> $logfile 2>&1
echo "stage.sh: Mac/Chrome unit tests on $server/staging"
python -u selenium_tests.py Chrome http://$server/staging/ >> $logfile 2>&1
echo "stage.sh: Mac/Firefox unit tests on $server/staging"
python -u selenium_tests.py Firefox http://$server/staging/ >> $logfile 2>&1
kill -9 $tailpid
echo "stage.sh: making report"
cd deploy
python make_report.py $version > report.html
scp -P 2222 report.html $user@$server:$webroot/staging
echo "stage.sh: done"
