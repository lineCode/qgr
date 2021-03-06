/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright © 2015-2016, xuewen.chu
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of xuewen.chu nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL xuewen.chu BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

import 'qgr/util';
import { EventNoticer, NativeNotification } from 'qgr/event';

var _qgr = requireNative('_qgr');
var View = _qgr.View;
var Text = _qgr.Text;
var extend = util.extend;

function reset_data_bind_attrs(responder /* ViewController or View */ ) {
	if (responder.__bind) {
		responder.__bind.attrs = [];
	}
}

function unregister_data_bind(self, id, responder) {
	delete responder.__bind;
	self.onViewData.off(id);
}

function register_data_bind(self, responder/* ViewController or View */) {
	var bind = responder.__bind;
	if (bind) return bind;
	
	var id = util.id;
	responder.__bind = bind = {
		id: id,
		attrs: [ /* attr_vx [names,type,value] */ ], 
		replace: null,
		/*{
			mode: 0,  // mode: 0 inner text | 1 full replace | 2 ctr.view
			vx: null, // view xml data
			relation_views: [],
		}*/
	};
	
	responder.onRemoveView.once(function() {
		unregister_data_bind(self, id, responder);
	});
	
	self.onViewData.on2(function(responder) {
		var bind = responder.__bind;
		var replace = bind.replace;
		
		if (replace) { // full replace
			var {vx,relation_views} = replace;
			var exec = vx.v;

			if (replace.mode == 1) { // replace all relation views
				var { next, parent } = relation_views[relation_views.length - 1];
				// First delete all relationviews, avoid ID repeats
				relation_views.forEach(v=>v.remove());
				load_view_from_bind_data(self, parent, next, vx);
			} else if (replace.mode == 2) { // replace ctr.view
				var {vx:t,v} = exec(self.m_vdata, self); // 这里返回的数据必须都为元数据
				util.assert(t === 0);
				let [tag] = v;
				let view = new tag();
				self.view = view;
				load_view(self, view, value);
				register_data_bind_2(self, view, 2, vx, [view]); //
			} else { // replace inner text string
				responder.innerText = exec(self.m_vdata, self);
			}
		} else { // attributes bind
			bind.attrs.forEach(function(attr_vx) {
				var [names,type,exec] = attr_vx;
				var len = names.length - 1;
				var name = names[len];
				var target = responder;
				for (var i = 0; i < len; i++) {
					target = target[names[i]];
				}
				target[name] = exec(self.m_vdata, self);
			});
		}
	}, responder, id);

	return bind;
}

function register_data_bind_2(self, responder, mode, vx, relation_views) {
	register_data_bind(self, responder).replace = 
		{ mode: mode, vx: vx, relation_views: relation_views };
}

function set_attrbute(self, responder, attr_vx) {
	// [names,type,value]
	var [names,type,value,multiple] = attr_vx;
	var target = responder;
	var len = names.length - 1;
	var name = names[len];
	
	for (var i = 0; i < len; i++) {
		target = target[names[i]];
	}
	if (type === 0)  {
		target[name] = value;
	} else if (type == 3) { // data bind
		target[name] = value(self.m_vdata, self);
		if (multiple) { // multiple bind
			register_data_bind(self, responder).attrs.push(attr_vx);
		}
	} else {
		throw new TypeError('Unknown view xml attribute type');
	}
}

/**
 * 载入视图并绑定数据响应
 */
function load_view_from_bind_data(self, parent, next, raw_vx) {
	// The data returned from the data binding must all be metadata
	var {v:exec} = raw_vx;
	var vx = exec(self.m_vdata, self); // 返回的数据必须都为元数据，不能返回{vx:3}的数据
	var out = { responder: null, mode: 0, relation_views: [] };
	load_view_from_bind_data_2(self, parent, next, vx);
	register_data_bind_2(self, out.responder, out.mode, raw_vx, out.relation_views.reverse());
}

