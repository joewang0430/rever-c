# Makefile – pre comile all the archived code

# --- Directory variables ---
# Archives: has year subfolders
SRC_ARCHIVES   := data/c_src/archives
LIB_ARCHIVES   := data/shared_libs/archives

# --- Source file lists ---
# Find all .c under corresponding hierarchy
ARCH_SRCS      := $(shell find $(SRC_ARCHIVES) -type f -name '*.c')

# --- Target file lists ---
# archives/group/name.c → shared_libs/archives/group/name.so
ARCH_TARGS     := $(patsubst $(SRC_ARCHIVES)/%.c,$(LIB_ARCHIVES)/%.so,$(ARCH_SRCS))

# All shared-object targets
SO_TARGETS     := $(ARCH_TARGS)

.PHONY: all clean

# Default: build every shared library
all: $(SO_TARGETS)

# -------------------------------------------------------------------
# Archives rule: compile c_src/archives/group/name.c →
#                  shared_libs/archives/group/name.so
$(LIB_ARCHIVES)/%.so: $(SRC_ARCHIVES)/%.c
	@# ensure the year directory exists
	mkdir -p $(dir $@)
	@# compile into shared library
	gcc -O2 -std=c99 -fPIC -shared -o $@ $<

# -------------------------------------------------------------------
# Clean up all generated .so files but keep the directory structure
clean:
	@rm -f $(ARCH_TARGS)
