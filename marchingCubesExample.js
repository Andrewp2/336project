var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.gammaOutput = true;
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry( 30, 30, 30 );

var material = new THREE.MeshPhongMaterial({color: 0x112211, wireframe: false});


var light = new THREE.DirectionalLight( 0xffffff );
light.position.set( 0.5, 0.5, 1 );
scene.add( light );
var pointLight = new THREE.PointLight( 0xffffff );
pointLight.position.set( 400, 500, 200 );
scene.add( pointLight );
var ambientLight = new THREE.AmbientLight( 0x080808 );
scene.add( ambientLight );

var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 100000 );
camera.position.set( - 2000, 800, 1000 );

var resolutionX = 100;
var resolutionY = 15;
var resolutionZ = 30;

var resolution = resolutionX;

let heightMap = generateHeight(resolution, resolution);

var cubesMaterial = new THREE.Material({shininess: 2, vertexColors: THREE.VertexColors});
effect = new THREE.MarchingCubes(resolution, cubesMaterial, true, true);
effect.position.set( 0, 0, 0 );
effect.scale.set( 2000, 2000, 2000 );
effect.enableUvs = false;
effect.enableColors = false;
scene.add(effect);

var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.movementSpeed = 1000;
controls.lookSpeed = 0.1;

var clock = new THREE.Clock();

var render = () => {
    effect.init(resolution);
    updateCubes( effect, false, false, false);
    renderer.render(scene,camera);
};

var loop = () => {
    requestAnimationFrame(loop);
    controls.update(clock.getDelta());
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

    var waterHeight = 5;
    var terraceHeight = 2;
    
    for(x = 0; x < resolution;x++) {
        for(z = 0; z < resolution;z++) {
            for(y = 0; y < waterHeight; y++) {
                object.setCell(x,y,z,100);
                var index = effect.size2 * z + effect.size * y + x;
                effect.palette[ ( index ) * 3 + 0 ] += 0;
				effect.palette[ ( index ) * 3 + 1 ] += 0;
				effect.palette[ ( index ) * 3 + 2 ] += 10000;
            }
            var height = heightMap[x*resolution + z]*.3;
            //uncomment to make mountain into terrace
            //height -= height % terraceHeight
            for(y = waterHeight; y < height; y++) {
                object.setCell(x,y,z,100);
                var index = effect.size2 * z + effect.size * y + x;
                effect.palette[ ( index ) * 3 + 0 ] += y;
				effect.palette[ ( index ) * 3 + 1 ] += 0;
				effect.palette[ ( index ) * 3 + 2 ] += 0;
            }
        }
    }
    
    if ( floor ) object.addPlaneY( 2, 12 );
    if ( wallz ) object.addPlaneZ( 2, 12 );
    if ( wallx ) object.addPlaneX( 2, 12 );
}

loop();