import os

def cleanup_candidates():
    """
    Delete all .c under c_src/candidates and all .so under shared_libs/candidates,
    but leave any other files (e.g. .gitkeep) intact.
    """
    # Paths relative to the project root
    project_root = os.getcwd()
    src_dir = os.path.join(project_root, "c_src", "candidates")
    lib_dir = os.path.join(project_root, "shared_libs", "candidates")

    # Remove all .c files in c_src/candidates
    if os.path.isdir(src_dir):
        for fname in os.listdir(src_dir):
            if fname.endswith(".c"):
                try:
                    os.remove(os.path.join(src_dir, fname))
                except OSError:
                    pass

    # Remove all .so files in shared_libs/candidates
    if os.path.isdir(lib_dir):
        for fname in os.listdir(lib_dir):
            if fname.endswith(".so"):
                try:
                    os.remove(os.path.join(lib_dir, fname))
                except OSError:
                    pass
