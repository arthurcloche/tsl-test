import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as Nodes from "three/nodes";
import {
  tslFn,
  wgslFn,
  positionLocal,
  positionWorld,
  normalLocal,
  normalWorld,
  normalView,
  color,
  texture,
  uv,
  float,
  vec2,
  vec3,
  vec4,
  oscSine,
  triplanarTexture,
  viewportBottomLeft,
  js,
  string,
  global,
  loop,
  MeshBasicNodeMaterial,
  NodeObjectLoader,
} from "three/nodes";
import WebGPU from "three/addons/capabilities/WebGPU.js";
import WebGPURenderer from "three/addons/renderers/webgpu/WebGPURenderer.js";

let camera, scene, renderer;
const materials = [];

const FIXED_DISTANCE = 10;
init();
animate();

function init() {
  // Renderer
  if (WebGPU.isAvailable() === false) {
    document.body.appendChild(WebGPU.getErrorMessage());
    throw new Error("No WebGPU support");
  }

  const container = document.getElementById("container");
  const [width, height] = [window.innerWidth, window.innerHeight];
  renderer = new WebGPURenderer({ antialias: true });
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);
  // const texture = new THREE.TextureLoader().load("./src/3.jpg", function () {
  //   texture.minFilter = THREE.LinearFilter;
  //   texture.magFilter = THREE.LinearFilter;
  // });
  // console.log(texture.source);
  // Camera
  camera = new THREE.PerspectiveCamera(50, width / height, 0.001, 1000);
  camera.position.z = FIXED_DISTANCE;
  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.update();
  // Scene
  scene = new THREE.Scene();

  // Plane setup
  // const geometry = new THREE.PlaneGeometry(1, 1);
  // const material = new THREE.MeshBasicMaterial({
  //   color: 0xffffff,
  //   side: THREE.DoubleSide,
  //   // map: texture,
  // });

  const helper = new THREE.GridHelper(1000, 40, 0x303030, 0x303030);
  helper.position.y = -75;
  scene.add(helper);
  const geometry = new THREE.SphereGeometry();
  const material = new MeshBasicNodeMaterial();
  material.colorNode = normalView;
  materials.push(material);
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  window.addEventListener("resize", onResize);
  onResize();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// need a better mouse handling - shouldn't display unless moved
// function mousemove(event) {
//   event.preventDefault();
//   // Updating mouse positions
//   mouse.x = event.clientX / window.innerWidth;
//   mouse.y = 1 - event.clientY / window.innerHeight;

//   // Calculate velocity based on the difference from the last frame
//   let velocityX = mouse.x - lastMouse.x;
//   let velocityY = mouse.y - lastMouse.y;

//   // Update the flowmap with new mouse position and velocity
//   flowmap.setMousePosition(mouse.x, mouse.y);
//   flowmap.setVelocity(velocityX, velocityY);

//   // Store last mouse position
//   lastMouse.x = mouse.x;
//   lastMouse.y = mouse.y;
// }

function onResize() {
  const [width, height] = [window.innerWidth, window.innerHeight];
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  // kinda fancy but i found this online and wanted to test it out
  //planeFitPerspectiveCamera(plane, camera, FIXED_DISTANCE);
  //plane.material.uniforms.uResolution.value.set(width, height);
  animate();
}

function planeFitPerspectiveCamera(plane, camera, relativeZ = null) {
  const cameraZ = relativeZ !== null ? relativeZ : camera.position.z;
  const distance = cameraZ - plane.position.z;
  const vFov = (camera.fov * Math.PI) / 180;
  const scaleY = 2 * Math.tan(vFov / 2) * distance;
  const scaleX = scaleY * camera.aspect;
  plane.scale.set(scaleX, scaleY, 1);
}
