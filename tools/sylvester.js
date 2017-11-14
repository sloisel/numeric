/*

packages:
  sylvester:
    - sylvester
    - vector
    - matrix
    - line
    - line.segment
    - plane
    - polygon
    - polygon.vertex
    - linkedlist
    - exports

*/

(function() {



var Sylvester = {
  precision: 1e-6
};

Sylvester.Vector = function() {};

Sylvester.Vector.create = function(elements) {
  var V = new Sylvester.Vector();
  return V.setElements(elements);
};
var $V = Sylvester.Vector.create;

Sylvester.Vector.Random = function(n) {
  var elements = [];
  while (n--) { elements.push(Math.random()); }
  return Sylvester.Vector.create(elements);
};

Sylvester.Vector.Zero = function(n) {
  var elements = [];
  while (n--) { elements.push(0); }
  return Sylvester.Vector.create(elements);
};

Sylvester.Vector.prototype = {
  e: function(i) {
    return (i < 1 || i > this.elements.length) ? null : this.elements[i-1];
  },

  dimensions: function() {
    return this.elements.length;
  },

  modulus: function() {
    return Math.sqrt(this.dot(this));
  },

  eql: function(vector) {
    var n = this.elements.length;
    var V = vector.elements || vector;
    if (n !== V.length) { return false; }
    while (n--) {
      if (Math.abs(this.elements[n] - V[n]) > Sylvester.precision) { return false; }
    }
    return true;
  },

  dup: function() {
    return Sylvester.Vector.create(this.elements);
  },

  map: function(fn, context) {
    var elements = [];
    this.each(function(x, i) {
      elements.push(fn.call(context, x, i));
    });
    return Sylvester.Vector.create(elements);
  },

  forEach: function(fn, context) {
    var n = this.elements.length;
    for (var i = 0; i < n; i++) {
      fn.call(context, this.elements[i], i+1);
    }
  },

  toUnitVector: function() {
    var r = this.modulus();
    if (r === 0) { return this.dup(); }
    return this.map(function(x) { return x/r; });
  },

  angleFrom: function(vector) {
    var V = vector.elements || vector;
    var n = this.elements.length, k = n, i;
    if (n !== V.length) { return null; }
    var dot = 0, mod1 = 0, mod2 = 0;
    // Work things out in parallel to save time
    this.each(function(x, i) {
      dot += x * V[i-1];
      mod1 += x * x;
      mod2 += V[i-1] * V[i-1];
    });
    mod1 = Math.sqrt(mod1); mod2 = Math.sqrt(mod2);
    if (mod1*mod2 === 0) { return null; }
    var theta = dot / (mod1*mod2);
    if (theta < -1) { theta = -1; }
    if (theta > 1) { theta = 1; }
    return Math.acos(theta);
  },

  isParallelTo: function(vector) {
    var angle = this.angleFrom(vector);
    return (angle === null) ? null : (angle <= Sylvester.precision);
  },

  isAntiparallelTo: function(vector) {
    var angle = this.angleFrom(vector);
    return (angle === null) ? null : (Math.abs(angle - Math.PI) <= Sylvester.precision);
  },

  isPerpendicularTo: function(vector) {
    var dot = this.dot(vector);
    return (dot === null) ? null : (Math.abs(dot) <= Sylvester.precision);
  },

  add: function(vector) {
    var V = vector.elements || vector;
    if (this.elements.length !== V.length) { return null; }
    return this.map(function(x, i) { return x + V[i-1]; });
  },

  subtract: function(vector) {
    var V = vector.elements || vector;
    if (this.elements.length !== V.length) { return null; }
    return this.map(function(x, i) { return x - V[i-1]; });
  },

  multiply: function(k) {
    return this.map(function(x) { return x*k; });
  },

  dot: function(vector) {
    var V = vector.elements || vector;
    var i, product = 0, n = this.elements.length;
    if (n !== V.length) { return null; }
    while (n--) { product += this.elements[n] * V[n]; }
    return product;
  },

  cross: function(vector) {
    var B = vector.elements || vector;
    if (this.elements.length !== 3 || B.length !== 3) { return null; }
    var A = this.elements;
    return Sylvester.Vector.create([
      (A[1] * B[2]) - (A[2] * B[1]),
      (A[2] * B[0]) - (A[0] * B[2]),
      (A[0] * B[1]) - (A[1] * B[0])
    ]);
  },

  max: function() {
    var m = 0, i = this.elements.length;
    while (i--) {
      if (Math.abs(this.elements[i]) > Math.abs(m)) { m = this.elements[i]; }
    }
    return m;
  },

  indexOf: function(x) {
    var index = null, n = this.elements.length;
    for (var i = 0; i < n; i++) {
      if (index === null && this.elements[i] === x) {
        index = i + 1;
      }
    }
    return index;
  },

  toDiagonalMatrix: function() {
    return Sylvester.Matrix.Diagonal(this.elements);
  },

  round: function() {
    return this.map(function(x) { return Math.round(x); });
  },

  snapTo: function(x) {
    return this.map(function(y) {
      return (Math.abs(y - x) <= Sylvester.precision) ? x : y;
    });
  },

  distanceFrom: function(obj) {
    if (obj.anchor || (obj.start && obj.end)) { return obj.distanceFrom(this); }
    var V = obj.elements || obj;
    if (V.length !== this.elements.length) { return null; }
    var sum = 0, part;
    this.each(function(x, i) {
      part = x - V[i-1];
      sum += part * part;
    });
    return Math.sqrt(sum);
  },

  liesOn: function(line) {
    return line.contains(this);
  },

  liesIn: function(plane) {
    return plane.contains(this);
  },

  rotate: function(t, obj) {
    var V, R = null, x, y, z;
    if (t.determinant) { R = t.elements; }
    switch (this.elements.length) {
      case 2:
        V = obj.elements || obj;
        if (V.length !== 2) { return null; }
        if (!R) { R = Sylvester.Matrix.Rotation(t).elements; }
        x = this.elements[0] - V[0];
        y = this.elements[1] - V[1];
        return Sylvester.Vector.create([
          V[0] + R[0][0] * x + R[0][1] * y,
          V[1] + R[1][0] * x + R[1][1] * y
        ]);
        break;
      case 3:
        if (!obj.direction) { return null; }
        var C = obj.pointClosestTo(this).elements;
        if (!R) { R = Sylvester.Matrix.Rotation(t, obj.direction).elements; }
        x = this.elements[0] - C[0];
        y = this.elements[1] - C[1];
        z = this.elements[2] - C[2];
        return Sylvester.Vector.create([
          C[0] + R[0][0] * x + R[0][1] * y + R[0][2] * z,
          C[1] + R[1][0] * x + R[1][1] * y + R[1][2] * z,
          C[2] + R[2][0] * x + R[2][1] * y + R[2][2] * z
        ]);
        break;
      default:
        return null;
    }
  },

  reflectionIn: function(obj) {
    if (obj.anchor) {
      // obj is a plane or line
      var P = this.elements.slice();
      var C = obj.pointClosestTo(P).elements;
      return Sylvester.Vector.create([C[0] + (C[0] - P[0]), C[1] + (C[1] - P[1]), C[2] + (C[2] - (P[2] || 0))]);
    } else {
      // obj is a point
      var Q = obj.elements || obj;
      if (this.elements.length !== Q.length) { return null; }
      return this.map(function(x, i) { return Q[i-1] + (Q[i-1] - x); });
    }
  },

  to3D: function() {
    var V = this.dup();
    switch (V.elements.length) {
      case 3: break;
      case 2: V.elements.push(0); break;
      default: return null;
    }
    return V;
  },

  inspect: function() {
    return '[' + this.elements.join(', ') + ']';
  },

  setElements: function(els) {
    this.elements = (els.elements || els).slice();
    return this;
  }
};

Sylvester.Vector.prototype.x = Sylvester.Vector.prototype.multiply;
Sylvester.Vector.prototype.each = Sylvester.Vector.prototype.forEach;

Sylvester.Vector.i = Sylvester.Vector.create([1,0,0]);
Sylvester.Vector.j = Sylvester.Vector.create([0,1,0]);
Sylvester.Vector.k = Sylvester.Vector.create([0,0,1]);

Sylvester.Matrix = function() {};

Sylvester.Matrix.create = function(elements) {
  var M = new Sylvester.Matrix();
  return M.setElements(elements);
};
var $M = Sylvester.Matrix.create;

Sylvester.Matrix.I = function(n) {
  var els = [], i = n, j;
  while (i--) { j = n;
    els[i] = [];
    while (j--) {
      els[i][j] = (i === j) ? 1 : 0;
    }
  }
  return Sylvester.Matrix.create(els);
};

Sylvester.Matrix.Diagonal = function(elements) {
  var i = elements.length;
  var M = Sylvester.Matrix.I(i);
  while (i--) {
    M.elements[i][i] = elements[i];
  }
  return M;
};

Sylvester.Matrix.Rotation = function(theta, a) {
  if (!a) {
    return Sylvester.Matrix.create([
      [Math.cos(theta),  -Math.sin(theta)],
      [Math.sin(theta),   Math.cos(theta)]
    ]);
  }
  var axis = a.dup();
  if (axis.elements.length !== 3) { return null; }
  var mod = axis.modulus();
  var x = axis.elements[0]/mod, y = axis.elements[1]/mod, z = axis.elements[2]/mod;
  var s = Math.sin(theta), c = Math.cos(theta), t = 1 - c;
  // Formula derived here: http://www.gamedev.net/reference/articles/article1199.asp
  // That proof rotates the co-ordinate system so theta becomes -theta and sin
  // becomes -sin here.
  return Sylvester.Matrix.create([
    [ t*x*x + c, t*x*y - s*z, t*x*z + s*y ],
    [ t*x*y + s*z, t*y*y + c, t*y*z - s*x ],
    [ t*x*z - s*y, t*y*z + s*x, t*z*z + c ]
  ]);
};

Sylvester.Matrix.RotationX = function(t) {
  var c = Math.cos(t), s = Math.sin(t);
  return Sylvester.Matrix.create([
    [  1,  0,  0 ],
    [  0,  c, -s ],
    [  0,  s,  c ]
  ]);
};
Sylvester.Matrix.RotationY = function(t) {
  var c = Math.cos(t), s = Math.sin(t);
  return Sylvester.Matrix.create([
    [  c,  0,  s ],
    [  0,  1,  0 ],
    [ -s,  0,  c ]
  ]);
};
Sylvester.Matrix.RotationZ = function(t) {
  var c = Math.cos(t), s = Math.sin(t);
  return Sylvester.Matrix.create([
    [  c, -s,  0 ],
    [  s,  c,  0 ],
    [  0,  0,  1 ]
  ]);
};

Sylvester.Matrix.Random = function(n, m) {
  return Sylvester.Matrix.Zero(n, m).map(
    function() { return Math.random(); }
  );
};

Sylvester.Matrix.Zero = function(n, m) {
  var els = [], i = n, j;
  while (i--) { j = m;
    els[i] = [];
    while (j--) {
      els[i][j] = 0;
    }
  }
  return Sylvester.Matrix.create(els);
};

Sylvester.Matrix.prototype = {
  e: function(i,j) {
    if (i < 1 || i > this.elements.length || j < 1 || j > this.elements[0].length) { return null; }
    return this.elements[i-1][j-1];
  },

  row: function(i) {
    if (i > this.elements.length) { return null; }
    return Sylvester.Vector.create(this.elements[i-1]);
  },

  col: function(j) {
    if (this.elements.length === 0) { return null; }
    if (j > this.elements[0].length) { return null; }
    var col = [], n = this.elements.length;
    for (var i = 0; i < n; i++) { col.push(this.elements[i][j-1]); }
    return Sylvester.Vector.create(col);
  },

  dimensions: function() {
    var cols = (this.elements.length === 0) ? 0 : this.elements[0].length;
    return {rows: this.elements.length, cols: cols};
  },

  rows: function() {
    return this.elements.length;
  },

  cols: function() {
    if (this.elements.length === 0) { return 0; }
    return this.elements[0].length;
  },

  eql: function(matrix) {
    var M = matrix.elements || matrix;
    if (!M[0] || typeof(M[0][0]) === 'undefined') { M = Sylvester.Matrix.create(M).elements; }
    if (this.elements.length === 0 || M.length === 0) {
      return this.elements.length === M.length;
    }
    if (this.elements.length !== M.length) { return false; }
    if (this.elements[0].length !== M[0].length) { return false; }
    var i = this.elements.length, nj = this.elements[0].length, j;
    while (i--) { j = nj;
      while (j--) {
        if (Math.abs(this.elements[i][j] - M[i][j]) > Sylvester.precision) { return false; }
      }
    }
    return true;
  },

  dup: function() {
    return Sylvester.Matrix.create(this.elements);
  },

  map: function(fn, context) {
    if (this.elements.length === 0) { return Sylvester.Matrix.create([]); }
    var els = [], i = this.elements.length, nj = this.elements[0].length, j;
    while (i--) { j = nj;
      els[i] = [];
      while (j--) {
        els[i][j] = fn.call(context, this.elements[i][j], i + 1, j + 1);
      }
    }
    return Sylvester.Matrix.create(els);
  },

  isSameSizeAs: function(matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) === 'undefined') { M = Sylvester.Matrix.create(M).elements; }
    if (this.elements.length === 0) { return M.length === 0; }
    return (this.elements.length === M.length &&
        this.elements[0].length === M[0].length);
  },

  add: function(matrix) {
    if (this.elements.length === 0) return this.map(function(x) { return x });
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) === 'undefined') { M = Sylvester.Matrix.create(M).elements; }
    if (!this.isSameSizeAs(M)) { return null; }
    return this.map(function(x, i, j) { return x + M[i-1][j-1]; });
  },

  subtract: function(matrix) {
    if (this.elements.length === 0) return this.map(function(x) { return x });
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) === 'undefined') { M = Sylvester.Matrix.create(M).elements; }
    if (!this.isSameSizeAs(M)) { return null; }
    return this.map(function(x, i, j) { return x - M[i-1][j-1]; });
  },

  canMultiplyFromLeft: function(matrix) {
    if (this.elements.length === 0) { return false; }
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) === 'undefined') { M = Sylvester.Matrix.create(M).elements; }
    // this.columns should equal matrix.rows
    return (this.elements[0].length === M.length);
  },

  multiply: function(matrix) {
    if (this.elements.length === 0) { return null; }
    if (!matrix.elements) {
      return this.map(function(x) { return x * matrix; });
    }
    var returnVector = matrix.modulus ? true : false;
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) === 'undefined') { M = Sylvester.Matrix.create(M).elements; }
    if (!this.canMultiplyFromLeft(M)) { return null; }
    var i = this.elements.length, nj = M[0].length, j;
    var cols = this.elements[0].length, c, elements = [], sum;
    while (i--) { j = nj;
      elements[i] = [];
      while (j--) { c = cols;
        sum = 0;
        while (c--) {
          sum += this.elements[i][c] * M[c][j];
        }
        elements[i][j] = sum;
      }
    }
    var M = Sylvester.Matrix.create(elements);
    return returnVector ? M.col(1) : M;
  },

  minor: function(a, b, c, d) {
    if (this.elements.length === 0) { return null; }
    var elements = [], ni = c, i, nj, j;
    var rows = this.elements.length, cols = this.elements[0].length;
    while (ni--) { i = c - ni - 1;
      elements[i] = [];
      nj = d;
      while (nj--) { j = d - nj - 1;
        elements[i][j] = this.elements[(a+i-1)%rows][(b+j-1)%cols];
      }
    }
    return Sylvester.Matrix.create(elements);
  },

  transpose: function() {
    if (this.elements.length === 0) return Sylvester.Matrix.create([]);
    var rows = this.elements.length, i, cols = this.elements[0].length, j;
    var elements = [], i = cols;
    while (i--) { j = rows;
      elements[i] = [];
      while (j--) {
        elements[i][j] = this.elements[j][i];
      }
    }
    return Sylvester.Matrix.create(elements);
  },

  isSquare: function() {
    var cols = (this.elements.length === 0) ? 0 : this.elements[0].length;
    return (this.elements.length === cols);
  },

  max: function() {
    if (this.elements.length === 0) { return null; }
    var m = 0, i = this.elements.length, nj = this.elements[0].length, j;
    while (i--) { j = nj;
      while (j--) {
        if (Math.abs(this.elements[i][j]) > Math.abs(m)) { m = this.elements[i][j]; }
      }
    }
    return m;
  },

  indexOf: function(x) {
    if (this.elements.length === 0) { return null; }
    var index = null, ni = this.elements.length, i, nj = this.elements[0].length, j;
    for (i = 0; i < ni; i++) {
      for (j = 0; j < nj; j++) {
        if (this.elements[i][j] === x) { return {i: i+1, j: j+1}; }
      }
    }
    return null;
  },

  diagonal: function() {
    if (!this.isSquare) { return null; }
    var els = [], n = this.elements.length;
    for (var i = 0; i < n; i++) {
      els.push(this.elements[i][i]);
    }
    return Sylvester.Vector.create(els);
  },

  toRightTriangular: function() {
    if (this.elements.length === 0) return Sylvester.Matrix.create([]);
    var M = this.dup(), els;
    var n = this.elements.length, i, j, np = this.elements[0].length, p;
    for (i = 0; i < n; i++) {
      if (M.elements[i][i] === 0) {
        for (j = i + 1; j < n; j++) {
          if (M.elements[j][i] !== 0) {
            els = [];
            for (p = 0; p < np; p++) { els.push(M.elements[i][p] + M.elements[j][p]); }
            M.elements[i] = els;
            break;
          }
        }
      }
      if (M.elements[i][i] !== 0) {
        for (j = i + 1; j < n; j++) {
          var multiplier = M.elements[j][i] / M.elements[i][i];
          els = [];
          for (p = 0; p < np; p++) {
            // Elements with column numbers up to an including the number of the
            // row that we're subtracting can safely be set straight to zero,
            // since that's the point of this routine and it avoids having to
            // loop over and correct rounding errors later
            els.push(p <= i ? 0 : M.elements[j][p] - M.elements[i][p] * multiplier);
          }
          M.elements[j] = els;
        }
      }
    }
    return M;
  },

  determinant: function() {
    if (this.elements.length === 0) { return 1; }
    if (!this.isSquare()) { return null; }
    var M = this.toRightTriangular();
    var det = M.elements[0][0], n = M.elements.length;
    for (var i = 1; i < n; i++) {
      det = det * M.elements[i][i];
    }
    return det;
  },

  isSingular: function() {
    return (this.isSquare() && this.determinant() === 0);
  },

  trace: function() {
    if (this.elements.length === 0) { return 0; }
    if (!this.isSquare()) { return null; }
    var tr = this.elements[0][0], n = this.elements.length;
    for (var i = 1; i < n; i++) {
      tr += this.elements[i][i];
    }
    return tr;
  },

  rank: function() {
    if (this.elements.length === 0) { return 0; }
    var M = this.toRightTriangular(), rank = 0;
    var i = this.elements.length, nj = this.elements[0].length, j;
    while (i--) { j = nj;
      while (j--) {
        if (Math.abs(M.elements[i][j]) > Sylvester.precision) { rank++; break; }
      }
    }
    return rank;
  },

  augment: function(matrix) {
    if (this.elements.length === 0) { return this.dup(); }
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) === 'undefined') { M = Sylvester.Matrix.create(M).elements; }
    var T = this.dup(), cols = T.elements[0].length;
    var i = T.elements.length, nj = M[0].length, j;
    if (i !== M.length) { return null; }
    while (i--) { j = nj;
      while (j--) {
        T.elements[i][cols + j] = M[i][j];
      }
    }
    return T;
  },

  inverse: function() {
    if (this.elements.length === 0) { return null; }
    if (!this.isSquare() || this.isSingular()) { return null; }
    var n = this.elements.length, i= n, j;
    var M = this.augment(Sylvester.Matrix.I(n)).toRightTriangular();
    var np = M.elements[0].length, p, els, divisor;
    var inverse_elements = [], new_element;
    // Sylvester.Matrix is non-singular so there will be no zeros on the
    // diagonal. Cycle through rows from last to first.
    while (i--) {
      // First, normalise diagonal elements to 1
      els = [];
      inverse_elements[i] = [];
      divisor = M.elements[i][i];
      for (p = 0; p < np; p++) {
        new_element = M.elements[i][p] / divisor;
        els.push(new_element);
        // Shuffle off the current row of the right hand side into the results
        // array as it will not be modified by later runs through this loop
        if (p >= n) { inverse_elements[i].push(new_element); }
      }
      M.elements[i] = els;
      // Then, subtract this row from those above it to give the identity matrix
      // on the left hand side
      j = i;
      while (j--) {
        els = [];
        for (p = 0; p < np; p++) {
          els.push(M.elements[j][p] - M.elements[i][p] * M.elements[j][i]);
        }
        M.elements[j] = els;
      }
    }
    return Sylvester.Matrix.create(inverse_elements);
  },

  round: function() {
    return this.map(function(x) { return Math.round(x); });
  },

  snapTo: function(x) {
    return this.map(function(p) {
      return (Math.abs(p - x) <= Sylvester.precision) ? x : p;
    });
  },

  inspect: function() {
    var matrix_rows = [];
    var n = this.elements.length;
    if (n === 0) return '[]';
    for (var i = 0; i < n; i++) {
      matrix_rows.push(Sylvester.Vector.create(this.elements[i]).inspect());
    }
    return matrix_rows.join('\n');
  },

  setElements: function(els) {
    var i, j, elements = els.elements || els;
    if (elements[0] && typeof(elements[0][0]) !== 'undefined') {
      i = elements.length;
      this.elements = [];
      while (i--) { j = elements[i].length;
        this.elements[i] = [];
        while (j--) {
          this.elements[i][j] = elements[i][j];
        }
      }
      return this;
    }
    var n = elements.length;
    this.elements = [];
    for (i = 0; i < n; i++) {
      this.elements.push([elements[i]]);
    }
    return this;
  }
};

