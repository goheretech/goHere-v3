import * as THREE from "three";
import * as dat from "https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js";
// import { loaded } from "./../stores/var.js";

let camera,
  scene = new THREE.Scene(),
  renderer,
  canvas,
  material,
  geometry,topPixel,bottomPixel,scrollPosition, percent,ambientLight;

let loader = new THREE.TextureLoader();
let MAIN, MAINCLOUDS, MOON, MOONCLOUDS, EARTH, EARTHCLOUDS;

GetContainerInfo('#rail-planets','.l','#cart-planets');
//
//
//

let
  CAMERA= {
    position: {
      0: new THREE.Vector3(299, -4.72, 771),
      1: new THREE.Vector3(139, 47, -87),
      2: new THREE.Vector3(145.6, 45.51, -212.22),
    },
  },
  SUN= {
    mesh: undefined,
    pivot: undefined,
    orbitDistance: 150000,
    period: [1.4, (2*Math.PI)-1.1, -.82],
    tilt: 0.2,
  };

  // SUN.tilt
  let PLANETS = {
    main: {
      name: "main",
      mesh: undefined,
      pivot: undefined,
      empty: undefined,
      texture: {
        albedo: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/633f99f1f9c637c2dccff815_albedo.jpg",
        roughness: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/633f99f0881d9e078b84d8ed_roughness.jpg",
        normal: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/633f99f18e67ca2d7f0b83d5_normal.jpg",
        metalness: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/633f99f0e5d16b2038d6cf55_metalness.jpg",
        ao: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/633f99f0d278a13ae7404f15_ambientocclusion.jpg",
      },
      rotationSpeed: 1,
      cache: {
        albedo: undefined,
        roughness: undefined,
        normal: undefined,
        ao: undefined,
      },
      parent: "sun",
      size: 140,
      detail: 25,
      orbitDistance: 0,
      period: [0 * Math.PI,0 * Math.PI,0 * Math.PI],
      tilt: 0 * Math.PI,
    },
    moon: {
      name: "moon",
      mesh: undefined,
      pivot: undefined,
      empty: undefined,
      texture: {
        albedo: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/633f99f1f9c637c2dccff815_albedo.jpg",
        roughness: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/633f99f0881d9e078b84d8ed_roughness.jpg",
        normal: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/633f99f18e67ca2d7f0b83d5_normal.jpg",
        metalness: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/633f99f0e5d16b2038d6cf55_metalness.jpg",
        ao: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/633f99f0d278a13ae7404f15_ambientocclusion.jpg",
      },
      rotationSpeed: 1.2,
      cache: {
        albedo: undefined,
        roughness: undefined,
        normal: undefined,
        ao: undefined,
      },
      parent: "main",
      size: 22,
      detail: 20,
      orbitDistance: 260,
      period: [-5.53, -3.88, -3.6],
      tilt: 0.21,
    },
    earth: {
      name: "earth",
      mesh: undefined,
      pivot: undefined,
      empty: undefined,
      texture: {
        albedo: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/633f99f1f9c637c2dccff815_albedo.jpg",
        roughness: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/633f99f0881d9e078b84d8ed_roughness.jpg",
        normal: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/633f99f18e67ca2d7f0b83d5_normal.jpg",
        metalness: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/633f99f0e5d16b2038d6cf55_metalness.jpg",
        ao: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/633f99f0d278a13ae7404f15_ambientocclusion.jpg",
      },
      rotationSpeed: 1.6,
      cache: {
        albedo: undefined,
        roughness: undefined,
        normal: undefined,
        ao: undefined,
      },
      parent: "moon",
      size: 0.5,
      detail: 20,
      orbitDistance:32.8,
      period: [-2.6,-3.87,-1.54],
      tilt: 0.42,
    },
    mainClouds: {
      name: "mainClouds",
      mesh: undefined,
      pivot: undefined,
      empty: undefined,
      texture: {
        albedo: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/63335754d48b534cf87e23f3_clouds.png",
        alphaMap: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/63335754d48b534cf87e23f3_clouds.png",
      },
      rotationSpeed: 3.4,
      cache: {
        albedo: undefined,
        alphaMap: undefined,
      },
      parent: "main",
      size: 142,
      detail: 25,
      orbitDistance: 0,
      period: [0 * Math.PI,0 * Math.PI,0 * Math.PI],
      tilt: 0 * Math.PI,
    },
    moonClouds: {
      name: "moonClouds",
      mesh: undefined,
      pivot: undefined,
      empty: undefined,
      texture: {
        albedo: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/63335754d48b534cf87e23f3_clouds.png",
        alphaMap: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/63335754d48b534cf87e23f3_clouds.png",
      },
      rotationSpeed: 3.4,
      cache: {
        albedo: undefined,
        alphaMap: undefined,
      },
      parent: "moon",
      size: 22.5,
      detail: 20,
      orbitDistance: 0,
      period: [0 * Math.PI,0 * Math.PI,0 * Math.PI],
      tilt: 0 * Math.PI,
    },
    earthClouds: {
      name: "earthClouds",
      mesh: undefined,
      pivot: undefined,
      empty: undefined,
      texture: {
        albedo: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/63335754d48b534cf87e23f3_clouds.png",
        alphaMap: "https://uploads-ssl.webflow.com/632cafc077ea14b61822a9e6/63335754d48b534cf87e23f3_clouds.png",
      },
      rotationSpeed: 3.4,
      cache: {
        albedo: undefined,
        alphaMap: undefined,
      },
      parent: "earth",
      size: 0.51,
      detail: 20,
      orbitDistance: 0,
      period: [0 * Math.PI,0 * Math.PI,0 * Math.PI],
      tilt: 0 * Math.PI,
    },
  };

  let path = "";

  PLANETS.main.texture = {
    albedo: "img/Planets/planet1/albedo.jpg",
    roughness: "img/Planets/planet1/roughness.jpg",
    normal: "img/Planets/planet1/normal.jpg",
    metalness: "img/Planets/planet1/metalness.jpg",
    ao: "img/Planets/planet1/ambientocclusion.jpg",
  };
  PLANETS.moon.texture = {
    albedo: "img/Planets/planet1/albedo.jpg",
    roughness: "img/Planets/planet1/roughness.jpg",
    normal: "img/Planets/planet1/normal.jpg",
    metalness: "img/Planets/planet1/metalness.jpg",
    ao: "img/Planets/planet1/ambientocclusion.jpg",
  };
  PLANETS.earth.texture = {
    albedo: "img/Planets/planet1/albedo.jpg",
    roughness: "img/Planets/planet1/roughness.jpg",
    normal: "img/Planets/planet1/normal.jpg",
    metalness: "img/Planets/planet1/metalness.jpg",
    ao: "img/Planets/planet1/ambientocclusion.jpg",
  };
  PLANETS.mainClouds.texture = {
    albedo: "img/Planets/clouds.jpg",
    alphaMap: "img/Planets/clouds.jpg"
  };
  PLANETS.moonClouds.texture = {
    albedo: "img/Planets/clouds.jpg",
    alphaMap: "img/Planets/clouds.jpg"
  };
  PLANETS.earthClouds.texture = {
    albedo: "img/Planets/clouds.jpg",
    alphaMap: "img/Planets/clouds.jpg"
  };
  
  path = "";

