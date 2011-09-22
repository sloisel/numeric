#!/bin/bash
d0=`dirname $0`
cd $d0
curl http://127.0.0.1/numeric/ > ../../index.html
curl http://127.0.0.1/numeric/index.php?link=79cfb087074a163a9a763ebe55a4f55545d33a50f54827474cc7e600a5c1ab35 > ../demo.html
php ./mkdb.php
