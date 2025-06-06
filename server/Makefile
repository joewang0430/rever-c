SRC_DIR  := c_src/archives
LIB_DIR  := shared_libs
C_FILES  := $(wildcard $(SRC_DIR)/*.c)
SO_TARGETS := $(patsubst $(SRC_DIR)/%.c,$(LIB_DIR)/lib%.so,$(C_FILES))

all: $(SO_TARGETS)

$(LIB_DIR)/lib%.so: $(SRC_DIR)/%.c
	mkdir -p $(LIB_DIR)
	gcc -O2 -std=c99 -fPIC -shared -o $@ $<

clean:
	rm -rf $(LIB_DIR)/*.so