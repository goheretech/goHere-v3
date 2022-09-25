import * as THREE from "three";
// import { loaded } from "./../stores/var.js";

    let camera,
      scene = new THREE.Scene(),
      renderer,
      canvas;

    let texEarth, texMoon, texPlanet, texPlanetAtmo;
    let loader = new THREE.TextureLoader();
    let i = 0;
    let start = {
      camera: new THREE.Vector3(70, 10, 870),
      sun: new THREE.Vector3(2340, 0, 1320),
      main: new THREE.Vector3(-5, 0, 600),
      sec: new THREE.Vector3(100, 0, -600),
      third: new THREE.Vector3(38, -9, 0),
    };
    let mid = {
      camera: new THREE.Vector3(265, 35, -470),
      mainPivot: 0,
      secPivot: -0.1 * Math.PI,
      thirdPivot: 1.7 * Math.PI,
    };
    let end = {
      camera: new THREE.Vector3(276.4, 21.2, -520),
      mainPivot: 0,
      secPivot: -0.12 * Math.PI,
      thirdPivot: 3.1 * Math.PI,
    };
    let planets = [];
    let lights = [];
    let pivots = [];
    let empties = [];
    let clouds = [];
    let cloudPos = {
      start: new THREE.Vector3(90, -10, 700),
      mid: new THREE.Vector3(130, 25, 220),
      end: new THREE.Vector3(280, 30, -700),
    };
    let colors = {
      orange: new THREE.Color("hsl(32, 85%, 44%)"),
      blue: new THREE.Color("hsl(186, 85%, 44%)"),
      purple: new THREE.Color("hsl(308, 85%, 44%)"),
    };
    let uniforms;

    let progressModel = 0,
      progressBG = 0,
      progress;

    //Page Length Percent
    var ratio = 43.8;

    let clock = new THREE.Clock(),
      phase = 0,
      delta;
    let textureArray = {
      earth: {
        albedo: "planet3-full.jpg?raw=true",
        roughness: "planet1/roughness.jpg?raw=true",
        normal: "planet1/normal.jpg?raw=true",
        metalness: "planet1/metalness.jpg?raw=true",
        ao: "planet1/ambientocclusion.jpg?raw=true",
      },
      moon: {
        albedo: "planet1-full.jpg?raw=true",
        roughness: "planet1/roughness.jpg?raw=true",
        normal: "planet1/normal.jpg?raw=true",
        ao: "planet1/ambientocclusion.jpg?raw=true",
      },
      planet: {
        albedo: "planet1/albedo.jpg?raw=true",
        roughness: "planet1/roughness.jpg?raw=true",
        normal: "planet1/normal.jpg?raw=true",
        ao: "planet1/ambientocclusion.jpg?raw=true",
      },
      earthClouds: {
        albedo: "clouds.png?raw=true",
        
        alphaMap: "clouds.png?raw=true"
      },
    };
    
    let textureCache = new Object();

    let promiseArray = [],
      texturePromiseArray = [],
      path = "https://github.com/goheretech/goHere-v3/blob/master/src/img/Planets/",
      texturesArray = [];
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
    init();
    function init() {
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
      //Camera
      camera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        0.1,
        3000
      );
      camera.position.set(start.camera.x, start.camera.y, start.camera.z);
      scene.add(camera);
      createClouds(cloudPos.start, 9, 4, 0.5, 5);
      createClouds(cloudPos.mid, 45, 9, 6, 20);
      createClouds(cloudPos.end, 33, 9, 6, 5);

      loadTextures();
      renderer.setClearColor(0xeb4034, 0);
    }
    function render() {
      let delta = clock.getDelta();
      var time = clock.elapsedTime;
      planets.forEach((planet, i) => {
        planet.obj.rotation.y +=
          ((delta / 10) * (i - 0.5) * 20 * Math.PI) / 180;
      });
      clouds.forEach((p) => {
        p.rotation.z -= 0.001;
      });
      let sin = Math.sin(clock.elapsedTime / 1000);

      // lights.forEach((p) => {
      //   p.color.offsetHSL(delta / 3, delta, 0);
      // });

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
      createLight(colors.orange);
      createLight(colors.blue);
      createLight(colors.purple);

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
        var loader = document.getElementById("perc");
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
        textureCache = {
          earth: {
            albedo: textureLoader.load(path + textureArray.earth.albedo),
            roughness: textureLoader.load(path + textureArray.earth.roughness),
            normal: textureLoader.load(path + textureArray.earth.normal),
            metalness: textureLoader.load(path + textureArray.earth.metalness),
            ao: textureLoader.load(path + textureArray.earth.ao),
          },
          moon: {
            albedo: textureLoader.load(path + textureArray.moon.albedo),
            roughness: textureLoader.load(path + textureArray.moon.roughness),
            normal: textureLoader.load(path + textureArray.moon.normal),
            ao: textureLoader.load(path + textureArray.moon.ao),
          },
          planet: {
            albedo: textureLoader.load(path + textureArray.planet.albedo),
            roughness: textureLoader.load(path + textureArray.planet.roughness),
            normal: textureLoader.load(path + textureArray.planet.normal),
            ao: textureLoader.load(path + textureArray.planet.ao),
          },
          earthClouds: {
            albedo: textureLoader.load(path + textureArray.earthClouds.albedo),
            alphaMap: textureLoader.load(path + textureArray.earthClouds.alphaMap),
          },
        };
        if (textureCache) {
          resolve();
        } else {
          reject();
        }
      });

      texturePromise.then(
        function (value) {
          console.log(`It's done: ${textureCache.planet.ao}`);
          // generateSpace();
        },
        function (error) {
          console.log(error);
        }
      );
    }

    function loadTexturesOld() {
      const manager = new THREE.LoadingManager();
      manager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
        var loader = document.getElementById("perc");
        const progress = itemsLoaded / itemsTotal;
        loader.style.width = progress * 100 + "%";
        console.log(`Last loaded item: ${urlOfLastItemLoaded}`);
        if (progress == 1) {
          loader.parentElement.parentElement.style.display = "none";
        }
      };
      const textureLoader = new THREE.TextureLoader(manager);

      // texEarth = textureLoader.load(path + textureArray[0].albedo);
      texMoon = textureLoader.load(path + textureArray[1].albedo);
      texPlanet = textureLoader.load(path + textureArray[2].albedo);
      texPlanetAtmo = textureLoader.load(path + textureArray[3].albedo);
      let planet1Albedo = textureLoader.load(path + planetTextures1[0].albedo);
      let planet1Roughness = textureLoader.load(
        path + planetTextures1[1].albedo
      );
      let planet1Normal = textureLoader.load(path + planetTextures1[2].albedo);
      let planet1AOMap = textureLoader.load(path + planetTextures1[3].albedo);

      // console.log(earth);
      // console.log(moon);
      // console.log(planet);
      // console.log(planetAtmo);
      generateSpace();
    }
    function loadTexturesOlder(callback) {
      textureArray.forEach(function (fileOBJ) {
        texturePromiseArray.push(
          new Promise(function (resolve, reject) {
            loader.load(
              path + fileOBJ.url,

              function (texture) {
                loadProgress();
                texturesArray.push(texture);
                var modelOBJ = new Object();

                modelOBJ[fileOBJ.name] = texture;

                if (modelOBJ[fileOBJ.name] instanceof THREE.Texture)
                  resolve(modelOBJ);
              },

              // function (xhr) {
              //     console.log(
              //         (xhr.loaded / xhr.total) * 100 + '% loaded'
              //     );
              // },

              function (xhr) {
                reject(
                  new Error(
                    xhr +
                      "An error occurred loading while loading" +
                      fileOBJ.url
                  )
                );
              }
            );
          })
        );
      });

      Promise.all(texturePromiseArray).then(function (textures) {
        generateSpace();
        if (
          callback &&
          typeof callback === "function" &&
          textureArray.length == textures.length
        ) {
          callback(textures);
        }
      });

      function loadProgress() {
        var loader = document.getElementById("perc");

        i++;
        progress = (i / textureArray.length) * 100;
        console.log(`Percent loaded ${progress}%`);

        loader.style.width = progress + "%";

        if (progress == 100) {
          loader.parentElement.parentElement.style.display = "none";
        }
      }
    }
    function generateSection() {}
    function generateSpace() {
      console.log("Gen space");
      genSun();
      createPlanet("planet", 70, start.main, scene, 25, 5);
      createPlanet("moon", 22, start.sec, pivots[0].obj, 20, 5);
      createPlanet("earth", 0.5, start.third, empties[1].obj, 15, 0);
      createPlanet("earthClouds", 71, start.main, scene, 25, 5);
      renderer.render(scene, camera);
      requestAnimationFrame(render);
      window.addEventListener("scroll", onScroll);
      window.addEventListener("resize", onWindowResize, false);
    //   loaded.set(true);
    }
    function genSun() {
      let sunMat = new THREE.MeshStandardMaterial({
        emissiveIntensity: 1,
        // emissive: 0xf5e6f0, // darkgrey
        emissive: 0xffffff, // darkgrey
      });
      let sunGeo = new THREE.IcosahedronGeometry(0.2, 6);
      // let sun = new THREE.PointLight(0xeee4f5, 1.1, 15000000, 0.01);
      let sun = new THREE.PointLight(0xeee4f5, 1.1, 15000000, 0.01);
      sun.add(new THREE.Mesh(sunGeo, sunMat));
      scene.add(sun);
      sun.position.set(start.sun.x, start.sun.y, start.sun.z);
      planets.push({
        name: "sun",
        obj: sun,
      });
    }
    function createPlanet(name, size, position, parent, detail, angle) {
      let pivot = new THREE.Mesh();
      let empty = new THREE.Mesh();
      let planetMat = new THREE.MeshStandardMaterial({
        map: textureCache[name].albedo,
        roughnessMap: textureCache[name].roughness,
        normalMap: textureCache[name].normal,
        metalnessMap: textureCache[name].metalness,
        aoMap: textureCache[name].ao,
        // color:0xeee4f5,
        // alphaMap:texturesArray[3],
        transparent: true,
        metalness: 0.0,
        roughness: 0.5,
      });
      // console.log(texture);
      if (textureCache[name].alphaMap) {
        planetMat.alphaMap = textureCache[name].alphaMap;
      }
      console.log(planetMat);
      let planetGeo = new THREE.SphereGeometry(size, detail, detail);
      let planet = new THREE.Mesh(planetGeo, planetMat);
      pivot.rotation.z = (Math.PI / 180) * angle;
      parent.add(pivot);
      pivot.add(planet);
      pivot.add(empty);
      planet.position.set(position.x, position.y, position.z);
      empty.position.set(position.x, position.y, position.z);
      planets.push({
        name: name,
        obj: planet,
      });
      pivots.push({
        name: name + "Pivot",
        obj: pivot,
      });
      empties.push({
        name: name + "Empty",
        obj: empty,
      });
      if (name == "secondary") {
        var rings = [
          createRing(28, 0.1, 1),
          createRing(33, 1.1, 3),
          createRing(36, 0.3, -2),
          createRing(43, 3.1, -3),
          createRing(48, 0.4, 1),
          createRing(43, 0.4, 1),
        ];
      }
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
      planets[2].obj.add(ring);
      return ring;
    }
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.outerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.outerHeight);
    }
    function onScroll() {
      //Get percent scrolled
      var h = document.documentElement,
        b = document.body,
        st = "scrollTop",
        sh = "scrollHeight";
      var y = ((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100; //0 to 100

      // console.log('camera change:' + (y - ratio) / 1000);

      if (y < ratio / 2) {
        let v = y * 0.02 * (100 / ratio);
        camera.position.x = lerp(start.camera.x, mid.camera.x, v);
        camera.position.y = lerp(start.camera.y, mid.camera.y, v);
        camera.position.z = lerp(start.camera.z, mid.camera.z, v);

        pivots[1].obj.rotation.y = lerp(0, mid.secPivot, v);
        pivots[2].obj.rotation.y = lerp(0, mid.thirdPivot, v);
      } else if (y < ratio * 1.0) {
        let v = y * 0.02 * (100 / ratio) - 1;
        camera.position.x = lerp(mid.camera.x, end.camera.x, v);
        camera.position.y = lerp(mid.camera.y, end.camera.y, v);
        camera.position.z = lerp(mid.camera.z, end.camera.z, v);

        pivots[1].obj.rotation.y = lerp(mid.secPivot, end.secPivot, v);
        pivots[2].obj.rotation.y = lerp(mid.thirdPivot, end.thirdPivot, v);
      } else if (y >= ratio * 1 && y <= ratio * 1.5) {
        camera.position.x = end.camera.x;
        camera.position.y = end.camera.y - (y - ratio) * 0.13;
        camera.position.z = end.camera.z;

        pivots[1].obj.rotation.y = end.secPivot;
        pivots[2].obj.rotation.y = end.thirdPivot;
      } else if (y >= ratio * 1.5) {
        camera.position.x = end.camera.x;
        camera.position.y = end.camera.y;
        camera.position.z = end.camera.z - (y - ratio) * 12.7;

        pivots[1].obj.rotation.y = end.secPivot;
        pivots[2].obj.rotation.y = end.thirdPivot;
      }
    }
    function lerp(min, max, value) {
      return (max - min) * value + min;
    }
    function removeLoad() {}
