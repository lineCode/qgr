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

#ifndef __qgr__utils__error__
#define __qgr__utils__error__

/**
 * @ns qgr
 */

#include "qgr/utils/util.h"
#include "qgr/errno.h"

#if XX_EXCEPTIONS_SUPPORT

#define XX_THROW(code, ...) throw qgr::Error(code, __VA_ARGS__)
#define XX_ASSERT_ERR(cond, ...) if(!(cond)) throw qgr::Error(__VA_ARGS__)
#define XX_CHECK_ERR XX_ASSERT_ERR

#define XX_IGNORE_ERR(block) try block catch (const qgr::Error& err) {    \
	XX_DEBUG("%s,%s", "The exception is ignored", err.message().c());     \
}((void)0)

XX_NS(qgr)

/**
 * @class Error
 */
class XX_EXPORT Error: public Object {
 public:
	
	Error();
	Error(int code, cString& msg);
	Error(int code, cchar*, ...);
	Error(cString& msg);
	Error(cchar*, ...);
	Error(const Error& err);
	virtual ~Error();
	Error& operator=(const Error& e);
	virtual cString& message() const throw();
	virtual int code() const throw();
	void set_code(int value);
	void set_message(cString& value);
  virtual String to_string() const;

 private:
	int     m_code;
	String* m_message;
};

typedef const Error cError;

XX_END

#else

#error Exceptions must be turned on

#define XX_THROW qgr::fatal()
#define XX_ASSERT_ERR(cond, ...) if(!(cond)) qgr::fatal()
#define XX_IGNORE_ERR(block) block ((void) 0)

#endif
#endif
