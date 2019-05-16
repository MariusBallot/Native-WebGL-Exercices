function main() {

    render();
}

function render() {

    var translation = [150, 150];
    var angleInRadians = 80;
    var scale = [1, 1];

    var m3 = {
        translation: function (tx, ty) {
            return [
                1, 0, 0,
                0, 1, 0,
                tx, ty, 1,
            ];
        },

        rotation: function (angleInRadians) {
            var c = Math.cos(angleInRadians);
            var s = Math.sin(angleInRadians);
            return [
                c, -s, 0,
                s, c, 0,
                0, 0, 1,
            ];
        },

        scaling: function (sx, sy) {
            return [
                sx, 0, 0,
                0, sy, 0,
                0, 0, 1,
            ];
        },
        multiply: function (a, b) {
            var a00 = a[0 * 3 + 0];
            var a01 = a[0 * 3 + 1];
            var a02 = a[0 * 3 + 2];
            var a10 = a[1 * 3 + 0];
            var a11 = a[1 * 3 + 1];
            var a12 = a[1 * 3 + 2];
            var a20 = a[2 * 3 + 0];
            var a21 = a[2 * 3 + 1];
            var a22 = a[2 * 3 + 2];
            var b00 = b[0 * 3 + 0];
            var b01 = b[0 * 3 + 1];
            var b02 = b[0 * 3 + 2];
            var b10 = b[1 * 3 + 0];
            var b11 = b[1 * 3 + 1];
            var b12 = b[1 * 3 + 2];
            var b20 = b[2 * 3 + 0];
            var b21 = b[2 * 3 + 1];
            var b22 = b[2 * 3 + 2];
            return [
                b00 * a00 + b01 * a10 + b02 * a20,
                b00 * a01 + b01 * a11 + b02 * a21,
                b00 * a02 + b01 * a12 + b02 * a22,
                b10 * a00 + b11 * a10 + b12 * a20,
                b10 * a01 + b11 * a11 + b12 * a21,
                b10 * a02 + b11 * a12 + b12 * a22,
                b20 * a00 + b21 * a10 + b22 * a20,
                b20 * a01 + b21 * a11 + b22 * a21,
                b20 * a02 + b21 * a12 + b22 * a22,
            ];
        },
    };


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


    //RESIZE CANVAS-------------------------------------------


    function resize() {
        canvas.style.width = CANVAS_WIDTH + 'px'
        canvas.style.height = CANVAS_HEIGHT + 'px'
        canvas.width = CANVAS_WIDTH
        canvas.height = CANVAS_HEIGHT
    }
    resize()


    //FILLS ATTRIBUTES AND UNIFORMS-------------------------------------------

    let positionAttributeLocation = gl.getAttribLocation(program, "a_position")

    let resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution")
    var matrixLocation = gl.getUniformLocation(program, "u_matrix");


    //CREATE BUFFERS-------------------------------------------


    let positionBuffer = gl.createBuffer()


    //FILLS BUFFERS-------------------------------------------


    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    // setRectangle(gl, translation[0], translation[1], width, height)
    setGeometry(gl)


    gl.viewport(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(program)

    gl.enableVertexAttribArray(positionAttributeLocation)

    let size = 2
    let type = gl.FLOAT
    let normalize = false
    let stride = 0;
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, 0)



    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);


    // Compute the matrices
    let translationMatrix = m3.translation(translation[0], translation[1]);
    let rotationMatrix = m3.rotation(angleInRadians);
    let scaleMatrix = m3.scaling(scale[0], scale[1]);

    // Multiply the matrices.
    let matrix = m3.multiply(translationMatrix, rotationMatrix);
    matrix = m3.multiply(matrix, scaleMatrix);



    // Set the matrix.
    gl.uniformMatrix3fv(matrixLocation, false, matrix);


    //DRAWING
    let primitiveType = gl.TRIANGLES
    let offset = 0
    let count = 18
    gl.drawArrays(primitiveType, offset, count);


}

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

function setGeometry(gl) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            // left column
            0, 0,
            30, 0,
            0, 150,
            0, 150,
            30, 0,
            30, 150,

            // top rung
            30, 0,
            100, 0,
            30, 30,
            30, 30,
            100, 0,
            100, 30,

            // middle rung
            30, 60,
            67, 60,
            30, 90,
            30, 90,
            67, 60,
            67, 90,
        ]),
        gl.STATIC_DRAW);
}

main()