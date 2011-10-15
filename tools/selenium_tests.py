from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
import time
import traceback
import sys
import urllib
import re

url = ""
def test(name,driver):
    p = 0
    f = 0
    t = 0
    try:
        for k in range(len(tests)):
            t=t+1
            foo = ""
            try:
                input = driver.find_element_by_id("in"+str(k))
                input.send_keys(tests[k][0]+'\n')
                output = driver.find_element_by_id("out"+str(k))
                foo = re.sub(r'\s','',output.text)
                if(tests[k][1][0:6]=="Error:"):
                    foo = foo[0:len(tests[k][1])]
                assert(foo == tests[k][1])
                print k,"PASS:",tests[k][0],'==>',foo
                p=p+1
            except Exception as ex:
                print k,"FAIL:",tests[k][0],'==>',foo,"reason:",ex
                f=f+1
        print name,'testing complete. PASS:',p,'FAIL:',f,'Total:',t
    except:
        print "FAIL: "+name+" selenium tests. Details:"
        traceback.print_exc()

def testlink(links,driver):
    p=0
    f=0
    t=0
    for k in range(len(links)):
        x = links[k]
        foo = ""
        t=t+1
        try:
            link = driver.find_element_by_id(x[0])
            link.click()
            foo = driver.page_source
            driver.back()
            assert(x[1] in foo)
            print k,"PASS:",x[0],"==>",x[1],"in page"
            p=p+1
        except:
            print k,"FAIL:",x[0],"==>",x[1],"not in page"
            traceback.print_exc()
            f=f+1
    print 'Link testing complete. PASS:',p,'FAIL:',f,'Total:',t

if len(sys.argv) > 1:
    url = sys.argv[1]
else:
    url = "http://127.0.0.1/staging/"
    
njs = urllib.urlopen(url+'lib/numeric.js').read()
y = re.findall(r'(@example[\s\S]*?(?=\n[\s]*\*))|(<pre>[\s\S]*?(?=<\/pre>))',njs)
tests = [];

print "Step 1: checking links"
mainlinks = [("aboutlink","About Numeric Javascript"),
             ("demolink","Numeric Javascript Workshop"),
             ("downloadlink","numeric"),
             ("downloadminlink","numeric"),
             ("githublink","sloisel/numeric"),
             ("doclink","JsDoc Reference - numeric"),
             ("authorlink","Loisel"),
             ("licenselink","license")]
names = ['Chrome','Firefox'] # IE can't handle this
for x in names:
    driver=0
    try:
        driver = eval('webdriver.'+x+'()')
        print "Using",x
        driver.implicitly_wait(10)
        driver.get(url)
        testlink(mainlinks,driver)
        driver.quit()
        break
    except:
        print "Skipping",x
        if driver:
            driver.quit()

print "Step 2: checking cross-browser functionality"
for x in y:
    baz = ((x[0]+x[1]).split('\n> '))[1:]
    for foo in baz:
        bar = foo.find('\n')
        tests.append((foo[0:bar],re.sub(r'\s','',foo[bar+1:])))
names = ['Ie','Chrome','Firefox']
for x in names:
    driver=0
    try:
        driver = eval('webdriver.'+x+'()')
        print "Using",x
        driver.implicitly_wait(2)
        driver.get(url)
        test(x,driver)
    except:
        print "SKIP:",x,"selenium tests."
    if(driver):
        driver.quit()
