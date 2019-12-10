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

var resolution = 28;

effect = new THREE.MarchingCubes(resolution, material, true, true);
effect.position.set( 0, 0, 0 );
effect.scale.set( 700, 700, 700 );
effect.enableUvs = false;
effect.enableColors = false;
scene.add(effect);

var controls = new THREE.OrbitControls(camera, renderer.domElement);

var render = () => {
    effect.init(resolution);
    updateCubes( effect, true, true, true);
    renderer.render(scene,camera);
};

var loop = () => {
    requestAnimationFrame(loop);
    controls.update();
    render();
};

function updateCubes( object,floor, wallx, wallz ) {
    object.reset();
    for(x = 12; x < 16;x++) {
        for(y = 12; y < 16; y++) {
            for(z = 1; z< 24; z++) {
                //console.log("Setting cell at " + x + " " + y + " " + z);
                object.setCell(x,y,z,1500000000000.0);
            }
        }
    }
    if ( floor ) object.addPlaneY( 2, 12 );
    if ( wallz ) object.addPlaneZ( 2, 12 );
    if ( wallx ) object.addPlaneX( 2, 12 );
}

loop();