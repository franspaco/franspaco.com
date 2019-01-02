// ORBIT CONTROLS!!!!

var scene = null;
var renderer = null;
var materials = {};
var controls = null;

var spiro = null;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var minTempo = 50;
var maxTempo = 150;

async function startUp(){
    let urlParams = new URLSearchParams(window.location.search);
    qmax = urlParams.get('max');
    qmin = urlParams.get('min');
    qbpm = urlParams.get('bpm');

    if(qmax != null){
        maxTempo = Number(qmax)
    }
    if(qmin != null){
        minTempo = Number(qmin)
        if(minTempo > maxTempo){
            minTempo = maxTempo;
        }
    }
    if(qbpm != null){
        var bpm = 60000/Number(qbpm);
        maxTempo = (1+Math.exp(-0.007*bpm))*bpm;
        minTempo = (1-Math.exp(-0.007*bpm))*bpm;
    }

    var canvas = document.getElementById("webglcanvas");
    var container = $("#container");

    canvas.width = container.width();
    canvas.height = container.height();
    // create the scene
    createScene(canvas);
    await createObjects();
    run();
}

var next_update = 0;

function updateSpiro(){
    var RA = getRandomInt(5, 20)
    var RB = getRandomInt(-15, 20)
    var AL = getRandomInt(5, 20)
    spiro.geometry = spiroGeometry(RA, RB, AL, 1);
    spiro.material.color.setHex(getRandomInt(0, 0xffffff));
}

function run() {
    requestAnimationFrame(function() {
        run();
    });
    // Render the scene
    renderer.render(scene, camera);

    // Animate
    KF.update();

    // Update the camera controller
    // orbitControls.update();
    controls.update();

    if (Date.now() > next_update) {
        updateSpiro();
        next_update = Date.now() + getRandomInt(minTempo, maxTempo);
    }
}

function createMaterials() {
    materials['line'] = new THREE.LineBasicMaterial({
        color: 0xff00ff,
        linewith: 1,
    })
}

function deg2rad(val) {
    return (val / 180.0) * Math.PI;
}
function gcd(a, b){
    while(b > 0){
      var temp = b;
      b = a % b;
      a = temp;
    }
    return a;
}
function lcm(a, b){
    return a * (b/gcd(a,b));
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
    scene.background = new THREE.Color(0.0, 0.0, 0.0);

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera(
        45,
        canvas.width / canvas.height,
        1,
        4000
    );
    controls = new THREE.OrbitControls(camera, canvas);
    controls.autoRotate = true;
    camera.position.set(0, 0, 100);
    controls.update();
    scene.add(camera);

    // Create materials
    createMaterials();
}

async function createObjects(){
    var geometry1 = spiroGeometry(20, 14, 14, 1);
    spiro = new THREE.Line(geometry1, materials["line"]);
    scene.add(spiro);

    console.log(spiro);

    // var geometry2 = spiroGeometry(15, -7, -7, 1);
    // var spiro2 = new THREE.Line(geometry2, materials["line"]);
    // spiro2.material.color.setHex(0x00ff00);
    // scene.add(spiro2);
}

function spiroGeometry(RA, RB, AL, adjust){
    var geometry = new THREE.Geometry();
    var dAngle = 0.01;
    var stopAngle = 2*Math.PI*lcm(Math.abs(RA),Math.abs(RB))/Math.abs(RA);
    var period = period = 2*Math.PI*RB/RA;
    for (let angle = 0; angle <= stopAngle; angle+= dAngle) {
        geometry.vertices.push(nextPoint(angle, RA, RB, AL, adjust, period));
    }
    geometry.vertices.push(nextPoint(0, RA, RB, AL, adjust, period));
    return geometry;
}

function nextPoint(angle, RA, RB, AL, adjust, period){
    var X = (RA+RB)*Math.cos(angle)-AL*Math.cos((RA/RB+1)*angle);
    var Y = (RA+RB)*Math.sin(angle)-AL*Math.sin((RA/RB+1)*angle);
    X *= adjust;
    Y *= adjust;
    var Z = RB*Math.sin(angle*2*Math.PI/period);
    //var Z = Math.pow(3*angle, 1);
    return new THREE.Vector3(X, Y, Z);
}
