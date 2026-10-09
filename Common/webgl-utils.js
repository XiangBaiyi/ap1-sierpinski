// webgl‑utils.js minimal subset from Angel examples
function getWebGLContext(canvas, opt_attribs) {
    var names = ["webgl2", "webgl", "experimental‑webgl"];
    var context = null;
    for (var ii = 0; ii < names.length; ++ii) {
        try {
            context = canvas.getContext(names[ii], opt_attribs);
        } catch (e) { }
        if (context) {
            break;
        }
    }
    return context;
}