let uniforms;

//Page Length Percent
var ratio = 43.8;

let clock = new THREE.Clock();


// let textureCache = new Object();




const fragmentShader = `
            #include <common>
            #define TWO_PI 6.28318530718
            uniform vec2 iResolution;
            uniform float iTime;

            //  https://www.shadertoy.com/view/MsS3Wc
            vec3 hsb2rgb( in vec3 c ){
                vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                                        6.0)-3.0)-1.0,
                                0.0,
                                1.0 );
                rgb = rgb*rgb*(3.0-2.0*rgb);
                return c.z * mix( vec3(1.0), rgb, c.y);
            }

            void main(){
                vec2 st = gl_FragCoord.xy/iResolution;
                vec3 color = vec3(0.0);

                // Use polar coordinates instead of cartesian
                vec2 toCenter = vec2(0.5)-st;
                float angle = atan(toCenter.y,toCenter.x);
                float radius = length(toCenter)*2.0;

                // Map the angle (-PI to PI) to the Hue (from 0 to 1)
                // and the Saturation to the radius
                color = hsb2rgb(vec3((angle/TWO_PI)+0.5+iTime/10.,radius,1.0));

                gl_FragColor = vec4(color,abs(sin(iTime))+0.1);
            }`;

function SetupGUI() {
  const gui = new dat.GUI();
  // gui.domElement.id = 'gui';
  ///Camera
  let guiCamera = gui.addFolder("Camera");

  let guiCameraPos = guiCamera.addFolder("Camera Position");
  guiCameraPos
    .add(camera.position, "x", -3000, 3000, 0.01)
    .name("X")
    .onChange((value) => {
      camera.position.x = value;
    });
  guiCameraPos
    .add(camera.position, "y", -3000, 3000, 0.01)
    .name("y")
    .onChange((value) => {
      camera.position.y = value;
    });
  guiCameraPos
    .add(camera.position, "z", -3000, 3000, 0.01)
    .name("z")
    .onChange((value) => {
      camera.position.z = value;
    });
  let guiCameraRot = guiCamera.addFolder("Camera Rotation");
  guiCameraRot
    .add(camera.rotation, "x", -Math.PI, Math.PI, 0.01)
    .name("X")
    .onChange((value) => {
      camera.rotation.x = value;
    });
  guiCameraRot
    .add(camera.rotation, "y", -Math.PI, Math.PI, 0.01)
    .name("y")
    .onChange((value) => {
      camera.rotation.y = value;
    });
  guiCameraRot
    .add(camera.rotation, "z", -Math.PI, Math.PI, 0.01)
    .name("z")
    .onChange((value) => {
      camera.rotation.z = value;
    });
 
  ///Sun
  let guiSun = gui.addFolder("Sun");
  guiSun
    .add(SUN.mesh, "intensity", 0, 3, 0.001)
    .name("Intensity")
    .onChange((value) => {
      SUN.mesh.intensity = value;
    });

  guiSun
    .add(SUN.mesh.position, "z", 0, 1000000, 10)
    .name("Orbit Distance")
    .onChange((value) => {
      SUN.mesh.position.z = value;
    });

  guiSun
    .add(SUN.pivot.rotation, "y", -2 * Math.PI, 2 * Math.PI, 0.01)
    .name("Orbit Period")
    .onChange((value) => {
      SUN.pivot.rotation.y = value;
    });
    console.log('SUN.pivot');
    console.log(SUN.pivot);
    guiSun
    .add(SUN.pivot.rotation, "x", -1 * Math.PI, 1 * Math.PI, 0.01)
    .name("Orbit Tilt")
    .onChange((value) => {
      SUN.pivot.rotation.x = value;
    });

  let guiMoon = gui.addFolder("Moon");
    console.log(MOON.mesh.geometry);
  
  
  guiMoon
    .add(MOON.empty.position, "z", 0, 1200, 10)
    .name("Orbit Distance")
    .onChange((value) => {
      MOON.mesh.position.z = value;
      MOON.empty.position.z = value;
    });

  guiMoon
    .add(MOON.pivot.rotation, "y", -2 * Math.PI, 2 * Math.PI, 0.01)
    .name("Orbit Period")
    .onChange((value) => {
      MOON.pivot.rotation.y = value;
    });
  guiMoon
    .add(MOON.pivot.rotation, "z", -1 * Math.PI, 1 * Math.PI, 0.01)
    .name("Orbit Tilt")
    .onChange((value) => {
      MOON.pivot.rotation.x = value;
    });

  let guiEarth = gui.addFolder("Earth");
  
  guiEarth
    .add(EARTH.mesh.position, "z", 0, 60, 0.1)
    .name("Orbit Distance")
    .onChange((value) => {
      EARTH.mesh.position.z = value;
      EARTH.empty.position.z = value;
    });

  guiEarth
    .add(EARTH.pivot.rotation, "y", -2 * Math.PI, 2 * Math.PI, 0.01)
    .name("Orbit Period")
    .onChange((value) => {
      EARTH.pivot.rotation.y = value;
    });
  guiEarth
    .add(EARTH.pivot.rotation, "z", -1 * Math.PI, 1 * Math.PI, 0.01)
    .name("Orbit Tilt")
    .onChange((value) => {
      EARTH.pivot.rotation.x = value;
    });
  // ///Ambient Light
  // console.log(light);
  let guiAL = gui.addFolder("Ambient Light");
  guiAL
    .add(ambientLight, "intensity", 0, 3, 0.001)
    .name("Intensity")
    .onChange((value) => {
      ambientLight.intensity = value;
    });
}
init();
function init() {
  MAIN = PLANETS.main;
  MAINCLOUDS = PLANETS['mainClouds'];
  MOONCLOUDS = PLANETS['moonClouds'];
  EARTHCLOUDS = PLANETS['earthClouds'];
  MOON = PLANETS.moon;
  EARTH = PLANETS.earth;
  uniforms = {
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector2() },
  };
  canvas = document.getElementById("canvas");
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  document.getElementById("canvas").style.zIndex = "-1";
  //Camera
  CreateCamera();

  loadTextures();
  renderer.setClearColor(0xeb4034, 0);

  function CreateCamera() {
    camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    camera.position.set(
      CAMERA.position[0].x,
      CAMERA.position[0].y,
      CAMERA.position[0].z
    );
    scene.add(camera);
  }
}

