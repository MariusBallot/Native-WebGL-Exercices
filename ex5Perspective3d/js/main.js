var translation = [0, 0, -200];
var rotation = [degToRad(40), degToRad(25), degToRad(325)]
var scale = [1, 1, 1];


let CANVAS_WIDTH = window.innerWidth
let CANVAS_HEIGHT = window.innerHeight

let canvas = document.querySelector("#c")
let gl = canvas.getContext("webgl")
console.log(gl)

if (!gl) {
    console.log('pas de webgl')
}

//CREATE SHADERS-------------------------------------------

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

//CREATE PROGRAM-------------------------------------------


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

let program = createProgram(gl, vertexShader, fragmentShader)

var projectionMatrix = m4.perspective(45, CANVAS_WIDTH / CANVAS_HEIGHT, 0.1, 1000);



function drawScene() {
    let CANVAS_WIDTH = window.innerWidth
    let CANVAS_HEIGHT = window.innerHeight

    //RESIZE CANVAS-------------------------------------------
    function resize() {
        canvas.style.width = CANVAS_WIDTH + 'px'
        canvas.style.height = CANVAS_HEIGHT + 'px'
        canvas.width = CANVAS_WIDTH
        canvas.height = CANVAS_HEIGHT
    }
    resize()


    //FILLS ATTRIBUTES AND UNIFORMS-------------------------------------------

    let positionLocation = gl.getAttribLocation(program, "a_position")
    let colorLocation = gl.getAttribLocation(program, "a_color")

    var matrixLocation = gl.getUniformLocation(program, "u_matrix");


    //CREATE BUFFERS-------------------------------------------


    let positionBuffer = gl.createBuffer()
    let colorBuffer = gl.createBuffer()



    //FILLS BUFFERS-------------------------------------------


    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    setGeometry(gl)

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    setColor(gl)


    gl.viewport(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(program)


    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.vertexAttribPointer(
        positionLocation, 3, gl.FLOAT, false, 0, 0);


    gl.enableVertexAttribArray(colorLocation);

    // Bind the color buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
    var size = 3; // 3 components per iteration
    var type = gl.UNSIGNED_BYTE; // the data is 8bit unsigned values
    var normalize = true; // normalize the data (convert from 0-255 to 0-1)
    var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(
        colorLocation, size, type, normalize, stride, offset);



    // Compute the matrices

    let cameraMatrix = m4.yRotation(0)
    cameraMatrix = m4.translate(cameraMatrix, 0, 0, 300)

    // let viewMatrix = m4.inverse(cameraMatrix)
    // let viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix)

    var matrix = m4.perspective(45, CANVAS_WIDTH / CANVAS_HEIGHT, 0.1, 1000);
    matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
    matrix = m4.xRotate(matrix, rotation[0]);
    matrix = m4.yRotate(matrix, rotation[1]);
    matrix = m4.zRotate(matrix, rotation[2]);
    matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE)
    gl.enable(gl.DEPTH_TEST)

    //DRAWING
    let primitiveType = gl.TRIANGLES
    let count = 16 * 6
    gl.drawArrays(primitiveType, 0, count);

    rotation[2] += 0.01
    rotation[1] += 0.01

}

drawScene()