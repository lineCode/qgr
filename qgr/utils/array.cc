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

#include "qgr/utils/array.h"
#include "qgr/utils/array.cc.inl"

XX_NS(qgr)

XX_DEF_ARRAY_SPECIAL_IMPLEMENTATION(char, Container);
XX_DEF_ARRAY_SPECIAL_IMPLEMENTATION(byte, Container);
XX_DEF_ARRAY_SPECIAL_IMPLEMENTATION(int16, Container);
XX_DEF_ARRAY_SPECIAL_IMPLEMENTATION(uint16, Container);
XX_DEF_ARRAY_SPECIAL_IMPLEMENTATION(int, Container);
XX_DEF_ARRAY_SPECIAL_IMPLEMENTATION(uint, Container);
XX_DEF_ARRAY_SPECIAL_IMPLEMENTATION(int64, Container);
XX_DEF_ARRAY_SPECIAL_IMPLEMENTATION(uint64, Container);
XX_DEF_ARRAY_SPECIAL_IMPLEMENTATION(float, Container);
XX_DEF_ARRAY_SPECIAL_IMPLEMENTATION(double, Container);
XX_DEF_ARRAY_SPECIAL_IMPLEMENTATION(bool, Container);

XX_END
