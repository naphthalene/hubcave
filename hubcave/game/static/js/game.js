// HUBCAVE
window.onbeforeunload = function (e) {
  return "Quit game?";
};

// create an new instance of a pixi stage
var stage = new PIXI.Stage(0x66FF99);
    graphics = new PIXI.Graphics();

// create a renderer instance.
var renderer = PIXI.autoDetectRenderer(window.innerWidth - 10,
                                       window.innerHeight - 100);


var maze =


renderer.view.className = "rendererView";
document.body.appendChild(renderer.view);

setInterval(animate, 100);

graphics.beginFill(0xFFFFFF);


requestAnimFrame( animate );

function animate() {
  // add it the stage so we see it on our screens..
  stage.addChild(graphics);

  requestAnimFrame( animate );

  renderer.render(stage);
}
