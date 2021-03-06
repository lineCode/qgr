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

export requireNative('_qgr');

import 'qgr/util';
import 'qgr/event';
import 'qgr/app';
import 'qgr/action';
import 'qgr/ctr';
import 'qgr/display_port';
import 'qgr/css';

/**
	* @class View
	* @class Sprite
	* @class Label
	* @class Span
	* @class TextNode
	* @class Hybrid
	* @class Button
	* @class Text
	* @class Input
	* @class Textarea
	* @class Div
	* @class Image
	* @class Limit
	* @class Indep
	* @class IndepLimit
	* @class Panel
	* @class Scroll
	* @class Root
	*/

/**
	* @func lock(func) Lock gui render thread
	*/

/**
	* @class TextFont abstract class
	* @get,set textBackgroundColor {ColorValue}
	* @get,set textColor {ColorValue}
	* @get,set textSize {TextSizeValue}
	* @get,set textStyle {TextStyleValue}
	* @get,set textFamily {TextFamilyValue}
	* @get,set textShadow {TextShadowValue}
	* @get,set textLineHeight {TextLineHeightValue}
	* @get,set textDecoration {TextDecorationValue}
	* @end
	*/

/**
	* @class TextLayout abstract class
	* @bases TextFont
	* @get,set textOverflow {TextOverflowValue}
	* @get,set textWhiteSpace {TextWhiteSpaceValue}
	* @end
	*/

/**
	* @class View
	*/
class View extends event.NativeNotification {
	
	// @events
	event onKeyDown;
	event onKeyPress;
	event onKeyUp;
	event onKeyEnter;
	event onBack;
	event onClick;
	event onTouchStart;
	event onTouchMove;
	event onTouchEnd;
	event onTouchCancel;
	event onMouseOver;
	event onMouseOut;
	event onMouseLeave;
	event onMouseEnter;
	event onMouseMove;
	event onMouseDown;
	event onMouseUp;
	event onMouseWheel;
	event onFocus;
	event onBlur;
	event onHighlighted;
	event onActionKeyframe;
	event onActionLoop;
	event onRemoveView;
	
	/**
	 * @overwrite
	 */
	addDefaultListener(name, func) {
		if ( typeof func == 'string' ) {
			// find func 
			var func2 = this[func];
			if ( typeof func2 == 'function' ) {
				return this.getNoticer(name).on(func2, 0); // default id 0
			} else {
				var ctr = this.controller;
				if ( !ctr ) {
					ctr = this.owner; // top view ctr
				}
				while (ctr) {
					func2 = ctr[func];
					if ( typeof func2 == 'function' ) {
						return this.getNoticer(name).on(func2, ctr, 0); // default id 0
					}
					ctr = ctr.parent;
				}
				throw util.err(`Cannot find a function named "${func}"`);
			}
		} else {
			return this.getNoticer(name).on(func, 0); // default id 0
		}
	}
	
	/**
	 * @get action {Action}
	 */
	get action() { // get action object
		return this.getAction(); 
	}

	/**
	 * @set action {Action}
	 */
	set action(value) { // set action
		this.setAction(action.create(value));
	}
	
	/**
	 * @func transition(style[,delay[,cb]][,cb])
	 * @arg style {Object}
	 * @arg [delay] {uint} ms
	 * @arg [cb] {Funcion}
	 * @ret {KeyframeAction}
	 */
	transition(style, delay, cb) { // transition animate
		return action.transition(this, style, delay, cb);
	}
	
	/**
	 * @func show()
	 */
	show() {
		this.visible = true;
	}

	/**
	 * @func hide()
	 */
	hide() {
		this.visible = false; 
	}
}

