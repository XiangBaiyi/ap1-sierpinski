import { vertexShaderSource, fragmentShaderSource } from "./shaders.js";

function vec2(x, y) { return [x, y]; }
function mix(u, v, t) {
    return vec2((1 - t) * u[0] + t * v[0], (1 - t) * u[1] + t * v[1]);
}
function flatten(arr) {
    let out = [];
    for (let i = 0; i < arr.length; i++) {
        out.push(arr[i][0], arr[i][1]);
    }
    return new Float32Array(out);
}
//3阶矩阵：平移+缩放，用于鼠标拖拽缩放
function mat3Identity() {
    return new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
}
function mat3Translate(m, tx, ty) {
    const res = new Float32Array(m);
    res[6] += m[0] * tx + m[3] * ty;
    res[7] += m[1] * tx + m[4] * ty;
    return res;
}
function mat3Scale(m, sx, sy) {
    const res = new Float32Array(m);
    res[0] *= sx; res[1] *= sx; res[2] *= sx;
    res[3] *= sy; res[4] *= sy; res[5] *= sy;
    return res;
}

let gl, program;
let points = [];
let renderMode = 0;
let depthVal = 5;
let pointSizeVal = 2.0;
//三套配色
const colorSchemes = [
    [1.0, 1.0, 1.0],
    [0.2, 1.0, 1.0],
    [1.0, 0.5, 0.1]
];
let currentColor = colorSchemes[0];

//变换矩阵（平移缩放）
let transformMat = mat3Identity();
//鼠标拖拽状态
let isDrag = false;
let lastMouse = [0, 0];
//逐点生长动画
let animateOn = false;
let animateId = null;
let animateCount = 0;
const MAX_ANIMATE_POINTS = 10000;

const vertices = [vec2(-1, -1), vec2(0, 1), vec2(1, -1)];

export function initWebGL(canvas) {
    gl = canvas.getContext("webgl");
    program = initShaders(gl, vertexShaderSource, fragmentShaderSource);
    gl.useProgram(program);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //鼠标拖拽
    canvas.onmousedown = (e) => {
        isDrag = true;
        const rect = canvas.getBoundingClientRect();
        lastMouse = [e.clientX - rect.left, e.clientY - rect.top];
    };
    canvas.onmousemove = (e) => {
        if (!isDrag) return;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const dx = (mx - lastMouse[0]) * 2 / canvas.width;
        const dy = -(my - lastMouse[1]) * 2 / canvas.height;
        transformMat = mat3Translate(transformMat, dx, dy);
        lastMouse = [mx, my];
        render();
    };
    canvas.onmouseup = () => isDrag = false;
    canvas.onmouseleave = () => isDrag = false;
    //滚轮缩放
    canvas.onwheel = (e) => {
        e.preventDefault();
        const scaleFactor = e.deltaY > 0 ? 0.92 : 1.08;
        transformMat = mat3Scale(transformMat, scaleFactor, scaleFactor);
        render();
    };
}

export function setDepth(d) {
    depthVal = d;
    setRenderMode(renderMode);
}
export function setPointSize(s) {
    pointSizeVal = s;
    render();
}
export function setColorScheme(idx) {
    currentColor = colorSchemes[idx];
    render();
}
export function toggleAnimate() {
    animateOn = !animateOn;
    if (animateOn) {
        animateCount = 0;
        points = [];
        startAnimate();
    } else {
        if (animateId) cancelAnimationFrame(animateId);
    }
}
function startAnimate() {
    if (!animateOn) return;
    if (animateCount >= MAX_ANIMATE_POINTS) {
        animateOn = false;
        return;
    }
    const v = [vec2(-1, -1), vec2(0, 1), vec2(1, -1)];
    let p = vec2(0, 0);
    for (let i = 0; i < animateCount; i++) {
        let idx = Math.floor(Math.random() * 3);
        p = mix(p, v[idx], 0.5);
    }
    points = [];
    for (let i = 0; i < animateCount; i++) {
        let idx = Math.floor(Math.random() * 3);
        p = mix(p, v[idx], 0.5);
        points.push(p);
    }
    animateCount += 80;
    render();
    animateId = requestAnimationFrame(startAnimate);
}

export function setRenderMode(mode) {
    if (animateId) cancelAnimationFrame(animateId);
    animateOn = false;
    points = [];
    renderMode = mode;
    if (mode === 1) {
        drawLines(vertices[0], vertices[1], vertices[2], depthVal);
    } else if (mode === 2) {
        drawTriangles(vertices[0], vertices[1], vertices[2], depthVal);
    } else if (mode === 0) {
        let v = [vec2(-1, -1), vec2(0, 1), vec2(1, -1)];
        let p = vec2(0, 0);
        for (let i = 0; i < 10000; i++) {
            let idx = Math.floor(Math.random() * 3);
            p = mix(p, v[idx], 0.5);
            points.push(p);
        }
    }
    render();
}

//递归画线
function drawLines(a, b, c, depth) {
    if (depth === 0) {
        points.push(a, b);
        points.push(b, c);
        points.push(c, a);
        return;
    }
    let ab = mix(a, b, 0.5);
    let bc = mix(b, c, 0.5);
    let ca = mix(c, a, 0.5);
    drawLines(a, ab, ca, depth - 1);
    drawLines(ab, b, bc, depth - 1);
    drawLines(ca, bc, c, depth - 1);
}

//递归实心三角形
function drawTriangles(a, b, c, depth) {
    if (depth === 0) {
        points.push(a, b, c);
        return;
    }
    let ab = mix(a, b, 0.5);
    let bc = mix(b, c, 0.5);
    let ca = mix(c, a, 0.5);
    drawTriangles(a, ab, ca, depth - 1);
    drawTriangles(ab, b, bc, depth - 1);
    drawTriangles(ca, bc, c, depth - 1);
}

function render() {
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    const uTransform = gl.getUniformLocation(program, "uTransform");
    gl.uniformMatrix3fv(uTransform, false, transformMat);

    const uPointSize = gl.getUniformLocation(program, "uPointSize");
    gl.uniform1f(uPointSize, pointSizeVal);

    const uColor = gl.getUniformLocation(program, "uColor");
    gl.uniform3fv(uColor, currentColor);

    gl.clear(gl.COLOR_BUFFER_BIT);
    if (renderMode === 0) {
        gl.drawArrays(gl.POINTS, 0, points.length);
    } else if (renderMode === 1) {
        gl.drawArrays(gl.LINES, 0, points.length);
    } else if (renderMode === 2) {
        gl.drawArrays(gl.TRIANGLES, 0, points.length);
    }
}


