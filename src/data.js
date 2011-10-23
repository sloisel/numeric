
/**
 * Converts date strings into floating point quantities
 * 
 * @example
> numeric.parseDate(['1/13/2013','2001-5-9, 9:31']);
t([1.358e+12,9.894e+11])
 */
function parseDate(d) {
    function foo(d) {
        if(typeof d === 'string') { return Date.parse(d.replace(/-/g,'/')); }
        if(!(d instanceof Array)) { throw new Error("parseDate: parameter must be arrays of strings"); }
        var ret = [],k;
        for(k=0;k<d.length;k++) { ret[k] = foo(d[k]); }
        return ret;
    }
    return t(foo(d));
}
my.parseDate = parseDate;

/**
 * Parses floating point numbers.
 * 
 * @param d arrays of floating point numbers
 * @returns a tensor
 * @example
> numeric.parseNumber(['12','0.1'])
t([12,0.1])
 */
function parseNumber(d) {
    function foo(d) {
        if(typeof d === 'string') { return parseFloat(d); }
        if(!(d instanceof Array)) { throw new Error("parseFloat: parameter must be arrays of strings"); }
        var ret = [],k;
        for(k=0;k<d.length;k++) { ret[k] = foo(d[k]); }
        return ret;
    }
    return t(foo(d));
}
my.parseNumber = parseNumber;

/**
 * Parses a CSV file
 * 
 * @example
> numeric.parseCSV('a,b,c\n1,2,3\n4,5,6')
{a:["1","4"],b:["2","5"],c:["3","6"]}
 * @param t A CSV file as an ordinary text string
 * @returns An object whose entries are the rows of the CSV file
 */
function parseCSV(t) {
    var foo = t.split('\n');
    var j,k;
    var ret = {};
    var pat = /(([^'",]*)|('[^']*')|("[^"]*")),/g;
    var names = (foo[0]+",").match(pat);
    var stripper = function(n) { return n.substr(0,n.length-1); }
    var count = 0;
    for(k=0;k<names.length;k++) { names[k] = stripper(names[k]); ret[names[k]] = []; }
    for(k=1;k<foo.length;k++) {
      var bar = (foo[k]+",").match(pat);
      if(bar.length === names.length) {
        for(j=0;j<names.length;j++) { ret[names[j]][count] = stripper(bar[j]); }
        count++;
      }
    }
    return ret;
}
my.parseCSV = parseCSV;

/**
 * Fetch a web page, file, etc... using SMLHttpRequest.
 * 
 * @example
> numeric.getURL('tools/helloworld.txt').responseText
"Hello, world!"
 * @param url The URL to be fetched.
 * @returns {XMLHttpRequest}
 */
function getURL(url) {
    var client = new XMLHttpRequest();
    client.open("GET",url,false);
    client.send();
    return client;
}
my.getURL = getURL;
