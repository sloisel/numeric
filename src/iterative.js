// CCS matrix mul dense vector
//
// numeric.ccsMV is defined in src/numeric.js


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
            alpha = rDotr / dot(rhat, v);
			s = axpy(-alpha, v, r);
			
			t = mv(A, s);	
			w = dot(t, s) / dot(t, t);

            x = axpy(w, s, axpy(alpha, p, x));
            r = axpy(-w, t, s);

            beta = dot(rhat, r) / rDotr * (alpha/w);
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

numeric.sor = function sor(A, b, relax, maxIters, residue) {
	var maxIters = maxIters || 1024;
	var residue = residue || 1e-6;
	var relax = relax || 1.0;		// no relaxation by default, fall back to Gauss-Seidel
	
	var sor_full = function(A, b) {
		// initialization
        var iters = 0;
        var converged = false;
        var rows = b.length;
		
		var sA = numeric.dim(A);
		var n = sA[0], m = sA[1];
		if( n != rows ) {
			throw 'Matrix dimension does not match input vector.';
		}
		
		// initialize x
        var x = numeric.rep([rows], 0);
		var dot = numeric.dot;
		var bnorm = dot(b, b);
		var rowsum = 0;
		var i, j;
		var Ai;
		var rowdiff;
		var res = numeric.rep([rows], 0), r2;
		
		while(!converged && iters < maxIters) {
			for(i=0;i<n;i++) {
				Ai = A[i];
				rowsum = 0;
				for(j=0;j<i;j++) {
					rowsum += Ai[j] * x[j];
				}
				
				for(j=i+1;j<m;j++) {
					rowsum += Ai[j] * x[j];					
				}
				
				rowdiff = b[i] - rowsum;
				res[i] += (rowdiff - x[i] * Ai[i]);
				x[i] = (1-relax) * x[i] + relax / Ai[i] * rowdiff;
			}
			
			iters++;
			// check convergence
			r2 = dot(res, res);
			converged = ((r2 / bnorm) < residue);
		}
		
		if( converged )
			console.log('converged in ' + iters + ' iterations');
		else
			console.log('not converged in ' + iters + ' iterations');
			
		return x;
	}
	
	var sor_ccs = function(A, b) {
		// initialization
        var iters = 0;
        var converged = false;
        var rows = b.length;
		
		var Ai = A[0], Aj = A[1], Av = A[2];
		var sA = numeric.ccsDim(A);
		var m = sA[0], n = sA[1];
		
		if( m !== rows )
			throw 'Matrix dimension does not match input vector.';
		
		var rep = numeric.rep;
		var dot = numeric.dot;
		var rowsum = rep([rows], 0);
		var r = rep([rows], 0);
		var i, j, k, j0, j1;
		var bnorm = dot(b, b);

		// initialize x
        var x = rep([rows], 0);
		
		// find out diagonal
		var Aii = rep([rows], 0);
		for(k=0;k!==n;k++) {
			j0 = Ai[k];
			j1 = Ai[k+1];
			for(j=j0;j<j1;j++) {
				ri = Aj[j];
				if( ri == k ) {
					Aii[k] = Av[j];
					break;
				}
			}
		}
			
		while( !converged && iters < maxIters ) {
			// collect row sum
			for(k=0;k!==n;k++) {
				j0 = Ai[k];
				j1 = Ai[k+1];
				for(j=j0;j<j1;j++) {
					ri = Aj[j];
					val = Av[j];
					rowsum[ri] += x[k] * val;
				}
			}
			
			// subtract diagonal elements from row sum and update x
			for(i=0;i<m;i++) {
				r[i] = b[i] - rowsum[i];
				x[i] = (1-relax) * x[i] + relax / Aii[i] * (r[i] + x[i] * Aii[i]);
				rowsum[i] = 0;
			}
		
			iters++;			
			r2 = dot(r, r);
			converged = (r2/bnorm <= residue);
		}
		
		if( converged )
			console.log('converged in ' + iters + ' iterations');
		else
			console.log('not converged in ' + iters + ' iterations');
			
		return x;
	}
	
	var sor_crs = function(A, b) {
		// initialization
        var iters = 0;
        var converged = false;
        var rows = b.length;
		
		var Ai = A[0], Aj = A[1], Av = A[2];
		var nelems = Ai.length;
		var n = numeric.sup(Aj) + 1;
		var m = numeric.sup(Ai) + 1;
		if( m !== rows )
			throw 'Matrix dimension does not match input vector.';
		
		var rep = numeric.rep;
		var dot = numeric.dot;
		var rowsum = rep([rows], 0);
		var r = rep([rows], 0);
		var i, j, k;
		var bnorm = dot(b, b);

		// initialize x
        var x = rep([rows], 0);
		
		// find out diagonal
		var Aii = rep([rows], 0);
		for(k=0;k!==nelems;k++) {
			i = Ai[k];
			j = Aj[k];
			if( i == j ) {
				Aii[i] = Av[k];
			}
		}
			
		while( !converged && iters < maxIters ) {
			// collect row sum
			for(k=0;k!==nelems;k++) {
				i = Ai[k];
				j = Aj[k];
				rowsum[i] += Av[k] * x[j];
			}
			
			// subtract diagonal elements from row sum and update x
			for(i=0;i<m;i++) {
				r[i] = b[i] - rowsum[i];
				x[i] = (1-relax) * x[i] + relax / Aii[i] * (r[i] + x[i] * Aii[i]);
				rowsum[i] = 0;
			}
		
			iters++;			
			r2 = dot(r, r);
			converged = (r2/bnorm <= residue);
		}
		
		if( converged )
			console.log('converged in ' + iters + ' iterations');
		else
			console.log('not converged in ' + iters + ' iterations');
			
		return x;
	}

	switch(A.format) {
	case 'full': {	
		return sor_full(A, b);
	}
	case 'ccs': {
		return sor_ccs(A, b);
	}
	case 'crs': {
		return sor_crs(A, b);
	}
	default: {
		throw 'Not supported matrix format';
	}
	}	

};
