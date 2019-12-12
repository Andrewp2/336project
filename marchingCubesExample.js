
var scene;
var camera;

var renderer;

var light;
var pointLight;
var ambientLight;

var camera;

var resolutionX;
var resolutionY;
var resolutionZ;

var resolution;

let heightMap;

var cubesMaterial;

var controls;

var clock;

function main() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaOutput = true;
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild(renderer.domElement);

    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0.5, 0.5, 1 );
    scene.add( light );
    pointLight = new THREE.PointLight( 0xffffff );
    pointLight.position.set( 400, 500, 200 );
    scene.add( pointLight );
    ambientLight = new THREE.AmbientLight( 0x080808 );
    scene.add( ambientLight );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 100000 );
    camera.position.set( 3000, 4000, 3000 );
    camera.lookAt(0,-1000,0);

    resolutionX = 100;
    resolutionY = 15;
    resolutionZ = 30;

    resolution = resolutionX;

    heightMap = generateHeight(resolution, resolution);

    cubesMaterial = new THREE.MeshPhongMaterial({color: 0xffffff, specular: 0x111111,shininess: 10, vertexColors: THREE.VertexColors});
    effect = new THREE.MarchingCubes(resolution, cubesMaterial, true, true);
    effect.position.set( 0, 0, 0 );
    effect.scale.set( 2000, 2000, 2000 );
    scene.add(effect);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.movementSpeed = 1000;
    controls.lookSpeed = 0.1;

    clock = new THREE.Clock();
    loop();
}

var render = () => {
    effect.init(resolution);
    updateCubes( effect, false, false, false);
    //effect.material.uniforms[ "uBaseColor" ].value.setHSL( .5, 1, 0.025 );
    //effect.material.color.setHSL( .5, 1, 0.025  );
    renderer.render(scene,camera);
};

var loop = () => {
    requestAnimationFrame(loop);
    controls.update();
    render();
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

function updateCubes( object,floor, wallx, wallz ) {
    object.reset();

    var waterHeight = 13;
    var terraceHeight = 2;
    var peakHeight = 28;

    let waterColor = new THREE.Color(0,0,.5);
    //let groundColor = new THREE.Color(.2,.5,.1);
    let groundColor = new THREE.Color(210/256, 133/256, 63/256)
    let peakColor = new THREE.Color(.7,.7,.7);
    
    for(x = 0; x < resolution; x++) {
        for(z = 0; z < resolution; z++) {
            for(y = 0; y < waterHeight; y++) {
                object.setCell(x,y,z,100);
                var index = effect.size2 * z + effect.size * y + x;
                effect.palette[ ( index ) * 3] += waterColor.r;
				effect.palette[ ( index ) * 3 + 1 ] += waterColor.g;
                effect.palette[ ( index ) * 3 + 2 ] += waterColor.b;
            }
            var height = heightMap[x*resolution + z]*.25;
            //uncomment to make mountain into terrace
            height -= height % terraceHeight
            for(y = waterHeight; y < height; y++) {
                object.setCell(x,y,z,100);
                var index = effect.size2 * z + effect.size * y + x;
                if(y > peakHeight) {
                    effect.palette[ ( index ) * 3] += peakColor.r;
				    effect.palette[ ( index ) * 3 + 1 ] += peakColor.g;
				    effect.palette[ ( index ) * 3 + 2 ] += peakColor.b;
                } else {
                    effect.palette[ ( index ) * 3] += groundColor.r;
				    effect.palette[ ( index ) * 3 + 1 ] += groundColor.g;
                    effect.palette[ ( index ) * 3 + 2 ] += groundColor.b;
                }
            
            }
        }
    }
    
    if ( floor ) object.addPlaneY( 2, 12 );
    if ( wallz ) object.addPlaneZ( 2, 12 );
    if ( wallx ) object.addPlaneX( 2, 12 );
}