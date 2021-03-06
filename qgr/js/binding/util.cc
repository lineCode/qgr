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

#include "qgr/utils/string.h"
#include "qgr/utils/fs.h"
#include "qgr/sys.h"
#include "qgr/utils/loop.h"
#include "qgr/js/qgr.h"
#include "qgr/utils/jsx.h"
#include "native-ext-js.h"

/**
 * @ns qgr::js
 */

JS_BEGIN

using namespace native_js;

extern Array<char*>* __xx_qgr_argv;
extern int __xx_qgr_have_node;
extern int __xx_qgr_have_dev;

typedef Object NativeObject;

class WrapNativeObject: public WrapObject {
 public:
	static void constructor(FunctionCall args) {
		JS_ATTACH(args);
		New<WrapNativeObject>(args, new NativeObject());
	}
	static void binding(Local<JSObject> exports, Worker* worker) {
		JS_DEFINE_CLASS_NO_EXPORTS(NativeObject, constructor, {
			// none
		}, nullptr);
	}
};

/**
 * @class WrapSimpleHash
 */
class WrapSimpleHash: public WrapObject {
 public:
	
	static void constructor(FunctionCall args) {
		New<WrapSimpleHash>(args, new SimpleHash());
	}
	
	static void hashCode(FunctionCall args) {
		JS_WORKER(args);
		JS_SELF(SimpleHash);
		JS_RETURN( self->hash_code() );
	}
	
	static void update(FunctionCall args) {
		JS_WORKER(args);
		if (  args.Length() < 1 ||
				!(args[0]->IsString(worker) || worker->has_buffer(args[0]))
		) {
			JS_THROW_ERR("Bad argument");
		}
		JS_SELF(SimpleHash);
		
		if ( args[0]->IsString(worker) ) { // 字符串
			Ucs2String str = args[0]->ToUcs2StringValue(worker);
			self->update(*str, str.length());
		}
		else { // Buffer
			WeakBuffer buff = worker->as_buffer(args[0]);
			self->update(*buff, buff.length());
		}
	}
	
	static void digest(FunctionCall args) {
		JS_WORKER(args);
		JS_SELF(SimpleHash);
		JS_RETURN( self->digest() );
	}
	
	static void clear(FunctionCall args) {
		JS_SELF(SimpleHash);
		self->clear();
	}

	/**
	 * @func binding
	 */
	static void binding(Local<JSObject> exports, Worker* worker) {
		JS_DEFINE_CLASS(SimpleHash, constructor, {
			JS_SET_CLASS_METHOD(hashCode, hashCode);
			JS_SET_CLASS_METHOD(update, update);
			JS_SET_CLASS_METHOD(digest, digest);
			JS_SET_CLASS_METHOD(clear, clear);
		}, nullptr);
	}
};

/**
 * @class NativeUtil
 */
class NativeUtil {
 public:

	static SimpleHash get_hash_code(FunctionCall args) {
		JS_WORKER(args);
		SimpleHash hash;
		Ucs2String str = args[0]->ToUcs2StringValue(worker);
		hash.update(*str, str.length());
		return hash;
	}
	
	static void hashCode(FunctionCall args) {
		JS_WORKER(args);
		if (args.Length() < 1 || ! args[0]->IsString(worker)) {
			JS_THROW_ERR("Bad argument");
		}
		JS_RETURN( get_hash_code(args).hash_code() );
	}
	
	static void hash(FunctionCall args) {
		JS_WORKER(args);
		if (args.Length() < 1 || ! args[0]->IsString(worker)) {
			JS_THROW_ERR("Bad argument");
		}
		JS_RETURN( get_hash_code(args).digest() );
	}
	
	static void version(FunctionCall args) {
		JS_WORKER(args);
		JS_RETURN( qgr::version() );
	}
	
	static void addNativeEventListener(FunctionCall args) {
		JS_WORKER(args);
		if ( args.Length() < 3 || !args[0]->IsObject(worker) ||
				!args[1]->IsString(worker) || !args[2]->IsFunction(worker)) {
			JS_THROW_ERR("Bad argument");
		}
		if ( ! WrapObject::is_pack(args[0].To<JSObject>()) ) {
			JS_THROW_ERR("Bad argument");
		}
		int id = 0;
		if ( args.Length() > 3 && args[3]->IsNumber(worker) ) {
			id = args[3]->ToNumberValue(worker);
		}
		{ HandleScope scope(worker);
			WrapObject* wrap = WrapObject::unpack(args[0].To<JSObject>());
			String name = args[1]->ToStringValue(worker,1);
			String func = String("__on").push(name).push("_native").push(String(id));
			bool ok = wrap->add_event_listener(name, func, id);
			if (ok) {
				wrap->set(worker->New(func,1), args[2]);
			}
			JS_RETURN(ok);
		}
	}
	
	static void removeNativeEventListener(FunctionCall args) {
		JS_WORKER(args);
		if ( args.Length() < 2 || !args[0]->IsObject(worker) || !args[1]->IsString(worker)) {
			JS_THROW_ERR("Bad argument");
		}
		if ( ! WrapObject::is_pack(args[0].To<JSObject>()) ) {
			JS_THROW_ERR("Bad argument");
		}
		int id = 0;
		if ( args.Length() > 2 && args[2]->IsNumber(worker) ) {
			id = args[2]->ToNumberValue(worker);
		}
		{ HandleScope scope(worker);
			String name = args[1]->ToStringValue(worker,1);
			WrapObject* wrap = WrapObject::unpack(args[0].To<JSObject>());
			bool ok = wrap->remove_event_listener(name, id);
			if ( ok ) {
				String func = String("__on").push(name).push("_native").push(String(id));
				wrap->del( worker->New(func) );
			}
			JS_RETURN(ok);
		}
	}