Sylvester.Matrix.prototype.toUpperTriangular = Sylvester.Matrix.prototype.toRightTriangular;
Sylvester.Matrix.prototype.det = Sylvester.Matrix.prototype.determinant;
Sylvester.Matrix.prototype.tr = Sylvester.Matrix.prototype.trace;
Sylvester.Matrix.prototype.rk = Sylvester.Matrix.prototype.rank;
Sylvester.Matrix.prototype.inv = Sylvester.Matrix.prototype.inverse;
Sylvester.Matrix.prototype.x = Sylvester.Matrix.prototype.multiply;

Sylvester.Line = function() {};

Sylvester.Line.prototype = {
  eql: function(line) {
    return (this.isParallelTo(line) && this.contains(line.anchor));
  },

  dup: function() {
    return Sylvester.Line.create(this.anchor, this.direction);
  },

  translate: function(vector) {
    var V = vector.elements || vector;
    return Sylvester.Line.create([
      this.anchor.elements[0] + V[0],
      this.anchor.elements[1] + V[1],
      this.anchor.elements[2] + (V[2] || 0)
    ], this.direction);
  },

  isParallelTo: function(obj) {
    if (obj.normal || (obj.start && obj.end)) { return obj.isParallelTo(this); }
    var theta = this.direction.angleFrom(obj.direction);
    return (Math.abs(theta) <= Sylvester.precision || Math.abs(theta - Math.PI) <= Sylvester.precision);
  },

  distanceFrom: function(obj) {
    if (obj.normal || (obj.start && obj.end)) { return obj.distanceFrom(this); }
    if (obj.direction) {
      // obj is a line
      if (this.isParallelTo(obj)) { return this.distanceFrom(obj.anchor); }
      var N = this.direction.cross(obj.direction).toUnitVector().elements;
      var A = this.anchor.elements, B = obj.anchor.elements;
      return Math.abs((A[0] - B[0]) * N[0] + (A[1] - B[1]) * N[1] + (A[2] - B[2]) * N[2]);
    } else {
      // obj is a point
      var P = obj.elements || obj;
      var A = this.anchor.elements, D = this.direction.elements;
      var PA1 = P[0] - A[0], PA2 = P[1] - A[1], PA3 = (P[2] || 0) - A[2];
      var modPA = Math.sqrt(PA1*PA1 + PA2*PA2 + PA3*PA3);
      if (modPA === 0) return 0;
      // Assumes direction vector is normalized
      var cosTheta = (PA1 * D[0] + PA2 * D[1] + PA3 * D[2]) / modPA;
      var sin2 = 1 - cosTheta*cosTheta;
      return Math.abs(modPA * Math.sqrt(sin2 < 0 ? 0 : sin2));
    }
  },

  contains: function(obj) {
    if (obj.start && obj.end) { return this.contains(obj.start) && this.contains(obj.end); }
    var dist = this.distanceFrom(obj);
    return (dist !== null && dist <= Sylvester.precision);
  },

  positionOf: function(point) {
    if (!this.contains(point)) { return null; }
    var P = point.elements || point;
    var A = this.anchor.elements, D = this.direction.elements;
    return (P[0] - A[0]) * D[0] + (P[1] - A[1]) * D[1] + ((P[2] || 0) - A[2]) * D[2];
  },

  liesIn: function(plane) {
    return plane.contains(this);
  },

  intersects: function(obj) {
    if (obj.normal) { return obj.intersects(this); }
    return (!this.isParallelTo(obj) && this.distanceFrom(obj) <= Sylvester.precision);
  },

  intersectionWith: function(obj) {
    if (obj.normal || (obj.start && obj.end)) { return obj.intersectionWith(this); }
    if (!this.intersects(obj)) { return null; }
    var P = this.anchor.elements, X = this.direction.elements,
        Q = obj.anchor.elements, Y = obj.direction.elements;
    var X1 = X[0], X2 = X[1], X3 = X[2], Y1 = Y[0], Y2 = Y[1], Y3 = Y[2];
    var PsubQ1 = P[0] - Q[0], PsubQ2 = P[1] - Q[1], PsubQ3 = P[2] - Q[2];
    var XdotQsubP = - X1*PsubQ1 - X2*PsubQ2 - X3*PsubQ3;
    var YdotPsubQ = Y1*PsubQ1 + Y2*PsubQ2 + Y3*PsubQ3;
    var XdotX = X1*X1 + X2*X2 + X3*X3;
    var YdotY = Y1*Y1 + Y2*Y2 + Y3*Y3;
    var XdotY = X1*Y1 + X2*Y2 + X3*Y3;
    var k = (XdotQsubP * YdotY / XdotX + XdotY * YdotPsubQ) / (YdotY - XdotY * XdotY);
    return Sylvester.Vector.create([P[0] + k*X1, P[1] + k*X2, P[2] + k*X3]);
  },

  pointClosestTo: function(obj) {
    if (obj.start && obj.end) {
      // obj is a line segment
      var P = obj.pointClosestTo(this);
      return (P === null) ? null : this.pointClosestTo(P);
    } else if (obj.direction) {
      // obj is a line
      if (this.intersects(obj)) { return this.intersectionWith(obj); }
      if (this.isParallelTo(obj)) { return null; }
      var D = this.direction.elements, E = obj.direction.elements;
      var D1 = D[0], D2 = D[1], D3 = D[2], E1 = E[0], E2 = E[1], E3 = E[2];
      // Create plane containing obj and the shared normal and intersect this
      // with it Thank you:
      // http://www.cgafaq.info/wiki/Sylvester.Line-line_distance
      var x = (D3 * E1 - D1 * E3), y = (D1 * E2 - D2 * E1), z = (D2 * E3 - D3 * E2);
      var N = [x * E3 - y * E2, y * E1 - z * E3, z * E2 - x * E1];
      var P = Sylvester.Plane.create(obj.anchor, N);
      return P.intersectionWith(this);
    } else {
      // obj is a point
      var P = obj.elements || obj;
      if (this.contains(P)) { return Sylvester.Vector.create(P); }
      var A = this.anchor.elements, D = this.direction.elements;
      var D1 = D[0], D2 = D[1], D3 = D[2], A1 = A[0], A2 = A[1], A3 = A[2];
      var x = D1 * (P[1]-A2) - D2 * (P[0]-A1), y = D2 * ((P[2] || 0) - A3) - D3 * (P[1]-A2),
          z = D3 * (P[0]-A1) - D1 * ((P[2] || 0) - A3);
      var V = Sylvester.Vector.create([D2 * x - D3 * z, D3 * y - D1 * x, D1 * z - D2 * y]);
      var k = this.distanceFrom(P) / V.modulus();
      return Sylvester.Vector.create([
        P[0] + V.elements[0] * k,
        P[1] + V.elements[1] * k,
        (P[2] || 0) + V.elements[2] * k
      ]);
    }
  },

  // Returns a copy of the line rotated by t radians about the given line. Works
  // by finding the argument's closest point to this line's anchor point (call
  // this C) and rotating the anchor about C. Also rotates the line's direction
  // about the argument's. Be careful with this - the rotation axis' direction
  // affects the outcome!
  rotate: function(t, line) {
    // If we're working in 2D
    if (typeof(line.direction) === 'undefined') { line = Sylvester.Line.create(line.to3D(), Sylvester.Vector.k); }
    var R = Sylvester.Matrix.Rotation(t, line.direction).elements;
    var C = line.pointClosestTo(this.anchor).elements;
    var A = this.anchor.elements, D = this.direction.elements;
    var C1 = C[0], C2 = C[1], C3 = C[2], A1 = A[0], A2 = A[1], A3 = A[2];
    var x = A1 - C1, y = A2 - C2, z = A3 - C3;
    return Sylvester.Line.create([
      C1 + R[0][0] * x + R[0][1] * y + R[0][2] * z,
      C2 + R[1][0] * x + R[1][1] * y + R[1][2] * z,
      C3 + R[2][0] * x + R[2][1] * y + R[2][2] * z
    ], [
      R[0][0] * D[0] + R[0][1] * D[1] + R[0][2] * D[2],
      R[1][0] * D[0] + R[1][1] * D[1] + R[1][2] * D[2],
      R[2][0] * D[0] + R[2][1] * D[1] + R[2][2] * D[2]
    ]);
  },

  reverse: function() {
    return Sylvester.Line.create(this.anchor, this.direction.x(-1));
  },

  reflectionIn: function(obj) {
    if (obj.normal) {
      // obj is a plane
      var A = this.anchor.elements, D = this.direction.elements;
      var A1 = A[0], A2 = A[1], A3 = A[2], D1 = D[0], D2 = D[1], D3 = D[2];
      var newA = this.anchor.reflectionIn(obj).elements;
      // Add the line's direction vector to its anchor, then mirror that in the plane
      var AD1 = A1 + D1, AD2 = A2 + D2, AD3 = A3 + D3;
      var Q = obj.pointClosestTo([AD1, AD2, AD3]).elements;
      var newD = [Q[0] + (Q[0] - AD1) - newA[0], Q[1] + (Q[1] - AD2) - newA[1], Q[2] + (Q[2] - AD3) - newA[2]];
      return Sylvester.Line.create(newA, newD);
    } else if (obj.direction) {
      // obj is a line - reflection obtained by rotating PI radians about obj
      return this.rotate(Math.PI, obj);
    } else {
      // obj is a point - just reflect the line's anchor in it
      var P = obj.elements || obj;
      return Sylvester.Line.create(this.anchor.reflectionIn([P[0], P[1], (P[2] || 0)]), this.direction);
    }
  },

  setVectors: function(anchor, direction) {
    // Need to do this so that line's properties are not references to the
    // arguments passed in
    anchor = Sylvester.Vector.create(anchor);
    direction = Sylvester.Vector.create(direction);
    if (anchor.elements.length === 2) {anchor.elements.push(0); }
    if (direction.elements.length === 2) { direction.elements.push(0); }
    if (anchor.elements.length > 3 || direction.elements.length > 3) { return null; }
    var mod = direction.modulus();
    if (mod === 0) { return null; }
    this.anchor = anchor;
    this.direction = Sylvester.Vector.create([
      direction.elements[0] / mod,
      direction.elements[1] / mod,
      direction.elements[2] / mod
    ]);
    return this;
  }
};