/**
	* @class View
	*
	* @constructor() 
	*
	* @func prepend(child) 
	* @arg child {View}
	*
	* @func append(child)
	* @arg child {View}
	*
	* @func appendText(text)
	* @arg text {String}
	* @ret {View}
	*
	* @func appendTo(parent)
	* @arg parent {View}
	*
	* @func before(prev)
	* @arg prev {View}
	*
	* @func after(next)
	* @arg next {View}
	*  
	* @func moveToBefore();
	*  
	* @func moveToAfter();
	*
	* @func moveToFirst();
	*
	* @func moveToLast();
	*
	* @func remove()
	*
	* @func removeAllChild()
	*
	* @func focus()
	* @ret {bool}
	*
	* @func blur()
	* @ret {bool}
	*
	* @func layoutOffset()
	* @ret {Vec2}
	*
	* @func layoutOffsetFrom([upper])
	* @arg [upper=parent] {View}
	* @ret {Vec2}
	*
	* @func children(index)
	* @arg index {uint}
	* @ret {View}
	*
	* @func getAction()
	* @ret {Action}
	*
	* @func setAction(action)
	* @arg action {Action}
	*
	* @func screenRect()
	* @ret {Rect}
	*
	* @func finalMatrix()
	* @ret {Mat}
	*
	* @func finalOpacity()
	* @ret {float}
	*
	* @func position()
	* @ret {Vec2}
	*
	* @func overlapTest(point)
	* @arg point {Vec2}
	* @ret {bool}
	*
	* @func addClass(name)
	* @arg name {String}
	*
	* @func removeClass(name)
	* @arg name {String}
	*
	* @func toggleClass(name)
	* @arg name {String}
	*
	* @func firstButton()
	* @ret {Button}
	*
	* @func hasChild(view)
	* @ret {bool}
	*
	* @get childrenCount {uint}
	* @get,set innerText {String}
	* @get,set id {String}
	* @get controller {ViewController}
	* @get ctr {ViewController}
	* @get top {View}
	* @get owner {ViewController}
	* @get parent {View}
	* @get prev {View}
	* @get next {View}
	* @get first {View}
	* @get last {View}
	* @get,set x {float}
	* @get,set y {float}
	* @get,set scaleX {float}
	* @get,set scaleY {float}
	* @get,set rotateZ {float}
	* @get,set skewX {float}
	* @get,set skewY {float}
	* @get,set opacity {float}
	* @get,set visible {bool}
	* @get finalVisible {bool}
	* @get screenVisible {bool}
	* @get,set translate {Vec2}
	* @get,set scale {Vec2}
	* @get,set skew {Vec2}
	* @get,set originX {float}
	* @get,set originY {float}
	* @get,set origin {Vec2}
	* @get matrix {Mat}
	* @get level {uint}
	* @get,set needDraw {bool}
	* @get,set receive {bool}
	* @get,set isFocus {bool}
	* @get viewType {uint}
	* @get,set style {Object}
	* @get class {Object}
	* @set class {String}
	* @end
	*/

/**
	* @class Sprite
	* @bases View
	* @get,set src {String}
	* @get,set width {float}
	* @get,set height {float}
	* @get,set start {Vec2}
	* @get,set startX {float}
	* @get,set startY {float}
	* @get,set ratio {Vec2}
	* @get,set ratioX {float}
	* @get,set ratioY {float}
	* @get,set repeat {Repeat}
	* @end
	*/

/**
	* @class Label
	* @bases View, TextFont
	*  @get length {uint}
	*  @get,set value {String}
	*  @get textBaseline {String}
	*  @get textHeight {float}
	*  @get,set textAlign {TextAlign}
	* @end
	*/

/**
	* @class Layout abstract class
	* @bases View
	* @get clientWidth {float}
	* @get clientHeight {float}
	* @end 
	*/

/**
	* @class Span
	* @bases Layout, TextLayout
	* @end
	*/

/**
	* @class TextNode
	* @bases Span
	* @get length {uint}
	* @get,set value {String}
	* @get textBaseline {float}
	* @get textHeight {float}
	* @end
	*/

