

/**
 * @fileOverview 
 * @author <a href="http://www.ma.hw.ac.uk/~loisel/">Sébastien Loisel</a>
 *
 * @description
 * The <tt>numeric.js</tt> file contains the {@link numeric} module and the Tensor
 * class.<br><br>
 */

/*
<pre>
> numeric.t([1,2,3,4])(2)
t(3)
> numeric.t([10,11,12,13,14,15,16,17,18,19])([3,4,3,5,3,3,1])
t([13,14,13,15,13,13,11])
> numeric.t([1,2,3])(null)
t([1,2,3])
> numeric.t([[1,2,3],[4,5,6]],[[7,8,9],[10,11,12]])(1,2);
t(6,12)
> numeric.t([[[1,2],[3,4]],[[5,6],[7,8]]])(1,0,1);
t(6)
> numeric.t([[1,2],[3,4]])(null,1)
t([2,4])
</pre>
 */

/*
<pre>
> z = numeric.t([5,6,7,8,9]);
t([5,6,7,8,9])
> numeric.set(z,2,14);
t([5,6,14,8,9])
> numeric.set(z,[1,2,4],[0,0,0]);
t([5,0,0,8,0])
> numeric.set(z,[1,2,3],numeric.t([1,2,3],[4,5,6]));
t([5,1,2,3,0],[0,4,5,6,0])
> numeric.set(z,[0,1],[12,13]);
t([12,13,2,3,0],[0,0,5,6,0])
> z = numeric.t(3);
t(3)
> numeric.set(z,8)
t(8)
> numeric.set(z,numeric.t(1,2))
t(1,2)
> numeric.set(z,3)
t(3)
> z = numeric.t([[1,2,3,4],[5,6,7,8],[9,10,11,12]])
t([[1,2,3,4],[5,6,7,8],[9,10,11,12]])
> numeric.set(z,1,1,-12)
t([[1,2,3,4],[5,-12,7,8],[9,10,11,12]])
> numeric.set(z,[0,1],[2,3],[[20,21],[22,23]])
t([[1,2,20,21],[5,-12,22,23],[9,10,11,12]])
> z = numeric.t([[[1,2],[3,4]],[[5,6],[7,8]]])
t([[[1,2],[3,4]],[[5,6],[7,8]]])
> numeric.set(z,1,([0,1]),0,([11,12]))
t([[[1,2],[3,4]],[[11,6],[12,8]]])
</pre>
 */

