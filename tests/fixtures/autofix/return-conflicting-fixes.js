/* ec0lint no-useless-return: "error" */
function f() {
    if (true) {
        return;
    } else {
        return 1;
    }
}
