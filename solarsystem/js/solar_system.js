// ORBIT CONTROLS!!!!

var scene = null;
var renderer = null;
var materials = {};
var objects = [];
var controls = null;

var sphere = null;
var orbit_line = null;

var backgroungImg = "img/stars.jpg";
var currentTime = Date.now();

function run() {
    requestAnimationFrame(function() {
        run();
    });
    // Render the scene
    renderer.render(scene, camera);

    // Spin the cube for next frame
    animate();

    // Update the camera controller
    // orbitControls.update();
    controls.update();
}

function animate() {
    var now = Date.now();
    var deltat = now - currentTime;
    objects.forEach(element => {
        element.update(now, deltat);
    });
    currentTime = now;
}

function createMaterials() {
    materials["sun"] = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("img/sun_uv.jpg")
    });
    materials["line"] = new THREE.LineBasicMaterial({ color: 0x222200 });
    materials["asteroid"] = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });

    basic_body_list.forEach(element => {
        var filenameBase = "img/" + element + "_";
        var texture = new THREE.TextureLoader().load(filenameBase + "uv.jpg");
        var normalMap = new THREE.TextureLoader().load(
            filenameBase + "normal.jpg"
        );
        var specularMap = new THREE.TextureLoader().load(
            filenameBase + "specular.jpg"
        );
        materials[element] = new THREE.MeshLambertMaterial({
            map: texture,
            normalMap: normalMap,
            specularMap: specularMap
        });
    });
    materials["ring"] = new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture("img/saturn_ring.png"),
        bumpMap: THREE.ImageUtils.loadTexture("img/ring_bumpmap.jpg"),
        bumpScale: 0.06,
        side: THREE.DoubleSide,
        emissive: new THREE.Color(0xE0BE98),
        emissiveIntensity: 0.1,
        transparent: true,
    });
}

function deg2rad(val) {
    return (val / 180.0) * Math.PI;
}

function calcOrbit(time, period, size, inc) {
    direction = new THREE.Vector3(1, 0, 0);
    var theta = ((time / 1000) * 2 * Math.PI) / period;
    var vec = new THREE.Vector3();
    vec.setX(size * Math.cos(theta));
    vec.setZ(size * Math.sin(theta));
    direction.normalize();
    vec.applyAxisAngle(direction, deg2rad(inc));
    return vec;
}

function makeOrbitLine() {
    var geometry = new THREE.Geometry();
    for (let index = 0; index <= 360; index++) {
        var theta = (index / 180.0) * Math.PI;
        geometry.vertices.push(
            new THREE.Vector3(Math.cos(theta), 0, Math.sin(theta))
        );
    }
    return geometry;
}

function makePlanet(name) {
    var planet = new THREE.Mesh(sphere, materials[name]);
    planet.scale.multiplyScalar(body_scale_ratio * body_scale[name]);
    planet.update = (now, deltat) => {
        var fract = deltat / 1000 / rotation_period[name];
        var angle = Math.PI * 2 * fract;
        planet.rotation.y += angle;
    };
    objects.push(planet);
    return planet;
}

function makeAndAddPlanet(name, parent) {
    var planetGroup = new THREE.Object3D();
    var planet = makePlanet(name);
    planet.castShadow = true;
    planet.receiveShadow = true;
    planetGroup.add(planet);
    var line = new THREE.Line(orbit_line, materials["line"]);
    line.scale.multiplyScalar(orbit_scale * orbit_size[name]);
    var inclination = body_orbit_inclination[name];
    line.rotation.x = deg2rad(inclination);
    parent.add(line);
    planetGroup.update = (now, deltat) => {
        planetGroup.position.copy(
            calcOrbit(
                now,
                orbit_period[name],
                orbit_scale * orbit_size[name],
                inclination
            )
        );
    };
    objects.push(planetGroup);
    parent.add(planetGroup);
    return planetGroup;
}

