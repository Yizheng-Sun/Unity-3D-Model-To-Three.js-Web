import * as THREE from '../node_modules/three/build/three.module.js';
import Stats from './jsm/libs/stats.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { FBXLoader } from "./jsm/loaders/FBXLoader.js";
import { TGALoader } from "./jsm/loaders/TGALoader.js";
import { VRButton } from "./jsm/webxr/VRButton.js";
import { BoxLineGeometry } from "./jsm/geometries/BoxLineGeometry.js";

const container = document.createElement("div");
document.body.appendChild(container);

const clock = new THREE.Clock();

const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
);
camera.position.set(0, 6, 4);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x505050);

scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

const light = new THREE.DirectionalLight(0xffffff);
light.position.set(1, 1, 1).normalize();
scene.add(light);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;

container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.6, 0);
controls.update();

const stats = Stats();
container.appendChild(stats.dom);

initScene();
setupVR();

window.addEventListener("resize", resize.bind(this));

renderer.setAnimationLoop(render.bind(this));

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function initScene() {
    const room = new THREE.LineSegments(
        new BoxLineGeometry(6, 6, 6, 10, 10, 10),
        new THREE.LineBasicMaterial({ color: 0x808080 })
    );
    room.geometry.translate(0, 3, 0);
    scene.add(room);

    const loader = new TGALoader();
    const texture = loader.load(
        "./model/material/colon.tga",
        function (texture) {
            console.log("Texture is loaded");
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        function (error) {
            console.log("An error happened");
        }
    );
    const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        map: texture,
    });
    // load .fbx model
    const fbxLoader = new FBXLoader();
    fbxLoader.load(
        "./model/BallMagnet.fbx",
        (object) => {
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.material = material;
                    // if ((child as THREE.Mesh).material) {
                    //     ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).transparent = false
                    // }
                    child.scale.set(0.01, 0.01, 0.01);
                    child.position.x = 0;
                    child.position.y = 1;
                    child.position.z = -2;
                    room.add(child);
                }
            });
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        (error) => {
            console.log(error);
        }
    );
}

function setupVR() {
    renderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(renderer));
}

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
    stats.update();

    renderer.render(scene, camera);
}
window.addEventListener('resize', windowResize, false);
