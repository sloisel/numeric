// CCS matrix mul dense vector
numeric.ccsMV = numeric.ccsMV || function ccsMV(A, x) {
	var Ai = A[0], Aj = A[1], Av = A[2];
	var sA = numeric.ccsDim(A);
	var m = sA[0], n = sA[1];
	var L = x.length;
	var ret = numeric.rep([L],0);
	if( n !== L ) throw 'Matrix dimension does not match input vector.';
	var i, j, k, j0, j1;
	var ri, val;
	for(k=0;k!==n;k++) {
		j0 = Ai[k];
		j1 = Ai[k+1];
		for(j=j0;j<j1;j++) {
			ri = Aj[j];
			val = Av[j];
			ret[ri] += x[k] * val;
		}
	}
	return ret;
}

numeric.bicgstab = function bicgstab(A, b, maxIters, residue) {
	var maxIters = maxIters || 1024;
	var residue = residue || 1e-6;
	
	var BiCG = function( A, b, dotVV, dotMV ) {
		// initialization
        var iters = 0;
        var converged = false;
        var rows = b.length;

		var dot = dotVV;
		var mv = dotMV;
		var add = numeric.add;
		var mul = numeric.mul;
		var axpy = function(alpha, x, y) {
			return add(mul(x, alpha), y);
		};
		
		// initialize x
        var x = numeric.rep([rows], 0);

        // r = b - A x
        // x is zero initially
        var r = mul(b, 1);
		var rhat = mul(b, 1);
        var rho = 1, alpha = 1, w = 1;
		var p = mul(b, 1);
		var v = numeric.rep([rows], 0);
		var s, t, alpha, beta;
		
		var bnorm = dot(b, b);
		
        while( !converged && iters < maxIters ) {
            var rDotr = dot(rhat, r);
			
            if( Math.abs(rDotr / bnorm) <= residue ) {
                converged = true;
                break;
            }
			
            v = mv(A, p);
            var alpha = rDotr / dot(rhat, v);
			s = axpy(-alpha, v, r);
			
			t = mv(A, s);	
			w = dot(t, s) / dot(t, t);

            x = axpy(w, s, axpy(alpha, p, x));
            r = axpy(-w, t, s);

            var beta = dot(rhat, r) / rDotr * (alpha/w);
            p = axpy(beta, axpy(-w, v, p), r);

            iters++;
        }

		if( converged )
			console.log('converged in ' + iters + ' iterations');
		else
			console.log('not converged in ' + iters + ' iterations');

        return x;
	}

	switch(A.format) {
	case 'full': {	
		return BiCG(A, b, numeric.dot, numeric.dot);
	}
	case 'ccs': {
		return BiCG(A, b, numeric.dot, numeric.ccsMV);
	}
	case 'crs': {
		return BiCG(A, b, numeric.dot, numeric.cdotMV);
	}
	default: {
		throw 'Not supported matrix format';
	}
	}	
}

numeric.cg = function cg(A, b, maxIters, residue) {
	var maxIters = maxIters || 1024;
	var residue = residue || 1e-6;
	
	var CG = function( A, b, dotVV, dotMV ) {
		// initialization
        var iters = 0;
        var converged = false;
        var rows = b.length;

		var dot = dotVV;
		var mv = dotMV;
		var add = numeric.add;
		var mul = numeric.mul;
		var axpy = function(alpha, x, y) {
			return add(mul(x, alpha), y);
		};
		
		// initialize x
        var x = numeric.rep([rows], 0);

        // r = b - A x
        // x is zero initially
        var r = mul(b, 1);
        var p = mul(b, 1);
		
		var bnorm = dot(b, b);
		var rho = bnorm;
		var flag = 1;
		var Ap, pAp, alpha, beta, rho_new;
        while( !converged && iters < maxIters ) {		
            if( Math.abs(rho / bnorm) <= residue ) {
                converged = true;
                break;
            }
			
            Ap = mv(A, p);
            pAp = dot(p, Ap);
            alpha = rho / pAp;

            x = axpy(alpha, p, x);
            r = axpy(-alpha, Ap, r);

            rho_new = dot(r, r);
            beta = rho_new / rho;
            p = axpy(beta, p, r);
			rho = rho_new;
            iters++;
        }

		if( converged )
			console.log('converged in ' + iters + ' iterations');
		else
			console.log('not converged in ' + iters + ' iterations');

        return x;
	}

	switch(A.format) {
	case 'full': {	
		return CG(A, b, numeric.dot, numeric.dot);
	}
	case 'ccs': {
		return CG(A, b, numeric.dot, numeric.ccsMV);
	}
	case 'crs': {
		return CG(A, b, numeric.dot, numeric.cdotMV);
	}
	default: {
		throw 'Not supported matrix format';
	}
	}	
};