Sylvester.Line.create = function(anchor, direction) {
  var L = new Sylvester.Line();
  return L.setVectors(anchor, direction);
};
var $L = Sylvester.Line.create;

Sylvester.Line.X = Sylvester.Line.create(Sylvester.Vector.Zero(3), Sylvester.Vector.i);
Sylvester.Line.Y = Sylvester.Line.create(Sylvester.Vector.Zero(3), Sylvester.Vector.j);
Sylvester.Line.Z = Sylvester.Line.create(Sylvester.Vector.Zero(3), Sylvester.Vector.k);

Sylvester.Line.Segment = function() {};

Sylvester.Line.Segment.prototype = {
  eql: function(segment) {
    return (this.start.eql(segment.start) && this.end.eql(segment.end)) ||
        (this.start.eql(segment.end) && this.end.eql(segment.start));
  },

  dup: function() {
    return Sylvester.Line.Segment.create(this.start, this.end);
  },

  length: function() {
    var A = this.start.elements, B = this.end.elements;
    var C1 = B[0] - A[0], C2 = B[1] - A[1], C3 = B[2] - A[2];
    return Math.sqrt(C1*C1 + C2*C2 + C3*C3);
  },

  toVector: function() {
    var A = this.start.elements, B = this.end.elements;
    return Sylvester.Vector.create([B[0] - A[0], B[1] - A[1], B[2] - A[2]]);
  },

  midpoint: function() {
    var A = this.start.elements, B = this.end.elements;
    return Sylvester.Vector.create([(B[0] + A[0])/2, (B[1] + A[1])/2, (B[2] + A[2])/2]);
  },

  bisectingPlane: function() {
    return Sylvester.Plane.create(this.midpoint(), this.toVector());
  },

  translate: function(vector) {
    var V = vector.elements || vector;
    var S = this.start.elements, E = this.end.elements;
    return Sylvester.Line.Segment.create(
      [S[0] + V[0], S[1] + V[1], S[2] + (V[2] || 0)],
      [E[0] + V[0], E[1] + V[1], E[2] + (V[2] || 0)]
    );
  },

  isParallelTo: function(obj) {
    return this.line.isParallelTo(obj);
  },

  distanceFrom: function(obj) {
    var P = this.pointClosestTo(obj);
    return (P === null) ? null : P.distanceFrom(obj);
  },

  contains: function(obj) {
    if (obj.start && obj.end) { return this.contains(obj.start) && this.contains(obj.end); }
    var P = (obj.elements || obj).slice();
    if (P.length === 2) { P.push(0); }
    if (this.start.eql(P)) { return true; }
    var S = this.start.elements;
    var V = Sylvester.Vector.create([S[0] - P[0], S[1] - P[1], S[2] - (P[2] || 0)]);
    var vect = this.toVector();
    return V.isAntiparallelTo(vect) && V.modulus() <= vect.modulus();
  },

  intersects: function(obj) {
    return (this.intersectionWith(obj) !== null);
  },

  intersectionWith: function(obj) {
    if (!this.line.intersects(obj)) { return null; }
    var P = this.line.intersectionWith(obj);
    return (this.contains(P) ? P : null);
  },

  pointClosestTo: function(obj) {
    if (obj.normal) {
      // obj is a plane
      var V = this.line.intersectionWith(obj);
      if (V === null) { return null; }
      return this.pointClosestTo(V);
    } else {
      // obj is a line (segment) or point
      var P = this.line.pointClosestTo(obj);
      if (P === null) { return null; }
      if (this.contains(P)) { return P; }
      return (this.line.positionOf(P) < 0 ? this.start : this.end).dup();
    }
  },

  setPoints: function(startPoint, endPoint) {
    startPoint = Sylvester.Vector.create(startPoint).to3D();
    endPoint = Sylvester.Vector.create(endPoint).to3D();
    if (startPoint === null || endPoint === null) { return null; }
    this.line = Sylvester.Line.create(startPoint, endPoint.subtract(startPoint));
    this.start = startPoint;
    this.end = endPoint;
    return this;
  }
};

