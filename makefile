PATH  := node_modules/.bin:$(PATH)
# TODO: use the shell that is available bash / ash or install bash in dockerfile

SRC_FILES := $(shell find src/ -type f | grep -v __tests__)
LIB_FILES := $(patsubst src/%.js, lib/%.js, $(SRC_FILES))
BABEL_OPTS := --plugins transform-flow-strip-types --presets env

.PHONY: all

all: dirs $(LIB_FILES)

dirs: 
	@mkdir -p lib

clean:
	rm -r lib

lib/%.js: src/%.js makefile
	@mkdir -p $(dir $@)
	babel $(BABEL_OPTS) -o $@ $<
