// import './style.css'
// import * as THREE from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
// import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
// import * as dat from 'dat.gui'
// import { Vector2, Vector3 } from 'three';

// import './style.css'
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r79/three.min.js'
// import { OrbitControls } from 'OrbitControls'
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.122.0/examples/js/loaders/OBJLoader.min.js'
import { EXRLoader } from 'https://cdn.jsdelivr.net/npm/three@0.141.0/examples/jsm/loaders/EXRLoader.min.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.141.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.141.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.141.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import dat from 'https://cdnjs.cloudflare.com/ajax/libs/dat-gui/0.7.7/dat.gui.js'
// import { Vector2, Vector3 } from 'three';




let object, exrCubeRenderTarget, exrBackground, logo, composer, floorMaterial, logoMaterial, scrollPosition = 0, cameraMouseX, cameraMouseY, logoObj, realScrollPosition= 0, transitionSpeed= 0.05;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

let mouse = new THREE.Vector2;
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Find Canvas
const canvas = document.querySelector('canvas.webgl')

// Create Scene
const scene = new THREE.Scene()

//Construct Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.toneMapping = THREE.ReinhardToneMapping;



const logoParams =
{
    roughness: 0.0,
    metalness: 1.0,
    exposure: 1,
    textureNumber: 5,
    textureScale: 20,
    
}
const params = {

    bloomStrength: 2.1,
    bloomThreshold: 0.65,
    bloomRadius: 0.2,
    stage: 0,
};

const logoP =
    [
        {
            position: new THREE.Vector3(0.59, -10.73, -18),
            rotation: new THREE.Euler(0, 0, 0),
            scale: new THREE.Vector3(2.93, 2.93, 2.93),
        },


        {
            position: new THREE.Vector3(0.59, -10.73, -18),
            rotation: new THREE.Euler(0, 0, 2),
            scale: new THREE.Vector3(2.93, 2.93, 2.93),
        }, {
            position: new THREE.Vector3(0.59, -10.73, -18),
            rotation: new THREE.Euler(0, 0, 4),
            scale: new THREE.Vector3(2.93, 2.93, 2.93),
        }, {
            position: new THREE.Vector3(0.59, -10.73, -18),
            rotation: new THREE.Euler(0, 0, 6),
            scale: new THREE.Vector3(2.93, 2.93, 2.93),
        }, {
            position: new THREE.Vector3(0.18, 8.26, -17.19),
            rotation: new THREE.Euler(-0.6, -0.39, 8),
            scale: new THREE.Vector3(2.93, 2.93, 2.93),
        }, {
            position: new THREE.Vector3(-18, -18, -18),
            rotation: new THREE.Euler(-3.14, -3.14, 10),
            scale: new THREE.Vector3(3.6, 3.6, 3.6),
        }, {
            position: new THREE.Vector3(-18, -18, -18),
            rotation: new THREE.Euler(1.87, -3.14, 12),
            scale: new THREE.Vector3(3.6, 3.6, 3.6),
        },


    //Final
    {
            position: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 131.60842499998682),
            scale: new THREE.Vector3(0.91, 0.91, 0.91),
        }

    ]
const cameraP =
    [
        {
            position: new THREE.Vector3(0, -1.99, 0),
            rotation: new THREE.Euler(0, 0.03, 0.88),
        },



        {
            position: new THREE.Vector3(14.85, -14.34, -9.290000000000001),
            rotation: new THREE.Euler(-1.52, 1.8, -2.5100000000000002),
        }, {
            position: new THREE.Vector3(14.85, -14.34, -9.290000000000001),
            rotation: new THREE.Euler(-1.52, 1.8, -2.5100000000000002),
        }, {
            position: new THREE.Vector3(25, -17.14, -6.48),
            rotation: new THREE.Euler(-1.52, 1.8, -2.5100000000000002),
        }, {
            position: new THREE.Vector3(-25, -25, 25),
            rotation: new THREE.Euler(-3.14, -3.14, -3.14),
        }, {
            position: new THREE.Vector3(15.41, -9.85, 25),
            rotation: new THREE.Euler(0.38, 0.6, -0.39),
        }, {
            position: new THREE.Vector3(-25, -25, 25),
            rotation: new THREE.Euler(-3.14, -3.14, -3.14),
        },


    //Final
    {
            position: new THREE.Vector3(0, 0, 25),
            rotation: new THREE.Euler(0, 0, 0),
        }

    ]

