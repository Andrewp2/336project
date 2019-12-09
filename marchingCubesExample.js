var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry( 1, 1, 1 );

var material = new THREE.MeshBasicMaterial({color: 0x00FF00, wireframe: false});
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

var edges = new THREE.EdgesGeometry(geometry);
var mesh = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color:0x000000}));
scene.add(mesh);

camera.position.z = 2;
camera.position.x = -2;
camera.position.y = 2;
camera.lookAt(0,0,0);

var update = () => {

};

var render = () => {
    renderer.render(scene,camera);
};

var loop = () => {
    requestAnimationFrame(loop);
    update();
    render();
};

loop();