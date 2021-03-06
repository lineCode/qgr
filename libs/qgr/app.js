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

import 'qgr/util';
import 'qgr/display_port';
import { NativeNotification } from 'qgr/event';
import { ViewController, isViewXml, EMPTY_VIEW_XML } from 'qgr/ctr';

var _qgr = requireNative('_qgr');
var Root = _qgr.Root;
var cur = null;
var cur_root = null;
var cur_root_ctr = null;

function start(self, vx) {
	var [tag,attrs,childs,vdata] = vx.v;
	cur_root_ctr = new tag();
	
	if (vdata) {
		cur_root_ctr.vdata = vdata;
	}
	
	if (childs.length) {
		cur_root_ctr.loadView(...childs);
	} else {
		cur_root_ctr.loadView(EMPTY_VIEW_XML);
	}
	
	cur_root = cur_root_ctr.view;
	
	util.assert(cur_root instanceof Root, 
		'Bad vx data. Root controller view must be Root');

	// TODO set view controller arts
	for (var attr of attrs) {
		util.set(attr[0], attr[2], cur_root_ctr); // none bind data
	}
}

 /**
	* @class NativeGUIApplication
	*
	* @constructor([options])
	* @arg [options] {Object} { anisotropic {bool}, mipmap {bool}, multisample {0-4} }
	*
	* @func clear() clear gui application resources
	*
	* @func openUrl(url)
	* @arg url {String}
	*
	* @func sendEmail(recipient[,subject[,cc[,bcc[,body]]]])
	* @arg recipient {String}
	* @arg subject {String}
	* @arg [cc] {String}
	* @arg [bcc] {String}
	* @arg [body] {String}
	*
	* @func maxTextureMemoryLimit()
	* @ret {uint64}
	*
	* @func setMaxTextureMemoryLimit(limit)
	* @arg limit {uint64}
	*
	* @func usedTextureMemory()
	* @ret {uint64}
	*
	* @get isLoad {bool}
	* @get displayPort {DisplayPort}
	* @get root {Root}
	* @get focusView {View}
	* @get,set defaultTextBackgroundColor {TextColor}
	* @get,set defaultTextColor {TextColor}
	* @get,set defaultTextSize {TextSize}
	* @get,set defaultTextStyle {TextStyle}
	* @get,set defaultTextFamily {TextFamily}
	* @get,set defaultTextShadow {TextShadow}
	* @get,set defaultTextLineHeight {TextLineHeight}
	* @get,set defaultTextDecoration {TextDecoration}
	* @get,set defaultTextOverflow {TextOverflow}
	* @get,set defaultTextWhiteSpace {TextWhiteSpace}
	*
	* @end
	*/

/**
 * @class GUIApplication
 * @bases NativeGUIApplication,NativeNotification
 */
export class GUIApplication extends _qgr.NativeGUIApplication {
	
	event onLoad;
	event onUnload;
	event onBackground;
	event onForeground;
	event onPause;
	event onResume;
	event onMemoryWarning;
	
	/**
	 * @constructor([options])
	 * @arg [options] {Object} { anisotropic {bool}, multisample {0-4} }
	 */
	constructor(options) {
		super(options);
		cur = this;
	}
	
	/**
	 * @func start(vx)
	 * @arg vx {Object}
	 */
	start(vx) {
		util.assert(isViewXml(vx), 'Bad argument.');
		var [tag] = vx.v;
		
		if (util.equalsClass(Root, tag)) {
			if ( this.isLoad ) {
				qgr.lock(()=>{
					cur_root_ctr = new ViewController();
					cur_root_ctr.loadView(vx);
					cur_root = cur_root_ctr.view;
				});
			} else {
				this.onLoad.on(()=>{
					cur_root_ctr = new ViewController();
					cur_root_ctr.loadView(vx);
					cur_root = cur_root_ctr.view;
				});
			}
		}
		else if (util.equalsClass(ViewController, tag)) {
			if ( this.isLoad ) {
				start(this, vx);
			} else {
				this.onLoad.on(()=>{ start(this, vx) });
			}
		} else {
			throw new TypeError('Bad argument.');
		}
		return this;
	}
	
	//@end
}

util.extendClass(GUIApplication, NativeNotification);

export {

	/**
	 * @get currend {GUIApplication} 
	 */
	get current() { return cur },

	/**
	 * @get root {Root} 
	 */
	get root() { return cur_root },

	/**
	 * @get rootCtr {ViewController}
	 */
	get rootCtr() { return cur_root_ctr },
};
