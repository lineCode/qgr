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

Object.assign(exports, requireNative('_event'));

const _util = requireNative('_util');
const EventNoticer = exports.EventNoticer;
const PREFIX = '__on';
const REG = new RegExp('^' + PREFIX);

/**********************************************************************************/

/**
 * @class Notification
 */
class Notification {
	
	/**
	 * @func getNoticer
	 */
	getNoticer(name) {
		var noticer = this[PREFIX + name];
		if ( ! noticer ) {
			noticer = new EventNoticer(name, this);
			this[PREFIX + name] = noticer;
		}
		return noticer;
	}
	
	/**
	 * @func getNoticer
	 */
	hasNoticer(name) {
		return (PREFIX + name) in this;
	}
	
	/**
	 * @func addDefaultListener
	 */
	addDefaultListener(name, func) {
		
		if ( typeof func == 'string' ) {
			var func2 = this[func]; // find func 
			
			if ( typeof func2 == 'function' ) {
				return this.getNoticer(name).on(func2, 0); // default id 0
			} else {
				throw Error.new(`Cannot find a function named "${func}"`);
			}
		} else {
			return this.getNoticer(name).on(func, 0); // default id 0
		}
	}
	
	/**
	 * @func removeEventListener(name, listen[,scope[,id]])
	 */
	addEventListener(name, ...args) {
		return this.getNoticer(name).on(...args);
	}

	/**
	 * @func addEventListenerOnce(name, listen[,scope[,id]])
	 */
	addEventListenerOnce(name, ...args) {
		return this.getNoticer(name).once(...args);
	}

	/**
	 * @func addEventListener2(name, listen[,scope[,id]])
	 */
	addEventListener2(name, ...args) {
		return this.getNoticer(name).on2(...args);
	}

	/**
	 * @func addEventListenerOnce2(name, listen[,scope[,id]])
	 */
	addEventListenerOnce2(name, ...args) {
		return this.getNoticer(name).once2(...args);
	}

	/**
	* @func trigger 通知事监听器
	* @arg name {String}       事件名称
	* @arg data {Object}       要发送的消数据
	*/
	trigger(name, data) {
		var noticer = this[PREFIX + name];
		if (noticer) {
			return noticer.trigger(data);
		}
		return 0;
	}
	
	/**
	* @func triggerWithEvent 通知事监听器
	* @arg name {String}       事件名称
	* @arg event {Event}       Event 
	*/
	triggerWithEvent(name, event) {
		var noticer = this[PREFIX + name];
		if (noticer) {
			return noticer.triggerWithEvent(event);
		}
		return 0;
	}

	/**
	 * @func $trigger(name, event, is_event)
	 */
	$trigger(name, event, is_event) {
		var noticer = this[PREFIX + name];
		if (noticer) {
			return noticer.$trigger(event, is_event);
		}
		return 0;
	}

	/**
	 * @func removeEventListener(name,[func[,scope]])
	 */
	removeEventListener(name, ...args) {
		var noticer = this[PREFIX + name];
		if (noticer) {
			noticer.off(...args);
		}
	}
	
	/**
	 * @func removeEventListenerWithScope(scope) 卸载notification上所有与scope相关的侦听器
	 * @arg scope {Object}
	 */
	removeEventListenerWithScope(scope) {
		for ( let noticer of this.allNoticers() ) {
			noticer.off(scope);
		}
	}
	
	/**
	 * @func allNoticers() # Get all event noticer
	 * @ret {Array}
	 */
	allNoticers() {
		return allNoticers(this);
	}

}

/**
 * @fun initEvents(self) init event delegate
 * @arg self     {Object} 
 * @arg argus... {String}  event name
 */
function initEvents(self) {
	if (arguments.length == 1) {
		if (self) {
			var root = self;
			var REG = new RegExp('^' + PREFIX + '[a-zA-Z]');
			while (self !== Object.prototype) {
				for (var e of Object.getOwnPropertyNames(self)) {
					if (REG.test(e)) {
						var name = e.substr(PREFIX.length);
						if (root[PREFIX + name]) {
							return;
						} else {
							root[PREFIX + name] = new EventNoticer(name, root);
						}
					}
				}
				self = self.__proto__;
			}
		}
	} else {
		var args = Array.toArray(arguments);
		for (var i = 1, name; (name = args[i]); i++) {
			self[PREFIX + name] = new EventNoticer(name, self);
		}
	}
}

function allNoticers(notification) {
	var result = [];
	for ( var i in notification ) {
		if ( REG.test(i) ) {
			var noticer = notification[i];
			if ( noticer instanceof EventNoticer ) {
				result.push(noticer);
			}
		}
	}
	return result;
}

exports.Notification = Notification;
exports.initEvents = initEvents;
exports.allNoticers = allNoticers;

/**********************************************************************************/


/**
 * @class NativeNotification
 */
export class NativeNotification extends Notification {

