

var scene = null;
var renderer = null;
var materials = {};
var controls = null;
var moles = [];
var moles_meshes = [];
var lastUpdate = null;
var mouse = new THREE.Vector2();
var raycaster = null;
var imgloader = new THREE.TextureLoader();

var score = 0;
var score_field = null;
var highscore = 0;
var highscore_field = null;


var playing = false;
var timer = null;
var timer_field = null;

var menu = null;


/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * TEMPORIZADORES
 */
function getDownTime(){
    return Date.now() + 500 + 5000*Math.random();
}

function getUpTime(){
    // Cada topo se lavanta cada ~9 segundos
    return Date.now() + 1000 + poisson(1/8000);
}

function getStartUpTime(){
    return Date.now() + 1000 + 9000*Math.random();
}

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Utilities
 */
function poisson(lambda){
    return -Math.log(Math.random())/lambda;;
}

async function asyncLoadImg(url){
    return new Promise((resolve, fail) => {
        imgloader.load(url, resolve, null, fail);
    });
}

function deg2rad(val) {
    return (val / 180.0) * Math.PI;
}

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Basic stuff
 */

/**
 * Starts the game
 */
function reset_start(){
    timer = Date.now() + 50000;
    playing = true;
    score = 0;
    menu.addClass("hidden");
    moles.forEach(mole => {
        mole.position.y = -6;
        mole.nextEvent = getStartUpTime();
        mole.nextDown = null;
    });
    updateScore();
    run();
}

/**
 * Stops the game
 */
function stop_game(){
    playing = false;
    menu.removeClass("hidden");
    moles.forEach(mole => {
        mole.dnAnimation.stop();
        mole.upAnimation.stop();
        mole.killAnimation.stop();
        mole.animation = null;
    });
}

/**
 * Initialized everything
 */
async function startUp(){
    score_field = $("#score-field");
    highscore_field = $("#highscore-field");
    timer_field = $("#time-indicator");
    menu = $("#menu");
    $("#reset-button").click(() =>{
        reset_start();
    });

    var canvas = document.getElementById("webglcanvas");
    var container = $("#container");
    canvas.width = container.width();
    canvas.height = container.height();
    // create the scene
    createScene(canvas);

    // Create materials
    await createMaterials();

    // Create objects
    await createObjects();

    raycaster = new THREE.Raycaster();
    document.addEventListener('mousedown', onDocumentMouseDown);
    lastUpdate = Date.now();

    run();

    // Show menu after loading is done
    menu.removeClass("hidden");
}

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Scoring & UI functions
 */

/**
 * Records a hit in the score & requests an update of the UI
 */
function hit(){
    score += 10;
    updateScore();
}

/**
 * Updates score UI
 */
function updateScore(){
    score_field.text("Score: " + score);
    if(score > highscore){
        highscore = score;
        updateHighscore();
    }
}

/**
 * Updates score UI
 */
function updateHighscore(){
    highscore_field.text("Highscore: " + highscore);
}

/**
 * Updates time lest timer UI
 */
function updateTimer(now){
    timer_field.text(Math.round((timer - now)/1000));
}

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Rendering & animation 
 */

/**
 * Main render function
 */
function run() {
    if(playing){
        requestAnimationFrame(run);
    }
    // setTimeout( function() {
    //     requestAnimationFrame( run );
    // }, 1000 / 30 );

    // Calculate times
    var now = Date.now();
    var deltat = now - lastUpdate;
    lastUpdate = now;

    // Update timer on screen
    if(playing){
        updateTimer(now);
    }

    // Render the scene
    renderer.render(scene, camera);

    // Kill game when time runs out
    if (playing && Date.now() >= timer){
        stop_game();
    }

    // Update the camera controller
    // orbitControls.update();
    //controls.update();

    if(playing){

        // Animate
        KF.update();

        // Automatic up/down mole controls
        getUpDown();

        // Animate moles
        moles.forEach(element => {
            element.animate(deltat);
        });
    }
}

/**
 * Mole events
 */
function getUpDown(){
    moles.forEach(element => {
        if(element.nextEvent != null && Date.now() > element.nextEvent){
            element.dnAnimation.stop();
            element.upAnimation.start();
            element.nextEvent = null;
            element.nextDown = getDownTime();
            element.animation = 'atk';
        }
        if(element.nextDown != null && Date.now() > element.nextDown){
            element.dnAnimation.start();
            element.nextDown = null;
            element.nextEvent = getUpTime();
        }
    });
}

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Objects & materials
 */

/**
 * Create materials
 */
async function createMaterials() {
    // Plane Background
    var texture = await asyncLoadImg("img/background.jpg");
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16);
    var texture_bump = await asyncLoadImg("img/background.jpg");
    texture_bump.wrapS = texture_bump.wrapT = THREE.RepeatWrapping;
    texture_bump.repeat.set(16, 16);
    // Desactivado porque alenta, pero aqui esta el pasto con bumps
    // materials['surface'] = new THREE.MeshPhongMaterial({map: texture, bumpMap: texture_bump, bumpScale: 0.3, specular: 0x0});
    materials['surface'] = new THREE.MeshLambertMaterial({map: texture});
    materials['slot'] = new THREE.MeshLambertMaterial({color: 0x101010});
}

