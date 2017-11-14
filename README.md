This is a fork of Numeric Javascript by Sébastien Loisel.

Changes
------

Notable changes compared with numeric-1.2.6.js

- numeric.jacobi(A, maxiter), that diagonalizes symmetric real matrices (real hermitian). No problems with repeated eigenvalues/symmetry.

- numeric.eigh(A, maxiter), mirrors numeric.jacobi.

- numeric.jacobinorm(A), helper for numeric.jacobi, computes the weight in the upper triangular part of a square matrix.

- extra iterative solvers:

  + numeric.ccsMV(A, x), CCS matrix mul dense vector helper

  + numeric.bicgstab(A, b, maxIters, residue), BICGSTAB algorithm

  + numeric.cg(A, b, maxIters, residue), conjugate gradient (CG) solver. Supports both full matrix and sparse matrix.

  + numeric.sor(A, b, relax, maxIters, residue), SOR solver. The performance of the SOR solver is not as good as CG and BiCGSTAB, but similar to ccsLUPSolve. In practice, CG and BiCGSTAB should always be the best options.

  + numeric.newtonSolve(F, A, x), Newton solver. Ported from GSL(GNU Scientific Library)'s globally convergent Newton method (gsl-1.15\multiroots\gnewton.c). This Newton solver has been successfully used to implement a simple geometric constraint solver in project Rena (https://github.com/kaige/Rena).

  + numeric.uniroot(func, lowerLimit, upperLimit, errorTol, maxIter), search the interval from <tt>lowerLimit</tt> to <tt>upperLimit</tt> for a root (i.e., zero) of the function <tt>func</tt> with respect to its first argument using Brent's method root-finding algorithm.

- numeric.logspace(), another fill routine akin to numeric.linspace() but now for logarithmic space fills.

- numeric.zeros(), numeric.ones(), numeric.empty(), numeric.range(): methods to fill a vector or Array with fixed values.

- numeric.roll(), numeric.flip(), numeric.fliplr(), numeric.flipud(), numeric.rot90(): methods to flip/rotate Arrays (matrices).

- numeric.kron(x, y), Kronecker's method applied to a matrix.

- numeric.ccsDiag(diag), numeric.ccsTranspose(A): numeric.ccsScatter helpers

- numeric.pi, numeric.e: high precision math constants

- CSV I/O bugfixes



Introduction
------

Numeric Javascript is a javascript library for doing numerical
analysis in the browser. Because Numeric Javascript uses only the
javascript programming language, it works in many browsers and does
not require powerful servers.

Numeric Javascript is for building "web 2.0" apps that can perform
complex calculations in the browser and thus avoid the latency of
asking a server to compute something. Indeed, you do not need a
powerful server (or any server at all) since your web app will perform
all its calculations in the client.

The original website, see http://www.numericjs.com/
Discussion forum: http://groups.google.com/group/numericjs

License
-------

Numeric Javascript is copyright by Sébastien Loisel and is distributed
under the MIT license. Details are found in the license.txt file.

Dependencies
------------

There are no dependencies for numeric.js.

Subdirectories
--------------

Here are some of the subdirectories and their contents:

* / holds the html/php files for the workshop/web site, license.txt, README, etc...

* /src holds the source files. The .js files are concatenated together to produce lib/numeric.js

* /lib holds numeric.js and numeric-min.js. These files aren't checked into the git tree because
they are created from the files in the /src subdirectory.

* /resources holds some small images, css files, etc...

* /tools contains build/test scripts. If you're going to patch or otherwise make tweaks to numeric,
you will need to use the /tools/build.sh script. There are also a bunch of scripts to deploy to
the numericjs.com web site, which you probably won't need.

Building and testing
--------------------

If you tweak the code, you can build and test the library by running the script /tools/build.sh.
