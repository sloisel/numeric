from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait # available since 2.4.0
import time
import traceback
import sys

url = ""
def test(name,driver):
    try:
        driver.get(url)
        input = driver.find_element_by_id("in0")
        input.send_keys("2+3\n")
        output = driver.find_element_by_id("out0")
        assert(output.text == "5")
        input = driver.find_element_by_id("in1")
        input.send_keys("numeric.LP([[1,0],[-1,0],[0,1],[0,-1]],[1,1,1,1],[1,2],10);\n")
        output = driver.find_element_by_id("out1")
        assert(output.text == "t( [-1        , -1         ])")
        print "PASS: "+name+" selenium tests"
    except:
        print "FAIL: "+name+" selenium tests. Details:"
        print traceback.print_exc()
    finally:
        if driver:
            driver.quit()

if len(sys.argv) > 1:
    url = sys.argv[1]
else:
    url = "http://127.0.0.1/staging/"
names = ['Chrome','Firefox','Ie']
for x in names:
    try:
        driver = eval('webdriver.'+x+'()')
        test(x,driver)
    except Exception as ex:
        print "SKIP: "+x+" selenium tests. Reason: ",ex

