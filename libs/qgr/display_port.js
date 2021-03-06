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
import 'qgr/app';
import { NativeNotification } from 'qgr/event';
export requireNative('_display_port');

/**
 * @class DisplayPort
 */
class DisplayPort extends NativeNotification {
	event onChange;
	event onOrientation;
}

/**
 * @enum Orientation
 * ORIENTATION_INVALID
 * ORIENTATION_PORTRAIT
 * ORIENTATION_LANDSCAPE
 * ORIENTATION_REVERSE_PORTRAIT
 * ORIENTATION_REVERSE_LANDSCAPE
 * ORIENTATION_USER
 * ORIENTATION_USER_PORTRAIT
 * ORIENTATION_USER_LANDSCAPE
 * ORIENTATION_USER_LOCKED
 */

/**
 * @enum StatusBarStyle
 * STATUS_BAR_STYLE_WHITE
 * STATUS_BAR_STYLE_BLACK
 */

/**
	* @class DisplayPort
	*
	* @func lockSize([width[,height]])
	* @arg [width=0] {float}
	* @arg [height=0] {float}
	*
	* width与height都设置为0时自动设置一个最舒适的默认显示尺寸
	*
	* 设置锁定视口为一个固定的逻辑尺寸,这个值改变时会触发change事件
	*
	* 如果width设置为零表示不锁定宽度,系统会自动根据height值设置一个同等比例的宽度
	* 如果设置为非零表示锁定宽度,不管displayPort_size怎么变化对于编程者来说,这个值永远保持不变
	*
	* 如果height设置为零表示不锁定,系统会自动根据width值设置一个同等比例的高度
	* 如果设置为非零表示锁定高度,不管displayPort_size怎么变化对于编程者来说,这个值永远保持不变
	*
	* @func nextFrame(cb)
	* @arg cb {Function}
	*
	* @get width {float} 
	* @get height {float} 
	* @get phyWidth {float} 
	* @get phyHeight {float} 
	* @get bestScale {float} 
	* @get scale {float} 
	* @get scaleValue {Vec2}
	* @get rootMatrix {Mat4} 
	* @get atomPixel {float} 
	*
	* @func keepScreen(keep)
	* @arg keep {bool}
	*
	* @func statusBarHeight()
	* @ret {float}
	*
	* @func setVisibleStatusBar(visible)
	* @arg visible {bool}
	*
	* @func setStatusBarStyle(style)
	* @arg style {StatusBarStyle}
	*
	* @func requestFullscreen(fullscreen)
	* @arg fullscreen {bool}
	*
	* @func orientation()
	* returns:
	*  ORIENTATION_PORTRAIT
	*  ORIENTATION_LANDSCAPE
	*  ORIENTATION_REVERSE_PORTRAIT
	*  ORIENTATION_REVERSE_LANDSCAPE
	* @ret {Orientation}
	*
	* @func setOrientation(orientation)
	* @arg orientation {Orientation}
	* 
	* @func fsp()
	* @ret {uint}
	* 
	* @end
	*/


	/**
	 * @get defaultAtomPixel {float}
	 */

util.extendClass(exports.DisplayPort, DisplayPort);

export {

	/**
	 * @get current {DisplayPort}
	 */
	get current() { return app.current.displayPort; },

	/**
	 * @get atomPixel {float}
	 */
	get atomPixel() {
		return app.current ? app.current.displayPort.atomPixel: exports.defaultAtomPixel;
	},

	/**
	 * @get statusBarHeight {float}
	 */
	get statusBarHeight() {
		return app.current ? app.current.displayPort.statusBarHeight(): exports.defaultStatusBarHeight;
	},

	/**
	 * @func nextFrame(cb)
	 * @arg cb {Function}
	 */
	nextFrame: function(cb) {
		if ( app.current ) {
			app.current.displayPort.nextFrame(cb);
		} else {
			throw new Error("GUIApplication has not been created");
		}
	},
}
