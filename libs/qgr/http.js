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

export requireNative('_http');

import 'qgr/util';
import { NativeNotification } from 'qgr/event';

 /**
	* @enum HttpMethod
	* HTTP_METHOD_GET = 0
	* HTTP_METHOD_POST = 1
	* HTTP_METHOD_HEAD = 2
	* HTTP_METHOD_DELETE = 3
	* HTTP_METHOD_PUT = 4
	* @end
	*/

 /**
	* @enum  HttpReadyState
	* HTTP_READY_STATE_INITIAL = 0
	* HTTP_READY_STATE_READY = 1
	* HTTP_READY_STATE_SENDING = 2
	* HTTP_READY_STATE_RESPONSE = 3
	* HTTP_READY_STATE_COMPLETED = 4
	* @end
	*/
 
 /**
	* @class NativeHttpClientRequest
	*
	* @func setMethod(method)
	* @arg method {HttpMethod}
	*
	* @func setUrl(url)
	* @arg url {String}
	*
	* @func setSavePath(path)
	* @arg path {String}
	*
	* @func setUsername(username)
	* @arg username {String}
	*
	* @func setPassword(password)
	* @arg password {String}
	*
	* @func disableCache(disable)
	* @arg disable {bool}
	*
	* @func disableCookie(disable)
	* @arg disable {bool}
	*
	* @func disableSendCookie(disable)
	* @arg disable {bool}
	*
	* @func disableSslVerify(disable)
	* @arg disable {bool}
	*
	* @func setRequestHeader(header_name, value)
	* @arg header_name {String} ascii string
	* @arg value {String}
	*
	* @func setForm(form_name, value)
	* @arg form_name {String}
	* @arg value {String}
	*
	* @func setUploadFile(form_name, local_path)
	* @arg form_name {String}
	* @arg local_path {String}
	*
	* @func clearRequestHeader()
	*
	* @func clearFormData()
	*
	* @func getResponseHeader(header_name)
	* @arg header_name {String}
	* @ret {String}
	*
	* @func getAllResponseHeaders()
	* @ret {Object}
	*
	* @func setKeepAlive(keep_alive)
	* @arg keep_alive {bool}
	*
	* @func setTimeout(time)
	* @arg time {uint} ms
	*
	* @func send([data])
	* @arg [data] {String|ArrayBuffer|Buffer}
	*
	* @func pause()
	*
	* @func resume()
	*
	* @func abort()
	*
	* @get uploadTotal {uint}
	* @get uploadSize {uint}
	* @get downloadTotal {uint}
	* @get downloadSize {uint}
	* @get readyState {HttpReadyState}
	* @get statusCode {int}
	* @get url {String}
	* @end
	*/

/**
 * @class HttpClientRequest
 * @bases NativeHttpClientRequest
 */
export class HttpClientRequest extends exports.NativeHttpClientRequest {
	event onError;
	event onwrite;
	event onHeader;
	event onData;
	event onEnd;
	event onReadystateChange;
	event onTimeout;
	event onAbort;
}

util.extendClass(HttpClientRequest, NativeNotification);

 /**
	* @object RequestOptions
	* url                 {String}
	* method              {HttpMethod}
	* headers             {Object}    setting custom request headers
	* postData            {Buffer}    Non post requests ignore this option
	* save                {String}    save body content to local disk
	* upload              {String}    upload loacl file  
	* disableSslVerify    {bool}
	* disableCache        {bool}
	* disableCookie       {bool}
	* @end
	*/

 /**
	* @func request(options[,cb])
	* @arg options {RequestOptions}
	* @arg [cb] {Function}
	* @ret {uint} return req id
	*
	* @func requestStream(options[,cb])
	* @arg options {RequestOptions}
	* @arg [cb] {Function}
	* @ret {uint} return req id
	*
	* @func requestSync(options)
	* @arg options {Object}
	* @ret {Buffer}
	*
	* @func download(url,save[,cb])
	* @arg url {String}
	* @arg save {String}
	* @arg [cb] {Function}
	* @ret {uint} return req id
	*
	* @func downloadSync(url,save)
	* @arg url {String}
	* @arg save {String}
	*
	* @func upload(url,local_path[,cb])
	* @arg url {String}
	* @arg local_path {String}
	* @arg [cb] {Function}
	* @ret {uint} return req id  
	*
	* @func uploadSync(url,local_path)
	* @arg url {String}
	* @arg local_path {String}
	*
	* @func get(url[,cb])
	* @arg url {String}
	* @arg [cb] {Function}
	* @ret {uint} return req id
	*
	* @func post(url,data[,cb])
	* @arg url {String}
	* @arg data {String|ArrayBuffer|Buffer}
	* @arg [cb] {Function}
	* @ret {uint} return req id
	*
	* @func getSync(url)
	* @arg url {String}
	* @ret {Buffer}
	*
	* @func postSync(url,data)
	* @arg url {String}
	* @arg data {String|ArrayBuffer|Buffer}
	* @ret {Buffer}
	*
	* @func abort(id)
	* @arg id {uint} abort id
	*
	* @func userAgent()
	* @ret {String}
	*
	* @func setUserAgent(user_agent)
	* @arg user_agent {String}
	*
	* @func sslCacertFile()
	* @ret {String} return cacert file path
	*
	* @func setSslCacertFile(path)
	* @arg path {String}
	*
	* @func cachePath()
	* @ret {String}
	*
	* @func setCachePath(path)
	* @arg path {String}
	*
	* @func clearCache()
	*
	* @func clearCookie()
	*
	*/
