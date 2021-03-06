include out/config.mk

ARCH					?= x64
SUFFIX				?= $(ARCH)
OS						?= `uname`
BUILDTYPE			?= Release
V							?= 0
CXX						?= g++
LINK					?= g++
ENV						?=
NODE					?= node
ANDROID_SDK		?= $(ANDROID_HOME)
ANDROID_JAR		?= $(ANDROID_SDK)/platforms/android-23/android.jar
JAVAC					?= javac
JAR						?= jar
TOOLS					= ./libs/qgr-tools
GYP						= $(TOOLS)/gyp/gyp
LIBS_DIR 			= out/$(OS).$(SUFFIX).$(BUILDTYPE)
TOOLS_OUT			= out/qgr-tools
BUILD_STYLE 	=	make

#######################

STYLES		= make xcode msvs make-linux cmake-linux cmake
GYPFILES	= Makefile qgr.gyp tools/common.gypi out/config.gypi tools.gyp tools/tools.gypi
GYP_ARGS	= -Goutput_dir="out" \
-Iout/var.gypi -Iout/config.gypi -Itools/common.gypi -S.$(OS).$(SUFFIX) --depth=.

ifeq ($(V), 1)
V_ARG = "V=1"
endif

ifeq ($(OS), android)
BUILD_STYLE = make-linux
endif

gen_project=\
	echo "{'variables':{'project':'$(1)'}}" > out/var.gypi; \
	GYP_GENERATORS=$(1) $(GYP) -f $(1) $(2) --generator-output="out/$(1)" $(GYP_ARGS)

make_compile=\
	$(ENV) $(1) -C "out/$(BUILD_STYLE)" -f Makefile.$(OS).$(SUFFIX) \
	CXX="$(CXX)" LINK="$(LINK)" $(V_ARG) BUILDTYPE=$(BUILDTYPE) \
	builddir="$(shell pwd)/$(LIBS_DIR)"

.PHONY: $(STYLES) jsa-shell install install-dev install-tools \
	help all clean build web ios android osx doc test2 watch

.SECONDEXPANSION:

###################### Build ######################

all: build

# GYP file generation targets.
$(STYLES): $(GYPFILES)
	@$(call gen_project,$@,qgr.gyp)

build: $(BUILD_STYLE) # out/$(BUILD_STYLE)/Makefile.$(OS).$(SUFFIX)
	@$(call make_compile,$(MAKE))

jsa-shell: $(GYPFILES)
	@$(call gen_project,$(BUILD_STYLE),tools.gyp)
	@$(call make_compile,$(MAKE))
	@mkdir -p $(TOOLS)/bin/$(OS)
	@cp $(LIBS_DIR)/jsa-shell $(TOOLS)/bin/$(OS)/jsa-shell

test2: $(GYPFILES)
	#make -C test -f test2.mk
	@$(call gen_project,$(BUILD_STYLE),test2.gyp)
	@$(call make_compile,$(MAKE))

#################################################

# build all ios platform and output to product dir
ios: $(TOOLS)/bin/${OS}/jsa-shell
	#@./configure --os=ios --arch=arm --library=shared
	#@$(MAKE)   # armv7 say goodbye 
	@./configure --os=ios --arch=x64 --library=shared
	@$(MAKE)
	@./configure --os=ios --arch=arm64 --library=shared --without-embed-bitcode
	@$(MAKE)
	@./configure --os=ios --arch=arm64 --library=shared --without-embed-bitcode -v8 --suffix=arm64.v8
	@$(MAKE)
	@$(NODE) ./tools/gen_apple_framework.js ios \
					 $(TOOLS_OUT)/product/ios/iphonesimulator/Release/Frameworks \
					 ./out/ios.x64.Release/libqgr.dylib 
	# @$(NODE) ./tools/gen_apple_framework.js ios \
	# 				 $(TOOLS_OUT)/product/ios/iphonesimulator/Debug/Frameworks \
	# 				 ./out/ios.x64.Release/libqgr.dylib 
	@$(NODE) ./tools/gen_apple_framework.js ios \
					 $(TOOLS_OUT)/product/ios/iphoneos/Release/Frameworks \
					 ./out/ios.arm64.Release/libqgr.dylib # out/ios.armv7.Release/libqgr.dylib
	@$(NODE) ./tools/gen_apple_framework.js ios \
					 $(TOOLS_OUT)/product/ios/iphoneos/Debug/Frameworks \
					 ./out/ios.arm64.v8.Release/libqgr.dylib

# build all android platform and output to product dir
android: $(TOOLS)/bin/${OS}/jsa-shell
	@./configure --os=android --arch=x86 --library=shared
	@$(MAKE)
	@./configure --os=android --arch=arm64 --library=shared
	@$(MAKE)
	@./configure --os=android --arch=arm --library=shared
	@$(MAKE)
	@$(MAKE) out/android.classs.qgr.jar

out/android.classs.qgr.jar: android/org/qgr/*.java
	@mkdir -p out/android.classs
	@rm -rf out/android.classs/*
	@$(JAVAC) -bootclasspath $(ANDROID_JAR) -d out/android.classs android/org/qgr/*.java
	@cd out/android.classs; $(JAR) cfv qgr.jar .
	@mkdir -p $(TOOLS_OUT)/product/android/libs
	@cp out/android.classs/qgr.jar $(TOOLS_OUT)/product/android/libs

$(TOOLS)/bin/${OS}/jsa-shell:
	@./configure --media=0
	@$(MAKE) jsa-shell

# install qgr command
install:
	@$(MAKE) ios
	@$(MAKE) android
	@$(MAKE) install-tools

# debug install qgr command
install-dev:
	@./configure --media=0
	@$(MAKE) jsa-shell
	@./$(TOOLS)/install link

install-tools:
	@sudo rm -rf ./out/qgr-tools/bin/shell.js
	@$(NODE) ./tools/cp-qgr-tools.js
	@$(TOOLS_OUT)/install

#################################################

doc:
	@$(NODE) tools/gen_html_doc.js doc out/doc

web:
	@$(NODE) --inspect=0.0.0.0:9229 tools/server.js

clean:
	@rm -rfv out/$(OS).*
	@rm -rfv out/product/qgr/product/$(OS)

help:
	@echo
	@echo Run \"make\" start compile
	@echo Run \"make xcode\" output xcode project file
	@echo You must first call before calling make \"./configure\"
	@echo

watch:
	@./tools/sync_watch
