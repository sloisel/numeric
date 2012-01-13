#!/bin/bash
cd `dirname $0`
source config.sh
version=`cat version.txt`
rm -f wintests.log mactests.txt
echo "test.sh: launching IE unit tests"
cd ..
if [ "x$1" == "x--without-IE" ]; then
    echo Skipping IE...
    echo Skipped IE > deploy/wintests.log
else
    osascript deploy/launchie.scpt
fi
echo "test.sh: checking links on $server/staging"
logfile=deploy/mactests.txt
rm -f $logfile
touch $logfile
tail -f $logfile &
tailpid=$!
python -u selenium_links.py Firefox http://$server/staging/ >> $logfile 2>&1
echo "test.sh: Mac/Chrome unit tests on $server/staging"
python -u selenium_tests.py Chrome http://$server/staging/ >> $logfile 2>&1
echo "test.sh: Mac/Firefox unit tests on $server/staging"
python -u selenium_tests.py Firefox http://$server/staging/ >> $logfile 2>&1
kill -9 $tailpid
echo "test.sh: making report"
cd deploy
python make_report.py $version > report.html
scp report.html $user@$server:$webroot/staging
