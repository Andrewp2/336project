var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.gammaOutput = true;
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry( 30, 30, 30 );

var material = new THREE.MeshPhongMaterial({color: 0x999999, wireframe: false});

var light = new THREE.DirectionalLight( 0xffffff );
light.position.set( 0.5, 0.5, 1 );
scene.add( light );
var pointLight = new THREE.PointLight( 0xff3300 );
pointLight.position.set( 400, 500, 200 );
scene.add( pointLight );
var ambientLight = new THREE.AmbientLight( 0x080808 );
scene.add( ambientLight );

var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
camera.position.set( - 500, 500, 1500 );

resolution = 28;

effect = new THREE.MarchingCubes(resolution, material, true, true);
effect.position.set( 0, 0, 0 );
effect.scale.set( 700, 700, 700 );
effect.enableUvs = false;
effect.enableColors = false;
scene.add(effect);

var clock = new THREE.Clock();
var effectController;
var time = 0;

var controls = new THREE.OrbitControls(camera, renderer.domElement);

effectController = {
    material: "shiny",
    speed: 1.0,
    numBlobs: 10,
    resolution: 28,
    isolation: 80,
    floor: true,
    wallx: true,
    wallz: true,
    hue: 0.0,
    saturation: 0.8,
    lightness: 0.1,
    lhue: 0.04,
    lsaturation: 1.0,
    llightness: 0.5,
    lx: 0.5,
    ly: 0.5,
    lz: 1.0,
    dummy: function () {}
};

var render = () => {
    var delta = clock.getDelta();
	time += delta * effectController.speed * 0.5;
	// marching cubes
	if ( effectController.resolution !== resolution ) {
		resolution = effectController.resolution;
		effect.init( Math.floor( resolution ) );
	}
	if ( effectController.isolation !== effect.isolation ) {
		effect.isolation = effectController.isolation;
    }
    updateCubes( effect, time, effectController.numBlobs, effectController.floor, effectController.wallx, effectController.wallz );
    renderer.render(scene,camera);
};

var loop = () => {
    requestAnimationFrame(loop);
    controls.update();
    render();
};

function updateCubes( object, time, numblobs, floor, wallx, wallz ) {
    object.reset();
    // fill the field with some metaballs
    var i, ballx, bally, ballz, subtract, strength;
    var rainbow = [
        new THREE.Color( 0xff0000 ),
        new THREE.Color( 0xff7f00 ),
        new THREE.Color( 0xffff00 ),
        new THREE.Color( 0x00ff00 ),
        new THREE.Color( 0x0000ff ),
        new THREE.Color( 0x4b0082 ),
        new THREE.Color( 0x9400d3 )
    ];
    subtract = 12;
    strength = 1.2 / ( ( Math.sqrt( numblobs ) - 1 ) / 4 + 1 );
    for ( i = 0; i < numblobs; i ++ ) {
        ballx = Math.sin( i + 1.26 * time * ( 1.03 + 0.5 * Math.cos( 0.21 * i ) ) ) * 0.27 + 0.5;
        bally = Math.abs( Math.cos( i + 1.12 * time * Math.cos( 1.22 + 0.1424 * i ) ) ) * 0.77; // dip into the floor
        ballz = Math.cos( i + 1.32 * time * 0.1 * Math.sin( ( 0.92 + 0.53 * i ) ) ) * 0.27 + 0.5;
        object.addBall( ballx, bally, ballz, strength, subtract );
        
    }
    if ( floor ) object.addPlaneY( 2, 12 );
    if ( wallz ) object.addPlaneZ( 2, 12 );
    if ( wallx ) object.addPlaneX( 2, 12 );
}

loop();