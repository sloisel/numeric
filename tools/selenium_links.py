from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
import time
import traceback
import sys
import urllib
import re

url = ""
def test(links,driver):
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
            time.sleep(3)
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

url = ""
if len(sys.argv) > 1:
    client = sys.argv[1]
    if(len(sys.argv)>2):
        url = sys.argv[2]
else:
    client = "Firefox"

if url == "":
    url = "http://127.0.0.1/staging/"

mainlinks = [("linkhome","Numerical analysis in Javascript"),
             ("linkworkshop","IN"),
             ("linkdoc","vectors and matrices"),
             ("linklib","var numeric"),
             ("linklibmin","var numeric="),]
driver=0
print "Link testing."
try:
    driver = eval('webdriver.'+client+'()')
    print "Using",client
    driver.implicitly_wait(10)
    driver.get(url)
    time.sleep(1);
    test(mainlinks,driver)
    driver.quit()
except:
    print "Could not do browser",client
    if driver:
        driver.quit()