function load_view_from_bind_data_2(self, parent, next, vx, out) {
	var {vx:t, v} = vx;
	var r_view = null;

	switch(t) {
		case 0:
			var [tag] = v;
			var responder = new tag();
			if (responder instanceof ViewController) { // ctr
				load_subctr(self, responder, vx, parent, next);
				r_view = responder.view;
			} else { // view
				if (next) {
					next.before(responder);
				} else {
					responder.appendTo(parent);
				}
				load_view(self, responder, vx);
				r_view = responder;
			}
			out.mode = 1;
			out.responder = responder;
			break;
		case 1:
			throw new TypeError('Unimplemented <prefix:suffix />');
			break;
		case 3:
			throw new TypeError('Data binding must return metadata');
			break;
		case 2: // string
		default:
			if (t != 2 && Array.isArray(vx)) {
				for (var item of vx.slice().reverse()) {
					next = load_view_from_bind_data_2(self, parent, next, item, out);
				}
				r_view = next;
			} else {
				// string append text
				r_view = parent.appendText(vx);
				if (r_view) {
					if (next) {
						next.before(r_view); // Right position
					}
					out.mode = 1;
					out.responder = r_view;
				} else { // replace inner text
					if (out.mode !== 0) {
						throw new TypeError('Data bound list item pattern mismatch');
					}
					out.responder = r_view = parent;
				}
			}
			break;
	}

	out.relation_views.push(r_view);

	return r_view;
}

// empty view xml <View />
export const EMPTY_VIEW_XML = {vx:0,v:[View,[],[]]};

// Is empty view xml
export function isEmptyViewXml(vx) {
	return vx === EMPTY_VIEW_XML;
}

 /**
	* @func isViewXml(vx[,type])
	* @arg vx {Object}
	* @arg [type] {class}
	* @ret {[`bool`]}
	*/
export function isViewXml(vx, type) {
	// {vx:0,v:[tag,[attrs],[child],vdata]}
	if (vx && vx.vx === 0) {
		var v = vx.v;
		if (v) {
			var [tag] = v;
			if (tag) {
				if ( type ) {
					return util.equalsClass(type, tag);
				} else {
					return true;
				}
			}
		}
	}
	return false;
}

function load_subctr(self, subctr, vx, parent, next) {
	var [,attrs,childs,vdata] = vx.v;
	
	if (vdata) {
		set_attrbute(self, subctr, vdata);
	}
	
	if (childs.length) {
		subctr.loadView(...childs);
	} else {
		subctr.loadView(EMPTY_VIEW_XML);
	}
	
	var view = subctr.view;
	
	if (!view) {
		subctr.view = view = new View();
	}
	if (next) {
		next.before(view);
	} else {
		view.appendTo(parent);
	}

	reset_data_bind_attrs(subctr);
	
	for (var attr of attrs) {
		set_attrbute(self, subctr, attr);
	}
}

function load_child_view(self, parent, vx) {
	var {vx:t,v} = vx;

	// View xml data format info
	// {vx:0,v:[tag,[attrs],[child],vdata]}           <tag />
	// {vx:1,v:[prefix,suffix,[attrs],[child],vdata]} <prefix:suffix />
	// {vx:2,v:"string"}                              string
	// {vx:3,v:exec,m:1}                              %{xx} or %%{xx}
	// {vx:4,v:value}                                 ${xx}

	switch (t) {
		case 0: // <tag />
			var [tag] = v;
			var obj = new tag();
			if (obj instanceof ViewController) {
				load_subctr(self, obj, vx, parent, null);
			} else { // view
				obj.appendTo(parent);
				load_view(self, obj, vx);
			}
			break;
		case 1: // <prefix:suffix />
			throw new TypeError('Unimplemented <prefix:suffix />');
			break;
		case 2: // string
			parent.appendText(v);
			break;
		case 3:
			if (vx.m) { // %%{xx} multiple
				load_view_from_bind_data(self, parent, null, vx);
			} else { // %{xx}
				let vx = v(self.m_vdata, self); // exec
				load_child_view(self, parent, vx);
			}
			break;
		default: // Unknown, check type
			if (Array.isArray(vx)) {
				for (var item of vx) {
					load_child_view(self, parent, item);
				}
			} else {
				parent.appendText(vx);
			}
			break;
	}
}

