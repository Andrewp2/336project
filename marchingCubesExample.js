var scene;
var camera;
var renderer;
var light;
var pointLight;
var ambientLight;
var camera;
let heightMap;
var cubesMaterial;
var controls;
var clock;

let chunkGridSize = 4;
let chunkGridSize2 = chunkGridSize * chunkGridSize;
let resolution = 50;

var chunks;

function main() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    var ourCanvas = document.getElementById('theCanvas');
    renderer = new THREE.WebGLRenderer({canvas: ourCanvas});
    renderer.setClearColor(0x003333);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaOutput = true;
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild(renderer.domElement);

    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0.5, 0.5, 1 );
    light.position.normalize();
    scene.add( light );
    pointLight = new THREE.PointLight( 0xffffff );
    pointLight.position.set( 400, 500, 200 );
    scene.add( pointLight );
    ambientLight = new THREE.AmbientLight( 0x080808 );
    scene.add( ambientLight );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 100000 );
    camera.position.set(2000,2000 * chunkGridSize,2000 );
    camera.lookAt(0,0,0);

    heightMap = generateHeight(resolution*chunkGridSize, resolution * chunkGridSize);
    chunks = [];

    let chunkScale = 2000;

    for(i = -chunkGridSize/2 + .5; i < chunkGridSize/2; i++) {
        for(j = -chunkGridSize/2 + .5; j < chunkGridSize/2; j++) {
            chunkMaterial = new THREE.MeshPhongMaterial({color: 0xffffff, specular: 0x111111,shininess: 2, vertexColors: THREE.VertexColors});
            chunk = new THREE.MarchingCubes(resolution, chunkMaterial, false, true);
            chunk.position.set( chunkScale * ((i) * 2) * ((resolution-3)/resolution), 0, chunkScale * (j)*2* ((resolution-3)/resolution));
            chunk.scale.set( chunkScale, chunkScale, chunkScale );
            chunks.push(chunk);
            scene.add(chunk);
        }
    }

    cube = new THREE.Mesh( new THREE.CubeGeometry( chunkScale * 2, chunkScale, chunkScale ), new THREE.MeshNormalMaterial() );
    cube.position.x = 0;// 2000 + 1000;
    //scene.add(cube);

    controls = new THREE.FirstPersonControls(camera, renderer.domElement);
    controls.movementSpeed = 5000;
    controls.lookSpeed = 0.003;

    clock = new THREE.Clock();
    loop();
}

var timeElapsed = 0;

var render = (delta) => {
    for(m = 0; m < chunks.length; m++) {
        chunks[m].init(resolution);
    }
    timeElapsed += delta
    if(timeElapsed > 3) {
        heightMap = generateHeight(resolution*chunkGridSize, resolution * chunkGridSize);
        timeElapsed = 0;
    }
    updateCubes();
    //effect.material.uniforms[ "uBaseColor" ].value.setHSL( .5, 1, 0.025 );
    //effect.material.color.setHSL( .5, 1, 0.025  );
    renderer.render(scene,camera);
};

var loop = () => {
    var delta = clock.getDelta();
    controls.update(delta);
    render(delta);
    requestAnimationFrame(loop);
};

//https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_terrain.html
function generateHeight( width, height ) {
    var size = width * height;
    data = new Uint8Array( size );
    perlin = new THREE.ImprovedNoise();
    quality = 1;
    z = Math.random() * 100;
    for ( var j = 0; j < 4; j ++ ) {
        for ( var i = 0; i < size; i ++ ) {
            var x = i % width, y = ~ ~ ( i / width );
            data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );
        }
        quality *= 5;
    }
    return data;
}

function updateCubes() {
    var waterHeight = 8;
    //          sea level, water level, swamp level, plains level, peak level, sky
    let heights = [0, resolution * (8/50), resolution *(12/50),resolution *(12/50), resolution * (22/50), resolution * (28/50), resolution];
    //bottom of ocean, top of water, top of swamp, top of 
    let colors = [new THREE.Color(0,0,.1),new THREE.Color(0,0,.5),new THREE.Color(.8,.8,.1),new THREE.Color(.2,.5,.1),  new THREE.Color(.2,.5,.1), new THREE.Color(.7,.7,.7),
        new THREE.Color(1,1,1) ];

    heightColors = [];
    for(y = 0; y < resolution; y++) {
        heightColors.push(getInterpolatedColor(y,heights,colors));
    }

    for(m = 0; m < chunks.length; m++) {
        let chunk = chunks[m];
        chunk.reset();
        let chunkCoords = turnIndexToCoords(m, chunkGridSize);
        for(x = 0; x < resolution; x++) {
            for(z = 0; z < resolution; z++) {
                for(y = 0; y < waterHeight; y++) {
                    chunk.setCell(x,y,z,100);
                    var index = getIndex(chunk,x,y,z);
                    setColor(chunk, heightColors[y], index);
                }
                let val = chunkCoords.x*resolution;
                val += x;
                val += resolution*chunkGridSize*z;
                val += resolution*resolution*chunkGridSize*chunkCoords.z;

                //let absoluteX = (x * resolution * chunkGridSize) + (chunkCoords[0] * resolution * resolution * chunkGridSize);
                //let absoluteZ = z + (chunkCoords[1] * resolution);
                var height = heightMap[val]*.25;
                //uncomment to make mountain into terrace
                //height -= height % terraceHeight
                for(y = waterHeight; y < height; y++) {
                    chunk.setCell(x,y,z,100);
                    var index = getIndex(chunk,x,y,z);
                    setColor(chunk, heightColors[y], index);
                }
            }
        }
    }
}

function turnCoordsToIndex(x,z,N) {
    return x*N+z;
}

function turnIndexToCoords(m,N) {
    let indexX = Math.floor(m/N);
    let indexZ = m % N;
    return {x: indexX, z:indexZ};
}

function getInterpolatedColor(y, heights, colors) {
    //console.log("hi?");
    var m = 0;
    while(heights[m] <= y) {
        m++;
    }

    return interpolateColors(colors[m-1], colors[m], y, heights[m-1], heights[m]);
}

function interpolateColors(colorOne, c2, val, lower, upper) {
    var p = (val - lower)/(upper-lower); //1 is 100% upper, 0 is 0% upper and 100% lower
    return new THREE.Color(p*c2.r + (1-p)*(colorOne.r),
    p*c2.g + (1-p)*colorOne.g,
    p*c2.b + (1-p)*colorOne.b);
}

function getIndex(object, x,y,z) {
    return object.size2 * z + object.size * y + x;
}

function setColor(effect, color, index) {
    effect.palette[ ( index ) * 3] = color.r;
	effect.palette[ ( index ) * 3 + 1 ] = color.g;
    effect.palette[ ( index ) * 3 + 2 ] = color.b;
}

