import {
    SceneLoader,
    Engine,
    Scene,
    FreeCamera,
    Light,
    Vector3,
    HemisphericLight,
    Color3,
    ShadowGenerator,
    IShadowLight,
    DirectionalLight,
    PointLight,
    Color4
} from "@babylonjs/core";
import "@babylonjs/loaders";

export class App {
    canvas: HTMLCanvasElement;
    engine: Engine;
    scene: Scene;
    camera: FreeCamera;
    light: Light;

    constructor(canvasElementName: string) {
        this.canvas = document.getElementById(canvasElementName) as HTMLCanvasElement;
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);
        // this.scene.debugLayer.show();

        this.scene.clearColor = Color4.FromHexString("#ffffff");

        // Camera

        this.camera = new FreeCamera(
            "camera1",
            new Vector3(0, 5, -10),
            this.scene
        );
        this.camera.attachControl(this.canvas, false);

        // Light

        const hemisphericLight = new HemisphericLight(
            "hemispheric",
            new Vector3(0, 1, 0),
            this.scene
        );
        hemisphericLight.intensity = .8;
        hemisphericLight.diffuse = Color3.FromHexString("#FFECD7");


        this.light = new DirectionalLight(
            "directional",
            new Vector3(10, -100, 10),
            this.scene
        );
        this.light.diffuse = Color3.FromHexString("#FFECD7");
        this.light.intensity = .9;

        // Scene

        SceneLoader.Append(
            "resources/",
            "dice.glb",
            this.scene,
            scene => {
                // MATERIAL
                const matGlass = scene.getMaterialByName("mat-glass");
                matGlass.alphaMode = 7;
                matGlass.alpha = .2;
                matGlass.transparencyMode = 2;

                // SHADOW
                const shadowGen = new ShadowGenerator(4096, this.light as IShadowLight);
                shadowGen.useBlurExponentialShadowMap = true;

                const casters = scene.meshes.filter(mesh => mesh.id.startsWith("obj."));
                casters.push(scene.getMeshByID("wall"));

                casters.forEach(mesh => {
                    shadowGen.addShadowCaster(mesh, true);
                });

                /*
                const receivers = ["floor", "wall"];
                receivers.forEach(receiver => {
                    const node = scene.getNodeByID(receiver);
                    node.getChildMeshes().forEach(mesh => mesh.receiveShadows = true);
                });
                */

                const node = scene.getNodeByID("floor");
                node.getChildMeshes().forEach(mesh => mesh.receiveShadows = true);
            }
        );
    }

    render() {
        this.engine.runRenderLoop(() => this.scene.render());
        window.addEventListener("resize", () => this.engine.resize());
    }
}