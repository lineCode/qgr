/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2015, xuewen.chu
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

import { 
	ViewController, Div, Hybrid, New, 
	Text, TextNode, Label, isViewXml, EMPTY_VIEW_XML
} from 'qgr/qgr';

function get_child_text_type(vx) {
	if ( isViewXml(vx, Div) ) {
		return Text;
	} else if ( isViewXml(vx, Hybrid) ) {
		return TextNode;
	} else {
		return Label;
	}
}

/**
 * @class List
 */
export class List extends ViewController {
	
	m_item_vx = '';
	m_data = null;
	m_items = null;
	
	/**
	 * @func item
	 */
	item(index) { return this.m_items[index] || null }
	
	/**
	 * @get length 
	 */
	get length() { return this.m_data.length }
	
	/**
	 * @get data
	 */
	get data() { return this.m_data }
	
	/**
	 * @set data
	 */
	set data(value) {
		if ( !Array.isArray(value) ) {
			throw new Error('Bad argument.');
		}
		
		this.view.removeAllChild();
		this.m_data = value;
		this.m_items = [];
		
		var view = this.view;

		value.forEach((item, i)=>{
			item.$index = i;
			this.m_items.push(New(<vx:this.m_item_vx vdata=item />, view));
		})
	}
	
	/**
	 * @constructor
	 */
	constructor() {
		super();
		this.m_data = [];
		this.m_items = [];
	}
	
	/**
	 * @overwrite
	 */
	loadView(vx) {
		var {vx:type,v} = vx;

		if ( type === 0 ) { // data bind
			var [,,childs] = v;
			// view xml
			var item_vx = childs[0] || EMPTY_VIEW_XML;
			var test_vx = item_vx;

			if ( item_vx[0] == 3 ) { // data bind
				// test data bind
				let exec = item_vx[1];
				test_vx = exec({}, this);
			}
			
			// data template need is the view controller
			if ( isViewXml(test_vx) ) {
				if ( !isViewXml(test_vx, ViewController) ) {
					item_vx = <ViewController>${item_vx}</ViewController>
				}
			} else {
				var TextType = get_child_text_type(vx);
				item_vx = <ViewController><TextType>${item_vx}</TextType></ViewController>
			}
			
			this.m_item_vx = item_vx;
			
			vx = { vx: 0, v: v.slice() };
			vx.v[2] = []; /*ignore child views*/
			super.loadView(vx);
		} else {
			throw new TypeError('Bad argument. list controller view xml type error');
		}
	}

	push(item) {
		item.$index = this.m_data.length;
		this.m_data.push(item);
		this.m_items.push(New(<vx:this.m_item_vx vdata=item />, this.view));
	}
	
	pop() {
		if ( this.m_data.length ) {
			this.m_data.pop();
			this.m_items.pop().remove();
		}
	}
	
	shift() {
		if ( this.m_data.length ) {
			this.m_data.shift();
			this.m_items.shift().remove();
		}
	}
	
	unshift(item) {
		item.$index = 0;
		this.m_data.unshift(item);
		this.m_items.unshift(New(<vx:this.m_item_vx vdata=item />));
		this.view.prepend(this.m_items[0]);
	}
	
	splice(index, length, ...data) {
		var begin = Math.min(Math.max(0, index), this.m_items.length);
		var end = Math.min(Math.max(0, begin + length), this.m_items.length);

		for ( index = begin; index < end; index++ ) {
			data[index].$index = index;
			this.m_items[index].remove();
		}
		
		var views = [];
		var prev = this.m_items[begin - 1] || null;

		for ( var i of data ) {
			var view = New(<vx:this.m_item_vx vdata=i />);

			if ( prev ) {
				prev.after(view);
			} else {
				this.view.prepend(view);
			}
			views.push(view);
			prev = view;
		}

		this.m_data.splice(begin, end - begin, ...data);
		this.m_items.splice(begin, end - begin, ...views);
	}
	
}
