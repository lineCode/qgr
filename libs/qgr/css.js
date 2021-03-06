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

export requireNative('_css');

import 'qgr/util';
import 'qgr/value';

const dev = util.dev;
const _priv = value._priv;

// Meta attribute

 /**
	* @enum PropertyName Meta attribute
	* PROPERTY_X
	* PROPERTY_Y
	* PROPERTY_SCALE_X
	* PROPERTY_SCALE_Y
	* PROPERTY_SKEW_X
	* PROPERTY_SKEW_Y
	* PROPERTY_ROTATE_Z
	* PROPERTY_ORIGIN_X
	* PROPERTY_ORIGIN_Y
	* PROPERTY_OPACITY
	* PROPERTY_VISIBLE
	* PROPERTY_WIDTH
	* PROPERTY_HEIGHT
	* PROPERTY_MARGIN_LEFT
	* PROPERTY_MARGIN_TOP
	* PROPERTY_MARGIN_RIGHT
	* PROPERTY_MARGIN_BOTTOM
	* PROPERTY_BORDER_LEFT_WIDTH
	* PROPERTY_BORDER_TOP_WIDTH
	* PROPERTY_BORDER_RIGHT_WIDTH
	* PROPERTY_BORDER_BOTTOM_WIDTH
	* PROPERTY_BORDER_LEFT_COLOR
	* PROPERTY_BORDER_TOP_COLOR
	* PROPERTY_BORDER_RIGHT_COLOR
	* PROPERTY_BORDER_BOTTOM_COLOR
	* PROPERTY_BORDER_RADIUS_LEFT_TOP
	* PROPERTY_BORDER_RADIUS_RIGHT_TOP
	* PROPERTY_BORDER_RADIUS_RIGHT_BOTTOM
	* PROPERTY_BORDER_RADIUS_LEFT_BOTTOM
	* PROPERTY_BACKGROUND_COLOR
	* PROPERTY_BACKGROUND
	* PROPERTY_NEWLINE
	* PROPERTY_CLIP
	* PROPERTY_CONTENT_ALIGN
	* PROPERTY_TEXT_ALIGN
	* PROPERTY_MAX_WIDTH
	* PROPERTY_MAX_HEIGHT
	* PROPERTY_START_X
	* PROPERTY_START_Y
	* PROPERTY_RATIO_X
	* PROPERTY_RATIO_Y
	* PROPERTY_REPEAT
	* PROPERTY_TEXT_BACKGROUND_COLOR
	* PROPERTY_TEXT_COLOR
	* PROPERTY_TEXT_SIZE
	* PROPERTY_TEXT_STYLE
	* PROPERTY_TEXT_FAMILY
	* PROPERTY_TEXT_LINE_HEIGHT
	* PROPERTY_TEXT_SHADOW
	* PROPERTY_TEXT_DECORATION
	* PROPERTY_TEXT_OVERFLOW
	* PROPERTY_TEXT_WHITE_SPACE
	* PROPERTY_ALIGN_X
	* PROPERTY_ALIGN_Y
	* PROPERTY_SHADOW
	* PROPERTY_SRC
	* @end
	*/

	// Non meta attribute

 /**
	* @enum PropertyName Non meta attribute
	* PROPERTY_TIME
	* PROPERTY_TRANSLATE
	* PROPERTY_SCALE
	* PROPERTY_SKEW
	* PROPERTY_ORIGIN
	* PROPERTY_MARGIN
	* PROPERTY_BORDER
	* PROPERTY_BORDER_WIDTH
	* PROPERTY_BORDER_COLOR
	* PROPERTY_BORDER_RADIUS
	* PROPERTY_BORDER_LEFT
	* PROPERTY_BORDER_TOP
	* PROPERTY_BORDER_RIGHT
	* PROPERTY_BORDER_BOTTOM
	* PROPERTY_MIN_WIDTH
	* PROPERTY_MIN_HEIGHT
	* PROPERTY_START
	* PROPERTY_RATIO
	* PROPERTY_BACKGROUND_IMAGE
	* PROPERTY_BACKGROUND_REPEAT
	* PROPERTY_BACKGROUND_POSITION
	* PROPERTY_BACKGROUND_POSITION_X
	* PROPERTY_BACKGROUND_POSITION_Y
	* PROPERTY_BACKGROUND_SIZE
	* PROPERTY_BACKGROUND_SIZE_X
	* PROPERTY_BACKGROUND_SIZE_Y
	* PROPERTY_ALIGN
	* @end
	*/

function parse_error_throw(val, msg, help) {
	var help_str = '';
	if (help) {
		help_str = help();
	}
	msg = msg.replace('%s', '`' + val + '`');
	if (help_str) {
		throw new TypeError(`Bad argument. ${msg}. Examples: ${help_str}`);
	} else {
		throw new TypeError(`Bad argument. ${msg}.`);
	}
}

/**
 * @func parseNumber(val, msg)
 */
export function parseNumber(val, msg) {
	if (typeof val == 'number') {
		return number;
	}
	parse_error_throw(val, msg);
}

/**
 * @func parseNumber(val, type, msg)
 */
export function parseValue(val, type, msg) {
	if (typeof val == 'string') {
		var func = value[`parse${type}`];
		var out = func(val);
		if (out) {
			return out;
		}
	} else if (val instanceof value[type]) {
		return val;
	}
	parse_error_throw(val, msg, _priv[`_parse${type}Help`]);
}

/**
 * @func create(sheets) create style sheets
 * @arg sheets {Object}
 */

/**
 * @func check(css_name)
 * @arg css_name {String}
 * @ret {bool}
 */
export function check(css_name) {
	var name = css_name.replace(/([A-Z_]+)/g, '_$1');
	if ( !('PROPERTY_' + name.toUpperCase() in exports) ) {
		console.warn( `---------- Invalid name "${css_name}" in CSS style sheet ` );
		return false;
	}
	return true;
}

/**
 * @func CSS(sheets)
 * @arg sheets {Object}
 */
export function CSS(sheets) {
	if ( dev ) {
		for ( var cls in sheets ) {
			for ( var name in sheets[cls] ) {
				check(name);
			}
		}
	}
	exports.create(sheets);
}