function createScene(canvas) {
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Image background
    scene.background = new THREE.TextureLoader().load(backgroungImg);
    // scene.background = new THREE.Color(0.0, 0.0, 0.0);

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera(
        45,
        canvas.width / canvas.height,
        1,
        4000
    );
    controls = new THREE.OrbitControls(camera, canvas);
    camera.position.set(0, 0, 20);
    controls.update();
    scene.add(camera);

    // Create materials
    createMaterials();

    // Basic sphere
    sphere = new THREE.SphereGeometry(4, 32, 32);
    // Orbit line
    orbit_line = makeOrbitLine();

    // Sun
    var sun = new THREE.Mesh(sphere, materials["sun"]);
    sun.position.set(0, 0, 0);
    sun.update = (now, deltat) => {
        var fract = deltat / 1000 / rotation_period["sun"];
        var angle = Math.PI * 2 * fract;
        sun.rotation.y += angle;
    };
    objects.push(sun);
    scene.add(sun);

    // Sun light
    sunLight = new THREE.PointLight(0xffffff, 1, 0, 1);
    sunLight.position.set(0, 0, 0);
    sunLight.shadowCameraVisible = true;
    sunLight.shadowDarkness = 1;
    sunLight.castShadow = true;
    // sunLight.shadow.mapSize.width = 2048;
    // sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    scene.add(sunLight);

    makeAndAddPlanet("mercury", scene);
    makeAndAddPlanet("venus", scene);
    var earthGroup = makeAndAddPlanet("earth", scene);
    makeAndAddPlanet("mars", scene);
    var jupiterGroup = makeAndAddPlanet("jupiter", scene);
    var saturnGroup = makeAndAddPlanet("saturn", scene);
    makeAndAddPlanet("uranus", scene);
    makeAndAddPlanet("neptune", scene);
    makeAndAddPlanet("pluto", scene);

    var rings = new THREE.RingGeometry(2, 3, 64);
    var mesh = new THREE.Mesh(rings, materials["ring"]);
    mesh.rotation.x += (0.9 * Math.PI) / 2;
    mesh.receiveShadow = true
    mesh.castShadow = true;
    saturnGroup.add(mesh);

    makeAndAddPlanet("moon", earthGroup);

    makeAndAddPlanet("europa", jupiterGroup);
    makeAndAddPlanet("io", jupiterGroup);

    asteroids();
}

async function asteroids() {
    var geometry = null;
    var loader = new THREE.OBJLoader();
    var promise = new Promise(resolve => {
        loader.load("obj/asteroid.obj", resolve);
    });

    var obj = await promise;

    obj.traverse(function(child) {
        if (child.geometry !== undefined) {
            geometry = child.geometry;
        }
    });

    var asteroid_belt = new THREE.Object3D();
    var mean = (orbit_scale*orbit_size["jupiter"] + orbit_scale*orbit_size["mars"])/2;
    console.log(mean);
    for (let index = 0; index < 1500; index++) {
        var thing = new THREE.Mesh(geometry, materials["asteroid"]);
        var length = normalRandomScaled(mean , orbit_scale*20);
        var rot = deg2rad(360 * Math.random());
        thing.scale.multiplyScalar(0.001);
        thing.position.x = length * Math.cos(rot);
        thing.position.z = length * Math.sin(rot);
        thing.position.y = Math.random()
        // thing.castShadow = true;
        asteroid_belt.add(thing);
    }

    asteroid_belt.update = (now, deltat) => {
        var fract = deltat / 1000 / 1000;
        var angle = Math.PI * 2 * fract;
        asteroid_belt.rotation.y -= angle;
    };

    objects.push(asteroid_belt);
    scene.add(asteroid_belt);
}


/**
 * Found in https://gist.github.com/bluesmoon/7925696
 */
var spareRandom = null;
function normalRandom() {
    var val, u, v, s, mul;

    if (spareRandom !== null) {
        val = spareRandom;
        spareRandom = null;
    } else {
        do {
            u = Math.random() * 2 - 1;
            v = Math.random() * 2 - 1;

            s = u * u + v * v;
        } while (s === 0 || s >= 1);

        mul = Math.sqrt((-2 * Math.log(s)) / s);

        val = u * mul;
        spareRandom = v * mul;
    }

    return val / 14; // 7 standard deviations on either side
}

function normalRandomInRange(min, max) {
    var val;
    do {
        val = normalRandom();
    } while (val < min || val > max);

    return val;
}

function normalRandomScaled(mean, stddev) {
    var r = normalRandomInRange(-1, 1);

    r = r * stddev + mean;

    return r;
}
