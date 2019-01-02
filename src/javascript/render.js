var SCENE = new THREE.Scene();
var CAMERA = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
var RENDERER = new THREE.WebGLRenderer();

RENDERER.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(RENDERER.domElement)


var geometry = new THREE.SphereBufferGeometry(5, 32, 32);
var material = new THREE.MeshBasicMaterial({color: 0x8888ff});
var sphere = new THREE.Mesh(geometry, material);

var geometry2 = new THREE.SphereBufferGeometry(1,32,32);
var material2 = new THREE.MeshBasicMaterial({color: 0xff8888});
var sphere2 = new THREE.Mesh(geometry2, material2);
SCENE.add(sphere);
SCENE.add(sphere2);
//CAMERA.position.x = 5;
//CAMERA.position.y = 1;
sphere2.position.z = 7
CAMERA.position.z = 20;
var angle = 0

RENDERER.render( SCENE, CAMERA );

function animate() {
	requestAnimationFrame(animate);
	angle += Math.PI/60;
	sphere2.position.x = sphere.position.x + 7*Math.cos(angle);
	sphere2.position.y = sphere.position.y + 7*Math.sin(angle);
//	CAMERA.rotation.y += 0.001;
//	sphere.rotation.x += 0.001;
	RENDERER.render(SCENE, CAMERA);
}
animate();