Sylvester.Line.Segment.create = function(v1, v2) {
  var S = new Sylvester.Line.Segment();
  return S.setPoints(v1, v2);
};

Sylvester.Plane = function() {};

Sylvester.Plane.prototype = {
  eql: function(plane) {
    return (this.contains(plane.anchor) && this.isParallelTo(plane));
  },

  dup: function() {
    return Sylvester.Plane.create(this.anchor, this.normal);
  },

  translate: function(vector) {
    var V = vector.elements || vector;
    return Sylvester.Plane.create([
      this.anchor.elements[0] + V[0],
      this.anchor.elements[1] + V[1],
      this.anchor.elements[2] + (V[2] || 0)
    ], this.normal);
  },

  isParallelTo: function(obj) {
    var theta;
    if (obj.normal) {
      // obj is a plane
      theta = this.normal.angleFrom(obj.normal);
      return (Math.abs(theta) <= Sylvester.precision || Math.abs(Math.PI - theta) <= Sylvester.precision);
    } else if (obj.direction) {
      // obj is a line
      return this.normal.isPerpendicularTo(obj.direction);
    }
    return null;
  },

  isPerpendicularTo: function(plane) {
    var theta = this.normal.angleFrom(plane.normal);
    return (Math.abs(Math.PI/2 - theta) <= Sylvester.precision);
  },

  distanceFrom: function(obj) {
    if (this.intersects(obj) || this.contains(obj)) { return 0; }
    if (obj.anchor) {
      // obj is a plane or line
      var A = this.anchor.elements, B = obj.anchor.elements, N = this.normal.elements;
      return Math.abs((A[0] - B[0]) * N[0] + (A[1] - B[1]) * N[1] + (A[2] - B[2]) * N[2]);
    } else {
      // obj is a point
      var P = obj.elements || obj;
      var A = this.anchor.elements, N = this.normal.elements;
      return Math.abs((A[0] - P[0]) * N[0] + (A[1] - P[1]) * N[1] + (A[2] - (P[2] || 0)) * N[2]);
    }
  },

  contains: function(obj) {
    if (obj.normal) { return null; }
    if (obj.direction) {
      return (this.contains(obj.anchor) && this.contains(obj.anchor.add(obj.direction)));
    } else {
      var P = obj.elements || obj;
      var A = this.anchor.elements, N = this.normal.elements;
      var diff = Math.abs(N[0]*(A[0] - P[0]) + N[1]*(A[1] - P[1]) + N[2]*(A[2] - (P[2] || 0)));
      return (diff <= Sylvester.precision);
    }
  },

  intersects: function(obj) {
    if (typeof(obj.direction) === 'undefined' && typeof(obj.normal) === 'undefined') { return null; }
    return !this.isParallelTo(obj);
  },

  intersectionWith: function(obj) {
    if (!this.intersects(obj)) { return null; }
    if (obj.direction) {
      // obj is a line
      var A = obj.anchor.elements, D = obj.direction.elements,
          P = this.anchor.elements, N = this.normal.elements;
      var multiplier = (N[0]*(P[0]-A[0]) + N[1]*(P[1]-A[1]) + N[2]*(P[2]-A[2])) / (N[0]*D[0] + N[1]*D[1] + N[2]*D[2]);
      return Sylvester.Vector.create([A[0] + D[0]*multiplier, A[1] + D[1]*multiplier, A[2] + D[2]*multiplier]);
    } else if (obj.normal) {
      // obj is a plane
      var direction = this.normal.cross(obj.normal).toUnitVector();
      // To find an anchor point, we find one co-ordinate that has a value of
      // zero somewhere on the intersection, and remember which one we picked
      var N = this.normal.elements, A = this.anchor.elements,
          O = obj.normal.elements, B = obj.anchor.elements;
      var solver = Sylvester.Matrix.Zero(2,2), i = 0;
      while (solver.isSingular()) {
        i++;
        solver = Sylvester.Matrix.create([
          [ N[i%3], N[(i+1)%3] ],
          [ O[i%3], O[(i+1)%3]  ]
        ]);
      }
      // Then we solve the simultaneous equations in the remaining dimensions
      var inverse = solver.inverse().elements;
      var x = N[0]*A[0] + N[1]*A[1] + N[2]*A[2];
      var y = O[0]*B[0] + O[1]*B[1] + O[2]*B[2];
      var intersection = [
        inverse[0][0] * x + inverse[0][1] * y,
        inverse[1][0] * x + inverse[1][1] * y
      ];
      var anchor = [];
      for (var j = 1; j <= 3; j++) {
        // This formula picks the right element from intersection by cycling
        // depending on which element we set to zero above
        anchor.push((i === j) ? 0 : intersection[(j + (5 - i)%3)%3]);
      }
      return Sylvester.Line.create(anchor, direction);
    }
  },

  pointClosestTo: function(point) {
    var P = point.elements || point;
    var A = this.anchor.elements, N = this.normal.elements;
    var dot = (A[0] - P[0]) * N[0] + (A[1] - P[1]) * N[1] + (A[2] - (P[2] || 0)) * N[2];
    return Sylvester.Vector.create([P[0] + N[0] * dot, P[1] + N[1] * dot, (P[2] || 0) + N[2] * dot]);
  },

  rotate: function(t, line) {
    var R = t.determinant ? t.elements : Sylvester.Matrix.Rotation(t, line.direction).elements;
    var C = line.pointClosestTo(this.anchor).elements;
    var A = this.anchor.elements, N = this.normal.elements;
    var C1 = C[0], C2 = C[1], C3 = C[2], A1 = A[0], A2 = A[1], A3 = A[2];
    var x = A1 - C1, y = A2 - C2, z = A3 - C3;
    return Sylvester.Plane.create([
      C1 + R[0][0] * x + R[0][1] * y + R[0][2] * z,
      C2 + R[1][0] * x + R[1][1] * y + R[1][2] * z,
      C3 + R[2][0] * x + R[2][1] * y + R[2][2] * z
    ], [
      R[0][0] * N[0] + R[0][1] * N[1] + R[0][2] * N[2],
      R[1][0] * N[0] + R[1][1] * N[1] + R[1][2] * N[2],
      R[2][0] * N[0] + R[2][1] * N[1] + R[2][2] * N[2]
    ]);
  },

  reflectionIn: function(obj) {
    if (obj.normal) {
      // obj is a plane
      var A = this.anchor.elements, N = this.normal.elements;
      var A1 = A[0], A2 = A[1], A3 = A[2], N1 = N[0], N2 = N[1], N3 = N[2];
      var newA = this.anchor.reflectionIn(obj).elements;
      // Add the plane's normal to its anchor, then mirror that in the other plane
      var AN1 = A1 + N1, AN2 = A2 + N2, AN3 = A3 + N3;
      var Q = obj.pointClosestTo([AN1, AN2, AN3]).elements;
      var newN = [Q[0] + (Q[0] - AN1) - newA[0], Q[1] + (Q[1] - AN2) - newA[1], Q[2] + (Q[2] - AN3) - newA[2]];
      return Sylvester.Plane.create(newA, newN);
    } else if (obj.direction) {
      // obj is a line
      return this.rotate(Math.PI, obj);
    } else {
      // obj is a point
      var P = obj.elements || obj;
      return Sylvester.Plane.create(this.anchor.reflectionIn([P[0], P[1], (P[2] || 0)]), this.normal);
    }
  },

  setVectors: function(anchor, v1, v2) {
    anchor = Sylvester.Vector.create(anchor);
    anchor = anchor.to3D(); if (anchor === null) { return null; }
    v1 = Sylvester.Vector.create(v1);
    v1 = v1.to3D(); if (v1 === null) { return null; }
    if (typeof(v2) === 'undefined') {
      v2 = null;
    } else {
      v2 = Sylvester.Vector.create(v2);
      v2 = v2.to3D(); if (v2 === null) { return null; }
    }
    var A1 = anchor.elements[0], A2 = anchor.elements[1], A3 = anchor.elements[2];
    var v11 = v1.elements[0], v12 = v1.elements[1], v13 = v1.elements[2];
    var normal, mod;
    if (v2 !== null) {
      var v21 = v2.elements[0], v22 = v2.elements[1], v23 = v2.elements[2];
      normal = Sylvester.Vector.create([
        (v12 - A2) * (v23 - A3) - (v13 - A3) * (v22 - A2),
        (v13 - A3) * (v21 - A1) - (v11 - A1) * (v23 - A3),
        (v11 - A1) * (v22 - A2) - (v12 - A2) * (v21 - A1)
      ]);
      mod = normal.modulus();
      if (mod === 0) { return null; }
      normal = Sylvester.Vector.create([normal.elements[0] / mod, normal.elements[1] / mod, normal.elements[2] / mod]);
    } else {
      mod = Math.sqrt(v11*v11 + v12*v12 + v13*v13);
      if (mod === 0) { return null; }
      normal = Sylvester.Vector.create([v1.elements[0] / mod, v1.elements[1] / mod, v1.elements[2] / mod]);
    }
    this.anchor = anchor;
    this.normal = normal;
    return this;
  }
};

