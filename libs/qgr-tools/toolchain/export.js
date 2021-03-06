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

var util = require('qgr-utils/util');
var paths = require('./paths');
var fs = require('qgr-utils/fs');
var path = require('qgr-utils/path');
var keys = require('qgr-utils/keys');
var sys = require('os');
var { QgrBuild } = require('./build');
var { getLocalNetworkHost } = require('qgr-utils/network_host');
var { syscall } = require('qgr-utils/syscall');
var child_process = require('child_process');
var large_file_merge = require('qgr-utils/large_file_cut').merge;

var native_source = [
	'.c',
	'.cc',
	'.cpp',
	'.cxx',
	'.m',
	'.mm',
	'.s', 
	'.swift',
	'.java',
];

function parse_json_file(filename) {
	try {
		return JSON.parse(fs.readFileSync(filename, 'utf-8'));
	} catch (err) {
		err.message = filename + ': ' + err.message;
		throw err;
	}
}

function Package_get_start_argv(self) {
	if ( self.is_app ) {
		var name = self.name;
		var pkg_json = self.pkg_json;
		var start_argv = name;
		var inspect = '--inspect=0.0.0.0:9229 ';
		var start_argv_debug = 'http://' + getLocalNetworkHost()[0] + ':1026/' + 
														name + ' --dev --ignore-local=*';
		//if (self.host.m_os != 'ios') {
		start_argv_debug = inspect + start_argv_debug;
		//}
		if ( pkg_json.skip_install ) {
			if ( !pkg_json.origin || !/^https?:\/\//.test(String(pkg_json.origin)) ) {
				console.error( 'Application', name, 'no valid boot parameters.' );
				// start_argv = JSON.stringify(String(pkg_json.origin || ''));
			} else {
				start_argv = JSON.stringify(pkg_json.origin);
			}
		}
		return [start_argv, start_argv_debug];
	}
	return null;
}

function Package_gen_ios_gypi(self) {
	var is_app = self.is_app;
	var name = self.name;
	var host = self.host;
	var sources = self.sources;
	var id = self.pkg_json.id || 'com.mycompany.${PRODUCT_NAME:rfc1034identifier}';
	var app_name = self.pkg_json.app_name || '${EXECUTABLE_NAME}';
	var version = self.pkg_json.version;
	var xcode_settings = {};

	if ( is_app ) { // copy platfoem file

		xcode_settings = {
			'INFOPLIST_FILE': '<(XCODE_INFOPLIST_FILE)',
			//'OTHER_LDFLAGS': '-all_load',
			'SKIP_INSTALL': 'NO',
			'ASSETCATALOG_COMPILER_APPICON_NAME': 'AppIcon',
			'ASSETCATALOG_COMPILER_LAUNCHIMAGE_NAME': 'LaunchImage',
		};

		var out = host.m_proj_out;
		var template = __dirname + '/export/'+ host.m_os +'/';
		var plist = out + '/' + name + '.plist';
		var storyboard = out + '/' + name + '.storyboard';
		var xcassets = out + '/' + name + '.xcassets';
		var main = out + '/' + name + '.mm';
		var str;
		
		// .plist
		fs.cp_sync(template + 'main.plist', plist, { replace: false });
		str = fs.readFileSync(plist).toString('utf8');
		var reg0 = /(\<key\>CFBundleIdentifier\<\/key\>\n\r?\s*\<string\>)([^\<]+)(\<\/string\>)/;
		var reg1 = /(\<key\>CFBundleDisplayName\<\/key\>\n\r?\s*\<string\>)([^\<]+)(\<\/string\>)/;
		var reg2 = /(\<key\>CFBundleShortVersionString\<\/key\>\n\r?\s*\<string\>)([^\<]+)(\<\/string\>)/;
		str = str.replace(reg0, function(a,b,c,d) { return b + id + d });
		str = str.replace(reg1, function(a,b,c,d) { return b + app_name + d });
		if (version) str = str.replace(reg2, function(a,b,c,d) { return b + version + d });
		str = str.replace('[Storyboard]', name);
		fs.writeFileSync( plist, str );
		// .storyboard
		fs.cp_sync( template + 'main.storyboard', storyboard, { replace: false } );
		// .xcassets
		fs.cp_sync( template + 'Images.xcassets', xcassets, { replace: false } );

		self.bundle_resources.push('../Project/<(os)/' + name + '.storyboard');
		self.bundle_resources.push('../Project/<(os)/' + name + '.xcassets');

		if ( !fs.existsSync(main) ) { // main.mm
			var start_argv = Package_get_start_argv(self);
			str = fs.readFileSync(template + 'main.mm').toString('utf8');
			str = str.replace(/ARGV_DEBUG/, start_argv[1]);
			str = str.replace(/ARGV_RELEASE/, start_argv[0]);
			fs.writeFileSync( main, str );
		}

		sources.push('../Project/<(os)/' + name + '.plist');
		sources.push('../Project/<(os)/' + name + '.storyboard');
		sources.push('../Project/<(os)/' + name + '.mm');
	}

	// create gypi json data

	var type = is_app ? 'executable' : self.native ? 'static_pkgrary' : 'none';
	var gypi = 
	{	
		'targets': [
			{
				'variables': is_app ? { 
					'XCODE_INFOPLIST_FILE': '$(SRCROOT)/Project/<(os)/' + name + '.plist' 
				} : { },
				'target_name': name,
				'product_name': is_app ? name + '-1' : name,
				'type': type,
				'include_dirs': self.include_dirs,
				'dependencies': filter_repeat(self.dependencies, name),
				'direct_dependent_settings': {
					'include_dirs': is_app ? [] : self.include_dirs,
				},
				'sources': sources,
				'mac_bundle': is_app ? 1 : 0,
				'mac_bundle_resources': is_app ? self.bundle_resources : [ ],
				'xcode_settings': xcode_settings,
			}
		]
	};

	return gypi;
}

