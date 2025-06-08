# Makefile – compile all C sources under c_src into shared libraries under shared_libs

# --- Directory variables ---
# Archives: has year subfolders
SRC_ARCHIVES   := c_src/archives
LIB_ARCHIVES   := shared_libs/archives

SRC_CANDIDATES := c_src/candidates
LIB_CANDIDATES := shared_libs/candidates

SRC_CACHES     := c_src/caches
LIB_CACHES     := shared_libs/caches

# --- Source file lists ---
# Find all .c under corresponding hierarchy
ARCH_SRCS      := $(shell find $(SRC_ARCHIVES) -type f -name '*.c')
CAND_SRCS      := $(wildcard $(SRC_CANDIDATES)/*.c)
CACHE_SRCS     := $(wildcard $(SRC_CACHES)/*.c)

# --- Target file lists ---
# archives/YYYY/name.c → shared_libs/archives/YYYY/name.so
# candidates/foo.c → shared_libs/candidates/foo.so
# caches/foo.c → shared_libs/caches/foo.so
ARCH_TARGS     := $(patsubst $(SRC_ARCHIVES)/%.c,$(LIB_ARCHIVES)/%.so,$(ARCH_SRCS))
CAND_TARGS     := $(patsubst $(SRC_CANDIDATES)/%.c,$(LIB_CANDIDATES)/%.so,$(CAND_SRCS))
CACHE_TARGS    := $(patsubst $(SRC_CACHES)/%.c,$(LIB_CACHES)/%.so,$(CACHE_SRCS))

# All shared-object targets
SO_TARGETS     := $(ARCH_TARGS) $(CAND_TARGS) $(CACHE_TARGS)

.PHONY: all clean

# Default: build every shared library
all: $(SO_TARGETS)

# -------------------------------------------------------------------
# Archives rule: compile c_src/archives/YYYY/name.c →
#                  shared_libs/archives/YYYY/name.so
$(LIB_ARCHIVES)/%.so: $(SRC_ARCHIVES)/%.c
	@# ensure the year directory exists
	mkdir -p $(dir $@)
	@# compile into shared library
	gcc -O2 -std=c99 -fPIC -shared -o $@ $<

# -------------------------------------------------------------------
# Candidates rule: compile c_src/candidates/foo.c →
#                     shared_libs/candidates/foo.so
$(LIB_CANDIDATES)/%.so: $(SRC_CANDIDATES)/%.c
	@# ensure the candidates directory exists
	mkdir -p $(dir $@)
	@# compile into shared library
	gcc -O2 -std=c99 -fPIC -shared -o $@ $<

# -------------------------------------------------------------------
# Caches rule: compile c_src/caches/foo.c →
#                 shared_libs/caches/foo.so
$(LIB_CACHES)/%.so: $(SRC_CACHES)/%.c
	@# ensure the caches directory exists
	mkdir -p $(dir $@)
	@# compile into shared library
	gcc -O2 -std=c99 -fPIC -shared -o $@ $<

# -------------------------------------------------------------------
# Clean up all generated .so files but keep the directory structure
clean:
	@rm -f $(ARCH_TARGS) $(CAND_TARGS) $(CACHE_TARGS)