/**
	* @class Box abstract class
	* @bases Layout
	* @get,set width {Value}
	* @get,set height {Value}
	* @get,set marginLeft {Value}
	* @get,set marginTop {Value}
	* @get,set marginRight {Value}
	* @get,set marginBottom {Value}
	* @get,set borderLeft {Border}
	* @get,set borderTop {Border}
	* @get,set borderRight {Border}
	* @get,set borderBottom {Border}
	* @get,set borderLeftWidth {float}
	* @get,set borderTopWidth {float}
	* @get,set borderRightWidth {float}
	* @get,set borderBottomWidth {float}
	* @get,set borderLeftColor {Color}
	* @get,set borderTopColor {Color}
	* @get,set borderRightColor {Color}
	* @get,set borderBottomColor {Color}
	* @get,set borderRadiusLeftTop {float}
	* @get,set borderRadiusRightTop {float}
	* @get,set borderRadiusRightBottom {float}
	* @get,set borderRadiusLeftBottom {float}
	* @get,set backgroundColor {Color}
	* @get,set background {Background}
	* @get,set backgroundImage {String}
	* @get,set backgroundPosition {BackgroundPosition}
	* @get,set backgroundPositionX {BackgroundPosition}
	* @get,set backgroundPositionY {BackgroundPosition}
	* @get,set backgroundSize {BackgroundSize}
	* @get,set backgroundSizeX {BackgroundSize}
	* @get,set backgroundSizeY {BackgroundSize}
	* @get,set newline {bool}
	* @get,set clip {bool}
	* @get finalWidth {float}
	* @get finalHeight {float}
	* @get finalMarginLeft {float}
	* @get finalMarginTop {float}
	* @get finalMarginRight {float}
	* @get finalMarginBottom {float}
	* @set margin {Value}
	* @set border {Border}
	* @set borderWidth {float}
	* @set borderColor {Color}
	* @set borderRadius {float}
	* @end
	*/

/**
 * @class Div
 * @bases Box
 *  @get,set contentAlign {ContentAlign}
 * @end
 */

/**
 * @class Hybrid
 * @bases Box, TextLayout
 *  @get,set textAlign {TextAlign}
 * @end
 */

/**
 * @class Limit
 * @bases Div
 *  @get,set minWidth {Value}
 *  @get,set minHeight {Value}
 *  @get,set maxWidth {Value}
 *  @get,set maxHeight {Value}
 */

/**
 * @class Indep
 * @bases Div
 *  @get,set alignX {Align}
 *  @get,set alignY {Align}
 *  @get,set align {Align}
 * @end
 */
 
/**
 * @class LimitIndep
 * @bases Indep
 *  @get,set minWidth {Value}
 *  @get,set minHeight {Value}
 *  @get,set maxWidth {Value}
 *  @get,set maxHeight {Value}
 */

/**
 * @class Image
 * @bases Div
 *  @get,set src {String}
 *  @get sourceWidth {uint}
 *  @get sourceHeight {uint}
 * @end
 */

 /**
	* @class Panel
	*/
class Panel {
	event onFocusMove;
}

 /**
	* @class Panel
	* @bases Div
	*
	* @get,set allowLeave {bool}
	* @get,set allowEntry {bool}
	* @get,set intervalTime {uint} ms
	* @get,set enableSwitch {bool}
	* @get isActivity {bool}
	* @get parentPanel {Pabel}
	* @end
	*/

/**
 * @class Root
 * @bases Panel
 */

/**
	* @class BasicScroll
	*
	* @func scrollTo(scroll[,duration[,curve]])
	* @arg scroll {Vec2}
	* @arg [duration] {uint} ms
	* @arg [curve] {Curve}
	*
	* @func terminate()
	*
	* @get,set scroll {Vec2}
	* @get,set scrollX {float}
	* @get,set scrollY {float}
	* @get,set scrollWidth {float}
	* @get,set scrollHeight {float}
	* @get,set scrollbar {bool}
	* @get,set resistance {float} 0.5-...
	* @get,set bounce {bool}
	* @get,set bounceLock {bool}
	* @get,set momentum {bool}
	* @get,set lockDirection {bool}
	* @get,set catchPositionX {float}
	* @get,set catchPositionY {float}
	* @get,set scrollbarColor {Color}
	* @get hScrollbar {bool}
	* @get vScrollbar {bool}
	* @get,set scrollbarWidth {float}
	* @get,set scrollbarMargin {float}
	* @get,set defaultScrollDuration {uint} ms
	* @get,set defaultScrollCurve {Curve}
	* 
	* @end
	*/

 /**
	* @class Scroll
	*/
class Scroll {
	event onScroll;
}

/**
	* @class Scroll
	* @bases Panel,BasicScroll
	*
	* @get,set focusMarginLeft {float}
	* @get,set focusMarginRight {float}
	* @get,set focusMarginTop {float}
	* @get,set focusMarginBottom {float}
	* @get,set focusAlignX {Align}
	* @get,set focusAlignY {Align}
	* @get,set enableFocusAlign {bool}
	* @get,set enableFixedScrollSize {Vec2}
	* @end
	*/

