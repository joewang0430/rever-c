# Root directory for source files
SRC_BASE   := c_src/archives
# Root directory for shared libraries
LIB_BASE   := shared_libs/archives

# Find all .c files
SRCS       := $(shell find $(SRC_BASE) -type f -name '*.c')
# Corresponding .so targets
SO_TARGETS := $(patsubst $(SRC_BASE)/%.c,$(LIB_BASE)/%.so,$(SRCS))

.PHONY: all clean

all: $(SO_TARGETS)

# Pattern rule: c_src/archives/YYYY/name.c → shared_libs/archives/YYYY/name.so
$(LIB_BASE)/%.so: $(SRC_BASE)/%.c
	# Ensure target directory exists
	mkdir -p $(dir $@)
	# Compile into shared library
	gcc -O2 -std=c99 -fPIC -shared -o $@ $<

clean:
	rm -rf shared_libs/archives