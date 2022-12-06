import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import "@babylonjs/loaders/OBJ";
import "@babylonjs/loaders/STL";
import { GridMaterial, FurMaterial } from "@babylonjs/materials";
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  ParticleHelper,
  Color3,
  Texture,
  StandardMaterial,
  Camera,
} from "@babylonjs/core";
import "@babylonjs/core/Debug/debugLayer"; // Augments the scene with the debug methods
import "@babylonjs/inspector"; // Injects a local ES6 version of the inspector to prevent automatically relying on the none compatible version

type IApp<T> = {
  scene: Scene;
  camera: T;
};

class App {
  public Ready: Promise<IApp<ArcRotateCamera>>;

  public scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
    this.scene.debugLayer.show();

    // this.scene.fogMode = Scene.FOGMODE_EXP;
    // this.scene.fogEnabled = true;
    // this.scene.fogDensity = 0.05;
    // this.scene.gravity = new Vector3(0, -2, 0);

    var hemiLight = new HemisphericLight(
      "hemiLight",
      new Vector3(0, 5, 0),
      this.scene
    );
    hemiLight.intensity = 2.75;

    var ground = MeshBuilder.CreateGround(
      "ground",
      {
        width: 10,
        height: 10,
      },
      this.scene
    );
    // var normalMaterial = new StandardMaterial("material");
    const furMaterial = new FurMaterial("fur", this.scene);
    const furTexture = FurMaterial.GenerateTexture("furTexture", this.scene);
    furMaterial.furTexture = furTexture;
    furMaterial.furSpacing = 2; // Computes the space between shells. In others words, works as the fur height
    furMaterial.furDensity = 15; // Computes the fur density. More the density is high, more you'll have to zoom on the model
    furMaterial.furSpeed = 200; // Divides the animation of fur in time according to the gravity
    // Compute the gravity followed by the fur
    // furMaterial.furGravity = new Vector3(0, -1, 0);
    furMaterial.diffuseTexture = new Texture("grass.jpeg", this.scene);
    furMaterial.diffuseColor = new Color3(0, 0, 0);
    ground.material = furMaterial;

    const quality = 100; // Average quality
    const shells = FurMaterial.FurifyMesh(ground, quality);

    // for (let i = 0; i < shells.length; i++) {
    //   shells[i].material.dispose();
    //   shells[i].dispose();
    // }

    var cylinder = MeshBuilder.CreateCylinder(
      "cylinder",
      {
        height: 4,
        diameterBottom: 0.1,
        diameterTop: 0.4,
      },
      this.scene
    );
    cylinder.position.y = 3;

    var box = MeshBuilder.CreateBox("box", { size: 1 }, this.scene);
    box.position.y = 0.5;
    box.position.x = 5;
    box.visibility = 0;

    var camera = new ArcRotateCamera(
      "Camera",
      0,
      Math.PI / 2.75,
      20,
      new Vector3(
        cylinder.position.x,
        cylinder.position.y,
        cylinder.position.z
      ),
      this.scene
    );
    camera.allowUpsideDown = false;
    camera.zoomToMouseLocation = true;
    camera.wheelDeltaPercentage = 0.05;
    // camera.maxZ = 40;

    // This targets the camera to scene origin
    // camera.setTarget(Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    this.Ready = new Promise((resolve, reject) => {
      const particles = [];

      const particlesFire = ParticleHelper.ParseFromSnippetAsync(
        "JZU4M1#2",
        this.scene
      );
      const particlesSnow = ParticleHelper.ParseFromSnippetAsync(
        "Q6PY99#1",
        this.scene
      );

      particles.push(particlesFire);
      particles.push(particlesSnow);

      console.log(camera.beta);

      Promise.all(particles).then((result) => {
        resolve({ scene: this.scene, camera });
      });

      // var particlesClouds = await ParticleHelper.ParseFromSnippetAsync("Y0GNAU", scene);
    });
  }
}

// create the canvas html element and attach it to the webpage
var canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.id = "gameCanvas";
document.body.appendChild(canvas);

// initialize babylon engine and scene
var engine = new Engine(canvas, true);
var scene = new Scene(engine);

const app = new App(scene);

app.Ready.then(({ scene: _scene, camera }) => {
  engine.runRenderLoop(function () {
    _scene.render();
    // camera.beta = camera.beta;
  });
});
