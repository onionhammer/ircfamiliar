ifeq ($(OS),Windows_NT)
	output 		   = iRCFamiliar.exe
	versioninfoout = versioninfo.exe
	SHELL 		   = C:/Windows/System32/cmd.exe
else
	output 	       = iRCFamiliar
	versioninfoout = versioninfo
endif

SCRIPTS := $(shell ls public/scripts/src/*.ts)
STYLES  := $(shell ls public/css/src/*.less)


##BUILD#####
all: public/scripts/app.min.js public/css/style.min.css $(output)
release: public/scripts/app.min.js.gzip public/css/style.min.css.gzip binrelease
#-----------#


##FAMILIAR##
$(output): *.nim ircclient/*.nim web/*.nim web/views/*.nim web/views/templates/*.nim web/views/partials/*.nim $(versioninfoout)
	nimrod \
		-d:debug \
		--out:$(output) \
		--parallelBuild:1 \
		c main.nim

binrelease: *.nim ircclient/*.nim web/*.nim web/views/*.nim web/views/templates/*.nim web/views/partials/*.nim $(versioninfoout)
	nimrod \
		-d:release \
		--out:$(output) \
		--gc:markAndSweep \
		--passC:-Ofast \
		c main.nim
#-----------#


##VERSION###
$(versioninfoout): versioninfo.nim
	nimrod c versioninfo.nim
#-----------#


##SCRIPTS###
public/scripts/app.js: public/scripts/src/*.ts public/scripts/src/library/*.*
	tsc --out public/scripts/app.js \
		$(SCRIPTS)

public/scripts/app.min.js: public/scripts/app.js
	ccjs public/scripts/app.js \
		--compilation_level=SIMPLE_OPTIMIZATIONS > \
		public/scripts/app.min.js

public/scripts/app.min.js.gzip: public/scripts/app.min.js
	gzip -9 -c public/scripts/app.min.js > public/scripts/app.min.js.gzip
#-----------#


##CSS#######
public/css/style.css: public/css/src/*.less
	lessc \
		public/css/src/style.less > public/css/style.css

public/css/style.min.css: public/css/style.css
	lessc --clean-css \
		public/css/style.css > public/css/style.min.css

public/css/style.min.css.gzip: public/css/style.min.css
	gzip -9 -c public/css/style.min.css > public/css/style.min.css.gzip
#-----------#


##CLEANUP####
clean:
	rm -rf nimcache
	rm $(output)
	rm $(versioninfoout)
	rm public/scripts/*.js
	rm public/css/*.css
#-----------#