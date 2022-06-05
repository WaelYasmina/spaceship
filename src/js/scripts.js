import * as THREE from 'three';
import * as YUKA from 'yuka';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

renderer.setClearColor(0xA3A3A3);

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 10, 4);
camera.lookAt(scene.position);

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
scene.add(directionalLight);

// const vehicleGeometry = new THREE.ConeBufferGeometry(0.1, 0.5, 8);
// vehicleGeometry.rotateX(Math.PI * 0.5);
// const vehicleMaterial = new THREE.MeshNormalMaterial();
// const vehicleMesh = new THREE.Mesh(vehicleGeometry, vehicleMaterial);
// vehicleMesh.matrixAutoUpdate = false;
// scene.add(vehicleMesh);

const vehicle = new YUKA.Vehicle();

vehicle.scale.set(0.15, 0.15, 0.15);

function sync(entity, renderComponent) {
    renderComponent.matrix.copy(entity.worldMatrix);
}

const entityManager = new YUKA.EntityManager();
entityManager.add(vehicle);

const loader = new GLTFLoader();
const group = new THREE.Group();
loader.load('./assets/Striker.glb', function(glb) {
    const model = glb.scene;
    model.matrixAutoUpdate = false;
    group.add(model);
    scene.add(group);
    vehicle.setRenderComponent(model, sync);
});

// const targetGeometry = new THREE.SphereGeometry(0.1);
// const targetMaterial = new THREE.MeshPhongMaterial({color: 0xFFEA00});
// const targetMesh = new THREE.Mesh(targetGeometry, targetMaterial);
// targetMesh.matrixAutoUpdate = false;
// scene.add(targetMesh);

const target = new YUKA.GameEntity();
//target.setRenderComponent(targetMesh, sync);
entityManager.add(target);

const arriveBehavior = new YUKA.ArriveBehavior(target.position, 3, 0.5);
vehicle.steering.add(arriveBehavior);

vehicle.position.set(-3, 0, -3);

vehicle.maxSpeed = 1.5;

const mousePosition = new THREE.Vector2();

window.addEventListener('mousemove', function(e) {
    mousePosition.x = (e.clientX / this.window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / this.window.innerHeight) * 2 + 1;
});

const planeGeo = new THREE.PlaneGeometry(25, 25);
const planeMat = new THREE.MeshBasicMaterial({visible: false});
const planeMesh = new THREE.Mesh(planeGeo, planeMat);
planeMesh.rotation.x = -0.5 * Math.PI;
scene.add(planeMesh);
planeMesh.name = 'plane';

const raycaster = new THREE.Raycaster();

window.addEventListener('click', function() {
    raycaster.setFromCamera(mousePosition, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    for(let i = 0; i < intersects.length; i++) {
        if(intersects[i].object.name === 'plane')
            target.position.set(intersects[i].point.x, 0, intersects[i].point.z);
    }
});

// setInterval(function(){
//     const x = Math.random() * 3;
//     const y = Math.random() * 3;
//     const z = Math.random() * 3;

//     target.position.set(x, y, z);
// }, 2000);

const time = new YUKA.Time();

function animate(t) {
    const delta = time.update().getDelta();
    entityManager.update(delta);
    group.position.y = 0.05 * Math.sin(t / 500);
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});