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

var util = require('qgr/util');
var reader = require('qgr/reader');
var parse_keys = requireNative('_keys').parse;

function write_data(self, value) {
	self.m_out.push(
		new Array(self.m_indent * 2 + 1).join(' ') + 
		self.m_cur_name + ' ' + value);
}

function stringify_obj(self, value) {
	for (var name in value) {
		util.assert(/^\@?[\w\$\_\-\.]+$/.test(name), 'Key Illegal characters');
		self.m_cur_name = name;
		stringify(self, value[name]);
	}
}

function stringify_arr(self, value) {
	for (var i = 0; i < value.length; i++) {
		self.m_cur_name = ',';
		stringify(self, value[i]);
	}
}

function stringify(self, value) {
	var m = { '\n': '\\n', "'": "\\'" };
	var is_space = false;
	
	switch (typeof value) {
		case 'string':
			value = value.replace(/[\n\'\s]/g, function (a) {
				var rev = m[a];
				if (rev) return rev;
				is_space = true;
				return a;
			});
			if (is_space) {
				write_data(self, "'" + value + "'");
			} else {
				write_data(self, value);
			}
			break;
		case 'number': 
			write_data(self, isFinite(value) ? String(value) : 'null');
			break;
		case 'boolean': 
			write_data(self, value.toString());
			break;
		case 'object': 
			if (!value) {
				write_data(self, 'null');
				break;
			}
			
			if (value instanceof Date) {
				var year = value.getUTCFullYear();
				var month = value.getUTCMonth() + 1;
				var date = value.getUTCDate();
				var hours = value.getUTCHours();
				var minutes = value.getUTCMinutes();
				var seconds = value.getUTCSeconds();
				var milliseconds = value.getUTCMilliseconds();
				write_data(self, year + '-' +
					(month < 10 ? '0' : '') + month + '-' +
					(date < 10 ? '0' : '') + date + 'T' +
					(hours < 10 ? '0' : '') + hours + ':' +
					(minutes < 10 ? '0' : '') + minutes + ':' +
					(seconds < 10 ? '0' : '') + seconds + '.' +
					milliseconds + "Z");
				break;
			}
			
			write_data(self, '');
			self.m_indent++;
			
			if (Array.isArray(value)) {
				stringify_arr(self, value);
			} else {
				stringify_obj(self, value);
			}
			self.m_indent--;
			break;
		default:
			write_data(self, 'null');
			break;
	}
}

/**
 * @class StringParser
 * @private
 */
class StringParser {
	// m_indent = 0;
	// m_out = null;
	// m_cur_name = '';
	// @public:
	stringify(value) {
		
		util.assert(value && typeof value == 'object', 'Data must be object or array');
		
		this.m_indent = 0;
		this.m_out = [ ];
		
		if (Array.isArray(value)) {
			stringify_arr(this, value);
		} else {
			stringify_obj(this, value);
		}
		return this.m_out.join('\n');
	}
}

StringParser.prototype.m_indent = 0;
StringParser.prototype.m_out = null;
StringParser.prototype.m_cur_name = '';

module.exports = {

	/**
	 * @fun parseFile # 解析文件
	 * @ret {Object}
	 */
	parseFile: function(path) {
		return parse_keys( reader.readFileSync(path, 'utf8') );
	},

	/**
	 * @fun parse # 解析keys字符串
	 * @ret {Object}
	 */
	parse: function(str) {
		return parse_keys(str);
	},

	/**
	 * @fun stringify # 转换对像为keys格式字符串
	 * @arg value {Object}
	 * @ret {String}
	 */
	stringify: function(value) {
		return new StringParser().stringify(value);
	},
}