	/**
	 * @overwrite
	 */
	getNoticer(name) {
		var noticer = this[PREFIX + name];
		if ( ! noticer ) {
			// bind native event
			var trigger = this['trigger' + name];
			if ( trigger ) {
				// bind native
				_util.addNativeEventListener(this, name, (evt, is_event) => {
					// native event
					//console.log('_util.addNativeEventListener', name);
					var ok = trigger.call(this, evt, is_event);
					//console.log('_util.addNativeEventListener', name, ok, String(trigger));
					return ok;
				}, -1);
			} else {
				// bind native
				_util.addNativeEventListener(this, name, (evt, is_event) => {
					// native event
					return is_event ? noticer.triggerWithEvent(evt) : noticer.trigger(evt);
				}, -1);
			}
			this[PREFIX + name] = noticer = new EventNoticer(name, this);
		}
		return noticer;
	}
	
}

 /**
	* @enum HighlightedStatus
	* HIGHLIGHTED_NORMAL = 0
	* HIGHLIGHTED_HOVER = 1
	* HIGHLIGHTED_DOWN = 2
	* @end
	*/

 /**
	* @enum ReturnValueMask
	* RETURN_VALUE_MASK_DEFAULT = (1 << 0)
	* RETURN_VALUE_MASK_BUBBLE = (1 << 1)
	* RETURN_VALUE_MASK_ALL = RETURN_VALUE_MASK_DEFAULT | RETURN_VALUE_MASK_BUBBLE
	* @end
	*/