function render() {
  let delta = clock.getDelta();
  var time = clock.elapsedTime;

  Object.keys(PLANETS).forEach(key => {
      PLANETS[key].mesh.rotation.y += ((delta * PLANETS[key].rotationSpeed * Math.PI) / 180);
  });

  uniforms.iResolution.value.set(canvas.width, canvas.height);
  uniforms.iTime.value = time;

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
function createClouds(pos, num, x, y, z) {
  loader.load(
    "https://firebasestorage.googleapis.com/v0/b/gohere-24b3c.appspot.com/o/smoke-1.png",
    (texture) => {
      const geo = new THREE.PlaneBufferGeometry(80, 80);
      const mat = new THREE.MeshLambertMaterial({
        map: texture,
        transparent: true,
      });
      for (let p = 0; p < num; p++) {
        const cloud = new THREE.Mesh(geo, mat);
        cloud.position.set(
          pos.x + (Math.random() * 20 * x - 10 * x),
          pos.y + (Math.random() * 20 * y - 10 * y),
          pos.z + (Math.random() * 20 * z - 10 * z)
        );
        cloud.rotation.z = Math.random() * 2 * Math.PI;
        cloud.material.opacity = 0.2;
        clouds.push(cloud);
        scene.add(cloud);
      }
    }
  );
  // createLight(colors.orange);
  // createLight(colors.blue);
  // createLight(colors.purple);

  function createLight(color) {
    let params = {
      intensity: 10,
      distance: 200,
      falloff: 9,
    };
    const light = new THREE.PointLight(
      color,
      params.intensity,
      params.distance,
      params.falloff
    );
    light.position.set(
      pos.x + (Math.random() * 10 - 5),
      pos.y + (Math.random() * 10 - 5),
      pos.z + Math.random() * 5
    );
    lights.push(light);
    scene.add(light);
  }
}
function loadTextures() {
  const manager = new THREE.LoadingManager();
  manager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
    var loader = document.getElementById("loadbar_internal");
    const progress = itemsLoaded / itemsTotal;
    loader.style.width = progress * 100 + "%";
    console.log(`Last loaded item: ${urlOfLastItemLoaded}`);
    console.log(`Progess: ${progress * 100}%`);
    if (progress == 1) {
      loader.parentElement.parentElement.style.display = "none";
      generateSpace();
    }
  };
  const textureLoader = new THREE.TextureLoader(manager);
  let texturePromise = new Promise(function (resolve, reject) {
    GetTextures(MAIN);
    GetTextures(MOON);
    GetTextures(EARTH);
    GetTextures(MAINCLOUDS);
    GetTextures(MOONCLOUDS);
    GetTextures(EARTHCLOUDS);

    function GetTextures(planet) {
      planet.textureCache = {
        albedo: textureLoader.load(path + planet.texture.albedo),
        roughness: textureLoader.load(path + planet.texture.roughness),
        normal: textureLoader.load(path + planet.texture.normal),
        metalness: textureLoader.load(path + planet.texture.metalness),
        ao: textureLoader.load(path + planet.texture.ao),
        
      };
      if(planet.texture.alphaMap)
      {
        planet.textureCache.alphaMap = textureLoader.load(path + planet.texture.alphaMap);
        console.log("Adding alpha map to "+planet.name);
      }
    }
    

    if (MAIN.textureCache.ao) {
      resolve();
    } else {
      reject();
    }
  });

  texturePromise.then(
    function (value) {
      console.log(`It's done: ${MAIN.textureCache.ao}`);
      // generateSpace();
    },
    function (error) {
      console.log(error);
    }
  );
}

