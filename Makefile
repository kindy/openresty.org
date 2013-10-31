.PHONY:  build

build: node_modules
	mkdir -p build
	mkdir -p cn/build
	if [ ! -e cn/build/cn ]; then ln -s . cn/build/cn; fi
	./util/build.js

convert:
	phantomjs util/convert.js 

node_modules:
	npm install