/*
## Emun: KeyboardKeyName

键盘按键对应的按键代码

### KEYCODE_UNKNOWN          = 0
### KEYCODE_MOUSE_LEFT       = 1
### KEYCODE_MOUSE_CENTER     = 2
### KEYCODE_MOUSE_RIGHT      = 3
### KEYCODE_BACK_SPACE       = 8
### KEYCODE_TAB              = 9
### KEYCODE_CLEAR            = 12
### KEYCODE_ENTER            = 13
### KEYCODE_SHIFT            = 16
### KEYCODE_CTRL             = 17
### KEYCODE_ALT              = 18
### KEYCODE_CAPS_LOCK        = 20
### KEYCODE_ESC              = 27
### KEYCODE_SPACE            = 32
### KEYCODE_COMMAND          = 91
### KEYCODE_LEFT             = 37
### KEYCODE_UP               = 38
### KEYCODE_RIGHT            = 39
### KEYCODE_DOWN             = 40
### KEYCODE_INSERT           = 45
### KEYCODE_DELETE           = 46
### KEYCODE_PAGE_UP          = 33
### KEYCODE_PAGE_DOWN        = 34
### KEYCODE_MOVE_END         = 35
### KEYCODE_MOVE_HOME        = 36
### KEYCODE_SCROLL_LOCK      = 145
### KEYCODE_BREAK            = 19
### KEYCODE_SYSRQ            = 124
### KEYCODE_0                = 48
### KEYCODE_1                = 49
### KEYCODE_2                = 50
### KEYCODE_3                = 51
### KEYCODE_4                = 52
### KEYCODE_5                = 53
### KEYCODE_6                = 54
### KEYCODE_7                = 55
### KEYCODE_8                = 56
### KEYCODE_9                = 57
### KEYCODE_A                = 65
### KEYCODE_B                = 66
### KEYCODE_C                = 67
### KEYCODE_D                = 68
### KEYCODE_E                = 69
### KEYCODE_F                = 70
### KEYCODE_G                = 71
### KEYCODE_H                = 72
### KEYCODE_I                = 73
### KEYCODE_J                = 74
### KEYCODE_K                = 75
### KEYCODE_L                = 76
### KEYCODE_M                = 77
### KEYCODE_N                = 78
### KEYCODE_O                = 79
### KEYCODE_P                = 80
### KEYCODE_Q                = 81
### KEYCODE_R                = 82
### KEYCODE_S                = 83
### KEYCODE_T                = 84
### KEYCODE_U                = 85
### KEYCODE_V                = 86
### KEYCODE_W                = 87
### KEYCODE_X                = 88
### KEYCODE_Y                = 89
### KEYCODE_Z                = 90
### KEYCODE_NUM_LOCK         = 144
### KEYCODE_NUMPAD_0         = 96
### KEYCODE_NUMPAD_1         = 97
### KEYCODE_NUMPAD_2         = 98
### KEYCODE_NUMPAD_3         = 99
### KEYCODE_NUMPAD_4         = 100
### KEYCODE_NUMPAD_5         = 101
### KEYCODE_NUMPAD_6         = 102
### KEYCODE_NUMPAD_7         = 103
### KEYCODE_NUMPAD_8         = 104
### KEYCODE_NUMPAD_9         = 105
### KEYCODE_NUMPAD_DIVIDE    = 111
### KEYCODE_NUMPAD_MULTIPLY  = 106
### KEYCODE_NUMPAD_SUBTRACT  = 109
### KEYCODE_NUMPAD_ADD       = 107
### KEYCODE_NUMPAD_DOT       = 110
### KEYCODE_NUMPAD_ENTER     = 108
### KEYCODE_F1               = 112
### KEYCODE_F2               = 113
### KEYCODE_F3               = 114
### KEYCODE_F4               = 115
### KEYCODE_F5               = 116
### KEYCODE_F6               = 117
### KEYCODE_F7               = 118
### KEYCODE_F8               = 119
### KEYCODE_F9               = 120
### KEYCODE_F10              = 121
### KEYCODE_F11              = 122
### KEYCODE_F12              = 123
### KEYCODE_SEMICOLON        = 186
### KEYCODE_EQUALS           = 187
### KEYCODE_MINUS            = 189
### KEYCODE_COMMA            = 188
### KEYCODE_PERIOD           = 190
### KEYCODE_SLASH            = 191
### KEYCODE_GRAVE            = 192
### KEYCODE_LEFT_BRACKET     = 219
### KEYCODE_BACK_SLASH       = 220
### KEYCODE_RIGHT_BRACKET    = 221
### KEYCODE_APOSTROPHE       = 222
### KEYCODE_HOME             = 300
### KEYCODE_BACK             = 301
### KEYCODE_CALL             = 302
### KEYCODE_ENDCALL          = 303
### KEYCODE_STAR             = 304
### KEYCODE_POUND            = 305
### KEYCODE_CENTER           = 306
### KEYCODE_VOLUME_UP        = 307
### KEYCODE_VOLUME_DOWN      = 308
### KEYCODE_POWER            = 309
### KEYCODE_CAMERA           = 310
### KEYCODE_FOCUS            = 311
### KEYCODE_MENU             = 312
### KEYCODE_SEARCH           = 313
### KEYCODE_MEDIA_PLAY_PAU   = 314
### KEYCODE_MEDIA_STOP       = 315
### KEYCODE_MEDIA_NEXT       = 316
### KEYCODE_MEDIA_PREVIOUS   = 317
### KEYCODE_MEDIA_REWIND     = 318
### KEYCODE_MEDIA_FAST_FORWARD= 319
### KEYCODE_MUTE             = 320
### KEYCODE_CHANNEL_UP       = 321
### KEYCODE_CHANNEL_DOWN     = 322
### KEYCODE_MEDIA_PLAY       = 323
### KEYCODE_MEDIA_PAUSE      = 324
### KEYCODE_MEDIA_CLOSE      = 325
### KEYCODE_MEDIA_EJECT      = 326
### KEYCODE_MEDIA_RECORD     = 327
### KEYCODE_VOLUME_MUTE      = 328
### KEYCODE_MUSIC            = 329
### KEYCODE_EXPLORER         = 330
### KEYCODE_ENVELOPE         = 331
### KEYCODE_BOOKMARK         = 332
### KEYCODE_ZOOM_IN          = 333
### KEYCODE_ZOOM_OUT         = 334
### KEYCODE_HELP             = 335
*/

 /**
	* @class GUIEvent
	* @bases {Event}
	* 
	* @get origin {View*}
	*
	* @get timestamp {uint64}
	*
	* @func cancelDefault()
	*
	* @func cancelBubble()
	*
	* @get isDefault {bool}
	*
	* @get isBubble {bool}
	*
	* @end
	*/

 /**
	* @class GUIActionEvent
	* @bases {GUIEvent}
	*
	* @get action {Action*}
	*
	* @get delay {uint64}
	*
	* @get frame {uint}
	*
	* @get loop {uint}
	*
	* @end
	*/

 /**
	* @class GUIKeyEvent
	* @bases {GUIEvent}
	*
	* @get keycode {KeyboardKeyName}
	*
	* @get repeat {int}
	*
	* @get shift {bool}
	*
	* @get ctrl {bool}
	*
	* @get alt {bool}
	*
	* @get command {bool}
	*
	* @get capsLock {bool}
	*
	* @get device {int}
	*
	* @get source {int}
	*
	* @get focusMove {View*}
	*
	* @set focusMove {View*}
	*/

 /**
	* @class GUIClickEvent
	* @bases {GUIEvent}
	*
	* @get x {float}
	*
	* @get y {float}
	*
	* @get count {uint}
	*
	* @get keyboard {bool}
	*/

 /**
	* @class GUIHighlightedEvent
	* @bases {GUIEvent}
	*
	* @get status {HighlightedStatus}
	*/

 /**
	* @object GUITouch
	* id {uint}
	* startX {float}
	* startY {float}
	* x {float}
	* y {float}
	* force {float}
	* view {View*}
	*/

 /**
	* @class GUITouchEvent
	* @bases {GUIEvent}
	*
	* @get changedTouches {Array<GUITouch>}
	*/

 /**
	* @class GUIFocusMoveEvent
	* @bases {GUIEvent}
	*
	* @get focus {View*}
	*
	* @get focusMove {View*}
	*/


