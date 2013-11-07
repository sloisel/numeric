numeric.ConjugateGradient = function ConjugateGradient(A, b, maxIters, residue) {
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
		
        while( !converged && iters < maxIters ) {
            var rDotr = dot(r, r);
            var Ap = mv(A, p);
            var pAp = dot(p, Ap);
            var alpha = rDotr / pAp;

            x = axpy(alpha, p, x);
            r = axpy(-alpha, Ap, r);

            var rDotr_new = dot(r, r);

            if( rDotr_new < residue ) {
                converged = true;
                break;
            }

            var beta = rDotr_new / rDotr;
            p = axpy(beta, p, r);

            iters++;
        }

        //console.log('converged in ' + iters + ' iterations');

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