function load_view0(self, vx) {
	var view;
	var {vx:t,v} = vx;
	
	switch(t) {
		case 0: // <tag />
			var [tag] = v;
			view = new tag(); // 这里必需为视图，不可以为控制器
			self.view = view;
			load_view(self, view, vx);
			break;
		case 1: // <prefix:suffix />
			throw new TypeError('Unimplemented <prefix:suffix />');
			break;
		case 2: // string
			view = new Text();
			view.value = v;
			self.view = view;
			break;
		case 3: // %%{xx} or %{xx}
			var vx2 = v(self.m_vdata, self); // 这里返回的数据必须都为元数据
			// util.assert(isViewXml(vx2));
			var [tag] = vx2.v;
			view = new tag(); // tag必须为View
			self.view = view;
			load_view(self, view, vx2);
			if (vx.m) { // multiple bind
				register_data_bind_2(self, view, 2, vx, [view]);
			}
			break;
		default: // Unknown
			if (Array.isArray(vx)) {
				view = load_view0(self, vx[0]);
			} else {
				view = new Text();
				view.value = vx;
				self.view = view;
			}
			break;
	}
	return view;
}

function load_view(self, view, vx) {
	var [,attrs,childs] = vx.v;

	for (var ch of childs) {
		load_child_view(self, view, ch);
	}

	reset_data_bind_attrs(view);
	
	for (var attr of attrs) {
		set_attrbute(self, view, attr);
	}
}

// -------------------- no ctr ----------------------

function set_attrbute_no_ctr(obj, attr_vx) {
	// [names,type,value]
	var [names,type,value] = attr_vx;
	var target = obj;
	var len = names.length - 1;
	var name = names[len];
	
	for (var i = 0; i < len; i++) {
		target = target[names[i]];
	}
	if (type === 0)  {
		target[name] = value;
	} else { // data bind
		throw new TypeError('Bad argument. Cannot bind data');
	}
}

function load_subctr_no_ctr(subctr, vx, parent) {
	var [,attrs,childs,vdata] = vx.v;

	if (vdata) {
		set_attrbute_no_ctr(subctr, vdata);
	}
	
	if (childs.length) {
		subctr.loadView(...childs);
	} else {
		subctr.loadView(EMPTY_VIEW_XML);
	}
	
	var view = subctr.view;

	if (!view) {
		subctr.view = view = new View();
	}
	if (parent) {
		view.appendTo(parent);
	}

	for (var attr of attrs) {
		set_attrbute_no_ctr(subctr, attr);
	}
}

function load_child_view_no_ctr(parent, vx) {
	var {vx:t,v} = vx;

	switch (t) {
		case 0: // <tag />
			let [tag] = v;
			let obj = new tag();
			if (obj instanceof ViewController) {
				load_subctr_no_ctr(obj, vx, parent);
			} else { // view
				obj.appendTo(parent);
				load_view_no_ctr(obj, vx);
			}
			break;
		case 1: // <prefix:suffix />
			throw new TypeError('Unimplemented <prefix:suffix />');
			break;
		case 2: // string
			parent.appendText(v);
			break;
		case 3: // %%{xx} or %{xx}
			throw new TypeError('Bad argument. Cannot bind data');
			break;
		default: 
			if (Array.isArray(vx)) {
				for (var item of vx) {
					load_child_view_no_ctr(parent, item);
				}
			} else {
				parent.appendText(vx);
			}
			break;
	}
}

function load_view_no_ctr(view, vx) {
	var [,attrs,childs] = vx.v;

	for (var ch of childs) {
		load_child_view_no_ctr(view, ch);
	}

	for (var attr of attrs) {
		set_attrbute_no_ctr(view, attr);
	}
}

/**
 * @func New(vx[,parent[,...args]]) view or view controller with vx data
 * @func New(vx[,...args])
 * @arg vx {Object}
 * @arg [parent] {View}
 * @arg [...args]
 * @ret {View|ViewController}
 */
export function New(vx, parent, ...args) {
	if (isViewXml(vx)) {

		if ( parent ) {
			if ( !(parent instanceof View) ) {
				args.unshift(parent);
				parent = null;
			}
		}

		var [tag] = vx.v;
		var rv = new tag(...args);
		var ctr = null;
		
		if ( parent ) {
			ctr = parent.ctr;
			if ( !ctr ) {
				if ( parent.top ) {
					ctr = parent.top.ctr;
				}
			}
		}
		
		if ( rv instanceof View ) {
			if ( parent ) {
				rv.appendTo(parent);
			}
			if ( ctr ) {
				load_view(ctr, rv, vx);
			} else {
				load_view_no_ctr(rv, vx);
			}
			return rv;
			
		} else if ( rv instanceof ViewController ) {
			if ( ctr ) {
				load_subctr(ctr, rv, vx, parent, null);
			} else {
				load_subctr_no_ctr(rv, vx, parent);
			}
			return rv;
		}

	}

	throw new TypeError('Bad argument. invalid view xml data');
}

 /**
	* @class NativeViewController
	* 
	* @get parent {ViewController}
	* 
	* @get,set view {View}
	*
	* @get,set id {uint}
	* 
	* @func find(id)
	* @arg id {String}
	* @ret {View|ViewController)
	*
	* @func remove()
	* 
	* @end
	*/

