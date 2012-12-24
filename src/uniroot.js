/**
 * Searches the interval from <tt>lowerLimit</tt> to <tt>upperLimit</tt>
 * for a root (i.e., zero) of the function <tt>func</tt> with respect to
 * its first argument using Brent's method root-finding algorithm.
 *
 * @param {function} function for which the root is sought.
 * @param {number} the lower point of the interval to be searched.
 * @param {number} the upper point of the interval to be searched.
 * @param {number} the desired accuracy (convergence tolerance).
 * @param {number} the maximum number of iterations.
 * @returns an estimate for the root within accuracy.
 */
// Translated from zeroin.c in http://www.netlib.org/c/brent.shar.
function uniroot ( func, lowerLimit, upperLimit, errorTol, maxIter ) {
  var a = lowerLimit
    , b = upperLimit
    , c = a
    , fa = func(a)
    , fb = func(b)
    , fc = fa
    , s = 0
    , fs = 0
    , tol_act   // Actual tolerance
    , new_step  // Step at this iteration
    , prev_step // Distance from the last but one to the last approximation
    , p         // Interpolation step is calculated in the form p/q; division is delayed until the last moment
    , q
    ;

  errorTol = errorTol || 0;
  maxIter  = maxIter  || 1000;

  while ( maxIter-- > 0 ) {

    prev_step = b - a;

    if ( Math.abs(fc) < Math.abs(fb) ) {
      // Swap data for b to be the best approximation
      a = b, b = c, c = a;
      fa = fb, fb = fc, fc = fa;
    }

    tol_act = 1e-15 * Math.abs(b) + errorTol / 2;
    new_step = ( c - b ) / 2;

    if ( Math.abs(new_step) <= tol_act || fb === 0 ) {
      return b; // Acceptable approx. is found
    }

    // Decide if the interpolation can be tried
    if ( Math.abs(prev_step) >= tol_act && Math.abs(fa) > Math.abs(fb) ) {
      // If prev_step was large enough and was in true direction, Interpolatiom may be tried
      var t1, cb, t2;
      cb = c - b;
      if ( a === c ) { // If we have only two distinct points linear interpolation can only be applied
        t1 = fb / fa;
        p = cb * t1;
        q = 1.0 - t1;
      }
      else { // Quadric inverse interpolation
        q = fa / fc, t1 = fb / fc, t2 = fb / fa;
        p = t2 * (cb * q * (q - t1) - (b - a) * (t1 - 1));
        q = (q - 1) * (t1 - 1) * (t2 - 1);
      }

      if ( p > 0 ) {
        q = -q;  // p was calculated with the opposite sign; make p positive
      }
      else {
        p = -p;  // and assign possible minus to q
      }

      if ( p < ( 0.75 * cb * q - Math.abs( tol_act * q ) / 2 ) &&
           p < Math.abs( prev_step * q / 2 ) ) {
        // If (b + p / q) falls in [b,c] and isn't too large it is accepted
        new_step = p / q;
      }

      // If p/q is too large then the bissection procedure can reduce [b,c] range to more extent
    }

    if ( Math.abs( new_step ) < tol_act ) { // Adjust the step to be not less than tolerance
      new_step = ( new_step > 0 ) ? tol_act : -tol_act;
    }

    a = b, fa = fb;     // Save the previous approx.
    b += new_step, fb = func(b);  // Do step to a new approxim.

    if ( (fb > 0 && fc > 0) || (fb < 0 && fc < 0) ) {
      c = a, fc = fa; // Adjust c for it to have a sign opposite to that of b
    }
  }

}


/*
var test_counter;
function f1 (x) { test_counter++; return (Math.pow(x,2)-1)*x - 5; }
function f2 (x) { test_counter++; return Math.cos(x)-x; }
function f3 (x) { test_counter++; return Math.sin(x)-x; }
function f4 (x) { test_counter++; return (x + 3) * Math.pow(x - 1, 2); }
[
  [f1, 2, 3],
  [f2, 2, 3],
  [f2, -1, 3],
  [f3, -1, 3],
  [f4, -4, 4/3]
].forEach(function (args) {
  test_counter = 0;
  var root = uniroot.apply( pv, args );
  ;;;console.log( 'uniroot:', args.slice(1), root, test_counter );
})
*/
