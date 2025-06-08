int testLayer1(void);
void testLayer2(void);

int testLayer1(void) {
    int test = 20;
    return test;
}

void testLayer2(void) {
    testLayer1();
}
