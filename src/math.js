function map(f,fr,fi,x) {
    var i,p = [],q,a = x.x,b = x.y;
    if(typeof b === "undefined") {
        for(i=0;i<a.length;i++) p[i] = f(a[i]);
        return mkT(x.s,p);
    }
    b = x.y;
    q = [];
    for(i=0;i<a.length;i++) {
        p[i] = fr(a[i],b[i]);
        q[i] = fi(a[i],b[i]);
    }
    return mkT(x.s,p,q);
}

/**
     * Pointwise exponential of a tensor.
     * 
     * @example
> numeric.exp(0)
t(1)
> numeric.exp([0,1])
t([1,2.718])
> numeric.exp(numeric.t(1,1))
t(1.469,2.287)
     */
function exp(x) {
    x = t(x);
    var e = Math.exp, c = Math.cos, s = Math.sin;
    return map(e,function (a,b) { return e(a)*c(b); },
                 function (a,b) { return e(a)*s(b); },x);
}
my.exp = exp;
/**
     * The pointwise modulus of a tensor.
     * @example
> numeric.abs(-1)
t(1)
> numeric.abs(numeric.t(1,1))
t(1.414)
     */
function abs(z) {
    z = t(z);
    var i, x = z.x, y = z.y, n = x.length, ret=[];
    if(typeof y === "undefined") {
        for(i=0;i<n;i++) { ret[i] = Math.abs(x[i]); }
    } else {
        for(i=0;i<n;i++) {
            ret[i] = Math.sqrt(x[i]*x[i]+y[i]*y[i]);
        }
    }
    return mkT(z.s,ret);
}
my.abs = abs;
/** 
     * Pointwise complex conjugate of a tensor.
     * 
     * @example
> numeric.conj(3)
t(3)
> numeric.conj(numeric.t([1,2],[3,4]))
t([1,2],[-3,-4])
     */
function conj(z) {
    z = t(z);
    if(typeof z.y === "undefined") { return z; }
    var i = neg(imag(z));
    return mkT(z.s,z.x,i.x);
}
my.conj = conj
/**
     * Pointwise negation of a tensor
     * 
     * @example
> numeric.neg(1)
t(-1)
> numeric.neg(numeric.t(1,2))
t(-1,-2)
> numeric.neg([1,2])
t([-1,-2])
     */
function neg(z) {
    z = t(z);
    return map(function(x) { return -x; },
               function(x,y) { return -x; },
               function(x,y) { return -y; },z)
}
my.neg = neg;

/**
     * Pointwise cosine of a tensor.
     * 
     * @param {numeric.T} z A tensor.
     * @example
> numeric.cos(1)
t(0.5403)
> numeric.cos(numeric.t(1,1))
t(0.8337,-0.9889)
     */
function cos(z) {
    var e = Math.exp, c = Math.cos, s = Math.sin;
    z = t(z);
    return map(c,
               function (x,y) { return 0.5*c(x)*(e(-y)+e(y)); },
               function (x,y) { return 0.5*s(x)*(e(-y)-e(y)); }, z)
}
my.cos = cos;
/**
     * Pointwise sine of a tensor.
     * 
     * @param {numeric.T} z A tensor.
     * @example
> numeric.sin(1)
t(0.8415)
> numeric.sin(numeric.t(1,1))
t(1.298,0.6350)
     */
function sin(z) {
    var e = Math.exp, c = Math.cos, s = Math.sin;
    z = t(z);
    return map(s,
               function (x,y) { return 0.5*s(x)*(e(-y)+e(y)); },
               function (x,y) { return 0.5*c(x)*(e(y)-e(-y)); }, z)
}
my.sin = sin;

/**
     * Pointwise logarithm of tensor.
     * 
     * @example
> numeric.log(1)
t(0)
> numeric.log(numeric.t(1,1))
t(0.3466,0.7854)
     */
function log(z) {
    var a = Math.abs, a2 = Math.atan2, l = Math.log, s = Math.sqrt;
    z = t(z);
    return map(l,
               function (x,y) { return l(s(x*x+y*y));},
               function (x,y) { return a2(y,x);}, z);
}
my.log = log;