/**
	* @class Button
	* @bases Hybrid
	*/
export class Button extends exports.Button {
	
	m_defaultHighlighted = true;
	
	/**
	 * @overwrite
	 */
	getNoticer(name) { 
		var noticer = this['__on' + name];
		if ( ! noticer ) {
			if ( name == 'Click' ) {
				super.getNoticer('Highlighted'); // bind highlighted
			}
			return super.getNoticer(name);
		}
		return noticer;
	}
	
	/**
	 * @get defaultHighlighted {bool}
	 */
	get defaultHighlighted() {
		return this.m_defaultHighlighted; 
	}
	
	/**
	 * @set defaultHighlighted {bool}
	 */
	set defaultHighlighted(value) {
		this.m_defaultHighlighted = !!value; 
	}
	
	/**
	 * @func setHighlighted(status)
	 * @arg status {HighlightedStatus}
	 */
	setHighlighted(status) {
		if ( this.m_defaultHighlighted ) {
			if ( status == event.HIGHLIGHTED_HOVER ) {
				this.transition({ opacity: 0.7, time: 80 });
			} else if ( status == event.HIGHLIGHTED_DOWN ) {
				this.transition({ opacity: 0.35, time: 50 });
			} else {
				this.transition({ opacity: 1, time: 180 });
			}
		}
	}
	
	/**
	 * @overwrite
	 */
	triggerHighlighted(evt) {
		this.setHighlighted(evt.status);
		return this.triggerWithEvent('Highlighted', evt);
	}
}

/**
	* @class Button
	* @bases Hybrid
	*
	* @func findNextButton(direction)
	* @arg direction {Direction}
	* @ret {Button}
	* 
	* @get panel {Panel}
	* @end
	*/

/**
	* @class Text
	* @bases Hybrid
	* @get length {uint}
	* @get value {uint}
	* @get textHoriBearing {float}
	* @get textHeight {float}
	* @end
	*/

/**
	* @class Input
	* @bases Text
	* @get,set type {KeyboardType}
	* @get,set returnType {KeyboardReturnType}
	* @get,set placeholder {String}
	* @get,set placeholderColor {Color}
	* @get,set security {bool}
	* @get,set textMargin {float}
	* @end
	*/

/**
	* @class Textarea
	* @bases Input, BasicScroll
	* @end
	*/

util.extendClass(exports.View, View);
util.extendClass(exports.Panel, Panel);
util.extendClass(exports.Scroll, Scroll);

/**
 * @class Clip
 * @extends Div
 */
export class Clip extends exports.Div {
	constructor() {
		super();
		this.clip = true;
	}
}

export {

	/**
	 * @class GUIApplication
	 */
	GUIApplication: app.GUIApplication,

	/**
	 * @class ViewController
	 */
	ViewController: ctr.ViewController,

	/**
	 * @func nextFrame(cb)
	 * @arg cb {Function}
	 */
	nextFrame: display_port.nextFrame,

	/**
	 * @func New(vx[,parent[,...args]][,...args])
	 * @arg vx {Object}
	 * @arg [parent] {View}
	 * @arg [...args]
	 * @ret {View|ViewController}
	 */
	New: ctr.New,

	/**
	 * @func CSS(sheets)
	 * @arg sheets {Object}
	 */
	CSS: css.CSS,

	/**
	 * @get app {GUIApplication} get current application object
	 */
	get app() { return app.current },

	/**
	 * @get root {Root} get current root view
	 */
	get root() { return app.root },

	/**
	 * @get rootCtr {ViewController} get current root view controller
	 */
	get rootCtr() { return app.rootCtr },

	/**
	 * @get displayPort {DisplayPort} get current display port
	 */
	get displayPort() { return app.current.displayPort },

	/**
	 * @get atomPixel {float}
	 */
	get atomPixel() { return display_port.atomPixel },

	/**
	 * @get statusBarHeight {float}
	 */
	get statusBarHeight() { return display_port.statusBarHeight },
	
	EMPTY_VIEW_XML: ctr.EMPTY_VIEW_XML,   // vx
	isEmptyViewXml: ctr.isEmptyViewXml, // func
	isViewXml: ctr.isViewXml, // func
};
