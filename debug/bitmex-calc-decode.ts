/* tslint:disable */

function H(e, t) {
  return t && Number.isFinite(0.07692307692307693 /* t.initMarginReq */)
         ? 0.07692307692307693 /* t.initMarginReq */
         : 0.01 /* e.initMargin */;
}

function D(e, t, n, r) {
  var i = e
    , a = t
    , o = n
    , s = r;
  return B(i) === -B(o)
         ? Math.round(s * Math.min(1, -i / o)) + Math.round(a * Math.min(1, -o / i))
         : 0;
}

function F(e, t, n) {
  var r = e
    , i = t
    , a = n
    , o = Math.round(r >= 0 ? r * a : r / a);
  return Math.round(i * o);
}

function B(e) {
  return e > 0 ? 1 :
         e < 0 ? -1 : 0;
}


const p = /e-(\d+)$/i;

function h(e) {
  'string' != typeof e && (e = String(e));
  for (var t = e.length - 2; t > 0; t--) {
    var n = e[t];
    if ('.' === n || ',' === n)
      return e.length - t - 1;
  }
  if (Number(e) < 1) {
    var r = e.match(p);
    if (r && r[1])
      return Number(r[1]);
  }
  return 0;
}

function S(e) {
  return e / 1e4;
}

function b(e, t) {
  var n = e % t
    , r = S(t);
  return (n < r || n + r > t) && (n = 0), n;
}

function m(t, n, r) {
  if (
    ('number' != typeof t || Number.isNaN(t))
    && (console.warn('Invalid toNearest input: '.concat(t)), t = 0),
      !Number.isFinite(t)
  )
    return String(t);

  var i = b(Math.abs(t), n)
    , a = B(t)
    , o = a * i
    , s = t;
  if (0 === r)
    s = t - o;
  else if (3 === r || 1 === r && Math.abs(i - n / 2) < S(n)) {
    s = t - o + (0 === o ? 0 : a * n);
  } else if (1 === r) {
    s = t - o + (i > n / 2 ? 1 : 0) * n;
  }
  return s.toFixed(h(n));
}

function y(e, t) {
  return m(e, t, 1);
}

function R(e, t, n) {
  var r = e
    , i = t
    , a = n
    , o = B(i)
    , s = o * Math.ceil(o * a / i);
  if (r >= 0)
    return s / r;
  var l = 0 === s ? B(i / a) : s;
  return Number(y(r / l, 1e-4));
}

function ae(e /* !!! */, t /* !!! */, n, r /* !!! */, i /* !!!!! */, a) {
  var o = -100000000 // e.multiplier   // !!
    , s = 11311.97 // e.markPrice    // !!
    , l = 0 // t.currentCost     // !!!!
    , u = 0 // t.currentQty       // !!
    , c = 0.00075 // t.commission       // !!
    , d = 0 // t.posCross         // !!
    , f = 0 // t.realisedCost     // !!!
    // , p = t.realisedPnl
    , h = 0 //t.unrealisedPnl
    , m = 0 /* t.currentQty */ + r // !!
    , g = F(o, m, s);            // !
   const v = H(e, t); /* ? v */;             // !!
  null != a && (v = 1 / a);
  var y = F(o, r, i)          // !!!!
    , b = l + y               // !!!
    , S = d - D(r, 0, u, d);   // !
  null != a && (S += Math.max(0, -h));    // !!
  var M = D(r, y, u, l - f)    // !!!
    , w = b - (f + M)
    , k = w                  // !!
    , T = Math.abs(k /* ? */) * v /* ? */       // !
    , C = Math.round((Math.abs(k) + Math.max(0, S + T)) * c)
    , x = g - w;
  return {
    // newInitMarginReq: v,
    // newCurrentQty: m,
    newMarkValue:     g, //
    newPosCross:      S, //
    newPosInit:       T, //
    newUnrealisedPnl: x, //
    newPosComm:       C, //
    // newPosCost: k,
    // newRealisedPnl: p - M - Math.round(Math.abs(y) * c),
    // newMaintMargin: Math.max(0, S + T + C + x)
  };
}

(() => {
  // const s = ae.apply(void 0, arguments)
  const s = ae.apply(void 0, [0, 0, 0, 1200, 1400, undefined]);

  const d = s.newPosCross; // 0
  const p = s.newUnrealisedPnl; /* ? */
  const f = s.newPosInit; /* ? */
  const m = s.newPosComm; /* ? */
  const c = s.newMarkValue; /* ? */

  const O = d + f + m + p;
  // const O += Math.max(0, Math.floor(F / (1 + C)));

  const u = 1200; // количество
  const w = -100000000;
  // const S: -1; бывает 1 и -1
  const S = B(c); /* ? */


  const I = R(w, u, S * Math.max(0, S * (c - O)));
  console.log('res', I); // the value is wrong

})();
