import os
import ctypes

# location of the shared library
HERE = os.path.dirname(os.path.abspath(__file__))      # .../app/utils
BASE = os.path.abspath(os.path.join(HERE, "..", ".."))  # .../server

#SO_PATH = os.path.join(BASE, "shared_libs", "libtest.so")
SO_PATH = os.path.join(
    BASE,
    "data",       # here fills the data folder
    "shared_libs",
    "archives",
    "2025",       # here fills the year
    "test.so"     # here fills the source file name without prefix
)

def call_test_layer1() -> int:
    """
    1. check if the shared library exists
    2. load the shared library
    3. call testLayer1() and return its int result
    """
    if not os.path.exists(SO_PATH):
        raise FileNotFoundError(f"Cannot find shared librarty {SO_PATH}, please compile C to generate libtest.so first.")

    # load .so
    lib = ctypes.CDLL(SO_PATH)

    # declear function signiture ：testLayer1(void) → int
    lib.testLayer1.argtypes = []          # no arguments
    lib.testLayer1.restype = ctypes.c_int  # return int

    # call directly, return ctypes.c_int
    ret = lib.testLayer1()
    return int(ret)
