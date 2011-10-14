#!/bin/bash
php ./mkdb.php
d0=`dirname $0`
cd $d0
curl http://$HOSTNAME/numeric/ > ../../index.html
curl http://$HOSTNAME/numeric/index.php?link=79cfb087074a163a9a763ebe55a4f55545d33a50f54827474cc7e600a5c1ab35 > ../demo.html
