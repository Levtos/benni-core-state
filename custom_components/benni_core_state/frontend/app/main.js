//#region node_modules/svelte/src/internal/shared/utils.js
var e = Array.isArray, t = Array.prototype.indexOf, n = Array.prototype.includes, r = Array.from, i = Object.defineProperty, a = Object.getOwnPropertyDescriptor, o = Object.getOwnPropertyDescriptors, s = Object.prototype, c = Array.prototype, l = Object.getPrototypeOf, u = Object.isExtensible;
function d(e) {
	return typeof e == "function";
}
var f = () => {};
function p(e) {
	for (var t = 0; t < e.length; t++) e[t]();
}
function m() {
	var e, t;
	return {
		promise: new Promise((n, r) => {
			e = n, t = r;
		}),
		resolve: e,
		reject: t
	};
}
function h(e, t) {
	if (Array.isArray(e)) return e;
	if (t === void 0 || !(Symbol.iterator in e)) return Array.from(e);
	let n = [];
	for (let r of e) if (n.push(r), n.length === t) break;
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/constants.js
var g = 1 << 24, _ = 1024, v = 2048, y = 4096, b = 8192, x = 16384, S = 32768, C = 1 << 25, w = 65536, T = 1 << 18, E = 1 << 19, ee = 1 << 20, te = 1 << 25, ne = 65536, re = 1 << 21, ie = 1 << 22, ae = 1 << 23, oe = Symbol("$state"), se = Symbol("legacy props"), ce = Symbol(""), le = Symbol("attributes"), ue = Symbol("class"), de = Symbol("style"), fe = Symbol("text"), pe = Symbol("form reset"), me = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), he = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
function ge(e) {
	throw Error("https://svelte.dev/e/lifecycle_outside_component");
}
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
function _e() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function ve(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function ye(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function be() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function xe(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function Se() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Ce(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function we() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Te() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ee() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function De() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
//#endregion
//#region node_modules/svelte/src/constants.js
var Oe = {}, D = Symbol("uninitialized"), ke = "http://www.w3.org/1999/xhtml", Ae = "http://www.w3.org/2000/svg";
function je() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function Me(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Ne() {
	console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Pe() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/hydration.js
var O = !1;
function Fe(e) {
	O = e;
}
var k;
function A(e) {
	if (e === null) throw Me(), Oe;
	return k = e;
}
function Ie() {
	return A(/* @__PURE__ */ vn(k));
}
function j(e) {
	if (O) {
		if (/* @__PURE__ */ vn(k) !== null) throw Me(), Oe;
		k = e;
	}
}
function M(e = 1) {
	if (O) {
		for (var t = e, n = k; t--;) n = /* @__PURE__ */ vn(n);
		k = n;
	}
}
function Le(e = !0) {
	for (var t = 0, n = k;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ vn(n);
		e && n.remove(), n = i;
	}
}
function Re(e) {
	if (!e || e.nodeType !== 8) throw Me(), Oe;
	return e.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
function ze(e) {
	return e === this.v;
}
function Be(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Ve(e) {
	return !Be(e, this.v);
}
//#endregion
//#region node_modules/svelte/src/internal/client/context.js
var N = null;
function He(e) {
	N = e;
}
function Ue(e) {
	return qe("getContext").get(e);
}
function We(e, t = !1, n) {
	N = {
		p: N,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: U,
		l: null
	};
}
function Ge(e) {
	var t = N, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) An(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, N = t.p, e ?? {};
}
function Ke() {
	return !0;
}
function qe(e) {
	return N === null && ge(e), N.c ??= new Map(Je(N) || void 0);
}
function Je(e) {
	let t = e.p;
	for (; t !== null;) {
		let e = t.c;
		if (e !== null) return e;
		t = t.p;
	}
	return null;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
var Ye = [];
function Xe() {
	var e = Ye;
	Ye = [], p(e);
}
function Ze(e) {
	if (Ye.length === 0 && !Lt) {
		var t = Ye;
		queueMicrotask(() => {
			t === Ye && Xe();
		});
	}
	Ye.push(e);
}
function Qe() {
	for (; Ye.length > 0;) Xe();
}
function $e(e) {
	var t = U;
	if (t === null) return H.f |= ae, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	et(e, t);
}
function et(e, t) {
	if (!(t !== null && t.f & 16384)) {
		for (; t !== null;) {
			if (t.f & 128) {
				if (!(t.f & 32768)) throw e;
				try {
					t.b.error(e);
					return;
				} catch (t) {
					e = t;
				}
			}
			t = t.parent;
		}
		throw e;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/status.js
var tt = ~(v | y | _);
function P(e, t) {
	e.f = e.f & tt | t;
}
function nt(e) {
	e.f & 512 || e.deps === null ? P(e, _) : P(e, y);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function rt(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= ne, rt(t.deps));
}
function it(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), rt(e.deps), P(e, _);
}
//#endregion
//#region node_modules/svelte/src/store/shared/index.js
var at = [];
function ot(e, t = f) {
	let n = null, r = /* @__PURE__ */ new Set();
	function i(t) {
		if (Be(e, t) && (e = t, n)) {
			let t = !at.length;
			for (let t of r) t[1](), at.push(t, e);
			if (t) {
				for (let e = 0; e < at.length; e += 2) at[e][0](at[e + 1]);
				at.length = 0;
			}
		}
	}
	function a(t) {
		i(t(e));
	}
	function o(o, s = f) {
		let c = [o, s];
		return r.add(c), r.size === 1 && (n = t(i, a) || f), o(e), () => {
			r.delete(c), r.size === 0 && n && (n(), n = null);
		};
	}
	return {
		set: i,
		update: a,
		subscribe: o
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
var st = !1;
function ct(e) {
	var t = st;
	try {
		return st = !1, [e(), st];
	} finally {
		st = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/misc.js
function lt(e, t) {
	if (t) {
		let t = document.body;
		e.autofocus = !0, Ze(() => {
			document.activeElement === t && e.focus();
		});
	}
}
function ut(e) {
	O && /* @__PURE__ */ _n(e) !== null && bn(e);
}
var dt = !1;
function ft() {
	dt || (dt = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[pe]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function pt(e) {
	var t = H, n = U;
	$n(null), er(null);
	try {
		return e();
	} finally {
		$n(t), er(n);
	}
}
function mt(e, t, n, r = n) {
	e.addEventListener(t, () => pt(n));
	let i = e[pe];
	e[pe] = i ? () => {
		i(), r(!0);
	} : () => r(!0), ft();
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function ht(e) {
	let t = 0, n = en(0), r;
	return () => {
		Dn() && (W(n), Pn(() => (t === 0 && (r = xr(() => e(() => an(n)))), t += 1, () => {
			Ze(() => {
				--t, t === 0 && (r?.(), r = void 0, an(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var gt = w | E;
function _t(e, t, n, r) {
	new vt(e, t, n, r);
}
var vt = class {
	parent;
	is_pending = !1;
	transform_error;
	#e;
	#t = O ? k : null;
	#n;
	#r;
	#i;
	#a = null;
	#o = null;
	#s = null;
	#c = null;
	#l = 0;
	#u = 0;
	#d = !1;
	#f = /* @__PURE__ */ new Set();
	#p = /* @__PURE__ */ new Set();
	#m = null;
	#h = ht(() => (this.#m = en(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = U;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = U.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = Fn(() => {
			if (O) {
				let e = this.#t;
				Ie();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, gt), O && (this.#e = k);
	}
	#g() {
		try {
			this.#a = Ln(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		Ze(r), t && (this.#s = Ln(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			if (t) {
				Pe();
				return;
			}
			t = !0, n && De(), this.#s !== null && Un(this.#s, () => {
				this.#s = null;
			}), this.#S(() => {
				this.#b();
			});
		};
		return {
			reset: r,
			invoke_onerror: () => {
				try {
					n = !0, this.#n.onerror?.(e, r), n = !1;
				} catch (e) {
					et(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = Ln(() => e(this.#e)), Ze(() => {
			var e = this.#c = document.createDocumentFragment(), t = gn();
			e.append(t), this.#a = this.#S(() => Ln(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, Un(this.#o, () => {
				this.#o = null;
			}), this.#x(F));
		}));
	}
	#b() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = Ln(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				qn(this.#a, e);
				let t = this.#n.pending;
				this.#o = Ln(() => t(this.#e));
			} else this.#x(F);
		} catch (e) {
			this.error(e);
		}
	}
	#x(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		it(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#S(e) {
		var t = U, n = H, r = N;
		er(this.#i), $n(this.#i), He(this.#i.ctx);
		try {
			return Ut.ensure(), e();
		} catch (e) {
			return $e(e), null;
		} finally {
			er(t), $n(n), He(r);
		}
	}
	#C(e, t) {
		if (!this.has_pending_snippet()) {
			this.parent && this.parent.#C(e, t);
			return;
		}
		this.#u += e, this.#u === 0 && (this.#x(t), this.#o && Un(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null));
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Ze(() => {
			this.#d = !1, this.#m && nn(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), W(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		F?.is_fork ? (this.#a && F.skip_effect(this.#a), this.#o && F.skip_effect(this.#o), this.#s && F.skip_effect(this.#s), F.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (V(this.#a), null), this.#o &&= (V(this.#o), null), this.#s &&= (V(this.#s), null), O && (A(this.#t), M(), A(Le()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return Ln(() => {
						var r = U;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return et(e, this.#i.parent), null;
				}
			}));
		};
		Ze(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				et(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => et(e, this.#i && this.#i.parent)) : n(t);
		});
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
function yt(e, t, n, r) {
	let i = Ke() ? Ct : Dt;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = U, c = bt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				et(e, s);
			}
			xt();
		}
	}
	var d = St();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ Tt(e))).then(u).catch((e) => et(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), xt();
	}) : f();
}
function bt() {
	var e = U, t = H, n = N, r = F;
	return function(i = !0) {
		er(e), $n(t), He(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function xt(e = !0) {
	er(null), $n(null), He(null), e && F?.deactivate();
}
function St() {
	var e = U, t = e.b, n = F, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Ct(e) {
	var t = 2 | v;
	return U !== null && (U.f |= E), {
		ctx: N,
		deps: null,
		effects: null,
		equals: ze,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: D,
		wv: 0,
		parent: U,
		ac: null
	};
}
var wt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function Tt(e, t, n) {
	let r = U;
	r === null && _e();
	var i = void 0, a = en(D), o = !H, s = /* @__PURE__ */ new Set();
	return Nn(() => {
		var t = U, n = m();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== me && n.reject(e);
			}).finally(xt);
		} catch (e) {
			n.reject(e), xt();
		}
		var c = F;
		if (o) {
			if (t.f & 32768) var l = St();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(wt);
			else for (let e of s.values()) e.reject(wt);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== wt && (c.activate(), t ? (a.f |= ae, nn(a, t)) : (a.f & 8388608 && (a.f ^= ae), nn(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), On(() => {
		for (let e of s) e.reject(wt);
	}), new Promise((e) => {
		function t(n) {
			function r() {
				n === i ? e(a) : t(i);
			}
			n.then(r, r);
		}
		t(i);
	});
}
/*#__NO_SIDE_EFFECTS__*/
function Et(e) {
	let t = /* @__PURE__ */ Ct(e);
	return nr(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function Dt(e) {
	let t = /* @__PURE__ */ Ct(e);
	return t.equals = Ve, t;
}
function Ot(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) V(t[n]);
	}
}
function kt(e) {
	var t, n = U, r = e.parent;
	if (!Xn && r !== null && e.v !== D && r.f & 24576) return je(), e.v;
	er(r);
	try {
		e.f &= ~ne, Ot(e), t = mr(e);
	} finally {
		er(n);
	}
	return t;
}
function At(e) {
	var t = kt(e);
	if (!e.equals(t) && (e.wv = dr(), (!F?.is_fork || e.deps === null) && (F === null ? e.v = t : (F.capture(e, t, !0), Pt?.capture(e, t, !0)), e.deps === null))) {
		P(e, _);
		return;
	}
	Xn || (Ft === null ? nt(e) : (Dn() || F?.is_fork) && Ft.set(e, t));
}
function jt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && pt(() => {
		t.ac.abort(me), t.ac = null;
	}), t.fn !== null && (t.teardown = f), gr(t, 0), zn(t));
}
function Mt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && _r(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var Nt = null, F = null, Pt = null, Ft = null, It = null, Lt = !1, Rt = !1, zt = null, Bt = null, Vt = 0, Ht = 1, Ut = class e {
	id = Ht++;
	#e = !1;
	linked = !0;
	#t = null;
	#n = null;
	async_deriveds = /* @__PURE__ */ new Map();
	current = /* @__PURE__ */ new Map();
	previous = /* @__PURE__ */ new Map();
	#r = /* @__PURE__ */ new Set();
	#i = /* @__PURE__ */ new Set();
	#a = 0;
	#o = /* @__PURE__ */ new Map();
	#s = null;
	#c = [];
	#l = [];
	#u = /* @__PURE__ */ new Set();
	#d = /* @__PURE__ */ new Set();
	#f = /* @__PURE__ */ new Map();
	#p = /* @__PURE__ */ new Set();
	is_fork = !1;
	#m = !1;
	constructor() {
		Nt === null ? Nt = this : (Nt.#n = this, this.#t = Nt), Nt = this;
	}
	#h() {
		if (this.is_fork) return !0;
		for (let n of this.#o.keys()) {
			for (var e = n, t = !1; e.parent !== null;) {
				if (this.#f.has(e)) {
					t = !0;
					break;
				}
				e = e.parent;
			}
			if (!t) return !0;
		}
		return !1;
	}
	skip_effect(e) {
		this.#f.has(e) || this.#f.set(e, {
			d: [],
			m: []
		}), this.#p.delete(e);
	}
	unskip_effect(e, t = (e) => this.schedule(e)) {
		var n = this.#f.get(e);
		if (n) {
			this.#f.delete(e);
			for (var r of n.d) P(r, v), t(r);
			for (r of n.m) P(r, y), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, Vt++ > 1e3 && (this.#x(), Gt());
		for (let e of this.#u) this.#d.delete(e), P(e, v), this.schedule(e);
		for (let e of this.#d) P(e, y), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = zt = [], r = [], i = Bt = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Xt(e), this.#h() || this.discard(), t;
		}
		if (F = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (zt = null, Bt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Yt(e, t);
			i.length > 0 && F.#g();
			return;
		}
		let o = this.#v();
		if (o) {
			this.#b(r), this.#b(n), o.#y(this);
			return;
		}
		this.#u.clear(), this.#d.clear();
		for (let e of this.#r) e(this);
		this.#r.clear(), Pt = this, qt(r), qt(n), Pt = null, this.#s?.resolve();
		var s = F;
		if (this.#a === 0 && (this.#c.length === 0 || s !== null) && this.#x(), this.#c.length > 0) {
			if (s !== null) {
				let e = s;
				e.#c.push(...this.#c.filter((t) => !e.#c.includes(t)));
			} else s = this;
		}
		s !== null && s.#g();
	}
	#_(e, t, n) {
		e.f ^= _;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= _ : i & 4 ? t.push(r) : fr(r) && (i & 16 && this.#d.add(r), _r(r));
				var o = r.first;
				if (o !== null) {
					r = o;
					continue;
				}
			}
			for (; r !== null;) {
				var s = r.next;
				if (s !== null) {
					r = s;
					break;
				}
				r = r.parent;
			}
		}
	}
	#v() {
		for (var e = this.#t; e !== null;) {
			if (!e.is_fork) {
				for (let [t, [, n]] of this.current) if (e.current.has(t) && !n) return e;
			}
			e = e.#t;
		}
		return null;
	}
	#y(e) {
		for (let [t, n] of e.current) !this.previous.has(t) && e.previous.has(t) && this.previous.set(t, e.previous.get(t)), this.current.set(t, n);
		for (let [t, n] of e.async_deriveds) {
			let e = this.async_deriveds.get(t);
			e && n.promise.then(e.resolve).catch(e.reject);
		}
		e.async_deriveds.clear(), this.transfer_effects(e.#u, e.#d);
		let t = (e) => {
			var n = e.reactions;
			if (n !== null && !(e.f & 2 && !(e.f & 6144))) for (let e of n) {
				var r = e.f;
				if (r & 2) t(e);
				else {
					var i = e;
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), P(i, v), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), F = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) it(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== D && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), Ft?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		F = this;
	}
	deactivate() {
		F = null, Ft = null;
	}
	flush() {
		try {
			Rt = !0, F = this, this.#g();
		} finally {
			Vt = 0, It = null, zt = null, Bt = null, Rt = !1, F = null, Ft = null, Qt.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(wt);
		this.#x(), this.#s?.resolve();
	}
	register_created_effect(e) {
		this.#l.push(e);
	}
	increment(e, t) {
		if (this.#a += 1, e) {
			let e = this.#o.get(t) ?? 0;
			this.#o.set(t, e + 1);
		}
	}
	decrement(e, t) {
		if (--this.#a, e) {
			let e = this.#o.get(t) ?? 0;
			e === 1 ? this.#o.delete(t) : this.#o.set(t, e - 1);
		}
		this.#m || (this.#m = !0, Ze(() => {
			this.#m = !1, this.linked && this.flush();
		}));
	}
	transfer_effects(e, t) {
		for (let t of e) this.#u.add(t);
		for (let e of t) this.#d.add(e);
		e.clear(), t.clear();
	}
	oncommit(e) {
		this.#r.add(e);
	}
	ondiscard(e) {
		this.#i.add(e);
	}
	settled() {
		return (this.#s ??= m()).promise;
	}
	static ensure() {
		if (F === null) {
			let t = F = new e();
			!Rt && !Lt && Ze(() => {
				t.#e || t.flush();
			});
		}
		return F;
	}
	apply() {
		Ft = null;
	}
	schedule(e) {
		if (It = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if (zt !== null && t === U && (H === null || !(H.f & 2))) return;
			if (n & 96) {
				if (!(n & 1024)) return;
				t.f ^= _;
			}
		}
		this.#c.push(t);
	}
	#x() {
		if (this.linked) {
			var e = this.#t, t = this.#n;
			e === null || (e.#n = t), t === null ? Nt = e : t.#t = e, this.linked = !1;
		}
	}
};
function Wt(e) {
	var t = Lt;
	Lt = !0;
	try {
		var n;
		for (e && (F !== null && !F.is_fork && F.flush(), n = e());;) {
			if (Qe(), F === null) return n;
			F.flush();
		}
	} finally {
		Lt = t;
	}
}
function Gt() {
	try {
		Se();
	} catch (e) {
		et(e, It);
	}
}
var Kt = null;
function qt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && fr(r) && (Kt = /* @__PURE__ */ new Set(), _r(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Hn(r), Kt?.size > 0)) {
				Qt.clear();
				for (let e of Kt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Kt.has(n) && (Kt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || _r(n);
					}
				}
				Kt.clear();
			}
		}
		Kt = null;
	}
}
function Jt(e) {
	F.schedule(e);
}
function Yt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), P(e, _);
		for (var n = e.first; n !== null;) Yt(n, t), n = n.next;
	}
}
function Xt(e) {
	P(e, _);
	for (var t = e.first; t !== null;) Xt(t), t = t.next;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
var Zt = /* @__PURE__ */ new Set(), Qt = /* @__PURE__ */ new Map(), $t = !1;
function en(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: ze,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function I(e, t) {
	let n = en(e, t);
	return nr(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function tn(e, t = !1, n = !0) {
	let r = en(e);
	return t || (r.equals = Ve), r;
}
function L(e, t, n = !1) {
	return H !== null && (!Qn || H.f & 131072) && Ke() && H.f & 4325394 && (tr === null || !tr.has(e)) && Ee(), nn(e, n ? sn(t) : t, Bt);
}
function nn(e, t, n = null) {
	if (!e.equals(t)) {
		Qt.set(e, Xn ? t : e.v);
		var r = Ut.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && kt(t), Ft === null && nt(t);
		}
		e.wv = dr(), on(e, v, n), Ke() && U !== null && U.f & 1024 && !(U.f & 96) && (ar === null ? or([e]) : ar.push(e)), !r.is_fork && Zt.size > 0 && !$t && rn();
	}
	return t;
}
function rn() {
	$t = !1;
	for (let e of Zt) {
		e.f & 1024 && P(e, y);
		let t;
		try {
			t = fr(e);
		} catch {
			t = !0;
		}
		t && _r(e);
	}
	Zt.clear();
}
function an(e) {
	L(e, e.v + 1);
}
function on(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Ke(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === U)) {
			var l = (c & v) === 0;
			if (l && P(s, t), c & 131072) Zt.add(s);
			else if (c & 2) {
				var u = s;
				Ft?.delete(u), c & 65536 || (c & 512 && (U === null || !(U.f & 2097152)) && (s.f |= ne), on(u, y, n));
			} else if (l) {
				var d = s;
				c & 16 && Kt !== null && Kt.add(d), n === null ? Jt(d) : n.push(d);
			}
		}
	}
}
function sn(t) {
	if (typeof t != "object" || !t || oe in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ I(0), u = null, d = lr, f = (e) => {
		if (lr === d) return e();
		var t = H, n = lr;
		$n(null), ur(d);
		var r = e();
		return $n(t), ur(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ I(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && we();
			var i = r.get(t);
			return i === void 0 ? f(() => {
				var e = /* @__PURE__ */ I(n.value, u);
				return r.set(t, e), e;
			}) : L(i, n.value, !0), !0;
		},
		deleteProperty(e, t) {
			var n = r.get(t);
			if (n === void 0) {
				if (t in e) {
					let e = f(() => /* @__PURE__ */ I(D, u));
					r.set(t, e), an(o);
				}
			} else L(n, D), an(o);
			return !0;
		},
		get(e, n, i) {
			if (n === oe) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ I(sn(s ? e[n] : D), u)), r.set(n, o)), o !== void 0) {
				var c = W(o);
				return c === D ? void 0 : c;
			}
			return Reflect.get(e, n, i);
		},
		getOwnPropertyDescriptor(e, t) {
			var n = Reflect.getOwnPropertyDescriptor(e, t);
			if (n && "value" in n) {
				var i = r.get(t);
				i && (n.value = W(i));
			} else if (n === void 0) {
				var a = r.get(t), o = a?.v;
				if (a !== void 0 && o !== D) return {
					enumerable: !0,
					configurable: !0,
					value: o,
					writable: !0
				};
			}
			return n;
		},
		has(e, t) {
			if (t === oe) return !0;
			var n = r.get(t), i = n !== void 0 && n.v !== D || Reflect.has(e, t);
			return (n !== void 0 || U !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ I(i ? sn(e[t]) : D, u)), r.set(t, n)), W(n) === D) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ I(D, u)), r.set(d + "", p)) : L(p, D);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ I(void 0, u)), L(c, sn(n)), r.set(t, c));
			else {
				l = c.v !== D;
				var m = f(() => sn(n));
				L(c, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(s, n), !l) {
				if (i && typeof t == "string") {
					var g = r.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && L(g, _ + 1);
				}
				an(o);
			}
			return !0;
		},
		ownKeys(e) {
			W(o);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = r.get(e);
				return t === void 0 || t.v !== D;
			});
			for (var [n, i] of r) i.v !== D && !(n in e) && t.push(n);
			return t;
		},
		setPrototypeOf() {
			Te();
		}
	});
}
function cn(e) {
	try {
		if (typeof e == "object" && e && oe in e) return e[oe];
	} catch {}
	return e;
}
function ln(e, t) {
	return Object.is(cn(e), cn(t));
}
var un, dn, fn, pn, mn;
function hn() {
	if (un === void 0) {
		un = window, dn = document, fn = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		pn = a(t, "firstChild").get, mn = a(t, "nextSibling").get, u(e) && (e[ue] = void 0, e[le] = null, e[de] = void 0, e.__e = void 0), u(n) && (n[fe] = void 0);
	}
}
function gn(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function _n(e) {
	return pn.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function vn(e) {
	return mn.call(e);
}
function R(e, t) {
	if (!O) return /* @__PURE__ */ _n(e);
	var n = /* @__PURE__ */ _n(k);
	if (n === null) n = k.appendChild(gn());
	else if (t && n.nodeType !== 3) {
		var r = gn();
		return n?.before(r), A(r), r;
	}
	return t && Cn(n), A(n), n;
}
function yn(e, t = !1) {
	if (!O) {
		var n = /* @__PURE__ */ _n(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ vn(n) : n;
	}
	if (t) {
		if (k?.nodeType !== 3) {
			var r = gn();
			return k?.before(r), A(r), r;
		}
		Cn(k);
	}
	return k;
}
function z(e, t = 1, n = !1) {
	let r = O ? k : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ vn(r);
	if (!O) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = gn();
			return r === null ? i?.after(a) : r.before(a), A(a), a;
		}
		Cn(r);
	}
	return A(r), r;
}
function bn(e) {
	e.textContent = "";
}
function xn() {
	return !1;
}
function Sn(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function Cn(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/effects.js
function wn(e) {
	U === null && (H === null && xe(e), be()), Xn && ye(e);
}
function Tn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function En(e, t) {
	var n = U;
	n !== null && n.f & 8192 && (e |= b);
	var r = {
		ctx: N,
		deps: null,
		nodes: null,
		f: e | v | 512,
		first: null,
		fn: t,
		last: null,
		next: null,
		parent: n,
		b: n && n.b,
		prev: null,
		teardown: null,
		wv: 0,
		ac: null
	};
	F?.register_created_effect(r);
	var i = r;
	if (e & 4) zt === null ? Ut.ensure().schedule(r) : zt.push(r);
	else if (t !== null) {
		try {
			_r(r);
		} catch (e) {
			throw V(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= w));
	}
	if (i !== null && (i.parent = n, n !== null && Tn(i, n), H !== null && H.f & 2 && !(e & 64))) {
		var a = H;
		(a.effects ??= []).push(i);
	}
	return r;
}
function Dn() {
	return H !== null && !Qn;
}
function On(e) {
	let t = En(8, null);
	return P(t, _), t.teardown = e, t;
}
function kn(e) {
	wn("$effect");
	var t = U.f;
	if (!H && t & 32 && N !== null && !N.i) {
		var n = N;
		(n.e ??= []).push(e);
	} else return An(e);
}
function An(e) {
	return En(4 | ee, e);
}
function jn(e) {
	Ut.ensure();
	let t = En(64 | E, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? Un(t, () => {
			V(t), n(void 0);
		}) : (V(t), n(void 0));
	});
}
function Mn(e) {
	return En(4, e);
}
function Nn(e) {
	return En(ie | E, e);
}
function Pn(e, t = 0) {
	return En(8 | t, e);
}
function B(e, t = [], n = [], r = []) {
	yt(r, t, n, (t) => {
		En(8, () => {
			e(...t.map(W));
		});
	});
}
function Fn(e, t = 0) {
	return En(16 | t, e);
}
function In(e, t = 0) {
	return En(g | t, e);
}
function Ln(e) {
	return En(32 | E, e);
}
function Rn(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = Xn, n = H;
		Zn(!0), $n(null);
		try {
			t.call(null);
		} finally {
			Zn(e), $n(n);
		}
	}
}
function zn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && pt(() => {
			e.abort(me);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : V(n, t), n = r;
	}
}
function Bn(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || V(t), t = n;
	}
}
function V(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (Vn(e.nodes.start, e.nodes.end), n = !0), e.f |= C, zn(e, t && !n), gr(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	Rn(e), e.f ^= C, e.f |= x;
	var i = e.parent;
	i !== null && i.first !== null && Hn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Vn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ vn(e);
		e.remove(), e = n;
	}
}
function Hn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Un(e, t, n = !0) {
	var r = [];
	Wn(e, r, !0);
	var i = () => {
		n && V(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function Wn(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= b;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				Wn(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function Gn(e) {
	Kn(e, !0);
}
function Kn(e, t) {
	if (e.f & 8192) {
		e.f ^= b, e.f & 1024 || (P(e, v), Ut.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			Kn(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function qn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ vn(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var Jn = null, Yn = !1, Xn = !1;
function Zn(e) {
	Xn = e;
}
var H = null, Qn = !1;
function $n(e) {
	H = e;
}
var U = null;
function er(e) {
	U = e;
}
var tr = null;
function nr(e) {
	H !== null && (tr ??= /* @__PURE__ */ new Set()).add(e);
}
var rr = null, ir = 0, ar = null;
function or(e) {
	ar = e;
}
var sr = 1, cr = 0, lr = cr;
function ur(e) {
	lr = e;
}
function dr() {
	return ++sr;
}
function fr(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~ne), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (fr(a) && At(a), a.wv > e.wv) return !0;
		}
		t & 512 && Ft === null && P(e, _);
	}
	return !1;
}
function pr(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(tr !== null && tr.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? pr(a, t, !1) : t === a && (n ? P(a, v) : a.f & 1024 && P(a, y), Jt(a));
	}
}
function mr(e) {
	var t = rr, n = ir, r = ar, i = H, a = tr, o = N, s = Qn, c = lr, l = e.f;
	rr = null, ir = 0, ar = null, H = l & 96 ? null : e, tr = null, He(e.ctx), Qn = !1, lr = ++cr, e.ac !== null && (pt(() => {
		e.ac.abort(me);
	}), e.ac = null);
	try {
		e.f |= re;
		var u = e.fn, d = u();
		e.f |= S;
		var f = e.deps, p = F?.is_fork;
		if (rr !== null) {
			var m;
			if (p || gr(e, ir), f !== null && ir > 0) for (f.length = ir + rr.length, m = 0; m < rr.length; m++) f[ir + m] = rr[m];
			else e.deps = f = rr;
			if (Dn() && e.f & 512) for (m = ir; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && ir < f.length && (gr(e, ir), f.length = ir);
		if (Ke() && ar !== null && !Qn && f !== null && !(e.f & 6146)) for (m = 0; m < ar.length; m++) pr(ar[m], e);
		if (i !== null && i !== e) {
			if (cr++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = cr;
			if (t !== null) for (let e of t) e.rv = cr;
			ar !== null && (r === null ? r = ar : r.push(...ar));
		}
		return e.f & 8388608 && (e.f ^= ae), d;
	} catch (e) {
		return $e(e);
	} finally {
		e.f ^= re, rr = t, ir = n, ar = r, H = i, tr = a, He(o), Qn = s, lr = c;
	}
}
function hr(e, r) {
	let i = r.reactions;
	if (i !== null) {
		var a = t.call(i, e);
		if (a !== -1) {
			var o = i.length - 1;
			o === 0 ? i = r.reactions = null : (i[a] = i[o], i.pop());
		}
	}
	if (i === null && r.f & 2 && (rr === null || !n.call(rr, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512, s.f &= ~ne), s.v !== D && nt(s), s.ac !== null && pt(() => {
			s.ac.abort(me), s.ac = null, P(s, v);
		}), jt(s), gr(s, 0);
	}
}
function gr(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) hr(e, n[r]);
}
function _r(e) {
	var t = e.f;
	if (!(t & 16384)) {
		P(e, _);
		var n = U, r = Yn;
		U = e, Yn = !(t & 96);
		try {
			t & 16777232 ? Bn(e) : zn(e), Rn(e);
			var i = mr(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = sr;
		} finally {
			Yn = r, U = n;
		}
	}
}
async function vr() {
	await Promise.resolve(), Wt();
}
function W(e) {
	var t = !!(e.f & 2);
	if (Jn?.add(e), H !== null && !Qn && !(U !== null && U.f & 16384) && (tr === null || !tr.has(e))) {
		var r = H.deps;
		if (H.f & 2097152) e.rv < cr && (e.rv = cr, rr === null && r !== null && r[ir] === e ? ir++ : rr === null ? rr = [e] : rr.push(e));
		else {
			H.deps ??= [], n.call(H.deps, e) || H.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [H] : n.call(i, H) || i.push(H);
		}
	}
	if (Xn && Qt.has(e)) return Qt.get(e);
	if (t) {
		var a = e;
		if (Xn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || br(a)) && (o = kt(a)), Qt.set(a, o), o;
		}
		var s = !(a.f & 512) && !Qn && H !== null && (Yn || !!(H.f & 512)), c = (a.f & S) === 0;
		fr(a) && (s && (a.f |= 512), At(a)), s && !c && (Mt(a), yr(a));
	}
	if (Ft?.has(e)) return Ft.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function yr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Mt(t), yr(t));
}
function br(e) {
	if (e.v === D) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Qt.has(t) || t.f & 2 && br(t)) return !0;
	return !1;
}
function xr(e) {
	var t = Qn;
	try {
		return Qn = !0, e();
	} finally {
		Qn = t;
	}
}
//#endregion
//#region node_modules/svelte/src/utils.js
function Sr(e) {
	return e.endsWith("capture") && e !== "gotpointercapture" && e !== "lostpointercapture";
}
var Cr = [
	"beforeinput",
	"click",
	"change",
	"dblclick",
	"contextmenu",
	"focusin",
	"focusout",
	"input",
	"keydown",
	"keyup",
	"mousedown",
	"mousemove",
	"mouseout",
	"mouseover",
	"mouseup",
	"pointerdown",
	"pointermove",
	"pointerout",
	"pointerover",
	"pointerup",
	"touchend",
	"touchmove",
	"touchstart"
];
function wr(e) {
	return Cr.includes(e);
}
var Tr = /* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split("."), Er = {
	formnovalidate: "formNoValidate",
	ismap: "isMap",
	nomodule: "noModule",
	playsinline: "playsInline",
	readonly: "readOnly",
	defaultvalue: "defaultValue",
	defaultchecked: "defaultChecked",
	srcobject: "srcObject",
	novalidate: "noValidate",
	allowfullscreen: "allowFullscreen",
	disablepictureinpicture: "disablePictureInPicture",
	disableremoteplayback: "disableRemotePlayback"
};
function Dr(e) {
	return e = e.toLowerCase(), Er[e] ?? e;
}
[...Tr];
var Or = ["touchstart", "touchmove"];
function kr(e) {
	return Or.includes(e);
}
var Ar = [
	"textarea",
	"script",
	"style",
	"title"
];
function jr(e) {
	return Ar.includes(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var Mr = Symbol("events"), Nr = /* @__PURE__ */ new Set(), Pr = /* @__PURE__ */ new Set();
function Fr(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || Br.call(t, e), !e.cancelBubble) return pt(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ze(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function Ir(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = Fr(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && On(() => {
		t.removeEventListener(e, o, a);
	});
}
function Lr(e, t, n) {
	(t[Mr] ??= {})[e] = n;
}
function Rr(e) {
	for (var t = 0; t < e.length; t++) Nr.add(e[t]);
	for (var n of Pr) n(e);
}
var zr = null;
function Br(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	zr = e;
	var s = 0, c = zr === e && e[Mr];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[Mr] = t;
			return;
		}
		var u = a.indexOf(t);
		if (u === -1) return;
		l <= u && (s = l);
	}
	if (o = a[s] || e.target, o !== t) {
		i(e, "currentTarget", {
			configurable: !0,
			get() {
				return o || n;
			}
		});
		var d = H, f = U;
		$n(null), er(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[Mr]?.[r];
					h != null && (!o.disabled || e.target === o) && h.call(o, e);
				} catch (e) {
					p ? m.push(e) : p = e;
				}
				if (e.cancelBubble) break;
				s++, o = s < a.length ? a[s] : null;
			}
			if (p) {
				for (let e of m) queueMicrotask(() => {
					throw e;
				});
				throw p;
			}
		} finally {
			e[Mr] = t, delete e.currentTarget, $n(d), er(f);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var Vr = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function Hr(e) {
	return Vr?.createHTML(e) ?? e;
}
function Ur(e) {
	var t = Sn("template");
	return t.innerHTML = Hr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function Wr(e, t) {
	var n = U;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function G(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		if (O) return Wr(k, null), k;
		i === void 0 && (i = Ur(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ _n(i)));
		var t = r || fn ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ _n(t), s = t.lastChild;
			Wr(o, s);
		} else Wr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Gr(e, t, n = "svg") {
	var r = !e.startsWith("<!>"), i = !!(t & 1), a = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
	return () => {
		if (O) return Wr(k, null), k;
		if (!o) {
			var e = /* @__PURE__ */ _n(Ur(a));
			if (i) for (o = document.createDocumentFragment(); /* @__PURE__ */ _n(e);) o.appendChild(/* @__PURE__ */ _n(e));
			else o = /* @__PURE__ */ _n(e);
		}
		var t = o.cloneNode(!0);
		if (i) {
			var n = /* @__PURE__ */ _n(t), r = t.lastChild;
			Wr(n, r);
		} else Wr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Kr(e, t) {
	return /* @__PURE__ */ Gr(e, t, "svg");
}
function qr(e = "") {
	if (!O) {
		var t = gn(e + "");
		return Wr(t, t), t;
	}
	var n = k;
	return n.nodeType === 3 ? Cn(n) : (n.before(n = gn()), A(n)), Wr(n, n), n;
}
function Jr() {
	if (O) return Wr(k, null), k;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = gn();
	return e.append(t, n), Wr(t, n), e;
}
function K(e, t) {
	if (O) {
		var n = U;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = k), Ie();
		return;
	}
	e !== null && e.before(t);
}
function q(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[fe] ??= e.nodeValue) && (e[fe] = n, e.nodeValue = `${n}`);
}
function Yr(e, t) {
	return Zr(e, t);
}
var Xr = /* @__PURE__ */ new Map();
function Zr(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	hn();
	var l = void 0, u = jn(() => {
		var s = n ?? t.appendChild(gn());
		_t(s, { pending: () => {} }, (t) => {
			We({});
			var n = N;
			if (o && (n.c = o), a && (i.$$events = a), O && Wr(t, null), l = e(t, i) || {}, O && (U.nodes.end = k, k === null || k.nodeType !== 8 || k.data !== "]")) throw Me(), Oe;
			Ge();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = kr(r);
					for (let e of [t, document]) {
						var a = Xr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Xr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, Br, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(Nr)), Pr.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = Xr.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, Br), r.delete(e), r.size === 0 && Xr.delete(n)) : r.set(e, i);
			}
			Pr.delete(d), s !== n && s.parentNode?.removeChild(s);
		};
	});
	return Qr.set(l, u), l;
}
var Qr = /* @__PURE__ */ new WeakMap();
function $r(e, t) {
	let n = Qr.get(e);
	return n ? (Qr.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/branches.js
var ei = class {
	anchor;
	#e = /* @__PURE__ */ new Map();
	#t = /* @__PURE__ */ new Map();
	#n = /* @__PURE__ */ new Map();
	#r = /* @__PURE__ */ new Set();
	#i = !0;
	constructor(e, t = !0) {
		this.anchor = e, this.#i = t;
	}
	#a = (e) => {
		if (this.#e.has(e)) {
			var t = this.#e.get(e), n = this.#t.get(t);
			if (n) Gn(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (Gn(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (V(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						qn(r, t), t.append(gn()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else V(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), Un(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (V(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = F, r = xn();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = gn();
				i.append(a), this.#n.set(e, {
					effect: Ln(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, Ln(() => t(this.anchor)));
		}
		if (this.#e.set(n, e), r) {
			for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
			for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
			n.oncommit(this.#a), n.ondiscard(this.#o);
		} else O && (this.anchor = k), this.#a(n);
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function J(e, t, n = !1) {
	var r;
	O && (r = k, Ie());
	var i = new ei(e), a = n ? w : 0;
	function o(e, t) {
		if (O) {
			var n = Re(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Le();
				A(a), i.anchor = a, Fe(!1), i.ensure(e, t), Fe(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	Fn(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function ti(e, t) {
	return t;
}
function ni(e, t, n) {
	for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
		let n = t[c];
		Un(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					ri(e, r(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
				}
			} else --s;
		}, !1);
	}
	if (s === 0) {
		var l = i.length === 0 && n !== null;
		if (l) {
			var u = n, d = u.parentNode;
			bn(d), d.append(u), e.items.clear();
		}
		ri(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function ri(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= te, qn(a, document.createDocumentFragment())) : V(t[i], n);
	}
}
var ii;
function ai(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = O ? A(/* @__PURE__ */ _n(u)) : u.appendChild(gn());
	}
	O && Ie();
	var d = null, f = /* @__PURE__ */ Dt(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, si(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= te, li(d, null, c)) : Gn(d) : Un(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: Fn(() => {
			p = W(f);
			var e = p.length;
			let t = !1;
			O && Re(c) === "[!" != (e === 0) && (c = Le(), A(c), Fe(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = F, v = xn(), y = 0; y < e; y += 1) {
				O && k.nodeType === 8 && k.data === "]" && (c = k, t = !0, Fe(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && nn(S.v, b), S.i && nn(S.i, y), v && u.unskip_effect(S.e)) : (S = ci(l, h ? c : ii ??= gn(), b, x, y, o, n, i), h || (S.e.f |= te), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = Ln(() => s(c)) : (d = Ln(() => s(ii ??= gn())), d.f |= te)), e > r.size && ve("", "", ""), O && e > 0 && A(Le()), !h) {
				if (m.set(u, r), v) {
					for (let [e, t] of l) r.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			t && Fe(!0), W(f);
		}),
		flags: n,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, O && (c = k);
}
function oi(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function si(e, t, n, i, a) {
	var o = !!(i & 8), s = t.length, c = e.items, l = oi(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = a(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = a(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (Gn(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= te, _ === l) li(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), ui(e, d, _), ui(e, _, y), li(_, y, n), d = _, p = [], m = [], l = oi(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) li(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					ui(e, S.prev, C.next), ui(e, d, S), ui(e, C, b), l = b, d = C, --v, p = [], m = [];
				} else u.delete(_), li(_, l, n), ui(e, _.prev, _.next), ui(e, _, d === null ? e.effect.first : d.next), ui(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = oi(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = oi(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (ri(e, r(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var w = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || w.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && w.push(l), l = oi(l.next);
		var T = w.length;
		if (T > 0) {
			var E = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < T; v += 1) w[v].nodes?.a?.measure();
				for (v = 0; v < T; v += 1) w[v].nodes?.a?.fix();
			}
			ni(e, w, E);
		}
	}
	o && Ze(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function ci(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? en(n) : /* @__PURE__ */ tn(n, !1, !1) : null, l = o & 2 ? en(i) : null;
	return {
		v: c,
		i: l,
		e: Ln(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function li(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ vn(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function ui(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/snippet.js
function di(e, t, ...n) {
	var r = new ei(e);
	Fn(() => {
		let e = t() ?? null;
		r.ensure(e, e && ((t) => e(t, ...n)));
	}, w);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/svelte-element.js
function fi(e, t, n, r, i, a) {
	let o = O;
	O && Ie();
	var s = null;
	O && k.nodeType === 1 && (s = k, Ie());
	var c = O ? k : e, l = new ei(c, !1);
	Fn(() => {
		let e = t() || null;
		var a = i ? i() : n || e === "svg" ? Ae : void 0;
		if (e === null) {
			l.ensure(null, null);
			return;
		}
		return l.ensure(e, (t) => {
			if (e) {
				if (s = O ? s : Sn(e, a), Wr(s, s), r) {
					var n = null;
					O && jr(e) && s.append(n = document.createComment(""));
					var i = O ? /* @__PURE__ */ _n(s) : s.appendChild(gn());
					O && (i === null ? Fe(!1) : A(i)), r(s, i), n?.remove();
				}
				U.nodes.end = s, t.before(s);
			}
			O && A(t);
		}), () => {};
	}, w), On(() => {}), o && (Fe(!0), A(c));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/svelte-head.js
function pi(e, t) {
	let n = null, r = O;
	var i;
	if (O) {
		n = k;
		for (var a = /* @__PURE__ */ _n(document.head); a !== null && (a.nodeType !== 8 || a.data !== e);) a = /* @__PURE__ */ vn(a);
		if (a === null) Fe(!1);
		else {
			var o = /* @__PURE__ */ vn(a);
			a.remove(), A(o);
		}
	}
	O || (i = document.head.appendChild(gn()));
	try {
		Fn(() => {
			var e = Ln(() => t(i));
			e.f |= T;
		});
	} finally {
		r && (Fe(!0), A(n));
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attachments.js
function mi(e, t) {
	var n = void 0, r;
	In(() => {
		n !== (n = t()) && (r &&= (V(r), null), n && (r = Ln(() => {
			Mn(() => n(e));
		})));
	});
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function hi(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = hi(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function gi() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = hi(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
function _i(e) {
	return typeof e == "object" ? gi(e) : e ?? "";
}
var vi = [..." 	\n\r\f\xA0\v﻿"];
function yi(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || vi.includes(r[o - 1])) && (s === r.length || vi.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function bi(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function xi(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function Si(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(xi)), i && c.push(...Object.keys(i).map(xi));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = xi(e.substring(l, u).trim());
							if (!c.includes(p)) {
								f !== ";" && d++;
								var m = e.substring(l, d).trim();
								n += " " + m + ";";
							}
						}
						l = d + 1, u = -1;
					}
				}
			}
		}
		return r && (n += bi(r)), i && (n += bi(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function Ci(e, t, n, r, i, a) {
	var o = e[ue];
	if (O || o !== n || o === void 0) {
		var s = yi(n, r, a);
		(!O || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[ue] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
function wi(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function Ti(e, t, n, r) {
	var i = e[de];
	if (O || i !== t) {
		var a = Si(t, r);
		(!O || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[de] = t;
	} else r && (Array.isArray(r) ? (wi(e, n?.[0], r[0]), wi(e, n?.[1], r[1], "important")) : wi(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function Ei(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return Ne();
		for (var i of t.options) i.selected = n.includes(ki(i));
		return;
	}
	for (i of t.options) if (ln(ki(i), n)) {
		i.selected = !0;
		return;
	}
	(!r || n !== void 0) && (t.selectedIndex = -1);
}
function Di(e) {
	var t = new MutationObserver(() => {
		"__value" in e && Ei(e, e.__value);
	});
	t.observe(e, {
		childList: !0,
		subtree: !0,
		attributes: !0,
		attributeFilter: ["value"]
	}), On(() => {
		t.disconnect();
	});
}
function Oi(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	mt(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), ki);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && ki(o);
		}
		n(a), e.__value = a, F !== null && r.add(F);
	}), Mn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = F;
			if (r.has(o)) return;
		}
		if (Ei(e, a, i), i && a === void 0) {
			var s = e.querySelector(":checked");
			s !== null && (a = ki(s), n(a));
		}
		e.__value = a, i = !1;
	}), Di(e);
}
function ki(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var Ai = Symbol("class"), ji = Symbol("style"), Mi = Symbol("is custom element"), Ni = Symbol("is html"), Pi = he ? "link" : "LINK", Fi = he ? "input" : "INPUT", Ii = he ? "option" : "OPTION", Li = he ? "select" : "SELECT";
function Y(e) {
	if (O) {
		var t = !1, n = () => {
			if (!t) {
				if (t = !0, e.hasAttribute("value")) {
					var n = e.value;
					zi(e, "value", null), e.value = n;
				}
				if (e.hasAttribute("checked")) {
					var r = e.checked;
					zi(e, "checked", null), e.checked = r;
				}
			}
		};
		e[pe] = n, Ze(n), ft();
	}
}
function Ri(e, t) {
	t ? e.hasAttribute("selected") || e.setAttribute("selected", "") : e.removeAttribute("selected");
}
function zi(e, t, n, r) {
	var i = Hi(e);
	O && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === Pi) || i[t] !== (i[t] = n) && (t === "loading" && (e[ce] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Wi(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function Bi(e, t, n, r, i = !1, a = !1) {
	if (O && i && e.nodeName === Fi) {
		var o = e;
		(o.type === "checkbox" ? "defaultChecked" : "defaultValue") in n || Y(o);
	}
	var s = Hi(e), c = s[Mi], l = !s[Ni];
	let u = O && c;
	u && Fe(!1);
	var d = t || {}, f = e.nodeName === Ii;
	for (var p in t) p in n || (n[p] = null);
	n.class ? n.class = _i(n.class) : (r || n[Ai]) && (n.class = null), n[ji] && (n.style ??= null);
	var m = Wi(e);
	if (e.nodeName === Fi && "type" in n && ("value" in n || "__value" in n)) {
		var h = n.type;
		(h !== d.type || h === void 0 && e.hasAttribute("type")) && (d.type = h, zi(e, "type", h, a));
	}
	for (let i in n) {
		let o = n[i];
		if (f && i === "value" && o == null) {
			e.value = e.__value = "", d[i] = o;
			continue;
		}
		if (i === "class") {
			Ci(e, e.namespaceURI === "http://www.w3.org/1999/xhtml", o, r, t?.[Ai], n[Ai]), d[i] = o, d[Ai] = n[Ai];
			continue;
		}
		if (i === "style") {
			Ti(e, o, t?.[ji], n[ji]), d[i] = o, d[ji] = n[ji];
			continue;
		}
		var g = d[i];
		if (!(o === g && !(o === void 0 && e.hasAttribute(i)))) {
			d[i] = o;
			var _ = i[0] + i[1];
			if (_ !== "$$") {
				if (_ === "on") {
					let t = {}, n = "$$" + i, r = i.slice(2);
					var v = wr(r);
					if (Sr(r) && (r = r.slice(0, -7), t.capture = !0), !v && g) {
						if (o != null) continue;
						e.removeEventListener(r, d[n], t), d[n] = null;
					}
					if (v) Lr(r, e, o), Rr([r]);
					else if (o != null) {
						function a(e) {
							d[i].call(this, e);
						}
						d[n] = Fr(r, e, a, t);
					}
				} else if (i === "style") zi(e, i, o);
				else if (i === "autofocus") lt(e, !!o);
				else if (!c && (i === "__value" || i === "value" && o != null)) e.value = e.__value = o;
				else if (i === "selected" && f) Ri(e, o);
				else {
					var y = i;
					l || (y = Dr(y));
					var b = y === "defaultValue" || y === "defaultChecked";
					if (o == null && !c && !b) {
						if (s[i] = null, y === "value" || y === "checked") {
							let n = e, r = t === void 0;
							if (y === "value") {
								let e = n.defaultValue;
								n.removeAttribute(y), n.defaultValue = e, n.value = n.__value = r ? e : null;
							} else {
								let e = n.defaultChecked;
								n.removeAttribute(y), n.defaultChecked = e, n.checked = r ? e : !1;
							}
						} else e.removeAttribute(i);
					} else b || m.includes(y) && (c || typeof o != "string") ? (e[y] = o, y in s && (s[y] = D)) : typeof o != "function" && zi(e, y, o, a);
				}
			}
		}
	}
	return u && Fe(!0), d;
}
function Vi(e, t, n = [], r = [], i = [], a, o = !1, s = !1) {
	yt(i, n, r, (n) => {
		var r = void 0, i = {}, c = e.nodeName === Li, l = !1;
		if (In(() => {
			var u = t(...n.map(W)), d = Bi(e, r, u, a, o, s);
			l && c && "value" in u && Ei(e, u.value);
			for (let e of Object.getOwnPropertySymbols(i)) u[e] || V(i[e]);
			for (let t of Object.getOwnPropertySymbols(u)) {
				var f = u[t];
				t.description === "@attach" && (!r || f !== r[t]) && (i[t] && V(i[t]), i[t] = Ln(() => mi(e, () => f))), d[t] = f;
			}
			r = d;
		}), c) {
			var u = e;
			Mn(() => {
				Ei(u, r.value, !0), Di(u);
			});
		}
		l = !0;
	});
}
function Hi(e) {
	return e[le] ??= {
		[Mi]: e.nodeName.includes("-"),
		[Ni]: e.namespaceURI === ke
	};
}
var Ui = /* @__PURE__ */ new Map();
function Wi(e) {
	var t = e.getAttribute("is") || e.nodeName, n = Ui.get(t);
	if (n) return n;
	Ui.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var s in r = o(i), r) r[s].set && s !== "innerHTML" && s !== "textContent" && s !== "innerText" && n.push(s);
		i = l(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function X(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	mt(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = Gi(e) ? Ki(a) : a, n(a), F !== null && r.add(F), await vr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (O && e.defaultValue !== e.value || xr(t) == null && e.value) && (n(Gi(e) ? Ki(e.value) : e.value), F !== null && r.add(F)), Pn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = F;
			if (r.has(i)) return;
		}
		Gi(e) && n === Ki(e.value) || e.type === "date" && !n && !e.value || n !== e.value && (e.value = n ?? "");
	});
}
function Gi(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function Ki(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
var qi = {
	get(e, t) {
		if (!e.exclude.has(t)) return e.props[t];
	},
	set(e, t) {
		return !1;
	},
	getOwnPropertyDescriptor(e, t) {
		if (!e.exclude.has(t) && t in e.props) return {
			enumerable: !0,
			configurable: !0,
			value: e.props[t]
		};
	},
	has(e, t) {
		return !e.exclude.has(t) && t in e.props;
	},
	ownKeys(e) {
		return Reflect.ownKeys(e.props).filter((t) => !e.exclude.has(t));
	}
};
/*#__NO_SIDE_EFFECTS__*/
function Z(e, t, n) {
	return new Proxy({
		props: e,
		exclude: t
	}, qi);
}
var Ji = {
	get(e, t) {
		let n = e.props.length;
		for (; n--;) {
			let r = e.props[n];
			if (d(r) && (r = r()), typeof r == "object" && r && t in r) return r[t];
		}
	},
	set(e, t, n) {
		let r = e.props.length;
		for (; r--;) {
			let i = e.props[r];
			d(i) && (i = i());
			let o = a(i, t);
			if (o && o.set) return o.set(n), !0;
		}
		return !1;
	},
	getOwnPropertyDescriptor(e, t) {
		let n = e.props.length;
		for (; n--;) {
			let r = e.props[n];
			if (d(r) && (r = r()), typeof r == "object" && r && t in r) {
				let e = a(r, t);
				return e && !e.configurable && (e.configurable = !0), e;
			}
		}
	},
	has(e, t) {
		if (t === oe || t === se) return !1;
		for (let n of e.props) if (d(n) && (n = n()), n != null && t in n) return !0;
		return !1;
	},
	ownKeys(e) {
		let t = [];
		for (let n of e.props) if (d(n) && (n = n()), n) {
			for (let e in n) t.includes(e) || t.push(e);
			for (let e of Object.getOwnPropertySymbols(n)) t.includes(e) || t.push(e);
		}
		return t;
	}
};
function Q(...e) {
	return new Proxy({ props: e }, Ji);
}
function Yi(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ Ct(r), W(u)) : (l && (l = !1, c = s ? xr(r) : r), c);
	let f;
	if (o) {
		var p = oe in e || se in e;
		f = a(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	o ? [m, h] = ct(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && Ce(t), f(m)));
	var g = i ? () => {
		var n = e[t];
		return n === void 0 ? d() : (l = !0, n);
	} : () => {
		var n = e[t];
		return n !== void 0 && (c = void 0), n === void 0 ? c : n;
	};
	if (i && !(n & 4)) return g;
	if (f) {
		var _ = e.$$legacy;
		return (function(e, t) {
			return arguments.length > 0 ? ((!i || !t || _ || h) && f(t ? g() : e), e) : g();
		});
	}
	var v = !1, y = (n & 1 ? Ct : Dt)(() => (v = !1, g()));
	o && W(y);
	var b = U;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? W(y) : i && o ? sn(e) : e;
			return L(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Xn && v || b.f & 16384 ? y.v : W(y);
	});
}
function Xi(e) {
	N === null && ge("onMount"), kn(() => {
		let t = xr(e);
		if (typeof t == "function") return t;
	});
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region node_modules/@lucide/svelte/dist/defaultAttributes.js
var Zi = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	"stroke-width": 2,
	"stroke-linecap": "round",
	"stroke-linejoin": "round"
}, Qi = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, $i = Symbol("lucide-context"), ea = () => Ue($i), ta = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"name",
	"color",
	"size",
	"strokeWidth",
	"absoluteStrokeWidth",
	"iconNode",
	"children"
]), na = /* @__PURE__ */ Kr("<svg><!><!></svg>");
function $(e, t) {
	We(t, !0);
	let n = ea() ?? {}, r = Yi(t, "color", 19, () => n.color ?? "currentColor"), i = Yi(t, "size", 19, () => n.size ?? 24), a = Yi(t, "strokeWidth", 19, () => n.strokeWidth ?? 2), o = Yi(t, "absoluteStrokeWidth", 19, () => n.absoluteStrokeWidth ?? !1), s = Yi(t, "iconNode", 19, () => []), c = /* @__PURE__ */ Z(t, ta), l = /* @__PURE__ */ Et(() => o() ? Number(a()) * 24 / Number(i()) : a());
	var u = na();
	Vi(u, (e) => ({
		...Zi,
		...e,
		...c,
		width: i(),
		height: i(),
		stroke: r(),
		"stroke-width": W(l),
		class: [
			"lucide-icon lucide",
			n.class,
			t.name && `lucide-${t.name}`,
			t.class
		]
	}), [() => !t.children && !Qi(c) && { "aria-hidden": "true" }]);
	var d = R(u);
	ai(d, 17, s, ti, (e, t) => {
		var n = /* @__PURE__ */ Et(() => h(W(t), 2));
		let r = () => W(n)[0], i = () => W(n)[1];
		var a = Jr();
		fi(yn(a), r, !0, (e, t) => {
			Vi(e, () => ({ ...i() }));
		}), K(e, a);
	}), di(z(d), () => t.children ?? f), j(u), K(e, u), Ge();
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/activity.svelte
var ra = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function ia(e, t) {
	let n = /* @__PURE__ */ Z(t, ra), r = [["path", { d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" }]];
	$(e, Q({ name: "activity" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/bug.svelte
var aa = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function oa(e, t) {
	let n = /* @__PURE__ */ Z(t, aa), r = [
		["path", { d: "M12 20v-9" }],
		["path", { d: "M14 7a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4z" }],
		["path", { d: "M14.12 3.88 16 2" }],
		["path", { d: "M21 21a4 4 0 0 0-3.81-4" }],
		["path", { d: "M21 5a4 4 0 0 1-3.55 3.97" }],
		["path", { d: "M22 13h-4" }],
		["path", { d: "M3 21a4 4 0 0 1 3.81-4" }],
		["path", { d: "M3 5a4 4 0 0 0 3.55 3.97" }],
		["path", { d: "M6 13H2" }],
		["path", { d: "m8 2 1.88 1.88" }],
		["path", { d: "M9 7.13V6a3 3 0 1 1 6 0v1.13" }]
	];
	$(e, Q({ name: "bug" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/calendar-cog.svelte
var sa = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function ca(e, t) {
	let n = /* @__PURE__ */ Z(t, sa), r = [
		["path", { d: "m15.228 16.852-.923-.383" }],
		["path", { d: "m15.228 19.148-.923.383" }],
		["path", { d: "M16 2v3" }],
		["path", { d: "m16.47 14.305.382.923" }],
		["path", { d: "m16.852 20.772-.383.924" }],
		["path", { d: "m19.148 15.228.383-.923" }],
		["path", { d: "m19.53 21.696-.382-.924" }],
		["path", { d: "m20.773 16.852.924-.383" }],
		["path", { d: "m20.773 19.148.924.383" }],
		["path", { d: "M21 10.5V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h5.5" }],
		["path", { d: "M3 9h18" }],
		["path", { d: "M8 2v3" }],
		["circle", {
			cx: "18",
			cy: "18",
			r: "3"
		}]
	];
	$(e, Q({ name: "calendar-cog" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/calendar-days.svelte
var la = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function ua(e, t) {
	let n = /* @__PURE__ */ Z(t, la), r = [
		["path", { d: "M8 2v3" }],
		["path", { d: "M16 2v3" }],
		["rect", {
			x: "3",
			y: "3",
			width: "18",
			height: "18",
			rx: "2"
		}],
		["path", { d: "M3 9h18" }],
		["path", { d: "M8 13h.01" }],
		["path", { d: "M12 13h.01" }],
		["path", { d: "M16 13h.01" }],
		["path", { d: "M8 17h.01" }],
		["path", { d: "M12 17h.01" }],
		["path", { d: "M16 17h.01" }]
	];
	$(e, Q({ name: "calendar-days" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/circle-alert.svelte
var da = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function fa(e, t) {
	let n = /* @__PURE__ */ Z(t, da), r = [
		["circle", {
			cx: "12",
			cy: "12",
			r: "10"
		}],
		["line", {
			x1: "12",
			x2: "12",
			y1: "8",
			y2: "12"
		}],
		["line", {
			x1: "12",
			x2: "12.01",
			y1: "16",
			y2: "16"
		}]
	];
	$(e, Q({ name: "circle-alert" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/circle-check.svelte
var pa = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function ma(e, t) {
	let n = /* @__PURE__ */ Z(t, pa), r = [["circle", {
		cx: "12",
		cy: "12",
		r: "10"
	}], ["path", { d: "m9 12 2 2 4-4" }]];
	$(e, Q({ name: "circle-check" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/clock-3.svelte
var ha = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function ga(e, t) {
	let n = /* @__PURE__ */ Z(t, ha), r = [["circle", {
		cx: "12",
		cy: "12",
		r: "10"
	}], ["path", { d: "M12 6v6h4" }]];
	$(e, Q({ name: "clock-3" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/git-compare-arrows.svelte
var _a = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function va(e, t) {
	let n = /* @__PURE__ */ Z(t, _a), r = [
		["circle", {
			cx: "5",
			cy: "6",
			r: "3"
		}],
		["path", { d: "M12 6h5a2 2 0 0 1 2 2v7" }],
		["path", { d: "m15 9-3-3 3-3" }],
		["circle", {
			cx: "19",
			cy: "18",
			r: "3"
		}],
		["path", { d: "M12 18H7a2 2 0 0 1-2-2V9" }],
		["path", { d: "m9 15 3 3-3 3" }]
	];
	$(e, Q({ name: "git-compare-arrows" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/house.svelte
var ya = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function ba(e, t) {
	let n = /* @__PURE__ */ Z(t, ya), r = [["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" }], ["path", { d: "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }]];
	$(e, Q({ name: "house" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/list-checks.svelte
var xa = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Sa(e, t) {
	let n = /* @__PURE__ */ Z(t, xa), r = [
		["path", { d: "M13 5h8" }],
		["path", { d: "M13 12h8" }],
		["path", { d: "M13 19h8" }],
		["path", { d: "m3 17 2 2 4-4" }],
		["path", { d: "m3 7 2 2 4-4" }]
	];
	$(e, Q({ name: "list-checks" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/moon.svelte
var Ca = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function wa(e, t) {
	let n = /* @__PURE__ */ Z(t, Ca), r = [["path", { d: "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" }]];
	$(e, Q({ name: "moon" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/rotate-ccw.svelte
var Ta = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Ea(e, t) {
	let n = /* @__PURE__ */ Z(t, Ta), r = [["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }], ["path", { d: "M3 3v5h5" }]];
	$(e, Q({ name: "rotate-ccw" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/save.svelte
var Da = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Oa(e, t) {
	let n = /* @__PURE__ */ Z(t, Da), r = [
		["path", { d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" }],
		["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" }],
		["path", { d: "M7 3v4a1 1 0 0 0 1 1h7" }]
	];
	$(e, Q({ name: "save" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/settings-2.svelte
var ka = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Aa(e, t) {
	let n = /* @__PURE__ */ Z(t, ka), r = [
		["path", { d: "M14 17H5" }],
		["path", { d: "M19 7h-9" }],
		["circle", {
			cx: "17",
			cy: "17",
			r: "3"
		}],
		["circle", {
			cx: "7",
			cy: "7",
			r: "3"
		}]
	];
	$(e, Q({ name: "settings-2" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/shield-check.svelte
var ja = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Ma(e, t) {
	let n = /* @__PURE__ */ Z(t, ja), r = [["path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" }], ["path", { d: "m9 12 2 2 4-4" }]];
	$(e, Q({ name: "shield-check" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/sun.svelte
var Na = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Pa(e, t) {
	let n = /* @__PURE__ */ Z(t, Na), r = [
		["circle", {
			cx: "12",
			cy: "12",
			r: "4"
		}],
		["path", { d: "M12 2v2" }],
		["path", { d: "M12 20v2" }],
		["path", { d: "m4.93 4.93 1.41 1.41" }],
		["path", { d: "m17.66 17.66 1.41 1.41" }],
		["path", { d: "M2 12h2" }],
		["path", { d: "M20 12h2" }],
		["path", { d: "m6.34 17.66-1.41 1.41" }],
		["path", { d: "m19.07 4.93-1.41 1.41" }]
	];
	$(e, Q({ name: "sun" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/sunrise.svelte
var Fa = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Ia(e, t) {
	let n = /* @__PURE__ */ Z(t, Fa), r = [
		["path", { d: "M12 2v8" }],
		["path", { d: "m4.93 10.93 1.41 1.41" }],
		["path", { d: "M2 18h2" }],
		["path", { d: "M20 18h2" }],
		["path", { d: "m19.07 10.93-1.41 1.41" }],
		["path", { d: "M22 22H2" }],
		["path", { d: "m8 6 4-4 4 4" }],
		["path", { d: "M16 18a4 4 0 0 0-8 0" }]
	];
	$(e, Q({ name: "sunrise" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/trash-2.svelte
var La = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Ra(e, t) {
	let n = /* @__PURE__ */ Z(t, La), r = [
		["path", { d: "M10 11v6" }],
		["path", { d: "M14 11v6" }],
		["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" }],
		["path", { d: "M3 6h18" }],
		["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }]
	];
	$(e, Q({ name: "trash-2" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region src/lib/adapters.ts
var za = class {
	async subscribe(e) {
		return () => void 0;
	}
}, Ba = class extends za {
	hass;
	kind = "ha-panel";
	constructor(e) {
		super(), this.hass = e;
	}
	get connection() {
		if (!this.hass.connection?.sendMessagePromise) throw Error("HA-Verbindung für Core State ist nicht verfügbar.");
		return this.hass.connection;
	}
	snapshot() {
		return this.connection.sendMessagePromise({ type: "benni_core_state/ux_snapshot" });
	}
	projection(e) {
		return this.connection.sendMessagePromise({
			type: "benni_core_state/ux_projection",
			days: e
		});
	}
	command(e, t, n = {}) {
		return this.connection.sendMessagePromise({
			type: "benni_core_state/ux_command",
			request_id: e,
			command: t,
			payload: n
		});
	}
	async subscribe(e) {
		return this.connection.subscribeMessage ? await this.connection.subscribeMessage((t) => {
			let n = t.event ?? t, r = n.snapshot ?? n;
			r?.contract === "benni_core_state.snapshot" && e(r);
		}, { type: "benni_core_state/ux_subscribe" }) ?? (() => void 0) : () => void 0;
	}
}, Va = class extends za {
	baseUrl;
	kind = "standalone";
	constructor(e = "") {
		super(), this.baseUrl = e;
	}
	async request(e, t) {
		let n = await fetch(`${this.baseUrl}${e}`, {
			credentials: "same-origin",
			headers: {
				"Content-Type": "application/json",
				...t?.headers ?? {}
			},
			...t
		});
		if (!n.ok) throw Error(`Core-State-Anfrage fehlgeschlagen (${n.status}).`);
		return n.json();
	}
	snapshot() {
		return this.request("/api/benni_core_state/snapshot");
	}
	projection(e) {
		return this.request(`/api/benni_core_state/projection?days=${e}`);
	}
	command(e, t, n = {}) {
		return this.request("/api/benni_core_state/commands", {
			method: "POST",
			body: JSON.stringify({
				request_id: e,
				command: t,
				payload: n
			})
		});
	}
};
function Ha(e) {
	return e?.connection ? new Ba(e) : new Va();
}
//#endregion
//#region src/lib/contracts.ts
var Ua = {
	loading: "Lädt",
	ready: "Aktuell",
	empty: "Leer",
	stale: "Veraltet",
	degraded: "Eingeschränkt",
	unavailable: "Nicht verfügbar",
	reconnecting: "Verbindet neu",
	offline: "Offline",
	error: "Fehler",
	blocked: "Blockiert"
};
function Wa(e) {
	return Ua[e] ?? e;
}
function Ga(e) {
	if (!e) return "—";
	let t = new Date(e);
	return Number.isNaN(t.valueOf()) ? e.slice(0, 5) : new Intl.DateTimeFormat("de-DE", {
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "Europe/Berlin"
	}).format(t);
}
function Ka(e) {
	let t = /* @__PURE__ */ new Date(`${e}T12:00:00+02:00`);
	return Number.isNaN(t.valueOf()) ? e : new Intl.DateTimeFormat("de-DE", {
		weekday: "short",
		day: "2-digit",
		month: "2-digit",
		timeZone: "Europe/Berlin"
	}).format(t);
}
function qa(e) {
	if (!e) return "—";
	let t = new Date(e);
	return Number.isNaN(t.valueOf()) ? e : new Intl.DateTimeFormat("de-DE", {
		dateStyle: "short",
		timeStyle: "short",
		timeZone: "Europe/Berlin"
	}).format(t);
}
function Ja(e, t = "") {
	return e == null ? "nicht belegt" : `${e}${t}`;
}
function Ya(e) {
	return e ? {
		provisional_sleep_protection: "Schutzstatus vor bestätigtem Schlaf",
		rule_wake: "Automatische Profilregel",
		holiday_to_weekend_profile: "Feiertag/Urlaub nutzt das Wochenendprofil",
		calendar_wake_marker: "Kalender-Wake-Markierung",
		calendar_skip_marker: "Kalender markiert diesen Tag als ohne Wake",
		waking_timeout: "Wachphase endet nach dem 30-Minuten-Schutzfenster",
		regular_wake_interaction: "Reguläre Wachinteraktion erkannt"
	}[e] ?? e.replaceAll("_", " ") : "Keine zusätzliche Begründung geliefert.";
}
//#endregion
//#region src/lib/store.ts
var Xa = class {
	state = {
		snapshot: null,
		projection: null,
		status: "loading",
		error: null,
		pendingCommand: null
	};
	adapter = null;
	adapterKind = null;
	listeners = /* @__PURE__ */ new Set();
	removeSubscription = null;
	pollTimer = null;
	subscribe(e) {
		return this.listeners.add(e), e(this.state), () => this.listeners.delete(e);
	}
	emit() {
		for (let e of this.listeners) e(this.state);
	}
	patch(e) {
		this.state = {
			...this.state,
			...e
		}, this.emit();
	}
	setAdapter(e) {
		this.adapterKind !== e.kind && (this.removeSubscription?.(), this.removeSubscription = null, this.pollTimer && clearInterval(this.pollTimer), this.adapter = e, this.adapterKind = e.kind, this.connect(e));
	}
	async connect(e) {
		try {
			this.removeSubscription = await e.subscribe((e) => {
				this.patch({
					snapshot: e,
					status: e.status,
					error: null
				});
			}), this.pollTimer = setInterval(() => void this.refresh(), 3e4), await this.refresh();
		} catch (e) {
			this.patch({
				status: "reconnecting",
				error: this.message(e)
			});
		}
	}
	async refresh() {
		if (!this.adapter) return;
		let e = this.state.snapshot !== null;
		this.patch({
			status: e ? "reconnecting" : "loading",
			error: null
		});
		try {
			let e = await this.adapter.snapshot();
			this.patch({
				snapshot: e,
				status: e.status,
				error: null
			});
		} catch (t) {
			this.patch({
				status: e ? "offline" : "error",
				error: this.message(t)
			});
		}
	}
	async loadProjection() {
		if (this.adapter) try {
			let e = await this.adapter.projection(14);
			this.patch({
				projection: e,
				error: null
			});
		} catch (e) {
			this.patch({ error: this.message(e) });
		}
	}
	async command(e, t = {}) {
		if (!this.adapter) return {
			contract: "benni_core_state.command_ack",
			version: "1.0.0",
			request_id: "",
			command: e,
			status: "error",
			error: "adapter_unavailable"
		};
		let n = `${e}:${crypto.randomUUID()}`;
		this.patch({
			pendingCommand: e,
			error: null
		});
		try {
			let r = await this.adapter.command(n, e, t);
			return r.status === "success" ? await this.refresh() : this.patch({ error: r.error ?? "Command fehlgeschlagen." }), r;
		} catch (t) {
			let r = {
				contract: "benni_core_state.command_ack",
				version: "1.0.0",
				request_id: n,
				command: e,
				status: "error",
				error: this.message(t)
			};
			return this.patch({ error: r.error }), r;
		} finally {
			this.patch({ pendingCommand: null });
		}
	}
	dispose() {
		this.removeSubscription?.(), this.pollTimer && clearInterval(this.pollTimer), this.listeners.clear();
	}
	message(e) {
		return e instanceof Error ? e.message : "Unbekannter Core-State-Fehler.";
	}
}, Za = /* @__PURE__ */ G("<span class=\"chip orange\"> </span>"), Qa = /* @__PURE__ */ G("<strong class=\"calendar-wake\"><!> </strong>"), $a = /* @__PURE__ */ G("<strong class=\"calendar-wake\"><!> Kein Wake</strong>"), eo = /* @__PURE__ */ G("<strong class=\"calendar-wake\"><!> Inaktiv</strong>"), to = /* @__PURE__ */ G("<article><div class=\"calendar-day-header\"><span class=\"calendar-date\"> </span> <!></div> <div class=\"inline-meta\"><span class=\"chip cyan\"> </span> <span class=\"chip\"> </span></div> <!> <p class=\"helper\"> <!> <!></p> <p class=\"helper\"> </p> <span class=\"data-status\"><!> </span></article>"), no = /* @__PURE__ */ G("<section class=\"table-card\" aria-labelledby=\"projection-heading\"><div class=\"section-header\"><div><p class=\"section-kicker\">Core-State-Projektion</p> <h3 id=\"projection-heading\">Profil, Kontext und Regelgewinner</h3></div> <span class=\"helper\"> </span></div> <div class=\"calendar-grid\"></div></section>"), ro = /* @__PURE__ */ G("<div class=\"empty-state\"><!> <h3>Keine Projektion verfügbar</h3> <p>Core State liefert die 14-Tage-Projektion erst, wenn die Datenquelle aktuell erreichbar ist.</p> <span class=\"data-status\"> </span></div>"), io = /* @__PURE__ */ G("<div class=\"view-heading\"><div><p class=\"section-kicker\">Kalender</p> <h2>Die nächsten 14 Tage</h2> <p class=\"muted\">Kompakte Projektion aus Core State. Das Frontend entscheidet keine Regel und berechnet keinen Wake-Plan.</p></div> <span class=\"data-status\"> </span></div> <!>", 1);
function ao(e, t) {
	We(t, !0);
	var n = io(), r = yn(n), i = z(R(r), 2), a = R(i, !0);
	j(i), j(r);
	var o = z(r, 2), s = (e) => {
		var n = no(), r = R(n), i = z(R(r), 2), a = R(i);
		j(i), j(r);
		var o = z(r, 2);
		ai(o, 21, () => t.projection.days, (e) => e.date, (e, t) => {
			var n = to(), r = R(n), i = R(r), a = R(i, !0);
			j(i);
			var o = z(i, 2), s = (e) => {
				var n = Za(), r = R(n, !0);
				j(n), B(() => q(r, W(t).vacation ? "Urlaub" : "Feiertag")), K(e, n);
			};
			J(o, (e) => {
				(W(t).holiday || W(t).vacation) && e(s);
			}), j(r);
			var c = z(r, 2), l = R(c), u = R(l, !0);
			j(l);
			var d = z(l, 2), f = R(d, !0);
			j(d), j(c);
			var p = z(c, 2), m = (e) => {
				var n = Qa(), r = R(n);
				ga(r, { size: 18 });
				var i = z(r);
				j(n), B(() => q(i, ` ${W(t).wake.wake_time ?? ""}`)), K(e, n);
			}, h = (e) => {
				var t = $a();
				fa(R(t), { size: 18 }), M(), j(t), K(e, t);
			}, g = (e) => {
				var t = eo();
				fa(R(t), { size: 18 }), M(), j(t), K(e, t);
			};
			J(p, (e) => {
				W(t).wake.wake_time ? e(m) : W(t).wake.state === "skipped" ? e(h, 1) : e(g, -1);
			});
			var _ = z(p, 2), v = R(_), y = z(v), b = (e) => {
				K(e, qr("· Floor 06:00 angewendet"));
			};
			J(y, (e) => {
				W(t).wake.floor_applied && e(b);
			});
			var x = z(y, 2), S = (e) => {
				K(e, qr("· Kalenderkonflikt"));
			};
			J(x, (e) => {
				W(t).wake.calendar_conflict && e(S);
			}), j(_);
			var C = z(_, 2), w = R(C);
			j(C);
			var T = z(C, 2), E = R(T), ee = (e) => {
				ma(e, { size: 13 });
			};
			J(E, (e) => {
				W(t).status === "ready" && e(ee);
			});
			var te = z(E);
			j(T), j(n), B((e, r, i) => {
				Ci(n, 1, `calendar-day ${W(t).status} ${W(t).profile.id === "weekend" ? "weekend" : ""}`), q(a, e), q(u, W(t).profile.label), q(f, W(t).day_context), q(v, `${r ?? ""} `), q(w, `Gewinner: ${W(t).wake.matched_rule ?? W(t).wake.decided_by ?? ""}`), zi(T, "data-status", W(t).status), q(te, ` ${i ?? ""}`);
			}, [
				() => Ka(W(t).date),
				() => W(t).wake.reason.replaceAll("_", " "),
				() => Wa(W(t).status)
			]), K(e, n);
		}), j(o), j(n), B(() => q(a, `Contract v${t.projection.version ?? ""} · ${t.projection.horizon_days ?? ""} Tage`)), K(e, n);
	}, c = (e) => {
		var n = ro(), r = R(n);
		ua(r, { size: 30 });
		var i = z(r, 6), a = R(i, !0);
		j(i), j(n), B((e) => {
			zi(i, "data-status", t.status), q(a, e);
		}, [() => Wa(t.status)]), K(e, n);
	};
	J(o, (e) => {
		t.projection?.days?.length ? e(s) : e(c, -1);
	}), B((e) => {
		zi(i, "data-status", t.projection?.status ?? t.status), q(a, e);
	}, [() => Wa(t.projection?.status ?? t.status)]), K(e, n), Ge();
}
//#endregion
//#region src/views/DiagnosticsView.svelte
var oo = /* @__PURE__ */ G("<section class=\"card\" style=\"margin-top: 14px;\" aria-labelledby=\"legacy-heading\"><div class=\"card-header\"><div><p class=\"section-kicker\">Temporär während Migration</p> <h3 id=\"legacy-heading\">Legacy-vs-Core-Vergleich</h3></div> <!></div> <p class=\"helper\">Diese Capability ist nur für Shadow-/Migrationsdiagnose sichtbar und verschwindet nach dem Cutover vollständig.</p> <details><summary>Vergleichsdaten anzeigen</summary> <pre class=\"diagnostic-pre\"> </pre></details></section>"), so = /* @__PURE__ */ G("<div class=\"grid two\"><section class=\"card\" aria-labelledby=\"diag-overview-heading\"><div class=\"card-header\"><h3 id=\"diag-overview-heading\">Gesamtstatus</h3><!></div> <dl class=\"diagnostic-list\"><dt>Datenstatus</dt><dd> </dd> <dt>Snapshot</dt><dd> </dd> <dt>Snapshot-Contract</dt><dd> </dd> <dt>Timeline-Contract</dt><dd> </dd> <dt>Mapping</dt><dd> </dd> <dt>Berechtigung</dt><dd> </dd></dl></section> <section class=\"card\" aria-labelledby=\"diag-sources-heading\"><div class=\"card-header\"><h3 id=\"diag-sources-heading\">Datenqualität</h3><!></div> <dl class=\"diagnostic-list\"><dt>Wake source</dt><dd> </dd> <dt>Wake decision</dt><dd> </dd> <dt>Bio decision</dt><dd> </dd> <dt>Activity decision</dt><dd> </dd> <dt>Owner</dt><dd>Core State · internes Wake Planning</dd></dl></section></div> <!> <section class=\"card\" style=\"margin-top: 14px;\" aria-labelledby=\"trace-heading\"><div class=\"card-header\"><div><p class=\"section-kicker\">Progressiv aufklappbar</p> <h3 id=\"trace-heading\">Contract-Details</h3></div></div> <details><summary>Wake Planning</summary> <pre class=\"diagnostic-pre\"> </pre></details> <details><summary>Bio und Activity</summary> <pre class=\"diagnostic-pre\"> </pre></details></section>", 1), co = /* @__PURE__ */ G("<div class=\"empty-state\"><!> <h3>Diagnose wartet auf Snapshot</h3> <p>Der technische Trace wird erst mit einer belastbaren Core-State-Antwort gefüllt.</p></div>"), lo = /* @__PURE__ */ G("<div class=\"view-heading\"><div><p class=\"section-kicker\">Diagnose</p> <h2>Owner-lokaler Decision Trace</h2> <p class=\"muted\">Technische Details sind nachrangig. Private Kalendertexte und unnötige Entity-IDs bleiben außerhalb des Contracts.</p></div> <span class=\"data-status\"> </span></div> <!>", 1);
function uo(e, t) {
	We(t, !0);
	function n(e) {
		return e && typeof e == "object" ? e : {};
	}
	function r(e) {
		return JSON.stringify(e, null, 2);
	}
	var i = lo(), a = yn(i), o = z(R(a), 2), s = R(o, !0);
	j(o), j(a);
	var c = z(a, 2), l = (e) => {
		let i = /* @__PURE__ */ Et(() => t.snapshot.data.diagnostics), a = /* @__PURE__ */ Et(() => n(W(i).wake)), o = /* @__PURE__ */ Et(() => n(W(i).bio)), s = /* @__PURE__ */ Et(() => n(W(i).activity));
		var c = so(), l = yn(c), u = R(l), d = R(u);
		Ma(z(R(d)), {
			size: 19,
			color: "var(--green)"
		}), j(d);
		var f = z(d, 2), p = z(R(f)), m = R(p, !0);
		j(p);
		var h = z(p, 3), g = R(h, !0);
		j(h);
		var _ = z(h, 3), v = R(_);
		j(_);
		var y = z(_, 3), b = R(y, !0);
		j(y);
		var x = z(y, 3), S = R(x, !0);
		j(x);
		var C = z(x, 3), w = R(C, !0);
		j(C), j(f), j(u);
		var T = z(u, 2), E = R(T);
		oa(z(R(E)), {
			size: 19,
			color: "var(--cyan)"
		}), j(E);
		var ee = z(E, 2), te = z(R(ee)), ne = R(te);
		j(te);
		var re = z(te, 3), ie = R(re, !0);
		j(re);
		var ae = z(re, 3), oe = R(ae, !0);
		j(ae);
		var se = z(ae, 3), ce = R(se, !0);
		j(se), M(3), j(ee), j(T), j(l);
		var le = z(l, 2), ue = (e) => {
			var t = oo(), n = R(t);
			va(z(R(n), 2), {
				size: 20,
				color: "var(--orange)"
			}), j(n);
			var i = z(n, 4), o = z(R(i), 2), s = R(o, !0);
			j(o), j(i), j(t), B((e) => q(s, e), [() => r(W(a))]), K(e, t);
		};
		J(le, (e) => {
			t.snapshot.capabilities.legacy_comparison && e(ue);
		});
		var de = z(le, 2), fe = z(R(de), 2), pe = z(R(fe), 2), me = R(pe, !0);
		j(pe), j(fe);
		var he = z(fe, 2), ge = z(R(he), 2), _e = R(ge, !0);
		j(ge), j(he), j(de), B((e, n, r, i, a, o, s, c, l, u) => {
			q(m, e), q(g, n), q(v, `${t.snapshot.contract ?? ""} · v${t.snapshot.version ?? ""}`), q(b, t.snapshot.data.timeline.version), q(S, r), q(w, t.snapshot.permissions.command ? "Commands autorisiert" : "Nur Lesen"), q(ne, `${i ?? ""} · ${a ?? ""}`), q(ie, o), q(oe, s), q(ce, c), q(me, l), q(_e, u);
		}, [
			() => Wa(t.snapshot.status),
			() => qa(t.snapshot.updated_at),
			() => String(W(i).mapping_contract_version ?? "nicht belegt"),
			() => String(W(a).source_status ?? "nicht belegt"),
			() => String(W(a).source_quality ?? "—"),
			() => String(W(a).reason ?? "—"),
			() => String(W(o).reason ?? "—"),
			() => String(W(s).activity_decision ?? "—"),
			() => r(W(a)),
			() => r({
				bio: W(o),
				activity: W(s)
			})
		]), K(e, c);
	}, u = (e) => {
		var t = co();
		oa(R(t), { size: 30 }), M(4), j(t), K(e, t);
	};
	J(c, (e) => {
		t.snapshot?.data ? e(l) : e(u, -1);
	}), B((e) => {
		zi(o, "data-status", t.snapshot?.status ?? t.status), q(s, e);
	}, [() => Wa(t.snapshot?.status ?? t.status)]), K(e, i), Ge();
}
//#endregion
//#region src/views/ProfilesRulesView.svelte
var fo = /* @__PURE__ */ G("<button type=\"button\"><span class=\"section-kicker\"> </span> <h3> </h3> <div class=\"inline-meta\"><span class=\"chip cyan\"><!> </span> <span class=\"chip\"> </span></div> <p class=\"helper\"> </p></button>"), po = /* @__PURE__ */ G("<div class=\"action-row\"><button class=\"button secondary\" type=\"button\">Bearbeiten</button> <button class=\"button secondary danger\" type=\"button\"><!> Entfernen</button></div>"), mo = /* @__PURE__ */ G("<span class=\"helper\">Profilregel</span>"), ho = /* @__PURE__ */ G("<tr><td><strong> </strong><br/><span class=\"helper\"> </span></td><td> </td><td> </td><td> </td><td><!></td></tr>"), go = /* @__PURE__ */ G("<section class=\"profile-grid\" aria-label=\"Wirksame Wake-Profile\"></section> <section class=\"form-card\" style=\"margin-top: 14px;\" aria-labelledby=\"profile-edit-heading\"><div class=\"card-header\"><div><p class=\"section-kicker\">Core-State-Command</p> <h3 id=\"profile-edit-heading\"> </h3></div> <span class=\"chip purple\">Keine manuelle Profilumschaltung</span></div> <form class=\"form-grid\"><label class=\"field\"><span class=\"field-label\">Wake-Zeit</span> <input type=\"time\" required=\"\"/></label> <label class=\"field\"><span class=\"field-label\">Wake Window (Minuten)</span> <input type=\"number\" min=\"0\" max=\"120\" required=\"\"/></label> <label class=\"field\"><span class=\"field-label\">M · Mindestschlaf</span> <input type=\"number\" min=\"1\" max=\"1440\" placeholder=\"nicht belegt\"/> <small>Leer bleibt backendseitig fehlend und wird nicht geraten.</small></label> <label class=\"field\"><span class=\"field-label\">A · Schutzvorlauf</span> <input type=\"number\" min=\"1\" max=\"1440\" placeholder=\"nicht belegt\"/></label> <div class=\"field full action-row\"><button class=\"button\" type=\"submit\"><!> Profil speichern</button></div></form></section> <section class=\"table-card\" style=\"margin-top: 14px;\" aria-labelledby=\"rules-heading\"><div class=\"section-header\"><div><p class=\"section-kicker\">Regelgewinner</p> <h3 id=\"rules-heading\">Automatische Regelarten</h3></div> <!></div> <div class=\"table-wrap\"><table class=\"rules-table\"><thead><tr><th>Regel</th><th>Priorität</th><th>Gültigkeit</th><th>Aktion</th><th></th></tr></thead><tbody></tbody></table></div></section> <section class=\"form-card\" style=\"margin-top: 14px;\" aria-labelledby=\"rule-edit-heading\"><div class=\"card-header\"><div><p class=\"section-kicker\">Automatische Regel bearbeiten</p> <h3 id=\"rule-edit-heading\">Wochentage, Daten oder Zyklen</h3></div> <span class=\"helper\">Nur Core-State-Regeln, kein Skip-/Zeit-Override.</span></div> <form class=\"form-grid\"><label class=\"field\"><span class=\"field-label\">ID</span><input required=\"\" placeholder=\"z. B. school_cycle\"/></label> <label class=\"field\"><span class=\"field-label\">Name</span><input placeholder=\"Verständlicher Name\"/></label> <label class=\"field\"><span class=\"field-label\">Aktion</span><select><option>Wake</option><option>Ohne Wake</option></select></label> <label class=\"field\"><span class=\"field-label\">Wake-Zeit</span><input type=\"time\"/></label> <label class=\"field\"><span class=\"field-label\">Priorität</span><input type=\"number\" min=\"0\" max=\"1000\"/></label> <label class=\"field\"><span class=\"field-label\">Wochentage</span><input placeholder=\"0,1,2\"/><small>Montag 0 bis Sonntag 6.</small></label> <label class=\"field\"><span class=\"field-label\">Von</span><input type=\"date\"/></label> <label class=\"field\"><span class=\"field-label\">Bis</span><input type=\"date\"/></label> <div class=\"field full action-row\"><button class=\"button\" type=\"submit\"><!> Regel speichern</button></div></form></section>", 1), _o = /* @__PURE__ */ G("<div class=\"skeleton\" aria-busy=\"true\"></div>"), vo = /* @__PURE__ */ G("<div class=\"view-heading\"><div><p class=\"section-kicker\">Profile & Regeln</p> <h2>Automatische Wake-Planung</h2> <p class=\"muted\">Genau zwei wirksame Profile. Feiertag und Urlaub wählen automatisch das Wochenendprofil.</p></div></div> <!>", 1);
function yo(e, t) {
	We(t, !0);
	let n = /* @__PURE__ */ I("weekday"), r = /* @__PURE__ */ I("07:00"), i = /* @__PURE__ */ I(5), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I(""), s = /* @__PURE__ */ I(""), c = /* @__PURE__ */ I(""), l = /* @__PURE__ */ I("07:00"), u = /* @__PURE__ */ I(""), d = /* @__PURE__ */ I(100), f = /* @__PURE__ */ I("wake"), p = /* @__PURE__ */ I(""), m = /* @__PURE__ */ I("");
	function h(e) {
		L(n, e, !0);
		let s = t.snapshot?.config.profiles[e];
		s && (L(r, s.wake_time, !0), L(i, s.wake_window_minutes, !0), L(a, s.minimum_sleep_minutes === null ? "" : String(s.minimum_sleep_minutes), !0), L(o, s.provisional_lead_minutes === null ? "" : String(s.provisional_lead_minutes), !0));
	}
	kn(() => {
		t.snapshot?.config.profiles.weekday && h(W(n));
	});
	function g(e) {
		let t = e.trim();
		if (!t) return null;
		let n = Number(t);
		return Number.isFinite(n) ? n : null;
	}
	async function _(e) {
		e.preventDefault(), await t.onCommand("wake.profile.update", {
			profile_id: W(n),
			values: {
				wake_time: W(r),
				wake_window_minutes: Number(W(i)),
				minimum_sleep_minutes: g(W(a)),
				provisional_lead_minutes: g(W(o))
			}
		});
	}
	function v(e) {
		L(s, e.id, !0), L(c, e.name, !0), L(l, e.wake_time ?? "07:00", !0), L(u, e.weekdays?.join(",") ?? "", !0), L(d, e.priority, !0), L(f, e.action, !0), L(p, e.date_from ?? "", !0), L(m, e.date_to ?? "", !0);
	}
	async function y(e) {
		e.preventDefault(), await t.onCommand("wake.rule.upsert", { rule: {
			id: W(s).trim(),
			name: W(c).trim() || W(s).trim(),
			priority: Number(W(d)),
			enabled: !0,
			weekdays: W(u).split(",").map((e) => Number(e.trim())).filter((e) => Number.isInteger(e) && e >= 0 && e <= 6),
			date_from: W(p) || null,
			date_to: W(m) || null,
			action: W(f),
			wake_time: W(f) === "wake" ? W(l) : null
		} });
	}
	var b = vo(), x = z(yn(b), 2), S = (e) => {
		var g = go(), b = yn(g);
		ai(b, 21, () => Object.values(t.snapshot.config.profiles), (e) => e.id, (e, t) => {
			var r = fo();
			let i;
			var a = R(r), o = R(a, !0);
			j(a);
			var s = z(a, 2), c = R(s, !0);
			j(s);
			var l = z(s, 2), u = R(l), d = R(u);
			ga(d, { size: 14 });
			var f = z(d);
			j(u);
			var p = z(u, 2), m = R(p);
			j(p), j(l);
			var g = z(l, 2), _ = R(g);
			j(g), j(r), B((e, a) => {
				i = Ci(r, 1, "form-card", null, i, { active: W(n) === W(t).id }), zi(r, "aria-pressed", W(n) === W(t).id), q(o, W(t).id === "weekday" ? "Werktagsprofil" : "Wochenendprofil"), q(c, W(t).label), q(f, ` ${W(t).wake_time ?? ""}`), q(m, `Fenster ±${W(t).wake_window_minutes ?? ""} min`), q(_, `M ${e ?? ""} · A ${a ?? ""}`);
			}, [() => Ja(W(t).minimum_sleep_minutes, " min"), () => Ja(W(t).provisional_lead_minutes, " min")]), Lr("click", r, () => h(W(t).id)), K(e, r);
		}), j(b);
		var x = z(b, 2), S = R(x), C = R(S), w = z(R(C), 2), T = R(w);
		j(w), j(C), M(2), j(S);
		var E = z(S, 2), ee = R(E), te = z(R(ee), 2);
		Y(te), j(ee);
		var ne = z(ee, 2), re = z(R(ne), 2);
		Y(re), j(ne);
		var ie = z(ne, 2), ae = z(R(ie), 2);
		Y(ae), M(2), j(ie);
		var oe = z(ie, 2), se = z(R(oe), 2);
		Y(se), j(oe);
		var ce = z(oe, 2), le = R(ce);
		Oa(R(le), { size: 16 }), M(), j(le), j(ce), j(E), j(x);
		var ue = z(x, 2), de = R(ue);
		Sa(z(R(de), 2), {
			size: 19,
			color: "var(--cyan)"
		}), j(de);
		var fe = z(de, 2), pe = R(fe), me = z(R(pe));
		ai(me, 21, () => t.snapshot.config.effective_rules ?? t.snapshot.config.rules, (e) => e.id, (e, n) => {
			var r = ho(), i = R(r), a = R(i), o = R(a, !0);
			j(a);
			var s = z(a, 2), c = R(s, !0);
			j(s), j(i);
			var l = z(i), u = R(l, !0);
			j(l);
			var d = z(l), f = R(d, !0);
			j(d);
			var p = z(d), m = R(p, !0);
			j(p);
			var h = z(p), g = R(h), _ = (e) => {
				var r = po(), i = R(r), a = z(i, 2);
				Ra(R(a), { size: 15 }), M(), j(a), j(r), B(() => {
					i.disabled = !t.snapshot.capabilities.edit_rules, a.disabled = t.pendingCommand !== null || !t.snapshot.capabilities.edit_rules;
				}), Lr("click", i, () => v(W(n))), Lr("click", a, () => t.onCommand("wake.rule.remove", { rule_id: W(n).id })), K(e, r);
			}, y = /* @__PURE__ */ Et(() => !W(n).id.startsWith("profile_")), b = (e) => {
				K(e, mo());
			};
			J(g, (e) => {
				W(y) ? e(_) : e(b, -1);
			}), j(h), j(r), B((e) => {
				q(o, W(n).name), q(c, W(n).id), q(u, W(n).priority), q(f, e), q(m, W(n).action === "skip" ? "Ohne Wake" : `Wake ${W(n).wake_time ?? "—"}`);
			}, [() => W(n).weekdays?.length ? `Wochentage: ${W(n).weekdays.join(", ")}` : "Datums-/Zyklusregel"]), K(e, r);
		}), j(me), j(pe), j(fe), j(ue);
		var he = z(ue, 2), ge = z(R(he), 2), _e = R(ge), ve = z(R(_e));
		Y(ve), j(_e);
		var ye = z(_e, 2), be = z(R(ye));
		Y(be), j(ye);
		var xe = z(ye, 2), Se = z(R(xe)), Ce = R(Se);
		Ce.value = Ce.__value = "wake";
		var we = z(Ce);
		we.value = we.__value = "skip", j(Se), j(xe);
		var Te = z(xe, 2), Ee = z(R(Te));
		Y(Ee), j(Te);
		var De = z(Te, 2), Oe = z(R(De));
		Y(Oe), j(De);
		var D = z(De, 2), ke = z(R(D));
		Y(ke), M(), j(D);
		var Ae = z(D, 2), je = z(R(Ae));
		Y(je), j(Ae);
		var Me = z(Ae, 2), Ne = z(R(Me));
		Y(Ne), j(Me);
		var Pe = z(Me, 2), O = R(Pe);
		Oa(R(O), { size: 16 }), M(), j(O), j(Pe), j(ge), j(he), B(() => {
			q(T, `${t.snapshot.config.profiles[W(n)].label ?? ""} bearbeiten`), le.disabled = t.pendingCommand !== null || !t.snapshot.capabilities.edit_profiles, Ee.disabled = W(f) === "skip", O.disabled = t.pendingCommand !== null || !t.snapshot.capabilities.edit_rules;
		}), Ir("submit", E, _), X(te, () => W(r), (e) => L(r, e)), X(re, () => W(i), (e) => L(i, e)), X(ae, () => W(a), (e) => L(a, e)), X(se, () => W(o), (e) => L(o, e)), Ir("submit", ge, y), X(ve, () => W(s), (e) => L(s, e)), X(be, () => W(c), (e) => L(c, e)), Oi(Se, () => W(f), (e) => L(f, e)), X(Ee, () => W(l), (e) => L(l, e)), X(Oe, () => W(d), (e) => L(d, e)), X(ke, () => W(u), (e) => L(u, e)), X(je, () => W(p), (e) => L(p, e)), X(Ne, () => W(m), (e) => L(m, e)), K(e, g);
	}, C = (e) => {
		K(e, _o());
	};
	J(x, (e) => {
		t.snapshot?.config ? e(S) : e(C, -1);
	}), K(e, b), Ge();
}
Rr(["click"]);
//#endregion
//#region src/views/SettingsView.svelte
var bo = /* @__PURE__ */ G("<section class=\"card\" style=\"margin-top: 14px;\" aria-labelledby=\"migration-heading\"><div class=\"card-header\"><div><p class=\"section-kicker\">Migration</p> <h3 id=\"migration-heading\">Versionierte Übernahme</h3></div> <span class=\"chip orange\"> </span></div> <p class=\"helper\"> </p> <div class=\"action-row\"><button class=\"button secondary danger\" type=\"button\"><!> Core-State-Migration zurücksetzen</button></div></section>"), xo = /* @__PURE__ */ G("<section class=\"form-card\" aria-labelledby=\"settings-heading\"><div class=\"card-header\"><div><p class=\"section-kicker\">Konfiguration</p> <h3 id=\"settings-heading\">Kalender, Konflikte und Floor</h3></div> <span class=\"chip cyan\"> </span></div> <form class=\"form-grid\"><label class=\"field\"><span class=\"field-label\">Wake-Kalenderquelle</span> <input placeholder=\"calendar.core_state_wake\"/> <small>Nur externe Quelle lesen; Core State schreibt nicht in den Kalender.</small></label> <label class=\"field\"><span class=\"field-label\">Feiertags-/Urlaubsquelle</span> <input placeholder=\"calendar.core_state_holidays\"/> <small>Feiertag und Urlaub stufen Werktag automatisch auf Wochenende.</small></label> <label class=\"field full\"><span class=\"field-label\">Manuelle Feiertags-/Urlaubsintervalle</span> <textarea placeholder=\"2026-12-24..2026-12-31\"></textarea> <small>Ein Datum oder Intervall pro Zeile. Samstag bleibt Wochenende.</small></label> <label class=\"field\"><span class=\"field-label\">Wake Window (Kalenderkonflikt)</span> <select><option>Warnen, Regelzeit beibehalten</option><option>Für frühen Termin früher wecken</option><option>Konflikt ignorieren</option></select></label> <label class=\"field\"><span class=\"field-label\">Routine-Dauer (Minuten)</span> <input type=\"number\" min=\"0\" max=\"1440\"/></label> <label class=\"field\"><span class=\"field-label\">Absoluter Floor</span> <input type=\"time\" required=\"\"/> <small>Unabhängig von Tagesphase, Tageskontext und Sonnenaufgang.</small></label> <label class=\"field full\"><span class=\"field-label\">Kalender-Markierungen</span> <input placeholder=\"no-wake schlaf aus\"/> <small>Belegte automatische Skip-Titel; keine manuelle Skip-Aktion.</small></label> <label class=\"field full\"><span class=\"field-label\">Wake-Muster</span> <input/> <small>Backend validiert das Muster und redigiert Ereignistexte aus der Diagnose.</small></label> <div class=\"field full action-row\"><button class=\"button\" type=\"submit\"><!> Einstellungen speichern</button></div></form></section> <!>", 1), So = /* @__PURE__ */ G("<div class=\"skeleton\" aria-busy=\"true\"></div>"), Co = /* @__PURE__ */ G("<div class=\"view-heading\"><div><p class=\"section-kicker\">Einstellungen</p> <h2>Core-State-eigene Quellen und Grenzen</h2> <p class=\"muted\">Diese Werte werden persistiert, versioniert validiert und ausschließlich von Core State ausgewertet.</p></div> <!></div> <!>", 1);
function wo(e, t) {
	We(t, !0);
	let n = /* @__PURE__ */ I(!1), r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I(""), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I(""), s = /* @__PURE__ */ I(""), c = /* @__PURE__ */ I(60), l = /* @__PURE__ */ I("warn_only"), u = /* @__PURE__ */ I("06:00");
	function d() {
		let e = t.snapshot?.config;
		e && (L(r, e.calendar_entity ?? "", !0), L(i, e.holiday_calendar_entity ?? "", !0), L(a, e.manual_holiday_intervals.join("\n"), !0), L(o, e.calendar_skip_titles.join("\n"), !0), L(s, e.calendar_wake_pattern, !0), L(c, e.routine_duration_minutes, !0), L(l, e.calendar_conflict_behavior, !0), L(u, e.wake_floor, !0), L(n, !0));
	}
	kn(() => {
		!W(n) && t.snapshot?.config && d();
	});
	async function f(e) {
		e.preventDefault(), await t.onCommand("wake.settings.update", { values: {
			calendar_entity: W(r).trim() || null,
			holiday_calendar_entity: W(i).trim() || null,
			manual_holiday_intervals: W(a).split("\n").map((e) => e.trim()).filter(Boolean),
			calendar_skip_titles: W(o).split("\n").map((e) => e.trim()).filter(Boolean),
			calendar_wake_pattern: W(s),
			routine_duration_minutes: Number(W(c)),
			calendar_conflict_behavior: W(l),
			wake_floor: W(u)
		} });
	}
	var p = Co(), m = yn(p);
	ca(z(R(m), 2), {
		size: 24,
		color: "var(--cyan)"
	}), j(m);
	var h = z(m, 2), g = (e) => {
		var n = xo(), d = yn(n), p = R(d), m = z(R(p), 2), h = R(m);
		j(m), j(p);
		var g = z(p, 2), _ = R(g), v = z(R(_), 2);
		Y(v), M(2), j(_);
		var y = z(_, 2), b = z(R(y), 2);
		Y(b), M(2), j(y);
		var x = z(y, 2), S = z(R(x), 2);
		ut(S), M(2), j(x);
		var C = z(x, 2), w = z(R(C), 2), T = R(w);
		T.value = T.__value = "warn_only";
		var E = z(T);
		E.value = E.__value = "wake_earlier";
		var ee = z(E);
		ee.value = ee.__value = "ignore", j(w), j(C);
		var te = z(C, 2), ne = z(R(te), 2);
		Y(ne), j(te);
		var re = z(te, 2), ie = z(R(re), 2);
		Y(ie), M(2), j(re);
		var ae = z(re, 2), oe = z(R(ae), 2);
		Y(oe), M(2), j(ae);
		var se = z(ae, 2), ce = z(R(se), 2);
		Y(ce), M(2), j(se);
		var le = z(se, 2), ue = R(le);
		Oa(R(ue), { size: 16 }), M(), j(ue), j(le), j(g), j(d);
		var de = z(d, 2), fe = (e) => {
			var n = bo(), r = R(n), i = z(R(r), 2), a = R(i, !0);
			j(i), j(r);
			var o = z(r, 2), s = R(o);
			j(o);
			var c = z(o, 2), l = R(c);
			Ea(R(l), { size: 16 }), M(), j(l), j(c), j(n), B(() => {
				q(a, t.snapshot.config.migration.status ?? "unbekannt"), q(s, `Quelle: ${t.snapshot.config.migration.source ?? "Core State" ?? ""}. Die alte Quelle wird nicht verändert; Rollback stellt das vorherige Core-State-Dokument wieder her.`), l.disabled = t.pendingCommand !== null || !t.snapshot.capabilities.edit_settings;
			}), Lr("click", l, () => t.onCommand("wake.config.rollback")), K(e, n);
		};
		J(de, (e) => {
			t.snapshot.config.migration.rollback_available && e(fe);
		}), B(() => {
			q(h, `Contract ${t.snapshot.config.contract_version ?? ""}`), ue.disabled = t.pendingCommand !== null || !t.snapshot.capabilities.edit_settings;
		}), Ir("submit", g, f), X(v, () => W(r), (e) => L(r, e)), X(b, () => W(i), (e) => L(i, e)), X(S, () => W(a), (e) => L(a, e)), Oi(w, () => W(l), (e) => L(l, e)), X(ne, () => W(c), (e) => L(c, e)), X(ie, () => W(u), (e) => L(u, e)), X(oe, () => W(o), (e) => L(o, e)), X(ce, () => W(s), (e) => L(s, e)), K(e, n);
	}, _ = (e) => {
		K(e, So());
	};
	J(h, (e) => {
		t.snapshot?.config ? e(g) : e(_, -1);
	}), K(e, p), Ge();
}
Rr(["click"]);
//#endregion
//#region src/views/TodayView.svelte
var To = /* @__PURE__ */ G("<button class=\"button\" type=\"button\"><!> Schlaf markieren</button>"), Eo = /* @__PURE__ */ G("<button class=\"button secondary\" type=\"button\"><!> Wach markieren</button>"), Do = /* @__PURE__ */ G("<div><span class=\"timeline-phase-label\"> </span> <span class=\"timeline-phase-time\"> </span></div>"), Oo = /* @__PURE__ */ G("<div class=\"view-heading\"><div><p class=\"section-kicker\">Heute</p> <h2>Eine verlässliche Alltagswahrheit</h2> <p class=\"muted\">Presence, Bio, Tageskontext, Activity und internes Wake Planning aus Core State.</p></div> <span class=\"data-status\"> </span></div> <section aria-labelledby=\"today-status-heading\"><div><div class=\"hero-label\"><!> <span>Zentrale Statuswahrheit</span></div> <h2 id=\"today-status-heading\"> </h2> <p><!></p> <div class=\"hero-meta\"><span class=\"chip cyan\"> </span> <span class=\"chip purple\"> </span> <span class=\"chip\"> </span></div> <div class=\"action-row\"><!> <!></div></div> <div class=\"hero-side\"><span class=\"hero-side-label\">Nächster effektiver Wake-Start</span> <strong class=\"hero-time\"> </strong> <span class=\"helper\"> </span> <div class=\"inline-meta\"><span class=\"chip orange\"> </span> <span class=\"chip\"> </span></div></div></section> <div class=\"grid three\"><article class=\"metric-card\"><span class=\"metric-label\">E · Frühester Start</span> <div class=\"metric-value\"> </div> <p class=\"metric-note\">Aus dem Backend-Wake-Fenster</p></article> <article class=\"metric-card\"><span class=\"metric-label\">L · Harte Grenze</span> <div class=\"metric-value\"> </div> <p class=\"metric-note\"> </p></article> <article class=\"metric-card\"><span class=\"metric-label\">M / A · Schlafschutz</span> <div class=\"metric-value\"> </div> <p class=\"metric-note\">Mindestschlaf / Schutzvorlauf; fehlende Werte bleiben sichtbar</p></article></div> <section class=\"timeline-card\" aria-labelledby=\"timeline-heading\"><div class=\"section-header\"><div><p class=\"section-kicker\">Tagesrhythmus</p> <h3 id=\"timeline-heading\">Neun echte Tagesphasen</h3></div> <span class=\"helper\"> </span></div> <div class=\"timeline-track\" aria-label=\"Neunphasige Tagesrhythmus-Timeline\"><span class=\"timeline-marker\" aria-label=\"Jetzt\"></span> <!></div> <div class=\"progress-bar\"><span></span></div> <p class=\"helper\" style=\"margin-top: 8px;\"> </p></section>", 1), ko = /* @__PURE__ */ G("<div class=\"view-heading\"><div><p class=\"section-kicker\">Heute</p> <h2>Core State wird geladen</h2> <p class=\"muted\">Die Ansicht zeigt erst nach dem versionierten Snapshot fachliche Werte.</p></div> <span class=\"data-status\"> </span></div> <div class=\"skeleton\" aria-busy=\"true\"></div>", 1);
function Ao(e, t) {
	We(t, !0);
	var n = Jr(), r = yn(n), i = (e) => {
		let n = /* @__PURE__ */ Et(() => t.snapshot.data.today), r = /* @__PURE__ */ Et(() => t.snapshot.data.timeline);
		var i = Oo(), a = yn(i), o = z(R(a), 2), s = R(o, !0);
		j(o), j(a);
		var c = z(a, 2), l = R(c), u = R(l), d = R(u), f = (e) => {
			wa(e, { size: 18 });
		}, p = (e) => {
			Pa(e, { size: 18 });
		}, m = (e) => {
			Ia(e, { size: 18 });
		}, h = (e) => {
			ia(e, { size: 18 });
		};
		J(d, (e) => {
			W(n).bio.state === "sleep" ? e(f) : W(n).bio.state === "awake" ? e(p, 1) : W(n).bio.state === "waking" ? e(m, 2) : e(h, -1);
		}), M(2), j(u);
		var g = z(u, 2), _ = R(g, !0);
		j(g);
		var v = z(g, 2), y = R(v), b = (e) => {
			K(e, qr("Schutzstatus: Das ist noch keine bestätigte Schlafzeit. Core State wartet auf die reguläre Schlaf-/Wachentscheidung."));
		}, x = (e) => {
			var t = qr();
			B((e) => q(t, `${e ?? ""}.`), [() => Ya(W(n).reason)]), K(e, t);
		};
		J(y, (e) => {
			W(n).bio.provisional ? e(b) : e(x, -1);
		}), j(v);
		var S = z(v, 2), C = R(S), w = R(C);
		j(C);
		var T = z(C, 2), E = R(T);
		j(T);
		var ee = z(T, 2), te = R(ee);
		j(ee), j(S);
		var ne = z(S, 2), re = R(ne), ie = (e) => {
			var n = To();
			wa(R(n), { size: 16 }), M(), j(n), B(() => n.disabled = t.pendingCommand !== null), Lr("click", n, () => t.onCommand("bio.mark_sleep")), K(e, n);
		};
		J(re, (e) => {
			t.snapshot.capabilities.mark_sleep && W(n).bio.state !== "sleep" && e(ie);
		});
		var ae = z(re, 2), oe = (e) => {
			var n = Eo();
			Pa(R(n), { size: 16 }), M(), j(n), B(() => n.disabled = t.pendingCommand !== null), Lr("click", n, () => t.onCommand("bio.mark_awake")), K(e, n);
		};
		J(ae, (e) => {
			t.snapshot.capabilities.mark_awake && W(n).bio.state !== "awake" && e(oe);
		}), j(ne), j(l);
		var se = z(l, 2), ce = z(R(se), 2), le = R(ce, !0);
		j(ce);
		var ue = z(ce, 2), de = R(ue);
		j(ue);
		var fe = z(ue, 2), pe = R(fe), me = R(pe);
		j(pe);
		var he = z(pe, 2), ge = R(he);
		j(he), j(fe), j(se), j(c);
		var _e = z(c, 2), ve = R(_e), ye = z(R(ve), 2), be = R(ye, !0);
		j(ye), M(2), j(ve);
		var xe = z(ve, 2), Se = z(R(xe), 2), Ce = R(Se, !0);
		j(Se);
		var we = z(Se, 2), Te = R(we, !0);
		j(we), j(xe);
		var Ee = z(xe, 2), De = z(R(Ee), 2), Oe = R(De);
		j(De), M(2), j(Ee), j(_e);
		var D = z(_e, 2), ke = R(D), Ae = z(R(ke), 2), je = R(Ae);
		j(Ae), j(ke);
		var Me = z(ke, 2), Ne = R(Me);
		ai(z(Ne, 2), 17, () => W(r).phases, (e) => e.id, (e, t) => {
			var n = Do();
			let r;
			var i = R(n), a = R(i, !0);
			j(i);
			var o = z(i, 2), s = R(o, !0);
			j(o), j(n), B((e, i) => {
				r = Ci(n, 1, "timeline-phase", null, r, { active: W(t).active }), Ti(n, `flex-grow: ${W(t).width_pct};`), zi(n, "title", e), q(a, W(t).label), q(s, i);
			}, [() => `${W(t).label}: ${Ga(W(t).start)}–${Ga(W(t).end)}`, () => Ga(W(t).start)]), K(e, n);
		}), j(Me);
		var Pe = z(Me, 2), O = R(Pe);
		j(Pe);
		var Fe = z(Pe, 2), k = R(Fe);
		j(Fe), j(D), B((e, t, i, a, l, u, d, f, p) => {
			zi(o, "data-status", W(n).data_status), q(s, e), Ci(c, 1, `hero-card ${W(n).bio.state}`), q(_, W(n).central_status.value), q(w, `Profil: ${W(n).profile.label ?? ""}`), q(E, `Tageskontext: ${W(n).day_context.value ?? ""}`), q(te, `Activity: ${W(n).activity.state ?? ""}`), q(le, t), q(de, `${i ?? ""}.`), q(me, `Entschieden durch: ${W(n).wake.decided_by ?? "Core State" ?? ""}`), q(ge, `Daten: ${a ?? ""}`), q(be, l), q(Ce, u), q(Te, W(n).wake.hard_l_applied ? "Grenze wurde angewendet" : "Keine Grenzverschiebung"), q(Oe, `${d ?? ""} / ${f ?? ""}`), q(je, `Nächster Wechsel: ${p ?? ""}`), Ti(Ne, `left: ${W(r).now_marker_pct}%;`), zi(Pe, "aria-label", `Fortschritt ${W(r).active_phase_progress_pct}%`), Ti(O, `width: ${W(r).active_phase_progress_pct}%;`), q(k, `Aktive Phase: ${W(r).active_phase ?? ""} · ${W(r).active_phase_progress_pct ?? ""}% fortgeschritten`);
		}, [
			() => Wa(W(n).data_status),
			() => qa(W(n).wake.next_effective_start),
			() => Ya(W(n).wake.reason),
			() => Wa(t.status),
			() => qa(W(n).wake.e),
			() => qa(W(n).wake.l),
			() => Ja(W(n).wake.m_minutes, " min"),
			() => Ja(W(n).wake.a_minutes, " min"),
			() => qa(W(r).next_change)
		]), K(e, i);
	}, a = (e) => {
		var n = ko(), r = yn(n), i = z(R(r), 2), a = R(i, !0);
		j(i), j(r), M(2), B((e) => {
			zi(i, "data-status", t.status), q(a, e);
		}, [() => Wa(t.status)]), K(e, n);
	};
	J(r, (e) => {
		t.snapshot?.data ? e(i) : e(a, -1);
	}), K(e, n), Ge();
}
Rr(["click"]);
//#endregion
//#region src/App.svelte
var jo = /* @__PURE__ */ G("<span class=\"contract-version\"> </span>"), Mo = /* @__PURE__ */ G("<button type=\"button\"><!> <!> <!> <!> <!> <span> </span></button>"), No = /* @__PURE__ */ G("<div class=\"inline-error\" role=\"alert\"> </div>"), Po = /* @__PURE__ */ G("<section class=\"core-state-module\" aria-label=\"Core State\"><header class=\"module-header\"><div><p class=\"eyebrow\">Core State</p> <h1>Alltag im Gleichgewicht</h1></div> <div class=\"module-status\" aria-live=\"polite\"><span class=\"status-dot\" aria-hidden=\"true\"></span> <span> </span> <!></div></header> <nav class=\"module-nav\" aria-label=\"Core-State-Bereiche\"></nav> <!> <main class=\"module-content\"><!></main></section>");
function Fo(e, t) {
	We(t, !0);
	let n = new Xa(), r = /* @__PURE__ */ I(sn(n.state)), i = /* @__PURE__ */ I("today"), a = /* @__PURE__ */ I(!1), o = /* @__PURE__ */ I(!1), s = [
		{
			id: "today",
			label: "Heute"
		},
		{
			id: "calendar",
			label: "Kalender"
		},
		{
			id: "profiles",
			label: "Profile & Regeln"
		},
		{
			id: "diagnostics",
			label: "Diagnose"
		},
		{
			id: "settings",
			label: "Einstellungen"
		}
	];
	function c(e) {
		L(i, e, !0);
	}
	async function l(e, t = {}) {
		await n.command(e, t);
	}
	kn(() => {
		W(i) === "calendar" && W(a) && !W(o) && (L(o, !0), n.loadProjection());
	}), Xi(() => {
		let e = n.subscribe((e) => {
			L(r, e, !0);
		}), t = Lo.subscribe((e) => {
			L(a, !0), n.setAdapter(Ha(e));
		});
		return () => {
			e(), t(), n.dispose();
		};
	});
	var u = Po();
	pi("1n46o8q", (e) => {
		Mn(() => {
			dn.title = "Core State";
		});
	});
	var d = R(u), f = z(R(d), 2), p = z(R(f), 2), m = R(p, !0);
	j(p);
	var h = z(p, 2), g = (e) => {
		var t = jo(), n = R(t);
		j(t), B(() => q(n, `v${W(r).snapshot.version ?? ""}`)), K(e, t);
	};
	J(h, (e) => {
		W(r).snapshot?.version && e(g);
	}), j(f), j(d);
	var _ = z(d, 2);
	ai(_, 21, () => s, (e) => e.id, (e, t) => {
		var n = Mo();
		let r;
		var a = R(n), o = (e) => {
			ba(e, {
				size: 17,
				strokeWidth: 1.8
			});
		};
		J(a, (e) => {
			W(t).id === "today" && e(o);
		});
		var s = z(a, 2), l = (e) => {
			ua(e, {
				size: 17,
				strokeWidth: 1.8
			});
		};
		J(s, (e) => {
			W(t).id === "calendar" && e(l);
		});
		var u = z(s, 2), d = (e) => {
			Sa(e, {
				size: 17,
				strokeWidth: 1.8
			});
		};
		J(u, (e) => {
			W(t).id === "profiles" && e(d);
		});
		var f = z(u, 2), p = (e) => {
			ia(e, {
				size: 17,
				strokeWidth: 1.8
			});
		};
		J(f, (e) => {
			W(t).id === "diagnostics" && e(p);
		});
		var m = z(f, 2), h = (e) => {
			Aa(e, {
				size: 17,
				strokeWidth: 1.8
			});
		};
		J(m, (e) => {
			W(t).id === "settings" && e(h);
		});
		var g = z(m, 2), _ = R(g, !0);
		j(g), j(n), B(() => {
			r = Ci(n, 1, "nav-item", null, r, { active: W(i) === W(t).id }), zi(n, "aria-current", W(i) === W(t).id ? "page" : void 0), q(_, W(t).label);
		}), Lr("click", n, () => c(W(t).id)), K(e, n);
	}), j(_);
	var v = z(_, 2), y = (e) => {
		var t = No(), n = R(t, !0);
		j(t), B(() => q(n, W(r).error)), K(e, t);
	};
	J(v, (e) => {
		W(r).error && e(y);
	});
	var b = z(v, 2), x = R(b), S = (e) => {
		Ao(e, {
			get snapshot() {
				return W(r).snapshot;
			},
			get status() {
				return W(r).status;
			},
			get pendingCommand() {
				return W(r).pendingCommand;
			},
			onCommand: l
		});
	}, C = (e) => {
		ao(e, {
			get projection() {
				return W(r).projection;
			},
			get status() {
				return W(r).status;
			}
		});
	}, w = (e) => {
		yo(e, {
			get snapshot() {
				return W(r).snapshot;
			},
			get pendingCommand() {
				return W(r).pendingCommand;
			},
			onCommand: l
		});
	}, T = (e) => {
		uo(e, {
			get snapshot() {
				return W(r).snapshot;
			},
			get status() {
				return W(r).status;
			}
		});
	}, E = (e) => {
		wo(e, {
			get snapshot() {
				return W(r).snapshot;
			},
			get pendingCommand() {
				return W(r).pendingCommand;
			},
			onCommand: l
		});
	};
	J(x, (e) => {
		W(i) === "today" ? e(S) : W(i) === "calendar" ? e(C, 1) : W(i) === "profiles" ? e(w, 2) : W(i) === "diagnostics" ? e(T, 3) : e(E, -1);
	}), j(b), j(u), B((e) => {
		zi(f, "data-status", W(r).status), q(m, e);
	}, [() => Wa(W(r).status)]), K(e, u), Ge();
}
Rr(["click"]);
//#endregion
//#region src/styles.css?inline
var Io = ":root{color:#e7edf4;font-synthesis:none;text-rendering:optimizelegibility;--graphite-950:#11161d;--graphite-900:#171d25;--graphite-850:#1b222c;--graphite-800:#202934;--graphite-700:#2d3745;--graphite-600:#465363;--text:#e7edf4;--muted:#9aa8b8;--subtle:#718093;--cyan:#61d8e6;--cyan-muted:#2d7881;--purple:#b49bff;--orange:#f4b46d;--green:#7dd7ad;--red:#ff8b8b;--yellow:#f4d37b;--radius-sm:8px;--radius-md:12px;--shadow:0 12px 30px #0003;background:#11161d;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}*{box-sizing:border-box}body{background:var(--graphite-950);min-width:320px;min-height:100vh;margin:0}button,input,select,textarea{font:inherit}button{cursor:pointer}button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:2px solid var(--cyan);outline-offset:2px}.core-state-module{width:min(1180px,100% - 32px);margin:0 auto;padding:28px 0 48px}.module-header{border-bottom:1px solid var(--graphite-700);justify-content:space-between;align-items:flex-end;gap:24px;padding-bottom:22px;display:flex}.eyebrow,.section-kicker{color:var(--cyan);letter-spacing:.12em;text-transform:uppercase;margin:0 0 6px;font-size:.74rem;font-weight:700}h1,h2,h3,p{margin-top:0}h1{letter-spacing:-.035em;margin-bottom:0;font-size:clamp(1.55rem,3vw,2.3rem)}h2{letter-spacing:-.025em;margin-bottom:8px;font-size:clamp(1.45rem,2.8vw,2rem)}h3{margin-bottom:6px;font-size:1rem}.module-status,.status-badge,.data-status{border:1px solid var(--graphite-600);min-height:32px;color:var(--muted);white-space:nowrap;border-radius:999px;align-items:center;gap:8px;padding:6px 10px;font-size:.78rem;display:inline-flex}.status-dot{background:var(--green);border-radius:50%;width:8px;height:8px;box-shadow:0 0 0 3px #7dd7ad21}[data-status=loading] .status-dot,[data-status=reconnecting] .status-dot{background:var(--cyan)}[data-status=degraded] .status-dot,[data-status=stale] .status-dot{background:var(--yellow)}[data-status=error] .status-dot,[data-status=offline] .status-dot,[data-status=unavailable] .status-dot,[data-status=blocked] .status-dot{background:var(--red)}.contract-version{border-left:1px solid var(--graphite-600);color:var(--subtle);font-variant-numeric:tabular-nums;padding-left:8px}.module-nav{scrollbar-width:thin;gap:4px;padding:14px 0 22px;display:flex;overflow-x:auto}.nav-item,.button{border-radius:var(--radius-sm);min-height:44px;color:var(--muted);background:0 0;border:1px solid #0000;justify-content:center;align-items:center;gap:8px;padding:0 14px;font-size:.9rem;transition:all .16s;display:inline-flex}.nav-item:hover,.nav-item.active{color:var(--text);background:var(--graphite-850);border-color:var(--graphite-600)}.nav-item.active{box-shadow:inset 0 -2px var(--cyan)}.button{border-color:var(--graphite-600);background:var(--graphite-800);color:var(--text);font-weight:650}.button:hover{border-color:var(--cyan-muted);background:var(--graphite-700)}.button.secondary{background:0 0}.button.danger{color:var(--red)}.button:disabled{cursor:wait;opacity:.5}.inline-error,.callout{border-radius:var(--radius-sm);color:#ffd0d0;background:#6f283238;border:1px solid #ff8b8b73;margin:0 0 18px;padding:12px 14px}.callout.info{color:#c4f3f7;background:#215b6333;border-color:#61d8e659}.module-content{min-width:0}.view-heading{justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:18px;display:flex}.view-heading p,.muted,.helper{color:var(--muted)}.helper{margin-bottom:0;font-size:.82rem;line-height:1.5}.grid{gap:14px;display:grid}.grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}.grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}.card,.hero-card,.metric-card,.timeline-card,.table-card{border:1px solid var(--graphite-700);border-radius:var(--radius-md);background:var(--graphite-900);box-shadow:var(--shadow)}.hero-card{grid-template-columns:minmax(0,1.2fr) minmax(240px,.8fr);gap:24px;margin-bottom:14px;padding:24px;display:grid}.hero-card.provisional_sleep{border-color:#f4b46d7a}.hero-card.sleep{border-color:#b49bff7a}.hero-card.waking{border-color:#61d8e67a}.hero-card.awake{border-color:#7dd7ad7a}.hero-label{color:var(--cyan);align-items:center;gap:8px;margin-bottom:18px;font-size:.84rem;font-weight:700;display:inline-flex}.hero-card p{max-width:62ch;line-height:1.55}.hero-side{border-left:1px solid var(--graphite-700);flex-direction:column;justify-content:center;gap:12px;padding:4px 0 4px 20px;display:flex}.hero-side-label,.metric-label,.field-label,.mini-label{color:var(--subtle);letter-spacing:.07em;text-transform:uppercase;font-size:.74rem;font-weight:700}.hero-time{color:var(--text);letter-spacing:-.04em;font-size:2rem;font-weight:750}.hero-meta,.inline-meta,.action-row,.card-header,.section-header{flex-wrap:wrap;align-items:center;gap:10px;display:flex}.hero-meta{margin-top:18px}.chip{border:1px solid var(--graphite-600);min-height:30px;color:var(--muted);border-radius:999px;align-items:center;gap:6px;padding:4px 9px;font-size:.8rem;display:inline-flex}.chip.cyan{color:var(--cyan);border-color:var(--cyan-muted)}.chip.purple{color:var(--purple);border-color:#b49bff59}.chip.orange{color:var(--orange);border-color:#f4b46d59}.metric-card,.card,.timeline-card,.table-card{padding:18px}.metric-card{min-height:100px}.metric-value{color:var(--text);margin:8px 0 4px;font-size:1.25rem;font-weight:700}.metric-note{color:var(--subtle);margin:0;font-size:.78rem}.timeline-card{margin-top:14px}.section-header{justify-content:space-between;margin-bottom:14px}.section-header h3,.card-header h3{margin-bottom:0}.timeline-track{gap:2px;height:68px;padding-top:10px;display:flex;position:relative}.timeline-marker{z-index:2;background:var(--cyan);width:2px;position:absolute;top:0;bottom:0;box-shadow:0 0 0 3px #61d8e621}.timeline-phase{border:1px solid var(--graphite-700);background:var(--graphite-850);border-radius:6px;min-width:0;height:58px;padding:9px 6px;position:relative;overflow:hidden}.timeline-phase.active{border-color:var(--cyan-muted);background:#20333a}.timeline-phase-label{color:var(--muted);text-overflow:ellipsis;white-space:nowrap;font-size:.7rem;font-weight:650;display:block;overflow:hidden}.timeline-phase-time{color:var(--subtle);font-variant-numeric:tabular-nums;white-space:nowrap;margin-top:5px;font-size:.68rem;display:block}.progress-bar{background:var(--graphite-700);border-radius:999px;height:6px;margin-top:12px;overflow:hidden}.progress-bar>span{background:var(--cyan);height:100%;display:block}.action-row{margin-top:18px}.calendar-grid{grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;display:grid}.calendar-day{border:1px solid var(--graphite-700);border-radius:var(--radius-sm);background:var(--graphite-900);flex-direction:column;gap:8px;min-height:142px;padding:12px;display:flex}.calendar-day.weekend{background:#1b202a}.calendar-day.degraded,.calendar-day.stale{border-color:#f4d37b66}.calendar-day-header{justify-content:space-between;align-items:center;gap:6px;display:flex}.calendar-date{color:var(--text);font-size:.8rem;font-weight:700}.calendar-wake{color:var(--cyan);font-size:1.35rem;font-weight:750}.calendar-day .helper{font-size:.75rem}.calendar-day .data-status{align-self:flex-start;min-height:26px;margin-top:auto;padding:3px 7px;font-size:.7rem}.profile-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;display:grid}.form-card{border:1px solid var(--graphite-700);border-radius:var(--radius-md);background:var(--graphite-900);padding:18px}.form-card.active{border-color:var(--cyan-muted);box-shadow:inset 0 0 0 1px #61d8e629, var(--shadow)}.form-card h3{color:var(--cyan)}.form-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:14px;display:grid}.field{flex-direction:column;gap:6px;min-width:0;display:flex}.field.full{grid-column:1/-1}.field input,.field select,.field textarea{border:1px solid var(--graphite-600);border-radius:var(--radius-sm);width:100%;min-height:44px;color:var(--text);background:var(--graphite-850);padding:9px 10px}.field textarea{resize:vertical;min-height:88px}.field small{color:var(--subtle);font-size:.73rem;line-height:1.4}.table-wrap{overflow-x:auto}.rules-table{border-collapse:collapse;width:100%;font-size:.84rem}.rules-table th,.rules-table td{border-bottom:1px solid var(--graphite-700);text-align:left;vertical-align:top;padding:12px 10px}.rules-table th{color:var(--subtle);letter-spacing:.06em;text-transform:uppercase;font-size:.72rem}.rules-table td{color:var(--muted)}.rules-table strong{color:var(--text)}.diagnostic-list{grid-template-columns:minmax(130px,.5fr) minmax(0,1fr);gap:8px 16px;margin:0;font-size:.84rem;display:grid}.diagnostic-list dt{color:var(--subtle)}.diagnostic-list dd{color:var(--muted);overflow-wrap:anywhere;margin:0}.diagnostic-pre{border:1px solid var(--graphite-700);border-radius:var(--radius-sm);color:#c9d6e4;white-space:pre-wrap;background:#121820;max-height:360px;margin:0 0 12px;padding:12px;font-family:Cascadia Code,SFMono-Regular,Consolas,monospace;font-size:.75rem;line-height:1.5;overflow:auto}details{border-top:1px solid var(--graphite-700)}details summary{min-height:44px;color:var(--cyan);cursor:pointer;padding:13px 0;font-size:.86rem;font-weight:650}details[open] summary{margin-bottom:8px}.skeleton{border:1px solid var(--graphite-700);border-radius:var(--radius-md);background:var(--graphite-900);min-height:180px}.empty-state{border:1px dashed var(--graphite-600);border-radius:var(--radius-md);color:var(--muted);text-align:center;padding:36px 18px}@media (width<=880px){.hero-card,.grid.two,.grid.three,.profile-grid{grid-template-columns:1fr}.hero-side{border-top:1px solid var(--graphite-700);border-left:0;padding:16px 0 0}.calendar-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media (width<=560px){.core-state-module{width:min(100% - 20px,1180px);padding-top:16px}.module-header,.view-heading{flex-direction:column;align-items:flex-start}.form-grid{grid-template-columns:1fr}.field.full{grid-column:auto}.calendar-grid{grid-template-columns:1fr}}@media (prefers-reduced-motion:reduce){*,:before,:after{scroll-behavior:auto!important;transition-duration:.01ms!important;animation-duration:.01ms!important}}";
//#endregion
//#region src/main.ts
if (typeof document < "u" && !document.getElementById("bcs-ux-styles")) {
	let e = document.createElement("style");
	e.id = "bcs-ux-styles", e.textContent = Io, document.head.appendChild(e);
}
var Lo = ot(null), Ro = class extends HTMLElement {
	app = null;
	_hass = null;
	get hass() {
		return this._hass;
	}
	set hass(e) {
		this._hass = e, Lo.set(e);
	}
	connectedCallback() {
		this.app = Yr(Fo, { target: this });
	}
	disconnectedCallback() {
		this.app && $r(this.app), this.app = null;
	}
};
customElements.get("bcs-app") || customElements.define("bcs-app", Ro);
//#endregion
export { Lo as hassStore };