/**
 * Set up scene
 */
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
    scene.background = new THREE.Color(0.0, 0.0, 0.0);

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera(
        45,
        canvas.width / canvas.height,
        1,
        4000
    );
    // controls = new THREE.OrbitControls(camera, canvas);
    camera.position.set(0, 40, 20);
    camera.rotation.set(-1.1071487177940904, 0, 0);
    // controls.update();
    scene.add(camera);

    var light = new THREE.PointLight(0xffffff, 2);
    light.position.set(0, 20, 20);
    light.shadowCameraVisible = true;
    light.shadowDarkness = 1;
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadowCameraVisible = true;
    scene.add(light);

    var amLight = new THREE.AmbientLight(0x333333);
    scene.add(amLight);
}

/**
 * Create objects
 */

async function createObjects(){

    // Background plane
    var plane = new THREE.PlaneGeometry(100, 100);
    var surface = new THREE.Mesh(plane, materials['surface']);
    surface.rotation.x = -Math.PI/2;
    surface.receiveShadow = true;
    scene.add(surface);

    // Slots
    var cylinder_g = new THREE.CylinderGeometry( 3, 3, 1, 32 );

    var cylinders = [];
    for (let index = 0; index < 9; index++) {
        cylinders.push(new THREE.Mesh(cylinder_g, materials['slot']));
        cylinders[index].receiveShadow = true;
    }

    cylinders[1].position.set(  0,0,-10);
    cylinders[2].position.set(  0,0, 10);
    cylinders[3].position.set(-10,0,  0);
    cylinders[4].position.set( 10,0,  0);
    cylinders[5].position.set(-10,0,-10);
    cylinders[6].position.set(-10,0, 10);
    cylinders[7].position.set( 10,0,-10);
    cylinders[8].position.set( 10,0, 10);

    cylinders.forEach(element => {
        scene.add(element)
    });

    var loader = new THREE.FBXLoader();
    var obj = await loader.asyncLoad('models/robot_atk.fbx');
    obj.scale.set(0.009, 0.009, 0.009);
    obj.traverse( function ( child ) {
        if ( child.isMesh ) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    var obj2 = await loader.asyncLoad('models/robot_walk.fbx');

    moles.push(obj);
    for (let index = 0; index < 8; index++) {
        moles.push(cloneFbx(obj));
    }

    moles[0].position.set(  0,-6,  0);
    moles[1].position.set(  0,-6,-10);
    moles[2].position.set(  0,-6, 10);
    moles[3].position.set(-10,-6,  0);
    moles[4].position.set( 10,-6,  0);
    moles[5].position.set(-10,-6,-10);
    moles[6].position.set(-10,-6, 10);
    moles[7].position.set( 10,-6,-10);
    moles[8].position.set( 10,-6, 10);

    // Provision each mole
    moles.forEach(element => {
        element.traverse( function ( child ) {
            if ( child.isMesh ) {
                var ray_mesh = child;
                ray_mesh.parent_mole = element;
                moles_meshes.push(ray_mesh);
            }
        });
        scene.add(element);
        element.nextEvent = null;
        element.nextDown = null;
        element.upAnimation = new KF.KeyFrameAnimator;
        element.upAnimation.init({
            interps: [
                {
                    keys: [0, 1.0],
                    values: [
                        {y:  -6},
                        {y:  0}
                    ],
                    target: element.position
                }
            ],
            loop: false,
            duration:700,
            easing:TWEEN.Easing.Sinusoidal.In,
        });
        element.dnAnimation = new KF.KeyFrameAnimator;
        element.dnAnimation.init({
            interps: [
                {
                    keys: [0, 1.0],
                    values: [
                        {y:  0},
                        {y:  -6}
                    ],
                    target: element.position
                }
            ],
            loop: false,
            duration:200,
            easing:TWEEN.Easing.Sinusoidal.In,
        });
        element.killAnimation = new KF.KeyFrameAnimator;
        element.killAnimation.init({
            interps: [
                {
                    keys: [0, 1.0],
                    values: [
                        {y: 0},
                        {y:  -10}
                    ],
                    target: element.position
                },
                {
                    keys: [0, 1.0],
                    values: [
                        {x:     0, z: 0},
                        {x:  -1.6, z: -2}
                    ],
                    target: element.rotation
                }
            ],
            loop: false,
            duration:700,
            easing:TWEEN.Easing.Sinusoidal.In,
        });
        element.killAnimation.onEnd = function(){
            element.rotation.set(0,0,0);
            element.animation = null;
            element.traverse( function ( child ) {
                if ( child.isMesh ) {
                    child.material.emissive.setHex(0x0);
                }
            });
        }
        element.mixer = {
            atk: new THREE.AnimationMixer(scene),
            die: new THREE.AnimationMixer(scene)
        }

        element.mixer.atk.clipAction( obj.animations[ 0 ], element ).play();
        element.mixer.die.clipAction( obj2.animations[ 0 ], element ).play();
        element.animation = null;
        element.animate = function(deltat) {
            if(element.animation != null && element.mixer[element.animation]){
                element.mixer[element.animation].update(deltat * 0.001);
            }
        }

        // Stop animating when the robot is hidden
        element.dnAnimation.onEnd = function() {
            element.animation = null;
        }
    });
}

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Events
 */

/**
 * Mouse click
 */
function onDocumentMouseDown(event){
    if(!playing)
        return;
    event.preventDefault();
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( moles_meshes );

    if ( intersects.length > 0 ) 
    {
        var mesh = intersects[ 0 ].object;
        var mole = mesh.parent_mole;
        if(mole.animation === 'atk'){
            mole.animation = 'die';
            mole.killAnimation.start();
            mole.nextDown = null;
            mole.nextEvent = getUpTime();
            mesh.material.emissive.setHex( 0xff0000 );
            hit();
        }
    }
}