from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
import time
import traceback
import sys
import urllib
import re

def test(name,driver):
    p = 0
    f = 0
    t = 0
    try:
        for k in range(len(tests)):
            t=t+1
            foo = ""
            try:
                input = driver.find_element_by_id("text_"+str(k+1))
                input.send_keys(tests[k][0]+'\n')
                bar = "out_"+str(k+1)
                WebDriverWait(driver,5).until(lambda driver: driver.find_element_by_id(bar).text not in ["","<img src=\"resources/wait16.gif\">"])
                output = driver.find_element_by_id(bar)
                foo = re.sub(r'\s','',output.text)
                if(tests[k][1][0:6]=="Error:"):
                    foo = foo[0:len(tests[k][1])]
                assert(foo == tests[k][1])
                print k,"PASS:",tests[k][0],'==>',foo
                p=p+1
            except Exception as ex:
                print k,"FAIL:",tests[k][0],'==>',foo,"reason:",str(ex)
                f=f+1
        print name,'testing complete. PASS:',p,'FAIL:',f,'Total:',t
    except:
        print "FAIL: "+name+" selenium tests. Details:"
        traceback.print_exc()

url = ""
if len(sys.argv) > 1:
    client = sys.argv[1]
    if(len(sys.argv)>2):
        url = sys.argv[2]
else:
    client = "Firefox"

if url == "":
    url = "http://127.0.0.1/staging/"

u0 = url + 'documentation.html'
print 'Fetching',u0
njs = urllib.urlopen(u0).read()
y = re.findall(r'<pre>[\s\S]*?(?=<\/pre>)',njs)
tests = [];

print "In-browser unit tests."
for x in y:
    baz = x.split('\nIN> ')[1:]
    for foo in baz:
        bar = foo.find('\nOUT>')
        tests.append((re.sub(r'\s',' ',foo[0:bar]),re.sub(r'\s','',foo[bar+5:])))
driver=0
try:
    driver = eval('webdriver.'+client+'()')
    print "Using",client
    driver.implicitly_wait(2)
    driver.get(url+'workshop.php')
    try:
        WebDriverWait(driver, 30).until(lambda driver : driver.find_element_by_id("text_1"))
        test(client,driver)
    except Exception as ex:
        print "FAIL: text_1 not found. ",ex
except Exception as ex:
    print "Could not use browser",client
    print ex
if(driver):
    driver.quit()
