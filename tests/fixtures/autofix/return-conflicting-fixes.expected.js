/* ec0lint no-useless-return: "error" */
function f() {
    if (true) {

    } else {
        return 1;
    }
}
