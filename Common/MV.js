// MV.js minimal subset for Angel 8th WebGL projects
function vec2(x, y) { return new Float32Array([x, y]); }
function vec3(x, y, z) { return new Float32Array([x, y, z]); }
function vec4(x, y, z, w) { return new Float32Array([x, y, z, w]); }

function mat3() {
    var out = new Float32Array(9);
    mat3.identity(out);
    return out;
}
mat3.identity = function (out) {
    out[0] = 1; out[1] = 0; out[2] = 0;
    out[3] = 0; out[4] = 1; out[5] = 0;
    out[6] = 0; out[7] = 0; out[8] = 1;
    return out;
};

function mat4() {
    var out = new Float32Array(16);
    mat4.identity(out);
    return out;
}
mat4.identity = function (out) {
    out[0] = 1; out[1] = 0; out[2] = 0; out[3] = 0;
    out[4] = 0; out[5] = 1; out[6] = 0; out[7] = 0;
    out[8] = 0; out[9] = 0; out[10] = 1; out[11] = 0;
    out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1;
    return out;
};

mat4.mult = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    var b00 = b[0], b01 = b[1], b02 = b[2], b03 = b[3];
    var b10 = b[4], b11 = b[5], b12 = b[6], b13 = b[7];
    var b20 = b[8], b21 = b[9], b22 = b[10], b23 = b[11];
    var b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15];

    out[0] = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
    out[1] = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
    out[2] = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
    out[3] = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;

    out[4] = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
    out[5] = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
    out[6] = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
    out[7] = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;

    out[8] = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
    out[9] = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
    out[10] = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
    out[11] = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;

    out[12] = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;
    out[13] = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;
    out[14] = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;
    out[15] = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;
    return out;
};

mat4.translate = function (out, a, v) {
    var x = v[0], y = v[1], z = v[2];
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
    out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
    out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;
    out[12] = x * a00 + y * a10 + z * a20 + a30;
    out[13] = x * a01 + y * a11 + z * a21 + a31;
    out[14] = x * a02 + y * a12 + z * a22 + a32;
    out[15] = x * a03 + y * a13 + z * a23 + a33;
    return out;
};

mat4.rotate = function (out, a, rad, axis) {
    var x = axis[0], y = axis[1], z = axis[2];
    var len = Math.sqrt(x * x + y * y + z * z);
    if (len < 1e-6) return mat4.copy(out, a);
    x /= len; y /= len; z /= len;
    var s = Math.sin(rad), c = Math.cos(rad), ic = 1 - c;

    var r00 = x * x * ic + c; var r01 = y * x * ic + z * s; var r02 = z * x * ic - y * s;
    var r10 = x * y * ic - z * s; var r11 = y * y * ic + c; var r12 = z * y * ic + x * s;
    var r20 = x * z * ic + y * s; var r21 = y * z * ic - x * s; var r22 = z * z * ic + c;

    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    out[0] = r00 * a00 + r01 * a10 + r02 * a20;
    out[1] = r00 * a01 + r01 * a11 + r02 * a21;
    out[2] = r00 * a02 + r01 * a12 + r02 * a22;
    out[3] = r00 * a03 + r01 * a13 + r02 * a23;

    out[4] = r10 * a00 + r11 * a10 + r12 * a20;
    out[5] = r10 * a01 + r11 * a11 + r12 * a21;
    out[6] = r10 * a02 + r11 * a12 + r12 * a22;
    out[7] = r10 * a03 + r11 * a13 + r12 * a23;

    out[8] = r20 * a00 + r21 * a10 + r22 * a20;
    out[9] = r20 * a01 + r21 * a11 + r22 * a21;
    out[10] = r20 * a02 + r21 * a12 + r22 * a22;
    out[11] = r20 * a03 + r21 * a13 + r22 * a23;

    out[12] = a30; out[13] = a31; out[14] = a32; out[15] = a33;
    return out;
};

mat4.scale = function (out, a, v) {
    var x = v[0], y = v[1], z = v[2];
    out[0] = a[0] * x; out[1] = a[1] * x; out[2] = a[2] * x; out[3] = a[3] * x;
    out[4] = a[4] * y; out[5] = a[5] * y; out[6] = a[6] * y; out[7] = a[7] * y;
    out[8] = a[8] * z; out[9] = a[9] * z; out[10] = a[10] * z; out[11] = a[11] * z;
    out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
    return out;
};

mat4.copy = function (out, a) {
    for (var i = 0; i < 16; i++) out[i] = a[i];
    return out;
};

mat4.ortho = function (out, left, right, bottom, top, near, far) {
    var lr = 1 / (left - right), bt = 1 / (bottom - top), nf = 1 / (near - far);
    out[0] = -2 * lr; out[1] = 0; out[2] = 0; out[3] = 0;
    out[4] = 0; out[5] = -2 * bt; out[6] = 0; out[7] = 0;
    out[8] = 0; out[9] = 0; out[10] = 2 * nf; out[11] = 0;
    out[12] = (left + right) * lr; out[13] = (bottom + top) * bt; out[14] = (far + near) * nf; out[15] = 1;
    return out;
};

mat4.perspective = function (out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2);
    var nf = 1 / (near - far);
    out[0] = f / aspect; out[1] = 0; out[2] = 0; out[3] = 0;
    out[4] = 0; out[5] = f; out[6] = 0; out[7] = 0;
    out[8] = 0; out[9] = 0; out[10] = (far + near) * nf; out[11] = -1;
    out[12] = 0; out[13] = 0; out[14] = 2 * far * near * nf; out[15] = 0;
    return out;
};

