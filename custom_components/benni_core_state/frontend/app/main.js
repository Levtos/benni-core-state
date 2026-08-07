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
var g = 1 << 24, _ = 1024, v = 2048, y = 4096, b = 8192, x = 16384, S = 32768, C = 1 << 25, w = 65536, T = 1 << 19, E = 1 << 20, ee = 1 << 25, te = 65536, ne = 1 << 21, re = 1 << 22, ie = 1 << 23, ae = Symbol("$state"), oe = Symbol("legacy props"), se = Symbol(""), ce = Symbol("attributes"), le = Symbol("class"), ue = Symbol("style"), de = Symbol("text"), fe = Symbol("form reset"), pe = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), me = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
function he(e) {
	throw Error("https://svelte.dev/e/lifecycle_outside_component");
}
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
function ge() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function _e(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function ve(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function ye() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function be(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function xe() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Se(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function Ce() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function we() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function Te() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Ee() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
//#endregion
//#region node_modules/svelte/src/constants.js
var De = {}, D = Symbol("uninitialized"), Oe = "http://www.w3.org/1999/xhtml", ke = "http://www.w3.org/2000/svg", Ae = "@attach";
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
function Ie(e) {
	if (e === null) throw Me(), De;
	return k = e;
}
function Le() {
	return Ie(/* @__PURE__ */ yn(k));
}
function A(e) {
	if (O) {
		if (/* @__PURE__ */ yn(k) !== null) throw Me(), De;
		k = e;
	}
}
function j(e = 1) {
	if (O) {
		for (var t = e, n = k; t--;) n = /* @__PURE__ */ yn(n);
		k = n;
	}
}
function Re(e = !0) {
	for (var t = 0, n = k;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ yn(n);
		e && n.remove(), n = i;
	}
}
function ze(e) {
	if (!e || e.nodeType !== 8) throw Me(), De;
	return e.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
function Be(e) {
	return e === this.v;
}
function Ve(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function He(e) {
	return !Ve(e, this.v);
}
//#endregion
//#region node_modules/svelte/src/internal/client/context.js
var Ue = null;
function We(e) {
	Ue = e;
}
function Ge(e) {
	return Ye("getContext").get(e);
}
function Ke(e, t) {
	return Ye("setContext").set(e, t), t;
}
function qe(e) {
	return Ye("hasContext").has(e);
}
function M(e, t = !1, n) {
	Ue = {
		p: Ue,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: U,
		l: null
	};
}
function N(e) {
	var t = Ue, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) An(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, Ue = t.p, e ?? {};
}
function Je() {
	return !0;
}
function Ye(e) {
	return Ue === null && he(e), Ue.c ??= new Map(Xe(Ue) || void 0);
}
function Xe(e) {
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
var Ze = [];
function Qe() {
	var e = Ze;
	Ze = [], p(e);
}
function $e(e) {
	if (Ze.length === 0 && !zt) {
		var t = Ze;
		queueMicrotask(() => {
			t === Ze && Qe();
		});
	}
	Ze.push(e);
}
function et() {
	for (; Ze.length > 0;) Qe();
}
function tt(e) {
	var t = U;
	if (t === null) return H.f |= ie, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	nt(e, t);
}
function nt(e, t) {
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
var rt = ~(v | y | _);
function it(e, t) {
	e.f = e.f & rt | t;
}
function at(e) {
	e.f & 512 || e.deps === null ? it(e, _) : it(e, y);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function ot(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= te, ot(t.deps));
}
function st(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), ot(e.deps), it(e, _);
}
//#endregion
//#region node_modules/svelte/src/store/shared/index.js
var ct = [];
function lt(e, t = f) {
	let n = null, r = /* @__PURE__ */ new Set();
	function i(t) {
		if (Ve(e, t) && (e = t, n)) {
			let t = !ct.length;
			for (let t of r) t[1](), ct.push(t, e);
			if (t) {
				for (let e = 0; e < ct.length; e += 2) ct[e][0](ct[e + 1]);
				ct.length = 0;
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
var ut = !1;
function dt(e) {
	var t = ut;
	try {
		return ut = !1, [e(), ut];
	} finally {
		ut = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/misc.js
function ft(e, t) {
	if (t) {
		let t = document.body;
		e.autofocus = !0, $e(() => {
			document.activeElement === t && e.focus();
		});
	}
}
function pt(e) {
	O && /* @__PURE__ */ vn(e) !== null && bn(e);
}
var mt = !1;
function ht() {
	mt || (mt = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[fe]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function gt(e) {
	var t = H, n = U;
	nr(null), rr(null);
	try {
		return e();
	} finally {
		nr(t), rr(n);
	}
}
function _t(e, t, n, r = n) {
	e.addEventListener(t, () => gt(n));
	let i = e[fe];
	e[fe] = i ? () => {
		i(), r(!0);
	} : () => r(!0), ht();
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function vt(e) {
	let t = 0, n = nn(0), r;
	return () => {
		Dn() && (W(n), In(() => (t === 0 && (r = wr(() => e(() => sn(n)))), t += 1, () => {
			$e(() => {
				--t, t === 0 && (r?.(), r = void 0, sn(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var yt = w | T;
function bt(e, t, n, r) {
	new xt(e, t, n, r);
}
var xt = class {
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
	#h = vt(() => (this.#m = nn(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = U;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = U.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = Ln(() => {
			if (O) {
				let e = this.#t;
				Le();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, yt), O && (this.#e = k);
	}
	#g() {
		try {
			this.#a = zn(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		$e(r), t && (this.#s = zn(() => {
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
			t = !0, n && Ee(), this.#s !== null && Kn(this.#s, () => {
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
					nt(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = zn(() => e(this.#e)), $e(() => {
			var e = this.#c = document.createDocumentFragment(), t = _n();
			e.append(t), this.#a = this.#S(() => zn(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, Kn(this.#o, () => {
				this.#o = null;
			}), this.#x(F));
		}));
	}
	#b() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = zn(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				Xn(this.#a, e);
				let t = this.#n.pending;
				this.#o = zn(() => t(this.#e));
			} else this.#x(F);
		} catch (e) {
			this.error(e);
		}
	}
	#x(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		st(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#S(e) {
		var t = U, n = H, r = Ue;
		rr(this.#i), nr(this.#i), We(this.#i.ctx);
		try {
			return Gt.ensure(), e();
		} catch (e) {
			return tt(e), null;
		} finally {
			rr(t), nr(n), We(r);
		}
	}
	#C(e, t) {
		if (!this.has_pending_snippet()) {
			this.parent && this.parent.#C(e, t);
			return;
		}
		this.#u += e, this.#u === 0 && (this.#x(t), this.#o && Kn(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null));
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, $e(() => {
			this.#d = !1, this.#m && an(this.#m, this.#l);
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
		this.#a &&= (Un(this.#a), null), this.#o &&= (Un(this.#o), null), this.#s &&= (Un(this.#s), null), O && (Ie(this.#t), j(), Ie(Re()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return zn(() => {
						var r = U;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return nt(e, this.#i.parent), null;
				}
			}));
		};
		$e(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				nt(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => nt(e, this.#i && this.#i.parent)) : n(t);
		});
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
function St(e, t, n, r) {
	let i = Je() ? Et : kt;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = U, c = Ct(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				nt(e, s);
			}
			wt();
		}
	}
	var d = Tt();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ Ot(e))).then(u).catch((e) => nt(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), wt();
	}) : f();
}
function Ct() {
	var e = U, t = H, n = Ue, r = F;
	return function(i = !0) {
		rr(e), nr(t), We(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function wt(e = !0) {
	rr(null), nr(null), We(null), e && F?.deactivate();
}
function Tt() {
	var e = U, t = e.b, n = F, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Et(e) {
	var t = 2 | v;
	return U !== null && (U.f |= T), {
		ctx: Ue,
		deps: null,
		effects: null,
		equals: Be,
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
var Dt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function Ot(e, t, n) {
	let r = U;
	r === null && ge();
	var i = void 0, a = nn(D), o = !H, s = /* @__PURE__ */ new Set();
	return Fn(() => {
		var t = U, n = m();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== pe && n.reject(e);
			}).finally(wt);
		} catch (e) {
			n.reject(e), wt();
		}
		var c = F;
		if (o) {
			if (t.f & 32768) var l = Tt();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(Dt);
			else for (let e of s.values()) e.reject(Dt);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== Dt && (c.activate(), t ? (a.f |= ie, an(a, t)) : (a.f & 8388608 && (a.f ^= ie), an(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), On(() => {
		for (let e of s) e.reject(Dt);
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
function P(e) {
	let t = /* @__PURE__ */ Et(e);
	return ar(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function kt(e) {
	let t = /* @__PURE__ */ Et(e);
	return t.equals = He, t;
}
function At(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) Un(t[n]);
	}
}
function jt(e) {
	var t, n = U, r = e.parent;
	if (!$n && r !== null && e.v !== D && r.f & 24576) return je(), e.v;
	rr(r);
	try {
		e.f &= ~te, At(e), t = _r(e);
	} finally {
		rr(n);
	}
	return t;
}
function Mt(e) {
	var t = jt(e);
	if (!e.equals(t) && (e.wv = mr(), (!F?.is_fork || e.deps === null) && (F === null ? e.v = t : (F.capture(e, t, !0), It?.capture(e, t, !0)), e.deps === null))) {
		it(e, _);
		return;
	}
	$n || (Lt === null ? at(e) : (Dn() || F?.is_fork) && Lt.set(e, t));
}
function Nt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && gt(() => {
		t.ac.abort(pe), t.ac = null;
	}), t.fn !== null && (t.teardown = f), yr(t, 0), Vn(t));
}
function Pt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && br(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var Ft = null, F = null, It = null, Lt = null, Rt = null, zt = !1, Bt = !1, Vt = null, Ht = null, Ut = 0, Wt = 1, Gt = class e {
	id = Wt++;
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
		Ft === null ? Ft = this : (Ft.#n = this, this.#t = Ft), Ft = this;
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
			for (var r of n.d) it(r, v), t(r);
			for (r of n.m) it(r, y), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, Ut++ > 1e3 && (this.#x(), qt());
		for (let e of this.#u) this.#d.delete(e), it(e, v), this.schedule(e);
		for (let e of this.#d) it(e, y), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = Vt = [], r = [], i = Ht = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Qt(e), this.#h() || this.discard(), t;
		}
		if (F = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (Vt = null, Ht = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Zt(e, t);
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
		this.#r.clear(), It = this, Yt(r), Yt(n), It = null, this.#s?.resolve();
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
				a ? r.f ^= _ : i & 4 ? t.push(r) : hr(r) && (i & 16 && this.#d.add(r), br(r));
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), it(i, v), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), F = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) st(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== D && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), Lt?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		F = this;
	}
	deactivate() {
		F = null, Lt = null;
	}
	flush() {
		try {
			Bt = !0, F = this, this.#g();
		} finally {
			Ut = 0, Rt = null, Vt = null, Ht = null, Bt = !1, F = null, Lt = null, en.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(Dt);
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
		this.#m || (this.#m = !0, $e(() => {
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
			!Bt && !zt && $e(() => {
				t.#e || t.flush();
			});
		}
		return F;
	}
	apply() {
		Lt = null;
	}
	schedule(e) {
		if (Rt = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if (Vt !== null && t === U && (H === null || !(H.f & 2))) return;
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
			e === null || (e.#n = t), t === null ? Ft = e : t.#t = e, this.linked = !1;
		}
	}
};
function Kt(e) {
	var t = zt;
	zt = !0;
	try {
		var n;
		for (e && (F !== null && !F.is_fork && F.flush(), n = e());;) {
			if (et(), F === null) return n;
			F.flush();
		}
	} finally {
		zt = t;
	}
}
function qt() {
	try {
		xe();
	} catch (e) {
		nt(e, Rt);
	}
}
var Jt = null;
function Yt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && hr(r) && (Jt = /* @__PURE__ */ new Set(), br(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Gn(r), Jt?.size > 0)) {
				en.clear();
				for (let e of Jt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Jt.has(n) && (Jt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || br(n);
					}
				}
				Jt.clear();
			}
		}
		Jt = null;
	}
}
function Xt(e) {
	F.schedule(e);
}
function Zt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), it(e, _);
		for (var n = e.first; n !== null;) Zt(n, t), n = n.next;
	}
}
function Qt(e) {
	it(e, _);
	for (var t = e.first; t !== null;) Qt(t), t = t.next;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
var $t = /* @__PURE__ */ new Set(), en = /* @__PURE__ */ new Map(), tn = !1;
function nn(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: Be,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function I(e, t) {
	let n = nn(e, t);
	return ar(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function rn(e, t = !1, n = !0) {
	let r = nn(e);
	return t || (r.equals = He), r;
}
function L(e, t, n = !1) {
	return H !== null && (!tr || H.f & 131072) && Je() && H.f & 4325394 && (ir === null || !ir.has(e)) && Te(), an(e, n ? ln(t) : t, Ht);
}
function an(e, t, n = null) {
	if (!e.equals(t)) {
		en.set(e, $n ? t : e.v);
		var r = Gt.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && jt(t), Lt === null && at(t);
		}
		e.wv = mr(), cn(e, v, n), Je() && U !== null && U.f & 1024 && !(U.f & 96) && (cr === null ? lr([e]) : cr.push(e)), !r.is_fork && $t.size > 0 && !tn && on();
	}
	return t;
}
function on() {
	tn = !1;
	for (let e of $t) {
		e.f & 1024 && it(e, y);
		let t;
		try {
			t = hr(e);
		} catch {
			t = !0;
		}
		t && br(e);
	}
	$t.clear();
}
function sn(e) {
	L(e, e.v + 1);
}
function cn(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Je(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === U)) {
			var l = (c & v) === 0;
			if (l && it(s, t), c & 131072) $t.add(s);
			else if (c & 2) {
				var u = s;
				Lt?.delete(u), c & 65536 || (c & 512 && (U === null || !(U.f & 2097152)) && (s.f |= te), cn(u, y, n));
			} else if (l) {
				var d = s;
				c & 16 && Jt !== null && Jt.add(d), n === null ? Xt(d) : n.push(d);
			}
		}
	}
}
function ln(t) {
	if (typeof t != "object" || !t || ae in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ I(0), u = null, d = fr, f = (e) => {
		if (fr === d) return e();
		var t = H, n = fr;
		nr(null), pr(d);
		var r = e();
		return nr(t), pr(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ I(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && Ce();
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
					r.set(t, e), sn(o);
				}
			} else L(n, D), sn(o);
			return !0;
		},
		get(e, n, i) {
			if (n === ae) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ I(ln(s ? e[n] : D), u)), r.set(n, o)), o !== void 0) {
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
			if (t === ae) return !0;
			var n = r.get(t), i = n !== void 0 && n.v !== D || Reflect.has(e, t);
			return (n !== void 0 || U !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ I(i ? ln(e[t]) : D, u)), r.set(t, n)), W(n) === D) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ I(D, u)), r.set(d + "", p)) : L(p, D);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ I(void 0, u)), L(c, ln(n)), r.set(t, c));
			else {
				l = c.v !== D;
				var m = f(() => ln(n));
				L(c, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(s, n), !l) {
				if (i && typeof t == "string") {
					var g = r.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && L(g, _ + 1);
				}
				sn(o);
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
			we();
		}
	});
}
function un(e) {
	try {
		if (typeof e == "object" && e && ae in e) return e[ae];
	} catch {}
	return e;
}
function dn(e, t) {
	return Object.is(un(e), un(t));
}
var fn, pn, mn, hn;
function gn() {
	if (fn === void 0) {
		fn = window, pn = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		mn = a(t, "firstChild").get, hn = a(t, "nextSibling").get, u(e) && (e[le] = void 0, e[ce] = null, e[ue] = void 0, e.__e = void 0), u(n) && (n[de] = void 0);
	}
}
function _n(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function vn(e) {
	return mn.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function yn(e) {
	return hn.call(e);
}
function R(e, t) {
	if (!O) return /* @__PURE__ */ vn(e);
	var n = /* @__PURE__ */ vn(k);
	if (n === null) n = k.appendChild(_n());
	else if (t && n.nodeType !== 3) {
		var r = _n();
		return n?.before(r), Ie(r), r;
	}
	return t && Cn(n), Ie(n), n;
}
function z(e, t = !1) {
	if (!O) {
		var n = /* @__PURE__ */ vn(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ yn(n) : n;
	}
	if (t) {
		if (k?.nodeType !== 3) {
			var r = _n();
			return k?.before(r), Ie(r), r;
		}
		Cn(k);
	}
	return k;
}
function B(e, t = 1, n = !1) {
	let r = O ? k : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ yn(r);
	if (!O) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = _n();
			return r === null ? i?.after(a) : r.before(a), Ie(a), a;
		}
		Cn(r);
	}
	return Ie(r), r;
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
	U === null && (H === null && be(e), ye()), $n && ve(e);
}
function Tn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function En(e, t) {
	var n = U;
	n !== null && n.f & 8192 && (e |= b);
	var r = {
		ctx: Ue,
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
	if (e & 4) Vt === null ? Gt.ensure().schedule(r) : Vt.push(r);
	else if (t !== null) {
		try {
			br(r);
		} catch (e) {
			throw Un(r), e;
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
	return H !== null && !tr;
}
function On(e) {
	let t = En(8, null);
	return it(t, _), t.teardown = e, t;
}
function kn(e) {
	wn("$effect");
	var t = U.f;
	if (!H && t & 32 && Ue !== null && !Ue.i) {
		var n = Ue;
		(n.e ??= []).push(e);
	} else return An(e);
}
function An(e) {
	return En(4 | E, e);
}
function jn(e) {
	return wn("$effect.pre"), En(8 | E, e);
}
function Mn(e) {
	Gt.ensure();
	let t = En(64 | T, e);
	return () => {
		Un(t);
	};
}
function Nn(e) {
	Gt.ensure();
	let t = En(64 | T, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? Kn(t, () => {
			Un(t), n(void 0);
		}) : (Un(t), n(void 0));
	});
}
function Pn(e) {
	return En(4, e);
}
function Fn(e) {
	return En(re | T, e);
}
function In(e, t = 0) {
	return En(8 | t, e);
}
function V(e, t = [], n = [], r = []) {
	St(r, t, n, (t) => {
		En(8, () => {
			e(...t.map(W));
		});
	});
}
function Ln(e, t = 0) {
	return En(16 | t, e);
}
function Rn(e, t = 0) {
	return En(g | t, e);
}
function zn(e) {
	return En(32 | T, e);
}
function Bn(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = $n, n = H;
		er(!0), nr(null);
		try {
			t.call(null);
		} finally {
			er(e), nr(n);
		}
	}
}
function Vn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && gt(() => {
			e.abort(pe);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : Un(n, t), n = r;
	}
}
function Hn(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || Un(t), t = n;
	}
}
function Un(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (Wn(e.nodes.start, e.nodes.end), n = !0), e.f |= C, Vn(e, t && !n), yr(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	Bn(e), e.f ^= C, e.f |= x;
	var i = e.parent;
	i !== null && i.first !== null && Gn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Wn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ yn(e);
		e.remove(), e = n;
	}
}
function Gn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Kn(e, t, n = !0) {
	var r = [];
	qn(e, r, !0);
	var i = () => {
		n && Un(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function qn(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= b;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				qn(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function Jn(e) {
	Yn(e, !0);
}
function Yn(e, t) {
	if (e.f & 8192) {
		e.f ^= b, e.f & 1024 || (it(e, v), Gt.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			Yn(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function Xn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ yn(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var Zn = null, Qn = !1, $n = !1;
function er(e) {
	$n = e;
}
var H = null, tr = !1;
function nr(e) {
	H = e;
}
var U = null;
function rr(e) {
	U = e;
}
var ir = null;
function ar(e) {
	H !== null && (ir ??= /* @__PURE__ */ new Set()).add(e);
}
var or = null, sr = 0, cr = null;
function lr(e) {
	cr = e;
}
var ur = 1, dr = 0, fr = dr;
function pr(e) {
	fr = e;
}
function mr() {
	return ++ur;
}
function hr(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~te), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (hr(a) && Mt(a), a.wv > e.wv) return !0;
		}
		t & 512 && Lt === null && it(e, _);
	}
	return !1;
}
function gr(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(ir !== null && ir.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? gr(a, t, !1) : t === a && (n ? it(a, v) : a.f & 1024 && it(a, y), Xt(a));
	}
}
function _r(e) {
	var t = or, n = sr, r = cr, i = H, a = ir, o = Ue, s = tr, c = fr, l = e.f;
	or = null, sr = 0, cr = null, H = l & 96 ? null : e, ir = null, We(e.ctx), tr = !1, fr = ++dr, e.ac !== null && (gt(() => {
		e.ac.abort(pe);
	}), e.ac = null);
	try {
		e.f |= ne;
		var u = e.fn, d = u();
		e.f |= S;
		var f = e.deps, p = F?.is_fork;
		if (or !== null) {
			var m;
			if (p || yr(e, sr), f !== null && sr > 0) for (f.length = sr + or.length, m = 0; m < or.length; m++) f[sr + m] = or[m];
			else e.deps = f = or;
			if (Dn() && e.f & 512) for (m = sr; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && sr < f.length && (yr(e, sr), f.length = sr);
		if (Je() && cr !== null && !tr && f !== null && !(e.f & 6146)) for (m = 0; m < cr.length; m++) gr(cr[m], e);
		if (i !== null && i !== e) {
			if (dr++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = dr;
			if (t !== null) for (let e of t) e.rv = dr;
			cr !== null && (r === null ? r = cr : r.push(...cr));
		}
		return e.f & 8388608 && (e.f ^= ie), d;
	} catch (e) {
		return tt(e);
	} finally {
		e.f ^= ne, or = t, sr = n, cr = r, H = i, ir = a, We(o), tr = s, fr = c;
	}
}
function vr(e, r) {
	let i = r.reactions;
	if (i !== null) {
		var a = t.call(i, e);
		if (a !== -1) {
			var o = i.length - 1;
			o === 0 ? i = r.reactions = null : (i[a] = i[o], i.pop());
		}
	}
	if (i === null && r.f & 2 && (or === null || !n.call(or, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512, s.f &= ~te), s.v !== D && at(s), s.ac !== null && gt(() => {
			s.ac.abort(pe), s.ac = null, it(s, v);
		}), Nt(s), yr(s, 0);
	}
}
function yr(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) vr(e, n[r]);
}
function br(e) {
	var t = e.f;
	if (!(t & 16384)) {
		it(e, _);
		var n = U, r = Qn;
		U = e, Qn = !(t & 96);
		try {
			t & 16777232 ? Hn(e) : Vn(e), Bn(e);
			var i = _r(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = ur;
		} finally {
			Qn = r, U = n;
		}
	}
}
async function xr() {
	await Promise.resolve(), Kt();
}
function W(e) {
	var t = !!(e.f & 2);
	if (Zn?.add(e), H !== null && !tr && !(U !== null && U.f & 16384) && (ir === null || !ir.has(e))) {
		var r = H.deps;
		if (H.f & 2097152) e.rv < dr && (e.rv = dr, or === null && r !== null && r[sr] === e ? sr++ : or === null ? or = [e] : or.push(e));
		else {
			H.deps ??= [], n.call(H.deps, e) || H.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [H] : n.call(i, H) || i.push(H);
		}
	}
	if ($n && en.has(e)) return en.get(e);
	if (t) {
		var a = e;
		if ($n) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || Cr(a)) && (o = jt(a)), en.set(a, o), o;
		}
		var s = !(a.f & 512) && !tr && H !== null && (Qn || !!(H.f & 512)), c = (a.f & S) === 0;
		hr(a) && (s && (a.f |= 512), Mt(a)), s && !c && (Pt(a), Sr(a));
	}
	if (Lt?.has(e)) return Lt.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function Sr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Pt(t), Sr(t));
}
function Cr(e) {
	if (e.v === D) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (en.has(t) || t.f & 2 && Cr(t)) return !0;
	return !1;
}
function wr(e) {
	var t = tr;
	try {
		return tr = !0, e();
	} finally {
		tr = t;
	}
}
//#endregion
//#region node_modules/svelte/src/attachments/index.js
function Tr() {
	return Symbol(Ae);
}
//#endregion
//#region node_modules/svelte/src/utils.js
function Er(e) {
	return e.endsWith("capture") && e !== "gotpointercapture" && e !== "lostpointercapture";
}
var Dr = [
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
function Or(e) {
	return Dr.includes(e);
}
var kr = /* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split("."), Ar = {
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
function jr(e) {
	return e = e.toLowerCase(), Ar[e] ?? e;
}
[...kr];
var Mr = ["touchstart", "touchmove"];
function Nr(e) {
	return Mr.includes(e);
}
var Pr = [
	"textarea",
	"script",
	"style",
	"title"
];
function Fr(e) {
	return Pr.includes(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var Ir = Symbol("events"), Lr = /* @__PURE__ */ new Set(), Rr = /* @__PURE__ */ new Set();
function zr(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || Gr.call(t, e), !e.cancelBubble) return gt(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? $e(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function Br(e, t, n, r = {}) {
	var i = zr(t, e, n, r);
	return () => {
		e.removeEventListener(t, i, r);
	};
}
function Vr(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = zr(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && On(() => {
		t.removeEventListener(e, o, a);
	});
}
function Hr(e, t, n) {
	(t[Ir] ??= {})[e] = n;
}
function Ur(e) {
	for (var t = 0; t < e.length; t++) Lr.add(e[t]);
	for (var n of Rr) n(e);
}
var Wr = null;
function Gr(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	Wr = e;
	var s = 0, c = Wr === e && e[Ir];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[Ir] = t;
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
		nr(null), rr(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[Ir]?.[r];
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
			e[Ir] = t, delete e.currentTarget, nr(d), rr(f);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var Kr = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function qr(e) {
	return Kr?.createHTML(e) ?? e;
}
function Jr(e) {
	var t = Sn("template");
	return t.innerHTML = qr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function Yr(e, t) {
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
		if (O) return Yr(k, null), k;
		i === void 0 && (i = Jr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ vn(i)));
		var t = r || pn ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ vn(t), s = t.lastChild;
			Yr(o, s);
		} else Yr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Xr(e, t, n = "svg") {
	var r = !e.startsWith("<!>"), i = !!(t & 1), a = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
	return () => {
		if (O) return Yr(k, null), k;
		if (!o) {
			var e = /* @__PURE__ */ vn(Jr(a));
			if (i) for (o = document.createDocumentFragment(); /* @__PURE__ */ vn(e);) o.appendChild(/* @__PURE__ */ vn(e));
			else o = /* @__PURE__ */ vn(e);
		}
		var t = o.cloneNode(!0);
		if (i) {
			var n = /* @__PURE__ */ vn(t), r = t.lastChild;
			Yr(n, r);
		} else Yr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Zr(e, t) {
	return /* @__PURE__ */ Xr(e, t, "svg");
}
function Qr(e = "") {
	if (!O) {
		var t = _n(e + "");
		return Yr(t, t), t;
	}
	var n = k;
	return n.nodeType === 3 ? Cn(n) : (n.before(n = _n()), Ie(n)), Yr(n, n), n;
}
function K() {
	if (O) return Yr(k, null), k;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = _n();
	return e.append(t, n), Yr(t, n), e;
}
function q(e, t) {
	if (O) {
		var n = U;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = k), Le();
		return;
	}
	e !== null && e.before(t);
}
function $r() {
	if (O && k && k.nodeType === 8 && k.textContent?.startsWith("$")) {
		let e = k.textContent.substring(1);
		return Le(), e;
	}
	return (window.__svelte ??= {}).uid ??= 1, `c${window.__svelte.uid++}`;
}
function J(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[de] ??= e.nodeValue) && (e[de] = n, e.nodeValue = `${n}`);
}
function ei(e, t) {
	return ni(e, t);
}
var ti = /* @__PURE__ */ new Map();
function ni(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	gn();
	var l = void 0, u = Nn(() => {
		var s = n ?? t.appendChild(_n());
		bt(s, { pending: () => {} }, (t) => {
			M({});
			var n = Ue;
			if (o && (n.c = o), a && (i.$$events = a), O && Yr(t, null), l = e(t, i) || {}, O && (U.nodes.end = k, k === null || k.nodeType !== 8 || k.data !== "]")) throw Me(), De;
			N();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = Nr(r);
					for (let e of [t, document]) {
						var a = ti.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), ti.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, Gr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(Lr)), Rr.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = ti.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, Gr), r.delete(e), r.size === 0 && ti.delete(n)) : r.set(e, i);
			}
			Rr.delete(d), s !== n && s.parentNode?.removeChild(s);
		};
	});
	return ri.set(l, u), l;
}
var ri = /* @__PURE__ */ new WeakMap();
function ii(e, t) {
	let n = ri.get(e);
	return n ? (ri.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/branches.js
var ai = class {
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
			if (n) Jn(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (Jn(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (Un(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						Xn(r, t), t.append(_n()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else Un(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), Kn(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (Un(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = F, r = xn();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = _n();
				i.append(a), this.#n.set(e, {
					effect: zn(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, zn(() => t(this.anchor)));
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
function Y(e, t, n = !1) {
	var r;
	O && (r = k, Le());
	var i = new ai(e), a = n ? w : 0;
	function o(e, t) {
		if (O) {
			var n = ze(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Re();
				Ie(a), i.anchor = a, Fe(!1), i.ensure(e, t), Fe(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	Ln(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function oi(e, t) {
	return t;
}
function si(e, t, n) {
	for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
		let n = t[c];
		Kn(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					ci(e, r(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
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
		ci(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function ci(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= ee, Xn(a, document.createDocumentFragment())) : Un(t[i], n);
	}
}
var li;
function ui(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = O ? Ie(/* @__PURE__ */ vn(u)) : u.appendChild(_n());
	}
	O && Le();
	var d = null, f = /* @__PURE__ */ kt(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, fi(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= ee, mi(d, null, c)) : Jn(d) : Kn(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: Ln(() => {
			p = W(f);
			var e = p.length;
			let t = !1;
			O && ze(c) === "[!" != (e === 0) && (c = Re(), Ie(c), Fe(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = F, v = xn(), y = 0; y < e; y += 1) {
				O && k.nodeType === 8 && k.data === "]" && (c = k, t = !0, Fe(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && an(S.v, b), S.i && an(S.i, y), v && u.unskip_effect(S.e)) : (S = pi(l, h ? c : li ??= _n(), b, x, y, o, n, i), h || (S.e.f |= ee), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = zn(() => s(c)) : (d = zn(() => s(li ??= _n())), d.f |= ee)), e > r.size && _e("", "", ""), O && e > 0 && Ie(Re()), !h) {
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
function di(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function fi(e, t, n, i, a) {
	var o = !!(i & 8), s = t.length, c = e.items, l = di(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = a(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = a(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (Jn(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= ee, _ === l) mi(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), hi(e, d, _), hi(e, _, y), mi(_, y, n), d = _, p = [], m = [], l = di(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) mi(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					hi(e, S.prev, C.next), hi(e, d, S), hi(e, C, b), l = b, d = C, --v, p = [], m = [];
				} else u.delete(_), mi(_, l, n), hi(e, _.prev, _.next), hi(e, _, d === null ? e.effect.first : d.next), hi(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = di(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = di(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (ci(e, r(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var w = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || w.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && w.push(l), l = di(l.next);
		var T = w.length;
		if (T > 0) {
			var E = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < T; v += 1) w[v].nodes?.a?.measure();
				for (v = 0; v < T; v += 1) w[v].nodes?.a?.fix();
			}
			si(e, w, E);
		}
	}
	o && $e(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function pi(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? nn(n) : /* @__PURE__ */ rn(n, !1, !1) : null, l = o & 2 ? nn(i) : null;
	return {
		v: c,
		i: l,
		e: zn(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function mi(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ yn(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function hi(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/snippet.js
function gi(e, t, ...n) {
	var r = new ai(e);
	Ln(() => {
		let e = t() ?? null;
		r.ensure(e, e && ((t) => e(t, ...n)));
	}, w);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/svelte-component.js
function _i(e, t, n) {
	var r;
	O && (r = k, Le());
	var i = new ai(e);
	Ln(() => {
		var e = t() ?? null;
		if (O && ze(r) === "[" != (e !== null)) {
			var a = Re();
			Ie(a), i.anchor = a, Fe(!1), i.ensure(e, e && ((t) => n(t, e))), Fe(!0);
			return;
		}
		i.ensure(e, e && ((t) => n(t, e)));
	}, w);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/svelte-element.js
function vi(e, t, n, r, i, a) {
	let o = O;
	O && Le();
	var s = null;
	O && k.nodeType === 1 && (s = k, Le());
	var c = O ? k : e, l = new ai(c, !1);
	Ln(() => {
		let e = t() || null;
		var a = i ? i() : n || e === "svg" ? ke : void 0;
		if (e === null) {
			l.ensure(null, null);
			return;
		}
		return l.ensure(e, (t) => {
			if (e) {
				if (s = O ? s : Sn(e, a), Yr(s, s), r) {
					var n = null;
					O && Fr(e) && s.append(n = document.createComment(""));
					var i = O ? /* @__PURE__ */ vn(s) : s.appendChild(_n());
					O && (i === null ? Fe(!1) : Ie(i)), r(s, i), n?.remove();
				}
				U.nodes.end = s, t.before(s);
			}
			O && Ie(t);
		}), () => {};
	}, w), On(() => {}), o && (Fe(!0), Ie(c));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attachments.js
function yi(e, t) {
	var n = void 0, r;
	Rn(() => {
		n !== (n = t()) && (r &&= (Un(r), null), n && (r = zn(() => {
			Pn(() => n(e));
		})));
	});
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function bi(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = bi(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function xi() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = bi(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
function Si(e) {
	return typeof e == "object" ? xi(e) : e ?? "";
}
var Ci = [..." 	\n\r\f\xA0\v﻿"];
function wi(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || Ci.includes(r[o - 1])) && (s === r.length || Ci.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function Ti(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function Ei(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function Di(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(Ei)), i && c.push(...Object.keys(i).map(Ei));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = Ei(e.substring(l, u).trim());
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
		return r && (n += Ti(r)), i && (n += Ti(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function Oi(e, t, n, r, i, a) {
	var o = e[le];
	if (O || o !== n || o === void 0) {
		var s = wi(n, r, a);
		(!O || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[le] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
function ki(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function Ai(e, t, n, r) {
	var i = e[ue];
	if (O || i !== t) {
		var a = Di(t, r);
		(!O || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[ue] = t;
	} else r && (Array.isArray(r) ? (ki(e, n?.[0], r[0]), ki(e, n?.[1], r[1], "important")) : ki(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function ji(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return Ne();
		for (var i of t.options) i.selected = n.includes(Pi(i));
		return;
	}
	for (i of t.options) if (dn(Pi(i), n)) {
		i.selected = !0;
		return;
	}
	(!r || n !== void 0) && (t.selectedIndex = -1);
}
function Mi(e) {
	var t = new MutationObserver(() => {
		"__value" in e && ji(e, e.__value);
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
function Ni(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	_t(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), Pi);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && Pi(o);
		}
		n(a), e.__value = a, F !== null && r.add(F);
	}), Pn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = F;
			if (r.has(o)) return;
		}
		if (ji(e, a, i), i && a === void 0) {
			var s = e.querySelector(":checked");
			s !== null && (a = Pi(s), n(a));
		}
		e.__value = a, i = !1;
	}), Mi(e);
}
function Pi(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var Fi = Symbol("class"), Ii = Symbol("style"), Li = Symbol("is custom element"), Ri = Symbol("is html"), zi = me ? "link" : "LINK", Bi = me ? "input" : "INPUT", Vi = me ? "option" : "OPTION", Hi = me ? "select" : "SELECT";
function Ui(e) {
	if (O) {
		var t = !1, n = () => {
			if (!t) {
				if (t = !0, e.hasAttribute("value")) {
					var n = e.value;
					Gi(e, "value", null), e.value = n;
				}
				if (e.hasAttribute("checked")) {
					var r = e.checked;
					Gi(e, "checked", null), e.checked = r;
				}
			}
		};
		e[fe] = n, $e(n), ht();
	}
}
function Wi(e, t) {
	t ? e.hasAttribute("selected") || e.setAttribute("selected", "") : e.removeAttribute("selected");
}
function Gi(e, t, n, r) {
	var i = Ji(e);
	O && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === zi) || i[t] !== (i[t] = n) && (t === "loading" && (e[se] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Xi(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function Ki(e, t, n, r, i = !1, a = !1) {
	if (O && i && e.nodeName === Bi) {
		var o = e;
		(o.type === "checkbox" ? "defaultChecked" : "defaultValue") in n || Ui(o);
	}
	var s = Ji(e), c = s[Li], l = !s[Ri];
	let u = O && c;
	u && Fe(!1);
	var d = t || {}, f = e.nodeName === Vi;
	for (var p in t) p in n || (n[p] = null);
	n.class ? n.class = Si(n.class) : (r || n[Fi]) && (n.class = null), n[Ii] && (n.style ??= null);
	var m = Xi(e);
	if (e.nodeName === Bi && "type" in n && ("value" in n || "__value" in n)) {
		var h = n.type;
		(h !== d.type || h === void 0 && e.hasAttribute("type")) && (d.type = h, Gi(e, "type", h, a));
	}
	for (let i in n) {
		let o = n[i];
		if (f && i === "value" && o == null) {
			e.value = e.__value = "", d[i] = o;
			continue;
		}
		if (i === "class") {
			Oi(e, e.namespaceURI === "http://www.w3.org/1999/xhtml", o, r, t?.[Fi], n[Fi]), d[i] = o, d[Fi] = n[Fi];
			continue;
		}
		if (i === "style") {
			Ai(e, o, t?.[Ii], n[Ii]), d[i] = o, d[Ii] = n[Ii];
			continue;
		}
		var g = d[i];
		if (!(o === g && !(o === void 0 && e.hasAttribute(i)))) {
			d[i] = o;
			var _ = i[0] + i[1];
			if (_ !== "$$") {
				if (_ === "on") {
					let t = {}, n = "$$" + i, r = i.slice(2);
					var v = Or(r);
					if (Er(r) && (r = r.slice(0, -7), t.capture = !0), !v && g) {
						if (o != null) continue;
						e.removeEventListener(r, d[n], t), d[n] = null;
					}
					if (v) Hr(r, e, o), Ur([r]);
					else if (o != null) {
						function a(e) {
							d[i].call(this, e);
						}
						d[n] = zr(r, e, a, t);
					}
				} else if (i === "style") Gi(e, i, o);
				else if (i === "autofocus") ft(e, !!o);
				else if (!c && (i === "__value" || i === "value" && o != null)) e.value = e.__value = o;
				else if (i === "selected" && f) Wi(e, o);
				else {
					var y = i;
					l || (y = jr(y));
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
					} else b || m.includes(y) && (c || typeof o != "string") ? (e[y] = o, y in s && (s[y] = D)) : typeof o != "function" && Gi(e, y, o, a);
				}
			}
		}
	}
	return u && Fe(!0), d;
}
function qi(e, t, n = [], r = [], i = [], a, o = !1, s = !1) {
	St(i, n, r, (n) => {
		var r = void 0, i = {}, c = e.nodeName === Hi, l = !1;
		if (Rn(() => {
			var u = t(...n.map(W)), d = Ki(e, r, u, a, o, s);
			l && c && "value" in u && ji(e, u.value);
			for (let e of Object.getOwnPropertySymbols(i)) u[e] || Un(i[e]);
			for (let t of Object.getOwnPropertySymbols(u)) {
				var f = u[t];
				t.description === "@attach" && (!r || f !== r[t]) && (i[t] && Un(i[t]), i[t] = zn(() => yi(e, () => f))), d[t] = f;
			}
			r = d;
		}), c) {
			var u = e;
			Pn(() => {
				ji(u, r.value, !0), Mi(u);
			});
		}
		l = !0;
	});
}
function Ji(e) {
	return e[ce] ??= {
		[Li]: e.nodeName.includes("-"),
		[Ri]: e.namespaceURI === Oe
	};
}
var Yi = /* @__PURE__ */ new Map();
function Xi(e) {
	var t = e.getAttribute("is") || e.nodeName, n = Yi.get(t);
	if (n) return n;
	Yi.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var s in r = o(i), r) r[s].set && s !== "innerHTML" && s !== "textContent" && s !== "innerText" && n.push(s);
		i = l(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function Zi(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	_t(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = Qi(e) ? $i(a) : a, n(a), F !== null && r.add(F), await xr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (O && e.defaultValue !== e.value || wr(t) == null && e.value) && (n(Qi(e) ? $i(e.value) : e.value), F !== null && r.add(F)), In(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = F;
			if (r.has(i)) return;
		}
		Qi(e) && n === $i(e.value) || e.type === "date" && !n && !e.value || n !== e.value && (e.value = n ?? "");
	});
}
function Qi(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function $i(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
var ea = {
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
function X(e, t, n) {
	return new Proxy({
		props: e,
		exclude: t
	}, ea);
}
var ta = {
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
		if (t === ae || t === oe) return !1;
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
function Z(...e) {
	return new Proxy({ props: e }, ta);
}
function Q(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ Et(r), W(u)) : (l && (l = !1, c = s ? wr(r) : r), c);
	let f;
	if (o) {
		var p = ae in e || oe in e;
		f = a(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	o ? [m, h] = dt(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && Se(t), f(m)));
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
	var v = !1, y = (n & 1 ? Et : kt)(() => (v = !1, g()));
	o && W(y);
	var b = U;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? W(y) : i && o ? ln(e) : e;
			return L(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return $n && v || b.f & 16384 ? y.v : W(y);
	});
}
function na(e) {
	Ue === null && he("onMount"), kn(() => {
		let t = wr(e);
		if (typeof t == "function") return t;
	});
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region node_modules/@lucide/svelte/dist/defaultAttributes.js
var ra = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	"stroke-width": 2,
	"stroke-linecap": "round",
	"stroke-linejoin": "round"
}, ia = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, aa = Symbol("lucide-context"), oa = () => Ge(aa), sa = /* @__PURE__ */ new Set([
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
]), ca = /* @__PURE__ */ Zr("<svg><!><!></svg>");
function la(e, t) {
	M(t, !0);
	let n = oa() ?? {}, r = Q(t, "color", 19, () => n.color ?? "currentColor"), i = Q(t, "size", 19, () => n.size ?? 24), a = Q(t, "strokeWidth", 19, () => n.strokeWidth ?? 2), o = Q(t, "absoluteStrokeWidth", 19, () => n.absoluteStrokeWidth ?? !1), s = Q(t, "iconNode", 19, () => []), c = /* @__PURE__ */ X(t, sa), l = /* @__PURE__ */ P(() => o() ? Number(a()) * 24 / Number(i()) : a());
	var u = ca();
	qi(u, (e) => ({
		...ra,
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
	}), [() => !t.children && !ia(c) && { "aria-hidden": "true" }]);
	var d = R(u);
	ui(d, 17, s, oi, (e, t) => {
		var n = /* @__PURE__ */ P(() => h(W(t), 2));
		let r = () => W(n)[0], i = () => W(n)[1];
		var a = K();
		vi(z(a), r, !0, (e, t) => {
			qi(e, () => ({ ...i() }));
		}), q(e, a);
	}), gi(B(d), () => t.children ?? f), A(u), q(e, u), N();
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/activity.svelte
var ua = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function da(e, t) {
	let n = /* @__PURE__ */ X(t, ua), r = [["path", { d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" }]];
	la(e, Z({ name: "activity" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/bug.svelte
var fa = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function pa(e, t) {
	let n = /* @__PURE__ */ X(t, fa), r = [
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
	la(e, Z({ name: "bug" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/calendar-cog.svelte
var ma = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function ha(e, t) {
	let n = /* @__PURE__ */ X(t, ma), r = [
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
	la(e, Z({ name: "calendar-cog" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/calendar-days.svelte
var ga = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function _a(e, t) {
	let n = /* @__PURE__ */ X(t, ga), r = [
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
	la(e, Z({ name: "calendar-days" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/circle-alert.svelte
var va = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function ya(e, t) {
	let n = /* @__PURE__ */ X(t, va), r = [
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
	la(e, Z({ name: "circle-alert" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/circle-check.svelte
var ba = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function xa(e, t) {
	let n = /* @__PURE__ */ X(t, ba), r = [["circle", {
		cx: "12",
		cy: "12",
		r: "10"
	}], ["path", { d: "m9 12 2 2 4-4" }]];
	la(e, Z({ name: "circle-check" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/clock-3.svelte
var Sa = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Ca(e, t) {
	let n = /* @__PURE__ */ X(t, Sa), r = [["circle", {
		cx: "12",
		cy: "12",
		r: "10"
	}], ["path", { d: "M12 6v6h4" }]];
	la(e, Z({ name: "clock-3" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/git-compare-arrows.svelte
var wa = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Ta(e, t) {
	let n = /* @__PURE__ */ X(t, wa), r = [
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
	la(e, Z({ name: "git-compare-arrows" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/house.svelte
var Ea = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Da(e, t) {
	let n = /* @__PURE__ */ X(t, Ea), r = [["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" }], ["path", { d: "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }]];
	la(e, Z({ name: "house" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/list-checks.svelte
var Oa = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function ka(e, t) {
	let n = /* @__PURE__ */ X(t, Oa), r = [
		["path", { d: "M13 5h8" }],
		["path", { d: "M13 12h8" }],
		["path", { d: "M13 19h8" }],
		["path", { d: "m3 17 2 2 4-4" }],
		["path", { d: "m3 7 2 2 4-4" }]
	];
	la(e, Z({ name: "list-checks" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/moon.svelte
var Aa = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function ja(e, t) {
	let n = /* @__PURE__ */ X(t, Aa), r = [["path", { d: "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" }]];
	la(e, Z({ name: "moon" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/rotate-ccw.svelte
var Ma = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Na(e, t) {
	let n = /* @__PURE__ */ X(t, Ma), r = [["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }], ["path", { d: "M3 3v5h5" }]];
	la(e, Z({ name: "rotate-ccw" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/save.svelte
var Pa = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Fa(e, t) {
	let n = /* @__PURE__ */ X(t, Pa), r = [
		["path", { d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" }],
		["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" }],
		["path", { d: "M7 3v4a1 1 0 0 0 1 1h7" }]
	];
	la(e, Z({ name: "save" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/settings-2.svelte
var Ia = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function La(e, t) {
	let n = /* @__PURE__ */ X(t, Ia), r = [
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
	la(e, Z({ name: "settings-2" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/shield-check.svelte
var Ra = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function za(e, t) {
	let n = /* @__PURE__ */ X(t, Ra), r = [["path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" }], ["path", { d: "m9 12 2 2 4-4" }]];
	la(e, Z({ name: "shield-check" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/sun.svelte
var Ba = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Va(e, t) {
	let n = /* @__PURE__ */ X(t, Ba), r = [
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
	la(e, Z({ name: "sun" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/sunrise.svelte
var Ha = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Ua(e, t) {
	let n = /* @__PURE__ */ X(t, Ha), r = [
		["path", { d: "M12 2v8" }],
		["path", { d: "m4.93 10.93 1.41 1.41" }],
		["path", { d: "M2 18h2" }],
		["path", { d: "M20 18h2" }],
		["path", { d: "m19.07 10.93-1.41 1.41" }],
		["path", { d: "M22 22H2" }],
		["path", { d: "m8 6 4-4 4 4" }],
		["path", { d: "M16 18a4 4 0 0 0-8 0" }]
	];
	la(e, Z({ name: "sunrise" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/trash-2.svelte
var Wa = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy"
]);
function Ga(e, t) {
	let n = /* @__PURE__ */ X(t, Wa), r = [
		["path", { d: "M10 11v6" }],
		["path", { d: "M14 11v6" }],
		["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" }],
		["path", { d: "M3 6h18" }],
		["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }]
	];
	la(e, Z({ name: "trash-2" }, () => n, { get iconNode() {
		return r;
	} }));
}
//#endregion
//#region src/lib/adapters.ts
var Ka = class {
	async subscribe(e) {
		return () => void 0;
	}
}, qa = class extends Ka {
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
}, Ja = class extends Ka {
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
function Ya(e) {
	return e?.connection ? new qa(e) : new Ja();
}
//#endregion
//#region src/lib/contracts.ts
var Xa = {
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
function Za(e) {
	return Xa[e] ?? e;
}
function Qa(e) {
	if (!e) return "—";
	let t = new Date(e);
	return Number.isNaN(t.valueOf()) ? e.slice(0, 5) : new Intl.DateTimeFormat("de-DE", {
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "Europe/Berlin"
	}).format(t);
}
function $a(e) {
	let t = /* @__PURE__ */ new Date(`${e}T12:00:00+02:00`);
	return Number.isNaN(t.valueOf()) ? e : new Intl.DateTimeFormat("de-DE", {
		weekday: "short",
		day: "2-digit",
		month: "2-digit",
		timeZone: "Europe/Berlin"
	}).format(t);
}
function eo(e) {
	if (!e) return "—";
	let t = new Date(e);
	return Number.isNaN(t.valueOf()) ? e : new Intl.DateTimeFormat("de-DE", {
		dateStyle: "short",
		timeStyle: "short",
		timeZone: "Europe/Berlin"
	}).format(t);
}
function to(e, t = "") {
	return e == null ? "nicht belegt" : `${e}${t}`;
}
function no(e) {
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
var ro = class {
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
}, io = /* @__PURE__ */ G("<span class=\"chip orange\"> </span>"), ao = /* @__PURE__ */ G("<strong class=\"calendar-wake\"><!> </strong>"), oo = /* @__PURE__ */ G("<strong class=\"calendar-wake\"><!> Kein Wake</strong>"), so = /* @__PURE__ */ G("<strong class=\"calendar-wake\"><!> Inaktiv</strong>"), co = /* @__PURE__ */ G("<article><div class=\"calendar-day-header\"><span class=\"calendar-date\"> </span> <!></div> <div class=\"inline-meta\"><span class=\"chip cyan\"> </span> <span class=\"chip\"> </span></div> <!> <p class=\"helper\"> <!> <!></p> <p class=\"helper\"> </p> <span class=\"data-status\"><!> </span></article>"), lo = /* @__PURE__ */ G("<section class=\"table-card\" aria-labelledby=\"projection-heading\"><div class=\"section-header\"><div><p class=\"section-kicker\">Core-State-Projektion</p> <h3 id=\"projection-heading\">Profil, Kontext und Regelgewinner</h3></div> <span class=\"helper\"> </span></div> <div class=\"calendar-grid\"></div></section>"), uo = /* @__PURE__ */ G("<div class=\"empty-state\"><!> <h3>Keine Projektion verfügbar</h3> <p>Core State liefert die 14-Tage-Projektion erst, wenn die Datenquelle aktuell erreichbar ist.</p> <span class=\"data-status\"> </span></div>"), fo = /* @__PURE__ */ G("<div class=\"view-heading\"><div><p class=\"section-kicker\">Kalender</p> <h2>Die nächsten 14 Tage</h2> <p class=\"muted\">Kompakte Projektion aus Core State. Das Frontend entscheidet keine Regel und berechnet keinen Wake-Plan.</p></div> <span class=\"data-status\"> </span></div> <!>", 1);
function po(e, t) {
	M(t, !0);
	var n = fo(), r = z(n), i = B(R(r), 2), a = R(i, !0);
	A(i), A(r);
	var o = B(r, 2), s = (e) => {
		var n = lo(), r = R(n), i = B(R(r), 2), a = R(i);
		A(i), A(r);
		var o = B(r, 2);
		ui(o, 21, () => t.projection.days, (e) => e.date, (e, t) => {
			var n = co(), r = R(n), i = R(r), a = R(i, !0);
			A(i);
			var o = B(i, 2), s = (e) => {
				var n = io(), r = R(n, !0);
				A(n), V(() => J(r, W(t).vacation ? "Urlaub" : "Feiertag")), q(e, n);
			};
			Y(o, (e) => {
				(W(t).holiday || W(t).vacation) && e(s);
			}), A(r);
			var c = B(r, 2), l = R(c), u = R(l, !0);
			A(l);
			var d = B(l, 2), f = R(d, !0);
			A(d), A(c);
			var p = B(c, 2), m = (e) => {
				var n = ao(), r = R(n);
				Ca(r, { size: 18 });
				var i = B(r);
				A(n), V(() => J(i, ` ${W(t).wake.wake_time ?? ""}`)), q(e, n);
			}, h = (e) => {
				var t = oo();
				ya(R(t), { size: 18 }), j(), A(t), q(e, t);
			}, g = (e) => {
				var t = so();
				ya(R(t), { size: 18 }), j(), A(t), q(e, t);
			};
			Y(p, (e) => {
				W(t).wake.wake_time ? e(m) : W(t).wake.state === "skipped" ? e(h, 1) : e(g, -1);
			});
			var _ = B(p, 2), v = R(_), y = B(v), b = (e) => {
				q(e, Qr("· Floor 06:00 angewendet"));
			};
			Y(y, (e) => {
				W(t).wake.floor_applied && e(b);
			});
			var x = B(y, 2), S = (e) => {
				q(e, Qr("· Kalenderkonflikt"));
			};
			Y(x, (e) => {
				W(t).wake.calendar_conflict && e(S);
			}), A(_);
			var C = B(_, 2), w = R(C);
			A(C);
			var T = B(C, 2), E = R(T), ee = (e) => {
				xa(e, { size: 13 });
			};
			Y(E, (e) => {
				W(t).status === "ready" && e(ee);
			});
			var te = B(E);
			A(T), A(n), V((e, r, i) => {
				Oi(n, 1, `calendar-day ${W(t).status} ${W(t).profile.id === "weekend" ? "weekend" : ""}`), J(a, e), J(u, W(t).profile.label), J(f, W(t).day_context), J(v, `${r ?? ""} `), J(w, `Gewinner: ${W(t).wake.matched_rule ?? W(t).wake.decided_by ?? ""}`), Gi(T, "data-status", W(t).status), J(te, ` ${i ?? ""}`);
			}, [
				() => $a(W(t).date),
				() => W(t).wake.reason.replaceAll("_", " "),
				() => Za(W(t).status)
			]), q(e, n);
		}), A(o), A(n), V(() => J(a, `Contract v${t.projection.version ?? ""} · ${t.projection.horizon_days ?? ""} Tage`)), q(e, n);
	}, c = (e) => {
		var n = uo(), r = R(n);
		_a(r, { size: 30 });
		var i = B(r, 6), a = R(i, !0);
		A(i), A(n), V((e) => {
			Gi(i, "data-status", t.status), J(a, e);
		}, [() => Za(t.status)]), q(e, n);
	};
	Y(o, (e) => {
		t.projection?.days?.length ? e(s) : e(c, -1);
	}), V((e) => {
		Gi(i, "data-status", t.projection?.status ?? t.status), J(a, e);
	}, [() => Za(t.projection?.status ?? t.status)]), q(e, n), N();
}
//#endregion
//#region src/views/DiagnosticsView.svelte
var mo = /* @__PURE__ */ G("<section class=\"card\" style=\"margin-top: 14px;\" aria-labelledby=\"legacy-heading\"><div class=\"card-header\"><div><p class=\"section-kicker\">Temporär während Migration</p> <h3 id=\"legacy-heading\">Legacy-vs-Core-Vergleich</h3></div> <!></div> <p class=\"helper\">Diese Capability ist nur für Shadow-/Migrationsdiagnose sichtbar und verschwindet nach dem Cutover vollständig.</p> <details><summary>Vergleichsdaten anzeigen</summary> <pre class=\"diagnostic-pre\"> </pre></details></section>"), ho = /* @__PURE__ */ G("<div class=\"grid two\"><section class=\"card\" aria-labelledby=\"diag-overview-heading\"><div class=\"card-header\"><h3 id=\"diag-overview-heading\">Gesamtstatus</h3><!></div> <dl class=\"diagnostic-list\"><dt>Datenstatus</dt><dd> </dd> <dt>Snapshot</dt><dd> </dd> <dt>Snapshot-Contract</dt><dd> </dd> <dt>Timeline-Contract</dt><dd> </dd> <dt>Mapping</dt><dd> </dd> <dt>Berechtigung</dt><dd> </dd></dl></section> <section class=\"card\" aria-labelledby=\"diag-sources-heading\"><div class=\"card-header\"><h3 id=\"diag-sources-heading\">Datenqualität</h3><!></div> <dl class=\"diagnostic-list\"><dt>Wake source</dt><dd> </dd> <dt>Wake decision</dt><dd> </dd> <dt>Bio decision</dt><dd> </dd> <dt>Activity decision</dt><dd> </dd> <dt>Owner</dt><dd>Core State · internes Wake Planning</dd></dl></section></div> <!> <section class=\"card\" style=\"margin-top: 14px;\" aria-labelledby=\"trace-heading\"><div class=\"card-header\"><div><p class=\"section-kicker\">Progressiv aufklappbar</p> <h3 id=\"trace-heading\">Contract-Details</h3></div></div> <details><summary>Wake Planning</summary> <pre class=\"diagnostic-pre\"> </pre></details> <details><summary>Bio und Activity</summary> <pre class=\"diagnostic-pre\"> </pre></details></section>", 1), go = /* @__PURE__ */ G("<div class=\"empty-state\"><!> <h3>Diagnose wartet auf Snapshot</h3> <p>Der technische Trace wird erst mit einer belastbaren Core-State-Antwort gefüllt.</p></div>"), _o = /* @__PURE__ */ G("<div class=\"view-heading\"><div><p class=\"section-kicker\">Diagnose</p> <h2>Owner-lokaler Decision Trace</h2> <p class=\"muted\">Technische Details sind nachrangig. Private Kalendertexte und unnötige Entity-IDs bleiben außerhalb des Contracts.</p></div> <span class=\"data-status\"> </span></div> <!>", 1);
function vo(e, t) {
	M(t, !0);
	function n(e) {
		return e && typeof e == "object" ? e : {};
	}
	function r(e) {
		return JSON.stringify(e, null, 2);
	}
	var i = _o(), a = z(i), o = B(R(a), 2), s = R(o, !0);
	A(o), A(a);
	var c = B(a, 2), l = (e) => {
		let i = /* @__PURE__ */ P(() => t.snapshot.data.diagnostics), a = /* @__PURE__ */ P(() => n(W(i).wake)), o = /* @__PURE__ */ P(() => n(W(i).bio)), s = /* @__PURE__ */ P(() => n(W(i).activity));
		var c = ho(), l = z(c), u = R(l), d = R(u);
		za(B(R(d)), {
			size: 19,
			color: "var(--green)"
		}), A(d);
		var f = B(d, 2), p = B(R(f)), m = R(p, !0);
		A(p);
		var h = B(p, 3), g = R(h, !0);
		A(h);
		var _ = B(h, 3), v = R(_);
		A(_);
		var y = B(_, 3), b = R(y, !0);
		A(y);
		var x = B(y, 3), S = R(x, !0);
		A(x);
		var C = B(x, 3), w = R(C, !0);
		A(C), A(f), A(u);
		var T = B(u, 2), E = R(T);
		pa(B(R(E)), {
			size: 19,
			color: "var(--cyan)"
		}), A(E);
		var ee = B(E, 2), te = B(R(ee)), ne = R(te);
		A(te);
		var re = B(te, 3), ie = R(re, !0);
		A(re);
		var ae = B(re, 3), oe = R(ae, !0);
		A(ae);
		var se = B(ae, 3), ce = R(se, !0);
		A(se), j(3), A(ee), A(T), A(l);
		var le = B(l, 2), ue = (e) => {
			var t = mo(), n = R(t);
			Ta(B(R(n), 2), {
				size: 20,
				color: "var(--orange)"
			}), A(n);
			var i = B(n, 4), o = B(R(i), 2), s = R(o, !0);
			A(o), A(i), A(t), V((e) => J(s, e), [() => r(W(a))]), q(e, t);
		};
		Y(le, (e) => {
			t.snapshot.capabilities.legacy_comparison && e(ue);
		});
		var de = B(le, 2), fe = B(R(de), 2), pe = B(R(fe), 2), me = R(pe, !0);
		A(pe), A(fe);
		var he = B(fe, 2), ge = B(R(he), 2), _e = R(ge, !0);
		A(ge), A(he), A(de), V((e, n, r, i, a, o, s, c, l, u) => {
			J(m, e), J(g, n), J(v, `${t.snapshot.contract ?? ""} · v${t.snapshot.version ?? ""}`), J(b, t.snapshot.data.timeline.version), J(S, r), J(w, t.snapshot.permissions.command ? "Commands autorisiert" : "Nur Lesen"), J(ne, `${i ?? ""} · ${a ?? ""}`), J(ie, o), J(oe, s), J(ce, c), J(me, l), J(_e, u);
		}, [
			() => Za(t.snapshot.status),
			() => eo(t.snapshot.updated_at),
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
		]), q(e, c);
	}, u = (e) => {
		var t = go();
		pa(R(t), { size: 30 }), j(4), A(t), q(e, t);
	};
	Y(c, (e) => {
		t.snapshot?.data ? e(l) : e(u, -1);
	}), V((e) => {
		Gi(o, "data-status", t.snapshot?.status ?? t.status), J(s, e);
	}, [() => Za(t.snapshot?.status ?? t.status)]), q(e, i), N();
}
//#endregion
//#region src/views/ProfilesRulesView.svelte
var yo = /* @__PURE__ */ G("<button type=\"button\"><span class=\"section-kicker\"> </span> <h3> </h3> <div class=\"inline-meta\"><span class=\"chip cyan\"><!> </span> <span class=\"chip\"> </span></div> <p class=\"helper\"> </p></button>"), bo = /* @__PURE__ */ G("<div class=\"action-row\"><button class=\"button secondary\" type=\"button\">Bearbeiten</button> <button class=\"button secondary danger\" type=\"button\"><!> Entfernen</button></div>"), xo = /* @__PURE__ */ G("<span class=\"helper\">Profilregel</span>"), So = /* @__PURE__ */ G("<tr><td><strong> </strong><br/><span class=\"helper\"> </span></td><td> </td><td> </td><td> </td><td><!></td></tr>"), Co = /* @__PURE__ */ G("<section class=\"profile-grid\" aria-label=\"Wirksame Wake-Profile\"></section> <section class=\"form-card\" style=\"margin-top: 14px;\" aria-labelledby=\"profile-edit-heading\"><div class=\"card-header\"><div><p class=\"section-kicker\">Core-State-Command</p> <h3 id=\"profile-edit-heading\"> </h3></div> <span class=\"chip purple\">Keine manuelle Profilumschaltung</span></div> <form class=\"form-grid\"><label class=\"field\"><span class=\"field-label\">Wake-Zeit</span> <input type=\"time\" required=\"\"/></label> <label class=\"field\"><span class=\"field-label\">Wake Window (Minuten)</span> <input type=\"number\" min=\"0\" max=\"120\" required=\"\"/></label> <label class=\"field\"><span class=\"field-label\">M · Mindestschlaf</span> <input type=\"number\" min=\"1\" max=\"1440\" placeholder=\"nicht belegt\"/> <small>Leer bleibt backendseitig fehlend und wird nicht geraten.</small></label> <label class=\"field\"><span class=\"field-label\">A · Schutzvorlauf</span> <input type=\"number\" min=\"1\" max=\"1440\" placeholder=\"nicht belegt\"/></label> <div class=\"field full action-row\"><button class=\"button\" type=\"submit\"><!> Profil speichern</button></div></form></section> <section class=\"table-card\" style=\"margin-top: 14px;\" aria-labelledby=\"rules-heading\"><div class=\"section-header\"><div><p class=\"section-kicker\">Regelgewinner</p> <h3 id=\"rules-heading\">Automatische Regelarten</h3></div> <!></div> <div class=\"table-wrap\"><table class=\"rules-table\"><thead><tr><th>Regel</th><th>Priorität</th><th>Gültigkeit</th><th>Aktion</th><th></th></tr></thead><tbody></tbody></table></div></section> <section class=\"form-card\" style=\"margin-top: 14px;\" aria-labelledby=\"rule-edit-heading\"><div class=\"card-header\"><div><p class=\"section-kicker\">Automatische Regel bearbeiten</p> <h3 id=\"rule-edit-heading\">Wochentage, Daten oder Zyklen</h3></div> <span class=\"helper\">Nur Core-State-Regeln, kein Skip-/Zeit-Override.</span></div> <form class=\"form-grid\"><label class=\"field\"><span class=\"field-label\">ID</span><input required=\"\" placeholder=\"z. B. school_cycle\"/></label> <label class=\"field\"><span class=\"field-label\">Name</span><input placeholder=\"Verständlicher Name\"/></label> <label class=\"field\"><span class=\"field-label\">Aktion</span><select><option>Wake</option><option>Ohne Wake</option></select></label> <label class=\"field\"><span class=\"field-label\">Wake-Zeit</span><input type=\"time\"/></label> <label class=\"field\"><span class=\"field-label\">Priorität</span><input type=\"number\" min=\"0\" max=\"1000\"/></label> <label class=\"field\"><span class=\"field-label\">Wochentage</span><input placeholder=\"0,1,2\"/><small>Montag 0 bis Sonntag 6.</small></label> <label class=\"field\"><span class=\"field-label\">Von</span><input type=\"date\"/></label> <label class=\"field\"><span class=\"field-label\">Bis</span><input type=\"date\"/></label> <div class=\"field full action-row\"><button class=\"button\" type=\"submit\"><!> Regel speichern</button></div></form></section>", 1), wo = /* @__PURE__ */ G("<div class=\"skeleton\" aria-busy=\"true\"></div>"), To = /* @__PURE__ */ G("<div class=\"view-heading\"><div><p class=\"section-kicker\">Profile & Regeln</p> <h2>Automatische Wake-Planung</h2> <p class=\"muted\">Genau zwei wirksame Profile. Feiertag und Urlaub wählen automatisch das Wochenendprofil.</p></div></div> <!>", 1);
function Eo(e, t) {
	M(t, !0);
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
	var b = To(), x = B(z(b), 2), S = (e) => {
		var g = Co(), b = z(g);
		ui(b, 21, () => Object.values(t.snapshot.config.profiles), (e) => e.id, (e, t) => {
			var r = yo();
			let i;
			var a = R(r), o = R(a, !0);
			A(a);
			var s = B(a, 2), c = R(s, !0);
			A(s);
			var l = B(s, 2), u = R(l), d = R(u);
			Ca(d, { size: 14 });
			var f = B(d);
			A(u);
			var p = B(u, 2), m = R(p);
			A(p), A(l);
			var g = B(l, 2), _ = R(g);
			A(g), A(r), V((e, a) => {
				i = Oi(r, 1, "form-card", null, i, { active: W(n) === W(t).id }), Gi(r, "aria-pressed", W(n) === W(t).id), J(o, W(t).id === "weekday" ? "Werktagsprofil" : "Wochenendprofil"), J(c, W(t).label), J(f, ` ${W(t).wake_time ?? ""}`), J(m, `Fenster ±${W(t).wake_window_minutes ?? ""} min`), J(_, `M ${e ?? ""} · A ${a ?? ""}`);
			}, [() => to(W(t).minimum_sleep_minutes, " min"), () => to(W(t).provisional_lead_minutes, " min")]), Hr("click", r, () => h(W(t).id)), q(e, r);
		}), A(b);
		var x = B(b, 2), S = R(x), C = R(S), w = B(R(C), 2), T = R(w);
		A(w), A(C), j(2), A(S);
		var E = B(S, 2), ee = R(E), te = B(R(ee), 2);
		Ui(te), A(ee);
		var ne = B(ee, 2), re = B(R(ne), 2);
		Ui(re), A(ne);
		var ie = B(ne, 2), ae = B(R(ie), 2);
		Ui(ae), j(2), A(ie);
		var oe = B(ie, 2), se = B(R(oe), 2);
		Ui(se), A(oe);
		var ce = B(oe, 2), le = R(ce);
		Fa(R(le), { size: 16 }), j(), A(le), A(ce), A(E), A(x);
		var ue = B(x, 2), de = R(ue);
		ka(B(R(de), 2), {
			size: 19,
			color: "var(--cyan)"
		}), A(de);
		var fe = B(de, 2), pe = R(fe), me = B(R(pe));
		ui(me, 21, () => t.snapshot.config.effective_rules ?? t.snapshot.config.rules, (e) => e.id, (e, n) => {
			var r = So(), i = R(r), a = R(i), o = R(a, !0);
			A(a);
			var s = B(a, 2), c = R(s, !0);
			A(s), A(i);
			var l = B(i), u = R(l, !0);
			A(l);
			var d = B(l), f = R(d, !0);
			A(d);
			var p = B(d), m = R(p, !0);
			A(p);
			var h = B(p), g = R(h), _ = (e) => {
				var r = bo(), i = R(r), a = B(i, 2);
				Ga(R(a), { size: 15 }), j(), A(a), A(r), V(() => {
					i.disabled = !t.snapshot.capabilities.edit_rules, a.disabled = t.pendingCommand !== null || !t.snapshot.capabilities.edit_rules;
				}), Hr("click", i, () => v(W(n))), Hr("click", a, () => t.onCommand("wake.rule.remove", { rule_id: W(n).id })), q(e, r);
			}, y = /* @__PURE__ */ P(() => !W(n).id.startsWith("profile_")), b = (e) => {
				q(e, xo());
			};
			Y(g, (e) => {
				W(y) ? e(_) : e(b, -1);
			}), A(h), A(r), V((e) => {
				J(o, W(n).name), J(c, W(n).id), J(u, W(n).priority), J(f, e), J(m, W(n).action === "skip" ? "Ohne Wake" : `Wake ${W(n).wake_time ?? "—"}`);
			}, [() => W(n).weekdays?.length ? `Wochentage: ${W(n).weekdays.join(", ")}` : "Datums-/Zyklusregel"]), q(e, r);
		}), A(me), A(pe), A(fe), A(ue);
		var he = B(ue, 2), ge = B(R(he), 2), _e = R(ge), ve = B(R(_e));
		Ui(ve), A(_e);
		var ye = B(_e, 2), be = B(R(ye));
		Ui(be), A(ye);
		var xe = B(ye, 2), Se = B(R(xe)), Ce = R(Se);
		Ce.value = Ce.__value = "wake";
		var we = B(Ce);
		we.value = we.__value = "skip", A(Se), A(xe);
		var Te = B(xe, 2), Ee = B(R(Te));
		Ui(Ee), A(Te);
		var De = B(Te, 2), D = B(R(De));
		Ui(D), A(De);
		var Oe = B(De, 2), ke = B(R(Oe));
		Ui(ke), j(), A(Oe);
		var Ae = B(Oe, 2), je = B(R(Ae));
		Ui(je), A(Ae);
		var Me = B(Ae, 2), Ne = B(R(Me));
		Ui(Ne), A(Me);
		var Pe = B(Me, 2), O = R(Pe);
		Fa(R(O), { size: 16 }), j(), A(O), A(Pe), A(ge), A(he), V(() => {
			J(T, `${t.snapshot.config.profiles[W(n)].label ?? ""} bearbeiten`), le.disabled = t.pendingCommand !== null || !t.snapshot.capabilities.edit_profiles, Ee.disabled = W(f) === "skip", O.disabled = t.pendingCommand !== null || !t.snapshot.capabilities.edit_rules;
		}), Vr("submit", E, _), Zi(te, () => W(r), (e) => L(r, e)), Zi(re, () => W(i), (e) => L(i, e)), Zi(ae, () => W(a), (e) => L(a, e)), Zi(se, () => W(o), (e) => L(o, e)), Vr("submit", ge, y), Zi(ve, () => W(s), (e) => L(s, e)), Zi(be, () => W(c), (e) => L(c, e)), Ni(Se, () => W(f), (e) => L(f, e)), Zi(Ee, () => W(l), (e) => L(l, e)), Zi(D, () => W(d), (e) => L(d, e)), Zi(ke, () => W(u), (e) => L(u, e)), Zi(je, () => W(p), (e) => L(p, e)), Zi(Ne, () => W(m), (e) => L(m, e)), q(e, g);
	}, C = (e) => {
		q(e, wo());
	};
	Y(x, (e) => {
		t.snapshot?.config ? e(S) : e(C, -1);
	}), q(e, b), N();
}
Ur(["click"]);
//#endregion
//#region src/views/SettingsView.svelte
var Do = /* @__PURE__ */ G("<section class=\"card\" style=\"margin-top: 14px;\" aria-labelledby=\"migration-heading\"><div class=\"card-header\"><div><p class=\"section-kicker\">Migration</p> <h3 id=\"migration-heading\">Versionierte Übernahme</h3></div> <span class=\"chip orange\"> </span></div> <p class=\"helper\"> </p> <div class=\"action-row\"><button class=\"button secondary danger\" type=\"button\"><!> Core-State-Migration zurücksetzen</button></div></section>"), Oo = /* @__PURE__ */ G("<section class=\"form-card\" aria-labelledby=\"settings-heading\"><div class=\"card-header\"><div><p class=\"section-kicker\">Konfiguration</p> <h3 id=\"settings-heading\">Kalender, Konflikte und Floor</h3></div> <span class=\"chip cyan\"> </span></div> <form class=\"form-grid\"><label class=\"field\"><span class=\"field-label\">Wake-Kalenderquelle</span> <input placeholder=\"calendar.core_state_wake\"/> <small>Nur externe Quelle lesen; Core State schreibt nicht in den Kalender.</small></label> <label class=\"field\"><span class=\"field-label\">Feiertags-/Urlaubsquelle</span> <input placeholder=\"calendar.core_state_holidays\"/> <small>Feiertag und Urlaub stufen Werktag automatisch auf Wochenende.</small></label> <label class=\"field full\"><span class=\"field-label\">Manuelle Feiertags-/Urlaubsintervalle</span> <textarea placeholder=\"2026-12-24..2026-12-31\"></textarea> <small>Ein Datum oder Intervall pro Zeile. Samstag bleibt Wochenende.</small></label> <label class=\"field\"><span class=\"field-label\">Wake Window (Kalenderkonflikt)</span> <select><option>Warnen, Regelzeit beibehalten</option><option>Für frühen Termin früher wecken</option><option>Konflikt ignorieren</option></select></label> <label class=\"field\"><span class=\"field-label\">Routine-Dauer (Minuten)</span> <input type=\"number\" min=\"0\" max=\"1440\"/></label> <label class=\"field\"><span class=\"field-label\">Absoluter Floor</span> <input type=\"time\" required=\"\"/> <small>Unabhängig von Tagesphase, Tageskontext und Sonnenaufgang.</small></label> <label class=\"field full\"><span class=\"field-label\">Kalender-Markierungen</span> <input placeholder=\"no-wake schlaf aus\"/> <small>Belegte automatische Skip-Titel; keine manuelle Skip-Aktion.</small></label> <label class=\"field full\"><span class=\"field-label\">Wake-Muster</span> <input/> <small>Backend validiert das Muster und redigiert Ereignistexte aus der Diagnose.</small></label> <div class=\"field full action-row\"><button class=\"button\" type=\"submit\"><!> Einstellungen speichern</button></div></form></section> <!>", 1), ko = /* @__PURE__ */ G("<div class=\"skeleton\" aria-busy=\"true\"></div>"), Ao = /* @__PURE__ */ G("<div class=\"view-heading\"><div><p class=\"section-kicker\">Einstellungen</p> <h2>Core-State-eigene Quellen und Grenzen</h2> <p class=\"muted\">Diese Werte werden persistiert, versioniert validiert und ausschließlich von Core State ausgewertet.</p></div> <!></div> <!>", 1);
function jo(e, t) {
	M(t, !0);
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
	var p = Ao(), m = z(p);
	ha(B(R(m), 2), {
		size: 24,
		color: "var(--cyan)"
	}), A(m);
	var h = B(m, 2), g = (e) => {
		var n = Oo(), d = z(n), p = R(d), m = B(R(p), 2), h = R(m);
		A(m), A(p);
		var g = B(p, 2), _ = R(g), v = B(R(_), 2);
		Ui(v), j(2), A(_);
		var y = B(_, 2), b = B(R(y), 2);
		Ui(b), j(2), A(y);
		var x = B(y, 2), S = B(R(x), 2);
		pt(S), j(2), A(x);
		var C = B(x, 2), w = B(R(C), 2), T = R(w);
		T.value = T.__value = "warn_only";
		var E = B(T);
		E.value = E.__value = "wake_earlier";
		var ee = B(E);
		ee.value = ee.__value = "ignore", A(w), A(C);
		var te = B(C, 2), ne = B(R(te), 2);
		Ui(ne), A(te);
		var re = B(te, 2), ie = B(R(re), 2);
		Ui(ie), j(2), A(re);
		var ae = B(re, 2), oe = B(R(ae), 2);
		Ui(oe), j(2), A(ae);
		var se = B(ae, 2), ce = B(R(se), 2);
		Ui(ce), j(2), A(se);
		var le = B(se, 2), ue = R(le);
		Fa(R(ue), { size: 16 }), j(), A(ue), A(le), A(g), A(d);
		var de = B(d, 2), fe = (e) => {
			var n = Do(), r = R(n), i = B(R(r), 2), a = R(i, !0);
			A(i), A(r);
			var o = B(r, 2), s = R(o);
			A(o);
			var c = B(o, 2), l = R(c);
			Na(R(l), { size: 16 }), j(), A(l), A(c), A(n), V(() => {
				J(a, t.snapshot.config.migration.status ?? "unbekannt"), J(s, `Quelle: ${t.snapshot.config.migration.source ?? "Core State" ?? ""}. Die alte Quelle wird nicht verändert; Rollback stellt das vorherige Core-State-Dokument wieder her.`), l.disabled = t.pendingCommand !== null || !t.snapshot.capabilities.edit_settings;
			}), Hr("click", l, () => t.onCommand("wake.config.rollback")), q(e, n);
		};
		Y(de, (e) => {
			t.snapshot.config.migration.rollback_available && e(fe);
		}), V(() => {
			J(h, `Contract ${t.snapshot.config.contract_version ?? ""}`), ue.disabled = t.pendingCommand !== null || !t.snapshot.capabilities.edit_settings;
		}), Vr("submit", g, f), Zi(v, () => W(r), (e) => L(r, e)), Zi(b, () => W(i), (e) => L(i, e)), Zi(S, () => W(a), (e) => L(a, e)), Ni(w, () => W(l), (e) => L(l, e)), Zi(ne, () => W(c), (e) => L(c, e)), Zi(ie, () => W(u), (e) => L(u, e)), Zi(oe, () => W(o), (e) => L(o, e)), Zi(ce, () => W(s), (e) => L(s, e)), q(e, n);
	}, _ = (e) => {
		q(e, ko());
	};
	Y(h, (e) => {
		t.snapshot?.config ? e(g) : e(_, -1);
	}), q(e, p), N();
}
Ur(["click"]);
//#endregion
//#region src/lib/ui/Button.svelte
var Mo = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"variant",
	"class",
	"children",
	"type"
]), No = /* @__PURE__ */ G("<button><!></button>");
function Po(e, t) {
	let n = Q(t, "variant", 3, "default"), r = Q(t, "class", 3, ""), i = Q(t, "type", 3, "button"), a = /* @__PURE__ */ X(t, Mo);
	var o = No();
	qi(o, () => ({
		...a,
		type: i(),
		class: `button inline-flex min-h-11 items-center justify-center gap-2 ${n() === "default" ? "" : n()} ${r()}`
	})), gi(R(o), () => t.children ?? f), A(o), q(e, o);
}
//#endregion
//#region node_modules/svelte-toolbelt/dist/utils/is.js
function Fo(e) {
	return typeof e == "object" && !!e;
}
var Io = [
	"string",
	"number",
	"bigint",
	"boolean"
];
function Lo(e) {
	return e == null || Io.includes(typeof e) ? !0 : Array.isArray(e) ? e.every((e) => Lo(e)) : typeof e == "object" && Object.getPrototypeOf(e) === Object.prototype;
}
//#endregion
//#region node_modules/svelte-toolbelt/dist/box/box-extras.svelte.js
var Ro = Symbol("box"), zo = Symbol("is-writable");
function $(e, t) {
	let n = /* @__PURE__ */ P(e);
	return t ? {
		[Ro]: !0,
		[zo]: !0,
		get current() {
			return W(n);
		},
		set current(e) {
			t(e);
		}
	} : {
		[Ro]: !0,
		get current() {
			return e();
		}
	};
}
function Bo(e) {
	return Fo(e) && Ro in e;
}
function Vo(e) {
	let t = /* @__PURE__ */ I(ln(e));
	return {
		[Ro]: !0,
		[zo]: !0,
		get current() {
			return W(t);
		},
		set current(e) {
			L(t, e, !0);
		}
	};
}
//#endregion
//#region node_modules/svelte-toolbelt/dist/utils/compose-handlers.js
function Ho(...e) {
	return function(t) {
		for (let n of e) if (n) {
			if (t.defaultPrevented) return;
			typeof n == "function" ? n.call(this, t) : n.current?.call(this, t);
		}
	};
}
//#endregion
//#region node_modules/inline-style-parser/esm/index.mjs
var Uo = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, Wo = /\n/g, Go = /^\s*/, Ko = /^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/, qo = /^:\s*/, Jo = /^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/, Yo = /^[;\s]*/, Xo = /^\s+|\s+$/g, Zo = "\n", Qo = "/", $o = "*", es = "", ts = "comment", ns = "declaration";
function rs(e, t) {
	if (typeof e != "string") throw TypeError("First argument must be a string");
	if (!e) return [];
	t ||= {};
	var n = 1, r = 1;
	function i(e) {
		var t = e.match(Wo);
		t && (n += t.length);
		var i = e.lastIndexOf(Zo);
		r = ~i ? e.length - i : r + e.length;
	}
	function a() {
		var e = {
			line: n,
			column: r
		};
		return function(t) {
			return t.position = new o(e), l(), t;
		};
	}
	function o(e) {
		this.start = e, this.end = {
			line: n,
			column: r
		}, this.source = t.source;
	}
	o.prototype.content = e;
	function s(i) {
		var a = /* @__PURE__ */ Error(t.source + ":" + n + ":" + r + ": " + i);
		if (a.reason = i, a.filename = t.source, a.line = n, a.column = r, a.source = e, !t.silent) throw a;
	}
	function c(t) {
		var n = t.exec(e);
		if (n) {
			var r = n[0];
			return i(r), e = e.slice(r.length), n;
		}
	}
	function l() {
		c(Go);
	}
	function u(e) {
		var t;
		for (e ||= []; t = d();) t !== !1 && e.push(t);
		return e;
	}
	function d() {
		var t = a();
		if (Qo == e.charAt(0) && $o == e.charAt(1)) {
			for (var n = 2; es != e.charAt(n) && ($o != e.charAt(n) || Qo != e.charAt(n + 1));) ++n;
			if (n += 2, es === e.charAt(n - 1)) return s("End of comment missing");
			var o = e.slice(2, n - 2);
			return r += 2, i(o), e = e.slice(n), r += 2, t({
				type: ts,
				comment: o
			});
		}
	}
	function f() {
		var e = a(), t = c(Ko);
		if (t) {
			if (d(), !c(qo)) return s("property missing ':'");
			var n = c(Jo), r = e({
				type: ns,
				property: is(t[0].replace(Uo, es)),
				value: n ? is(n[0].replace(Uo, es)) : es
			});
			return c(Yo), r;
		}
	}
	function p() {
		var e = [];
		u(e);
		for (var t; t = f();) t !== !1 && (e.push(t), u(e));
		return e;
	}
	return l(), p();
}
function is(e) {
	return e ? e.replace(Xo, es) : es;
}
//#endregion
//#region node_modules/style-to-object/esm/index.mjs
function as(e, t) {
	let n = null;
	if (!e || typeof e != "string") return n;
	let r = rs(e), i = typeof t == "function";
	return r.forEach((e) => {
		if (e.type !== "declaration") return;
		let { property: r, value: a } = e;
		i ? t(r, a, e) : a && (n ||= {}, n[r] = a);
	}), n;
}
//#endregion
//#region node_modules/svelte-toolbelt/dist/utils/strings.js
var os = /\d/, ss = [
	"-",
	"_",
	"/",
	"."
];
function cs(e = "") {
	if (!os.test(e)) return e !== e.toLowerCase();
}
function ls(e) {
	let t = [], n = "", r, i;
	for (let a of e) {
		let e = ss.includes(a);
		if (e === !0) {
			t.push(n), n = "", r = void 0;
			continue;
		}
		let o = cs(a);
		if (i === !1) {
			if (r === !1 && o === !0) {
				t.push(n), n = a, r = o;
				continue;
			}
			if (r === !0 && o === !1 && n.length > 1) {
				let e = n.at(-1);
				t.push(n.slice(0, Math.max(0, n.length - 1))), n = e + a, r = o;
				continue;
			}
		}
		n += a, r = o, i = e;
	}
	return t.push(n), t;
}
function us(e) {
	return e ? ls(e).map((e) => fs(e)).join("") : "";
}
function ds(e) {
	return ps(us(e || ""));
}
function fs(e) {
	return e ? e[0].toUpperCase() + e.slice(1) : "";
}
function ps(e) {
	return e ? e[0].toLowerCase() + e.slice(1) : "";
}
//#endregion
//#region node_modules/svelte-toolbelt/dist/utils/css-to-style-obj.js
function ms(e) {
	if (!e) return {};
	let t = {};
	function n(e, n) {
		if (e.startsWith("-moz-") || e.startsWith("-webkit-") || e.startsWith("-ms-") || e.startsWith("-o-")) {
			t[us(e)] = n;
			return;
		}
		if (e.startsWith("--")) {
			t[e] = n;
			return;
		}
		t[ds(e)] = n;
	}
	return as(e, n), t;
}
//#endregion
//#region node_modules/svelte-toolbelt/dist/utils/execute-callbacks.js
function hs(...e) {
	return (...t) => {
		for (let n of e) typeof n == "function" && n(...t);
	};
}
//#endregion
//#region node_modules/svelte-toolbelt/dist/utils/style-to-css.js
function gs(e, t) {
	let n = RegExp(e, "g");
	return (e) => {
		if (typeof e != "string") throw TypeError(`expected an argument of type string, but got ${typeof e}`);
		return e.match(n) ? e.replace(n, t) : e;
	};
}
var _s = gs(/[A-Z]/, (e) => `-${e.toLowerCase()}`);
function vs(e) {
	if (!e || typeof e != "object" || Array.isArray(e)) throw TypeError(`expected an argument of type object, but got ${typeof e}`);
	return Object.keys(e).map((t) => `${_s(t)}: ${e[t]};`).join("\n");
}
//#endregion
//#region node_modules/svelte-toolbelt/dist/utils/style.js
function ys(e = {}) {
	return vs(e).replace("\n", " ");
}
var bs = new Set(/* @__PURE__ */ "onabort.onanimationcancel.onanimationend.onanimationiteration.onanimationstart.onauxclick.onbeforeinput.onbeforetoggle.onblur.oncancel.oncanplay.oncanplaythrough.onchange.onclick.onclose.oncompositionend.oncompositionstart.oncompositionupdate.oncontextlost.oncontextmenu.oncontextrestored.oncopy.oncuechange.oncut.ondblclick.ondrag.ondragend.ondragenter.ondragleave.ondragover.ondragstart.ondrop.ondurationchange.onemptied.onended.onerror.onfocus.onfocusin.onfocusout.onformdata.ongotpointercapture.oninput.oninvalid.onkeydown.onkeypress.onkeyup.onload.onloadeddata.onloadedmetadata.onloadstart.onlostpointercapture.onmousedown.onmouseenter.onmouseleave.onmousemove.onmouseout.onmouseover.onmouseup.onpaste.onpause.onplay.onplaying.onpointercancel.onpointerdown.onpointerenter.onpointerleave.onpointermove.onpointerout.onpointerover.onpointerup.onprogress.onratechange.onreset.onresize.onscroll.onscrollend.onsecuritypolicyviolation.onseeked.onseeking.onselect.onselectionchange.onselectstart.onslotchange.onstalled.onsubmit.onsuspend.ontimeupdate.ontoggle.ontouchcancel.ontouchend.ontouchmove.ontouchstart.ontransitioncancel.ontransitionend.ontransitionrun.ontransitionstart.onvolumechange.onwaiting.onwebkitanimationend.onwebkitanimationiteration.onwebkitanimationstart.onwebkittransitionend.onwheel".split("."));
//#endregion
//#region node_modules/svelte-toolbelt/dist/utils/merge-props.js
function xs(e) {
	return bs.has(e);
}
function Ss(...e) {
	let t = { ...e[0] };
	for (let n = 1; n < e.length; n++) {
		let r = e[n];
		if (r) {
			for (let e of Object.keys(r)) {
				let n = t[e], i = r[e], a = typeof n == "function", o = typeof i == "function";
				if (a && typeof o && xs(e)) t[e] = Ho(n, i);
				else if (a && o) t[e] = hs(n, i);
				else if (e === "class") {
					let r = Lo(n), a = Lo(i);
					r && a ? t[e] = xi(n, i) : r ? t[e] = xi(n) : a && (t[e] = xi(i));
				} else if (e === "style") {
					let r = typeof n == "object", a = typeof i == "object", o = typeof n == "string", s = typeof i == "string";
					if (r && a) t[e] = {
						...n,
						...i
					};
					else if (r && s) {
						let r = ms(i);
						t[e] = {
							...n,
							...r
						};
					} else if (o && a) t[e] = {
						...ms(n),
						...i
					};
					else if (o && s) {
						let r = ms(n), a = ms(i);
						t[e] = {
							...r,
							...a
						};
					} else r ? t[e] = n : a ? t[e] = i : o ? t[e] = n : s && (t[e] = i);
				} else t[e] = i === void 0 ? n : i;
			}
			for (let e of Object.getOwnPropertySymbols(r)) {
				let n = t[e], i = r[e];
				t[e] = i === void 0 ? n : i;
			}
		}
	}
	return typeof t.style == "object" && (t.style = ys(t.style).replaceAll("\n", " ")), t.hidden === !1 && (t.hidden = void 0, delete t.hidden), t.disabled === !1 && (t.disabled = void 0, delete t.disabled), t;
}
//#endregion
//#region node_modules/runed/dist/internal/configurable-globals.js
var Cs = typeof window < "u" ? window : void 0;
typeof window < "u" && window.document, typeof window < "u" && window.navigator, typeof window < "u" && window.location;
//#endregion
//#region node_modules/runed/dist/internal/utils/dom.js
function ws(e) {
	let t = e.activeElement;
	for (; t?.shadowRoot;) {
		let e = t.shadowRoot.activeElement;
		if (e === t) break;
		t = e;
	}
	return t;
}
//#endregion
//#region node_modules/svelte/src/reactivity/map.js
var Ts = class extends Map {
	#e = /* @__PURE__ */ new Map();
	#t = /* @__PURE__ */ I(0);
	#n = /* @__PURE__ */ I(0);
	#r = fr || -1;
	constructor(e) {
		if (super(), e) {
			for (var [t, n] of e) super.set(t, n);
			this.#n.v = super.size;
		}
	}
	#i(e) {
		return fr === this.#r ? /* @__PURE__ */ I(e) : nn(e);
	}
	has(e) {
		var t = this.#e, n = t.get(e);
		if (n === void 0) {
			if (super.has(e)) n = this.#i(0), t.set(e, n);
			else return W(this.#t), !1;
		}
		return W(n), !0;
	}
	forEach(e, t) {
		this.#a(), super.forEach(e, t);
	}
	get(e) {
		var t = this.#e, n = t.get(e);
		if (n === void 0) {
			if (super.has(e)) n = this.#i(0), t.set(e, n);
			else {
				W(this.#t);
				return;
			}
		}
		return W(n), super.get(e);
	}
	set(e, t) {
		var n = this.#e, r = n.get(e), i = super.get(e), a = super.set(e, t), o = this.#t;
		if (r === void 0) r = this.#i(0), n.set(e, r), L(this.#n, super.size), sn(o);
		else if (i !== t) {
			sn(r);
			var s = o.reactions === null ? null : new Set(o.reactions);
			(s === null || !r.reactions?.every((e) => s.has(e))) && sn(o);
		}
		return a;
	}
	delete(e) {
		var t = this.#e, n = t.get(e), r = super.delete(e);
		return n !== void 0 && (t.delete(e), L(n, -1)), r && (L(this.#n, super.size), sn(this.#t)), r;
	}
	clear() {
		if (super.size !== 0) {
			super.clear();
			var e = this.#e;
			L(this.#n, 0);
			for (var t of e.values()) L(t, -1);
			sn(this.#t), e.clear();
		}
	}
	#a() {
		W(this.#t);
		var e = this.#e;
		if (this.#n.v !== e.size) {
			for (var t of super.keys()) if (!e.has(t)) {
				var n = this.#i(0);
				e.set(t, n);
			}
		}
		for ([, n] of this.#e) W(n);
	}
	keys() {
		return W(this.#t), super.keys();
	}
	values() {
		return this.#a(), super.values();
	}
	entries() {
		return this.#a(), super.entries();
	}
	[Symbol.iterator]() {
		return this.entries();
	}
	get size() {
		return W(this.#n), super.size;
	}
};
new class {
	#e;
	#t;
	constructor(e = {}) {
		let { window: t = Cs, document: n = t?.document } = e;
		t !== void 0 && (this.#e = n, this.#t = vt((e) => {
			let n = Br(t, "focusin", e), r = Br(t, "focusout", e);
			return () => {
				n(), r();
			};
		}));
	}
	get current() {
		return this.#t?.(), this.#e ? ws(this.#e) : null;
	}
}();
//#endregion
//#region node_modules/runed/dist/internal/utils/is.js
function Es(e) {
	return typeof e == "function";
}
//#endregion
//#region node_modules/runed/dist/utilities/context/context.js
var Ds = class {
	#e;
	#t;
	constructor(e) {
		this.#e = e, this.#t = Symbol(e);
	}
	get key() {
		return this.#t;
	}
	exists() {
		return qe(this.#t);
	}
	get() {
		let e = Ge(this.#t);
		if (e === void 0) throw Error(`Context "${this.#e}" not found`);
		return e;
	}
	getOr(e) {
		let t = Ge(this.#t);
		return t === void 0 ? e : t;
	}
	set(e) {
		return Ke(this.#t, e);
	}
};
//#endregion
//#region node_modules/runed/dist/utilities/watch/watch.svelte.js
function Os(e, t) {
	switch (e) {
		case "post":
			kn(t);
			break;
		case "pre": jn(t);
	}
}
function ks(e, t, n, r = {}) {
	let { lazy: i = !1 } = r, a = !i, o = Array.isArray(e) ? [] : void 0;
	Os(t, () => {
		let t = Array.isArray(e) ? e.map((e) => e()) : e();
		if (!a) {
			a = !0, o = t;
			return;
		}
		let r = wr(() => n(t, o));
		return o = t, r;
	});
}
function As(e, t, n) {
	ks(e, "post", t, n);
}
function js(e, t, n) {
	ks(e, "pre", t, n);
}
As.pre = js;
//#endregion
//#region node_modules/runed/dist/internal/utils/get.js
function Ms(e) {
	return Es(e) ? e() : e;
}
//#endregion
//#region node_modules/runed/dist/utilities/element-size/element-size.svelte.js
var Ns = class {
	#e = {
		width: 0,
		height: 0
	};
	#t = !1;
	#n;
	#r;
	#i;
	#a = /* @__PURE__ */ P(() => (W(this.#s)?.(), this.getSize().width));
	#o = /* @__PURE__ */ P(() => (W(this.#s)?.(), this.getSize().height));
	#s = /* @__PURE__ */ P(() => {
		let e = Ms(this.#r);
		if (e) return vt((t) => {
			if (!this.#i) return;
			let n = new this.#i.ResizeObserver((e) => {
				this.#t = !0;
				for (let t of e) {
					let e = this.#n.box === "content-box" ? t.contentBoxSize : t.borderBoxSize, n = Array.isArray(e) ? e : [e];
					this.#e.width = n.reduce((e, t) => Math.max(e, t.inlineSize), 0), this.#e.height = n.reduce((e, t) => Math.max(e, t.blockSize), 0);
				}
				t();
			});
			return n.observe(e), () => {
				this.#t = !1, n.disconnect();
			};
		});
	});
	constructor(e, t = { box: "border-box" }) {
		this.#i = t.window ?? Cs, this.#n = t, this.#r = e, this.#e = {
			width: 0,
			height: 0
		};
	}
	calculateSize() {
		let e = Ms(this.#r);
		if (!e || !this.#i) return;
		let t = e.offsetWidth, n = e.offsetHeight;
		if (this.#n.box === "border-box") return {
			width: t,
			height: n
		};
		let r = this.#i.getComputedStyle(e), i = parseFloat(r.paddingLeft) + parseFloat(r.paddingRight), a = parseFloat(r.paddingTop) + parseFloat(r.paddingBottom), o = parseFloat(r.borderLeftWidth) + parseFloat(r.borderRightWidth), s = parseFloat(r.borderTopWidth) + parseFloat(r.borderBottomWidth);
		return {
			width: t - i - o,
			height: n - a - s
		};
	}
	getSize() {
		return this.#t ? this.#e : this.calculateSize() ?? this.#e;
	}
	get current() {
		return W(this.#s)?.(), this.getSize();
	}
	get width() {
		return W(this.#a);
	}
	get height() {
		return W(this.#o);
	}
};
//#endregion
//#region node_modules/svelte-toolbelt/dist/utils/on-destroy-effect.svelte.js
function Ps(e) {
	kn(() => () => {
		e();
	});
}
//#endregion
//#region node_modules/svelte-toolbelt/dist/utils/on-mount-effect.svelte.js
function Fs(e) {
	kn(() => wr(() => e()));
}
//#endregion
//#region node_modules/svelte-toolbelt/dist/utils/after-sleep.js
function Is(e, t) {
	return setTimeout(t, e);
}
//#endregion
//#region node_modules/svelte-toolbelt/dist/utils/after-tick.js
function Ls(e) {
	xr().then(e);
}
//#endregion
//#region node_modules/svelte-toolbelt/dist/utils/dom.js
var Rs = 1, zs = 9, Bs = 11;
function Vs(e) {
	return Fo(e) && e.nodeType === Rs && typeof e.nodeName == "string";
}
function Hs(e) {
	return Fo(e) && e.nodeType === zs;
}
function Us(e) {
	return Fo(e) && e.constructor?.name === "VisualViewport";
}
function Ws(e) {
	return Fo(e) && e.nodeType !== void 0;
}
function Gs(e) {
	return Ws(e) && e.nodeType === Bs && "host" in e;
}
function Ks(e, t) {
	if (!e || !t || !Vs(e) || !Vs(t)) return !1;
	let n = t.getRootNode?.();
	if (e === t || e.contains(t)) return !0;
	if (n && Gs(n)) {
		let n = t;
		for (; n;) {
			if (e === n) return !0;
			n = n.parentNode || n.host;
		}
	}
	return !1;
}
function qs(e) {
	return Hs(e) ? e : Us(e) ? e.document : e?.ownerDocument ?? document;
}
function Js(e) {
	return Gs(e) ? Js(e.host) : Hs(e) ? e.defaultView ?? window : Vs(e) ? e.ownerDocument?.defaultView ?? window : window;
}
function Ys(e) {
	let t = e.activeElement;
	for (; t?.shadowRoot;) {
		let e = t.shadowRoot.activeElement;
		if (e === t) break;
		t = e;
	}
	return t;
}
//#endregion
//#region node_modules/svelte-toolbelt/dist/utils/dom-context.svelte.js
var Xs = class {
	element;
	#e = /* @__PURE__ */ P(() => this.element.current ? this.element.current.getRootNode() ?? document : document);
	get root() {
		return W(this.#e);
	}
	set root(e) {
		L(this.#e, e);
	}
	constructor(e) {
		this.element = typeof e == "function" ? $(e) : e;
	}
	getDocument = () => qs(this.root);
	getWindow = () => this.getDocument().defaultView ?? window;
	getActiveElement = () => Ys(this.root);
	isActiveElement = (e) => e === this.getActiveElement();
	getElementById(e) {
		return this.root.getElementById(e);
	}
	querySelector = (e) => this.root ? this.root.querySelector(e) : null;
	querySelectorAll = (e) => this.root ? this.root.querySelectorAll(e) : [];
	setTimeout = (e, t) => this.getWindow().setTimeout(e, t);
	clearTimeout = (e) => this.getWindow().clearTimeout(e);
};
//#endregion
//#region node_modules/svelte-toolbelt/dist/utils/attach-ref.js
function Zs(e, t) {
	return { [Tr()]: (n) => Bo(e) ? (e.current = n, wr(() => t?.(n)), () => {
		"isConnected" in n && n.isConnected || (e.current = null, t?.(null));
	}) : (e(n), wr(() => t?.(n)), () => {
		"isConnected" in n && n.isConnected || (e(null), t?.(null));
	}) };
}
//#endregion
//#region node_modules/bits-ui/dist/internal/attrs.js
function Qs(e) {
	return e ? "" : void 0;
}
function $s(e) {
	return e === "starting" ? { "data-starting-style": "" } : e === "ending" ? { "data-ending-style": "" } : {};
}
var ec = class {
	#e;
	#t;
	attrs;
	constructor(e) {
		this.#e = e.getVariant ? e.getVariant() : null, this.#t = this.#e ? `data-${this.#e}-` : `data-${e.component}-`, this.getAttr = this.getAttr.bind(this), this.selector = this.selector.bind(this), this.attrs = Object.fromEntries(e.parts.map((e) => [e, this.getAttr(e)]));
	}
	getAttr(e, t) {
		return t ? `data-${t}-${e}` : `${this.#t}${e}`;
	}
	selector(e, t) {
		return `[${this.getAttr(e, t)}]`;
	}
};
function tc(e) {
	let t = new ec(e);
	return {
		...t.attrs,
		selector: t.selector,
		getAttr: t.getAttr
	};
}
//#endregion
//#region node_modules/bits-ui/dist/internal/is.js
var nc = typeof document < "u", rc = ic();
function ic() {
	return nc && window?.navigator?.userAgent && (/iP(ad|hone|od)/.test(window.navigator.userAgent) || window?.navigator?.maxTouchPoints > 2 && /iPad|Macintosh/.test(window?.navigator.userAgent));
}
function ac(e) {
	return e instanceof HTMLElement;
}
function oc(e) {
	return e instanceof Element;
}
function sc(e) {
	return e instanceof Element || e instanceof SVGElement;
}
function cc(e) {
	return e.matches(":focus-visible");
}
function lc(e) {
	return e !== null;
}
//#endregion
//#region node_modules/bits-ui/dist/internal/animations-complete.js
var uc = class {
	#e;
	#t = null;
	#n = null;
	#r = 0;
	constructor(e) {
		this.#e = e, Ps(() => this.#i());
	}
	#i() {
		this.#t !== null && (window.cancelAnimationFrame(this.#t), this.#t = null), this.#n?.disconnect(), this.#n = null, this.#r++;
	}
	run(e) {
		this.#i();
		let t = this.#e.ref.current;
		if (!t) return;
		if (typeof t.getAnimations != "function") {
			this.#a(e);
			return;
		}
		let n = this.#r, r = () => {
			n === this.#r && this.#a(e);
		}, i = () => {
			if (n !== this.#r) return;
			let e = t.getAnimations();
			if (e.length === 0) {
				r();
				return;
			}
			Promise.all(e.map((e) => e.finished)).then(() => {
				r();
			}).catch(() => {
				if (n === this.#r) {
					if (t.getAnimations().some((e) => e.pending || e.playState !== "finished")) {
						i();
						return;
					}
					r();
				}
			});
		}, a = () => {
			this.#t = window.requestAnimationFrame(() => {
				this.#t = null, i();
			});
		};
		if (!this.#e.afterTick.current) {
			a();
			return;
		}
		this.#t = window.requestAnimationFrame(() => {
			this.#t = null;
			let e = "data-starting-style";
			if (!t.hasAttribute(e)) {
				a();
				return;
			}
			this.#n = new MutationObserver(() => {
				n === this.#r && (t.hasAttribute(e) || (this.#n?.disconnect(), this.#n = null, a()));
			}), this.#n.observe(t, {
				attributes: !0,
				attributeFilter: [e]
			});
		});
	}
	#a(e) {
		let t = () => {
			e();
		};
		this.#e.afterTick ? Ls(t) : t();
	}
}, dc = class {
	#e;
	#t;
	#n;
	#r = /* @__PURE__ */ I(!1);
	#i = /* @__PURE__ */ I(void 0);
	#a = !1;
	#o = null;
	constructor(e) {
		this.#e = e, L(this.#r, e.open.current, !0), this.#t = e.enabled ?? !0, this.#n = new uc({
			ref: this.#e.ref,
			afterTick: this.#e.open
		}), Ps(() => this.#s()), As(() => this.#e.open.current, (e) => {
			if (!this.#a) {
				this.#a = !0;
				return;
			}
			if (this.#s(), !e && this.#e.shouldSkipExitAnimation?.()) {
				L(this.#r, !1), L(this.#i, void 0), this.#e.onComplete?.();
				return;
			}
			if (e && L(this.#r, !0), L(this.#i, e ? "starting" : "ending", !0), e && (this.#o = window.requestAnimationFrame(() => {
				this.#o = null, this.#e.open.current && L(this.#i, void 0);
			})), !this.#t) {
				e || L(this.#r, !1), L(this.#i, void 0), this.#e.onComplete?.();
				return;
			}
			this.#n.run(() => {
				e === this.#e.open.current && (this.#e.open.current || L(this.#r, !1), L(this.#i, void 0), this.#e.onComplete?.());
			});
		});
	}
	get shouldRender() {
		return W(this.#r);
	}
	get transitionStatus() {
		return W(this.#i);
	}
	#s() {
		this.#o !== null && (window.cancelAnimationFrame(this.#o), this.#o = null);
	}
};
//#endregion
//#region node_modules/bits-ui/dist/internal/noop.js
function fc() {}
//#endregion
//#region node_modules/bits-ui/dist/internal/create-id.js
function pc(e, t) {
	return t === void 0 ? `bits-${e}` : `bits-${e}-${t}`;
}
//#endregion
//#region node_modules/bits-ui/dist/internal/events.js
var mc = class {
	eventName;
	options;
	constructor(e, t = {
		bubbles: !0,
		cancelable: !0
	}) {
		this.eventName = e, this.options = t;
	}
	createEvent(e) {
		return new CustomEvent(this.eventName, {
			...this.options,
			detail: e
		});
	}
	dispatch(e, t) {
		let n = this.createEvent(t);
		return e.dispatchEvent(n), n;
	}
	listen(e, t, n) {
		return Br(e, this.eventName, (e) => {
			t(e);
		}, n);
	}
};
//#endregion
//#region node_modules/bits-ui/dist/internal/debounce.js
function hc(e, t = 500) {
	let n = null, r = (...r) => {
		n !== null && clearTimeout(n), n = setTimeout(() => {
			e(...r);
		}, t);
	};
	return r.destroy = () => {
		n !== null && (clearTimeout(n), n = null);
	}, r;
}
//#endregion
//#region node_modules/bits-ui/dist/internal/elements.js
function gc(e, t) {
	return e === t || e.contains(t);
}
function _c(e) {
	return e?.ownerDocument ?? document;
}
//#endregion
//#region node_modules/bits-ui/dist/internal/dom.js
function vc(e, t) {
	let { clientX: n, clientY: r } = e, i = t.getBoundingClientRect();
	return n < i.left || n > i.right || r < i.top || r > i.bottom;
}
//#endregion
//#region node_modules/tabbable/dist/index.esm.js
var yc = [
	"input:not([inert]):not([inert] *)",
	"select:not([inert]):not([inert] *)",
	"textarea:not([inert]):not([inert] *)",
	"a[href]:not([inert]):not([inert] *)",
	"area[href]:not([inert]):not([inert] *)",
	"button:not([inert]):not([inert] *)",
	"[tabindex]:not(slot):not([inert]):not([inert] *)",
	"audio[controls]:not([inert]):not([inert] *)",
	"video[controls]:not([inert]):not([inert] *)",
	"[contenteditable]:not([contenteditable=\"false\"]):not([inert]):not([inert] *)",
	"details>summary:first-of-type:not([inert]):not([inert] *)",
	"details:not([inert]):not([inert] *)"
], bc = /* #__PURE__ */ yc.join(","), xc = typeof Element > "u", Sc = xc ? function() {} : Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector, Cc = !xc && Element.prototype.getRootNode ? function(e) {
	return e?.getRootNode?.call(e);
} : function(e) {
	return e?.ownerDocument;
}, wc = function(e, t) {
	t === void 0 && (t = !0);
	var n = e?.getAttribute?.call(e, "inert");
	return n === "" || n === "true" || t && e && (typeof e.closest == "function" ? e.closest("[inert]") : wc(e.parentNode));
}, Tc = function(e) {
	var t = e?.getAttribute?.call(e, "contenteditable");
	return t === "" || t === "true";
}, Ec = function(e, t, n) {
	if (wc(e)) return [];
	var r = Array.prototype.slice.apply(e.querySelectorAll(bc));
	return t && Sc.call(e, bc) && r.unshift(e), r = r.filter(n), r;
}, Dc = function(e, t, n) {
	for (var r = [], i = Array.from(e); i.length;) {
		var a = i.shift();
		if (!wc(a, !1)) {
			if (a.tagName === "SLOT") {
				var o = a.assignedElements(), s = Dc(o.length ? o : a.children, !0, n);
				n.flatten ? r.push.apply(r, s) : r.push({
					scopeParent: a,
					candidates: s
				});
			} else {
				Sc.call(a, bc) && n.filter(a) && (t || !e.includes(a)) && r.push(a);
				var c = a.shadowRoot || typeof n.getShadowRoot == "function" && n.getShadowRoot(a), l = !wc(c, !1) && (!n.shadowRootFilter || n.shadowRootFilter(a));
				if (c && l) {
					var u = Dc(c === !0 ? a.children : c.children, !0, n);
					n.flatten ? r.push.apply(r, u) : r.push({
						scopeParent: a,
						candidates: u
					});
				} else i.unshift.apply(i, a.children);
			}
		}
	}
	return r;
}, Oc = function(e) {
	return !isNaN(parseInt(e.getAttribute("tabindex"), 10));
}, kc = function(e) {
	if (!e) throw Error("No node provided");
	return e.tabIndex < 0 && (/^(AUDIO|VIDEO|DETAILS)$/.test(e.tagName) || Tc(e)) && !Oc(e) ? 0 : e.tabIndex;
}, Ac = function(e, t) {
	var n = kc(e);
	return n < 0 && t && !Oc(e) ? 0 : n;
}, jc = function(e, t) {
	return e.tabIndex === t.tabIndex ? e.documentOrder - t.documentOrder : e.tabIndex - t.tabIndex;
}, Mc = function(e) {
	return e.tagName === "INPUT";
}, Nc = function(e) {
	return Mc(e) && e.type === "hidden";
}, Pc = function(e) {
	return e.tagName === "DETAILS" && Array.prototype.slice.apply(e.children).some(function(e) {
		return e.tagName === "SUMMARY";
	});
}, Fc = function(e, t) {
	for (var n = 0; n < e.length; n++) if (e[n].checked && e[n].form === t) return e[n];
}, Ic = function(e) {
	if (!e.name) return !0;
	var t = e.form || Cc(e), n = function(e) {
		return t.querySelectorAll("input[type=\"radio\"][name=\"" + e + "\"]");
	}, r;
	if (typeof window < "u" && window.CSS !== void 0 && typeof window.CSS.escape == "function") r = n(window.CSS.escape(e.name));
	else try {
		r = n(e.name);
	} catch (e) {
		return console.error("Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s", e.message), !1;
	}
	var i = Fc(r, e.form);
	return !i || i === e;
}, Lc = function(e) {
	return Mc(e) && e.type === "radio";
}, Rc = function(e) {
	return Lc(e) && !Ic(e);
}, zc = function(e) {
	var t = e && Cc(e), n = t?.host, r = !1;
	if (t && t !== e) {
		var i, a, o;
		for (r = !!((i = n) != null && (a = i.ownerDocument) != null && a.contains(n) || e != null && (o = e.ownerDocument) != null && o.contains(e)); !r && n;) {
			var s, c;
			t = Cc(n), n = t?.host, r = !!((s = n) != null && (c = s.ownerDocument) != null && c.contains(n));
		}
	}
	return r;
}, Bc = function(e) {
	var t = e.getBoundingClientRect(), n = t.width, r = t.height;
	return n === 0 && r === 0;
}, Vc = function(e, t) {
	var n = t.displayCheck, r = t.getShadowRoot;
	if (n === "full-native" && "checkVisibility" in e) return !e.checkVisibility({
		checkOpacity: !1,
		opacityProperty: !1,
		contentVisibilityAuto: !0,
		visibilityProperty: !0,
		checkVisibilityCSS: !0
	});
	var i = getComputedStyle(e).visibility;
	if (i === "hidden" || i === "collapse") return !0;
	var a = Sc.call(e, "details>summary:first-of-type") ? e.parentElement : e;
	if (Sc.call(a, "details:not([open]) *")) return !0;
	if (!n || n === "full" || n === "full-native" || n === "legacy-full") {
		if (typeof r == "function") {
			for (var o = e; e;) {
				var s = e.parentElement, c = Cc(e);
				if (s && !s.shadowRoot && r(s) === !0) return Bc(e);
				e = e.assignedSlot ? e.assignedSlot : !s && c !== e.ownerDocument ? c.host : s;
			}
			e = o;
		}
		if (zc(e)) return !e.getClientRects().length;
		if (n !== "legacy-full") return !0;
	} else if (n === "non-zero-area") return Bc(e);
	return !1;
}, Hc = function(e) {
	if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(e.tagName)) for (var t = e.parentElement; t;) {
		if (t.tagName === "FIELDSET" && t.disabled) {
			for (var n = 0; n < t.children.length; n++) {
				var r = t.children.item(n);
				if (r.tagName === "LEGEND") return Sc.call(t, "fieldset[disabled] *") ? !0 : !r.contains(e);
			}
			return !0;
		}
		t = t.parentElement;
	}
	return !1;
}, Uc = function(e, t) {
	return !(t.disabled || Nc(t) || Vc(t, e) || Pc(t) || Hc(t));
}, Wc = function(e, t) {
	return !(Rc(t) || kc(t) < 0 || !Uc(e, t));
}, Gc = function(e) {
	var t = parseInt(e.getAttribute("tabindex"), 10);
	return !!(isNaN(t) || t >= 0);
}, Kc = function(e) {
	var t = [], n = [];
	return e.forEach(function(e, r) {
		var i = !!e.scopeParent, a = i ? e.scopeParent : e, o = Ac(a, i), s = i ? Kc(e.candidates) : a;
		o === 0 ? i ? t.push.apply(t, s) : t.push(a) : n.push({
			documentOrder: r,
			tabIndex: o,
			item: e,
			isScope: i,
			content: s
		});
	}), n.sort(jc).reduce(function(e, t) {
		return t.isScope ? e.push.apply(e, t.content) : e.push(t.content), e;
	}, []).concat(t);
}, qc = function(e, t) {
	return t ||= {}, Kc(t.getShadowRoot ? Dc([e], t.includeContainer, {
		filter: Wc.bind(null, t),
		flatten: !1,
		getShadowRoot: t.getShadowRoot,
		shadowRootFilter: Gc
	}) : Ec(e, t.includeContainer, Wc.bind(null, t)));
}, Jc = function(e, t) {
	return t ||= {}, t.getShadowRoot ? Dc([e], t.includeContainer, {
		filter: Uc.bind(null, t),
		flatten: !0,
		getShadowRoot: t.getShadowRoot
	}) : Ec(e, t.includeContainer, Uc.bind(null, t));
}, Yc = /* #__PURE__ */ yc.concat("iframe:not([inert]):not([inert] *)").join(","), Xc = function(e, t) {
	if (t ||= {}, !e) throw Error("No node provided");
	return Sc.call(e, Yc) !== !1 && Uc(t, e);
}, Zc = "data-context-menu-trigger", Qc = "data-context-menu-content";
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/dismissible-layer/use-dismissable-layer.svelte.js
new Ds("Menu.Root"), new Ds("Menu.Root | Menu.Sub"), new Ds("Menu.Content"), new Ds("Menu.Group | Menu.RadioGroup"), new Ds("Menu.RadioGroup"), new Ds("Menu.CheckboxGroup"), new mc("bitsmenuopen", {
	bubbles: !1,
	cancelable: !0
}), tc({
	component: "menu",
	parts: [
		"trigger",
		"content",
		"sub-trigger",
		"item",
		"group",
		"group-heading",
		"checkbox-group",
		"checkbox-item",
		"radio-group",
		"radio-item",
		"separator",
		"sub-content",
		"arrow"
	]
}), globalThis.bitsDismissableLayers ??= /* @__PURE__ */ new Map();
var $c = class e {
	static create(t) {
		return new e(t);
	}
	opts;
	#e;
	#t;
	#n = { pointerdown: !1 };
	#r = !1;
	#i = !1;
	#a = void 0;
	#o;
	#s = fc;
	constructor(e) {
		this.opts = e, this.#t = e.interactOutsideBehavior, this.#e = e.onInteractOutside, this.#o = e.onFocusOutside, kn(() => {
			this.#a = _c(this.opts.ref.current);
		});
		let t = fc, n = () => {
			this.#g(), globalThis.bitsDismissableLayers.delete(this), this.#d.destroy(), t();
		};
		As([() => this.opts.enabled.current, () => this.opts.ref.current], () => {
			if (!(!this.opts.enabled.current || !this.opts.ref.current)) return Is(1, () => {
				this.opts.ref.current && (globalThis.bitsDismissableLayers.set(this, this.#t), t(), t = this.#l());
			}), n;
		}), Ps(() => {
			this.#g.destroy(), globalThis.bitsDismissableLayers.delete(this), this.#d.destroy(), this.#s(), t();
		});
	}
	#c = (e) => {
		e.defaultPrevented || this.opts.ref.current && Ls(() => {
			!this.opts.ref.current || this.#h(e.target) || e.target && !this.#i && this.#o.current?.(e);
		});
	};
	#l() {
		return hs(Br(this.#a, "pointerdown", hs(this.#f, this.#m), { capture: !0 }), Br(this.#a, "pointerdown", hs(this.#p, this.#d)), Br(this.#a, "focusin", this.#c));
	}
	#u = (e) => {
		let t = e;
		t.defaultPrevented && (t = rl(e)), this.#e.current(e);
	};
	#d = hc((e) => {
		if (!this.opts.ref.current) {
			this.#s();
			return;
		}
		let t = this.opts.isValidEvent.current(e, this.opts.ref.current) || nl(e, this.opts.ref.current);
		if (!this.#r || this.#_() || !t) {
			this.#s();
			return;
		}
		let n = e;
		if (n.defaultPrevented && (n = rl(n)), this.#t.current !== "close" && this.#t.current !== "defer-otherwise-close") {
			this.#s();
			return;
		}
		e.pointerType === "touch" ? (this.#s(), this.#s = Br(this.#a, "click", this.#u, { once: !0 })) : this.#e.current(n);
	}, 10);
	#f = (e) => {
		this.#n[e.type] = !0;
	};
	#p = (e) => {
		this.#n[e.type] = !1;
	};
	#m = () => {
		this.opts.ref.current && (this.#r = tl(this.opts.ref.current));
	};
	#h = (e) => this.opts.ref.current ? gc(this.opts.ref.current, e) : !1;
	#g = hc(() => {
		for (let e in this.#n) this.#n[e] = !1;
		this.#r = !1;
	}, 20);
	#_() {
		return Object.values(this.#n).some(Boolean);
	}
	#v = () => {
		this.#i = !0;
	};
	#y = () => {
		this.#i = !1;
	};
	props = {
		onfocuscapture: this.#v,
		onblurcapture: this.#y
	};
};
function el(e = [...globalThis.bitsDismissableLayers]) {
	return e.findLast(([e, { current: t }]) => t === "close" || t === "ignore");
}
function tl(e) {
	let t = [...globalThis.bitsDismissableLayers], n = el(t);
	if (n) return n[0].opts.ref.current === e;
	let [r] = t[0];
	return r.opts.ref.current === e;
}
function nl(e, t) {
	let n = e.target;
	if (!sc(n)) return !1;
	let r = !!n.closest(`[${Zc}]`), i = !!t.closest(`[${Qc}]`);
	return "button" in e && e.button > 0 && !r ? !1 : "button" in e && e.button === 0 && r && i ? !0 : r && i ? !1 : _c(n).documentElement.contains(n) && !gc(t, n) && vc(e, t);
}
function rl(e) {
	let t = e.currentTarget, n = e.target, r;
	r = e instanceof PointerEvent ? new PointerEvent(e.type, e) : new PointerEvent("pointerdown", e);
	let i = !1;
	return new Proxy(r, { get: (r, a) => a === "currentTarget" ? t : a === "target" ? n : a === "preventDefault" ? () => {
		i = !0, typeof r.preventDefault == "function" && r.preventDefault();
	} : a === "defaultPrevented" ? i : a in r ? r[a] : e[a] });
}
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/dismissible-layer/dismissible-layer.svelte
function il(e, t) {
	M(t, !0);
	let n = Q(t, "interactOutsideBehavior", 3, "close"), r = Q(t, "onInteractOutside", 3, fc), i = Q(t, "onFocusOutside", 3, fc), a = Q(t, "isValidEvent", 3, () => !1), o = $c.create({
		id: $(() => t.id),
		interactOutsideBehavior: $(() => n()),
		onInteractOutside: $(() => r()),
		enabled: $(() => t.enabled),
		onFocusOutside: $(() => i()),
		isValidEvent: $(() => a()),
		ref: t.ref
	});
	var s = K();
	gi(z(s), () => t.children ?? f, () => ({ props: o.props })), q(e, s), N();
}
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/escape-layer/use-escape-layer.svelte.js
globalThis.bitsEscapeLayers ??= /* @__PURE__ */ new Map();
var al = class e {
	static create(t) {
		return new e(t);
	}
	opts;
	domContext;
	constructor(e) {
		this.opts = e, this.domContext = new Xs(this.opts.ref);
		let t = fc;
		As(() => e.enabled.current, (n) => (n && (globalThis.bitsEscapeLayers.set(this, e.escapeKeydownBehavior), t = this.#e()), () => {
			t(), globalThis.bitsEscapeLayers.delete(this);
		}));
	}
	#e = () => Br(this.domContext.getDocument(), "keydown", this.#t, { passive: !1 });
	#t = (e) => {
		if (e.key !== "Escape" || !ol(this)) return;
		let t = new KeyboardEvent(e.type, e);
		e.preventDefault();
		let n = this.opts.escapeKeydownBehavior.current;
		(n === "close" || n === "defer-otherwise-close") && this.opts.onEscapeKeydown.current(t);
	};
};
function ol(e) {
	let t = [...globalThis.bitsEscapeLayers], n = t.findLast(([e, { current: t }]) => t === "close" || t === "ignore");
	if (n) return n[0] === e;
	let [r] = t[0];
	return r === e;
}
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/escape-layer/escape-layer.svelte
function sl(e, t) {
	M(t, !0);
	let n = Q(t, "escapeKeydownBehavior", 3, "close"), r = Q(t, "onEscapeKeydown", 3, fc);
	al.create({
		escapeKeydownBehavior: $(() => n()),
		onEscapeKeydown: $(() => r()),
		enabled: $(() => t.enabled),
		ref: t.ref
	});
	var i = K();
	gi(z(i), () => t.children ?? f), q(e, i), N();
}
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/focus-scope/focus-scope-manager.js
var cl = class e {
	static instance;
	#e = Vo([]);
	#t = /* @__PURE__ */ new WeakMap();
	#n = /* @__PURE__ */ new WeakMap();
	static getInstance() {
		return this.instance ||= new e(), this.instance;
	}
	register(e) {
		let t = this.getActive();
		t && t !== e && t.pause();
		let n = document.activeElement;
		n && n !== document.body && this.#n.set(e, n), this.#e.current = this.#e.current.filter((t) => t !== e), this.#e.current.unshift(e);
	}
	unregister(e) {
		this.#e.current = this.#e.current.filter((t) => t !== e);
		let t = this.getActive();
		t && t.resume();
	}
	getActive() {
		return this.#e.current[0];
	}
	setFocusMemory(e, t) {
		this.#t.set(e, t);
	}
	getFocusMemory(e) {
		return this.#t.get(e);
	}
	isActiveScope(e) {
		return this.getActive() === e;
	}
	setPreFocusMemory(e, t) {
		this.#n.set(e, t);
	}
	getPreFocusMemory(e) {
		return this.#n.get(e);
	}
	clearPreFocusMemory(e) {
		this.#n.delete(e);
	}
}, ll = class e {
	#e = !1;
	#t = null;
	#n = cl.getInstance();
	#r = [];
	#i;
	constructor(e) {
		this.#i = e;
	}
	get paused() {
		return this.#e;
	}
	pause() {
		this.#e = !0;
	}
	resume() {
		this.#e = !1;
	}
	#a() {
		for (let e of this.#r) e();
		this.#r = [];
	}
	mount(e) {
		this.#t && this.unmount(), this.#t = e, this.#n.register(this), this.#c(), this.#o();
	}
	unmount() {
		this.#t &&= (this.#a(), this.#s(), this.#n.unregister(this), this.#n.clearPreFocusMemory(this), null);
	}
	#o() {
		if (!this.#t) return;
		let e = new CustomEvent("focusScope.onOpenAutoFocus", {
			bubbles: !1,
			cancelable: !0
		});
		this.#i.onOpenAutoFocus.current(e), e.defaultPrevented || requestAnimationFrame(() => {
			if (!this.#t) return;
			let e = this.#u();
			e ? (e.focus(), this.#n.setFocusMemory(this, e)) : this.#t.focus();
		});
	}
	#s() {
		let e = new CustomEvent("focusScope.onCloseAutoFocus", {
			bubbles: !1,
			cancelable: !0
		});
		if (this.#i.onCloseAutoFocus.current?.(e), !e.defaultPrevented) {
			let e = this.#n.getPreFocusMemory(this);
			if (e && document.contains(e)) try {
				e.focus();
			} catch {
				document.body.focus();
			}
		}
	}
	#c() {
		if (!this.#t || !this.#i.trap.current) return;
		let e = this.#t, t = e.ownerDocument;
		this.#r.push(Br(t, "focusin", (t) => {
			if (this.#e || !this.#n.isActiveScope(this)) return;
			let n = t.target;
			if (n) {
				if (e.contains(n)) this.#n.setFocusMemory(this, n);
				else {
					let n = this.#n.getFocusMemory(this);
					if (n && e.contains(n) && Xc(n)) t.preventDefault(), n.focus();
					else {
						let t = this.#u(), n = this.#d()[0];
						(t || n || e).focus();
					}
				}
			}
		}, { capture: !0 }), Br(e, "keydown", (e) => {
			if (!this.#i.loop || this.#e || e.key !== "Tab" || !this.#n.isActiveScope(this)) return;
			let n = this.#l();
			if (n.length === 0) return;
			let r = n[0], i = n[n.length - 1];
			!e.shiftKey && t.activeElement === i ? (e.preventDefault(), r.focus()) : e.shiftKey && t.activeElement === r && (e.preventDefault(), i.focus());
		}));
		let n = new MutationObserver(() => {
			let t = this.#n.getFocusMemory(this);
			if (t && !e.contains(t)) {
				let t = this.#u(), n = this.#d()[0], r = t || n;
				r ? (r.focus(), this.#n.setFocusMemory(this, r)) : e.focus();
			}
		});
		n.observe(e, {
			childList: !0,
			subtree: !0
		}), this.#r.push(() => n.disconnect());
	}
	#l() {
		return this.#t ? qc(this.#t, {
			includeContainer: !1,
			getShadowRoot: !0
		}) : [];
	}
	#u() {
		return this.#l()[0] || null;
	}
	#d() {
		return this.#t ? Jc(this.#t, {
			includeContainer: !1,
			getShadowRoot: !0
		}) : [];
	}
	static use(t) {
		let n = null;
		return As([() => t.ref.current, () => t.enabled.current], ([r, i]) => {
			r && i ? (n ||= new e(t), n.mount(r)) : n &&= (n.unmount(), null);
		}), Ps(() => {
			n?.unmount();
		}), { get props() {
			return { tabindex: -1 };
		} };
	}
};
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/focus-scope/focus-scope.svelte
function ul(e, t) {
	M(t, !0);
	let n = Q(t, "enabled", 3, !1), r = Q(t, "trapFocus", 3, !1), i = Q(t, "loop", 3, !1), a = Q(t, "onCloseAutoFocus", 3, fc), o = Q(t, "onOpenAutoFocus", 3, fc), s = ll.use({
		enabled: $(() => n()),
		trap: $(() => r()),
		loop: i(),
		onCloseAutoFocus: $(() => a()),
		onOpenAutoFocus: $(() => o()),
		ref: t.ref
	});
	var c = K();
	gi(z(c), () => t.focusScope ?? f, () => ({ props: s.props })), q(e, c), N();
}
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/text-selection-layer/use-text-selection-layer.svelte.js
var dl = () => {};
globalThis.bitsTextSelectionLayers ??= /* @__PURE__ */ new Map();
var fl = class e {
	static create(t) {
		return new e(t);
	}
	opts;
	domContext;
	#e = fc;
	#t = !1;
	#n = dl;
	#r = dl;
	constructor(e) {
		this.opts = e, this.domContext = new Xs(e.ref);
		let t = fc;
		As(() => [
			this.opts.enabled.current,
			this.opts.onPointerDown.current,
			this.opts.onPointerUp.current
		], ([e, n, r]) => (this.#t = e, this.#n = n, this.#r = r, e && (globalThis.bitsTextSelectionLayers.set(this, this.opts.enabled), t(), t = this.#i()), () => {
			this.#t = !1, t(), this.#s(), globalThis.bitsTextSelectionLayers.delete(this);
		}));
	}
	#i() {
		return hs(Br(this.domContext.getDocument(), "pointerdown", this.#o), Br(this.domContext.getDocument(), "pointerup", Ho(this.#s, this.#a)));
	}
	#a = (e) => {
		this.#r(e);
	};
	#o = (e) => {
		let t = this.opts.ref.current, n = e.target;
		!ac(t) || !ac(n) || !this.#t || !gl(this) || !Ks(t, n) || (this.#n(e), !e.defaultPrevented && (this.#e = ml(t, this.domContext.getDocument().body)));
	};
	#s = () => {
		this.#e(), this.#e = fc;
	};
}, pl = (e) => e.style.userSelect || e.style.webkitUserSelect;
function ml(e, t) {
	let n = pl(t), r = pl(e);
	return hl(t, "none"), hl(e, "text"), () => {
		hl(t, n), hl(e, r);
	};
}
function hl(e, t) {
	e.style.userSelect = t, e.style.webkitUserSelect = t;
}
function gl(e) {
	let t = [...globalThis.bitsTextSelectionLayers];
	if (!t.length) return !1;
	let n = t.at(-1);
	return n ? n[0] === e : !1;
}
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/text-selection-layer/text-selection-layer.svelte
function _l(e, t) {
	M(t, !0);
	let n = Q(t, "preventOverflowTextSelection", 3, !0), r = Q(t, "onPointerDown", 3, fc), i = Q(t, "onPointerUp", 3, fc);
	fl.create({
		id: $(() => t.id),
		onPointerDown: $(() => r()),
		onPointerUp: $(() => i()),
		enabled: $(() => t.enabled && n()),
		ref: t.ref
	});
	var a = K();
	gi(z(a), () => t.children ?? f), q(e, a), N();
}
//#endregion
//#region node_modules/bits-ui/dist/internal/use-id.js
globalThis.bitsIdCounter ??= { current: 0 };
function vl(e = "bits") {
	return globalThis.bitsIdCounter.current++, `${e}-${globalThis.bitsIdCounter.current}`;
}
//#endregion
//#region node_modules/bits-ui/dist/internal/shared-state.svelte.js
var yl = class {
	#e;
	#t = 0;
	#n = /* @__PURE__ */ I();
	#r;
	constructor(e) {
		this.#e = e;
	}
	#i() {
		--this.#t, this.#r && this.#t <= 0 && (this.#r(), L(this.#n, void 0), this.#r = void 0);
	}
	get(...e) {
		return this.#t += 1, W(this.#n) === void 0 && (this.#r = Mn(() => {
			L(this.#n, this.#e(...e), !0);
		})), kn(() => () => {
			this.#i();
		}), W(this.#n);
	}
}, bl = new Ts(), xl = /* @__PURE__ */ I(null), Sl = null, Cl = null, wl = !1, Tl = $(() => {
	for (let e of bl.values()) if (e) return !0;
	return !1;
}), El = null, Dl = new yl(() => {
	function e() {
		document.body.setAttribute("style", W(xl) ?? ""), document.body.style.removeProperty("--scrollbar-width"), rc && Sl?.(), L(xl, null);
	}
	function t() {
		Cl !== null && (window.clearTimeout(Cl), Cl = null);
	}
	function n(e, n) {
		t(), wl = !0, El = Date.now();
		let r = El, i = () => {
			Cl = null, El === r && (kl(bl) ? wl = !1 : (wl = !1, n()));
		}, a = e === null ? 24 : e;
		Cl = window.setTimeout(i, a);
	}
	function r() {
		W(xl) === null && bl.size === 0 && !wl && L(xl, document.body.getAttribute("style"), !0);
	}
	return As(() => Tl.current, () => {
		if (!Tl.current) return;
		r(), wl = !1;
		let e = getComputedStyle(document.documentElement), t = getComputedStyle(document.body), n = e.scrollbarGutter?.includes("stable") || t.scrollbarGutter?.includes("stable"), i = window.innerWidth - document.documentElement.clientWidth, a = {
			padding: Number.parseInt(t.paddingRight ?? "0", 10) + i,
			margin: Number.parseInt(t.marginRight ?? "0", 10)
		};
		i > 0 && !n && (document.body.style.paddingRight = `${a.padding}px`, document.body.style.marginRight = `${a.margin}px`, document.body.style.setProperty("--scrollbar-width", `${i}px`)), document.body.style.overflow = "hidden", rc && (Sl = Br(document, "touchmove", (e) => {
			e.target === document.documentElement && (e.touches.length > 1 || e.preventDefault());
		}, { passive: !1 })), Ls(() => {
			document.body.style.pointerEvents = "none", document.body.style.overflow = "hidden";
		});
	}), Ps(() => () => {
		Sl?.();
	}), {
		get lockMap() {
			return bl;
		},
		resetBodyStyle: e,
		scheduleCleanupIfNoNewLocks: n,
		cancelPendingCleanup: t,
		ensureInitialStyleCaptured: r
	};
}), Ol = class {
	#e = vl();
	#t;
	#n = () => null;
	#r;
	locked;
	constructor(e, t = () => null) {
		this.#t = e, this.#n = t, this.#r = Dl.get(), this.#r && (this.#r.cancelPendingCleanup(), this.#r.ensureInitialStyleCaptured(), this.#r.lockMap.set(this.#e, this.#t ?? !1), this.locked = $(() => this.#r.lockMap.get(this.#e) ?? !1, (e) => this.#r.lockMap.set(this.#e, e)), Ps(() => {
			if (this.#r.lockMap.delete(this.#e), kl(this.#r.lockMap)) return;
			let e = this.#n();
			this.#r.scheduleCleanupIfNoNewLocks(e, () => {
				this.#r.resetBodyStyle();
			});
		}));
	}
};
function kl(e) {
	for (let [t, n] of e) if (n) return !0;
	return !1;
}
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/scroll-lock/scroll-lock.svelte
function Al(e, t) {
	M(t, !0);
	let n = Q(t, "preventScroll", 3, !0), r = Q(t, "restoreScrollDelay", 3, null);
	n() && new Ol(n(), () => r()), N();
}
//#endregion
//#region node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var jl = [
	"top",
	"right",
	"bottom",
	"left"
], Ml = Math.min, Nl = Math.max, Pl = Math.round, Fl = Math.floor, Il = (e) => ({
	x: e,
	y: e
}), Ll = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function Rl(e, t, n) {
	return Nl(e, Ml(t, n));
}
function zl(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function Bl(e) {
	return e.split("-")[0];
}
function Vl(e) {
	return e.split("-")[1];
}
function Hl(e) {
	return e === "x" ? "y" : "x";
}
function Ul(e) {
	return e === "y" ? "height" : "width";
}
function Wl(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function Gl(e) {
	return Hl(Wl(e));
}
function Kl(e, t, n) {
	n === void 0 && (n = !1);
	let r = Vl(e), i = Gl(e), a = Ul(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = tu(o)), [o, tu(o)];
}
function ql(e) {
	let t = tu(e);
	return [
		Jl(e),
		t,
		Jl(t)
	];
}
function Jl(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var Yl = ["left", "right"], Xl = ["right", "left"], Zl = ["top", "bottom"], Ql = ["bottom", "top"];
function $l(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? Xl : Yl : t ? Yl : Xl;
		case "left":
		case "right": return t ? Zl : Ql;
		default: return [];
	}
}
function eu(e, t, n, r) {
	let i = Vl(e), a = $l(Bl(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(Jl)))), a;
}
function tu(e) {
	let t = Bl(e);
	return Ll[t] + e.slice(t.length);
}
function nu(e) {
	return {
		top: e.top ?? 0,
		right: e.right ?? 0,
		bottom: e.bottom ?? 0,
		left: e.left ?? 0
	};
}
function ru(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : nu(e);
}
function iu(e) {
	let { x: t, y: n, width: r, height: i } = e;
	return {
		width: r,
		height: i,
		top: n,
		left: t,
		right: t + r,
		bottom: n + i,
		x: t,
		y: n
	};
}
//#endregion
//#region node_modules/@floating-ui/core/dist/floating-ui.core.mjs
function au(e, t, n) {
	let { reference: r, floating: i } = e, a = Wl(t), o = Gl(t), s = Ul(o), c = Bl(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
	switch (c) {
		case "top":
			p = {
				x: u,
				y: r.y - i.height
			};
			break;
		case "bottom":
			p = {
				x: u,
				y: r.y + r.height
			};
			break;
		case "right":
			p = {
				x: r.x + r.width,
				y: d
			};
			break;
		case "left":
			p = {
				x: r.x - i.width,
				y: d
			};
			break;
		default: p = {
			x: r.x,
			y: r.y
		};
	}
	let m = Vl(t);
	return m && (p[o] += f * (m === "end" ? 1 : -1) * (n && l ? -1 : 1)), p;
}
async function ou(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = zl(t, e), p = ru(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = iu(await i.getClippingRect({
		element: await (i.isElement == null ? void 0 : i.isElement(m)) ?? !0 ? m : m.contextElement || await (i.getDocumentElement == null ? void 0 : i.getDocumentElement(o.floating)),
		boundary: c,
		rootBoundary: l,
		strategy: s
	})), g = u === "floating" ? {
		x: n,
		y: r,
		width: a.floating.width,
		height: a.floating.height
	} : a.reference, _ = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(o.floating)), v = await (i.isElement == null ? void 0 : i.isElement(_)) && await (i.getScale == null ? void 0 : i.getScale(_)) || {
		x: 1,
		y: 1
	}, y = iu(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
		elements: o,
		rect: g,
		offsetParent: _,
		strategy: s
	}) : g);
	return {
		top: (h.top - y.top + p.top) / v.y,
		bottom: (y.bottom - h.bottom + p.bottom) / v.y,
		left: (h.left - y.left + p.left) / v.x,
		right: (y.right - h.right + p.right) / v.x
	};
}
var su = 50, cu = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: ou
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = au(l, r, c), f = r, p = 0, m = {};
	for (let n = 0; n < a.length; n++) {
		let h = a[n];
		if (!h) continue;
		let { name: g, fn: _ } = h, { x: v, y, data: b, reset: x } = await _({
			x: u,
			y: d,
			initialPlacement: r,
			placement: f,
			strategy: i,
			middlewareData: m,
			rects: l,
			platform: s,
			elements: {
				reference: e,
				floating: t
			}
		});
		u = v ?? u, d = y ?? d, m[g] = {
			...m[g],
			...b
		}, x && p < su && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = au(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, lu = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = zl(e, t) || {};
		if (l == null) return {};
		let d = ru(u), f = {
			x: n,
			y: r
		}, p = Gl(i), m = Ul(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		(!C || !await (o.isElement == null ? void 0 : o.isElement(S))) && (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = Ml(d[_], T), ee = Ml(d[v], T), te = C - h[m] - ee, ne = C / 2 - h[m] / 2 + w, re = Rl(E, ne, te), ie = !c.arrow && Vl(i) != null && ne !== re && a.reference[m] / 2 - (ne < E ? E : ee) - h[m] / 2 < 0, ae = ie ? ne < E ? ne - E : ne - te : 0;
		return {
			[p]: f[p] + ae,
			data: {
				[p]: re,
				centerOffset: ne - re - ae,
				...ie && { alignmentOffset: ae }
			},
			reset: ie
		};
	}
}), uu = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = zl(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = Bl(r), _ = Wl(o), v = Bl(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [tu(o)] : ql(o)), x = p !== "none";
			!d && x && b.push(...eu(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = Kl(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (u !== "alignment" || _ === Wl(t) || T.every((e) => Wl(e.placement) !== _ || e.overflows[0] > 0))) return {
					data: {
						index: e,
						overflows: T
					},
					reset: { placement: t }
				};
				let n = T.filter((e) => e.overflows[0] <= 0).sort((e, t) => e.overflows[1] - t.overflows[1])[0]?.placement;
				if (!n) switch (f) {
					case "bestFit": {
						let e = T.filter((e) => {
							if (x) {
								let t = Wl(e.placement);
								return t === _ || t === "y";
							}
							return !0;
						}).map((e) => [e.placement, e.overflows.filter((e) => e > 0).reduce((e, t) => e + t, 0)]).sort((e, t) => e[1] - t[1])[0]?.[0];
						e && (n = e);
						break;
					}
					case "initialPlacement": n = o;
				}
				if (r !== n) return { reset: { placement: n } };
			}
			return {};
		}
	};
};
function du(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function fu(e) {
	return jl.some((t) => e[t] >= 0);
}
var pu = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = zl(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = du(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: fu(e)
					} };
				}
				case "escaped": {
					let e = du(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: fu(e)
					} };
				}
				default: return {};
			}
		}
	};
}, mu = /*#__PURE__*/ new Set(["left", "top"]);
async function hu(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = Bl(n), s = Vl(n), c = Wl(n) === "y", l = mu.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = zl(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
		mainAxis: d,
		crossAxis: 0,
		alignmentAxis: null
	} : {
		mainAxis: d.mainAxis || 0,
		crossAxis: d.crossAxis || 0,
		alignmentAxis: d.alignmentAxis
	};
	return s && typeof m == "number" && (p = s === "end" ? m * -1 : m), c ? {
		x: p * u,
		y: f * l
	} : {
		x: f * l,
		y: p * u
	};
}
var gu = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await hu(t, e);
			return a === o.offset?.placement && (n = o.arrow) != null && n.alignmentOffset ? {} : {
				x: r + s.x,
				y: i + s.y,
				data: {
					...s,
					placement: a
				}
			};
		}
	};
}, _u = function(e) {
	return e === void 0 && (e = {}), {
		name: "shift",
		options: e,
		async fn(t) {
			let { x: n, y: r, placement: i, platform: a } = t, { mainAxis: o = !0, crossAxis: s = !1, limiter: c = { fn: (e) => {
				let { x: t, y: n } = e;
				return {
					x: t,
					y: n
				};
			} }, ...l } = zl(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = Wl(i), p = Hl(f), m = u[p], h = u[f], g = (e, t) => Rl(t + d[e === "y" ? "top" : "left"], t, t - d[e === "y" ? "bottom" : "right"]);
			o && (m = g(p, m)), s && (h = g(f, h));
			let _ = c.fn({
				...t,
				[p]: m,
				[f]: h
			});
			return {
				..._,
				data: {
					x: _.x - n,
					y: _.y - r,
					enabled: {
						[p]: o,
						[f]: s
					}
				}
			};
		}
	};
}, vu = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = zl(e, t), u = {
				x: n,
				y: r
			}, d = Wl(i), f = Hl(d), p = u[f], m = u[d], h = zl(s, t), g = typeof h == "number" ? {
				mainAxis: h,
				crossAxis: 0
			} : {
				mainAxis: h.mainAxis ?? 0,
				crossAxis: h.crossAxis ?? 0
			};
			if (c) {
				let e = f === "y" ? "height" : "width", t = a.reference[f] - a.floating[e] + g.mainAxis, n = a.reference[f] + a.reference[e] - g.mainAxis;
				p < t ? p = t : p > n && (p = n);
			}
			if (l) {
				let e = f === "y" ? "width" : "height", t = mu.has(Bl(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, yu = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			let { placement: n, rects: r, platform: i, elements: a } = t, { apply: o = () => {}, ...s } = zl(e, t), c = await i.detectOverflow(t, s), l = Bl(n), u = Vl(n), d = Wl(n) === "y", { width: f, height: p } = r.floating, m, h;
			l === "top" || l === "bottom" ? (m = l, h = u === (await (i.isRTL == null ? void 0 : i.isRTL(a.floating)) ? "start" : "end") ? "left" : "right") : (h = l, m = u === "end" ? "top" : "bottom");
			let g = p - c.top - c.bottom, _ = f - c.left - c.right, v = Ml(p - c[m], g), y = Ml(f - c[h], _), b = t.middlewareData.shift, x = !b, S = v, C = y;
			b != null && b.enabled.x && (C = _), b != null && b.enabled.y && (S = g), x && !u && (d ? C = f - 2 * Nl(c.left, c.right) : S = p - 2 * Nl(c.top, c.bottom)), await o({
				...t,
				availableWidth: C,
				availableHeight: S
			});
			let w = await i.getDimensions(a.floating);
			return f !== w.width || p !== w.height ? { reset: { rects: !0 } } : {};
		}
	};
};
//#endregion
//#region node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
function bu() {
	return typeof window < "u";
}
function xu(e) {
	return wu(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function Su(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function Cu(e) {
	return ((wu(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function wu(e) {
	return bu() ? e instanceof Node || e instanceof Su(e).Node : !1;
}
function Tu(e) {
	return bu() ? e instanceof Element || e instanceof Su(e).Element : !1;
}
function Eu(e) {
	return bu() ? e instanceof HTMLElement || e instanceof Su(e).HTMLElement : !1;
}
function Du(e) {
	return !bu() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof Su(e).ShadowRoot;
}
function Ou(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = zu(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function ku(e) {
	return /^(table|td|th)$/.test(xu(e));
}
function Au(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var ju = /transform|translate|scale|rotate|perspective|filter/, Mu = /paint|layout|strict|content/, Nu = (e) => !!e && e !== "none", Pu;
function Fu(e) {
	let t = Tu(e) ? zu(e) : e;
	return Nu(t.transform) || Nu(t.translate) || Nu(t.scale) || Nu(t.rotate) || Nu(t.perspective) || !Lu() && (Nu(t.backdropFilter) || Nu(t.filter)) || ju.test(t.willChange || "") || Mu.test(t.contain || "");
}
function Iu(e) {
	let t = Vu(e);
	for (; Eu(t) && !Ru(t);) {
		if (Fu(t)) return t;
		if (Au(t)) return null;
		t = Vu(t);
	}
	return null;
}
function Lu() {
	return Pu ??= typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none"), Pu;
}
function Ru(e) {
	return /^(html|body|#document)$/.test(xu(e));
}
function zu(e) {
	return Su(e).getComputedStyle(e);
}
function Bu(e) {
	return Tu(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function Vu(e) {
	if (xu(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || Du(e) && e.host || Cu(e);
	return Du(t) ? t.host : t;
}
function Hu(e) {
	let t = Vu(e);
	return Ru(t) ? (e.ownerDocument || e).body : Eu(t) && Ou(t) ? t : Hu(t);
}
function Uu(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = Hu(e), i = r === e.ownerDocument?.body, a = Su(r);
	if (i) {
		let e = Wu(a);
		return t.concat(a, a.visualViewport || [], Ou(r) ? r : [], e && n ? Uu(e) : []);
	}
	return t.concat(r, Uu(r, [], n));
}
function Wu(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
//#endregion
//#region node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function Gu(e) {
	let t = zu(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = Eu(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = Pl(n) !== a || Pl(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function Ku(e) {
	return Tu(e) ? e : e.contextElement;
}
function qu(e) {
	let t = Ku(e);
	if (!Eu(t)) return Il(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = Gu(t), o = (a ? Pl(n.width) : n.width) / r, s = (a ? Pl(n.height) : n.height) / i;
	return (!o || !Number.isFinite(o)) && (o = 1), (!s || !Number.isFinite(s)) && (s = 1), {
		x: o,
		y: s
	};
}
var Ju = /*#__PURE__*/ Il(0);
function Yu(e) {
	let t = Su(e);
	return !Lu() || !t.visualViewport ? Ju : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function Xu(e, t, n) {
	return t === void 0 && (t = !1), !!n && t && n === Su(e);
}
function Zu(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = Ku(e), o = Il(1);
	t && (r ? Tu(r) && (o = qu(r)) : o = qu(e));
	let s = Xu(a, n, r) ? Yu(a) : Il(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a && r) {
		let e = Su(a), t = Tu(r) ? Su(r) : r, n = e, i = Wu(n);
		for (; i && t !== n;) {
			let e = qu(i), t = i.getBoundingClientRect(), r = zu(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = Su(i), i = Wu(n);
		}
	}
	return iu({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function Qu(e, t) {
	let n = Bu(e).scrollLeft;
	return t ? t.left + n : Zu(Cu(e)).left + n;
}
function $u(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - Qu(e, n),
		y: n.top + t.scrollTop
	};
}
function ed(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = Cu(r), s = t ? Au(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = Il(1), u = Il(0), d = Eu(r);
	if ((d || !a) && ((xu(r) !== "body" || Ou(o)) && (c = Bu(r)), d)) {
		let e = Zu(r);
		l = qu(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? $u(o, c) : Il(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function td(e) {
	return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function nd(e) {
	let t = Bu(e), n = e.ownerDocument.body, r = Nl(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), i = Nl(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight), a = -t.scrollLeft + Qu(e), o = -t.scrollTop;
	return zu(n).direction === "rtl" && (a += Nl(e.clientWidth, n.clientWidth) - r), {
		width: r,
		height: i,
		x: a,
		y: o
	};
}
var rd = 25;
function id(e, t, n) {
	n === void 0 && (n = "viewport");
	let r = n === "layoutViewport", i = Su(e), a = Cu(e), o = i.visualViewport, s = a.clientWidth, c = a.clientHeight, l = 0, u = 0;
	if (o) {
		let e = !Lu() || t === "fixed";
		r ? e || (l = -o.offsetLeft, u = -o.offsetTop) : (s = o.width, c = o.height, e && (l = o.offsetLeft, u = o.offsetTop));
	}
	if (Qu(a) <= 0) {
		let e = a.ownerDocument, t = e.body, n = getComputedStyle(t), r = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, i = Math.abs(a.clientWidth - t.clientWidth - r), o = getComputedStyle(a).scrollbarGutter === "stable both-edges" ? i / 2 : i;
		o <= rd && (s -= o);
	}
	return {
		width: s,
		height: c,
		x: l,
		y: u
	};
}
function ad(e, t) {
	let n = Zu(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = qu(e);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function od(e, t, n) {
	let r;
	if (t === "viewport" || t === "layoutViewport") r = id(e, n, t);
	else if (t === "document") r = nd(Cu(e));
	else if (Tu(t)) r = ad(t, n);
	else {
		let n = Yu(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return iu(r);
}
function sd(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = Uu(e, [], !1).filter((e) => Tu(e) && xu(e) !== "body"), i = null, a = zu(e).position === "fixed", o = a ? Vu(e) : e;
	for (; Tu(o) && !Ru(o);) {
		let e = zu(o), t = Fu(o), n = i ? i.position : a ? "fixed" : "";
		!t && (n === "fixed" || n === "absolute" && e.position === "static") ? r = r.filter((e) => e !== o) : i = e, o = Vu(o);
	}
	return t.set(e, r), r;
}
function cd(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? Au(t) ? [] : sd(t, this._c) : [].concat(n), r], o = od(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = od(t, a[e], i);
		s = Nl(n.top, s), c = Ml(n.right, c), l = Ml(n.bottom, l), u = Nl(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function ld(e) {
	let { width: t, height: n } = Gu(e);
	return {
		width: t,
		height: n
	};
}
function ud(e, t, n) {
	let r = Eu(t), i = Cu(t), a = n === "fixed", o = Zu(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = Il(0);
	if ((r || !a) && ((xu(t) !== "body" || Ou(i)) && (s = Bu(t)), r)) {
		let e = Zu(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	}
	!r && i && (c.x = Qu(i));
	let l = i && !r && !a ? $u(i, s) : Il(0);
	return {
		x: o.left + s.scrollLeft - c.x - l.x,
		y: o.top + s.scrollTop - c.y - l.y,
		width: o.width,
		height: o.height
	};
}
function dd(e) {
	return zu(e).position === "static";
}
function fd(e, t) {
	if (!Eu(e) || zu(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return Cu(e) === n && (n = n.ownerDocument.body), n;
}
function pd(e, t) {
	let n = Su(e);
	if (Au(e)) return n;
	if (!Eu(e)) {
		let t = Vu(e);
		for (; t && !Ru(t);) {
			if (Tu(t) && !dd(t)) return t;
			t = Vu(t);
		}
		return n;
	}
	let r = fd(e, t);
	for (; r && ku(r) && dd(r);) r = fd(r, t);
	return r && Ru(r) && dd(r) && !Fu(r) ? n : r || Iu(e) || n;
}
var md = async function(e) {
	let t = this.getOffsetParent || pd, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: ud(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function hd(e) {
	return zu(e).direction === "rtl";
}
var gd = {
	convertOffsetParentRelativeRectToViewportRelativeRect: ed,
	getDocumentElement: Cu,
	getClippingRect: cd,
	getOffsetParent: pd,
	getElementRects: md,
	getClientRects: td,
	getDimensions: ld,
	getScale: qu,
	isElement: Tu,
	isRTL: hd
};
function _d(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function vd(e, t, n) {
	let r = null, i, a = Cu(e);
	function o() {
		var e;
		clearTimeout(i), (e = r) == null || e.disconnect(), r = null;
	}
	function s(n, c) {
		n === void 0 && (n = !1), c === void 0 && (c = 1), o();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (n || t(), !f || !p) return;
		let m = Fl(d), h = Fl(a.clientWidth - (u + f)), g = Fl(a.clientHeight - (d + p)), _ = Fl(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: Nl(0, Ml(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (!_d(l, e.getBoundingClientRect())) return s();
			if (n !== c) {
				if (!y) return s();
				n ? s(!1, n) : i = setTimeout(() => {
					s(!1, 1e-7);
				}, 1e3);
			}
			y = !1;
		}
		try {
			r = new IntersectionObserver(b, {
				...v,
				root: a.ownerDocument
			});
		} catch {
			r = new IntersectionObserver(b, v);
		}
		r.observe(e);
	}
	let c = Su(e), l = () => s(n);
	return c.addEventListener("resize", l), s(!0), () => {
		c.removeEventListener("resize", l), o();
	};
}
function yd(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = Ku(e), u = i || a ? [...l ? Uu(l) : [], ...t ? Uu(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n), a && e.addEventListener("resize", n);
	});
	let d = l && s ? vd(l, n, a) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? Zu(e) : null;
	c && g();
	function g() {
		let t = Zu(e);
		h && !_d(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var bd = gu, xd = _u, Sd = uu, Cd = yu, wd = pu, Td = lu, Ed = vu, Dd = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = n ?? {}, a = {
		...gd,
		...i.platform,
		_c: r
	};
	return cu(e, t, {
		...i,
		platform: a
	});
};
//#endregion
//#region node_modules/bits-ui/dist/internal/floating-svelte/floating-utils.svelte.js
function Od(e) {
	return typeof e == "function" ? e() : e;
}
function kd(e) {
	return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Ad(e, t) {
	let n = kd(e);
	return Math.round(t * n) / n;
}
function jd(e) {
	return {
		[`--bits-${e}-content-transform-origin`]: "var(--bits-floating-transform-origin)",
		[`--bits-${e}-content-available-width`]: "var(--bits-floating-available-width)",
		[`--bits-${e}-content-available-height`]: "var(--bits-floating-available-height)",
		[`--bits-${e}-anchor-width`]: "var(--bits-floating-anchor-width)",
		[`--bits-${e}-anchor-height`]: "var(--bits-floating-anchor-height)"
	};
}
//#endregion
//#region node_modules/bits-ui/dist/internal/floating-svelte/use-floating.svelte.js
function Md(e) {
	let t = e.whileElementsMounted, n = /* @__PURE__ */ P(() => Od(e.open) ?? !0), r = /* @__PURE__ */ P(() => Od(e.middleware)), i = /* @__PURE__ */ P(() => Od(e.transform) ?? !0), a = /* @__PURE__ */ P(() => Od(e.placement) ?? "bottom"), o = /* @__PURE__ */ P(() => Od(e.strategy) ?? "absolute"), s = /* @__PURE__ */ P(() => Od(e.sideOffset) ?? 0), c = /* @__PURE__ */ P(() => Od(e.alignOffset) ?? 0), l = e.reference, u = /* @__PURE__ */ I(0), d = /* @__PURE__ */ I(0), f = Vo(null), p = /* @__PURE__ */ I(ln(W(o))), m = /* @__PURE__ */ I(ln(W(a))), h = /* @__PURE__ */ I(ln({})), g = /* @__PURE__ */ I(!1), _ = !1, v = 0, y = /* @__PURE__ */ P(() => {
		let e = f.current ? Ad(f.current, W(u)) : W(u), t = f.current ? Ad(f.current, W(d)) : W(d);
		return W(i) ? {
			position: W(p),
			left: "0",
			top: "0",
			transform: `translate(${e}px, ${t}px)`,
			...f.current && kd(f.current) >= 1.5 && { willChange: "transform" }
		} : {
			position: W(p),
			left: `${e}px`,
			top: `${t}px`
		};
	}), b;
	function x() {
		if (l.current === null || f.current === null) return;
		let e = l.current, t = f.current, i = ++v;
		Dd(e, t, {
			middleware: W(r),
			placement: W(a),
			strategy: W(o)
		}).then((r) => {
			if (i === v && l.current === e && f.current === t) {
				if (Nd(e)) {
					L(h, {
						...W(h),
						hide: {
							...W(h).hide,
							referenceHidden: !0
						}
					}, !0);
					return;
				}
				if (!W(n) && W(u) !== 0 && W(d) !== 0) {
					let e = Math.max(Math.abs(W(s)), Math.abs(W(c)), 15);
					if (r.x <= e && r.y <= e) return;
				}
				L(u, r.x, !0), L(d, r.y, !0), L(p, r.strategy, !0), L(m, r.placement, !0), L(h, r.middlewareData, !0), L(g, !0);
			}
		});
	}
	function S() {
		typeof b == "function" && (b(), b = void 0), v++;
	}
	function C() {
		if (S(), t === void 0) {
			x();
			return;
		}
		W(n) && l.current !== null && f.current !== null && (b = t(l.current, f.current, x));
	}
	function w() {
		!W(n) && f.current === null && L(g, !1);
	}
	function T() {
		return [
			W(r),
			W(a),
			W(o),
			W(s),
			W(c),
			W(n)
		];
	}
	return kn(() => {
		t === void 0 && W(n) && x();
	}), kn(C), kn(() => {
		if (t !== void 0) {
			if (T(), !W(n)) {
				_ = !1;
				return;
			}
			if (!W(g)) {
				_ = !1;
				return;
			}
			if (!_) {
				_ = !0;
				return;
			}
			x();
		}
	}), kn(w), kn(() => S), {
		floating: f,
		reference: l,
		get strategy() {
			return W(p);
		},
		get placement() {
			return W(m);
		},
		get middlewareData() {
			return W(h);
		},
		get isPositioned() {
			return W(g);
		},
		get floatingStyles() {
			return W(y);
		},
		get update() {
			return x;
		}
	};
}
function Nd(e) {
	return e instanceof Element ? !e.isConnected || e instanceof HTMLElement && e.hidden ? !0 : e.getClientRects().length === 0 : !1;
}
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/floating-layer/use-floating-layer.svelte.js
var Pd = {
	top: "bottom",
	right: "left",
	bottom: "top",
	left: "right"
}, Fd = new Ds("Floating.Root"), Id = new Ds("Floating.Content"), Ld = new Ds("Floating.Root"), Rd = class e {
	static create(t = !1) {
		return t ? Ld.set(new e()) : Fd.set(new e());
	}
	anchorNode = Vo(null);
	customAnchorNode = Vo(null);
	triggerNode = Vo(null);
	constructor() {
		kn(() => {
			this.customAnchorNode.current ? typeof this.customAnchorNode.current == "string" ? this.anchorNode.current = document.querySelector(this.customAnchorNode.current) : this.anchorNode.current = this.customAnchorNode.current : this.anchorNode.current = this.triggerNode.current;
		});
	}
}, zd = class e {
	static create(t, n = !1) {
		return n ? Id.set(new e(t, Ld.get())) : Id.set(new e(t, Fd.get()));
	}
	opts;
	root;
	contentRef = Vo(null);
	wrapperRef = Vo(null);
	arrowRef = Vo(null);
	contentAttachment = Zs(this.contentRef);
	wrapperAttachment = Zs(this.wrapperRef);
	arrowAttachment = Zs(this.arrowRef);
	arrowId = Vo(vl());
	#e = /* @__PURE__ */ P(() => {
		if (typeof this.opts.style == "string") return ms(this.opts.style);
		if (!this.opts.style) return {};
	});
	#t = void 0;
	#n = new Ns(() => this.arrowRef.current ?? void 0);
	#r = /* @__PURE__ */ P(() => this.#n?.width ?? 0);
	#i = /* @__PURE__ */ P(() => this.#n?.height ?? 0);
	#a = /* @__PURE__ */ P(() => this.opts.side?.current + (this.opts.align.current === "center" ? "" : `-${this.opts.align.current}`));
	#o = /* @__PURE__ */ P(() => Array.isArray(this.opts.collisionBoundary.current) ? this.opts.collisionBoundary.current : [this.opts.collisionBoundary.current]);
	#s = /* @__PURE__ */ P(() => W(this.#o).length > 0);
	get hasExplicitBoundaries() {
		return W(this.#s);
	}
	set hasExplicitBoundaries(e) {
		L(this.#s, e);
	}
	#c = /* @__PURE__ */ P(() => ({
		padding: this.opts.collisionPadding.current,
		boundary: W(this.#o).filter(lc),
		altBoundary: this.hasExplicitBoundaries
	}));
	get detectOverflowOptions() {
		return W(this.#c);
	}
	set detectOverflowOptions(e) {
		L(this.#c, e);
	}
	#l = /* @__PURE__ */ I(void 0);
	#u = /* @__PURE__ */ I(void 0);
	#d = /* @__PURE__ */ I(void 0);
	#f = /* @__PURE__ */ I(void 0);
	#p = /* @__PURE__ */ P(() => [
		bd({
			mainAxis: this.opts.sideOffset.current + W(this.#i),
			alignmentAxis: this.opts.alignOffset.current
		}),
		this.opts.avoidCollisions.current && xd({
			mainAxis: !0,
			crossAxis: !1,
			limiter: this.opts.sticky.current === "partial" ? Ed() : void 0,
			...this.detectOverflowOptions
		}),
		this.opts.avoidCollisions.current && Sd({ ...this.detectOverflowOptions }),
		Cd({
			...this.detectOverflowOptions,
			apply: ({ rects: e, availableWidth: t, availableHeight: n }) => {
				let { width: r, height: i } = e.reference;
				L(this.#l, t, !0), L(this.#u, n, !0), L(this.#d, r, !0), L(this.#f, i, !0);
			}
		}),
		this.arrowRef.current && Td({
			element: this.arrowRef.current,
			padding: this.opts.arrowPadding.current
		}),
		Bd({
			arrowWidth: W(this.#r),
			arrowHeight: W(this.#i)
		}),
		this.opts.hideWhenDetached.current && wd({
			strategy: "referenceHidden",
			...this.detectOverflowOptions
		})
	].filter(Boolean));
	get middleware() {
		return W(this.#p);
	}
	set middleware(e) {
		L(this.#p, e);
	}
	floating;
	#m = /* @__PURE__ */ P(() => Hd(this.floating.placement));
	get placedSide() {
		return W(this.#m);
	}
	set placedSide(e) {
		L(this.#m, e);
	}
	#h = /* @__PURE__ */ P(() => Ud(this.floating.placement));
	get placedAlign() {
		return W(this.#h);
	}
	set placedAlign(e) {
		L(this.#h, e);
	}
	#g = /* @__PURE__ */ P(() => this.floating.middlewareData.arrow?.x ?? 0);
	get arrowX() {
		return W(this.#g);
	}
	set arrowX(e) {
		L(this.#g, e);
	}
	#_ = /* @__PURE__ */ P(() => this.floating.middlewareData.arrow?.y ?? 0);
	get arrowY() {
		return W(this.#_);
	}
	set arrowY(e) {
		L(this.#_, e);
	}
	#v = /* @__PURE__ */ P(() => this.floating.middlewareData.arrow?.centerOffset !== 0);
	get cannotCenterArrow() {
		return W(this.#v);
	}
	set cannotCenterArrow(e) {
		L(this.#v, e);
	}
	#y = /* @__PURE__ */ I();
	get contentZIndex() {
		return W(this.#y);
	}
	set contentZIndex(e) {
		L(this.#y, e, !0);
	}
	#b = /* @__PURE__ */ P(() => Pd[this.placedSide]);
	get arrowBaseSide() {
		return W(this.#b);
	}
	set arrowBaseSide(e) {
		L(this.#b, e);
	}
	#x = /* @__PURE__ */ P(() => ({
		id: this.opts.wrapperId.current,
		"data-bits-floating-content-wrapper": "",
		style: {
			...this.floating.floatingStyles,
			transform: this.floating.isPositioned ? this.floating.floatingStyles.transform : "translate(0, -200%)",
			minWidth: "max-content",
			zIndex: this.contentZIndex,
			"--bits-floating-transform-origin": `${this.floating.middlewareData.transformOrigin?.x} ${this.floating.middlewareData.transformOrigin?.y}`,
			"--bits-floating-available-width": `${W(this.#l)}px`,
			"--bits-floating-available-height": `${W(this.#u)}px`,
			"--bits-floating-anchor-width": `${W(this.#d)}px`,
			"--bits-floating-anchor-height": `${W(this.#f)}px`,
			...this.floating.middlewareData.hide?.referenceHidden && {
				visibility: "hidden",
				"pointer-events": "none"
			},
			...W(this.#e)
		},
		dir: this.opts.dir.current,
		...this.wrapperAttachment
	}));
	get wrapperProps() {
		return W(this.#x);
	}
	set wrapperProps(e) {
		L(this.#x, e);
	}
	#S = /* @__PURE__ */ P(() => ({
		"data-side": this.placedSide,
		"data-align": this.placedAlign,
		style: ys({ ...W(this.#e) }),
		...this.contentAttachment
	}));
	get props() {
		return W(this.#S);
	}
	set props(e) {
		L(this.#S, e);
	}
	#C = /* @__PURE__ */ P(() => ({
		position: "absolute",
		left: this.arrowX ? `${this.arrowX}px` : void 0,
		top: this.arrowY ? `${this.arrowY}px` : void 0,
		[this.arrowBaseSide]: 0,
		"transform-origin": {
			top: "",
			right: "0 0",
			bottom: "center 0",
			left: "100% 0"
		}[this.placedSide],
		transform: {
			top: "translateY(100%)",
			right: "translateY(50%) rotate(90deg) translateX(-50%)",
			bottom: "rotate(180deg)",
			left: "translateY(50%) rotate(-90deg) translateX(50%)"
		}[this.placedSide],
		visibility: this.cannotCenterArrow ? "hidden" : void 0
	}));
	get arrowStyle() {
		return W(this.#C);
	}
	set arrowStyle(e) {
		L(this.#C, e);
	}
	constructor(e, t) {
		this.opts = e, this.root = t, this.#t = e.updatePositionStrategy, e.customAnchor && (this.root.customAnchorNode.current = e.customAnchor.current), As(() => e.customAnchor.current, (e) => {
			this.root.customAnchorNode.current = e;
		}), this.floating = Md({
			strategy: () => this.opts.strategy.current,
			placement: () => W(this.#a),
			middleware: () => this.middleware,
			reference: this.root.anchorNode,
			whileElementsMounted: (...e) => yd(...e, { animationFrame: this.#t?.current === "always" }),
			open: () => this.opts.enabled.current,
			sideOffset: () => this.opts.sideOffset.current,
			alignOffset: () => this.opts.alignOffset.current
		}), kn(() => {
			this.floating.isPositioned && this.opts.onPlaced?.current();
		}), As(() => this.contentRef.current, (e) => {
			if (!e || !this.opts.enabled.current) return;
			let t = Js(e), n = t.requestAnimationFrame(() => {
				if (this.contentRef.current !== e || !this.opts.enabled.current) return;
				let n = t.getComputedStyle(e).zIndex;
				n !== this.contentZIndex && (this.contentZIndex = n);
			});
			return () => {
				t.cancelAnimationFrame(n);
			};
		}), kn(() => {
			this.floating.floating.current = this.wrapperRef.current;
		});
	}
};
function Bd(e) {
	return {
		name: "transformOrigin",
		options: e,
		fn(t) {
			let { placement: n, rects: r, middlewareData: i } = t, a = i.arrow?.centerOffset !== 0, o = a ? 0 : e.arrowWidth, s = a ? 0 : e.arrowHeight, [c, l] = Vd(n), u = {
				start: "0%",
				center: "50%",
				end: "100%"
			}[l], d = (i.arrow?.x ?? 0) + o / 2, f = (i.arrow?.y ?? 0) + s / 2, p = "", m = "";
			return c === "bottom" ? (p = a ? u : `${d}px`, m = `${-s}px`) : c === "top" ? (p = a ? u : `${d}px`, m = `${r.floating.height + s}px`) : c === "right" ? (p = `${-s}px`, m = a ? u : `${f}px`) : c === "left" && (p = `${r.floating.width + s}px`, m = a ? u : `${f}px`), { data: {
				x: p,
				y: m
			} };
		}
	};
}
function Vd(e) {
	let [t, n = "center"] = e.split("-");
	return [t, n];
}
function Hd(e) {
	return Vd(e)[0];
}
function Ud(e) {
	return Vd(e)[1];
}
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/floating-layer/components/floating-layer.svelte
function Wd(e, t) {
	M(t, !0);
	let n = Q(t, "tooltip", 3, !1);
	Rd.create(n());
	var r = K();
	gi(z(r), () => t.children ?? f), q(e, r), N();
}
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/floating-layer/components/floating-layer-content.svelte
function Gd(e, t) {
	M(t, !0);
	let n = Q(t, "side", 3, "bottom"), r = Q(t, "sideOffset", 3, 0), i = Q(t, "align", 3, "center"), a = Q(t, "alignOffset", 3, 0), o = Q(t, "arrowPadding", 3, 0), s = Q(t, "avoidCollisions", 3, !0), c = Q(t, "collisionBoundary", 19, () => []), l = Q(t, "collisionPadding", 3, 0), u = Q(t, "hideWhenDetached", 3, !1), d = Q(t, "onPlaced", 3, () => {}), p = Q(t, "sticky", 3, "partial"), m = Q(t, "updatePositionStrategy", 3, "optimized"), h = Q(t, "strategy", 3, "fixed"), g = Q(t, "dir", 3, "ltr"), _ = Q(t, "style", 19, () => ({})), v = Q(t, "wrapperId", 19, vl), y = Q(t, "customAnchor", 3, null), b = Q(t, "tooltip", 3, !1), x = zd.create({
		side: $(() => n()),
		sideOffset: $(() => r()),
		align: $(() => i()),
		alignOffset: $(() => a()),
		id: $(() => t.id),
		arrowPadding: $(() => o()),
		avoidCollisions: $(() => s()),
		collisionBoundary: $(() => c()),
		collisionPadding: $(() => l()),
		hideWhenDetached: $(() => u()),
		onPlaced: $(() => d()),
		sticky: $(() => p()),
		updatePositionStrategy: $(() => m()),
		strategy: $(() => h()),
		dir: $(() => g()),
		style: $(() => _()),
		enabled: $(() => t.enabled),
		wrapperId: $(() => v()),
		customAnchor: $(() => y())
	}, b()), S = /* @__PURE__ */ P(() => Ss(x.wrapperProps, { style: { pointerEvents: "auto" } }));
	var C = K();
	gi(z(C), () => t.content ?? f, () => ({
		props: x.props,
		wrapperProps: W(S)
	})), q(e, C), N();
}
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/floating-layer/components/floating-layer-content-static.svelte
function Kd(e, t) {
	M(t, !0), na(() => {
		t.onPlaced?.();
	});
	var n = K();
	gi(z(n), () => t.content ?? f, () => ({
		props: {},
		wrapperProps: {}
	})), q(e, n), N();
}
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/popper-layer/popper-content.svelte
var qd = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"content",
	"isStatic",
	"onPlaced"
]);
function Jd(e, t) {
	let n = Q(t, "isStatic", 3, !1), r = /* @__PURE__ */ X(t, qd);
	var i = K(), a = z(i), o = (e) => {
		Kd(e, {
			get content() {
				return t.content;
			},
			get onPlaced() {
				return t.onPlaced;
			}
		});
	}, s = (e) => {
		Gd(e, Z({
			get content() {
				return t.content;
			},
			get onPlaced() {
				return t.onPlaced;
			}
		}, () => r));
	};
	Y(a, (e) => {
		n() ? e(o) : e(s, -1);
	}), q(e, i);
}
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/popper-layer/popper-layer-inner.svelte
var Yd = /* @__PURE__ */ new Set(/* @__PURE__ */ "$$slots.$$events.$$legacy.popper.onEscapeKeydown.escapeKeydownBehavior.preventOverflowTextSelection.id.onPointerDown.onPointerUp.side.sideOffset.align.alignOffset.arrowPadding.avoidCollisions.collisionBoundary.collisionPadding.sticky.hideWhenDetached.updatePositionStrategy.strategy.dir.preventScroll.wrapperId.style.onPlaced.onInteractOutside.onCloseAutoFocus.onOpenAutoFocus.onFocusOutside.interactOutsideBehavior.loop.trapFocus.isValidEvent.customAnchor.isStatic.enabled.ref.tooltip.contentPointerEvents".split(".")), Xd = /* @__PURE__ */ G("<!> <!>", 1);
function Zd(e, t) {
	M(t, !0);
	let n = Q(t, "interactOutsideBehavior", 3, "close"), r = Q(t, "trapFocus", 3, !0), i = Q(t, "isValidEvent", 3, () => !1), a = Q(t, "customAnchor", 3, null), o = Q(t, "isStatic", 3, !1), s = Q(t, "tooltip", 3, !1), c = Q(t, "contentPointerEvents", 3, "auto"), l = /* @__PURE__ */ X(t, Yd), u = /* @__PURE__ */ P(() => t.preventScroll ?? !0), d = /* @__PURE__ */ P(() => t.strategy ?? (W(u) ? "fixed" : "absolute"));
	Jd(e, {
		get isStatic() {
			return o();
		},
		get id() {
			return t.id;
		},
		get side() {
			return t.side;
		},
		get sideOffset() {
			return t.sideOffset;
		},
		get align() {
			return t.align;
		},
		get alignOffset() {
			return t.alignOffset;
		},
		get arrowPadding() {
			return t.arrowPadding;
		},
		get avoidCollisions() {
			return t.avoidCollisions;
		},
		get collisionBoundary() {
			return t.collisionBoundary;
		},
		get collisionPadding() {
			return t.collisionPadding;
		},
		get sticky() {
			return t.sticky;
		},
		get hideWhenDetached() {
			return t.hideWhenDetached;
		},
		get updatePositionStrategy() {
			return t.updatePositionStrategy;
		},
		get strategy() {
			return W(d);
		},
		get dir() {
			return t.dir;
		},
		get wrapperId() {
			return t.wrapperId;
		},
		get style() {
			return t.style;
		},
		get onPlaced() {
			return t.onPlaced;
		},
		get customAnchor() {
			return a();
		},
		get enabled() {
			return t.enabled;
		},
		get tooltip() {
			return s();
		},
		content: (e, a) => {
			let o = () => (a?.()).props, s = () => (a?.()).wrapperProps;
			var d = Xd(), p = z(d), m = (e) => {
				Al(e, { get preventScroll() {
					return W(u);
				} });
			}, h = (e) => {
				Al(e, { get preventScroll() {
					return W(u);
				} });
			};
			Y(p, (e) => {
				t.forceMount && t.enabled ? e(m) : t.forceMount || e(h, 1);
			}), ul(B(p, 2), {
				get onOpenAutoFocus() {
					return t.onOpenAutoFocus;
				},
				get onCloseAutoFocus() {
					return t.onCloseAutoFocus;
				},
				get loop() {
					return t.loop;
				},
				get enabled() {
					return t.enabled;
				},
				get trapFocus() {
					return r();
				},
				get forceMount() {
					return t.forceMount;
				},
				get ref() {
					return t.ref;
				},
				focusScope: (e, r) => {
					let a = () => (r?.()).props;
					sl(e, {
						get onEscapeKeydown() {
							return t.onEscapeKeydown;
						},
						get escapeKeydownBehavior() {
							return t.escapeKeydownBehavior;
						},
						get enabled() {
							return t.enabled;
						},
						get ref() {
							return t.ref;
						},
						children: (e, r) => {
							il(e, {
								get id() {
									return t.id;
								},
								get onInteractOutside() {
									return t.onInteractOutside;
								},
								get onFocusOutside() {
									return t.onFocusOutside;
								},
								get interactOutsideBehavior() {
									return n();
								},
								get isValidEvent() {
									return i();
								},
								get enabled() {
									return t.enabled;
								},
								get ref() {
									return t.ref;
								},
								children: (e, n) => {
									let r = () => (n?.()).props;
									_l(e, {
										get id() {
											return t.id;
										},
										get preventOverflowTextSelection() {
											return t.preventOverflowTextSelection;
										},
										get onPointerDown() {
											return t.onPointerDown;
										},
										get onPointerUp() {
											return t.onPointerUp;
										},
										get enabled() {
											return t.enabled;
										},
										get ref() {
											return t.ref;
										},
										children: (e, n) => {
											var i = K(), u = z(i);
											{
												let e = /* @__PURE__ */ P(() => ({
													props: Ss(l, o(), r(), a(), { style: { pointerEvents: c() } }),
													wrapperProps: s()
												}));
												gi(u, () => t.popper ?? f, () => W(e));
											}
											q(e, i);
										},
										$$slots: { default: !0 }
									});
								},
								$$slots: { default: !0 }
							});
						},
						$$slots: { default: !0 }
					});
				},
				$$slots: { focusScope: !0 }
			}), q(e, d);
		},
		$$slots: { content: !0 }
	}), N();
}
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/popper-layer/popper-layer.svelte
var Qd = /* @__PURE__ */ new Set(/* @__PURE__ */ "$$slots.$$events.$$legacy.popper.open.onEscapeKeydown.escapeKeydownBehavior.preventOverflowTextSelection.id.onPointerDown.onPointerUp.side.sideOffset.align.alignOffset.arrowPadding.avoidCollisions.collisionBoundary.collisionPadding.sticky.hideWhenDetached.updatePositionStrategy.strategy.dir.preventScroll.wrapperId.style.onPlaced.onInteractOutside.onCloseAutoFocus.onOpenAutoFocus.onFocusOutside.interactOutsideBehavior.loop.trapFocus.isValidEvent.customAnchor.isStatic.ref.shouldRender".split("."));
function $d(e, t) {
	let n = Q(t, "interactOutsideBehavior", 3, "close"), r = Q(t, "trapFocus", 3, !0), i = Q(t, "isValidEvent", 3, () => !1), a = Q(t, "customAnchor", 3, null), o = Q(t, "isStatic", 3, !1), s = /* @__PURE__ */ X(t, Qd);
	var c = K(), l = z(c), u = (e) => {
		Zd(e, Z({
			get popper() {
				return t.popper;
			},
			get onEscapeKeydown() {
				return t.onEscapeKeydown;
			},
			get escapeKeydownBehavior() {
				return t.escapeKeydownBehavior;
			},
			get preventOverflowTextSelection() {
				return t.preventOverflowTextSelection;
			},
			get id() {
				return t.id;
			},
			get onPointerDown() {
				return t.onPointerDown;
			},
			get onPointerUp() {
				return t.onPointerUp;
			},
			get side() {
				return t.side;
			},
			get sideOffset() {
				return t.sideOffset;
			},
			get align() {
				return t.align;
			},
			get alignOffset() {
				return t.alignOffset;
			},
			get arrowPadding() {
				return t.arrowPadding;
			},
			get avoidCollisions() {
				return t.avoidCollisions;
			},
			get collisionBoundary() {
				return t.collisionBoundary;
			},
			get collisionPadding() {
				return t.collisionPadding;
			},
			get sticky() {
				return t.sticky;
			},
			get hideWhenDetached() {
				return t.hideWhenDetached;
			},
			get updatePositionStrategy() {
				return t.updatePositionStrategy;
			},
			get strategy() {
				return t.strategy;
			},
			get dir() {
				return t.dir;
			},
			get preventScroll() {
				return t.preventScroll;
			},
			get wrapperId() {
				return t.wrapperId;
			},
			get style() {
				return t.style;
			},
			get onPlaced() {
				return t.onPlaced;
			},
			get customAnchor() {
				return a();
			},
			get isStatic() {
				return o();
			},
			get enabled() {
				return t.open;
			},
			get onInteractOutside() {
				return t.onInteractOutside;
			},
			get onCloseAutoFocus() {
				return t.onCloseAutoFocus;
			},
			get onOpenAutoFocus() {
				return t.onOpenAutoFocus;
			},
			get interactOutsideBehavior() {
				return n();
			},
			get loop() {
				return t.loop;
			},
			get trapFocus() {
				return r();
			},
			get isValidEvent() {
				return i();
			},
			get onFocusOutside() {
				return t.onFocusOutside;
			},
			forceMount: !1,
			get ref() {
				return t.ref;
			}
		}, () => s));
	};
	Y(l, (e) => {
		t.shouldRender && e(u);
	}), q(e, c);
}
//#endregion
//#region node_modules/bits-ui/dist/bits/utilities/popper-layer/popper-layer-force-mount.svelte
var ef = /* @__PURE__ */ new Set(/* @__PURE__ */ "$$slots.$$events.$$legacy.popper.onEscapeKeydown.escapeKeydownBehavior.preventOverflowTextSelection.id.onPointerDown.onPointerUp.side.sideOffset.align.alignOffset.arrowPadding.avoidCollisions.collisionBoundary.collisionPadding.sticky.hideWhenDetached.updatePositionStrategy.strategy.dir.preventScroll.wrapperId.style.onPlaced.onInteractOutside.onCloseAutoFocus.onOpenAutoFocus.onFocusOutside.interactOutsideBehavior.loop.trapFocus.isValidEvent.customAnchor.isStatic.enabled".split("."));
function tf(e, t) {
	let n = Q(t, "interactOutsideBehavior", 3, "close"), r = Q(t, "trapFocus", 3, !0), i = Q(t, "isValidEvent", 3, () => !1), a = Q(t, "customAnchor", 3, null), o = Q(t, "isStatic", 3, !1), s = /* @__PURE__ */ X(t, ef);
	Zd(e, Z({
		get popper() {
			return t.popper;
		},
		get onEscapeKeydown() {
			return t.onEscapeKeydown;
		},
		get escapeKeydownBehavior() {
			return t.escapeKeydownBehavior;
		},
		get preventOverflowTextSelection() {
			return t.preventOverflowTextSelection;
		},
		get id() {
			return t.id;
		},
		get onPointerDown() {
			return t.onPointerDown;
		},
		get onPointerUp() {
			return t.onPointerUp;
		},
		get side() {
			return t.side;
		},
		get sideOffset() {
			return t.sideOffset;
		},
		get align() {
			return t.align;
		},
		get alignOffset() {
			return t.alignOffset;
		},
		get arrowPadding() {
			return t.arrowPadding;
		},
		get avoidCollisions() {
			return t.avoidCollisions;
		},
		get collisionBoundary() {
			return t.collisionBoundary;
		},
		get collisionPadding() {
			return t.collisionPadding;
		},
		get sticky() {
			return t.sticky;
		},
		get hideWhenDetached() {
			return t.hideWhenDetached;
		},
		get updatePositionStrategy() {
			return t.updatePositionStrategy;
		},
		get strategy() {
			return t.strategy;
		},
		get dir() {
			return t.dir;
		},
		get preventScroll() {
			return t.preventScroll;
		},
		get wrapperId() {
			return t.wrapperId;
		},
		get style() {
			return t.style;
		},
		get onPlaced() {
			return t.onPlaced;
		},
		get customAnchor() {
			return a();
		},
		get isStatic() {
			return o();
		},
		get enabled() {
			return t.enabled;
		},
		get onInteractOutside() {
			return t.onInteractOutside;
		},
		get onCloseAutoFocus() {
			return t.onCloseAutoFocus;
		},
		get onOpenAutoFocus() {
			return t.onOpenAutoFocus;
		},
		get interactOutsideBehavior() {
			return n();
		},
		get loop() {
			return t.loop;
		},
		get trapFocus() {
			return r();
		},
		get isValidEvent() {
			return i();
		},
		get onFocusOutside() {
			return t.onFocusOutside;
		}
	}, () => s, { forceMount: !0 }));
}
//#endregion
//#region node_modules/bits-ui/dist/internal/safe-polygon.svelte.js
function nf(e, t) {
	let [n, r] = e, i = !1, a = t.length;
	for (let e = 0, o = a - 1; e < a; o = e++) {
		let [a, s] = t[e] ?? [0, 0], [c, l] = t[o] ?? [0, 0];
		s >= r != l >= r && n <= (c - a) * (r - s) / (l - s) + a && (i = !i);
	}
	return i;
}
function rf(e, t) {
	return e[0] >= t.left && e[0] <= t.right && e[1] >= t.top && e[1] <= t.bottom;
}
function af(e, t) {
	let n = e.left + e.width / 2, r = e.top + e.height / 2, i = t.left + t.width / 2, a = t.top + t.height / 2, o = i - n, s = a - r;
	return Math.abs(o) > Math.abs(s) ? o > 0 ? "right" : "left" : s > 0 ? "bottom" : "top";
}
var of = class {
	#e;
	#t;
	#n;
	#r = null;
	#i = null;
	#a = [];
	#o = null;
	#s = null;
	#c = null;
	#l() {
		this.#s !== null && (cancelAnimationFrame(this.#s), this.#s = null);
	}
	#u() {
		this.#l(), this.#s = requestAnimationFrame(() => {
			this.#s = null, !(!this.#r || !this.#i) && (this.#m(), this.#e.onPointerExit());
		});
	}
	#d() {
		this.#c !== null && (clearTimeout(this.#c), this.#c = null);
	}
	#f() {
		this.#n !== null && (this.#d(), this.#c = window.setTimeout(() => {
			this.#c = null, !(!this.#r || !this.#i) && (this.#m(), this.#e.onPointerExit());
		}, this.#n));
	}
	constructor(e) {
		this.#e = e, this.#t = e.buffer ?? 1;
		let t = e.transitIntentTimeout;
		this.#n = typeof t == "number" && t > 0 ? t : null, As([
			e.triggerNode,
			e.contentNode,
			e.enabled
		], ([e, t, n]) => {
			if (!e || !t || !n) {
				this.#o = null, this.#m();
				return;
			}
			return this.#o && this.#o !== e && this.#m(), this.#o = e, [
				Br(qs(e), "pointermove", (n) => {
					this.#p([n.clientX, n.clientY], e, t);
				}),
				Br(e, "pointerleave", (e) => {
					let n = e.relatedTarget;
					if (oc(n) && t.contains(n)) return;
					let r = this.#e.ignoredTargets?.() ?? [];
					oc(n) && r.some((e) => e === n || e.contains(n)) || (this.#a = oc(n) && r.length > 0 ? r.filter((e) => n.contains(e)) : [], this.#r = [e.clientX, e.clientY], this.#i = "content", this.#u());
				}),
				Br(e, "pointerenter", () => {
					this.#m();
				}),
				Br(t, "pointerenter", () => {
					this.#m();
				}),
				Br(t, "pointerleave", (t) => {
					let n = t.relatedTarget;
					oc(n) && e.contains(n) || (this.#r = [t.clientX, t.clientY], this.#i = "trigger", this.#u());
				})
			].reduce((e, t) => () => {
				e(), t();
			}, () => {});
		});
	}
	#p(e, t, n) {
		if (!this.#r || !this.#i) return;
		this.#l(), this.#f();
		let r = t.getBoundingClientRect(), i = n.getBoundingClientRect();
		if (this.#i === "content" && rf(e, i)) {
			this.#m();
			return;
		}
		if (this.#i === "trigger" && rf(e, r)) {
			this.#m();
			return;
		}
		if (this.#i === "content" && this.#a.length > 0) for (let t of this.#a) {
			let n = t.getBoundingClientRect();
			if (rf(e, n)) return;
			let i = af(r, n), a = this.#h(r, n, i);
			if (a && nf(e, a)) return;
		}
		let a = af(r, i), o = this.#h(r, i, a);
		if (o && nf(e, o)) return;
		let s = this.#i === "content" ? i : r;
		nf(e, this.#g(this.#r, s, a, this.#i)) || (this.#m(), this.#e.onPointerExit());
	}
	#m() {
		this.#r = null, this.#i = null, this.#a = [], this.#l(), this.#d();
	}
	#h(e, t, n) {
		let r = this.#t;
		switch (n) {
			case "top": return [
				[Math.min(e.left, t.left) - r, e.top],
				[Math.min(e.left, t.left) - r, t.bottom],
				[Math.max(e.right, t.right) + r, t.bottom],
				[Math.max(e.right, t.right) + r, e.top]
			];
			case "bottom": return [
				[Math.min(e.left, t.left) - r, e.bottom],
				[Math.min(e.left, t.left) - r, t.top],
				[Math.max(e.right, t.right) + r, t.top],
				[Math.max(e.right, t.right) + r, e.bottom]
			];
			case "left": return [
				[e.left, Math.min(e.top, t.top) - r],
				[t.right, Math.min(e.top, t.top) - r],
				[t.right, Math.max(e.bottom, t.bottom) + r],
				[e.left, Math.max(e.bottom, t.bottom) + r]
			];
			case "right": return [
				[e.right, Math.min(e.top, t.top) - r],
				[t.left, Math.min(e.top, t.top) - r],
				[t.left, Math.max(e.bottom, t.bottom) + r],
				[e.right, Math.max(e.bottom, t.bottom) + r]
			];
		}
	}
	#g(e, t, n, r) {
		let i = this.#t * 4, [a, o] = e;
		switch (r === "trigger" ? this.#_(n) : n) {
			case "top": return [
				[a - i, o + i],
				[a + i, o + i],
				[t.right + i, t.bottom],
				[t.right + i, t.top],
				[t.left - i, t.top],
				[t.left - i, t.bottom]
			];
			case "bottom": return [
				[a - i, o - i],
				[a + i, o - i],
				[t.right + i, t.top],
				[t.right + i, t.bottom],
				[t.left - i, t.bottom],
				[t.left - i, t.top]
			];
			case "left": return [
				[a + i, o - i],
				[a + i, o + i],
				[t.right, t.bottom + i],
				[t.left, t.bottom + i],
				[t.left, t.top - i],
				[t.right, t.top - i]
			];
			case "right": return [
				[a - i, o - i],
				[a - i, o + i],
				[t.left, t.bottom + i],
				[t.right, t.bottom + i],
				[t.right, t.top - i],
				[t.left, t.top - i]
			];
		}
	}
	#_(e) {
		switch (e) {
			case "top": return "bottom";
			case "bottom": return "top";
			case "left": return "right";
			case "right": return "left";
		}
	}
}, sf = class {
	#e;
	#t;
	#n = null;
	constructor(e, t) {
		this.#t = e, this.#e = t, this.stop = this.stop.bind(this), this.start = this.start.bind(this), Ps(this.stop);
	}
	#r() {
		this.#n !== null && (window.clearTimeout(this.#n), this.#n = null);
	}
	stop() {
		this.#r();
	}
	start(...e) {
		this.#r(), this.#n = window.setTimeout(() => {
			this.#n = null, this.#t(...e);
		}, this.#e);
	}
}, cf = tc({
	component: "tooltip",
	parts: ["content", "trigger"]
}), lf = new Ds("Tooltip.Provider"), uf = new Ds("Tooltip.Root"), df = class {
	#e = /* @__PURE__ */ I(ln(/* @__PURE__ */ new Map()));
	get triggers() {
		return W(this.#e);
	}
	set triggers(e) {
		L(this.#e, e, !0);
	}
	#t = /* @__PURE__ */ I(null);
	get activeTriggerId() {
		return W(this.#t);
	}
	set activeTriggerId(e) {
		L(this.#t, e, !0);
	}
	#n = /* @__PURE__ */ P(() => {
		let e = this.activeTriggerId;
		return e === null ? null : this.triggers.get(e)?.node ?? null;
	});
	get activeTriggerNode() {
		return W(this.#n);
	}
	set activeTriggerNode(e) {
		L(this.#n, e);
	}
	#r = /* @__PURE__ */ P(() => {
		let e = this.activeTriggerId;
		return e === null ? null : this.triggers.get(e)?.payload ?? null;
	});
	get activePayload() {
		return W(this.#r);
	}
	set activePayload(e) {
		L(this.#r, e);
	}
	register = (e) => {
		let t = new Map(this.triggers);
		t.set(e.id, e), this.triggers = t, this.#i();
	};
	update = (e) => {
		let t = new Map(this.triggers);
		t.set(e.id, e), this.triggers = t, this.#i();
	};
	unregister = (e) => {
		if (!this.triggers.has(e)) return;
		let t = new Map(this.triggers);
		t.delete(e), this.triggers = t, this.activeTriggerId === e && (this.activeTriggerId = null);
	};
	setActiveTrigger = (e) => {
		if (e === null) {
			this.activeTriggerId = null;
			return;
		}
		if (!this.triggers.has(e)) {
			this.activeTriggerId = null;
			return;
		}
		this.activeTriggerId = e;
	};
	get = (e) => this.triggers.get(e);
	has = (e) => this.triggers.has(e);
	getFirstTriggerId = () => {
		let e = this.triggers.entries().next();
		return e.done ? null : e.value[0];
	};
	#i = () => {
		let e = this.activeTriggerId;
		e !== null && (this.triggers.has(e) || (this.activeTriggerId = null));
	};
}, ff = class e {
	static create(t) {
		return lf.set(new e(t));
	}
	opts;
	#e = /* @__PURE__ */ I(!0);
	get isOpenDelayed() {
		return W(this.#e);
	}
	set isOpenDelayed(e) {
		L(this.#e, e, !0);
	}
	isPointerInTransit = Vo(!1);
	#t;
	#n = /* @__PURE__ */ I(null);
	constructor(e) {
		this.opts = e, this.#t = new sf(() => {
			this.isOpenDelayed = !0;
		}, this.opts.skipDelayDuration.current), Fs(() => Br(window, "scroll", (e) => {
			let t = W(this.#n);
			if (!t) return;
			let n = t.triggerNode;
			if (!n) return;
			let r = e.target;
			(r instanceof Element || r instanceof Document) && r.contains(n) && t.handleClose();
		}));
	}
	#r = () => {
		if (this.opts.skipDelayDuration.current === 0) {
			this.isOpenDelayed = !0;
			return;
		}
		this.#t.start();
	};
	#i = () => {
		this.#t.stop();
	};
	onOpen = (e) => {
		W(this.#n) && W(this.#n) !== e && W(this.#n).handleClose(), this.#i(), this.isOpenDelayed = !1, L(this.#n, e, !0);
	};
	onClose = (e) => {
		W(this.#n) === e && (L(this.#n, null), this.#r());
	};
	isTooltipOpen = (e) => W(this.#n) === e;
}, pf = class e {
	static create(t) {
		return uf.set(new e(t, lf.get()));
	}
	opts;
	provider;
	#e = /* @__PURE__ */ P(() => this.opts.delayDuration.current ?? this.provider.opts.delayDuration.current);
	get delayDuration() {
		return W(this.#e);
	}
	set delayDuration(e) {
		L(this.#e, e);
	}
	#t = /* @__PURE__ */ P(() => this.opts.disableHoverableContent.current ?? this.provider.opts.disableHoverableContent.current);
	get disableHoverableContent() {
		return W(this.#t);
	}
	set disableHoverableContent(e) {
		L(this.#t, e);
	}
	#n = /* @__PURE__ */ P(() => this.opts.disableCloseOnTriggerClick.current ?? this.provider.opts.disableCloseOnTriggerClick.current);
	get disableCloseOnTriggerClick() {
		return W(this.#n);
	}
	set disableCloseOnTriggerClick(e) {
		L(this.#n, e);
	}
	#r = /* @__PURE__ */ P(() => this.opts.disabled.current ?? this.provider.opts.disabled.current);
	get disabled() {
		return W(this.#r);
	}
	set disabled(e) {
		L(this.#r, e);
	}
	#i = /* @__PURE__ */ P(() => this.opts.ignoreNonKeyboardFocus.current ?? this.provider.opts.ignoreNonKeyboardFocus.current);
	get ignoreNonKeyboardFocus() {
		return W(this.#i);
	}
	set ignoreNonKeyboardFocus(e) {
		L(this.#i, e);
	}
	registry;
	tether;
	#a = /* @__PURE__ */ I(null);
	get contentNode() {
		return W(this.#a);
	}
	set contentNode(e) {
		L(this.#a, e, !0);
	}
	contentPresence;
	#o = /* @__PURE__ */ I(!1);
	#s;
	#c = /* @__PURE__ */ P(() => this.opts.open.current ? W(this.#o) ? "delayed-open" : "instant-open" : "closed");
	get stateAttr() {
		return W(this.#c);
	}
	set stateAttr(e) {
		L(this.#c, e);
	}
	constructor(e, t) {
		this.opts = e, this.provider = t, this.tether = e.tether.current?.state ?? null, this.registry = this.tether?.registry ?? new df(), this.#s = new sf(() => {
			L(this.#o, !0), this.opts.open.current = !0;
		}, this.delayDuration ?? 0), this.tether && (this.tether.root = this, Fs(() => () => {
			this.tether?.root === this && (this.tether.root = null);
		})), this.contentPresence = new dc({
			open: this.opts.open,
			ref: $(() => this.contentNode),
			onComplete: () => {
				this.opts.onOpenChangeComplete.current(this.opts.open.current);
			}
		}), As(() => this.delayDuration, () => {
			this.delayDuration !== void 0 && (this.#s = new sf(() => {
				L(this.#o, !0), this.opts.open.current = !0;
			}, this.delayDuration));
		}), As(() => this.opts.open.current, (e) => {
			e ? (this.ensureActiveTrigger(), this.provider.onOpen(this)) : this.provider.onClose(this);
		}, { lazy: !0 }), As(() => this.opts.triggerId.current, (e) => {
			e !== this.registry.activeTriggerId && this.registry.setActiveTrigger(e);
		}), As(() => this.registry.activeTriggerId, (e) => {
			this.opts.triggerId.current !== e && (this.opts.triggerId.current = e);
		});
	}
	handleOpen = () => {
		this.#s.stop(), L(this.#o, !1), this.ensureActiveTrigger(), this.opts.open.current = !0;
	};
	handleClose = () => {
		this.#s.stop(), this.opts.open.current = !1;
	};
	#l = () => {
		this.#s.stop();
		let e = !this.provider.isOpenDelayed, t = this.delayDuration ?? 0;
		e || t === 0 ? (L(this.#o, !1), this.opts.open.current = !0) : this.#s.start();
	};
	onTriggerEnter = (e) => {
		this.setActiveTrigger(e), this.#l();
	};
	onTriggerLeave = () => {
		this.disableHoverableContent ? this.handleClose() : this.#s.stop();
	};
	ensureActiveTrigger = () => {
		if (this.registry.activeTriggerId !== null && this.registry.has(this.registry.activeTriggerId)) return;
		if (this.opts.triggerId.current !== null && this.registry.has(this.opts.triggerId.current)) {
			this.registry.setActiveTrigger(this.opts.triggerId.current);
			return;
		}
		let e = this.registry.getFirstTriggerId();
		this.registry.setActiveTrigger(e);
	};
	setActiveTrigger = (e) => {
		this.registry.setActiveTrigger(e);
	};
	registerTrigger = (e) => {
		this.registry.register(e), e.disabled && this.registry.activeTriggerId === e.id && this.opts.open.current && this.handleClose();
	};
	updateTrigger = (e) => {
		this.registry.update(e), e.disabled && this.registry.activeTriggerId === e.id && this.opts.open.current && this.handleClose();
	};
	unregisterTrigger = (e) => {
		let t = this.registry.activeTriggerId === e;
		this.registry.unregister(e), t && this.opts.open.current && this.handleClose();
	};
	isActiveTrigger = (e) => this.registry.activeTriggerId === e;
	get triggerNode() {
		return this.registry.activeTriggerNode;
	}
	get activePayload() {
		return this.registry.activePayload;
	}
	get activeTriggerId() {
		return this.registry.activeTriggerId;
	}
}, mf = class e {
	static create(t) {
		return t.tether.current ? new e(t, null, t.tether.current.state) : new e(t, uf.get(), null);
	}
	opts;
	root;
	tether;
	attachment;
	#e = Vo(!1);
	#t = /* @__PURE__ */ I(!1);
	domContext;
	#n = null;
	#r = !1;
	#i = null;
	constructor(e, t, n) {
		this.opts = e, this.root = t, this.tether = n, this.domContext = new Xs(e.ref), this.attachment = Zs(this.opts.ref, (e) => this.#s(e)), As(() => this.opts.id.current, () => {
			this.#s(this.opts.ref.current);
		}), As(() => this.opts.payload.current, () => {
			this.#s(this.opts.ref.current);
		}), As(() => this.opts.disabled.current, () => {
			this.#s(this.opts.ref.current);
		}), Fs(() => (this.#r = !0, this.#s(this.opts.ref.current), () => {
			let e = this.#a(), t = this.#i;
			t && (this.tether ? this.tether.registry.unregister(t) : e?.unregisterTrigger(t)), this.#i = null, this.#r = !1;
		}));
	}
	#a = () => this.tether?.root ?? this.root;
	#o = () => {
		let e = this.#a();
		return this.opts.disabled.current || !!e?.disabled;
	};
	#s = (e) => {
		if (!this.#r) return;
		let t = this.opts.id.current, n = this.opts.payload.current, r = this.opts.disabled.current;
		if (this.#i && this.#i !== t) {
			let e = this.#a();
			this.tether ? this.tether.registry.unregister(this.#i) : e?.unregisterTrigger(this.#i);
		}
		let i = {
			id: t,
			node: e,
			payload: n,
			disabled: r
		}, a = this.#a();
		this.tether ? (this.tether.registry.has(t) ? this.tether.registry.update(i) : this.tether.registry.register(i), r && this.tether.registry.activeTriggerId === t && a?.opts.open.current && a.handleClose()) : a?.registry.has(t) ? a.updateTrigger(i) : a?.registerTrigger(i), this.#i = t;
	};
	#c = () => {
		this.#n !== null && (clearTimeout(this.#n), this.#n = null);
	};
	handlePointerUp = () => {
		this.#e.current = !1;
	};
	#l = () => {
		this.#o() || (this.#e.current = !1);
	};
	#u = () => {
		this.#o() || (this.#e.current = !0, this.domContext.getDocument().addEventListener("pointerup", () => {
			this.handlePointerUp();
		}, { once: !0 }));
	};
	#d = (e) => {
		let t = this.#a();
		if (t) {
			if (this.#o()) {
				t.opts.open.current && t.handleClose();
				return;
			}
			if (e.pointerType !== "touch") {
				if (t.provider.isPointerInTransit.current) {
					this.#c(), this.#n = window.setTimeout(() => {
						t.provider.isPointerInTransit.current && (t.provider.isPointerInTransit.current = !1, t.onTriggerEnter(this.opts.id.current), L(this.#t, !0));
					}, 250);
					return;
				}
				t.onTriggerEnter(this.opts.id.current), L(this.#t, !0);
			}
		}
	};
	#f = (e) => {
		let t = this.#a();
		if (t) {
			if (this.#o()) {
				t.opts.open.current && t.handleClose();
				return;
			}
			e.pointerType !== "touch" && (W(this.#t) || (this.#c(), t.provider.isPointerInTransit.current = !1, t.onTriggerEnter(this.opts.id.current), L(this.#t, !0)));
		}
	};
	#p = (e) => {
		let t = this.#a();
		if (!t || this.#o()) return;
		if (this.#c(), !t.isActiveTrigger(this.opts.id.current)) {
			L(this.#t, !1);
			return;
		}
		let n = e.relatedTarget;
		if (oc(n)) {
			for (let e of t.registry.triggers.values()) if (e.node === n) {
				if (t.provider.opts.skipDelayDuration.current > 0) {
					L(this.#t, !1);
					return;
				}
				t.handleClose(), L(this.#t, !1);
				return;
			}
		}
		t.onTriggerLeave(), L(this.#t, !1);
	};
	#m = (e) => {
		let t = this.#a();
		if (t && !this.#e.current) {
			if (this.#o()) {
				t.opts.open.current && t.handleClose();
				return;
			}
			t.ignoreNonKeyboardFocus && !cc(e.currentTarget) || (t.setActiveTrigger(this.opts.id.current), t.handleOpen());
		}
	};
	#h = () => {
		let e = this.#a();
		!e || this.#o() || e.handleClose();
	};
	#g = () => {
		let e = this.#a();
		!e || e.disableCloseOnTriggerClick || this.#o() || e.handleClose();
	};
	#_ = /* @__PURE__ */ P(() => {
		let e = this.#a(), t = !!(e?.opts.open.current && e.isActiveTrigger(this.opts.id.current)), n = this.#o();
		return {
			id: this.opts.id.current,
			"aria-describedby": t ? e?.contentNode?.id : void 0,
			"data-state": t ? e?.stateAttr : "closed",
			"data-disabled": Qs(n),
			"data-delay-duration": `${e?.delayDuration ?? 0}`,
			[cf.trigger]: "",
			tabindex: n ? void 0 : this.opts.tabindex.current,
			disabled: this.opts.disabled.current,
			onpointerup: this.#l,
			onpointerdown: this.#u,
			onpointerenter: this.#d,
			onpointermove: this.#f,
			onpointerleave: this.#p,
			onfocus: this.#m,
			onblur: this.#h,
			onclick: this.#g,
			...this.attachment
		};
	});
	get props() {
		return W(this.#_);
	}
	set props(e) {
		L(this.#_, e);
	}
}, hf = class e {
	static create(t) {
		return new e(t, uf.get());
	}
	opts;
	root;
	attachment;
	constructor(e, t) {
		this.opts = e, this.root = t, this.attachment = Zs(this.opts.ref, (e) => this.root.contentNode = e), new of({
			triggerNode: () => this.root.triggerNode,
			contentNode: () => this.root.contentNode,
			enabled: () => this.root.opts.open.current && !this.root.disableHoverableContent,
			transitIntentTimeout: 180,
			ignoredTargets: () => {
				if (this.root.provider.opts.skipDelayDuration.current === 0) return [];
				let e = [], t = this.root.triggerNode;
				for (let n of this.root.registry.triggers.values()) n.node && n.node !== t && e.push(n.node);
				return e;
			},
			onPointerExit: () => {
				this.root.provider.isTooltipOpen(this.root) && this.root.handleClose();
			}
		});
	}
	onInteractOutside = (e) => {
		if (oc(e.target) && this.root.triggerNode?.contains(e.target) && this.root.disableCloseOnTriggerClick) {
			e.preventDefault();
			return;
		}
		this.opts.onInteractOutside.current(e), !e.defaultPrevented && this.root.handleClose();
	};
	onEscapeKeydown = (e) => {
		this.opts.onEscapeKeydown.current?.(e), !e.defaultPrevented && this.root.handleClose();
	};
	onOpenAutoFocus = (e) => {
		e.preventDefault();
	};
	onCloseAutoFocus = (e) => {
		e.preventDefault();
	};
	get shouldRender() {
		return this.root.contentPresence.shouldRender;
	}
	#e = /* @__PURE__ */ P(() => ({ open: this.root.opts.open.current }));
	get snippetProps() {
		return W(this.#e);
	}
	set snippetProps(e) {
		L(this.#e, e);
	}
	#t = /* @__PURE__ */ P(() => ({
		id: this.opts.id.current,
		"data-state": this.root.stateAttr,
		"data-disabled": Qs(this.root.disabled),
		...$s(this.root.contentPresence.transitionStatus),
		style: { outline: "none" },
		[cf.content]: "",
		...this.attachment
	}));
	get props() {
		return W(this.#t);
	}
	set props(e) {
		L(this.#t, e);
	}
	popperProps = {
		onInteractOutside: this.onInteractOutside,
		onEscapeKeydown: this.onEscapeKeydown,
		onOpenAutoFocus: this.onOpenAutoFocus,
		onCloseAutoFocus: this.onCloseAutoFocus
	};
};
//#endregion
//#region node_modules/bits-ui/dist/bits/tooltip/components/tooltip.svelte
function gf(e, t) {
	M(t, !0);
	let n = Q(t, "open", 15, !1), r = Q(t, "triggerId", 15, null), i = Q(t, "onOpenChange", 3, fc), a = Q(t, "onOpenChangeComplete", 3, fc), o = pf.create({
		open: $(() => n(), (e) => {
			n(e), i()(e);
		}),
		triggerId: $(() => r(), (e) => {
			r(e);
		}),
		delayDuration: $(() => t.delayDuration),
		disableCloseOnTriggerClick: $(() => t.disableCloseOnTriggerClick),
		disableHoverableContent: $(() => t.disableHoverableContent),
		ignoreNonKeyboardFocus: $(() => t.ignoreNonKeyboardFocus),
		disabled: $(() => t.disabled),
		onOpenChangeComplete: $(() => a()),
		tether: $(() => t.tether)
	});
	Wd(e, {
		tooltip: !0,
		children: (e, n) => {
			var r = K();
			gi(z(r), () => t.children ?? f, () => ({
				open: o.opts.open.current,
				triggerId: o.activeTriggerId,
				payload: o.activePayload
			})), q(e, r);
		},
		$$slots: { default: !0 }
	}), N();
}
//#endregion
//#region node_modules/bits-ui/dist/bits/tooltip/components/tooltip-content.svelte
var _f = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"children",
	"child",
	"id",
	"ref",
	"side",
	"sideOffset",
	"align",
	"avoidCollisions",
	"arrowPadding",
	"sticky",
	"strategy",
	"hideWhenDetached",
	"customAnchor",
	"collisionPadding",
	"onInteractOutside",
	"onEscapeKeydown",
	"forceMount",
	"style"
]), vf = /* @__PURE__ */ G("<div><div><!></div></div>");
function yf(e, t) {
	let n = $r();
	M(t, !0);
	let r = Q(t, "id", 19, () => pc(n)), i = Q(t, "ref", 15, null), a = Q(t, "side", 3, "top"), o = Q(t, "sideOffset", 3, 0), s = Q(t, "align", 3, "center"), c = Q(t, "avoidCollisions", 3, !0), l = Q(t, "arrowPadding", 3, 0), u = Q(t, "sticky", 3, "partial"), d = Q(t, "hideWhenDetached", 3, !1), p = Q(t, "collisionPadding", 3, 0), m = Q(t, "onInteractOutside", 3, fc), h = Q(t, "onEscapeKeydown", 3, fc), g = Q(t, "forceMount", 3, !1), _ = /* @__PURE__ */ X(t, _f), v = hf.create({
		id: $(() => r()),
		ref: $(() => i(), (e) => i(e)),
		onInteractOutside: $(() => m()),
		onEscapeKeydown: $(() => h())
	}), y = /* @__PURE__ */ P(() => ({
		side: a(),
		sideOffset: o(),
		align: s(),
		avoidCollisions: c(),
		arrowPadding: l(),
		sticky: u(),
		hideWhenDetached: d(),
		collisionPadding: p(),
		strategy: t.strategy,
		customAnchor: t.customAnchor ?? v.root.triggerNode
	})), b = /* @__PURE__ */ P(() => Ss(_, W(y), v.props));
	var x = K(), S = z(x), C = (e) => {
		{
			let n = (e, n) => {
				let r = () => (n?.()).props, i = () => (n?.()).wrapperProps, a = /* @__PURE__ */ P(() => Ss(i(), { style: { pointerEvents: v.root.disableHoverableContent ? "none" : void 0 } })), o = /* @__PURE__ */ P(() => Ss(r(), { style: jd("tooltip") }, { style: t.style }));
				var s = K(), c = z(s), l = (e) => {
					var n = K(), r = z(n);
					{
						let e = /* @__PURE__ */ P(() => ({
							props: W(o),
							wrapperProps: W(a),
							...v.snippetProps
						}));
						gi(r, () => t.child, () => W(e));
					}
					q(e, n);
				}, u = (e) => {
					var n = vf();
					qi(n, () => ({ ...W(a) }));
					var r = R(n);
					qi(r, () => ({ ...W(o) })), gi(R(r), () => t.children ?? f), A(r), A(n), q(e, n);
				};
				Y(c, (e) => {
					t.child ? e(l) : e(u, -1);
				}), q(e, s);
			}, i = /* @__PURE__ */ P(() => v.root.disableHoverableContent ? "none" : "auto");
			tf(e, Z(() => W(b), () => v.popperProps, {
				get enabled() {
					return v.root.opts.open.current;
				},
				get id() {
					return r();
				},
				trapFocus: !1,
				loop: !1,
				preventScroll: !1,
				forceMount: !0,
				get ref() {
					return v.opts.ref;
				},
				tooltip: !0,
				get shouldRender() {
					return v.shouldRender;
				},
				get contentPointerEvents() {
					return W(i);
				},
				popper: n,
				$$slots: { popper: !0 }
			}));
		}
	}, w = (e) => {
		{
			let n = (e, n) => {
				let r = () => (n?.()).props, i = () => (n?.()).wrapperProps, a = /* @__PURE__ */ P(() => Ss(i(), { style: { pointerEvents: v.root.disableHoverableContent ? "none" : void 0 } })), o = /* @__PURE__ */ P(() => Ss(r(), { style: jd("tooltip") }, { style: t.style }));
				var s = K(), c = z(s), l = (e) => {
					var n = K(), r = z(n);
					{
						let e = /* @__PURE__ */ P(() => ({
							props: W(o),
							wrapperProps: W(a),
							...v.snippetProps
						}));
						gi(r, () => t.child, () => W(e));
					}
					q(e, n);
				}, u = (e) => {
					var n = vf();
					qi(n, () => ({ ...W(a) }));
					var r = R(n);
					qi(r, () => ({ ...W(o) })), gi(R(r), () => t.children ?? f), A(r), A(n), q(e, n);
				};
				Y(c, (e) => {
					t.child ? e(l) : e(u, -1);
				}), q(e, s);
			}, i = /* @__PURE__ */ P(() => v.root.disableHoverableContent ? "none" : "auto");
			$d(e, Z(() => W(b), () => v.popperProps, {
				get open() {
					return v.root.opts.open.current;
				},
				get id() {
					return r();
				},
				trapFocus: !1,
				loop: !1,
				preventScroll: !1,
				forceMount: !1,
				get ref() {
					return v.opts.ref;
				},
				tooltip: !0,
				get shouldRender() {
					return v.shouldRender;
				},
				get contentPointerEvents() {
					return W(i);
				},
				popper: n,
				$$slots: { popper: !0 }
			}));
		}
	};
	Y(S, (e) => {
		g() ? e(C) : g() || e(w, 1);
	}), q(e, x), N();
}
//#endregion
//#region node_modules/bits-ui/dist/bits/tooltip/components/tooltip-trigger.svelte
var bf = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"children",
	"child",
	"id",
	"disabled",
	"payload",
	"tether",
	"type",
	"tabindex",
	"ref"
]), xf = /* @__PURE__ */ G("<button><!></button>");
function Sf(e, t) {
	let n = $r();
	M(t, !0);
	let r = Q(t, "id", 19, () => pc(n)), i = Q(t, "disabled", 3, !1), a = Q(t, "type", 3, "button"), o = Q(t, "tabindex", 3, 0), s = Q(t, "ref", 15, null), c = /* @__PURE__ */ X(t, bf), l = mf.create({
		id: $(() => r()),
		disabled: $(() => i() ?? !1),
		tabindex: $(() => o() ?? 0),
		payload: $(() => t.payload),
		tether: $(() => t.tether),
		ref: $(() => s(), (e) => s(e))
	}), u = /* @__PURE__ */ P(() => Ss(c, l.props, { type: a() }));
	var d = K(), p = z(d), m = (e) => {
		var n = K();
		gi(z(n), () => t.child, () => ({ props: W(u) })), q(e, n);
	}, h = (e) => {
		var n = xf();
		qi(n, () => ({ ...W(u) })), gi(R(n), () => t.children ?? f), A(n), q(e, n);
	};
	Y(p, (e) => {
		t.child ? e(m) : e(h, -1);
	}), q(e, d), N();
}
//#endregion
//#region node_modules/bits-ui/dist/bits/tooltip/components/tooltip-provider.svelte
function Cf(e, t) {
	M(t, !0);
	let n = Q(t, "delayDuration", 3, 700), r = Q(t, "disableCloseOnTriggerClick", 3, !1), i = Q(t, "disableHoverableContent", 3, !1), a = Q(t, "disabled", 3, !1), o = Q(t, "ignoreNonKeyboardFocus", 3, !1), s = Q(t, "skipDelayDuration", 3, 300);
	ff.create({
		delayDuration: $(() => n()),
		disableCloseOnTriggerClick: $(() => r()),
		disableHoverableContent: $(() => i()),
		disabled: $(() => a()),
		ignoreNonKeyboardFocus: $(() => o()),
		skipDelayDuration: $(() => s())
	});
	var c = K();
	gi(z(c), () => t.children ?? f), q(e, c), N();
}
//#endregion
//#region src/lib/ui/TimelinePhase.svelte
var wf = /* @__PURE__ */ G("<span class=\"timeline-phase-label\"> </span> <span class=\"timeline-phase-time\"> </span>", 1), Tf = /* @__PURE__ */ G("<!> <!>", 1);
function Ef(e, t) {
	M(t, !0);
	let n = /* @__PURE__ */ P(() => `${t.phase.label}: ${Qa(t.phase.start)}–${Qa(t.phase.end)}`);
	var r = K();
	_i(z(r), () => Cf, (e, r) => {
		r(e, {
			children: (e, r) => {
				var i = K();
				_i(z(i), () => gf, (e, r) => {
					r(e, {
						children: (e, r) => {
							var i = Tf(), a = z(i);
							{
								let e = /* @__PURE__ */ P(() => `timeline-phase ${t.phase.active ? "active" : ""}`), r = /* @__PURE__ */ P(() => `flex-grow: ${t.phase.width_pct};`);
								_i(a, () => Sf, (i, a) => {
									a(i, {
										get class() {
											return W(e);
										},
										type: "button",
										get style() {
											return W(r);
										},
										get "aria-label"() {
											return W(n);
										},
										children: (e, n) => {
											var r = wf(), i = z(r), a = R(i, !0);
											A(i);
											var o = B(i, 2), s = R(o, !0);
											A(o), V((e) => {
												J(a, t.phase.label), J(s, e);
											}, [() => Qa(t.phase.start)]), q(e, r);
										},
										$$slots: { default: !0 }
									});
								});
							}
							_i(B(a, 2), () => yf, (e, t) => {
								t(e, {
									class: "tooltip",
									side: "top",
									children: (e, t) => {
										j();
										var r = Qr();
										V(() => J(r, W(n))), q(e, r);
									},
									$$slots: { default: !0 }
								});
							}), q(e, i);
						},
						$$slots: { default: !0 }
					});
				}), q(e, i);
			},
			$$slots: { default: !0 }
		});
	}), q(e, r), N();
}
//#endregion
//#region src/views/TodayView.svelte
var Df = /* @__PURE__ */ G("<!> Schlaf markieren", 1), Of = /* @__PURE__ */ G("<!> Wach markieren", 1), kf = /* @__PURE__ */ G("<div class=\"view-heading\"><div><p class=\"section-kicker\">Heute</p> <h2>Eine verlässliche Alltagswahrheit</h2> <p class=\"muted\">Presence, Bio, Tageskontext, Activity und internes Wake Planning aus Core State.</p></div> <span class=\"data-status\"> </span></div> <section aria-labelledby=\"today-status-heading\"><div><div class=\"hero-label\"><!> <span>Zentrale Statuswahrheit</span></div> <h2 id=\"today-status-heading\"> </h2> <p><!></p> <div class=\"hero-meta\"><span class=\"chip cyan\"> </span> <span class=\"chip purple\"> </span> <span class=\"chip\"> </span></div> <div class=\"action-row\"><!> <!></div></div> <div class=\"hero-side\"><span class=\"hero-side-label\">Nächster effektiver Wake-Start</span> <strong class=\"hero-time\"> </strong> <span class=\"helper\"> </span> <div class=\"inline-meta\"><span class=\"chip orange\"> </span> <span class=\"chip\"> </span></div></div></section> <div class=\"grid three\"><article class=\"metric-card\"><span class=\"metric-label\">E · Frühester Start</span> <div class=\"metric-value\"> </div> <p class=\"metric-note\">Aus dem Backend-Wake-Fenster</p></article> <article class=\"metric-card\"><span class=\"metric-label\">L · Harte Grenze</span> <div class=\"metric-value\"> </div> <p class=\"metric-note\"> </p></article> <article class=\"metric-card\"><span class=\"metric-label\">M / A · Schlafschutz</span> <div class=\"metric-value\"> </div> <p class=\"metric-note\">Mindestschlaf / Schutzvorlauf; fehlende Werte bleiben sichtbar</p></article></div> <section class=\"timeline-card\" aria-labelledby=\"timeline-heading\"><div class=\"section-header\"><div><p class=\"section-kicker\">Tagesrhythmus</p> <h3 id=\"timeline-heading\">Neun echte Tagesphasen</h3></div> <span class=\"helper\"> </span></div> <div class=\"timeline-track\" aria-label=\"Neunphasige Tagesrhythmus-Timeline\"><span class=\"timeline-marker\" aria-label=\"Jetzt\"></span> <!></div> <div class=\"progress-bar\"><span></span></div> <p class=\"helper\" style=\"margin-top: 8px;\"> </p></section>", 1), Af = /* @__PURE__ */ G("<div class=\"view-heading\"><div><p class=\"section-kicker\">Heute</p> <h2>Core State wird geladen</h2> <p class=\"muted\">Die Ansicht zeigt erst nach dem versionierten Snapshot fachliche Werte.</p></div> <span class=\"data-status\"> </span></div> <div class=\"skeleton\" aria-busy=\"true\"></div>", 1);
function jf(e, t) {
	M(t, !0);
	var n = K(), r = z(n), i = (e) => {
		let n = /* @__PURE__ */ P(() => t.snapshot.data.today), r = /* @__PURE__ */ P(() => t.snapshot.data.timeline);
		var i = kf(), a = z(i), o = B(R(a), 2), s = R(o, !0);
		A(o), A(a);
		var c = B(a, 2), l = R(c), u = R(l), d = R(u), f = (e) => {
			ja(e, { size: 18 });
		}, p = (e) => {
			Va(e, { size: 18 });
		}, m = (e) => {
			Ua(e, { size: 18 });
		}, h = (e) => {
			da(e, { size: 18 });
		};
		Y(d, (e) => {
			W(n).bio.state === "sleep" ? e(f) : W(n).bio.state === "awake" ? e(p, 1) : W(n).bio.state === "waking" ? e(m, 2) : e(h, -1);
		}), j(2), A(u);
		var g = B(u, 2), _ = R(g, !0);
		A(g);
		var v = B(g, 2), y = R(v), b = (e) => {
			q(e, Qr("Schutzstatus: Das ist noch keine bestätigte Schlafzeit. Core State wartet auf die reguläre Schlaf-/Wachentscheidung."));
		}, x = (e) => {
			var t = Qr();
			V((e) => J(t, `${e ?? ""}.`), [() => no(W(n).reason)]), q(e, t);
		};
		Y(y, (e) => {
			W(n).bio.provisional ? e(b) : e(x, -1);
		}), A(v);
		var S = B(v, 2), C = R(S), w = R(C);
		A(C);
		var T = B(C, 2), E = R(T);
		A(T);
		var ee = B(T, 2), te = R(ee);
		A(ee), A(S);
		var ne = B(S, 2), re = R(ne), ie = (e) => {
			{
				let n = /* @__PURE__ */ P(() => t.pendingCommand !== null);
				Po(e, {
					get disabled() {
						return W(n);
					},
					onclick: () => t.onCommand("bio.mark_sleep"),
					children: (e, t) => {
						var n = Df();
						ja(z(n), { size: 16 }), j(), q(e, n);
					},
					$$slots: { default: !0 }
				});
			}
		};
		Y(re, (e) => {
			t.snapshot.capabilities.mark_sleep && W(n).bio.state !== "sleep" && e(ie);
		});
		var ae = B(re, 2), oe = (e) => {
			{
				let n = /* @__PURE__ */ P(() => t.pendingCommand !== null);
				Po(e, {
					variant: "secondary",
					get disabled() {
						return W(n);
					},
					onclick: () => t.onCommand("bio.mark_awake"),
					children: (e, t) => {
						var n = Of();
						Va(z(n), { size: 16 }), j(), q(e, n);
					},
					$$slots: { default: !0 }
				});
			}
		};
		Y(ae, (e) => {
			t.snapshot.capabilities.mark_awake && W(n).bio.state !== "awake" && e(oe);
		}), A(ne), A(l);
		var se = B(l, 2), ce = B(R(se), 2), le = R(ce, !0);
		A(ce);
		var ue = B(ce, 2), de = R(ue);
		A(ue);
		var fe = B(ue, 2), pe = R(fe), me = R(pe);
		A(pe);
		var he = B(pe, 2), ge = R(he);
		A(he), A(fe), A(se), A(c);
		var _e = B(c, 2), ve = R(_e), ye = B(R(ve), 2), be = R(ye, !0);
		A(ye), j(2), A(ve);
		var xe = B(ve, 2), Se = B(R(xe), 2), Ce = R(Se, !0);
		A(Se);
		var we = B(Se, 2), Te = R(we, !0);
		A(we), A(xe);
		var Ee = B(xe, 2), De = B(R(Ee), 2), D = R(De);
		A(De), j(2), A(Ee), A(_e);
		var Oe = B(_e, 2), ke = R(Oe), Ae = B(R(ke), 2), je = R(Ae);
		A(Ae), A(ke);
		var Me = B(ke, 2), Ne = R(Me);
		ui(B(Ne, 2), 17, () => W(r).phases, (e) => e.id, (e, t) => {
			Ef(e, { get phase() {
				return W(t);
			} });
		}), A(Me);
		var Pe = B(Me, 2), O = R(Pe);
		A(Pe);
		var Fe = B(Pe, 2), k = R(Fe);
		A(Fe), A(Oe), V((e, t, i, a, l, u, d, f, p) => {
			Gi(o, "data-status", W(n).data_status), J(s, e), Oi(c, 1, `hero-card ${W(n).bio.state}`), J(_, W(n).central_status.value), J(w, `Profil: ${W(n).profile.label ?? ""}`), J(E, `Tageskontext: ${W(n).day_context.value ?? ""}`), J(te, `Activity: ${W(n).activity.state ?? ""}`), J(le, t), J(de, `${i ?? ""}.`), J(me, `Entschieden durch: ${W(n).wake.decided_by ?? "Core State" ?? ""}`), J(ge, `Daten: ${a ?? ""}`), J(be, l), J(Ce, u), J(Te, W(n).wake.hard_l_applied ? "Grenze wurde angewendet" : "Keine Grenzverschiebung"), J(D, `${d ?? ""} / ${f ?? ""}`), J(je, `Nächster Wechsel: ${p ?? ""}`), Ai(Ne, `left: ${W(r).now_marker_pct}%;`), Gi(Pe, "aria-label", `Fortschritt ${W(r).active_phase_progress_pct}%`), Ai(O, `width: ${W(r).active_phase_progress_pct}%;`), J(k, `Aktive Phase: ${W(r).active_phase ?? ""} · ${W(r).active_phase_progress_pct ?? ""}% fortgeschritten`);
		}, [
			() => Za(W(n).data_status),
			() => eo(W(n).wake.next_effective_start),
			() => no(W(n).wake.reason),
			() => Za(t.status),
			() => eo(W(n).wake.e),
			() => eo(W(n).wake.l),
			() => to(W(n).wake.m_minutes, " min"),
			() => to(W(n).wake.a_minutes, " min"),
			() => eo(W(r).next_change)
		]), q(e, i);
	}, a = (e) => {
		var n = Af(), r = z(n), i = B(R(r), 2), a = R(i, !0);
		A(i), A(r), j(2), V((e) => {
			Gi(i, "data-status", t.status), J(a, e);
		}, [() => Za(t.status)]), q(e, n);
	};
	Y(r, (e) => {
		t.snapshot?.data ? e(i) : e(a, -1);
	}), q(e, n), N();
}
//#endregion
//#region src/App.svelte
var Mf = /* @__PURE__ */ G("<span class=\"contract-version\"> </span>"), Nf = /* @__PURE__ */ G("<button type=\"button\"><!> <!> <!> <!> <!> <span> </span></button>"), Pf = /* @__PURE__ */ G("<div class=\"inline-error\" role=\"alert\"> </div>"), Ff = /* @__PURE__ */ G("<section class=\"core-state-module min-h-full\" aria-label=\"Core State\"><header class=\"module-header\"><div><p class=\"eyebrow\">Core State</p> <h1>Alltag im Gleichgewicht</h1></div> <div class=\"module-status\" aria-live=\"polite\"><span class=\"status-dot\" aria-hidden=\"true\"></span> <span> </span> <!></div></header> <nav class=\"module-nav flex items-center gap-1\" aria-label=\"Core-State-Bereiche\"></nav> <!> <main class=\"module-content\"><!></main></section>");
function If(e, t) {
	M(t, !0);
	let n = new ro(), r = /* @__PURE__ */ I(ln(n.state)), i = /* @__PURE__ */ I("today"), a = /* @__PURE__ */ I(!1), o = /* @__PURE__ */ I(!1), s = [
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
	}), na(() => {
		let e = n.subscribe((e) => {
			L(r, e, !0);
		}), t = Vf.subscribe((e) => {
			L(a, !0), n.setAdapter(Ya(e));
		});
		return () => {
			e(), t(), n.dispose();
		};
	});
	var u = Ff(), d = R(u), f = B(R(d), 2), p = B(R(f), 2), m = R(p, !0);
	A(p);
	var h = B(p, 2), g = (e) => {
		var t = Mf(), n = R(t);
		A(t), V(() => J(n, `v${W(r).snapshot.version ?? ""}`)), q(e, t);
	};
	Y(h, (e) => {
		W(r).snapshot?.version && e(g);
	}), A(f), A(d);
	var _ = B(d, 2);
	ui(_, 21, () => s, (e) => e.id, (e, t) => {
		var n = Nf();
		let r;
		var a = R(n), o = (e) => {
			Da(e, {
				size: 17,
				strokeWidth: 1.8
			});
		};
		Y(a, (e) => {
			W(t).id === "today" && e(o);
		});
		var s = B(a, 2), l = (e) => {
			_a(e, {
				size: 17,
				strokeWidth: 1.8
			});
		};
		Y(s, (e) => {
			W(t).id === "calendar" && e(l);
		});
		var u = B(s, 2), d = (e) => {
			ka(e, {
				size: 17,
				strokeWidth: 1.8
			});
		};
		Y(u, (e) => {
			W(t).id === "profiles" && e(d);
		});
		var f = B(u, 2), p = (e) => {
			da(e, {
				size: 17,
				strokeWidth: 1.8
			});
		};
		Y(f, (e) => {
			W(t).id === "diagnostics" && e(p);
		});
		var m = B(f, 2), h = (e) => {
			La(e, {
				size: 17,
				strokeWidth: 1.8
			});
		};
		Y(m, (e) => {
			W(t).id === "settings" && e(h);
		});
		var g = B(m, 2), _ = R(g, !0);
		A(g), A(n), V(() => {
			r = Oi(n, 1, "nav-item", null, r, { active: W(i) === W(t).id }), Gi(n, "aria-current", W(i) === W(t).id ? "page" : void 0), J(_, W(t).label);
		}), Hr("click", n, () => c(W(t).id)), q(e, n);
	}), A(_);
	var v = B(_, 2), y = (e) => {
		var t = Pf(), n = R(t, !0);
		A(t), V(() => J(n, W(r).error)), q(e, t);
	};
	Y(v, (e) => {
		W(r).error && e(y);
	});
	var b = B(v, 2), x = R(b), S = (e) => {
		jf(e, {
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
		po(e, {
			get projection() {
				return W(r).projection;
			},
			get status() {
				return W(r).status;
			}
		});
	}, w = (e) => {
		Eo(e, {
			get snapshot() {
				return W(r).snapshot;
			},
			get pendingCommand() {
				return W(r).pendingCommand;
			},
			onCommand: l
		});
	}, T = (e) => {
		vo(e, {
			get snapshot() {
				return W(r).snapshot;
			},
			get status() {
				return W(r).status;
			}
		});
	}, E = (e) => {
		jo(e, {
			get snapshot() {
				return W(r).snapshot;
			},
			get pendingCommand() {
				return W(r).pendingCommand;
			},
			onCommand: l
		});
	};
	Y(x, (e) => {
		W(i) === "today" ? e(S) : W(i) === "calendar" ? e(C, 1) : W(i) === "profiles" ? e(w, 2) : W(i) === "diagnostics" ? e(T, 3) : e(E, -1);
	}), A(b), A(u), V((e) => {
		Gi(f, "data-status", W(r).status), J(m, e);
	}, [() => Za(W(r).status)]), q(e, u), N();
}
Ur(["click"]);
//#endregion
//#region src/styles.css?inline
var Lf = "/*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */\n@layer properties{@supports (((-webkit-hyphens:none)) and (not (margin-trim:inline))) or ((-moz-orient:inline) and (not (color:rgb(from red r g b)))){*,:before,:after,::backdrop{--tw-rotate-x:initial;--tw-rotate-y:initial;--tw-rotate-z:initial;--tw-skew-x:initial;--tw-skew-y:initial;--tw-border-style:solid;--tw-outline-style:solid;--tw-blur:initial;--tw-brightness:initial;--tw-contrast:initial;--tw-grayscale:initial;--tw-hue-rotate:initial;--tw-invert:initial;--tw-opacity:initial;--tw-saturate:initial;--tw-sepia:initial;--tw-drop-shadow:initial;--tw-drop-shadow-color:initial;--tw-drop-shadow-alpha:100%;--tw-drop-shadow-size:initial}}}.collapse{visibility:collapse}.visible{visibility:visible}.absolute{position:absolute}.fixed{position:fixed}.static{position:static}.sticky{position:sticky}.block{display:block}.contents{display:contents}.flex{display:flex}.grid{display:grid}.hidden{display:none}.inline{display:inline}.inline-flex{display:inline-flex}.min-h-full{min-height:100%}.flex-grow{flex-grow:1}.transform{transform:var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,)}.resize{resize:both}.items-center{align-items:center}.justify-center{justify-content:center}.border{border-style:var(--tw-border-style);border-width:1px}.outline{outline-style:var(--tw-outline-style);outline-width:1px}.filter{filter:var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)}:host{color:#e7edf4;font-synthesis:none;text-rendering:optimizelegibility;--graphite-950:#11161d;--graphite-900:#171d25;--graphite-850:#1b222c;--graphite-800:#202934;--graphite-700:#2d3745;--graphite-600:#465363;--text:#e7edf4;--muted:#9aa8b8;--subtle:#718093;--cyan:#61d8e6;--cyan-muted:#2d7881;--purple:#b49bff;--orange:#f4b46d;--green:#7dd7ad;--red:#ff8b8b;--yellow:#f4d37b;--radius-sm:8px;--radius-md:12px;--shadow:0 12px 30px #0003;background:#11161d;min-height:100vh;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;display:block}.core-state-module,.core-state-module *,.core-state-module :before,.core-state-module :after{box-sizing:border-box}.core-state-module{width:min(1180px,100% - 32px);min-height:100%;color:var(--text);background:var(--graphite-950);font-synthesis:none;text-rendering:optimizelegibility;margin:0 auto;padding:28px 0 48px;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}.core-state-module button,.core-state-module input,.core-state-module select,.core-state-module textarea{font:inherit}.core-state-module button{cursor:pointer}.core-state-module button:focus-visible,.core-state-module input:focus-visible,.core-state-module select:focus-visible,.core-state-module textarea:focus-visible{outline:2px solid var(--cyan);outline-offset:2px}.module-header{border-bottom:1px solid var(--graphite-700);justify-content:space-between;align-items:flex-end;gap:24px;padding-bottom:22px;display:flex}.eyebrow,.section-kicker{color:var(--cyan);letter-spacing:.12em;text-transform:uppercase;margin:0 0 6px;font-size:.74rem;font-weight:700}.core-state-module h1,.core-state-module h2,.core-state-module h3,.core-state-module p{margin-top:0}.core-state-module h1{letter-spacing:-.035em;margin-bottom:0;font-size:clamp(1.55rem,3vw,2.3rem)}.core-state-module h2{letter-spacing:-.025em;margin-bottom:8px;font-size:clamp(1.45rem,2.8vw,2rem)}.core-state-module h3{margin-bottom:6px;font-size:1rem}.module-status,.status-badge,.data-status{border:1px solid var(--graphite-600);min-height:32px;color:var(--muted);white-space:nowrap;border-radius:999px;align-items:center;gap:8px;padding:6px 10px;font-size:.78rem;display:inline-flex}.status-dot{background:var(--green);border-radius:50%;width:8px;height:8px;box-shadow:0 0 0 3px #7dd7ad21}[data-status=loading] .status-dot,[data-status=reconnecting] .status-dot{background:var(--cyan)}[data-status=degraded] .status-dot,[data-status=stale] .status-dot{background:var(--yellow)}[data-status=error] .status-dot,[data-status=offline] .status-dot,[data-status=unavailable] .status-dot,[data-status=blocked] .status-dot{background:var(--red)}.contract-version{border-left:1px solid var(--graphite-600);color:var(--subtle);font-variant-numeric:tabular-nums;padding-left:8px}.module-nav{scrollbar-width:thin;gap:4px;padding:14px 0 22px;display:flex;overflow-x:auto}.nav-item,.button{border-radius:var(--radius-sm);min-height:44px;color:var(--muted);background:0 0;border:1px solid #0000;justify-content:center;align-items:center;gap:8px;padding:0 14px;font-size:.9rem;transition:all .16s;display:inline-flex}.nav-item:hover,.nav-item.active{color:var(--text);background:var(--graphite-850);border-color:var(--graphite-600)}.nav-item.active{box-shadow:inset 0 -2px var(--cyan)}.button{border-color:var(--graphite-600);background:var(--graphite-800);color:var(--text);font-weight:650}.button:hover{border-color:var(--cyan-muted);background:var(--graphite-700)}.button.secondary{background:0 0}.button.danger{color:var(--red)}.button:disabled{cursor:wait;opacity:.5}.inline-error,.callout{border-radius:var(--radius-sm);color:#ffd0d0;background:#6f283238;border:1px solid #ff8b8b73;margin:0 0 18px;padding:12px 14px}.callout.info{color:#c4f3f7;background:#215b6333;border-color:#61d8e659}.module-content{min-width:0}.view-heading{justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:18px;display:flex}.view-heading p,.muted,.helper{color:var(--muted)}.helper{margin-bottom:0;font-size:.82rem;line-height:1.5}.grid{gap:14px;display:grid}.grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}.grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}.card,.hero-card,.metric-card,.timeline-card,.table-card{border:1px solid var(--graphite-700);border-radius:var(--radius-md);background:var(--graphite-900);box-shadow:var(--shadow)}.hero-card{grid-template-columns:minmax(0,1.2fr) minmax(240px,.8fr);gap:24px;margin-bottom:14px;padding:24px;display:grid}.hero-card.provisional_sleep{border-color:#f4b46d7a}.hero-card.sleep{border-color:#b49bff7a}.hero-card.waking{border-color:#61d8e67a}.hero-card.awake{border-color:#7dd7ad7a}.hero-label{color:var(--cyan);align-items:center;gap:8px;margin-bottom:18px;font-size:.84rem;font-weight:700;display:inline-flex}.hero-card p{max-width:62ch;line-height:1.55}.hero-side{border-left:1px solid var(--graphite-700);flex-direction:column;justify-content:center;gap:12px;padding:4px 0 4px 20px;display:flex}.hero-side-label,.metric-label,.field-label,.mini-label{color:var(--subtle);letter-spacing:.07em;text-transform:uppercase;font-size:.74rem;font-weight:700}.hero-time{color:var(--text);letter-spacing:-.04em;font-size:2rem;font-weight:750}.hero-meta,.inline-meta,.action-row,.card-header,.section-header{flex-wrap:wrap;align-items:center;gap:10px;display:flex}.hero-meta{margin-top:18px}.chip{border:1px solid var(--graphite-600);min-height:30px;color:var(--muted);border-radius:999px;align-items:center;gap:6px;padding:4px 9px;font-size:.8rem;display:inline-flex}.chip.cyan{color:var(--cyan);border-color:var(--cyan-muted)}.chip.purple{color:var(--purple);border-color:#b49bff59}.chip.orange{color:var(--orange);border-color:#f4b46d59}.metric-card,.card,.timeline-card,.table-card{padding:18px}.metric-card{min-height:100px}.metric-value{color:var(--text);margin:8px 0 4px;font-size:1.25rem;font-weight:700}.metric-note{color:var(--subtle);margin:0;font-size:.78rem}.timeline-card{margin-top:14px}.section-header{justify-content:space-between;margin-bottom:14px}.section-header h3,.card-header h3{margin-bottom:0}.timeline-track{gap:2px;height:68px;padding-top:10px;display:flex;position:relative}.timeline-marker{z-index:2;background:var(--cyan);width:2px;position:absolute;top:0;bottom:0;box-shadow:0 0 0 3px #61d8e621}.timeline-phase{border:1px solid var(--graphite-700);background:var(--graphite-850);border-radius:6px;min-width:0;height:58px;padding:9px 6px;position:relative;overflow:hidden}.timeline-phase.active{border-color:var(--cyan-muted);background:#20333a}.timeline-phase-label{color:var(--muted);text-overflow:ellipsis;white-space:nowrap;font-size:.7rem;font-weight:650;display:block;overflow:hidden}.timeline-phase-time{color:var(--subtle);font-variant-numeric:tabular-nums;white-space:nowrap;margin-top:5px;font-size:.68rem;display:block}.tooltip{z-index:10;border:1px solid var(--graphite-600);border-radius:var(--radius-sm);max-width:260px;color:var(--text);background:var(--graphite-800);box-shadow:var(--shadow);padding:8px 10px;font-size:.75rem;line-height:1.4}.progress-bar{background:var(--graphite-700);border-radius:999px;height:6px;margin-top:12px;overflow:hidden}.progress-bar>span{background:var(--cyan);height:100%;display:block}.action-row{margin-top:18px}.calendar-grid{grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;display:grid}.calendar-day{border:1px solid var(--graphite-700);border-radius:var(--radius-sm);background:var(--graphite-900);flex-direction:column;gap:8px;min-height:142px;padding:12px;display:flex}.calendar-day.weekend{background:#1b202a}.calendar-day.degraded,.calendar-day.stale{border-color:#f4d37b66}.calendar-day-header{justify-content:space-between;align-items:center;gap:6px;display:flex}.calendar-date{color:var(--text);font-size:.8rem;font-weight:700}.calendar-wake{color:var(--cyan);font-size:1.35rem;font-weight:750}.calendar-day .helper{font-size:.75rem}.calendar-day .data-status{align-self:flex-start;min-height:26px;margin-top:auto;padding:3px 7px;font-size:.7rem}.profile-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;display:grid}.form-card{border:1px solid var(--graphite-700);border-radius:var(--radius-md);background:var(--graphite-900);padding:18px}.form-card.active{border-color:var(--cyan-muted);box-shadow:inset 0 0 0 1px #61d8e629, var(--shadow)}.form-card h3{color:var(--cyan)}.form-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:14px;display:grid}.field{flex-direction:column;gap:6px;min-width:0;display:flex}.field.full{grid-column:1/-1}.field input,.field select,.field textarea{border:1px solid var(--graphite-600);border-radius:var(--radius-sm);width:100%;min-height:44px;color:var(--text);background:var(--graphite-850);padding:9px 10px}.field textarea{resize:vertical;min-height:88px}.field small{color:var(--subtle);font-size:.73rem;line-height:1.4}.table-wrap{overflow-x:auto}.rules-table{border-collapse:collapse;width:100%;font-size:.84rem}.rules-table th,.rules-table td{border-bottom:1px solid var(--graphite-700);text-align:left;vertical-align:top;padding:12px 10px}.rules-table th{color:var(--subtle);letter-spacing:.06em;text-transform:uppercase;font-size:.72rem}.rules-table td{color:var(--muted)}.rules-table strong{color:var(--text)}.diagnostic-list{grid-template-columns:minmax(130px,.5fr) minmax(0,1fr);gap:8px 16px;margin:0;font-size:.84rem;display:grid}.diagnostic-list dt{color:var(--subtle)}.diagnostic-list dd{color:var(--muted);overflow-wrap:anywhere;margin:0}.diagnostic-pre{border:1px solid var(--graphite-700);border-radius:var(--radius-sm);color:#c9d6e4;white-space:pre-wrap;background:#121820;max-height:360px;margin:0 0 12px;padding:12px;font-family:Cascadia Code,SFMono-Regular,Consolas,monospace;font-size:.75rem;line-height:1.5;overflow:auto}.core-state-module details{border-top:1px solid var(--graphite-700)}.core-state-module details summary{min-height:44px;color:var(--cyan);cursor:pointer;padding:13px 0;font-size:.86rem;font-weight:650}.core-state-module details[open] summary{margin-bottom:8px}.skeleton{border:1px solid var(--graphite-700);border-radius:var(--radius-md);background:var(--graphite-900);min-height:180px}.empty-state{border:1px dashed var(--graphite-600);border-radius:var(--radius-md);color:var(--muted);text-align:center;padding:36px 18px}@media (width<=880px){.hero-card,.grid.two,.grid.three,.profile-grid{grid-template-columns:1fr}.hero-side{border-top:1px solid var(--graphite-700);border-left:0;padding:16px 0 0}.calendar-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media (width<=560px){.core-state-module{width:min(100% - 20px,1180px);padding-top:16px}.module-header,.view-heading{flex-direction:column;align-items:flex-start}.form-grid{grid-template-columns:1fr}.field.full{grid-column:auto}.calendar-grid{grid-template-columns:1fr}}@media (prefers-reduced-motion:reduce){.core-state-module,.core-state-module *,.core-state-module :before,.core-state-module :after{scroll-behavior:auto!important;transition-duration:.01ms!important;animation-duration:.01ms!important}}@property --tw-rotate-x{syntax:\"*\";inherits:false}@property --tw-rotate-y{syntax:\"*\";inherits:false}@property --tw-rotate-z{syntax:\"*\";inherits:false}@property --tw-skew-x{syntax:\"*\";inherits:false}@property --tw-skew-y{syntax:\"*\";inherits:false}@property --tw-border-style{syntax:\"*\";inherits:false;initial-value:solid}@property --tw-outline-style{syntax:\"*\";inherits:false;initial-value:solid}@property --tw-blur{syntax:\"*\";inherits:false}@property --tw-brightness{syntax:\"*\";inherits:false}@property --tw-contrast{syntax:\"*\";inherits:false}@property --tw-grayscale{syntax:\"*\";inherits:false}@property --tw-hue-rotate{syntax:\"*\";inherits:false}@property --tw-invert{syntax:\"*\";inherits:false}@property --tw-opacity{syntax:\"*\";inherits:false}@property --tw-saturate{syntax:\"*\";inherits:false}@property --tw-sepia{syntax:\"*\";inherits:false}@property --tw-drop-shadow{syntax:\"*\";inherits:false}@property --tw-drop-shadow-color{syntax:\"*\";inherits:false}@property --tw-drop-shadow-alpha{syntax:\"<percentage>\";inherits:false;initial-value:100%}@property --tw-drop-shadow-size{syntax:\"*\";inherits:false}", Rf = "data-bcs-styles", zf = "data-bcs-mount";
function Bf(e) {
	let t = e.querySelector(`style[${Rf}]`);
	t || (t = document.createElement("style"), t.setAttribute(Rf, ""), t.textContent = Lf, e.append(t));
	let n = e.querySelector(`[${zf}]`);
	return n || (n = document.createElement("div"), n.setAttribute(zf, ""), e.append(n)), n;
}
var Vf = lt(null), Hf = class extends HTMLElement {
	app = null;
	_hass = null;
	unmountPromise = null;
	mountGeneration = 0;
	get hass() {
		return this._hass;
	}
	set hass(e) {
		this._hass = e, Vf.set(e);
	}
	connectedCallback() {
		if (this.app) return;
		let e = ++this.mountGeneration, t = Bf(this.shadowRoot ?? this.attachShadow({ mode: "open" })), n = () => {
			!this.isConnected || this.app || e !== this.mountGeneration || (this.app = ei(If, { target: t }));
		};
		if (this.unmountPromise) {
			let e = this.unmountPromise;
			this.unmountPromise = null, e.then(n, n);
		} else n();
	}
	disconnectedCallback() {
		this.mountGeneration += 1, this.app && (this.unmountPromise = ii(this.app)), this.app = null;
	}
};
customElements.get("bcs-app") || customElements.define("bcs-app", Hf);
//#endregion
export { Vf as hassStore };