/**
     * Pointwise atan of tensor.
     * 
     * @example
> numeric.atan(1)
t(0.7854)
> numeric.atan(numeric.t(1,1))
t(1.017,0.4024)
> numeric.atan(numeric.tan(numeric.t(0.9,0.8)))
t(0.9000,0.8000)
     */
function atan(z) {
    var a = Math.abs, a2 = Math.atan2, l = Math.log, s = Math.sqrt;
    z = t(z);
    return map(Math.atan,
            function (x,y) { return -0.5*(a2(-x,1+y)-a2(x,1-y));},
            function (x,y) { return 0.5*(l(s((1+y)*(1+y)+x*x))-l(s((1-y)*(1-y)+x*x)));},
            z);
}
my.atan = atan;
/**
     * Pointwise atan2 of a real tensor.
     * 
     * @example
> numeric.atan2(1,1)
t(0.7854)
> numeric.atan2(numeric.t(1,1),3)
Error: atan2 is defined for real tensors only
> numeric.atan2(3,numeric.t(1,1))
Error: atan2 is defined for real tensors only
     */
/**
     * Pointwise square root
     * 
     * @example
> numeric.sqrt(2);
t(1.414)
> numeric.sqrt(numeric.t([1,3],[1,4]));
t([1.099,2],[0.4551,1])
> numeric.sqrt(-1)
t(0,1)
> numeric.sqrt(numeric.t(-1,0))
t(6.123e-17,1)
     */
function sqrt(z) {
    var a = Math.atan2, p = Math.pow, s = Math.sin, c = Math.cos, sq = Math.sqrt;
    z = t(z);
    var flag = false, i, j, n = z.x.length, x = [], y = [],r,th;
    var zx = z.x, zy = z.y;
    if(typeof zy === "undefined") {
        for(i=0;i<n;i++) {
            if(zx[i] < 0) break;
            x[i] = sq(zx[i]);
        }
        if(i<n) {
            for(j=0;j<i;j++) { y[i] = 0; }
            for(;i<n;i++) {
                if(zx[i]<0) { y[i] = sq(-zx[i]); x[i] = 0; }
                else { x[i] = sq(zx[i]); y[i] = 0; }
            }
            return mkT(z.s,x,y);
        }
        return mkT(z.s,x);
    }
    for(i=0;i<n;i++) {
        th = a(zy[i],zx[i])/2;
        r = p(zy[i]*zy[i]+zx[i]*zx[i],0.25);
        x[i] = r*c(th);
        y[i] = r*s(th);
    }
    return mkT(z.s,x,y);
}
my.sqrt = sqrt;

/**
     * Raises a to the bth power. Actual formula is exp(mul(log(a),b)).
     * 
     * @example
> numeric.pow(3,2);
t(9.000)
> numeric.pow(numeric.t([1,2],[0,1]),numeric.t([2,3],[0,-1]))
t([1,14.81],[0,9.834])
     */
function pow(a,b) { return exp(mul(log(a),b)); }
my.pow = pow;

function iz(z) {
    var i,foo;
    if(typeof z.y === "undefined") {
        z.y = [];
        for(i=0;i<z.x.length;i++) { z.y[i] = 0; }
    } else {
        for(i=0;i<z.x.length;i++) { z.y[i] = -z.y[i]; }
    }
    foo = z.x;
    z.x = z.y;
    z.y = foo;
}
/**
     * The pointwise acos of a tensor. In the complex case, actual formula is
     * add(mul(i,log(add(mul(i,z),sqrt(sub(1,mul(z,z)))))),Math.PI*0.5),
     * where i=t(0,1).
     * 
     * @example
> numeric.acos(0.9)
t(0.4510)
> numeric.acos(numeric.t([0.3,-0.5],[0,0.2]))
t([1.266,2.080],[0,-0.2271])
     */
function acos(z) {
    z = t(z);
    if(typeof z.y === "undefined") {
        return map(Math.acos,0,0,z);
    }
    var foo = copy(z);
    iz(foo);
    foo = log(add(foo,sqrt(sub(1,mul(z,z)))));
    iz(foo);
    return add(foo,Math.PI*0.5);
}
my.acos = acos;
/**
     * The pointwise asin of a tensor. In the complex case, actual formula is
     * neg(mul(i,log(add(mul(i,z),sqrt(sub(1,mul(z,z))))))),
     * where i=t(0,1).
     * 
     * @example
> numeric.asin(0.9)
t(1.120)
> numeric.asin(numeric.t([0.3,-0.5],[0,0.2]))
t([0.3047,-0.5091],[0,0.2271])
     */