Sylvester.Plane.create = function(anchor, v1, v2) {
  var P = new Sylvester.Plane();
  return P.setVectors(anchor, v1, v2);
};
var $P = Sylvester.Plane.create;

Sylvester.Plane.XY = Sylvester.Plane.create(Sylvester.Vector.Zero(3), Sylvester.Vector.k);
Sylvester.Plane.YZ = Sylvester.Plane.create(Sylvester.Vector.Zero(3), Sylvester.Vector.i);
Sylvester.Plane.ZX = Sylvester.Plane.create(Sylvester.Vector.Zero(3), Sylvester.Vector.j);
Sylvester.Plane.YX = Sylvester.Plane.XY; Sylvester.Plane.ZY = Sylvester.Plane.YZ; Sylvester.Plane.XZ = Sylvester.Plane.ZX;

Sylvester.Plane.fromPoints = function(points) {
  var np = points.length, list = [], i, P, n, N, A, B, C, D, theta, prevN, totalN = Sylvester.Vector.Zero(3);
  for (i = 0; i < np; i++) {
    P = Sylvester.Vector.create(points[i]).to3D();
    if (P === null) { return null; }
    list.push(P);
    n = list.length;
    if (n > 2) {
      // Compute plane normal for the latest three points
      A = list[n-1].elements; B = list[n-2].elements; C = list[n-3].elements;
      N = Sylvester.Vector.create([
        (A[1] - B[1]) * (C[2] - B[2]) - (A[2] - B[2]) * (C[1] - B[1]),
        (A[2] - B[2]) * (C[0] - B[0]) - (A[0] - B[0]) * (C[2] - B[2]),
        (A[0] - B[0]) * (C[1] - B[1]) - (A[1] - B[1]) * (C[0] - B[0])
      ]).toUnitVector();
      if (n > 3) {
        // If the latest normal is not (anti)parallel to the previous one, we've
        // strayed off the plane. This might be a slightly long-winded way of
        // doing things, but we need the sum of all the normals to find which
        // way the plane normal should point so that the points form an
        // anticlockwise list.
        theta = N.angleFrom(prevN);
        if (theta !== null) {
          if (!(Math.abs(theta) <= Sylvester.precision || Math.abs(theta - Math.PI) <= Sylvester.precision)) { return null; }
        }
      }
      totalN = totalN.add(N);
      prevN = N;
    }
  }
  // We need to add in the normals at the start and end points, which the above
  // misses out
  A = list[1].elements; B = list[0].elements; C = list[n-1].elements; D = list[n-2].elements;
  totalN = totalN.add(Sylvester.Vector.create([
    (A[1] - B[1]) * (C[2] - B[2]) - (A[2] - B[2]) * (C[1] - B[1]),
    (A[2] - B[2]) * (C[0] - B[0]) - (A[0] - B[0]) * (C[2] - B[2]),
    (A[0] - B[0]) * (C[1] - B[1]) - (A[1] - B[1]) * (C[0] - B[0])
  ]).toUnitVector()).add(Sylvester.Vector.create([
    (B[1] - C[1]) * (D[2] - C[2]) - (B[2] - C[2]) * (D[1] - C[1]),
    (B[2] - C[2]) * (D[0] - C[0]) - (B[0] - C[0]) * (D[2] - C[2]),
    (B[0] - C[0]) * (D[1] - C[1]) - (B[1] - C[1]) * (D[0] - C[0])
  ]).toUnitVector());
  return Sylvester.Plane.create(list[0], totalN);
};

