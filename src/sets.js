/**
 * Computes a set union
 * 
 * @example
> numeric.union([1,2,3],[2,3,4],[4,4,1,9]);
t([1,2,3,4,9])
 */
function union() {
    var foo = {}, bar;
    var n = arguments.length, i,j,m,x;
    for(i=0;i<n;i++) {
        bar = R(V(t(arguments[i])));
        x = bar.x;
        m = x.length;
        for(j=0;j<m;j++) { foo[x[j]] = x[j]; }
    }
    var ret = [];
    for(i in foo) { if(foo.hasOwnProperty(i)) { ret.push(foo[i]); } }
    return t(ret);
}
expo(union);

/**
 * Computes a set difference.
 * 
 * @example
> numeric.setDiff([1,4,4,2,7,9,2],[3,6,2]);
t([1,4,4,7,9])
 * @param x
 * @param y
 * @returns
 */
function setDiff(x,y) {
    if(arguments.length !== 2) { throw new Error("setDiff: exactly two arguments must be given"); }
    x = R(V(t(x))); y = R(V(t(y)));
    var ret = [], yx = y.x;
    var foo = x.x.filter(function(i) { return yx.indexOf(i) === -1; });
    var i;
    for(i in foo) { if(foo.hasOwnProperty(i)) { ret.push(foo[i]); } }
    return t(ret);
}
expo(setDiff);

/**
 * Computes a set intersection
 * 
 * @example
> numeric.intersect([1,2,4,6,7,9],[1,2,3,4,5,5,6,7],[3,4,5,7]);
t([4,7])
 * @returns
 */
function intersect() {
    var i, n = arguments.length;
    var foo, ret = R(V(copy(arguments[0]))).x, z=[];
    for(i=1;i<n;i++) {
        foo = R(V(t(arguments[i]))).x;
        ret = ret.filter(function(i) { return foo.indexOf(i) !== -1; });
    }
    for(i in ret) { if(ret.hasOwnProperty(i)) { z.push(ret[i]); } }
    return t(z);
}
expo(intersect);