function Package_gen_android_gypi(self) {
	var is_app = self.is_app;
	var name = self.name;
	var host = self.host;
	var sources = self.sources;
	var id = (self.pkg_json.id || 'com.mycompany.' + name).replace(/-/gm, '_');
	var app_name = self.pkg_json.app_name || name;
	var version = self.pkg_json.version;
	var java_pkg = id.replace(/\./mg, '/');
	var so_pkg = self.native || self.native_deps ? name : 'qgr';
	
	if ( is_app ) { // copy platfoem file
		var proj_out = host.m_proj_out;
		var app = proj_out + '/' + name;
		var AndroidManifest_xml = `${app}/src/main/AndroidManifest.xml`;
		var strings_xml = `${app}/src/main/res/values/strings.xml`;
		var MainActivity_java = `${app}/src/main/java/${java_pkg}/MainActivity.java`;
		var build_gradle = `${app}/build.gradle`;
		
		// copy android project template
		fs.cp_sync(__dirname + '/export/android/proj_template', proj_out, { replace: false });
		// copy android app template
		fs.cp_sync(__dirname + '/export/android/app_template', proj_out + '/' + name, { replace: false });

		fs.mkdir_p_sync(proj_out + '/' + name + '/src/main/assets');
		fs.mkdir_p_sync(proj_out + '/' + name + '/src/main/java');

		var str;

		// MainActivity.java
		var start_argv = Package_get_start_argv(self);
		fs.cp_sync(__dirname + '/export/android/MainActivity.java', MainActivity_java, { replace: false });
		str = fs.readFileSync(MainActivity_java).toString('utf8');
		str = str.replace(/\{id\}/gm, id);
		str = str.replace(/String\s+LIBRARY\s+=\s+"[^\"]+"/, `String LIBRARY = "${so_pkg}"`);
		str = str.replace(/ARGV_DEBUG/, start_argv[1]);
		str = str.replace(/ARGV_RELEASE/, start_argv[0]);
		fs.writeFileSync(MainActivity_java, str);

		// AndroidManifest.xml
		str = fs.readFileSync(AndroidManifest_xml).toString('utf8');
		str = str.replace(/package\=\"[^\"]+\"/mg, `package="${id}"`);
		str = str.replace(/android\:name\=\"android\.app\.pkg_name\"\s+android\:value\=\"[^\"]+\"/, 
											`android:name="android.app.pkg_name" android:value="${so_pkg}"`);
		fs.writeFileSync(AndroidManifest_xml, str);

		// strings.xml
		str = fs.readFileSync(strings_xml).toString('utf8');
		str = str.replace(/name\=\"app_name\"\>[^\<]+\</, `name="app_name">${app_name}<`);
		fs.writeFileSync(strings_xml, str);

		// build.gradle
		str = fs.readFileSync(build_gradle).toString('utf8');
		str = str.replace(/\{id\}/, id);
		str = str.replace(/applicationId\s+('|")[^\'\"]+('|")/, `applicationId '${id}'`);
		if (version) str = str.replace(/versionName\s+('|")[^\'\"]+('|")/, `versionName '${version}'`);
		fs.writeFileSync(build_gradle, str);
	}

	// create gypi json data

	var type = 'none';
	if ( is_app ) {
		if ( self.native || self.native_deps ) {
			type = 'shared_library';
			if ( !self.native ) {
				fs.writeFileSync(host.m_output, fs.readFileSync(__dirname + '/export/'));
				fs.cp_sync(__dirname + '/export/empty.c', host.m_output + '/empty.c', { replace: false });
				sources.push('empty.c');
			}
		}
	} else if ( self.native ) {
		type = 'static_pkgrary';
	}

	var gypi = 
	{	
		'targets': [
			{
				'target_name': name,
				'type': type,
				'include_dirs': self.include_dirs,
				'dependencies': filter_repeat(self.dependencies, name),
				'direct_dependent_settings': {
					'include_dirs': is_app ? [] : self.include_dirs,
				},
				'sources': sources,
			}
		]
	};

	return gypi;
}

var Package = util.class('Package', {
	host: null,
	name: '',
	pathname: '',
	source_path: '',
	pkg_json: null,
	is_app: false,
	native: false,
	native_deps: false,
	include_dirs: null,
	sources: null,
	bundle_resources: null,
	dependencies: null,
	includes: null,
	gypi: null,

	constructor: function(host, pkg_json, is_app) {
		this.host = host;
		this.pkg_json = pkg_json;
		this.is_app = is_app;
		this.name = pkg_json.name;
		this.include_dirs = [ ];
		this.sources = [ 'public' ];
		this.pathname = host.m_output + '/' + this.name + '.gypi';
	}, 

	initialize: function(native_deps, includes, dependencies, bundle_resources) {
		var self = this;
		var host = this.host;
		var pkg_json = self.pkg_json;
		var cur_pkg_source = host.m_cur_pkg_source_path;
		var relative = path.relative(host.m_output, cur_pkg_source);

		self.m_initialize = true;
		this.native_deps = native_deps;
		this.includes = includes;
		this.dependencies = dependencies;
		this.bundle_resources = bundle_resources;
		this.source_path = cur_pkg_source;

		/* 
		 * 外部native依赖会忽略资源的处理，需自行处理资源的拷贝，只做简项目文件包含
		 * 可以依赖一个native.gypi中的多个目标，使用数组表示，如果没有值使用依赖路径basename做为目标依赖名
		 */
		for ( var pathname in pkg_json.native_deps ) {
			var target = pkg_json.native_deps[pathname];
			if ( !path.isAbsolute(pathname) ) {
				pathname = cur_pkg_source + '/' + pathname;
			}
			this.includes.push(path.resolveLocal(pathname, '/native.gypi'));
			if ( target ) {
				if ( Array.isArray(target) ) {
					this.dependencies = this.dependencies.concat(target);
				} else {
					this.dependencies.push( target );
				}
			} else {
				this.dependencies.push( path.basename(pathname) );
			}
			self.native_deps = true;
		}

		// add native and source
		if ( fs.existsSync(cur_pkg_source + '/native') ) {
			fs.ls_sync(cur_pkg_source + '/native').forEach(function(stat) {
				if ( stat.name[0] != '.' ) {
					if ( stat.isFile() ) {
						var extname = path.extname(stat.name).toLowerCase();
						if (native_source.indexOf(extname) == -1) { // resources
							// 将非native源文件作为资源拷贝
							// self.bundle_resources.push( relative + '/native/' + stat.name );
						} else { // native source
							self.native = true;
						}
					}
					self.sources.push( relative + '/native/' + stat.name );
				}
			});
		}

		// add source
		fs.ls_sync(cur_pkg_source).forEach(function(stat) {
			if ( stat.name != 'native' && stat.name[0] != '.' ) {
				if ( stat.isFile() ) {
					var extname = path.extname(stat.name).toLowerCase();
					if (native_source.indexOf(extname) == -1) {
						// 不添加任何 native source
						self.sources.push( relative + '/' + stat.name );
					}
				} else {
					self.sources.push( relative + '/' + stat.name );
				}
			}
		});

		if ( !pkg_json.skip_install ) { // no skip install pkg
			this.bundle_resources.push('install/' + this.name);
		}

		if ( this.native ) {
			this.include_dirs = [ relative + '/native' ];
		}
	},

	gen: function() {
		var os = this.host.m_os;
		if ( os == 'ios' ) {
			this.gypi = Package_gen_ios_gypi(this);
		} 
		else if ( os == 'android' ) {
			this.gypi = Package_gen_android_gypi(this);
		} 
		else {
			throw new Error('Coming soon')
		}
		return this.gypi;
	},

});

function solve_pkg(self, pathname, is_app, ignore_depe) {
	var source_path = path.resolveLocal(pathname);
	var name = path.basename(source_path);
	
	// ignore network pkg 
	if ( /^https?:\/\//i.test(source_path) ) { 
		return null;
	}

	var pkg = self.m_pkg_output[name];
	if ( pkg ) { // Already complete
		return pkg;
	}
	
	var pkg_json = parse_json_file(source_path + '/package.json');
	
	util.assert(pkg_json.name && pkg_json.name == name, 
							'Lib name must be consistent with the folder name, ' + 
							name + ' != ' + pkg_json.name);

	pkg = new Package(self, pkg_json, is_app);
	self.m_pkg_output[name] = pkg;

	var includes = [];
	var dependencies = [];
	var bundle_resources = [];
	var native_deps = false;

	if ( !ignore_depe ) {
		function solve_external_depe(pathname) {
			pathname = util.isAbsolute(pathname) ? pathname : source_path + '/' + pathname;
			var pkg2 = solve_pkg(self, pathname, false, false);
			if ( pkg2 ) {
				includes.push(pkg2.pathname);
				dependencies.push(pkg2.name);
				includes = includes.concat(pkg2.includes);
				dependencies = dependencies.concat(pkg2.dependencies);
				bundle_resources = bundle_resources.concat(pkg2.bundle_resources);
				if ( pkg2.native || pkg2.native_deps ) {
					native_deps = true;
				}
			}
		}
		if (Array.isArray(pkg_json.external_deps)) {
			pkg_json.external_deps.forEach(solve_external_depe);
		} else {
			for (var pathname in pkg_json.external_deps) {
				solve_external_depe(pathname);
			}
		}
	}
	if ( dependencies.length == 0 ) {
		dependencies = [ '<@(qgr-lib)' ];
	}
	if ( bundle_resources.length == 0 ) {
		bundle_resources = self.m_bundle_resources.concat();
	}
	
	self.m_cur_pkg_name = name;
	self.m_cur_pkg_source_path = source_path;

	pkg.initialize(native_deps, includes, dependencies, bundle_resources);
	pkg.gen();
	
	return pkg;
}

// reset app resources
function add_default_dependencies(self, name, default_modules) {
	var pkg = self.m_pkg_output[name];

	default_modules.forEach(function(item) { 
		pkg.dependencies.push(item.name);
		pkg.bundle_resources.push.apply(pkg.bundle_resources, item.bundle_resources);
		pkg.includes.push(item.pathname);
		pkg.includes.push.apply(pkg.includes, item.includes)
	});
	pkg.dependencies = filter_repeat(pkg.dependencies, name);
	pkg.bundle_resources = filter_repeat(pkg.bundle_resources);
	pkg.includes = filter_repeat(pkg.includes, pkg.pathname);

	pkg.gypi.targets[0].dependencies = pkg.dependencies;
	if ( self.m_os == 'ios' ) {
		pkg.gypi.targets[0].mac_bundle_resources = pkg.bundle_resources;
	}
}

function is_windows_env() {
	return /win/i.test(process.platform) && process.platform != 'darwin';
}

function filter_repeat(array, ignore) {	
	var r = {};
	array.forEach(function(item) { 
		if ( !ignore || ignore != item ) {
			r[item] = 1;
		}
	});
	return Object.getOwnPropertyNames(r);
}

function gen_project_file(self, project_name) {

	var gyp_exec = __dirname + (is_windows_env() ? '/../gyp/gyp.bat' :  '/../gyp/gyp');

	var os = self.m_os;
	var source = self.m_source;
	var project = 'make';
	var project_path;
	var out = self.m_output;
	var proj_out = self.m_proj_out;

	if ( os == 'ios' ) {
		project = 'xcode';
		project_path = [ `${proj_out}/${project_name}.xcodeproj` ];
	} else if ( os == 'android' ) {
		project = 'cmake-linux';
		project_path = [ 
			`${out}/android/${project_name}/out/Release/CMakeLists.txt`,
			`${out}/android/${project_name}/out/Debug/CMakeLists.txt`,
		];
		proj_out = path.relative(source, `${out}/android/${project_name}`);
	}

	// write _var.gypi
	var include_gypi = ' -Iout/_var.gypi';
	var var_gyp = { variables: { OS: os, os: os, project: project } };
	fs.writeFileSync(source + '/out/_var.gypi', JSON.stringify(var_gyp, null, 2));

	paths.includes_gypi.forEach(function(str) { 
		include_gypi += ' -I' + path.relative(source, str);
	});
	
	var shell = `\
		GYP_GENERATORS=${project} ${gyp_exec} \
		-f ${project} \
		--generator-output="${proj_out}" \
		-Goutput_dir="${path.relative(source,out)}" \
		-Gstandalone ${include_gypi} \
		${project_name}.gyp \
		--depth=. \
	`;

	var buf = child_process.execSync(shell);
	
	if ( buf.length ) {
		console.log(buf.toString());
	}

	return project_path;
}

function export_result(self) {
	// write gyp

	var includes = [];
	var source = self.m_source;

	for ( var i in self.m_pkg_output ) {
		var pkg = self.m_pkg_output[i];
		if ( pkg.is_app ) {
			includes.push.apply(includes, pkg.includes)
			includes.push(pkg.pathname);
		}
		fs.writeFileSync( pkg.pathname, JSON.stringify(pkg.gypi, null, 2));
	}

	includes = filter_repeat(includes).map(function(pathname) {
		return path.relative(source, pathname);
	});

	var qgr_gyp = paths.qgr_gyp;
	var gyp = 
	{
		'variables': {
			'qgr-lib': [ qgr_gyp ? path.relative(source, qgr_gyp) + ':qgr-lib': 'qgr-lib' ],
		},
		'includes': includes,
	};

	var project_name = self.m_project_name;
	var gyp_file = source + '/' + project_name +'.gyp';

	// write gyp file
	fs.writeFileSync( gyp_file, JSON.stringify(gyp, null, 2) ); 
	var out = gen_project_file(self, project_name); // gen target project 

	try {
		child_process.execSync('open ' + out[0]); // open project
	} catch (e) {
		// 
	}

	fs.rm_sync(gyp_file); // write gyp file
}

function write_cmake_depe_to_android_build_gradle(self, pkg, cmake, add) {
	var build_gradle = `${self.m_proj_out}/${pkg.name}/build.gradle`;
	var str = fs.readFileSync(build_gradle).toString('utf8');
	str = str.replace(/^.*android\.externalNativeBuild\.cmake\.path\s*=\s*("|')[^"']*("|').*$/mg, '');
	cmake = path.relative(`${self.m_proj_out}/${pkg.name}`, cmake);
	cmake = `android.externalNativeBuild.cmake.path = '${cmake}'`;
	if ( add ) {
		str += cmake;
	}
	fs.writeFileSync(build_gradle, str);
}

function export_result_android(self) {
	// write gyp
	var output = self.m_output;
	var proj_out = self.m_proj_out;
	var settings_gradle = [];
	var use_ndk = false;
	var source = self.m_source;
	var str;

	for ( var i in self.m_pkg_output ) {
		var pkg = self.m_pkg_output[i];
		if ( pkg.is_app ) {
			if ( pkg.native || pkg.native_deps ) {
				use_ndk = true;
			}
			settings_gradle.push("':" + i + "'");
		}
		fs.writeFileSync( pkg.pathname, JSON.stringify(pkg.gypi, null, 2));
	}
	
	// gen gyp and native cmake
	// android 每个项目需单独创建`gyp`并生成`.cmake`
	for ( var i in self.m_pkg_output ) {
		var pkg = self.m_pkg_output[i];
		if ( pkg.is_app ) {

			if ( pkg.native || pkg.native_deps ) {
				// android并不完全依赖`gyp`,只需针对native项目生成.cmake文件
				
				var includes = pkg.includes.concat(pkg.pathname).map(function(pathname) {
					return path.relative(source, pathname);
				});
				var qgr_gyp = paths.qgr_gyp;
				var gyp = 
				{
					'variables': {
						'qgr-lib': [ qgr_gyp ? path.relative(source, qgr_gyp) + ':qgr-lib': 'qgr-lib' ],
					},
					'includes': includes,
				};

				var gyp_file = source + '/' + pkg.name +'.gyp';

				// write gyp file
				fs.writeFileSync( gyp_file, JSON.stringify(gyp, null, 2) ); 
				// gen cmake
				var out = gen_project_file(self, pkg.name); // gen target project 
				
				fs.rm_sync(gyp_file); // write gyp file

				//对于android这两个属性会影响输出库.so的默认路径,导致无法捆绑.so库文件,所以从文件中删除它
				//set_target_properties(examples PROPERTIES LIBRARY_OUTPUT_DIRECTORY "${builddir}/pkg.${TOOLSET}")
				//set_source_files_properties(${builddir}/pkg.${TOOLSET}/pkgexamples.so PROPERTIES GENERATED "TRUE")
				var reg0 = /^set_target_properties\([^ ]+ PROPERTIES LIBRARY_OUTPUT_DIRECTORY [^\)]+\)/mg;
				var reg1 = /^set_source_files_properties\([^ ]+ PROPERTIES GENERATED "TRUE"\)/mg;
				out.forEach(function(cmake) {
					str = fs.readFileSync(cmake).toString('utf8');
					str = str.replace(reg0, '').replace(reg1, '');
					fs.writeFileSync(cmake, str);
				});

				// write CMakeLists.txt path
				write_cmake_depe_to_android_build_gradle(self, pkg, out[0], true);
			} else {
				write_cmake_depe_to_android_build_gradle(self, pkg, '', false);
			}

			// copy pkgrary bundle resources to android assets directory
			var android_assets = `${proj_out}/${pkg.name}/src/main/assets`;

			pkg.bundle_resources.forEach(function(res) {
				var basename = path.basename(res);
				var source = path.relative(android_assets, output + '/' + res);
				var target = `${android_assets}/${basename}`;
				if ( fs.existsSync(target) ) {
					fs.unlinkSync(target);
				}
				fs.symlinkSync(source, target);
			});
		}
	}

	// write settings.gradle
	fs.writeFileSync(proj_out + '/settings.gradle', 'include ' + settings_gradle.join(','));
	// set useDeprecatedNdk from gradle.properties
	str = fs.readFileSync(proj_out + '/gradle.properties').toString('utf8');
	str = str.replace(/useDeprecatedNdk\s*=\s*(false|true)/, function(){ 
		return `useDeprecatedNdk=${use_ndk}` 
	});
	fs.writeFileSync(proj_out + '/gradle.properties', str);

	try {
		child_process.execSync('open Project/android'); // open project
	} catch (e) {
		// 
	}
}

/**
 * @class QgrExport
 */
var QgrExport = util.class('QgrExport', {
	m_source: '',
	m_output: '',
	m_proj_out: '',
	m_os: '',
	m_pkg_output: null,
	m_cur_pkg_name 	: '',
	m_cur_pkg_source_path: '',
	m_default_includes: null,
	m_project_name: 'app',
	m_bundle_resources: null,

	constructor: function (source, os) {
		var self = this;
		this.m_source = path.resolveLocal(source);
		this.m_output = path.resolveLocal(source, 'out');
		this.m_os = os;
		this.m_proj_out = path.resolveLocal(source, 'Project', os);
		this.m_pkg_output = { };
		this.m_default_includes = { };

		function copy(source) {
			var target = self.m_output + '/libs/' + path.basename(source);
			fs.cp_sync(source, target, { replace: false });
			return path.relative(self.m_output, target);
		}
		// copy bundle resources and includes and librarys
		this.m_bundle_resources = paths.bundle_resources.map(copy);

		paths.includes.map(copy);

		var librarys = paths.librarys[os] || [];
		if ( os == 'ios' ) {
			librarys.map(function(source) {
				var basename = path.basename(source);
				var target = self.m_output + '/libs/' + basename;
				if ( basename == 'ios' ) { // merge Framework
					fs.cp_sync(source, target, {
						replace: false, 
						check: function(path) {
							return path.indexOf('qgr.framework/qgr.') == -1;
						},
					});
					// merge qgr.framework/qgr 
					[ 'iphonesimulator/Release', /*'iphonesimulator/Debug',*/
						'iphoneos/Release', 'iphoneos/Debug'
					].forEach(function(sdk) {
						var pathname = `${target}/${sdk}/Frameworks/qgr.framework/qgr`;
						if (!fs.existsSync(pathname)) { // 目标不存在进行合并
							large_file_merge(`${source}/${sdk}/Frameworks/qgr.framework/qgr`, 
															 { target: pathname });
						}
					});
					var iphonesimulatorRelease = target + 
						'/iphonesimulator/Release/Frameworks/qgr.framework';
					var iphonesimulatorDebug = target + 
						'/iphonesimulator/Debug/Frameworks/qgr.framework';
					fs.mkdir_p_sync(target + '/iphonesimulator/Debug/Frameworks');
					fs.rm_r_sync(iphonesimulatorDebug);
					fs.symlinkSync(iphonesimulatorRelease, iphonesimulatorDebug);
				} else {
					fs.cp_sync(source, target, { replace: false });
				}
			});
		} else {
			librarys.map(copy);
		}

		var app_keys = this.m_source + '/proj.keys';

		util.assert(fs.existsSync(app_keys), 'Export source does not exist ,{0}', app_keys);
		
		fs.mkdir_p_sync(this.m_output);
		fs.mkdir_p_sync(this.m_output + '/public');
		fs.mkdir_p_sync(this.m_proj_out);
	},

	export: function() {
		var self = this;
		var os = this.m_os;

		util.assert(
			os == 'android' || 
			os == 'ios', 
			'Do not support {0} os', os);

		// export pkgs

		var default_modules = [];
		var pkgs_path = self.m_source + '/libs';

		if ( fs.existsSync(pkgs_path) && fs.statSync(pkgs_path).isDirectory() ) {
			fs.ls_sync(pkgs_path).forEach(function(stat) {
				var source = pkgs_path + '/' + stat.name;
				if ( stat.isDirectory() && fs.existsSync(source + '/package.json') ) {
					default_modules.push(solve_pkg(self, source, false, true));
				}
			});
		}

		// export apps

		var app_keys = keys.parseFile(this.m_source + '/proj.keys');
		
		for ( var name in app_keys ) {
			if (name[0] == '@') { // 忽略 @
				if ( name == '@ProjectName' ) {
					this.m_project_name = app_keys[name];
				}
			} else {
				if ( ! fs.existsSync(this.m_output + '/install/' + name) ) {
					new QgrBuild(this.m_source, this.m_output).build();
				}
				util.assert(fs.existsSync(this.m_output + '/install/' + name), 
										'Installation directory not found');
				solve_pkg(this, this.m_source + '/' + name, true, false);
				add_default_dependencies(this, name, default_modules);
			}
		}

		if ( os == 'android' ) {
			export_result_android(this);
		} else {
			export_result(this);
		}
	}

});

exports.QgrExport = QgrExport;
