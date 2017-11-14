// newton.js
// Author: Kai Zhang 5/5/2013
//
// a javascript implementation of Newton solver, which is ported from GSL (GNU Scientific Library) 's globally convergent Newton method (gsl-1.15\multiroots\gnewton.c)
// 
// input:             F --- the nonlinear equations system. This should be a function that returns an array representing the equations evaluation result for givien (x)
// input:             A --- the Jacobian matrix. This should be a function that returns a two dimensional array representing the equations system's Jacobian matrix for given (x)
// input and output:  x --- the equation system's variables array
//

numeric.newtonSolve = function (F, A, x) {

    // ---- sub functions to support the main iteration algorithm ------

    
    // do one step of newton iteration
    //
    this.newton_iterate = function(F, A, x) {
        var funcs = F(x);
        var jacobian = A(x);

        var phi0 = this.evaluate_Euclidean_norm_of_residual(funcs);

        var dx;
        if (jacobian.length == x.length) {          // square matrix, well constrained system
            dx = numeric.solve(jacobian, funcs);
        }
        else if (jacobian.length < x.length) {      // flat rectangle matrix, under constrained system
            var jt = numeric.transpose(jacobian);
            var jjt = numeric.dot(jacobian, jt);
            var invJJt = numeric.inv(jjt);
            var pseudoInv = numeric.dot(jt, invJJt);
            dx = numeric.dot(pseudoInv, funcs);
        }
        else {                                      // tall rectangle matrix, over constrained system
            var jt = numeric.transpose(jacobian);
            var jtj = numeric.dot(jt, j);
            var invJtJ = numeric.inv(jtj);
            var pseudoInv = numeric.dot(invJtJ, jt);
            dx = numeric.dot(pseudoInv, funcs);
        }        

        var t = 1;

        // we require this step really reduce the Euclidean norm of the residual
        //
        for (; ;) {
            var x_new = this.getNewVariableValue(x, dx, t);
            var funcs_new = F(x_new);
            var phi1 = this.evaluate_Euclidean_norm_of_residual(funcs_new);

            if (phi1 > phi0 && t > epsilon) {
                var theta = phi1 / phi0;
                var u = (Math.sqrt(1.0 + 6.0 * theta) - 1.0) / (3.0 * theta);
                t *= u;
            }
            else {
                this.copyVariables(x, x_new);
                break;
            }
        }
    }

    // add -dx to x to get the new variables
    //
    this.getNewVariableValue = function (x, dx, t) {
        var x_new = new Array(x.length);
        var i = 0;
        for (i = 0; i < x.length; i++) {
            x_new[i] = x[i] - t*dx[i];
        }
        
        return x_new;
    }

    // copy x_new to x
    //
    this.copyVariables = function (x, x_new) {
        var i = 0;
        for (i = 0; i < x.length; i++) {
            x[i] = x_new[i]
        }
    }

    // evaluate the function value's residual
    //
    this.evaluate_residual = function (funcsVal) {
        var i;
        var residual = 0;
        for (i = 0; i < funcsVal.length; i++) {
            residual += Math.abs(funcsVal[i]);
        }
        return residual;
    }

    // evaluate the Euclidean_norm_of_residual
    //
    this.evaluate_Euclidean_norm_of_residual  = function (funcsVal) {
        var i;
        var residual2 = 0;
        for (i = 0; i < funcsVal.length; i++) {
            var fabs = Math.abs(funcsVal[i]);
            residual2 += fabs*fabs;
        }
        return Math.sqrt(residual2);
    }
    
    // main function start here
    //    
    var residual_tol = 1e-7;
    var max_iteration = 1000;
    var epsilon = 2.22e-16;
    var JS_GSL_SUCCESS = 0;
    var JS_GSL_CONTINUE = 1;

    // evaluate none linear system of equations and its jacobian matrix
    //
    var funcs = F(x);
    var jacobian = A(x);

    // iterate to get the solution
    //
    var iter = 0;
    var status;
    do {
        iter++;

        this.newton_iterate(F, A, x);

        if (this.evaluate_residual(F(x)) < residual_tol)
            status = JS_GSL_SUCCESS;
        else
            status = JS_GSL_CONTINUE;
        
    } while (status == JS_GSL_CONTINUE && iter < max_iteration)

}

/* unit test

Rosenbrock Function 

  double y0 = 1 - x0;
  double y1 = 10 * (x1 - x0 * x0);

  x0 = -1.2
  x1 = 1.0

*/