const hdrP =
    [
        {
            rotation: new THREE.Euler(-0.18, -2.86, -0.96),
        },



        {
            rotation: new THREE.Euler(-0.18, -2.86, -0.96),
        }, {
            rotation: new THREE.Euler(1.3, -0.46, -1.3800000000000001),
        }
        , {
            rotation: new THREE.Euler(3.14, -3.14, 0.88),
        }
        , {
            rotation: new THREE.Euler(3.14, -1.03, -1.45),
        }
        ,
        {
            rotation: new THREE.Euler(-0.53, -3.14, -1.6600000000000001),
        }
        ,
        {
            rotation: new THREE.Euler(3.14, -0.6, -3.14),
        },


    //Final 
    {
            rotation: new THREE.Euler(2.29, -0.81, 1.02),
        }

    ]


init();

function init() {



    //Create Materials
    createMaterials();
}


// Debug

function setupGUI() {

    // console.log(camera);

    const gui = new dat.GUI()
    let guiCamera = gui.addFolder('Camera');
    let guiCameraRot = guiCamera.addFolder('Camera Rotation');
    guiCameraRot.add(camera.rotation, 'x', -Math.PI, Math.PI, .01).name("X").onChange((value) => { camera.rotation.x = value })
    guiCameraRot.add(camera.rotation, 'y', -Math.PI, Math.PI, .01).name("y").onChange((value) => { camera.rotation.y = value })
    guiCameraRot.add(camera.rotation, 'z', -Math.PI, Math.PI, .01).name("z").onChange((value) => { camera.rotation.z = value })
    let guiCameraPos = guiCamera.addFolder('Camera Position');
    guiCameraPos.add(camera.position, 'x', -25, 25, .01).name("X").onChange((value) => { camera.position.x = value })
    guiCameraPos.add(camera.position, 'y', -25, 25, .01).name("y").onChange((value) => { camera.position.y = value })
    guiCameraPos.add(camera.position, 'z', -25, 25, .01).name("z").onChange((value) => { camera.position.z = value })

    let guiLogo = gui.addFolder('Logo');
    let guiRot = guiLogo.addFolder('Logo Rotation');
    guiRot.add(logo.rotation, 'x', -Math.PI, Math.PI, .01).name("X").onChange((value) => { logo.rotation.x = value })
    guiRot.add(logo.rotation, 'y', -Math.PI, Math.PI, .01).name("y").onChange((value) => { logo.rotation.y = value })
    guiRot.add(logo.rotation, 'z', -Math.PI, Math.PI, .01).name("z").onChange((value) => { logo.rotation.z = value })
    let guiPos = guiLogo.addFolder('Logo Position');
    guiPos.add(logo.position, 'x', -18, 18, .01).name("X").onChange((value) => { logo.position.x = value })
    guiPos.add(logo.position, 'y', -18, 18, .01).name("y").onChange((value) => { logo.position.y = value })
    guiPos.add(logo.position, 'z', -18, 18, .01).name("z").onChange((value) => { logo.position.z = value })
    let guiScale = guiLogo.addFolder('Logo Scale');
    guiScale.add(logo.scale, 'x', 0.01, 20, .01).name("X").onChange((value) => { logo.scale.set(value, value, value) })

    let guiHDR = gui.addFolder('HDR');
    let guiHDRRot = guiHDR.addFolder('HDR Rotation');
    guiHDRRot.add(HDRPivot.rotation, 'x', -Math.PI, Math.PI, .01).name("X").onChange((value) => { HDRPivot.rotation.x = value })
    guiHDRRot.add(HDRPivot.rotation, 'y', -Math.PI, Math.PI, .01).name("y").onChange((value) => { HDRPivot.rotation.y = value })
    guiHDRRot.add(HDRPivot.rotation, 'z', -Math.PI, Math.PI, .01).name("z").onChange((value) => { HDRPivot.rotation.z = value })



}





