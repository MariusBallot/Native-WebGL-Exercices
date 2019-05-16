console.log('helloWorld')

let CANVAS_WIDTH = window.innerWidth
let CANVAS_HEIGHT = window.innerHeight

let canvas = document.querySelector("#c")
let gl = canvas.getContext("webgl")
console.log(gl)

if (!gl) {
    console.log('pas de webgl')
}

function createShader(gl, type, source) {
    let shader = gl.createShader(type)
    gl.shaderSource(shader, source);
    gl.compileShader(shader)
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if (success) {
        return shader
    }

    console.log(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
}

let vertexShaderSource = document.getElementById('2d-vertex-shader').text
let fragmentShaderSource = document.getElementById('2d-fragment-shader').text

let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

function createProgram(gl, vertexShader, fragmentShader) {
    let program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)

    gl.linkProgram(program)

    let success = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
}

function resize() {
    canvas.style.width = CANVAS_WIDTH + 'px'
    canvas.style.height = CANVAS_HEIGHT + 'px'
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
}
resize()


let program = createProgram(gl, vertexShader, fragmentShader)
let resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution")


let positionAttributeLocation = gl.getAttribLocation(program, "a_position")
let positionBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x2, y2,
        x1, y2,
        x2, y1
    ]), gl.STATIC_DRAW)

}

function randomInt(range) {
    return Math.floor(Math.random() * range);
}




// webglUtils.resizeCanvasToDisplaySize(gl.canvas);
gl.viewport(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
gl.clearColor(0, 0, 0, 1)
gl.clear(gl.COLOR_BUFFER_BIT)
gl.useProgram(program)

gl.enableVertexAttribArray(positionAttributeLocation)

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
let size = 2
let type = gl.FLOAT
let normalize = false
let stride = 0;
gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, 0)

//SET RESOLUTION
gl.uniform2f(resolutionUniformLocation, CANVAS_WIDTH, CANVAS_HEIGHT)

//DRAWING
let primitiveType = gl.TRIANGLES
let offset = 0
let count = 6


for (var i = 0; i < 50; i++) {
    setRectangle(gl, randomInt(CANVAS_WIDTH), randomInt(CANVAS_HEIGHT), randomInt(300), randomInt(300))
    gl.drawArrays(gl.TRIANGLES, 0, count)
}