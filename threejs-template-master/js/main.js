import {
    PerspectiveCamera,
    WebGLRenderer,
    PCFSoftShadowMap,
    Scene,
    //Mesh,
    TextureLoader,
    RepeatWrapping,
    DirectionalLight,
    Vector3,
    sRGBEncoding, // Import sRGBEncoding
    //Points,
    //BufferGeometry,
    //BufferAttribute,
    //PointsMaterial,
    AxesHelper, CubeTextureLoader, PlaneGeometry, //MeshBasicMaterial,
} from './lib/three.module.js';

//import Utilities from './lib/Utilities.js';
import MouseLookController from './controls/MouseLookController.js';

//import TextureSplattingMaterial from './materials/TextureSplattingMaterial.js';
//import TerrainBufferGeometry from './terrain/TerrainBufferGeometry.js';
import { GLTFLoader } from './loaders/GLTFLoader.js';
//import { SimplexNoise } from './lib/SimplexNoise.js';
import {Water} from "./Objects/water/water2.js";
import {ParticleEngine, Type, Tween} from '/objects/particle/ParticleEngine.js';

async function main() {

    //const scene = new Scene();
    const scene = new Scene();
    {
        const loader = new CubeTextureLoader();
        scene.background = loader.load([
            'resources/skybox/Daylight Box_Right.bmp',
            'resources/skybox/Daylight Box_Left.bmp',
            'resources/skybox/Daylight Box_Top.bmp',
            'resources/skybox/Daylight Box_Bottom.bmp',
            'resources/skybox/Daylight Box_Front.bmp',
            'resources/skybox/Daylight Box_Back.bmp'
        ]);
    }

    const axesHelper = new AxesHelper(15);
    scene.add(axesHelper);

    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

    const renderer = new WebGLRenderer({ antialias: true });

    // Enable sRGB rendering
    renderer.outputEncoding = sRGBEncoding;

    renderer.setClearColor(0xffffff);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;

    /**
     * Handle window resize:
     *  - update aspect ratio.
     *  - update projection matrix
     *  - update renderer size
     */
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    /**
     * Add canvas element to DOM.
     */
    document.body.appendChild(renderer.domElement);

    /**
     * Add light
     */
    const directionalLight = new DirectionalLight(0xffffff);
    directionalLight.position.set(300, 400, 0);

    directionalLight.castShadow = true;

    //Set up shadow properties for the light
    directionalLight.shadow.mapSize.width = 512;
    directionalLight.shadow.mapSize.height = 512;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 2000;

    scene.add(directionalLight);

    // Set direction
    directionalLight.target.position.set(0, 15, 0);
    scene.add(directionalLight.target);

    camera.position.z = 100;
    camera.position.y = 40;
    camera.rotation.x -= Math.PI * 0.25;

    /**
     * add 3D model fjell
     */

    // instantiate a GLTFLoader:
    const loader = new GLTFLoader();

    loader.load( 'resources/assets/mount.glb', function ( gltf ) {

        const mount = gltf.scene;
        mount.scale.set(0.01, 0.01, 0.01); // Set the scale as needed
        mount.position.set(0, 0, 0); // Set the position
        scene.add(mount);

    }, undefined, function ( error ) {

        console.error( error );

    } );

    // Create a fountain or particle system
    const fountainSettings = {
        positionStyle: Type.CUBE,
        positionBase: new Vector3(0, 5, 0),
        positionSpread: new Vector3(10, 0, 10),
        velocityStyle: Type.CUBE,
        velocityBase: new Vector3(0, 160, 0),
        velocitySpread: new Vector3(100, 20, 100),
        accelerationBase: new Vector3(0, -100, 0),
        particleTexture: new TextureLoader().load('resources/textures/lavatile.jpg'),
        angleBase: 0,
        angleSpread: 180,
        angleVelocityBase: 0,
        angleVelocitySpread: 360 * 4,
        sizeTween: new Tween([0, 1], [1, 20]),
        opacityTween: new Tween([2, 3], [1, 0]),
        colorTween: new Tween([0.5, 2], [
            new Vector3(0, 1, 0.5),
            new Vector3(0.8, 1, 0.5)
        ]),
        particlesPerSecond: 200,
        particleDeathAge: 3.0,
        emitterDeathAge: 60
    };

    // Create the particle system
    const fountain = new ParticleEngine();
    fountain.setValues(fountainSettings);
    fountain.initialize();
    fountain.particleSystem.position.set(0, 5, 0); // Set the position of the particle system

    scene.add(fountain.particleSystem); // Add the particle system to the scene

    // Create a smoke particle system
    const smokeSettings = {
        positionStyle: Type.CUBE,
        positionBase: new Vector3(0, 0, 0),
        positionSpread: new Vector3(10, 0, 10),
        velocityStyle: Type.CUBE,
        velocityBase: new Vector3(0, 150, 0),
        velocitySpread: new Vector3(80, 50, 80),
        accelerationBase: new Vector3(0, -10, 0),
        particleTexture: new TextureLoader().load('resources/images/smokeparticle.png'),
        angleBase: 0,
        angleSpread: 720,
        angleVelocityBase: 0,
        angleVelocitySpread: 720,
        sizeTween: new Tween([0, 1], [32, 128]),
        opacityTween: new Tween([0.8, 2], [0.5, 0]),
        colorTween: new Tween([0.4, 1], [
            new Vector3(0, 0, 0.2),
            new Vector3(0, 0, 0.5)
        ]),
        particlesPerSecond: 200,
        particleDeathAge: 2.0,
        emitterDeathAge: 60
    };

    // Create the smoke particle system
    const smoke = new ParticleEngine();
    //smoke.particleSystem = undefined;
    smoke.setValues(smokeSettings);
    smoke.initialize();
    smoke.particleSystem.position.set(0, 0, 0); // Set the position of the particle system

    scene.add(smoke.particleSystem); // Add the particle system to the scene


    // Opprett en enkel geometri (vulkan)
    /*const volcanoGeometry = new TConeGeometry(0.5, 1, 8); // Juster størrelsen etter behov
    const volcanoMaterial = new MeshBasicMaterial({ color: 0xFF0000 }); // Rød farge for vulkanen
    const volcano = new Mesh(volcanoGeometry, volcanoMaterial);
    volcano.position.set(0, 2, 0); //Plasser vulkanen som ønsker
    scene.add(volcano);

    // Legg til lyskilder for å belyse scenen
    const light = new PointLight(0xFFFFFF);
    light.position.set(5, 5, 5);
    scene.add(light);

     */


// Water
    const waterGeometry = new PlaneGeometry( 10000, 10000 );


    let water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new TextureLoader().load( 'resources/images/waternormals.jpg', function ( texture ) {

                texture.wrapS = texture.wrapT = RepeatWrapping;

            } ),
            sunDirection: new Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );

    water.position.y = 10;
    water.rotation.x = - Math.PI / 2;

    scene.add( water );

    /**
     * Add trees
     */

    /*loader.load(
        // resource URL
        'resources/models/kenney_nature_kit/tree_thin.glb',
        // called when resource is loaded
        (object) => {
            for (let x = -50; x < 50; x += 8) {
                for (let z = -50; z < 50; z += 8) {

                    const px = x + 1 + (6 * Math.random()) - 3;
                    const pz = z + 1 + (6 * Math.random()) - 3;

                    const height = terrainGeometry.getHeightAt(px, pz);

                    if (height < 5) {
                        const tree = object.scene.children[0].clone();

                        tree.traverse((child) => {
                            if (child.isMesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                            }
                        });

                        tree.position.x = px;
                        tree.position.y = height - 0.01;
                        tree.position.z = pz;

                        tree.rotation.y = Math.random() * (2 * Math.PI);

                        tree.scale.multiplyScalar(1.5 + Math.random() * 1);

                        scene.add(tree);
                    }

                }
            }
        },
        (xhr) => {
            console.log(((xhr.loaded / xhr.total) * 100) + '% loaded');
        },
        (error) => {
            console.error('Error loading model.', error);
        }
    );*/

    /**
     * Set up camera controller:
     */

    const mouseLookController = new MouseLookController(camera);

    // We attach a click lister to the canvas-element so that we can request a pointer lock.
    // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
    const canvas = renderer.domElement;

    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    let yaw = 0;
    let pitch = 0;
    const mouseSensitivity = 0.001;

    function updateCamRotation(event) {
        yaw += event.movementX * mouseSensitivity;
        pitch += event.movementY * mouseSensitivity;
    }

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvas) {
            canvas.addEventListener('mousemove', updateCamRotation, false);
        } else {
            canvas.removeEventListener('mousemove', updateCamRotation, false);
        }
    });

    let move = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        speed: 0.01
    };

    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyW') {
            move.forward = true;
            e.preventDefault();
        } else if (e.code === 'KeyS') {
            move.backward = true;
            e.preventDefault();
        } else if (e.code === 'KeyA') {
            move.left = true;
            e.preventDefault();
        } else if (e.code === 'KeyD') {
            move.right = true;
            e.preventDefault();
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'KeyW') {
            move.forward = false;
            e.preventDefault();
        } else if (e.code === 'KeyS') {
            move.backward = false;
            e.preventDefault();
        } else if (e.code === 'KeyA') {
            move.left = false;
            e.preventDefault();
        } else if (e.code === 'KeyD') {
            move.right = false;
            e.preventDefault();
        }
    });

    const velocity = new Vector3(0.0, 0.0, 0.0);

    let then = performance.now();
    function loop(now) {

        const delta = now - then;
        then = now;

        const moveSpeed = move.speed * delta;

        velocity.set(0.0, 0.0, 0.0);

        if (move.left) {
            velocity.x -= moveSpeed;
        }

        if (move.right) {
            velocity.x += moveSpeed;
        }

        if (move.forward) {
            velocity.z -= moveSpeed;
        }

        if (move.backward) {
            velocity.z += moveSpeed;
        }

        // update controller rotation.
        mouseLookController.update(pitch, yaw);
        yaw = 0;
        pitch = 0;

        // apply rotation to velocity vector, and translate moveNode with it.
        velocity.applyQuaternion(camera.quaternion);
        camera.position.add(velocity);


        //const time = performance.now() * 0.001;

        water.material.uniforms[ 'time' ].value += 1.0 / 60.0;


        // render scene:
        renderer.render(scene, camera);

        requestAnimationFrame(loop);

    }

    loop(performance.now());

}

main(); // Start application
