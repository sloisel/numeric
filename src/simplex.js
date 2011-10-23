/*
 * Some additional tests. 
<pre>
> A = [[62,41,50,-84,-78,-16,9],[80,-93,-48,-88,91,-89,-40],[-74,-44,1,6,-98,80,48],[82,-90,39,55,54,88,-62],[26,-80,77,86,63,-2,37],[-80,64,91,-73,73,-2,-63],[-44,39,9,14,-82,-32,-26],[9,-36,-72,-6,-20,79,25],[91,89,-69,-97,-48,-26,55],[92,-92,-48,-32,59,-77,-83],[-68,-12,67,-67,-14,55,85],[93,-23,-49,58,81,-22,55],[91,53,62,-37,-63,-51,-3],[-3,58,-51,6,-47,-19,-13],[59,-62,85,-66,-70,-80,-11],[-71,-2,-30,20,-72,-73,-38],[-15,-11,-60,-47,73,88,2],[82,29,-49,31,16,90,2],[58,41,23,37,10,15,63],[91,50,-5,49,-70,-87,58],[31,-44,-29,-10,70,-53,29],[-92,36,66,-82,24,-29,-24],[69,31,17,-54,-30,64,62],[86,-67,10,82,3,-96,6],[35,-75,83,-69,-19,-90,-30],[51,0,-42,65,-84,-66,87],[48,91,51,8,-51,30,74],[-21,-32,50,98,-75,46,10],[31,17,-24,-84,-63,29,24],[-65,-55,13,-11,-51,-10,17]]; b=[-8835,16996,-4487,4353,1933,14225,-3503,-1313,-12129,13369,-65,-2474,-11998,-4741,-2353,2722,9041,-6953,-9383,-18625,7725,11641,-10668,-2839,5280,-15872,-16386,-7671,-5638,2711]; c=[-58,-39,-6,-53,68,-60,-54]; x=[-67.7169,-43.2446,-7.6815,-34.4453,77.0432,-6.1834,-65.4491]; x1=numeric.LP(A,b,c); numeric.round(numeric.mul(100,numeric.sub(x,x1)));
t( [0         , 0         , 0         , 0         , 0         , 0         , 0          ])
> A = [[-2,80,59,-46,-4,39,-51],[25,22,-9,-15,-75,40,35],[35,23,-13,9,18,27,-42],[-21,71,64,88,-54,-92,34],[-26,60,-82,-16,-23,-85,39],[97,15,-73,96,16,-36,-86],[-92,-63,-65,-39,-49,6,-49],[76,-51,-22,40,-41,31,-55],[82,77,66,33,23,-18,33],[59,-93,60,8,-46,63,68],[-79,-2,-87,39,64,43,-31],[-47,-66,-20,33,96,93,56],[-33,95,5,-64,46,6,35],[36,42,-16,-74,-31,-35,-98],[-72,0,31,99,17,-78,20],[44,-6,25,-65,-78,22,-22],[-78,-87,-41,-93,80,55,82],[30,36,-14,12,75,-15,-99],[-1,-91,-96,76,63,-81,-7],[55,-85,96,33,-47,-46,-15],[43,4,-66,-61,19,-69,-8],[80,-80,-78,-26,-95,-43,53],[77,63,-25,-8,-15,-12,-35],[-33,63,-60,95,-37,5,56],[39,44,-2,-68,-67,-8,-6],[-60,-69,-32,70,-64,74,-92],[-93,32,89,29,-15,4,-64],[48,4,83,-24,-80,88,44],[0,94,-89,-61,20,27,-5],[-4,30,47,-14,-6,91,-69]]; b=[-2067,3471,2388,-17794,-2134,-513,4380,6231,-5418,8120,-83,6001,-476,4636,-13969,7006,15789,-526,3056,552,7945,13233,2032,-9574,5293,-1824,-12995,3358,5986,952]; c=[-31,21,-61,47,-51,83,-46]; x=[47.6473,-67.7310,-28.2061,-88.8288,21.5071,20.1191,16.6860]; x1=numeric.LP(A,b,c); numeric.round(numeric.mul(100,numeric.sub(x,x1)));
t( [0         , 0         , 0         , 0         , 0         , 0         , 0          ])
</pre>
 */