Sylvester.Polygon = function() {};

Sylvester.Polygon.prototype = {
  v: function(i) {
    return this.vertices.at(i - 1).data;
  },

  nodeFor: function(vertex) {
    return this.vertices.withData(vertex);
  },

  dup: function() {
    return Sylvester.Polygon.create(this.vertices, this.plane);
  },

  translate: function(vector) {
    var P = vector.elements || vector;
    this.vertices.each(function(node) {
      var E = node.data.elements;
      node.data.setElements([E[0] + P[0], E[1] + P[1], E[2] + (P[2] || 0)]);
    });
    this.plane = this.plane.translate(vector);
    this.updateTrianglePlanes(function(plane) { return plane.translate(vector); });
    return this;
  },

  rotate: function(t, line) {
    var R = Sylvester.Matrix.Rotation(t, line.direction);
    this.vertices.each(function(node) {
      node.data.setElements(node.data.rotate(R, line).elements);
    });
    this.plane = this.plane.rotate(R, line);
    this.updateTrianglePlanes(function(plane) { return plane.rotate(R, line); });
    return this;
  },

  scale: function(k, point) {
    var P = point.elements || point;
    this.vertices.each(function(node) {
      var E = node.data.elements;
      node.data.setElements([
        P[0] + k * (E[0] - P[0]),
        P[1] + k * (E[1] - P[1]),
        (P[2] || 0) + k * (E[2] - (P[2] || 0))
      ]);
    });
    var anchor = this.vertices.first.data;
    this.plane.anchor.setElements(anchor);
    this.updateTrianglePlanes(function(plane) { return Sylvester.Plane.create(anchor, plane.normal); });
    return this;
  },

  // Updates the plane properties of all the cached triangles belonging to the
  // polygon according to the given function. For example, suppose you just
  // rotated the polygon, you should call:
  //
  //   poly.updateTrianglePlanes(function(plane) { return plane.rotate(t, line); });
  //
  // This method is called automatically by Sylvester.Polygon.translate,
  // Sylvester.Polygon.rotate and Sylvester.Polygon.scale transformation methods.
  updateTrianglePlanes: function(fn) {
    var i;
    if (this.cached.triangles !== null) {
      i = this.cached.triangles.length;
      while (i--) {
        this.cached.triangles[i].plane = fn(this.cached.triangles[i].plane);
      }
    }
    if (this.cached.surfaceIntegralElements !== null) {
      i = this.cached.surfaceIntegralElements.length;
      while (i--) {
        this.cached.surfaceIntegralElements[i].plane = fn(this.cached.surfaceIntegralElements[i].plane);
      }
    }
  },

  isTriangle: function() {
    return this.vertices.length === 3;
  },

  // Returns a collection of triangles used for calculating area and center of
  // mass. Some of the triangles will not lie inside the polygon - this
  // collection is essentially a series of itervals in a surface integral, so
  // some are 'negative'. If you want the polygon broken into constituent
  // triangles, use toTriangles(). This method is used because it's much faster
  // than toTriangles().
  //
  // The triangles generated share vertices with the original polygon, so they
  // transform with the polygon. They are cached after first calculation and
  // should remain in sync with changes to the parent polygon.
  trianglesForSurfaceIntegral: function() {
    if (this.cached.surfaceIntegralElements !== null) { return this.cached.surfaceIntegralElements; }
    var triangles = [];
    var firstVertex = this.vertices.first.data;
    var plane = this.plane;
    this.vertices.each(function(node, i) {
      if (i < 2) { return; }
      var points = [firstVertex, node.prev.data, node.data];
      // If the vertices lie on a straigh line, give the polygon's own plane. If
      // the element has no area, it doesn't matter which way its normal faces.
      triangles.push(Sylvester.Polygon.create(points, Sylvester.Plane.fromPoints(points) || plane));
    });
    return this.setCache('surfaceIntegralElements', triangles);
  },

  area: function() {
    if (this.isTriangle()) {
      // Area is half the modulus of the cross product of two sides
      var A = this.vertices.first, B = A.next, C = B.next;
      A = A.data.elements; B = B.data.elements; C = C.data.elements;
      return 0.5 * Sylvester.Vector.create([
        (A[1] - B[1]) * (C[2] - B[2]) - (A[2] - B[2]) * (C[1] - B[1]),
        (A[2] - B[2]) * (C[0] - B[0]) - (A[0] - B[0]) * (C[2] - B[2]),
        (A[0] - B[0]) * (C[1] - B[1]) - (A[1] - B[1]) * (C[0] - B[0])
      ]).modulus();
    } else {
      var trigs = this.trianglesForSurfaceIntegral(), area = 0;
      var i = trigs.length;
      while (i--) {
        area += trigs[i].area() * trigs[i].plane.normal.dot(this.plane.normal);
      }
      return area;
    }
  },

  centroid: function() {
    if (this.isTriangle()) {
      var A = this.v(1).elements, B = this.v(2).elements, C = this.v(3).elements;
      return Sylvester.Vector.create([(A[0] + B[0] + C[0])/3, (A[1] + B[1] + C[1])/3, (A[2] + B[2] + C[2])/3]);
    } else {
      var A, M = 0, V = Sylvester.Vector.Zero(3), P, C, trigs = this.trianglesForSurfaceIntegral();
      var i = trigs.length;
      while (i--) {
        A = trigs[i].area() * trigs[i].plane.normal.dot(this.plane.normal);
        M += A;
        P = V.elements;
        C = trigs[i].centroid().elements;
        V.setElements([P[0] + C[0] * A, P[1] + C[1] * A, P[2] + C[2] * A]);
      }
      return V.x(1/M);
    }
  },

  projectionOn: function(plane) {
    var points = [];
    this.vertices.each(function(node) { points.push(plane.pointClosestTo(node.data)); });
    return Sylvester.Polygon.create(points);
  },

  removeVertex: function(vertex) {
    if (this.isTriangle()) { return; }
    var node = this.nodeFor(vertex);
    if (node === null) { return null; }
    this.clearCache();
    // Previous and next entries in the main vertex list
    var prev = node.prev, next = node.next;
    var prevWasConvex = prev.data.isConvex(this);
    var nextWasConvex = next.data.isConvex(this);
    if (node.data.isConvex(this)) {
      this.convexVertices.remove(this.convexVertices.withData(node.data));
    } else {
      this.reflexVertices.remove(this.reflexVertices.withData(node.data));
    }
    this.vertices.remove(node);
    // Deal with previous vertex's change of class
    if (prevWasConvex !== prev.data.isConvex(this)) {
      if (prevWasConvex) {
        this.convexVertices.remove(this.convexVertices.withData(prev.data));
        this.reflexVertices.append(new Sylvester.LinkedList.Node(prev.data));
      } else {
        this.reflexVertices.remove(this.reflexVertices.withData(prev.data));
        this.convexVertices.append(new Sylvester.LinkedList.Node(prev.data));
      }
    }
    // Deal with next vertex's change of class
    if (nextWasConvex !== next.data.isConvex(this)) {
      if (nextWasConvex) {
        this.convexVertices.remove(this.convexVertices.withData(next.data));
        this.reflexVertices.append(new Sylvester.LinkedList.Node(next.data));
      } else {
        this.reflexVertices.remove(this.reflexVertices.withData(next.data));
        this.convexVertices.append(new Sylvester.LinkedList.Node(next.data));
      }
    }
    return this;
  },

  contains: function(point) {
    return this.containsByWindingNumber(point);
  },

  containsByWindingNumber: function(point) {
    var P = point.elements || point;
    if (!this.plane.contains(P)) { return false; }
    if (this.hasEdgeContaining(P)) { return false; }
    var V, W, A, B, theta = 0, dt, loops = 0, self = this;
    this.vertices.each(function(node) {
      V = node.data.elements;
      W = node.next.data.elements;
      A = Sylvester.Vector.create([V[0] - P[0], V[1] - P[1], V[2] - (P[2] || 0)]);
      B = Sylvester.Vector.create([W[0] - P[0], W[1] - P[1], W[2] - (P[2] || 0)]);
      dt = A.angleFrom(B);
      if (dt === null || dt === 0) { return; }
      theta += (A.cross(B).isParallelTo(self.plane.normal) ? 1 : -1) * dt;
      if (theta >= 2 * Math.PI - Sylvester.precision) { loops++; theta -= 2 * Math.PI; }
      if (theta <= -2 * Math.PI + Sylvester.precision) { loops--; theta += 2 * Math.PI; }
    });
    return loops !== 0;
  },

  hasEdgeContaining: function(point) {
    var P = (point.elements || point);
    var success = false;
    this.vertices.each(function(node) {
      if (Sylvester.Line.Segment.create(node.data, node.next.data).contains(P)) { success = true; }
    });
    return success;
  },

  toTriangles: function() {
    if (this.cached.triangles !== null) { return this.cached.triangles; }
    return this.setCache('triangles', this.triangulateByEarClipping());
  },

  // Implementation of ear clipping algorithm
  // Found in 'Triangulation by ear clipping', by David Eberly
  // at http://www.geometrictools.com
  // This will not deal with overlapping sections - contruct your polygons
  // sensibly
  triangulateByEarClipping: function() {
    var poly = this.dup(), triangles = [], success, convexNode, mainNode, trig;
    while (!poly.isTriangle()) {
      success = false;
      while (!success) {
        success = true;
        // Ear tips must be convex vertices - let's pick one at random
        convexNode = poly.convexVertices.randomNode();
        mainNode = poly.vertices.withData(convexNode.data);
        // For convex vertices, this order will always be anticlockwise
        trig = Sylvester.Polygon.create([mainNode.data, mainNode.next.data, mainNode.prev.data], this.plane);
        // Now test whether any reflex vertices lie within the ear
        poly.reflexVertices.each(function(node) {
          // Don't test points belonging to this triangle. node won't be equal
          // to convexNode as node is reflex and vertex is convex.
          if (node.data !== mainNode.prev.data && node.data !== mainNode.next.data) {
            if (trig.contains(node.data) || trig.hasEdgeContaining(node.data)) { success = false; }
          }
        });
      }
      triangles.push(trig);
      poly.removeVertex(mainNode.data);
    }
    // Need to do this to renumber the remaining vertices
    triangles.push(Sylvester.Polygon.create(poly.vertices, this.plane));
    return triangles;
  },

  setVertices: function(points, plane) {
    var pointSet = points.toArray ? points.toArray() : points;
    this.plane = (plane && plane.normal) ? plane.dup() : Sylvester.Plane.fromPoints(pointSet);
    if (this.plane === null) { return null; }
    this.vertices = new Sylvester.LinkedList.Circular();
    // Construct linked list of vertices. If each point is already a polygon
    // vertex, we reference it rather than creating a new vertex.
    var i = pointSet.length, newVertex;
    while (i--) {
      newVertex = pointSet[i].isConvex ? pointSet[i] : new Sylvester.Polygon.Vertex(pointSet[i]);
      this.vertices.prepend(new Sylvester.LinkedList.Node(newVertex));
    }
    this.clearCache();
    this.populateVertexTypeLists();
    return this;
  },

  populateVertexTypeLists: function() {
    this.convexVertices = new Sylvester.LinkedList.Circular();
    this.reflexVertices = new Sylvester.LinkedList.Circular();
    var self = this;
    this.vertices.each(function(node) {
      // Split vertices into convex / reflex groups. The
      // Sylvester.LinkedList.Node class wraps each vertex so it can belong to
      // many linked lists.
      self[node.data.type(self) + 'Vertices'].append(new Sylvester.LinkedList.Node(node.data));
    });
  },

  copyVertices: function() {
    this.clearCache();
    this.vertices.each(function(node) {
      node.data = new Sylvester.Polygon.Vertex(node.data);
    });
    this.populateVertexTypeLists();
  },

  clearCache: function() {
    this.cached = {
      triangles: null,
      surfaceIntegralElements: null
    };
  },

  setCache: function(key, value) {
    this.cached[key] = value;
    return value;
  },

  inspect: function() {
    var points = [];
    this.vertices.each(function(node) { points.push(node.data.inspect()); });
    return points.join(' -> ');
  }
};

