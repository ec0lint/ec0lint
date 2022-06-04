/* ec0lint no-useless-return: "error" */
/* ec0lint no-trailing-spaces: "error" */
function f() {
    if (true) {
        return;
    } else {
        return 1;
    }
}
