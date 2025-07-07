import os
import time

def cleanup_ttl():
    print(">>> running cleanup_ttl at", time.ctime())
    """
    Delete files older than their TTL in:
      - data/c_src/caches           → 36 hours
      - data/shared_libs/caches     → 36 hours
      - data/c_src/candidates       → 1 hour
      - data/shared_libs/candidates → 1 hour

    Skip .gitkeep so that empty dirs remain.
    """
    base = os.getcwd()
    now  = time.time()

    # Define TTLs in seconds
    ttls = {
        "caches":       36 * 3600,    # `caches` are kept for 36 hours
        "candidates":   1 * 3600,    # `candidates` are kept for 1 hour
    }

    # Files to ignore from cleaning up
    ignore_files = {".gitkeep", "lab8part2.h", "liblab8part2.h", "rvc_tools.c", "rvc.h"}

    for category, ttl in ttls.items():
        for subdir in ("data/c_src", "data/shared_libs"):
            path = os.path.join(base, subdir, category)
            if not os.path.isdir(path):
                continue
            for fname in os.listdir(path):
                # always skip these files
                if fname in ignore_files:
                    continue
                fpath = os.path.join(path, fname)
                if not os.path.isfile(fpath):
                    continue
                age = now - os.path.getmtime(fpath)
                if age > ttl:
                    try:
                        os.remove(fpath)
                    except OSError:
                        pass