function generateSpace() {
  GenerateSun();
  GenerateAmbient();
  GeneratePlanet("main");
  GeneratePlanet("moon");
  GeneratePlanet("earth");
  GeneratePlanet("mainClouds");
  GeneratePlanet("moonClouds");
  GeneratePlanet("earthClouds");
  renderer.render(scene, camera);
  requestAnimationFrame(render);
  window.addEventListener("scroll", onScroll);
  window.addEventListener("resize", onWindowResize, false);
  SetupGUI();
}
function GenerateAmbient()
{
  ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);
}
function GenerateSun() {
  let pivot = new THREE.Mesh();
  let sunMat = new THREE.MeshStandardMaterial({
    emissiveIntensity: 0.85,
    // emissive: 0xf5e6f0, // darkgrey
    emissive: 0xffffff, // darkgrey
  });
  let sunGeo = new THREE.IcosahedronGeometry(10, 6);
  // let sun = new THREE.PointLight(0xeee4f5, 1.1, 15000000, 0.01);
  let sun = new THREE.PointLight(0xeee4f5, 1.1, 15000000, 0.01);
  sun.add(new THREE.Mesh(sunGeo, sunMat));
  sun.castShadow = false;

  sun.shadow.mapSize.width = 262144; // default
  sun.shadow.mapSize.height = 262144; // default
  sun.shadow.camera.near = 0.5; // default
  sun.shadow.camera.far = 50000000;
  // sun.shadow.

  // sun.position.set(SUN.position[0].x, SUN.position[0].y, SUN.position[0].z);
  console.log(`Sun Orbit Distance ${SUN.orbitDistance}`);
  sun.position.set(0, 0, SUN.orbitDistance);
  pivot.rotation.set(SUN.tilt, SUN.period[0], 0);

  scene.add(pivot);
  pivot.add(sun);
  SUN.mesh = sun;
  SUN.pivot = pivot;
}
function GeneratePlanet(planet) {
  let pivot = new THREE.Mesh();
  let empty = new THREE.Mesh();
  let planetDetails = PLANETS[planet];
  let cache = planetDetails.textureCache;
  let planetMat = new THREE.MeshStandardMaterial({
    map: cache.albedo,
    roughnessMap: cache.roughness,
    normalMap: cache.normal,
    metalnessMap: cache.metalness,
    aoMap: cache.ao,
    color:0xffffff,
    // alphaMap:texturesArray[3],
    transparent: true,
    metalness: 0.0,
    roughness: 0.5,
  });
  if (cache.alphaMap) {
    planetMat.alphaMap = cache.alphaMap;
  };

  if (planet == 'mainClouds' || planet == 'moonClouds' || planet == 'earthClouds')
  {
    planetMat = new THREE.MeshStandardMaterial({
      color:0xffffff,
      alphaMap:cache.alphaMap,
      transparent: true,
      metalness: 0.0,
      roughness: 0.5,
    });
  }
  let planetGeo = new THREE.SphereGeometry(
    planetDetails.size,
    planetDetails.detail,
    planetDetails.detail
  );
  let planetMesh = new THREE.Mesh(planetGeo, planetMat);
  planetMesh.castShadow = true;
  planetMesh.receiveShadow = true;
  // pivot.rotation.z = (Math.PI / 180) * planetDetails.angle;
  if (planetDetails.parent != "sun") {
    parent = PLANETS[planetDetails.parent].empty;
  } else {
    parent = scene;
  }

  

  parent.add(pivot);
  pivot.add(planetMesh);
  pivot.add(empty);
  planetMesh.position.set(0, 0, planetDetails.orbitDistance);
  pivot.rotation.set(planetDetails.tilt, planetDetails.period[0], 0);
  console.log(planet);
  empty.position.set(0, 0, planetDetails.orbitDistance);
  // if (pName == "moon") {
  //   var rings = [
  //     createRing(28, 0.1, 1),
  //     createRing(33, 1.1, 3),
  //     createRing(36, 0.3, -2),
  //     createRing(43, 3.1, -3),
  //     createRing(48, 0.4, 1),
  //     createRing(43, 0.4, 1),
  //   ];
  // }
  planetDetails.empty = empty;
  planetDetails.pivot = pivot;
  planetDetails.mesh = planetMesh;
}