	static void garbageCollection(FunctionCall args) {
		JS_WORKER(args); GUILock lock;
		worker->garbage_collection();
#if XX_MEMORY_TRACE_MARK
		std::vector<Object*> objs = Object::mark_objects();
		Object** objs2 = &objs[0];
		LOG("All unrelease heap objects count: %d", objs.size());
#endif
	}
	
	static void run_script(FunctionCall args) {
		JS_WORKER(args);
		if (args.Length() < 1 || ! args[0]->IsString(worker)) {
			JS_THROW_ERR("Bad argument");
		}
		JS_HANDLE_SCOPE();
		Local<JSString> name;
		Local<JSObject> sandbox;
		if (args.Length() > 1) {
			name = args[1]->ToString(worker);
		} else {
			name = worker->New("[eval]",1);
		}
		if (args.Length() > 2 && args[2]->IsObject(worker)) {
			sandbox = args[2].To<JSObject>();
		}
		Local<JSValue> rv = worker->run_script(args[0].To<JSString>(), name, sandbox);
		if ( !rv.IsEmpty() ) { // 没有值可能有异常
			JS_RETURN( rv );
		}
	}

	static void next_tick(FunctionCall args) {
		JS_WORKER(args);
		if (args.Length() == 0 || ! args[0]->IsFunction(worker)) {
			JS_THROW_ERR("Bad argument");
		}
		CopyablePersistentFunc func(worker, args[0].To<JSFunction>());
		RunLoop::next_tick(Callback([worker, func](Se& e) {
			XX_ASSERT(!func.IsEmpty());
			JS_HANDLE_SCOPE();
			func.local()->Call(worker);
		}));
	}

	static void transform_js(FunctionCall args, bool jsx) {
		JS_WORKER(args);
		if (args.Length() < 2 || !args[0]->IsString(worker) || !args[1]->IsString(worker)) {
			JS_THROW_ERR("Bad argument");
		}
		Ucs2String rv;
		Ucs2String in = args[0]->ToUcs2StringValue(worker);
		String path = args[1]->ToStringValue(worker);
		JS_TRY_CATCH({
			if (jsx) {
				rv = Jsx::transform_jsx(in, path);
			} else {
				rv = Jsx::transform_js(in, path);
			}
		}, Error);
		
		JS_RETURN( rv );
	}
	
	static void transformJsx(FunctionCall args) {
		transform_js(args, true);
	}
	
	static void transformJs(FunctionCall args) {
		transform_js(args, false);
	}
	
	static void exit(FunctionCall args) {
		JS_WORKER(args);
		int code = 0;
		if (args.Length() > 0 && args[0]->IsInt32(worker)) {
			code = args[0]->ToInt32Value(worker);
		}
		qgr::exit(code);
	}

	static void __getExtendModuleContent(FunctionCall args) {
		JS_WORKER(args);
		if (args.Length() < 1 || ! args[0]->IsString(worker)) {
			JS_THROW_ERR("Bad argument");
		}
		String path = args[0]->ToStringValue(worker);
		for (int i = 0; i < EXT_native_js_count_; i++) {
			const EXT_NativeJSCode* code = EXT_native_js_ + i;
			if (path == code->name) {
				JS_RETURN( worker->NewString(code->code, code->count) );
			}
		}
		JS_RETURN_NULL();
	}

	/**
	 * @func binding
	 */
	static void binding(Local<JSObject> exports, Worker* worker) {

		JS_SET_METHOD(hashCode, hashCode);
		JS_SET_METHOD(hash, hash);
		JS_SET_METHOD(version, version);
		JS_SET_METHOD(addNativeEventListener, addNativeEventListener);
		JS_SET_METHOD(removeNativeEventListener, removeNativeEventListener);
		JS_SET_METHOD(runScript, run_script);
		JS_SET_METHOD(garbageCollection, garbageCollection);
		JS_SET_METHOD(nextTick, next_tick);
		JS_SET_METHOD(transformJsx, transformJsx);
		JS_SET_METHOD(transformJs, transformJs);
		JS_SET_METHOD(_exit, exit);
		JS_SET_PROPERTY(platform, qgr::platform());
		JS_SET_PROPERTY(haveNode, __xx_qgr_have_node);
		JS_SET_PROPERTY(dev, __xx_qgr_have_dev);

		// argv
		Local<JSArray> argv = worker->NewArray();
		if (__xx_qgr_argv) {
			for (uint i = 0; i < __xx_qgr_argv->length(); i++) {
				argv->Set(worker, i, worker->New(__xx_qgr_argv->item(i)));
			}
		}
		JS_SET_PROPERTY(argv, argv);

		// extendModule
		Local<JSObject> __extendModule = worker->NewObject();
		for (int i = 0; i < EXT_native_js_count_; i++) {
			Local<JSObject> module = worker->NewObject();
			const EXT_NativeJSCode* code = EXT_native_js_ + i;
			module->SetProperty(worker, "filename", String(code->name) + code->ext);
			module->SetProperty(worker, "extname", code->ext);
			__extendModule->SetProperty(worker, code->name, module);
		}
		JS_SET_PROPERTY(__extendModule, __extendModule);
		JS_SET_METHOD(__getExtendModuleContent, __getExtendModuleContent);

		WrapNativeObject::binding(exports, worker);
		WrapSimpleHash::binding(exports, worker);
	}
};

JS_REG_MODULE(_util, NativeUtil)
JS_END
