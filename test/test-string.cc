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

#include <string.h>
#include <stdio.h>
#include <iostream>
#include <string>
#include <qgr/utils/string.h>
#include <qgr/utils/codec.h>

using namespace std;
using namespace qgr;

class Str {
 private:
	char* _value;
	int _length;
 public:
 
	Str (const Str& str) {
		_length = str._length;
		_value = (char*)malloc(_length + 1);
		memcpy(_value, str._value, _length + 1);
		LOG("%s\n", "copy constructor");
	}
	Str (Str&& str) {
		_length = str._length;
		_value = str._value;
		str._value = NULL;
		LOG("%s\n", "move constructor");
	}
	Str (const char* str) {
		_length = strlen(str);
		_value = (char*)malloc(_length + 1);
		memcpy(_value, str, _length + 1);
		LOG("%s\n", "new constructor");
	}
	
	~ Str () {
		if (_value) {
			free(_value);
			_value = NULL;
		}
	}
	
	const char* c_str () const {
		return _value;
	}
	const int length () const {
		return _length;
	}
};

void test (const Str& str) {
	printf("str:%s,len:%d,add:%lu,test ok\n", str.c_str(), str.length(), str.c_str());
	LOG("");
}

void test2 (const string& str) {
	printf("str:%s,len:%d,add:%lu,test ok\n", str.c_str(), str.length(), str.c_str());
}

// const static Str s = "op";

void test_string (int argc, char **argv) {
	
	// utf8 / ucs2 / ucs4
	Ucs2String ucs2 = Coder::decoding_to_uint16(Encoding::utf8, "楚学文"); // 解码
	Ucs4String ucs4 = Coder::decoding_to_uint32(Encoding::utf8, "楚学文");
	String utf8_1 = Coder::encoding(Encoding::utf8, ucs2); // 编码
	String utf8_2 = Coder::encoding(Encoding::utf8, ucs4);
	
	LOG(ucs2.hash_code() % 10);
	LOG(ucs4.hash_code() % 10);
	LOG(utf8_1.hash_code() % 10);
	LOG(utf8_2.hash_code() % 10);
	
	LOG(ucs2[0]);
	LOG(ucs2[1]);
	LOG(ucs2[2]);
	LOG(ucs2[3]);
	LOG(ucs4[0]);
	LOG(ucs4[1]);
	LOG(ucs4[2]);
	LOG(ucs4[3]);
	LOG(utf8_1);
	LOG(utf8_2);
	
	LOG(__cplusplus);
	
	const char* c = "op";
	
	LOG(c);
	
	// Str s = "op";
	
	for (int i = 0; i < 10; i++) {
		// test(s);
		// test("op");
		test2(c);
	}
	
	const char* str = "ABCD";
	
	LOG(str);
	
	string str0 = str;
	
	for (int i = 0; i < 10; i++) {
		str0 += "u";
	}
	
	const string&& str2 = std::move(str0);
	
	string str3(str0.c_str());
	
	LOG("%u,%u\n", str0.c_str(), str3.c_str());
	
	LOG("capacity:%d,%d\n", str0.capacity(), str3.capacity());
	
	const_cast<char*>(str0.c_str())[0] = 'K';
	
	str0 = "ABCD-KKKKK";
	
	LOG("%u,%u\n", str0.c_str(), str3.c_str());
	
	LOG("capacity:%d,%d\n", str0.capacity(), str3.capacity());
	
	LOG("%s,%s\n", str0.c_str(), str3.c_str());
}
