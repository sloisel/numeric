function samev(a,b) {
    var i;
    if(!(a instanceof Array) || !(b instanceof Array)) { return false; }
    if(a.length !== b.length) { return false; }
    for(i=0;i<a.length;i++) {
        if(typeof a[i] !== "number" || typeof b[i] !== "number") { return false; }
        if(a[i] !== b[i]) { return false; }
    }
    return true;
}

/**
 * Checks whether x and y are equivalent tensors.
 * 
 * @example
> z = numeric.t([1,2,3]); numeric.same(z,z)
true
> w = numeric.t([1,2,3]); numeric.same(z,w)
true
> numeric.set(w,2,2); numeric.same(z,w)
false
> numeric.same(numeric.t(1,1),1)
false
> numeric.same(1,numeric.t(1,1))
false
> numeric.same(numeric.t(1,1),numeric.t(1,1))
true
 */
function same(x,y) {
    x = t(x); y = t(y);
    var i;
    if(x === y) { return true; }
    if(!samev(x.s,y.s)) { return false; }
    if(!samev(x.x,y.x)) { return false; }
    if(typeof x.y === "undefined") {
        if(typeof y.y === "undefined") { return true; }
        for(i=0;i<y.y.length;i++) { if(y.y[i] !== 0) { return false; } }
        return true;
    }
    if(typeof y.y === "undefined") {
        for(i=0;i<x.y.length;i++) { if(x.y[i] !== 0) { return false; } }            
    }
    return true;
}
expo(same);

/**
 * Entrywise comparison for equality
 * 
 * @example
> numeric.equal([1,2,3],[2,2,3])
t([0,1,1])
> numeric.equal(numeric.t([0,1],[0,2]),[0,1])
t([1,0])
> numeric.equal([0,1],numeric.t([0,1],[0,2]))
t([1,0])
> numeric.equal(numeric.t([0,1],[2,2]),numeric.t([0,1],[0,2]))
t([0,1])
 * @param x
 * @param y
 * @returns
 */
function equal(x,y) {
    x = t(x); y = t(y);
    if(!samev(x.s,y.s)) { throw new Error("equal: x and y must have the same shape"); }
    var xx = x.x, xy = x.y, yx = y.x, yy = y.y;
    var i, n = xx.length, ret = [];
    if(typeof xy === "undefined") {
        if(typeof yy === "undefined") {
            for(i=0;i<n;i++) { ret[i] = (xx[i] === yx[i])?1:0; }
            return mkT([ret.length],ret);
        }
        for(i=0;i<n;i++) { ret[i] = (xx[i] === yx[i] && yy[i] === 0)?1:0; }
        return mkT([ret.length],ret);
    }
    if(typeof yy === "undefined") {
        for(i=0;i<n;i++) { ret[i] = (xx[i] === yx[i] && xy[i] === 0)?1:0; }
        return mkT([ret.length],ret);
    }
    for(i=0;i<n;i++) { ret[i] = (xx[i] === yx[i] && xy[i] === yy[i])?1:0; }
    return mkT([ret.length],ret);
}
expo(equal);

function zipbool(x,y,f) {
    x = R(t(x)); y = R(t(y));
    if(!samev(x.s,y.s)) { throw new Error("x and y must have the same shape"); }
    var i, a = x.x, b = y.x, n = a.length, ret = [];
    for(i=0;i<n;i++) { ret[i] = f(a[i],b[i])?1:0; }
    return mkT(x.s,ret);
}

/**
 * Entrywise x > y
 * 
 * @example
> numeric.gt([1,3,4,1],[2,1,5,1]);
t([0,1,0,0])
 * @param x
 * @param y
 * @returns
 */
function gt(x,y) { return zipbool(x,y,function(a,b) { return a>b; }); }
expo(gt);

/**
 * Entrywise x < y
 * 
 * @example
> numeric.lt([1,3,4,1],[2,1,5,1]);
t([1,0,1,0])
 * @param x
 * @param y
 * @returns
 */
function lt(x,y) { return zipbool(x,y,function(a,b) { return a<b; }); }
expo(lt);

/**
 * Entrywise x >= y
 * 
 * @example
> numeric.geq([1,3,4,1],[2,1,5,1]);
t([0,1,0,1])
 * @param x
 * @param y
 * @returns
 */
function geq(x,y) { return zipbool(x,y,function(a,b) { return a>=b; }); }
expo(geq);

/**
 * Entrywise x <= y
 * 
 * @example
> numeric.leq([1,3,4,1],[2,1,5,1]);
t([1,0,1,1])
 * @param x
 * @param y
 * @returns
 */
function leq(x,y) { return zipbool(x,y,function(a,b) { return a<=b; }); }
expo(leq);

/**
 * Entrywise negation.
 * 
 * @example
> numeric.not([1,0,3,0]);
t([0,1,0,1])
 * @param x
 * @returns
 */
function not(x) {
    x = R(t(x));
    return map(function(a) { return (a === 0)?1:0; },null,null,x);
}
expo(not);

/**
 * Entrywise x && y
 * 
 * @example
> numeric.and([0,0,1,1],[0,1,0,1]);
t([0,0,0,1])
 * @param x
 * @param y
 * @returns
 */
function and(x,y) { return zipbool(x,y,function(a,b) { return a&&b; }); }
expo(and);

/**
 * Entrywise x || y
 * 
 * @example
> numeric.or([0,0,1,1],[0,1,0,1]);
t([0,1,1,1])
 * @param x
 * @param y
 * @returns
 */
function or(x,y) { return zipbool(x,y,function(a,b) { return a||b; }); }
expo(or);

/** 
 * Finds nonzero entries
 * 
 * @example
> numeric.find([0,1,0,3])
t([1,3])
 * @param x
 * @returns
 */
function find(x) {
    x = V(t(x));
    var i,n = x.x.length, a = x.x, b = x.y, ret = [];
    if(typeof b === "undefined") {
        for(i=0;i<n;i++) { if(a[i] !== 0) { ret.push(i); } }
        return mkT([ret.length],ret);
    }
    for(i=0;i<n;i++) { if(a[i] !== 0 || b[i] !== 0) { ret.push(i); } }
    return mkT([ret.length],ret);
}
expo(find);

/**
 * Returns true if any entries are nonzero.
 * 
 * @example
> numeric.any([0,0,3,0])
true
> numeric.any([0,0,0])
false
 * @param x
 * @returns {Boolean}
 */
function any(x) {
    x = t(x);
    var i,n = x.x.length, a = x.x, b = x.y;
    if(typeof b === "undefined") {
        for(i=0;i<n;i++) { if(a[i] !== 0) return true; }
        return false;
    }
    for(i=0;i<n;i++) { if(a[i] !== 0 || b[i] !== 0) return true; }
    return false;
}
expo(any);

/**
 * Returns true if all entries are nonzero.
 * 
 * @example
> numeric.all([0,0,3,0])
false
> numeric.all([1,3,4])
true
 * @param x
 * @returns {Boolean}
 */
function all(x) {
    x = t(x);
    var i,n = x.x.length, a = x.x, b = x.y;
    if(typeof b === "undefined") {
        for(i=0;i<n;i++) { if(a[i] === 0) return false; }
        return true;
    }
    for(i=0;i<n;i++) { if(a[i] === 0 && b[i] === 0) return false; }
    return true;
}
expo(all);