/**
 * @class ViewController
 * @bases NativeViewController
 */
export class ViewController extends _qgr.NativeViewController {

	m_vdata = null; // 视图数据
	m_mapping = null;

	/**
	 * @event onViewData
	 */
	event onViewData;
	
	/**
	 * @event onLoadView
	 */
	event onLoadView;
	
	/**
	 * @event onRemoveView
	 */
	event onRemoveView;
	
	/* events mapping */
	event onBack;
	event onClick;
	event onTouchStart;
	event onTouchMove;
	event onTouchEnd;
	event onTouchCancel;
	event onKeyDown;
	event onKeyPress;
	event onKeyUp;
	event onKeyEnter;
	event onFocus;
	event onBlur;
	event onHighlighted;
	event onFocusMove;
	event onScroll;
	event onActionKeyframe;
	event onActionLoop;
	event onWaitBuffer; // player
	event onReady;
	event onStartPlay;
	event onError;
	event onSourceEof;
	event onPause;
	event onResume;
	event onStop;
	event onSeek;
	
	/**
	 * @get vdata {Object}
	 */
	get vdata() { return this.m_vdata }

	/**
	 * @set set vdata {Object}
	 */
	set vdata(value) {
		if (typeof value == 'object') {
			extend(this.m_vdata, value);
			this.triggerViewData();
		}
	}

	/**
	 * @get view {View}
	 */
	get view() { return super.view }

	/**
	 * @set view {View}
	 */
	set view(value) {
		var __bind = this.__bind;
		super.view = value;
		if (__bind) { // 如果之前有绑定动态数据,设置新的视图后会被清理
			if (__bind !== this.__bind) {
				var parent = this.parent;
				if ( parent ) { // 重新设置原bind
					var cur_bind = register_data_bind(parent, this);
					__bind.id = cur_bind.id;
					extend(cur_bind, __bind);
				}
			}
		}
	}

	/**
	 * @constructor()
	 */
	constructor() { 
		super();
		this.m_vdata = {};
	}
	
	/**
	 * @func loadView(vx)
	 * @arg vx {Object}
	 */
	loadView(vx) {
		load_view0(this, vx);
		// reset event mapping
		var mapping = this.m_mapping;
		if (mapping) { // unbind mapping
			for ( var name in mapping ) {
				add_event_mapping(this, name, self['__on' + name]);
			}
		}
		this.triggerLoadView();
	}

	/**
	 * @get action {Action}
	 */
	get action() { // get action object
		return this.view.action; 
	}
	
	/**
	 * @set action {Action}
	 */
	set action(value) { // set action
		this.view.action = value;
	}

	/**
	 * @func transition(style[,delay[,cb]][,cb])
	 * @arg style {Object}
	 * @arg [delay] {uint} ms
	 * @arg [cb] {Funcion}
	 */
	transition(style, delay, cb) { // transition animate
		this.view.transition(style, delay, cb);
	}
	
	/**
	 * @func show()
	 */
	show() {
		this.view.show();
	}
	
	/**
	 * @func show()
	 */
	hide() {
		this.view.hide();
	}
	
	/**
	 * @get class {Object}
	 */
	get 'class'() { return this.view.class; }
	
	/**
	 * @set class {String}
	 */
	set 'class'(value) { this.view.class = value; }
	
	/**
	 * @func addClass(name)
	 * @arg name {String}
	 */
	addClass(name) { this.view.addClass(name); }
	
	/**
	 * @func removeClass(name)
	 * @arg name {String}
	 */
	removeClass(name) { this.view.removeClass(name); }
	
	/**
	 * @func toggleClass(name)
	 * @arg name {String}
	 */
	toggleClass(name) { this.view.toggleClass(name); }
	