//Create Materials Function

function createMaterials() {

    logoMaterial = new THREE.MeshStandardMaterial({
        metalness: logoParams.roughness,
        roughness: logoParams.metalness,
        envMapIntensity: 1.0,
        color: 0x000000,
    });

    floorMaterial = new THREE.MeshStandardMaterial({
        metalness: logoParams.roughness,
        roughness: logoParams.metalness,
        envMapIntensity: 1.0,
        color: 0x000000,
    });

};


// HDR Manipulator
const HDRPivot = new THREE.Mesh();
// HDR.position.x = -4
// HDR.position.y = 0
// HDR.position.z = -18
HDRPivot.rotation.set(hdrP[params.stage].rotation.x, hdrP[params.stage].rotation.y, hdrP[params.stage].rotation.z);
// HDR.position = HDRP[params.stage].position;
// HDR.rotation = HDRP[params.stage].rotation;
scene.add(HDRPivot)

function angle(angle) {
    return angle * Math.PI / 180;
}

function lerp(min, max, value) {
    return (min + (max - min) * value);
}

function easeInOut(t) {
    return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1
  }

// logo = new THREE.Mesh();

function loadModel() {


    object.traverse(function (child) {

        if (child.isMesh) {
            let leg = child;
            leg.material.color = 0x000000;
            leg.material = logoMaterial;

            generateTextures(leg);
            // leg.material.specularMap = specular;

            //Set position/rotation/scale




        }
    });
    logo = new THREE.Mesh();
    logoObj = object;

    logo.rotation.set(
        logoP[params.stage].rotation.x,
        logoP[params.stage].rotation.y,
        logoP[params.stage].rotation.z,
    );
    logo.scale.set(
        logoP[params.stage].scale.x,
        logoP[params.stage].scale.y,
        logoP[params.stage].scale.z,
    );
    logo.position.set(
        logoP[params.stage].position.x,
        logoP[params.stage].position.y,
        logoP[params.stage].position.z,
    );

    logoObj.rotation.set(0, 0, 0);
    logoObj.rotation.set(0, 0, 0);
    logoObj.scale.set(1, 1, 1);

    HDRPivot.add(logo);
    logo.add(logoObj);
    setupGUI();
}

const manager = new THREE.LoadingManager(loadModel);

var button = document.getElementById("button");
button.addEventListener("click", exportInfo);

// texture

const textureLoader = new THREE.TextureLoader(manager);
const texture = textureLoader.load('./textures/metal' + logoParams.textureNumber + '/A23DTEX_Albedo.jpg');
const roughness = textureLoader.load('./textures/metal' + logoParams.textureNumber + '/A23DTEX_Roughness.jpg');
const specular = textureLoader.load('./textures/metal' + logoParams.textureNumber + '/A23DTEX_Specular.jpg');
const normal = textureLoader.load('./textures/metal' + logoParams.textureNumber + '/A23DTEX_Normal.jpg');
const aoMap = textureLoader.load('./textures/metal' + logoParams.textureNumber + '/A23DTEX_AO.jpg');

function generateTextures(model) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(logoParams.textureScale, logoParams.textureScale);

    roughness.wrapS = THREE.RepeatWrapping;
    roughness.wrapT = THREE.RepeatWrapping;
    roughness.repeat.set(logoParams.textureScale, logoParams.textureScale);

    normal.wrapS = THREE.RepeatWrapping;
    normal.wrapT = THREE.RepeatWrapping;
    normal.repeat.set(logoParams.textureScale, logoParams.textureScale);

    model.material.map = texture;
    model.material.roughnessMap = roughness;
    model.material.normalMap = normal;
    model.material.aoMap = aoMap;
}

