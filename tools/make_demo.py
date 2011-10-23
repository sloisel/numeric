from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.keys import Keys
import time
import traceback
import sys
import urllib
import re
import inspect
import os

demo = [
'''// White boxes have been evaluated. Blue boxes have not been evaluated.
// Hit enter to evaluate a box.
// Let's plot some financial data.
dji = numeric.parseNumber(numeric.parseCSV(numeric.getURL("/get/ichart.finance.yahoo.com/table.csv?s=^DJI&a=0&b=1&c=2000&d=0&e=1&f=2020&g=d").responseText).Close);
irx = numeric.parseNumber(numeric.parseCSV(numeric.getURL("/get/ichart.finance.yahoo.com/table.csv?s=^IRX&a=0&b=1&c=2000&d=0&e=1&f=2020&g=d").responseText).Close);
numeric.plot({x: dji, y: irx});''',
'''// Let's create a matrix.
A = numeric.t([[7,-2,3,4,5],[1,1,4,1,2],[3,1,-5,6,1],[1,9,9,1,3],[3,1,4,1,5]]);''',
'''// Let's find the eigenvalues and eigenvectors of A.
ev = numeric.eig(A);''',
'''// Let's check that A*v - v*diag(d) = 0
numeric.sub(numeric.dot(A,ev.v),numeric.dot(ev.v,numeric.diag(ev.d)))''',
'''// Let's find the LUP decomposition of A.
lup = numeric.LUP(A);''',
'''// Let's check the LUP decomposition by computing P*A - L*U
numeric.sub(A(lup.P,null),numeric.dot(lup.L,lup.U));''',
'''// Let's solve a problem A*x = b. We need a rhs.
b = numeric.t([1,2,3,4,5]);
x = numeric.Usolve(lup.U,numeric.Lsolve(lup.L,b(lup.P)));''',
'''// Let's check the answer.
numeric.dot(A,x);''',
'''// Could also use numeric.solve():
numeric.solve(A,b);''',
'''// Let's solve a linear program.
numeric.LP([[1,0],[-1,0],[0,1],[0,-1]],[1,1,1,1],[1,2]);''',
'''// Let's solve a quadratic program.
numeric.QP([[1,0],[0,2]],[-2,-2],[[1,1]],[1]);'''
        ]
def mkdemo(driver):
    try:
        for k in range(len(demo)):
            print 'Command',k,':'
            print demo[k]
            input = driver.find_element_by_id("in"+str(k))
            foo = demo[k].split('\n')
            for j in range(len(foo)):
                if(j>0):
                    input.send_keys(Keys.SHIFT,Keys.ENTER)
                input.send_keys(foo[j])
            input.send_keys('\n')
        pl = driver.find_element_by_id("permalink")
        pl.click()
    except:
        print "FAIL. Cannot create demo."

if len(sys.argv) > 1:
    url = sys.argv[1]
else:
    url = "http://127.0.0.1/staging/"
demopath = os.path.abspath(os.path.dirname(os.path.abspath(sys.argv[0]))+'/..')
names = ['Firefox','Chrome']
done = 0
for x in names:
    try:
        driver = eval('webdriver.'+x+'()')
    except:
        print 'Skipping',x
        continue
    print 'Using',x
    try:
        driver.get(url)
        mkdemo(driver)
        url = driver.current_url
        driver.quit()
    except:
        driver.quit()
        raise
    done = 1
    break
if done:
    print 'Fetching demo.html at ',url
    urllib.urlretrieve(url,demopath+'/demo.html')
else:
    print 'Could not generate demo.'
print 'Done.'
