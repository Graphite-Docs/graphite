# Code

The code is embedded in this document!  [VOC](https://npmjs.org/package/voc) can
run through this file and generate `bessel.js`.

I really dislike writing `Math` so I use:

```js
var M = Math;
```

## Horner Method
 
The methods use an approximating polynomial and evaluate using Horner's method:

```
function _horner(arr, v) { return arr.reduce(function(z,w){return v * z + w;},0); };
```

## Recurrence

It can be shown that the four Bessel functions satisfy (on their support):

```tex>
B_{n} (x) = \frac{2n}{x} B_{n-1}(x) - B_{n-2}(x)
```

So rather than go back and try to find solution for each order, we will build 
solutions for `n=0` and `n=1` and then apply the recurrence.  The helper:

```js
function _bessel_iter(x, n, f0, f1, sign) {
  if(!sign) sign = -1;
  var tdx = 2 / x, f2;
  if(n === 0) return f0;
  if(n === 1) return f1;
  for(var o = 1; o != n; ++o) {
    f2 = f1 * o * tdx + sign * f0;
    f0 = f1; f1 = f2;
  }
  return f1;
}
```

We can directly generate the JS function given the basic solutions `bessel0` and
`bessel1` by leveraging `_bessel_iter` from above.  We have to add a few sanity
checks since `Y_n` is undefined at 0 and `K_n` is real only when `x>0`

```
function _bessel_wrap(bessel0, bessel1, name, nonzero, sign) {
  return function bessel(x,n) {
    if(n === 0) return bessel0(x);
    if(n === 1) return bessel1(x);
    if(n < 0) throw name + ': Order (' + n + ') must be nonnegative';
    if(nonzero == 1 && x === 0) throw name + ': Undefined when x == 0';
    if(nonzero == 2 && x <= 0) throw name + ': Undefined when x <= 0';
    var b0 = bessel0(x), b1 = bessel1(x);
    return _bessel_iter(x, n, b0, b1, sign);
  };
}
```

## Individual Solutions

To determine each individual solution, we first calculate a Chebyshev polynomial
based on the regime (lower and higher-value approximations).  This module uses
the constants from the [GNU Scientific Library](https://gnu.org/s/gsl), and from
the venerable [Numerical Recipes book](http://www.nr.com/) but I have 
independently verified the constants using Mathematica.

```
var besselj = (function() {
```

The constants are named `b[01]_[ab]([12][ab])?` with the blocks corresponding to
the function order (e.g. `b0_` refers to order 0), variable name in the function
and conditional.

```
  var b0_a1a = [57568490574.0,-13362590354.0,651619640.7,-11214424.18,77392.33017,-184.9052456].reverse();
  var b0_a2a = [57568490411.0,1029532985.0,9494680.718,59272.64853,267.8532712,1.0].reverse();
  var b0_a1b = [1.0, -0.1098628627e-2, 0.2734510407e-4, -0.2073370639e-5, 0.2093887211e-6].reverse();
  var b0_a2b = [-0.1562499995e-1, 0.1430488765e-3, -0.6911147651e-5, 0.7621095161e-6, -0.934935152e-7].reverse();
```

I noticed some strange oddities when leaning on `Math.PI`, so it is cached:

```
  var W = 0.636619772; // 2 / Math.PI

  function bessel0(x) {
    var a, a1, a2, y = x * x, xx = M.abs(x) - 0.785398164;
```

For small `x`, the direct Laurent approximation gives better results. 

```
    if(M.abs(x) < 8) {
      a1 = _horner(b0_a1a, y);
      a2 = _horner(b0_a2a, y);
      a = a1/a2;
    }
```

For larger `x`, the Chebyshev approach is taken:  

``` 
    else {
      y = 64 / y;
      a1 = _horner(b0_a1b, y);
      a2 = _horner(b0_a2b, y);
      a = M.sqrt(W/M.abs(x))*(M.cos(xx)*a1-M.sin(xx)*a2*8/M.abs(x));
    }
    return a;
  }
```

A similar approach is taken for the first-order bessel function

```
  var b1_a1a = [72362614232.0,-7895059235.0,242396853.1,-2972611.439, 15704.48260, -30.16036606].reverse();
  var b1_a2a = [144725228442.0, 2300535178.0, 18583304.74, 99447.43394, 376.9991397, 1.0].reverse();
  var b1_a1b = [1.0, 0.183105e-2, -0.3516396496e-4, 0.2457520174e-5, -0.240337019e-6].reverse();
  var b1_a2b = [0.04687499995, -0.2002690873e-3, 0.8449199096e-5, -0.88228987e-6, 0.105787412e-6].reverse();
  function bessel1(x) {
    var a, a1, a2, y = x*x, xx = M.abs(x) - 2.356194491;
    if(Math.abs(x)< 8) {
      a1 = x*_horner(b1_a1a, y);
      a2 = _horner(b1_a2a, y);
      a = a1 / a2;
    } else {
      y = 64 / y;
      a1=_horner(b1_a1b, y);
      a2=_horner(b1_a2b, y);
      a=M.sqrt(W/M.abs(x))*(M.cos(xx)*a1-M.sin(xx)*a2*8/M.abs(x));
      if(x < 0) a = -a;
    }
    return a;
  }
```

For large values of x, the aforementioned iteration is fine, but for small
values the expressions quickly blow up.  Hence a more careful iteration is used:

```
  return function besselj(x, n) {
    n = Math.round(n);
    if(n === 0) return bessel0(M.abs(x));
    if(n === 1) return bessel1(M.abs(x));
    if(n < 0) throw 'BESSELJ: Order (' + n + ') must be nonnegative';
    if(M.abs(x) === 0) return 0;
  
    var ret, j, tox = 2 / M.abs(x), m, jsum, sum, bjp, bj, bjm;
    if(M.abs(x) > n) {
      ret = _bessel_iter(x, n, bessel0(M.abs(x)), bessel1(M.abs(x)),-1);
    } else {
      m=2*M.floor((n+M.floor(M.sqrt(40*n)))/2);
      jsum=0;
      bjp=ret=sum=0.0;
      bj=1.0;
      for (j=m;j>0;j--) {
        bjm=j*tox*bj-bjp;
        bjp=bj;
        bj=bjm;
        if (M.abs(bj) > 1E10) {
          bj *= 1E-10;
          bjp *= 1E-10;
          ret *= 1E-10;
          sum *= 1E-10;
        }
        if (jsum) sum += bj;
        jsum=!jsum;
        if (j == n) ret=bjp;
      }
      sum=2.0*sum-bj;
      ret /= sum;
    }
    return x < 0 && (n%2) ? -ret : ret;
  };
})();
```

The second kind function `Y` is a bit less finicky: 

```
var bessely = (function() {
  var b0_a1a = [-2957821389.0, 7062834065.0, -512359803.6, 10879881.29, -86327.92757, 228.4622733].reverse();
  var b0_a2a = [40076544269.0, 745249964.8, 7189466.438, 47447.26470, 226.1030244, 1.0].reverse();
  var b0_a1b = [1.0, -0.1098628627e-2, 0.2734510407e-4, -0.2073370639e-5, 0.2093887211e-6].reverse();
  var b0_a2b = [-0.1562499995e-1, 0.1430488765e-3, -0.6911147651e-5, 0.7621095161e-6, -0.934945152e-7].reverse();
  
  var W = 0.636619772;
  function bessel0(x) {
    var a, a1, a2, y = x * x, xx = x - 0.785398164;
    if(x < 8) {
      a1 = _horner(b0_a1a, y);
      a2 = _horner(b0_a2a, y);
      a = a1/a2 + W * besselj(x,0) * M.log(x);
    } else {
      y = 64 / y;
      a1 = _horner(b0_a1b, y);
      a2 = _horner(b0_a2b, y);
      a = M.sqrt(W/x)*(M.sin(xx)*a1+M.cos(xx)*a2*8/x);
    }
    return a;
  }

  var b1_a1a = [-0.4900604943e13, 0.1275274390e13, -0.5153438139e11, 0.7349264551e9, -0.4237922726e7, 0.8511937935e4].reverse();
  var b1_a2a = [0.2499580570e14, 0.4244419664e12, 0.3733650367e10, 0.2245904002e8, 0.1020426050e6, 0.3549632885e3, 1].reverse();
  var b1_a1b = [1.0, 0.183105e-2, -0.3516396496e-4, 0.2457520174e-5, -0.240337019e-6].reverse();
  var b1_a2b = [0.04687499995, -0.2002690873e-3, 0.8449199096e-5, -0.88228987e-6, 0.105787412e-6].reverse();
  function bessel1(x) {
    var a, a1, a2, y = x*x, xx = x - 2.356194491;
    if(x < 8) {
      a1 = x*_horner(b1_a1a, y);
      a2 = _horner(b1_a2a, y);
      a = a1/a2 + W * (besselj(x,1) * M.log(x) - 1 / x);
    } else {
      y = 64 / y;
      a1=_horner(b1_a1b, y);
      a2=_horner(b1_a2b, y);
      a=M.sqrt(W/x)*(M.sin(xx)*a1+M.cos(xx)*a2*8/x);
    }
    return a;
  }

  return _bessel_wrap(bessel0, bessel1, 'BESSELY', 1, -1);
})();
```

And the modified Bessel functions are even easier:

```
var besseli = (function() {
  var b0_a = [1.0, 3.5156229, 3.0899424, 1.2067492, 0.2659732, 0.360768e-1, 0.45813e-2].reverse();
  var b0_b = [0.39894228, 0.1328592e-1, 0.225319e-2, -0.157565e-2, 0.916281e-2, -0.2057706e-1, 0.2635537e-1, -0.1647633e-1, 0.392377e-2].reverse();
  function bessel0(x) {
    if(x <= 3.75) return _horner(b0_a, x*x/(3.75*3.75));
    return M.exp(M.abs(x))/M.sqrt(M.abs(x))*_horner(b0_b, 3.75/M.abs(x));
  }

  var b1_a = [0.5, 0.87890594, 0.51498869, 0.15084934, 0.2658733e-1, 0.301532e-2, 0.32411e-3].reverse();
  var b1_b = [0.39894228, -0.3988024e-1, -0.362018e-2, 0.163801e-2, -0.1031555e-1, 0.2282967e-1, -0.2895312e-1, 0.1787654e-1, -0.420059e-2].reverse();
  function bessel1(x) {
    if(x < 3.75) return x * _horner(b1_a, x*x/(3.75*3.75));
    return (x < 0 ? -1 : 1) * M.exp(M.abs(x))/M.sqrt(M.abs(x))*_horner(b1_b, 3.75/M.abs(x));
  }

  return function besseli(x, n) {
    n = Math.round(n);
    if(n === 0) return bessel0(x);
    if(n == 1) return bessel1(x);
    if(n < 0) throw 'BESSELI Order (' + n + ') must be nonnegative';
    if(M.abs(x) === 0) return 0;
  
    var ret, j, tox = 2 / M.abs(x), m, bip, bi, bim;
    m=2*M.round((n+M.round(M.sqrt(40*n)))/2);
    bip=ret=0.0;
    bi=1.0;
    for (j=m;j>0;j--) {
      bim=j*tox*bi + bip;
      bip=bi; bi=bim;
      if (M.abs(bi) > 1E10) {
        bi *= 1E-10;
        bip *= 1E-10;
        ret *= 1E-10;
      }
      if(j == n) ret = bip;
    }
    ret *= besseli(x, 0) / bi;
    return x < 0 && (n%2) ? -ret : ret;
  };
  
})();

var besselk = (function() {
  var b0_a = [-0.57721566, 0.42278420, 0.23069756, 0.3488590e-1, 0.262698e-2, 0.10750e-3, 0.74e-5].reverse();
  var b0_b = [1.25331414, -0.7832358e-1, 0.2189568e-1, -0.1062446e-1, 0.587872e-2, -0.251540e-2, 0.53208e-3].reverse();
  function bessel0(x) {
    if(x <= 2) return -M.log(x/2)*besseli(x,0) + _horner(b0_a, x*x/4);
    return M.exp(-x)/M.sqrt(x)*_horner(b0_b, 2/x);
  }

  var b1_a = [1.0, 0.15443144, -0.67278579, -0.18156897, -0.1919402e-1, -0.110404e-2, -0.4686e-4].reverse();
  var b1_b = [1.25331414, 0.23498619, -0.3655620e-1, 0.1504268e-1, -0.780353e-2, 0.325614e-2, -0.68245e-3].reverse();
  function bessel1(x) {
    if(x <= 2) return M.log(x/2)*besseli(x,1) + (1/x)*_horner(b1_a, x*x/4);
    return M.exp(-x)/M.sqrt(x)*_horner(b1_b, 2/x);
  }

  return _bessel_wrap(bessel0, bessel1, 'BESSELK', 2, 1);
})();
```

## Export Magic

Now we need to export:

```
if(typeof exports !== "undefined") {
  exports.besselj = besselj;
  exports.bessely = bessely;
  exports.besseli = besseli;
  exports.besselk = besselk;
}
```

# Testing

Fortunately, these functions are available in Excel, so you can test there (or 
use the same functions in Mathematica).  Note that this uses Excel semantics, 
which are reverse from Mathematica:

```mathematica>
BesselJ[n, x] (* Mathematica *)
```
