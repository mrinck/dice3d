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
    UniversalCamera
} from "@babylonjs/core";
import "@babylonjs/loaders";

export class App {
    canvas: HTMLCanvasElement;
    engine: Engine;
    scene: Scene;
    camera: FreeCamera;
    light: DirectionalLight;

    constructor(canvasElementName: string) {
        this.canvas = document.getElementById(canvasElementName) as HTMLCanvasElement;
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);

        // Scene

        this.scene.clearColor = Color4.FromHexString("#ffffff");

        const assumedFramesPerSecond = 60;
        const earthGravity = -9.81;
        this.scene.gravity = new Vector3(0, earthGravity / assumedFramesPerSecond, 0);
        this.scene.collisionsEnabled = true;

        // Camera

        this.camera = new UniversalCamera(
            "camera1",
            new Vector3(-9, 2, -2),
            this.scene
        );
        this.camera.speed = .2;
        this.camera.keysUp = [38, 87];
        this.camera.keysRight = [39, 68];
        this.camera.keysDown = [40, 83];
        this.camera.keysLeft = [37, 65];
        this.camera.attachControl(this.canvas, true);
        this.camera.minZ = 0.1;

        this.camera.ellipsoid = new Vector3(.5, .8, .5);
        this.camera.checkCollisions = true;
        this.camera.applyGravity = true;



        // HemisphericLight

        const hemisphericLight = new HemisphericLight(
            "hemispheric",
            new Vector3(0, 1, 0),
            this.scene
        );
        hemisphericLight.intensity = .8;
        hemisphericLight.diffuse = Color3.FromHexString("#FFECD7");

        // Directional Light

        this.light = new DirectionalLight(
            "directional",
            new Vector3(10, -100, -10),
            this.scene
        );
        this.light.diffuse = Color3.FromHexString("#FFECD7");
        this.light.intensity = 1;

        // Scene onLoad

        SceneLoader.Append(
            "resources/",
            "dice.glb",
            this.scene,
            scene => {
                // MATERIAL
                const glass = scene.getMaterialByName("mat-glass");
                glass.alphaMode = 7;
                glass.alpha = .2;
                glass.transparencyMode = 2;

                scene.meshes.forEach(mesh => {
                    mesh.renderOutline = true;
                    mesh.outlineWidth = 0.005;
                    mesh.outlineColor = Color3.FromHexString("#000000");
                });

                // SHADOW
                const shadowGenerator = new ShadowGenerator(4096, this.light);
                shadowGenerator.useBlurExponentialShadowMap = true;
                shadowGenerator.blurKernel = 4;

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

                const floor = scene.getNodeByID("floor");
                floor.getChildMeshes().forEach(mesh => mesh.receiveShadows = true);

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
            }
        );
    }

    render() {
        this.engine.runRenderLoop(() => this.scene.render());
        window.addEventListener("resize", () => this.engine.resize());
    }
}