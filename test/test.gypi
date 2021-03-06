{ 
	'variables': {
		'without_visibility_hidden%': 0,
		'other_ldflags': [
			'-Wl,--whole-archive',
			'<(output)/obj.target/libqgr-utils.a',
			'<(output)/obj.target/libqgr-gui.a',
			'<(output)/obj.target/libqgr-js.a',
			'-Wl,--no-whole-archive',
		],

	},
	'targets': [
		{
			'target_name': 'test',
			'type': 'executable',
			'include_dirs': [ 
				'../out',
			],
			'dependencies': [
				'qgr-utils',
				'qgr-gui',
				'qgr-js',
				'depe/tess2/tess2.gyp:tess2',
				'depe/freetype2/freetype2.gyp:ft2',
				'depe/curl/curl.gyp:curl',
				'depe/ffmpeg/ffmpeg.gyp:ffmpeg',
				'depe/v8-link/v8-link.gyp:v8-link',
				'depe/v8-link/v8-link.gyp:v8_libplatform-link',
				'depe/node/deps/openssl/openssl.gyp:openssl',
				'depe/node/deps/uv/uv.gyp:libuv',
				'depe/node/deps/http_parser/http_parser.gyp:http_parser',
				'depe/node/node.gyp:node',
			],
			'mac_bundle': 1,
			'mac_bundle_resources': [
				'res',
				'test-qgr',
				'../examples',
				'../benchmark',
			],
			'xcode_settings': {
				'OTHER_LDFLAGS': '-all_load',
			},
			'sources': [
				'../examples',
				'../libs/qgr',
				'../libs/qgr-tools',
				'../libs/qgr-utils',
				'test.cc',
				'test-qgr.cc',
				'test-fs.cc',
				'test-fs2.cc',
				'test-gui.cc',
				'test-freetype.cc',
				'test-json.cc',
				'test-string.cc',
				'test-list.cc',
				'test-map.cc',
				'test-event.cc',
				'test-zlib.cc',
				'test-curl.cc',
				'test-curl2.cc',
				'test-http.cc',
				'test-http2.cc',
				'test-http3.cc',
				'test-https.cc',
				'test-thread.cc',
				'test-ffmpeg.cc',
				'test-number.cc',
				'test-uv.cc',
				'test-net.cc',
				'test-fs-async.cc',
				'test-ssl.cc',
				'test-net-ssl.cc',
				'test-http-cookie.cc',
				'test-localstorage.cc',
				'test-buffer.cc',
				'test-demo.cc',
				'test-jsc.cc',
				'test-v8.cc',
				'test-loop.cc',
				'test-sys.cc',
				'test-mutex.cc',
				'test-ios-run-loop.cc', 
				'test-benchmark.cc',
				'test-sizeof.cc',
				'test-util.cc',
				'test-alsa-ff.cc',
				'test-linux-input.cc',
				'test-linux-input-2.cc',
			],
			'conditions': [
				['os in "ios osx"', {
					'sources': [ 
						'test-<(os).plist',
						'Storyboard-<(os).storyboard',
					],
					'xcode_settings': {
						'INFOPLIST_FILE': '$(SRCROOT)/test/test-<(os).plist',
					},
				}],
				['os in "linux android"', {
					'ldflags': [ 
						'<@(other_ldflags)',
						'-Wl,--whole-archive',
						'<(output)/obj.target/depe/node/libnode.a',
						'-Wl,--no-whole-archive',
					],
				}],
			],
		},
		{
			'target_name': 'qgr-demo',
			'type': 'executable',
			'dependencies': [ 
				'qgr',
			],
			'mac_bundle': 1,
			'mac_bundle_resources': [
				'../examples',
			],
			'xcode_settings': {
				'OTHER_LDFLAGS': '-all_load',
			},
			'sources': [
				'demo.cc',
			],
			'conditions': [
				['os in "ios osx"', {
					'sources': [
						'test-<(os).plist',
						'Storyboard-<(os).storyboard',
					],
					'xcode_settings': {
						'INFOPLIST_FILE': '$(SRCROOT)/test/test-<(os).plist',
					},
				}],
				['os in "linux android"', {
					'ldflags': [ '<@(other_ldflags)' ],
				}],
			],
		},
	],

	'conditions': [
		# gen android test depes `libqgr-depes-test.so`
		['os=="android" and (debug==1 or without_visibility_hidden==1)', {
			'targets': [
			{
				'target_name': 'qgr-depes-test',
				'type': 'shared_library',
				'dependencies': [
					'qgr/utils/minizip.gyp:minizip',
					'depe/curl/curl.gyp:curl',
					'depe/sqlite-amalgamation/sqlite3.gyp:sqlite3',
					'depe/tess2/tess2.gyp:tess2', 
					'depe/freetype2/freetype2.gyp:ft2',
					'depe/ffmpeg/ffmpeg.gyp:ffmpeg_compile',
					'depe/libgif/libgif.gyp:libgif', 
					'depe/libjpeg-turbo/libjpeg.gyp:libjpeg', 
					'depe/libpng/libpng.gyp:libpng',
					'depe/libwebp/libwebp.gyp:libwebp',
					'depe/tinyxml2/tinyxml2.gyp:tinyxml2',
					'depe/v8-link/v8-link.gyp:v8-link',
					'depe/v8-link/v8-link.gyp:v8_libplatform-link',
					'depe/node/deps/uv/uv.gyp:libuv',
					'depe/node/deps/openssl/openssl.gyp:openssl',
					'depe/node/deps/http_parser/http_parser.gyp:http_parser',
					'depe/node/node.gyp:node',
				],
				'link_settings': { 
					'libraries': [ '-lz' ],
				},
				'ldflags': [
					'-s',
					'-Wl,--whole-archive',
					'<(output)/obj.target/ffmpeg/libffmpeg.a',
					'-Wl,--no-whole-archive',
				],
			},
			{
				'target_name': 'qgr-depes-copy',
				'type': 'none',
				'dependencies': [ 'qgr-depes-test' ],
				'copies': [{
					'destination': '<(DEPTH)/out/jniLibs/<(android_abi)',
					'files': [
						'<(output)/lib.target/libqgr-depes-test.so',
					],
				}],
			}],
		}],
		['os in "ios osx"', {
			'targets': [
			{
				'target_name': 'QgrTest',
				'type': 'shared_library',
				'mac_bundle': 1,
				'include_dirs': [ '.' ],
				'direct_dependent_settings': {
					'include_dirs': [ '.' ],
				},
				'sources': [
					'framework/framework.h',
					'framework/Thing.h',
					'framework/Thing.m',
					'framework/Info-<(os).plist',
				],
				'link_settings': {
					'libraries': [
						'$(SDKROOT)/System/Library/Frameworks/Foundation.framework',
					],
				},
				'mac_framework_headers': [
					'framework/framework.h',
					'framework/Thing.h',
				],
				'xcode_settings': {
					'INFOPLIST_FILE': '<(DEPTH)/test/framework/Info-<(os).plist',
					#'SKIP_INSTALL': 'NO',
					'LD_RUNPATH_SEARCH_PATHS': [
						'$(inherited)',
						'@executable_path/Frameworks',
						'@loader_path/Frameworks',
					],
					'DYLIB_INSTALL_NAME_BASE': '@rpath',
				},
			}],
		}]
	],
}
