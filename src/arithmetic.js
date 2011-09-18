/**
     * Adds tensors
     * 
     * @example
> numeric.add(1,2)
t(3)
> numeric.add(1,[2,3])
t([3,4])
> numeric.add([1,2],3)
t([4,5])
> numeric.add([1,2],[3,4])
t([4,6])
> numeric.add(numeric.t(1,2),numeric.t(3,4))
t(4,6)
> numeric.add(1,numeric.t(2,3))
t(3,3)
> numeric.add(numeric.t(2,3),1)
t(3,3)
> numeric.add(numeric.t([1,2],[3,4]),numeric.t([5,6],[7,8]))
t([6,8],
  [10,12])
> numeric.add(1,2,3,4,5,6,7,8,9)
t(45)
     */
function add() {
    function adder(x,y) { var i; for(i=0;i<x.length;i++) { x[i] += y(i); } }
    var ret = copy(t(arguments[0])),foo;
    var i,j,foo,bar;
    for(i=1;i<arguments.length;i++) {
        foo = t(arguments[i]);
        if(ret.s.length === 0 && foo.s.length >0) {
            bar = ret;
            ret = copy(foo);
            foo = bar;
        }
        adder(ret.x,mkf(foo.x));
        if(typeof ret.y === "undefined") {
            if(typeof foo.y !== "undefined") {
                ret.y = foo.y.slice(0);
            }
        } else {
            if(typeof foo.y !== "undefined") {
                adder(ret.y,mkf(foo.y));
            }
        }
    }
    return ret;
}
expo(add);

/**
     * Subtracts tensors.
     * 
     * @example
> numeric.sub(1,2)
t(-1)
> numeric.sub(1,[2,3])
t([-1,-2])
> numeric.sub(numeric.t(1,2),([3,4]))
t([-2,-3],[2,2])
> numeric.sub([1,2],numeric.t(3,4))
t([-2,-1],[-4,-4])
> numeric.sub(numeric.t([1,2],[3,4]),numeric.t([5,6],[7,8]))
t([-4,-4],[-4,-4])
     */
function sub() {
    function subber(x,y) { var i; for(i=0;i<x.length;i++) { x[i] -= y(i); } }
    var ret = copy(t(arguments[0])),foo;
    var i,j,foo,bar;
    for(i=1;i<arguments.length;i++) {
        foo = t(arguments[i]);
        if(ret.s.length === 0 && foo.s.length >0) {
            if(typeof ret.y === "undefined") {
                ret = mkT(foo.s,mka(foo.x.length,ret.x[0]));
            } else {
                ret = mkT(foo.s,mka(foo.x.length,ret.x[0]),
                                  mka(foo.x.length,ret.y[0]));
            }
        }
        subber(ret.x,mkf(foo.x));
        if(typeof foo.y !== "undefined") {
            if(typeof ret.y === "undefined") {
                ret.y = mka(ret.x.length,0);
            }
            subber(ret.y,mkf(foo.y));
        }
    }
    return ret;
}
expo(sub);

/**
     * Multiplies tensors pointwise.
     * 
     * For matrix products, etc... see dot() and tensor().
     * 
     * @example
> numeric.mul(1,2)
t(2)
> numeric.mul([1,2],[3,4])
t([3,8])
> numeric.mul(numeric.t(1,2),numeric.t(3,4))
t(-5,10)
> numeric.mul(numeric.t([1,2],[3,4]),numeric.t([5,6],[7,8]))
t([-16,-20],[22,40])
     */
function mul() {
    function muler(x,y) { var i; for(i=0;i<x.length;i++) { x[i] *= y(i); } }
    var ret = copy(t(arguments[0])),foo;
    var i,j,foo,bar,x1,y1,x2,y2,z1,z2;
    for(i=1;i<arguments.length;i++) {
        foo = t(arguments[i]);
        if(typeof ret.y !== "undefined" || typeof foo.y !== "undefined") {
            x1 = real(ret);
            y1 = imag(ret);
            x2 = real(foo);
            y2 = imag(foo);
            z1 = sub(mul(x1,x2),mul(y1,y2));
            z2 = add(mul(x1,y2),mul(y1,x2));
            ret = mkT(z1.s,z1.x,z2.x);
        } else {
            if(ret.s.length === 0 && foo.s.length > 0) {
                bar = ret;
                ret = copy(foo);
                foo = bar;
            }
            muler(ret.x,mkf(foo.x));
        }
    }
    return ret;
}
expo(mul);

/**
 * Pointwise division of tensor.
 * 
 * @example
> numeric.div(1,2)
t(0.5)
> numeric.div([1,2],4)
t([0.25,0.5])
> numeric.div(4,[1,2])
t([4,2])
> numeric.div([1,2],[4,8])
t([0.25,0.25])
> numeric.div(numeric.t(1,2),numeric.t(3,4))
t(0.44,0.08)
> numeric.div(1,numeric.t(3,4))
t(0.12,-0.16)
> numeric.div(numeric.t(3,4),5)
t(0.6,0.8)
 */
function div() {
function diver(x,y) { var i; for(i=0;i<x.length;i++) { x[i] /= y(i); } }
var ret = copy(t(arguments[0])),foo;
var i,j,foo,bar,x1,y1,x2,y2,z1,z2,r;
for(i=1;i<arguments.length;i++) {
    foo = t(arguments[i]);
    if(typeof ret.y !== "undefined" || typeof foo.y !== "undefined") {
        x1 = real(ret);
        y1 = imag(ret);
        x2 = real(foo);
        y2 = imag(foo);
        r = add(mul(x2,x2),mul(y2,y2));
        z1 = div(add(mul(x1,x2),mul(y1,y2)),r);
        z2 = div(sub(mul(y1,x2),mul(x1,y2)),r);
        ret = mkT(z1.s,z1.x,z2.x);
    } else {
        if(ret.s.length === 0 && foo.s.length > 0) {
            ret = mkT(foo.s,mka(foo.x.length,ret.x[0]));
        }
        diver(ret.x,mkf(foo.x));
    }
}
return ret;
}
expo(div);
