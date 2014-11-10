// HUBCAVE
window.onbeforeunload = function (e) {
  return "Quit game?";
};

var viewWidth =  1024
var viewHeight = 1024

// create an new instance of a pixi stage
var stage = new PIXI.Stage(0x66FF99);

// create a renderer instance.
var renderer = PIXI.autoDetectRenderer(viewWidth, viewHeight);
renderer.view.className = "rendererView";
document.body.appendChild(renderer.view);

setInterval(animate, 100);

requestAnimFrame( animate );

function animate() {

    requestAnimFrame( animate );

    renderer.render(stage);
}