Sylvester.Polygon.create = function(points, plane) {
  var P = new Sylvester.Polygon();
  return P.setVertices(points, plane);
};

Sylvester.Polygon.Vertex = function(point) {
  this.setElements(point);
  if (this.elements.length === 2) { this.elements.push(0); }
  if (this.elements.length !== 3) { return null; }
};
Sylvester.Polygon.Vertex.prototype = new Sylvester.Vector;

// Returns true iff the vertex's internal angle is 0 <= x < 180
// in the context of the given polygon object. Returns null if the
// vertex does not exist in the polygon.
Sylvester.Polygon.Vertex.prototype.isConvex = function(polygon) {
  var node = polygon.nodeFor(this);
  if (node === null) { return null; }
  var prev = node.prev.data, next = node.next.data;
  var A = next.subtract(this);
  var B = prev.subtract(this);
  var theta = A.angleFrom(B);
  if (theta <= Sylvester.precision) { return true; }
  if (Math.abs(theta - Math.PI) <= Sylvester.precision) { return false; }
  return (A.cross(B).dot(polygon.plane.normal) > 0);
};
// Returns true iff the vertex's internal angle is 180 <= x < 360
Sylvester.Polygon.Vertex.prototype.isReflex = function(polygon) {
  var result = this.isConvex(polygon);
  return (result === null) ? null : !result;
};
Sylvester.Polygon.Vertex.prototype.type = function(polygon) {
  var result = this.isConvex(polygon);
  return (result === null) ? null : (result ? 'convex' : 'reflex');
};

