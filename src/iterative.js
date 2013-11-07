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
		var s;
		
		var bnorm = dot(b, b);
		
        while( !converged && iters < maxIters ) {
            var rDotr = dot(rhat, r);
			
            if( (rDotr / bnorm) <= residue ) {
                converged = true;
                break;
            }
			
            var v = mv(A, p);
            var alpha = rDotr / dot(rhat, v);
			s = axpy(-alpha, v, r);
			
			var t = mv(A, s);	
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
		
        while( !converged && iters < maxIters ) {
            var rDotr = dot(r, r);
			
            if( (rDotr / bnorm) <= residue ) {
                converged = true;
                break;
            }			
			
            var Ap = mv(A, p);
            var pAp = dot(p, Ap);
            var alpha = rDotr / pAp;

            x = axpy(alpha, p, x);
            r = axpy(-alpha, Ap, r);

            var rDotr_new = dot(r, r);
            var beta = rDotr_new / rDotr;
            p = axpy(beta, p, r);

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