// model

function onProgress(xhr) {

    if (xhr.lengthComputable) {

        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log('model ' + Math.round(percentComplete, 2) + '% downloaded');

    }

}

function onError() { }

const loader = new OBJLoader(manager);
loader.load('./models/icon-website.obj', function (obj) {

    object = obj;

}, onProgress, onError);

//

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
// camera.position.x = -4
// camera.position.y = 0
// camera.position.z = -18
camera.position.set(cameraP[params.stage].position.x, cameraP[params.stage].position.y, cameraP[params.stage].position.z);
camera.rotation.set(cameraP[params.stage].rotation.x, cameraP[params.stage].rotation.y, cameraP[params.stage].rotation.z);
// camera.position = cameraP[params.stage].position;
// camera.rotation = cameraP[params.stage].rotation;
HDRPivot.add(camera)


//Bloom
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;

composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

//EXR Maps
new EXRLoader()
    .load('textures/equirect.exr', function (texture) {

        exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
        exrBackground = exrCubeRenderTarget.texture;

        texture.dispose();

    });


const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();




window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

window.addEventListener('wheel', (event) => {

    scrollPosition += -event.wheelDeltaY / 800;
    // animateScroll();
})

document.addEventListener('pointermove', onPointerMove);

function onPointerMove(event) {

    if (event.isPrimary === false) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    cameraMouseX = event.clientX - windowHalfX;
    cameraMouseY = event.clientY - windowHalfY;

    // console.log(new THREE.Vector2(cameraMouseX, cameraMouseY));


}

function exportInfo() {

    console.log
        (
            `Logo:
        {
            position: new THREE.Vector3(${logo.position.x},${logo.position.y},${logo.position.z}),
            rotation: new THREE.Vector3(${logo.rotation.x},${logo.rotation.y},${logo.rotation.z}),
            scale: new THREE.Vector3(${logo.scale.x},${logo.scale.y},${logo.scale.z}),
        }`
        );
    console.log
        (
            `Camera:
        {
            position: new THREE.Vector3(${camera.position.x},${camera.position.y},${camera.position.z}),
            rotation: new THREE.Vector3(${camera.rotation.x},${camera.rotation.y},${camera.rotation.z}),
        }`
        );
    console.log
        (
            `HDR:
        {
            rotation: new THREE.Vector3(${HDRPivot.rotation.x},${HDRPivot.rotation.y},${HDRPivot.rotation.z}),
        }`
        );
}

function updateScrollPosition(deltaTime)
{
    console.log(`
        sp:${scrollPosition}
        rsp:${realScrollPosition}
    `);
    if (scrollPosition > realScrollPosition)
    {
        scrollPosition = scrollPosition-deltaTime
    }
    else
    {
        scrollPosition = scrollPosition+deltaTime
    }
}

