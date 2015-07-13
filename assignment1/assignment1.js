
var canvas;
var gl;

var points = [];
var pointsRotated = [];

var NumTimesToSubdivide = 5;
var angle = 0;
var show = "triangle";

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    pointsRotated = [];

    if(show == "triangle")
    {
      var vertices = [
          vec2( -0.5, -0.5 ),
          vec2(  0,  0.5 ),
          vec2(  0.5, -0.5 )
      ];
    }
    else
    {
      var vertices = [
          vec2( -0.5, -0.5 ),
          vec2(  -0.5,  0.5 ),
          vec2(  0.5, -0.5 ),
          vec2( 0.5, -0.5 ),
          vec2(  -0.5,  0.5 ),
          vec2(  0.5, 0.5 )
      ];
    }

    points = Array();

    if(show == "triangle")
    {
      divideTriangle( vertices[0], vertices[1], vertices[2],
                      NumTimesToSubdivide);
    }
    else
    {
      divideSquare( vertices[0], vertices[1], vertices[2],
                    vertices[3], vertices[4], vertices[5],
                      NumTimesToSubdivide)
    }

    rotate();

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsRotated), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();

    document.getElementById("slider-subdivisions").onchange = function() {
        NumTimesToSubdivide = event.srcElement.value;
        document.getElementById("num-subdivisons").innerHTML = event.srcElement.value;
        init();
    };

    document.getElementById("slider-angle").onchange = function() {
        angle = event.srcElement.value;
        angle = Math.PI * angle / 180.0;
        document.getElementById("num-angle").innerHTML = event.srcElement.value;
        init();
    };

    document.getElementById( "triangleButton" ).onclick = function () {
        show = "triangle";
        init();
    };

    document.getElementById( "squareButton" ).onclick = function () {
        show = "square";
        init();
    };
};

function triangle( a, b, c )
{
    points.push( a, b, c );
}

function rotate()
{

  for(var i=0; i<points.length; i++)
  {
    var x = points[i][0];
    var y = points[i][1];

    var d = Math.sqrt((x*x+y*y));

    var xx = x * Math.cos(d*angle) - y * Math.sin(d*angle);
    var yy = x * Math.sin(d*angle) + y * Math.cos(d*angle);

    pointsRotated.push(vec2(xx,yy))
  }
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
        divideTriangle( ab, bc, ac, count );
    }
}

function divideSquare( a, b, c, d, e, f, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        var de = mix( d, e, 0.5 );
        var df = mix( d, f, 0.5 );
        var ef = mix( e, f, 0.5 );

        --count;

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
        divideTriangle( ab, bc, ac, count );

        divideTriangle( d, de, df, count );
        divideTriangle( f, df, ef, count );
        divideTriangle( e, ef, de, count );
        divideTriangle( de, ef, df, count );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, pointsRotated.length );
    console.log(pointsRotated.length);
}
