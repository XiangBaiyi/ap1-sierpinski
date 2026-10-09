export const vertexShaderSource = `
attribute vec2 vPosition;
uniform mat3 uTransform;
uniform float uPointSize;
void main(){
    vec3 pos = uTransform * vec3(vPosition,1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);
    gl_PointSize = uPointSize;
}
`;

export const fragmentShaderSource = `
precision mediump float;
uniform vec3 uColor;
void main(){
    gl_FragColor = vec4(uColor,1.0);
}
`;