function animateScroll() {

    
    
    if(params.stage == logoP.length-1) return;
    if(params.stage < 0) 
    {
        scrollPosition = 0.01;
        params.stage = 0;
        return;
    }
    if (scrollPosition > 0) {
        // logo.rotation.x = lerp(logoP[params.stage].rotation.x, logoP[params.stage+1].rotation.x, easeInOut(scrollPosition));
        // logo.rotation.y = lerp(logoP[params.stage].rotation.y, logoP[params.stage+1].rotation.y, easeInOut(scrollPosition));
        // logo.rotation.z = lerp(logoP[params.stage].rotation.z, logoP[params.stage+1].rotation.z, easeInOut(scrollPosition));

        logo.quaternion.slerp(new THREE.Quaternion().setFromEuler(logoP[params.stage+1].rotation),transitionSpeed);
       
        logo.position.lerp(logoP[params.stage+1].position,transitionSpeed);

        // camera.rotation.x = lerp(cameraP[params.stage].rotation.x, cameraP[params.stage+1].rotation.x,transitionSpeed);
        // camera.rotation.y = lerp(cameraP[params.stage].rotation.y, cameraP[params.stage+1].rotation.y,transitionSpeed);
        // camera.rotation.z = lerp(cameraP[params.stage].rotation.z, cameraP[params.stage+1].rotation.z,transitionSpeed);
        // camera.rotation.lerp(cameraP[params.stage].rotation.x, cameraP[cameraParams.position+1].rotation,transitionSpeed);
        camera.quaternion.slerp(new THREE.Quaternion().setFromEuler(cameraP[params.stage+1].rotation),transitionSpeed);

        // camera.position.x = lerp(cameraP[params.stage].position.x, cameraP[params.stage+1].position.x,transitionSpeed);
        // camera.position.y = lerp(cameraP[params.stage].position.y, cameraP[params.stage+1].position.y,transitionSpeed);
        // camera.position.z = lerp(cameraP[params.stage].position.z, cameraP[params.stage+1].position.z,transitionSpeed);
        camera.position.lerp(cameraP[params.stage+1].position,transitionSpeed);

        // HDRPivot.rotation.x = lerp(hdrP[params.stage].rotation.x, hdrP[params.stage+1].rotation.x,transitionSpeed);
        // HDRPivot.rotation.y = lerp(hdrP[params.stage].rotation.y, hdrP[params.stage+1].rotation.y,transitionSpeed);
        // HDRPivot.rotation.z = lerp(hdrP[params.stage].rotation.z, hdrP[params.stage+1].rotation.z,transitionSpeed);
        HDRPivot.quaternion.slerp(new THREE.Quaternion().setFromEuler(hdrP[params.stage+1].rotation),transitionSpeed);

        console.log(logo.rotation.x);
    }

    if (scrollPosition >= 1) {
        params.stage++;

        console.log(params.stage)
        // logo.position.x = logoP[params.stage];
        // logo.position.y = logoP[params.stage];
        // logo.position.z = logoP[params.stage];

        // logo.rotation.x
        scrollPosition = 0;
    }
    
    if (scrollPosition < 0) {
        params.stage--;

        console.log(params.stage)
        // logo.position.x = logoP[params.stage];
        // logo.position.y = logoP[params.stage];
        // logo.position.z = logoP[params.stage];
        scrollPosition = 0.99;
    }

}

//Lights


//Ground
const floorGeometry = new THREE.PlaneGeometry(200, 200);
const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
floorMesh.receiveShadow = true;
floorMesh.rotation.x = - Math.PI / 2.0;
floorMesh.position.y = -15;
// scene.add( floorMesh );

// Controls

function ControlSetup() {

    var _controls = new OrbitControls(camera, canvas)
    _controls.enableDamping = true
    _controls.enablePan = false;
    _controls.enableRotate = false;
    _controls.enableZoom = false;

    return _controls
}

// const controls = new ControlSetup();


/**
 * Animate
 */

const clock = new THREE.Clock()

const tick = () => {

    const elapsedTime = clock.getElapsedTime()

    const delta = clock.getDelta()*1000;

    if (logo) {
        logo.traverse((leg) => {
            if (leg.isMesh) {

                let newEnvMap = leg.material.envMap;
                newEnvMap = exrCubeRenderTarget ? exrCubeRenderTarget.texture : null;
                if (newEnvMap !== leg.material.envMap) {

                    leg.material.envMap = newEnvMap;
                    leg.material.needsUpdate = true;
                }
            }



        })
        logoObj.rotation.z = .05 * elapsedTime

        //Lerp to scroll position

        // updateScrollPosition(delta);

        animateScroll();
        // console.log(`Delta: ${delta}`)

    }

    // Update Orbital Controls
    // controls.update()



    composer.render();


    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
