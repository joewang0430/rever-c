# Makefile – compile all C sources under c_src into shared libraries under shared_libs

# --- Directory variables ---
SRC_ARCHIVES   := c_src/archives
LIB_ARCHIVES   := shared_libs/archives
SRC_CANDIDATES := c_src/candidates
LIB_CANDIDATES := shared_libs/candidates

# --- Source file lists ---
# Find all .c under the archives hierarchy
ARCH_SRCS      := $(shell find $(SRC_ARCHIVES) -type f -name '*.c')
# Find all .c directly under candidates
CAND_SRCS      := $(wildcard $(SRC_CANDIDATES)/*.c)

# --- Target file lists ---
# Map c_src/archives/YYYY/name.c → shared_libs/archives/YYYY/name.so
ARCH_TARGS     := $(patsubst $(SRC_ARCHIVES)/%.c,$(LIB_ARCHIVES)/%.so,$(ARCH_SRCS))
# Map c_src/candidates/foo.c → shared_libs/candidates/foo.so
CAND_TARGS     := $(patsubst $(SRC_CANDIDATES)/%.c,$(LIB_CANDIDATES)/%.so,$(CAND_SRCS))

# All .so targets
SO_TARGETS     := $(ARCH_TARGS) $(CAND_TARGS)

.PHONY: all clean

# Default: build every shared library
all: $(SO_TARGETS)

# --- Rules for archives (year subfolders) ---
# For each target shared_libs/archives/YYYY/name.so
# we compile from         c_src/archives/YYYY/name.c
$(LIB_ARCHIVES)/%.so: $(SRC_ARCHIVES)/%.c
	@# Ensure the year directory exists
	mkdir -p $(dir $@)
	@# Compile into a shared library
	gcc -O2 -std=c99 -fPIC -shared -o $@ $<

# --- Rules for candidates (flat directory) ---
# For each target shared_libs/candidates/foo.so
# we compile from     c_src/candidates/foo.c
$(LIB_CANDIDATES)/%.so: $(SRC_CANDIDATES)/%.c
	@# Ensure the candidates directory exists
	mkdir -p $(dir $@)
	@# Compile into a shared library
	gcc -O2 -std=c99 -fPIC -shared -o $@ $<

# Remove all generated .so files (but leave directory structure intact)
clean:
	@rm -f $(ARCH_TARGS) $(CAND_TARGS)
