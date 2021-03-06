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

#ifndef __qgr__utils__cb__
#define __qgr__utils__cb__

#include "qgr/utils/util.h"
#include "qgr/utils/error.h"
#include "qgr/utils/buffer.h"
#include "qgr/utils/handle.h"
#include <functional>

/**
 * @ns qgr
 */

XX_NS(qgr)

class PostMessage;

struct XX_EXPORT SimpleEvent {
	cError* error;
	Object* data;
	int return_value;
};

class XX_EXPORT SimpleStream {
 public:
	virtual void pause() = 0;
	virtual void resume() = 0;
};

/**
 * @class IOStreamData
 */
class XX_EXPORT IOStreamData: public Object {
 public:
	inline IOStreamData(Buffer buffer
											, bool complete = 0
											, uint id = 0
											, uint64 size = 0
											, uint64 total = 0, SimpleStream* stream = nullptr)
	: m_buffer(buffer)
	, m_complete(complete)
	, m_size(size), m_total(total), m_id(id), m_stream(stream) {
	}
	inline bool complete() const { return m_complete; }
	inline int64 size() const { return m_size; }
	inline int64 total() const { return m_total; }
	inline Buffer& buffer() { return m_buffer; }
	inline cBuffer& buffer() const { return m_buffer; }
	inline uint id() const { return m_id; }
	inline SimpleStream* stream() const { return m_stream; }
	inline void pause() { if ( m_stream ) m_stream->pause(); }
	inline void resume() { if ( m_stream ) m_stream->resume(); }
	
 private:
	Buffer    m_buffer;
	bool      m_complete;
	int64     m_size;
	int64     m_total;
	uint      m_id;
	SimpleStream* m_stream;
};

class XX_EXPORT CallbackCore: public Reference {
	XX_HIDDEN_ALL_COPY(CallbackCore);
 public:
	inline CallbackCore() { }
	virtual void call(SimpleEvent& event) const = 0;
	inline  void call() const { SimpleEvent evt = { 0,0,0 }; call(evt); }
};

template<class T> class XX_EXPORT CallbackCore2: public CallbackCore {
 public:
	inline CallbackCore2(T* ctx): m_ctx(ctx) {
		if ( T::Traits::is_reference ) {
			T::Traits::Retain(m_ctx);
		}
	}
	virtual ~CallbackCore2() {
		if ( T::Traits::is_reference ) {
			T::Traits::Release(m_ctx);
		}
	}
 protected:
	T* m_ctx;
};

template<class T = Object> class XX_EXPORT LambdaCallback: public CallbackCore2<T> {
 public:
	typedef std::function<void(SimpleEvent& evt)> Func;
	inline LambdaCallback(Func func, T* ctx = nullptr): CallbackCore2<T>(ctx), m_func(func) { }
	virtual void call(SimpleEvent& evt) const { m_func(evt); }
 private:
	Func m_func;
};

template<class T> class XX_EXPORT StaticCallback: public CallbackCore2<T> {
 public:
	typedef void (*Func)(SimpleEvent& evt, T* ctx);
	inline StaticCallback(Func func, T* ctx = nullptr): CallbackCore2<T>(ctx), m_func(func) { }
	virtual void call(SimpleEvent& evt) const { m_func(evt, this->m_ctx); }
private:
	Func  m_func;
};

template<class T> class XX_EXPORT MemberCallback: public CallbackCore2<T> {
 public:
	typedef void (T::*Func)(SimpleEvent& evt);
	inline MemberCallback(Func func, T* ctx): CallbackCore2<T>(ctx), m_func(func) { }
	virtual void call(SimpleEvent& evt) const { (this->m_ctx->*m_func)(evt); }
 private:
	Func  m_func;
};

class XX_EXPORT Callback: public Handle<CallbackCore> {
 public:
	enum { kNoop = 0 };
	Callback(int type = kNoop);
	inline Callback(Type* cb): Handle(cb) { }
	inline Callback(const Callback& handle): Handle(*const_cast<Callback*>(&handle)) { }
	inline Callback(Callback& handle): Handle(handle) { }
	inline Callback(Callback&& handle): Handle(handle) { }
	template<class T = Object>
	inline Callback(typename LambdaCallback<T>::Func func, T* ctx = nullptr): Handle(new LambdaCallback<T>(func, ctx)) { }
	template<class T = Object>
	inline Callback(void (*func)(SimpleEvent& evt, T* ctx), T* ctx = nullptr): Handle(new StaticCallback<T>(func, ctx)) { }
	template<class T = Object>
	inline Callback(typename MemberCallback<T>::Func func, T* ctx): Handle(new MemberCallback<T>(func, ctx)) { }
	inline Callback& operator=(const Callback& handle) {
		Handle::operator=(*const_cast<Callback*>(&handle)); return *this;
	}
	inline Callback& operator=(Callback& handle) { Handle::operator=(handle); return *this; }
	inline Callback& operator=(Callback&& handle) { Handle::operator=(handle); return *this; }
	inline Type* collapse() { return nullptr; }
};

typedef SimpleEvent Se;
typedef Callback Cb;
typedef const Cb cCb;

XX_EXPORT int  sync_callback(cCb& cb, cError* e = nullptr, Object* data = nullptr);
XX_EXPORT void async_callback(cCb& cb, PostMessage* loop = nullptr);
XX_EXPORT void async_callback_and_dealloc(cCb& cb, Error* e, Object* d, PostMessage* loop);

/**
 * @func async_err_callback
 */
template<class T>
XX_EXPORT void async_err_callback(cCb& cb, T&& err, PostMessage* loop = nullptr) {
	if ( loop ) {
		async_callback_and_dealloc(cb, new T(move(err)), nullptr, loop);
	} else {
		sync_callback(cb, &err);
	}
}

/**
 * @func async_callback
 */
template<class T>
XX_EXPORT void async_callback(cCb& cb, T&& data, PostMessage* loop = nullptr) {
	if ( loop ) {
		async_callback_and_dealloc(cb, nullptr, new T(move(data)), loop);
	} else {
		sync_callback(cb, nullptr, &data);
	}
}

/**
 * @func async_callback
 */
template<class T, class T2>
XX_EXPORT void async_callback(cCb& cb, T&& err, T2&& data, PostMessage* loop = nullptr) {
	if ( loop ) {
		async_callback_and_dealloc(cb, new T(move(err)), new T2(move(data)), loop);
	} else {
		sync_callback(cb, &err, &data);
	}
}

XX_END
#endif
