import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.148.0/build/three.module.js";
import * as dat from "https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js";
import { OrbitControls } from "OrbitControls";
import { GLTFLoader } from "GLTFLoader";
import { RGBELoader } from "RGBELoader";

let envMap, logo;

const Color = {
  Red: { Hex: 0xe7180c, Material: "" },
  Orange: { Hex: 0xff8008, Material: "" },
  Yellow: { Hex: 0xeec200, Material: "" },
  Green: { Hex: 0x027b00, Material: "" },
  Cyan: { Hex: 0x0ba4ff, Material: "" },
  Blue: { Hex: 0x002abc, Material: "" },
  Purple: { Hex: 0x7200bc, Material: "" },
};

const hdrEquirect = new RGBELoader()
  .setPath(
    "https://firebasestorage.googleapis.com/v0/b/gohere-24b3c.appspot.com/o/gohere%2Fnewv%2Fcubemap%2F"
  )
  .load("royal_esplanade_1k.hdr?alt=media", function () {
    hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
  });

let sections = [
  Section(0, 20, "canvas1", Color.Cyan),
  Section(20, 40, "canvas2", Color.Purple),
  Section(60, 100, "canvas4"),
];

function Section(top, bottom, tag, color = "multi", size = 1) {
  return {
    camera: "",
    scene: new THREE.Scene(),
    renderer: "",
    canvas: "",
    canvasTag: tag,
    color: color,
    logo: "",
    topP: top,
    bottomP: bottom,
  };
}
let logoMaterials = [
  LogoMaterial(Color.Orange),
  LogoMaterial(Color.Yellow),
  LogoMaterial(Color.Green),
  LogoMaterial(Color.Cyan),
  LogoMaterial(Color.Blue),
  LogoMaterial(Color.Purple),
  LogoMaterial(Color.Red),
];

function LogoMaterial(clr) {
  const mat = new THREE.MeshPhysicalMaterial({
    color: clr.Hex,
    transmission: 0,
    opacity: 1,
    metalness: 1,
    roughness: 0.1,
    specularIntensity: 1,
    specularColor: 0xffffff,
    envMapIntensity: 1,
    lightIntensity: 1,
    exposure: 1,
    envMap: hdrEquirect,
  });
  clr.Material = mat;
  return mat;
}

let start = {
  camera: {
    position: new THREE.Vector3(0, 0, 80),
    rotation: new THREE.Vector3(0, 0, 0),
  },

  ambient: { intensity: 1.0 },
};

Start();

function Start() {
  for (let i = 0; i < sections.length; i++) {
    let section = sections[i];
    SetupRenderer(section);
    SetupCamera(section);
  }
  SetupLogo();
  window.addEventListener("scroll", onScroll);
  window.addEventListener("resize", onWindowResize, false);
  // FinalRender();
}

function SetupRenderer(master) {
  master.canvas = document.getElementById(master.canvasTag);
  master.renderer = new THREE.WebGLRenderer({
    canvas: master.canvas,
    antialias: true,
    alpha: true,
  });

  master.renderer.setPixelRatio(window.devicePixelRatio);
  master.renderer.setSize(window.innerWidth, window.innerHeight);
  master.renderer.outputEncoding = THREE.sRGBEncoding;
  master.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  master.renderer.setPixelRatio(window.devicePixelRatio);
  master.renderer.setSize(window.innerWidth, window.innerHeight);
  master.renderer.setClearColor(0xeb4034, 0);
  master.scene.environment = envMap;
}

function SetupCamera(master) {
  master.camera = new THREE.PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    0.1,
    3000
  );
  master.camera.position.set(
    start.camera.position.x,
    start.camera.position.y,
    start.camera.position.z
  );
  master.camera.rotation.set(
    start.camera.rotation.x,
    start.camera.rotation.y,
    start.camera.rotation.z
  );
  master.scene.add(master.camera);
  // const controls = new OrbitControls(camera, renderer.domElement);
}

function SetupLogo() {
  const loader = new GLTFLoader().setPath(
    "https://firebasestorage.googleapis.com/v0/b/gohere-24b3c.appspot.com/o/gohere%2Fnewv%2F"
  );
  loader.load("betterLogo.glb?alt=media", function (gltf) {
    logo = gltf.scene.children[0];

    for (let s = 0; s < sections.length; s++) {
      const master = sections[s];
      master.logo = logo.clone(true);

      for (let p = 0; p < master.logo.children.length; p++) {
        console.log(`Section:${s} - Pod:${p}`);
        let pod = master.logo.children[p];
        pod.material = logoMaterials[p];
        if (master.color != "multi") {
          pod.material = master.color.Material;
        }
        pod.material.envMapIntensity = 1.5;
      }
      master.scene.add(master.logo);
    }
    FinalRender();
  });
}

function FinalRender(master) {
  for (let i = 0; i < sections.length; i++) {
    const master = sections[i];
    master.renderer.render(master.scene, master.camera);
  }
  requestAnimationFrame(Render);
}

function Render() {
  for (let i = 0; i < sections.length; i++) {
    const master = sections[i];
    master.renderer.render(master.scene, master.camera);
  }
  requestAnimationFrame(Render);
}

function onWindowResize() {
  for (let i = 0; i < sections.length; i++) {
    const master = sections[i];
    master.camera.aspect = window.innerWidth / window.outerHeight;
    master.camera.updateProjectionMatrix();
    master.renderer.setSize(window.innerWidth, window.outerHeight);
  }
}
function onScroll() {
  //Get percent scrolled
  var h = document.documentElement,
    b = document.body,
    st = "scrollTop",
    sh = "scrollHeight";
  var y = ((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100;
  //0 to 100

  const scrollPos = window.pageYOffset;

  console.log(y);

  for (let i = 0; i < sections.length; i++) {
    const master = sections[i];
    master.logo.rotation.z = scrollPos * 0.003;
    // master.camera.position.y = mapRange(y, master.top, master.bottom, 0, 0);
  }
}

function mapRange(num, inputMin, inputMax, outputMin, outputMax) {
  return (
    ((num - inputMin) * (outputMax - outputMin)) / (inputMax - inputMin) +
    outputMin
  );
}