	/**
	 * @get style {Object}
	 */
	get style() { return this.view.style; }

	/**
	 * @get style {Object}
	 */
	set style(value) { this.view.style = value; }
	
	/**
	 * @get visible {bool}
	 */
	get visible() { return this.view.visible; }
	
	/**
	 * @get visible {bool}
	 */
	set visible(value) { this.view.visible = value; }
	
	/**
	 * @get receive {bool}
	 */
	get receive() { return this.view.receive; }
	
	/**
	 * @get receive {bool}
	 */
	set receive(value) { this.view.receive = value; }
	
	/**
	 * @overwrite native call
	 */
	triggerRemoveView(view) {
		util.assert(this.view === view);
		
		// unbind mapping
		var mapping = this.m_mapping;
		if (mapping) { 
			for ( var name in mapping ) {
				var id = mapping[name];
				if (id > 0) {
					var noticer = view['__on' + name]; //.off(name, id);
					if ( noticer ) {
						noticer.off(id);
					}
				}
				mapping[name] = 0;
			}
		}
		this.trigger('RemoveView', view);
	}

}

const event_mapping_table = {
	Keydown: 1, KeyPress: 1, KeyUp: 1, KeyEnter: 1, Back: 1, Click: 1,
	TouchStart: 1, TouchMove: 1, TouchEnd: 1, TouchCancel: 1,
	Focus: 1, Blur: 1, Highlighted: 1, FocusMove: 1, Scroll: 1,
	ActionKeyframe: 1, ActionLoop: 1,
	WaitBuffer: 1, Ready: 1, StartPlay: 1, Error: 1,
	SourceEof: 1, Pause: 1, Resume: 1, Stop: 1, Seek: 1,
};

function add_event_mapping(self, noticer, name) {

	if ( name in event_mapping_table ) { // mapping event
		var mapping = self.m_mapping;
		if (!mapping) {
			self.m_mapping = mapping = {};
		}
		
		var view = self.view;
		util.assert(view, 'View not found');
		
		var name2 = 'on' + name;

		if ( name2 in view ) { // 
			if ( !noticer ) {
				self['__on' + name] = noticer = new EventNoticer(name, this);
			}
			var trigger = self['trigger' + name];
			
			mapping[name] = view[name2].on((evt) => {
				var origin_noticer = evt.m_noticer;
				trigger.call(self, evt, 1);
				evt.m_noticer = origin_noticer;
			});

			return noticer;
		} else {
			mapping[name] = -1;
		}
	}
}

/**
 * @class ViewControllerNotification
 */
class ViewControllerNotification extends NativeNotification {
	
	/**
	 * @overwrite
	 */
	getNoticer(name) {
		
		var noticer = this['__on' + name];
		if ( ! noticer ) {
			// bind native event

			noticer = add_event_mapping(this, noticer, name);
			if ( noticer ) {
				return noticer;
			}

			var trigger = this['trigger' + name];
			
			// bind native event
			if ( trigger ) {
				// bind native
				util.addNativeEventListener(this, name, (evt, is_event) => {
					// native event
					return trigger.call(this, evt, is_event);
				}, -1);
			} else {
				// bind native
				util.addNativeEventListener(this, name, (evt, is_event) => {
					// native event
					return is_event ? noticer.triggerWithEvent(evt) : noticer.trigger(evt);
				}, -1);
			}
			this['__on' + name] = noticer = new EventNoticer(name, this);
		} else {
			var mapping = this.m_mapping;
			if ( mapping && mapping[name] ) {
				return noticer;
			}
			add_event_mapping(this, noticer, name);
		}
		return noticer;
	}

	/**
	 * @overwrite
	 */
	addDefaultListener(name, func) {
		
		if ( typeof func == 'string' ) {
			var ctr = this, func2;
			
			while (ctr) {
				func2 = ctr[func];  // find func
				if ( typeof func2 == 'function' ) {
					return this.getNoticer(name).on(func2, ctr, 0); // default id 0
				}
				ctr = ctr.parent;
			}
			throw util.err(`Cannot find a function named "${func}"`);
		} else {
			return this.getNoticer(name).on(func, 0); // default id 0
		}
	}
	
}

util.extendClass(ViewController, ViewControllerNotification);
