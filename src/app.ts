import {
    SceneLoader,
    Engine,
    Scene,
    FreeCamera,
    Vector3,
    HemisphericLight,
    Color3,
    ShadowGenerator,
    DirectionalLight,
    Color4,
    UniversalCamera,
    Camera,
    Mesh,
    StandardMaterial,
    RenderTargetTexture,
    Material
} from "@babylonjs/core";
import "@babylonjs/loaders";

export class App {
    canvas: HTMLCanvasElement;
    engine: Engine;
    scene: Scene;
    camera: FreeCamera;

    constructor(canvasElementName: string) {
        this.canvas = document.getElementById(canvasElementName) as HTMLCanvasElement;
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);

        // Scene

        this.scene.clearColor = Color4.FromHexString("#7bd2f9");

        const assumedFramesPerSecond = 60;
        const earthGravity = -9.81;
        this.scene.gravity = new Vector3(0, earthGravity / assumedFramesPerSecond, 0);
        this.scene.collisionsEnabled = true;

        // Camera

        this.camera = new UniversalCamera(
            "camera1",
            new Vector3(-9, 1.6, -2),
            this.scene
        );
        this.camera.speed = .6;
        this.camera.keysUp = [38, 87];
        this.camera.keysRight = [39, 68];
        this.camera.keysDown = [40, 83];
        this.camera.keysLeft = [37, 65];
        this.camera.attachControl(this.canvas, true);
        this.camera.minZ = 0.1;
        this.camera.inertia = 0.6;
        this.camera.angularSensibility = 1200;
        this.camera.ellipsoid = new Vector3(.5, .8, .5);
        this.camera.checkCollisions = true;
        this.camera.applyGravity = true;

        // Scene onLoad

        SceneLoader.Append(
            "resources/",
            "dice.glb",
            this.scene,
            scene => {
                // MATERIAL
                const glass = scene.getMaterialByName("mat_glass");
                glass.alphaMode = 7;
                glass.alpha = .2;
                glass.transparencyMode = Material.MATERIAL_ALPHATESTANDBLEND;

                scene.meshes.forEach(mesh => {
                    mesh.renderOutline = true;
                    mesh.outlineWidth = 0.007;
                    mesh.outlineColor = Color3.FromHexString("#000000");
                });

                // LIGHT

                scene.lights.forEach(light => {
                    light.intensity = .75;
                });

                // HemisphericLight

                const hemisphericLight = new HemisphericLight(
                    "hemispheric",
                    new Vector3(0, 1, 0),
                    this.scene
                );
                hemisphericLight.intensity = .7;
                hemisphericLight.diffuse = Color3.FromHexString("#FFECD7");

                // Directional DownLight

                const downLight = new DirectionalLight(
                    "directional",
                    new Vector3(10, -100, -10),
                    this.scene
                );
                downLight.diffuse = Color3.FromHexString("#FFECD7");
                downLight.intensity = 1;

                // Directional UpLight

                const upLight = new DirectionalLight(
                    "directional",
                    new Vector3(0, 100, 0),
                    this.scene
                );
                upLight.diffuse = Color3.FromHexString("#FFECD7");
                upLight.intensity = .5;

                // SHADOW

                const shadowGenerator = new ShadowGenerator(2048, downLight);
                shadowGenerator.usePercentageCloserFiltering = true;
                // shadowGenerator.blurKernel = 4;
                // shadowGenerator.transparencyShadow = true;
                // shadowGenerator.enableSoftTransparentShadow = true;
                shadowGenerator.getShadowMap().refreshRate = RenderTargetTexture.REFRESHRATE_RENDER_ONCE;

                const casterPrefixes = [
                    "obj",
                    "wall",
                    "curtain",
                    "door",
                    "window"
                ];
                scene.meshes.forEach(mesh => {
                    casterPrefixes.forEach(prefix => {
                        if (mesh.id.startsWith(prefix)) {
                            shadowGenerator.addShadowCaster(mesh, true);
                        }
                    });
                });

                const shadowReceivers = [
                    "wall",
                    "floor",
                    "carpet"
                ];

                scene.meshes.forEach(mesh => {
                    shadowReceivers.forEach(prefix => {
                        if (mesh.id.startsWith(prefix)) {
                            mesh.receiveShadows = true;
                        };
                    });
                });

                // COLLISIONS

                const colliders = [
                    "floor",
                    "wall",
                    "window"
                ]

                colliders.forEach(collider => {
                    const node = scene.getNodeByID(collider);
                    node.getChildMeshes().forEach(mesh => {
                        mesh.checkCollisions = true;
                    });
                });

                this.addGunSight(scene);

                this.canvas.onclick = e => {
                    if (!scene.getEngine().isPointerLock) {
                        scene.getEngine().enterPointerlock();
                    };
                };

            }
        );
    }

    addGunSight(scene) {
        if (scene.activeCameras.length === 0) {
            scene.activeCameras.push(scene.activeCamera);
        }
        var secondCamera = new FreeCamera("GunSightCamera", new Vector3(0, 0, -50), scene);
        secondCamera.mode = Camera.ORTHOGRAPHIC_CAMERA;
        secondCamera.layerMask = 0x20000000;
        scene.activeCameras.push(secondCamera);

        const circle = Mesh.CreateSphere("c", 64, 5);
        circle.position = new Vector3(0, 0, 0);
        circle.renderOutline = true;
        circle.outlineWidth = 0.5;
        circle.outlineColor = new Color3(0, 0, 0);
        circle.name = "gunSight";
        circle.layerMask = 0x20000000;
        circle.freezeWorldMatrix();

        var mat = new StandardMaterial("emissive mat", scene);
        mat.checkReadyOnlyOnce = true;
        mat.emissiveColor = new Color3(1, 1, 1);

        circle.material = mat;
    }

    render() {
        this.engine.runRenderLoop(() => this.scene.render());
        window.addEventListener("resize", () => this.engine.resize());
    }
}