function asin(z) {
    z = t(z);
    if(typeof z.y === "undefined") {
        return map(Math.asin,0,0,z);
    }
    var foo = copy(z);
    iz(foo);
    foo = log(add(foo,sqrt(sub(1,mul(z,z)))));
    iz(foo);
    return neg(foo);
}
my.asin = asin;

/**
     * Pointwise atan2 of real tensors.
     * 
     * @example
> numeric.atan2(1,1)
t(0.7854)
> numeric.atan2(numeric.i,3)
Error: atan2 is defined for real tensors only
     */
function atan2(z,w) {
    z = t(z); w = t(w);
    if(typeof z.y !== "undefined" || typeof w.y !== "undefined") { throw new Error("atan2 is defined for real tensors only")}
    if(!samev(z.s,w.s)) { throw new Error("atan2: z and w must have the same size"); }
    var ret = [], i, x = z.x, n = x.length, y = w.x;
    for(i=0;i<n;i++) ret[i] = Math.atan2(y[i],x[i]);
    return mkT(z.s,ret);
}
my.atan2 = atan2;
/**
     * Pointwise tangent of a tensor
     * 
     * @example
> numeric.tan(1)
t(1.557)
> numeric.tan(numeric.t(1,1))
t(0.2718,1.084)     
     */
function tan(z) {
    z = t(z);
    var a = sin(z), b = cos(z), c = div(a,b);
    return div(sin(z),cos(z));
    }
my.tan = tan;
/**
     * Pointwise rounding of a tensor.
     * 
     * @example
> numeric.round(numeric.t([1.1,1.7],[-5.2,-9.9]))
t([1,2],[-5,-10])
     */
function round(z) {
    var r = Math.round;
    return map(r,
               function (x,y) { return r(x); },
               function (x,y) { return r(y); },
               t(z));
}
my.round = round;
/**
     * Pointwise ceil of a tensor.
     * 
     * @example
> numeric.ceil(numeric.t([1.1,1.7],[-5.2,-9.9]))
t([2,2],[-5,-9])
> numeric.ceil("what?")
Error: Malformed tensor
     */
function ceil(z) {
    var r = Math.ceil;
    return map(r,
               function (x,y) { return r(x); },
               function (x,y) { return r(y); },
               t(z));
}
my.ceil = ceil;
/**
     * Pointwise floor of a tensor.
     * 
     * @example
> numeric.floor(numeric.t([1.1,1.7],[-5.2,-9.9]))
t([1,1],[-6,-10])
     */
function floor(z) {
    var r = Math.floor;
    return map(r,
               function (x,y) { return r(x); },
               function (x,y) { return r(y); },
               t(z));
}
my.floor = floor;

/**
 * Computes the supremum of a tensor.
 * 
 * @example
> numeric.sup([1,3,7,2])
t(7)
 * @param z
 * @returns
 */
function sup(z) {
    z = R(t(z));
    var foo = -Infinity;
    var i, x = z.x, n = x.length, M = Math.max;
    for(i=0;i<n;i++) { foo = M(foo,x[i]); }
    return t(foo);
}
my.sup = sup;

/**
 * Computes the supremum of a tensor.
 * 
 * @example
> numeric.inf([1,3,7,2])
t(1)
 * @param z
 * @returns
 */
function inf(z) {
    z = R(t(z));
    var foo = Infinity;
    var i, x = z.x, n = x.length, M = Math.min;
    for(i=0;i<n;i++) { foo = M(foo,x[i]); }
    return t(foo);
}
my.inf = inf;

/**
     * The real part of x.
     * 
     * @example
> numeric.real(1)
t(1)
> numeric.real(numeric.t(2,3))
t(2)
> numeric.real(numeric.t([2,3],[4,5]))
t([2,3])
     */
function real(x) { x = t(x); return mkT(x.s,x.x); }
my.real = real;

