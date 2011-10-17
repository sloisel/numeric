import sys
import re
import time

print """
<html>
<head>
<title>Report for v"""+sys.argv[1]+"""</title>
<style>
td {
  font-family: monospace;
  white-space: pre-wrap;
}
</style>
<body>
<table>
<tr><td>
<font size="+2">Mac unit tests """+sys.argv[1]+"""</font>
</td></tr><tr><td>
"""

out = open('mactests.txt','r').read()
foo = re.sub(r'\n([0-9]+ PASS:)',r'</td></tr><tr bgcolor="#a0ffa0"><td>\1',out)
bar = re.sub(r'\n([0-9]+ FAIL:)',r'</td></tr><tr bgcolor="#ff2020"><td>\1',foo)
baz = re.sub(r'\n(.* testing complete. PASS:)',r'</td></tr><tr bgcolor="#a0a0ff"><td>\1',bar)
print baz
print """
</td></tr><tr><td>
<font size="+2">Windows unit tests """+sys.argv[1]+"""</font>
</td></tr><tr><td>
"""
out = 0
for k in range(60):
    try:
        out = open('wintests.log','r').read()
        break
    except:
        time.sleep(10)
if out==0:
    print """</td></tr><tr bgcolor="#ff2020"><td>FAIL: Window testing suite has failed."""
else:
    foo = re.sub(r'\n([0-9]+ PASS:)',r'</td></tr><tr bgcolor="#a0ffa0"><td>\1',out)
    bar = re.sub(r'\n([0-9]+ FAIL:)',r'</td></tr><tr bgcolor="#ff2020"><td>\1',foo)
    baz = re.sub(r'\n(.* testing complete. PASS:)',r'</td></tr><tr bgcolor="#a0a0ff"><td>\1',bar)
    print baz

print """
</td></tr></table>
"""