/** @name numeric 
 *  @namespace Numerical analysis in javascript.
 *  @author <a href="http://www.ma.hw.ac.uk/~loisel/">Sébastien Loisel</a>
 *  @description The <tt>numeric.js</tt> file contains the {@link numeric} module and the Tensor
 * ``class'' for numerical analysis in javascript.<br><br>
 *
 * <b>Setting up.</b> In order to use {@link numeric} and the Tensor object, you have to 
 * set up your Javascript environment. If you are writing a script that will run on the web in a browser,
 * you need to include
 * the <tt>numeric.js</tt> file by adding something like <tt>&lt;script src="/path/to/numeric.js"&gt;&lt;/script&gt;</tt>
 * to the head of your HTML document.<br><br>
 * 
 * <b>Minimal complete example.</b> This is the ``Hello, world!'' of <tt>numeric.js</tt> in the browser.
 * Proceed as follows:
 * <ol>
 * <li> Create a directory to hold the html page. I will use the directory <tt>~/example</tt>. In Windows,
 * you might use <tt>c:\example</tt>.
 * <li> Put the file <tt>numeric.js</tt> into the <tt>~/example</tt> directory, you now have the file
 * <tt>~/example/numeric.js</tt>.
 * <li> Create a new text file <tt>~/example/index.html</tt> and paste the following into it:<br>
<div style="margin-left: 50px"><tt>
      &lt;html&gt;<br>
      &lt;head&gt;<br>
      &lt;script src="numeric.js"&gt;&lt;/script&gt;<br>
      &lt;body&gt;<br>
      Here is a matrix:&lt;br&gt;<br>
      &lt;pre&gt;<br>
      &lt;script&gt;<br>
      x = [[1,2],[3,4]];<br>
      y = [[0,1],[1,0]];<br>
      z = numeric.add(1,numeric.mul(0.5,x,numeric.exp(y)));<br>
      document.write(numeric.prettyPrint(z));<br>
      &lt;/script&gt;<br>
      &lt;/pre&gt;<br>
</tt></div>
 * <li> Using your browser, open the file <tt>~/example/index.html</tt>. You will see a short message
 * and a 2x2 matrix.
 * </ol>
 * 
 * <b>Using <tt>numeric.js</tt> outside the browser.</b> The numeric module can also be used outside
 * of the browser. I use <a href="http://www.nodejs.org">node.js</a> to run browserless javascript,
 * there are other methods as well. In this way I can use javascript as a general purpose programming
 * language (no web programming at all). For example, I have written a node.js script that runs a
 * unit testing suite on all my code whenever I save my code to disk.
 * The other situation where you may want to run javascript outside
 * the browser is if you are running web server (or some other kind of server) which can be scripted
 * on the server using javascript.<br><br>
 * 
 * In order to use <tt>numeric.js</tt> from node.js, I need to do
 * <tt>numeric = require('/path/to/numeric.js')</tt> at the beginning of my script.<br><br>
 * 
 * <i>Remark: node.js currently has <a href="https://groups.google.com/group/nodejs-dev/browse_thread/thread/c4a9c68fac75088f">a known feature/bug</a> that prevents the numeric module from working correctly from the
 * REPL. However, <tt>numeric.js</tt> works normally from regular scripts.</i><br><br>
 * 
 * <b>Tensors.</b> Tensor objects contain three fields: the size <tt>s</tt>,
 * the real part <tt>x</tt> and the optional imaginary part <tt>y</tt>. In many cases, you will not access
 * or manipulate the <tt>s</tt>, <tt>x</tt>, <tt>y</tt> fields directly but instead you should write
 * ``vectorized'' programs that operate on entire tensors at once without
 * writing explicit loops.<br><br>
 * 
 * <b>Constructing tensors.</b> The normal way of constructing a tensor is to use the
 * {@link numeric.t}() function, as follows:
 * <pre>
> numeric.t([[1,2],[3,4]],[[5,6],[7,8]])
t([[1,2],
   [3,4]],
  [[5,6],
   [7,8]])
</pre>
 *
 * The above example creates an order-2 tensor (a matrix) whose entries are the complex numbers
 * 1+5i, 2+6i, 3+7i and 4+8i in entries (0,0), (0,1), (1,0) and (1,1) respectively. Note
 * that indexing of tensor starts at 0 whereas in typical mathematics, indexing of vectors, matrices,
 * etc... starts at 1. This makes the Tensor object consistent with the usual notions of Arrays
 * in Javascript.<br><br>
 * 
 * <b>Implicit construction of tensors.</b> Most functions in the {@link numeric} module will
 * automatically construct tensors from Array and Number parameters. For example:
<pre>
> numeric.add(1,[2,3])
t([3,4])
> numeric.add(numeric.t(1),numeric.t([2,3]))
t([3,4])
</pre>
 * The first of the two commands does not use the {@link numeric.t}() constructor explicitly, but the
 * {@link numeric.add}() method automatically builds the tensors on its own. The second command is
 * equivalent with explicit calls to {@link numeric.t}().<br><br>
 * 
 * <b>Complex numbers.</b> Complex numbers are fully supported.
 * You may want to use the constructor {@link numeric.t}() to build complex tensors, but you can also
 * use the imaginary unit <tt>numeric.i</tt>:
<pre>
> numeric.i
t(0,1)
> numeric.mul(numeric.i,numeric.i)
t(-1,0)
</pre>
 * It is slightly more efficient to explicitly use the {@link numeric.t}() constructor instead of using
 * <tt>numeric.i</tt> and arithmetic operations. Therefore, the first of the following two lines is
 * slightly more efficient:
<pre>
> numeric.t([1,2,3],[4,5,6])
t([1,2,3],[4,5,6])
> numeric.add([1,2,3],numeric.mul(numeric.i,[4,5,6]))
t([1,2,3],[4,5,6])
</pre>
 * The two commands give equivalent results, but the former is slightly more efficient.<br><br>
 * 
 * <b>"Shortcuts".</b> You can also create "shortcuts" to avoid typing very long things.
<pre>
> num = numeric; num.t([1,2])
t([1,2])
> t = num.t; t([3,4])
t([3,4])
</pre>
 * 
 * <b>Manipulating tensors.</b> The Tensor object can be manipulated in ``vectorized'' style.
 * The following example shows
 * how to perform arithmetic on vectors.
<pre>
> x = numeric.t([1,2,3,4,5]);
t( [1         , 2         , 3         , 4         , 5          ])
> y = numeric.t([3,1,4,1,5]);
t( [3         , 1         , 4         , 1         , 5          ])
> z = numeric.t([1,-1,1,-1,1]);
t( [1         , -1        , 1         , -1        , 1          ])
> w = numeric.add(1,x,numeric.exp(numeric.mul(0.5,y,z)));
t( [6.482     , 3.607     , 11.39     , 5.607     , 18.18      ])
</pre>
 *
 * <b>Accessing entries of vectors.</b> Tensor objects are actually Function objects and you can call
 * this function to read entries of the tensor, as follows:
<pre>
> numeric.t([3,1,4,1,5])(2)
t(4)
</pre>
 * 
 * <b>Accessing entries of matrices and tensors.</b> Matrices can be accessed in a similar manner. If
 * <tt>x</tt> is a matrix then its entries are given by <tt>x(i,j)</tt>. Higher order tensors are
 * similar.<br><br>
 * 
 * <b>Accessing a block of a tensor.</b> You can also extract a block from a tensor as follows:
<pre>
> x = numeric.t([[1,2,3,4,5],[6,7,8,9,10],[11,12,13,14,15],[16,17,18,19,20]]);
t( [ [1         , 2         , 3         , 4         , 5          ], 
     [6         , 7         , 8         , 9         , 10         ], 
     [11        , 12        , 13        , 14        , 15         ], 
     [16        , 17        , 18        , 19        , 20         ] ])
> x([1,2],[0,2,3]);
t( [ [6         , 8         , 9          ], 
     [11        , 13        , 14         ] ])
</pre>
 * In this case, we took a 2x3 submatrix of the 4x5 matrix x. Note that the rows and columns
 * that are extracted need not be consecutive.<br><br>
 * 
 * <b>Pretty printing.</b> The function {@link numeric.prettyPrint}() returns a pretty-printed
 * version of any input tensor. The pretty-printed version is easier to read and more concise
 *  than the ``raw'' version
 * that one gets from a javascript console. For example, the tensor <tt>numeric.t(3)</tt> would
 * print as <tt>{ [Function: $0] s: [], x: [ 3 ] }</tt> at the console, but {@link numeric.prettyPrint}
 * returns <tt>t(3)</tt> instead. The prettyPrint function can also print with a varying number of
 * digits, using the {@link numeric.digits}() function. By default, {@link numeric.prettyPrint}()
 * prints using 4 digits.<br><br>
 * 
 * <b>Accessing <tt>T.s, T.x, T.y</tt>.</b> Although many tasks can be accomplished without accessing
 * the fields of the tensor objects, some tasks are best accomplished by reading and writing directly from the
 * fields of T. For example, to get the size of a tensor, simply read the <tt>T.s</tt> field.<br><br>
 * 
 * A common reason for accessing the individual entries is if you are implementing a ``pointwise'' function,
 * like the {@link numeric.exp}() function which computes the exponential of all of the entries of a
 * tensor. In this situation, you do not need to know the exact shape of the tensors; it suffices to loop
 * sequenctially through the <tt>x</tt> (and <tt>y</tt> if present) member(s) Arrays of the Tensor
 * object.<br><br>
 * 
 * <b>Error checking.</b> The {@link numeric} module has several safety check to ensure that tensors are always well-formed,
 * etc... For example:
 <pre>
> numeric.t([[1,2],[3,4,5]])
Error: Malformed tensor (mismatched sizes)
 </pre>
 * Because javascript is a highly dynamic language, these sanity checks are not guaranteed to catch
 * all possible problems. You should be particularly careful if you access the <tt>T.s</tt>, <tt>T.x</tt>
 * and <tt>T.y</tt> fields directly that you do not create such malformed tensors. This is because all
 * the error checking is done when the tensor object is initially constructed.<br><br>
 * 
 * When an error is detected, an exception is thrown. If your script is able to handle such
 * problems, you can catch the exception and attempt to recover. If you do not catch the exception
 * but you have some sort of javascript debugging console open, the console will probably tell
 * you that there was an uncaught exception and even give you a traceback to help you find the
 * error. If you run a script in a plain browser without opening a javascript debugging
 * console, any errors will still trigger an exception but any uncaught exception will be silently
 * ignored by the browser. The only symptom you will observe is that your script doesn't work.<br><br>
 * 
 * <b>Tensor types.</b> Tensor objects are callable because they are actually functions and
 * not objects. In order to check that an object x is actually a Tensor, you can use the 
 * {@link isT}() function. The isT(x) function simply checks that 
 * <tt>(x.name === "Tensor")</tt>. Therefore, you could make
 * an object that masquerades as a Tensor by wrapping it in a Function named "Tensor".<br><br>
 * 
 * <b>Mutability</b>. Tensor objects are mutable:
<pre>
> z = numeric.t([1,2])
t([1,2])
> w = z
t([1,2])
> w(0,9)      // Sets w(0) to 9
t([9,2])
> z           // also changed since w = z
t([9,2])
</pre>
 * The fields <tt>s</tt>, <tt>x</tt>, <tt>y</tt> can likewise be ``shared'' between multiple tensors.
 * This is particularly likely for the <tt>s</tt> field:
<pre>
> z = numeric.t([0,1])
t([0,1])
> w = numeric.exp(z)
t([1,2.718])
> z.s[0] = 2; z.s[1] = 1; z
t([[0],[1]])
> w
t([[1],[2.718]])
</pre>
 * In the example above, the shape of <tt>t</tt> was modified by directly modifying the <tt>z.s</tt>
 * field. However, the <tt>w.s</tt> field ``points'' to the same underlying memory, and hence the shape
 * of w has also changed.<br><br>
 * 
 * Changing the field <tt>s</tt> directly is discouraged. The length of <tt>x</tt> and/or <tt>y</tt>
 * must stay synchronized with the size <tt>s</tt>. Moreover, changing the length of the s field
 * will break the tensor since the Tensor() function is optimized for vectors and matrices differently.<br><br>
 * 
 * The deprecated function <tt>set()</tt> can also be used to mutate tensors.<br><br>
 * 
 * <b>Purity.</b> In order to avoid inadvertently modifying unrelated tensors, most of the functions
 * in the {@link numeric} module are ``pure'': they do not modify the fields of their inputs in any
 * way and they do not have other side-effects.<br><br>
 * 
 * A few functions are not pure. The Tensor() function can be used to mutate entries of the Tensor.
 * The {@link numeric.digits}() function alters the way in which {@link prettyPrint}() works.
 *
 * @property {T} i The imaginary unit.
 * @property {Number} epsilon The smallest number such that 1+epsilon > 1.
 */

/*
<pre>
> delete global.num; delete global.t; delete global.z; delete global.w;
true
</pre>
 */

/**
 * @name workshop
 * @namespace The workshop namespace contains some extra functions that can be used
 * when {@link numeric} is being used within the Javascript Workshop REPL.
 */

/**
 * @memberOf workshop
 * @name print
 * @function
 * @description Print to the REPL.
 * @param {String} [html] The optional string to print. If this optional parameter is present,
 * it is printed to the REPL output field. If the REPL output field already contains something,
 * it is overwritten with the new output. If the optional <tt>html</tt> parameter is omitted,
 * the current output field is left as-is.
 * @returns {String} The contents of the output field in the REPL.
 */

/** @exports numeric */
( function(my) {
    "use strict";

/**#@+
 * @memberOf numeric
 */
function expo(f) { exports[f.name?f.name:f.functionName] = f; }

