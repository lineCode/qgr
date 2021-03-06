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

export requireNative('_action');

import 'qgr/util';
import 'qgr/value';

const { Action, SpawnAction, SequenceAction, KeyframeAction } = exports;

 /**
	* @class Frame
	*
	* @func fetch([view]) fetch style attribute by view
	* @arg [view] {View}
	*
	* @func flush() flush frame restore default values
	*
	* @get index {uint} frame index in action
	* @get,set time {uint} ms
	* @get host {KeyframeAction}
	* @get,set curve {Curve}
	* @get,set width {Value|float}
	* @get,set height {Value|float}
	* @get,set x {float}
	* @get,set y {float}
	* @get,set scaleX {float}
	* @get,set scaleY {float}
	* @get,set skewX {float}
	* @get,set skewY {float}
	* @get,set originX {float}
	* @get,set originY {float}
	* @get,set rotateZ {float}
	* @get,set opacity {float}
	* @get,set visible {bool}
	* @get,set marginLeft {Value}
	* @get,set marginTop {Value}
	* @get,set marginRight {Value}
	* @get,set marginBottom {Value}
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
	* @get,set contentAlign {ContentAlign}
	* @get,set textAlign {TextAlign}
	* @get,set maxWidth {Value}
	* @get,set maxHeight {Value}
	* @get,set startX {float}
	* @get,set startY {float}
	* @get,set ratioX {float}
	* @get,set ratioY {float}
	* @get,set repeat {Repeat}
	* @get,set textBackgroundColor {TextColor}
	* @get,set textColor {TextColor}
	* @get,set textSize {TextSize}
	* @get,set textStyle {TextStyle}
	* @get,set textFamily {TextFamily}
	* @get,set textLineHeight {TextLineHeight}
	* @get,set textShadow {TextShadow}
	* @get,set textDecoration {TextDecoration}
	* @get,set textOverflow {TextOverflow}
	* @get,set textWhiteSpace {TextWhiteSpace}
	* @get,set alignX {Align}
	* @get,set alignY {Align}
	* @get,set align {Align}
	* @get,set shadow {ShadowValue}
	* @get,set src {String}
	* @get,set translate {Vec2}
	* @get,set scale {Vec2}
	* @get,set skew {Vec2}
	* @get,set origin {Vec2}
	* @get,set margin {Value}
	* @get,set border {Border}
	* @get,set borderLeft {Border}
	* @get,set borderTop {Border}
	* @get,set borderRight {Border}
	* @get,set borderBottom {Border}
	* @get,set borderWidth {float}
	* @get,set borderColor {Color}
	* @get,set borderRadius {float}
	* @get,set minWidth {Value}
	* @get,set minHeight {Value}
	* @get,set start {Vec2}
	* @get,set ratio {Vec2}
	*
	* @end
	*/

 /**
	* LINEAR = 0
	* EASE = 1
	* EASE_IN = 2
	* EASE_OUT = 3
	* EASE_IN_OUT = 4
	*/

 /**
	* @func create(json[,parent])
	* @arg json {Object|Action}
	* @arg [parent] {GroupAction}
	* @ret {Action}  
	*/
export function create(json, parent) {
	var action = null;
	if ( typeof json == 'object' ) {
		if ( json instanceof Action ) {
			action = json;
		} else {
			// create
			if ( Array.isArray(json) ) { // KeyframeAction
				action = new KeyframeAction();
				for (var i of json)
					action.add(i);
			} else {
				if (json.seq) { // SequenceAction
					action = new SequenceAction();
					for (var i in json) 
						action[i] = json[i];
					var seq = json.seq;
					if (Array.isArray(seq)) {
						for (var i of seq) {
							create(i, action);
						}
					} else {
						create(seq, action);
					}
				} else if (json.spawn) { // SpawnAction
					action = new SpawnAction();
					for (var i in json) 
						action[i] = json[i];
					var spawn = json.spawn;
					if (Array.isArray(spawn)) {
						for (var i of spawn) {
							create(i, action);
						}
					} else {
						create(spawn, action);
					}
				} else { // KeyframeAction
					action = new KeyframeAction();
					for (var i in json) 
						action[i] = json[i];
					var frame = json.keyframe;
					if ( Array.isArray(frame) ) {
						for (var i of frame) 
							action.add(i);
					} else {
						action.add(frame);
					}
				}
			}
			// end craete
		}
		if ( parent ) { // Cannot be KeyframeAction type
			parent.append(action);
		}
	}
	return action;
}

 /**
	* @func transition(view,style[,delay[,cb]][,cb])
	* @arg view 	{View}
	* @arg style  {Object}
	* @arg [delay]  {uint} ms
	* @arg [cb]     {Function}
	* @ret {KeyframeAction}
	*/
export function transition(view, style, delay, cb) {
	var action = new KeyframeAction();
	if ( typeof delay == 'number' ) {
		action.delay = delay;
	} else if ( typeof delay == 'function' ) {
		cb = delay;
	}
	action.add(); // add frame 0
	action.add(style); // add frame 1
	view.setAction(action);
	action.frame(0).fetch(); // fetch 0 frame style

	if ( typeof cb == 'function' ) {
		view.onActionKeyframe.on(function(evt) {
			//console.log('onActionKeyframe');
			if ( evt.action === action ) {
				if (evt.frame != 1) return;
				cb(evt); // end
			}
			view.onActionKeyframe.off(-1);
		}, -1);
	}

	action.play(); // start play
	return action;
}

 /**
	* @class Action abstract class
	*
	* @func play()
	*
	* @func stop()
	*
	* @func seek(ms)
	* @arg ms {int}
	*
	* @func seekPlay(ms)
	* @arg ms {int}
	*
	* @func seekStop(ms)
	* @arg ms {int}
	*
	* @func clear()
	*
	* @get,set loop {int}
	*
	* @get loopd {uint}
	*
	* @get,set delay {uint} ms
	*
	* @get delayd {uint} ms
	*
	* @get,set speed {float} 0.1-10
	*
	* @get,set playing {bool}
	*
	* @get duration {uint} ms
	*
	* @get parent {Action}
	*
	* @end
	*/

 /**
	* @class GroupAction  abstract class
	* @bases Action
	*
	* @get length {uint}
	*
	* @func append(child)
	* @arg child {Action}
	*
	* @func insert(index, child)
	* @arg index {uint}
	* @arg child {Action}
	*
	* @func removeChild(index)
	* @arg index {uint}
	*
	* @func children(index)
	* @arg index {uint}
	* @ret {Action} return child action
	*
	* @end
	*/

 /**
	* @class SpawnAction
	*
	* @func spawn(index)
	* @arg index {uint}
	* @ret {Action} return child action
	*
	* @bases GroupAction
	*/

 /**
	* @class SequenceAction
	*
	* @func seq(index)
	* @arg index {uint}
	* @ret {Action} return child action
	*
	* @bases GroupAction
	*/

 /**
	* @class KeyframeAction
	* @bases Action
	*
	* @func hasProperty(name)
	* @arg name {emun PropertyName} 
	* @ret {bool}
	*
	* @func matchProperty(name)
	* @arg name {emun PropertyName} 
	* @ret {bool}
	*
	* @func frame(index)
	* @arg index {uint}
	* @ret {Frame}
	*
	* @func add([time[,curve]][style])
	* arg [time=0] {uint}
	* arg [curve] {Curve}
	* arg [style] {Object}
	* @ret {Frame}
	*
	* @get first {Frame}
	*
	* @get last {Frame}
	*
	* @get length {uint}
	*
	* @get position {int} get play frame position
	*
	* @get time {uint} ms get play time position
	*
	* @end
	*/