/**
 * Minimizes dot(c,x) subject to dot(A,x) <= b.
 * 
 * @example
> numeric.LP([[1,0],[-1,0],[0,1],[0,-1]],[1,1,1,1],[1,2],10);
t([-1,-1])
> numeric.LP([[1]],[1],[1])
Error: simplex: minimum is -Infinity
> numeric.LP([[1],[-1]],[1,-2],[1])
Error: simplex: no feasible solution
 */
function LP(A,b,c,maxit) {

    function simplex(A,b,c,basis,maxiter) {
        A = M(R(t(A))); b = V(R(t(b))); c = V(R(t(c))); basis = V(R(t(basis)));
        var count,i,j,k,m=A.s[0],n=A.s[1],foo, all = run(m), idx, z = rep(m-1,0);
        if(m!== b.s[0] || n !== c.s[0]) { throw new Error("simplex: internal error"); }
        // Pricing out
        for(k=0;k<basis.x.length;k++) {
            j = basis.x[k];
            c = sub(c,mul(c(j),A(k,null)));
            c(j,0);
        }
        for(count=0;count<maxiter;count++) {
            for(j=0;j<n;j++) { if(c(j).x[0]>0) break; }
            if(j === n) {
                return {A:A, b:b, c:c, basis:basis}; 
            }
            k = -1;
            foo = Infinity;
            for(i=0;i<m;i++) {
                if(A(i,j).x[0] > 0 && b(i).x[0]/A(i,j).x[0] < foo) {
                    k = i;
                    foo = b(i).x[0]/A(i,j).x[0];
                }
            }
            if(foo === Infinity) { throw new Error("simplex: minimum is -Infinity"); }
            i = k;
            basis(i,j);
            b(i,div(b(i),A(i,j)));
            A(i,null,div(A(i,null),A(i,j)));
            idx = setDiff(all,[i]);
            b(idx,sub(b(idx),mul(A(idx,j),b(i))));
            for(k=0;k<m;k++) {
                if(k===i) { continue; }
                A(k,null,sub(A(k,null),mul(A(i,null),A(k,j))));
                A(k,j,0);
            }
            c = sub(c,mul(c(j),A(i,null)));
            c(j,0);
        }
        throw new Error("simplex: maximum iteration count reached");
    }

    function solution(sol) {
        var b = sol.b, basis = sol.basis;
        var n = sol.A.s[1], ret = rep(n,0);
        ret(basis,b);
        return ret;
    }

    function phase1(A,b,maxiter) {
        A = M(R(t(A))); b = V(R(t(b)));
        var i,m = A.s[0],n=A.s[1];
        for(i=0;i<m;i++) {
            if(b(i).x[0] < 0) { A(i,null,neg(A(i,null))); b(i,neg(b(i))); }
        }
        var A0 = block([1,2],A,diag(rep(A.s[0],1)));
        var c = block([2],rep(n,0),rep(m,-1));
        var foo = simplex(A0,b,c,run(n,n+m),maxiter,run(n,m+n));
        return {A:foo.A(null,run(n)), b:foo.b, basis:foo.basis};
    }

    function simplex1(A,b,c,maxiter) {
        A = M(R(t(A))); b = V(R(t(b))); c = V(R(t(c)));
        var foo = phase1(A,b,maxiter);
        if(sup(foo.basis).x[0] >= A.s[1]) { throw new Error("simplex: no feasible solution"); }
        foo = simplex(foo.A,foo.b,c,foo.basis,maxiter);
        return solution(foo);
    }

    A = M(R(t(A))); b = V(R(t(b))); c = V(R(t(c)));
    if(typeof maxit === "undefined") { maxit = 10000; }
    var m = A.s[0], n = A.s[1], i;
    if(m!==b.s[0] || n!==c.s[0]) { throw new Error("LP: A,b,c must have matching sizes"); }
    var A0 = block([1,3],A,neg(A),diag(rep(m,1)));
    var c0 = block([3],neg(c),c,rep(m,0));
    var foo = simplex1(A0,b,c0,maxit);
    return sub(foo(run(0,n)),foo(run(n,2*n)));
}
my.LP = LP;