// Method for converting a set of arrays/vectors/whatever to a set of Sylvester.Polygon.Vertex objects
Sylvester.Polygon.Vertex.convert = function(points) {
  var pointSet = points.toArray ? points.toArray() : points;
  var list = [], n = pointSet.length;
  for (var i = 0; i < n; i++) {
    list.push(new Sylvester.Polygon.Vertex(pointSet[i]));
  }
  return list;
};

Sylvester.LinkedList = function() {};

Sylvester.LinkedList.prototype = {
  length: 0,
  first: null,
  last: null,

  forEach: function(fn, context) {
    var node = this.first, n = this.length;
    for (var i = 0; i < n; i++) {
      fn.call(context, node, i);
      node = node.next;
    }
  },

  at: function(i) {
    if (!(i >= 0 && i < this.length)) { return null; }
    var node = this.first;
    while (i--) { node = node.next; }
    return node;
  },

  randomNode: function() {
    var n = Math.floor(Math.random() * this.length);
    return this.at(n);
  },

  toArray: function() {
    var arr = [], node = this.first, n = this.length;
    while (n--) {
      arr.push(node.data || node);
      node = node.next;
    }
    return arr;
  }
};

Sylvester.LinkedList.prototype.each = Sylvester.LinkedList.prototype.forEach;

Sylvester.LinkedList.Node = function(data) {
  this.prev = null; this.next = null;
  this.data = data;
};

Sylvester.LinkedList.Circular = function() {};
Sylvester.LinkedList.Circular.Methods = {
  append: function(node) {
    if (this.first === null) {
      node.prev = node;
      node.next = node;
      this.first = node;
      this.last = node;
    } else {
      node.prev = this.last;
      node.next = this.first;
      this.first.prev = node;
      this.last.next = node;
      this.last = node;
    }
    this.length++;
  },

  prepend: function(node) {
    if (this.first === null) {
      this.append(node);
      return;
    } else {
      node.prev = this.last;
      node.next = this.first;
      this.first.prev = node;
      this.last.next = node;
      this.first = node;
    }
    this.length++;
  },

  insertAfter: function(node, newNode) {
    newNode.prev = node;
    newNode.next = node.next;
    node.next.prev = newNode;
    node.next = newNode;
    if (newNode.prev === this.last) { this.last = newNode; }
    this.length++;
  },

  insertBefore: function(node, newNode) {
    newNode.prev = node.prev;
    newNode.next = node;
    node.prev.next = newNode;
    node.prev = newNode;
    if (newNode.next === this.first) { this.first = newNode; }
    this.length++;
  },

  remove: function(node) {
    if (this.length > 1) {
      node.prev.next = node.next;
      node.next.prev = node.prev;
      if (node === this.first) { this.first = node.next; }
      if (node === this.last) { this.last = node.prev; }
    } else {
      this.first = null;
      this.last = null;
    }
    node.prev = null;
    node.next = null;
    this.length--;
  },

  withData: function(data) {
    var nodeFromStart = this.first, nodeFromEnd = this.last, n = Math.ceil(this.length / 2);
    while (n--) {
      if (nodeFromStart.data === data) { return nodeFromStart; }
      if (nodeFromEnd.data === data) { return nodeFromEnd; }
      nodeFromStart = nodeFromStart.next;
      nodeFromEnd = nodeFromEnd.prev;
    }
    return null;
  }
};

Sylvester.LinkedList.Circular.prototype = new Sylvester.LinkedList;
for (var method in Sylvester.LinkedList.Circular.Methods) {
  Sylvester.LinkedList.Circular.prototype[method] = Sylvester.LinkedList.Circular.Methods[method];
}

Sylvester.LinkedList.Circular.fromArray = function(list, useNodes) {
  var linked = new Sylvester.LinkedList.Circular();
  var n = list.length;
  while (n--) { linked.prepend(useNodes ? new Sylvester.LinkedList.Node(list[n]) : list[n]); }
  return linked;
};









  var api = (typeof require === 'function' && typeof exports === 'object')
          ? exports
          : this;

  api.Line    = Sylvester.Line;
  api.Matrix  = Sylvester.Matrix;
  api.Plane   = Sylvester.Plane;
  api.Polygon = Sylvester.Polygon;
  api.Vector  = Sylvester.Vector;

  console.log('API = ', api);
	api.$V = $V; // Sylvester.Vector.create;
	api.$M = $M; // Sylvester.Matrix.create;
	api.$L = $L; // Sylvester.Line.create;
	api.$P = $P; // Sylvester.Plane.create;

  if (typeof WScript !== 'undefined')
    this.Sylvester = Sylvester;
})();