function createRing(innerW, width, z) {
  let mat = new THREE.ShaderMaterial({
    fragmentShader,
    uniforms,
    side: THREE.DoubleSide,
  });
  let geo = new THREE.RingGeometry(innerW, innerW + width, 360);
  var ring = new THREE.Mesh(geo, mat);
  ring.rotation.x = (-90 * Math.PI) / 180;
  MOON.mesh.add(ring);
  return ring;
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.outerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.outerHeight);
}
function onScroll() {
  //Get percent scrolled
  ScrollThrough();
  // OldScroll();
}



function OldScroll() {
  var h = document.documentElement, b = document.body, st = "scrollTop", sh = "scrollHeight";
  var y = ((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100; //0 to 100



  // console.log('camera change:' + (y - ratio) / 1000);
  if (y < ratio / 2) {
    let v = y * 0.02 * (100 / ratio);

    LerpCamera(0, v);

    LerpPivot(MAIN, 0, v);
    LerpPivot(EARTH, 0, v);
    LerpPivot(MOON, 0, v);

    LerpPositionSun(0, v);
  } else if (y < ratio * 1.0) {
    let v = y * 0.02 * (100 / ratio) - 1;
    LerpCamera(1, v);

    LerpPivot(MAIN, 1, v);
    LerpPivot(EARTH, 1, v);
    LerpPivot(MOON, 1, v);

    LerpPositionSun(1, v);

    // planets[0].obj.position.y = end.sun.y;
    // planets[0].obj.position.z = end.sun.z;
  } else if (y >= ratio * 1 && y <= ratio * 1.5) {
    let v = y * 0.02 * (100 / ratio) - 1;
    LerpCamera(2, v);

    LerpPivot(MAIN, 2, v);
    LerpPivot(EARTH, 2, v);
    LerpPivot(MOON, 2, v);

    LerpPositionSun(2, v);
  } else if (y >= ratio * 1.5) {
    camera.position.x = CAMERA.position[2].x;
    camera.position.y = CAMERA.position[2].y;
    camera.position.z = CAMERA.position[2].z;
    // camera.position.z = end.camera.z - (y - ratio) * 12.7;
    // MAIN.pivot.rotation.y = MAIN.pivotRotation[2];
    // MOON.pivot.rotation.y = MOON.pivotRotation[2];
    // EARTH.pivot.rotation.y = EARTH.pivotRotation[2];
    // SUN.mesh.position.x = SUN.position[2].x;
    // SUN.mesh.position.y = SUN.position[2].y;
    // SUN.mesh.position.z = SUN.position[2].z;
  }

  
}

function GetContainerInfo(div,offset,cart) {
  topPixel = $(div).offset().top - $(offset).height();
  bottomPixel = $(div).position().top +
    $(div).outerHeight(true) -
    $(cart).height();
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}
function ScrollThrough()
{
      scrollPosition = GetScrollTop();
      percent = GetPercent(scrollPosition, topPixel, bottomPixel);
      percent = clamp(percent, 0, 100);
      console.log("Scrolled: " + percent+"%");

      if(percent<50)
      {
        let p = percent*2;
        console.log('Section 1: '+p);
        let v=p/100;
        LerpCamera(0, v);
        LerpPivot(MAIN, 0, v);
        LerpPivot(EARTH, 0, v);
        LerpPivot(MOON, 0, v);
        LerpPositionSun(0, v);

      }else if(percent<=100)
      {
        let p = (percent-(50))*2;
        console.log('Section 2: '+p);
        let v=p/100;
        LerpCamera(1, v);
        LerpPivot(MAIN, 1, v);
        LerpPivot(EARTH, 1, v);
        LerpPivot(MOON, 1, v);
        LerpPositionSun(1, v);
      }

      function LerpCamera(i, v) {
        camera.position.x = lerp(
          CAMERA.position[i].x,
          CAMERA.position[i + 1].x,
          v
        );
        camera.position.y = lerp(
          CAMERA.position[i].y,
          CAMERA.position[i + 1].y,
          v
        );
        camera.position.z = lerp(
          CAMERA.position[i].z,
          CAMERA.position[i + 1].z,
          v
        );
      }
    
      function LerpPivot(pName, i, v) {
        pName.pivot.rotation.y = lerp(
          pName.period[i],
          pName.period[i + 1],
          v
        );
      }
      function LerpPositionSun(i, v) {
        // SUN.mesh.position.set(
        //   0,
        //   0,
        //   lerp(SUN.orbitDistance[i], SUN.orbitDistance[i + 1], v)
        // );
        SUN.pivot.rotation.set(
          lerp(SUN.tilt, SUN.tilt, v),
          lerp(SUN.period[i], SUN.period[i + 1], v),
          0
        );
      }
}
function GetScrollTop() {
  return (
    window.pageYOffset ||
    (document.documentElement || document.body.parentNode || document.body)
      .scrollTop
  );
}
function GetPercent(sp, t, b) {
  return (100 * (sp - t)) / (b - t);
}
 

function lerp(min, max, value) {
  return (max - min) * value + min;
}
function removeLoad() {}
