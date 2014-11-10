// HUBCAVE
// window.onbeforeunload = function (e) {
//   return "Quit game?";
// };

// create an new instance of a pixi stage
var stage = new PIXI.Stage(0x000000);
    graphics = new PIXI.Graphics();

var render_size = Math.min(window.innerWidth - 50,
                           window.innerHeight - 150);

// create a renderer instance.
var renderer = PIXI.autoDetectRenderer(render_size,
                                       render_size);

// This needs to be loaded dynamically for the user
var maze = [[0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0],
            [0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
            [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0],
            [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
            [0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0],
            [0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
            [0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]]
// var maze = [[0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//             [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0],
//             [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
//             [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
//             [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
//             [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
//             [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
//             [0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0],
//             [0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0],
//             [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
//             [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]]

var wallTexture = PIXI.Texture.fromImage("/static/img/wall.png");

// PIXI.Texture.addTextureToCache(wallTexture, 'walltex');
var blocksize = render_size / maze.length;

renderer.view.className = "rendererView";
document.body.appendChild(renderer.view);

// setInterval(animate, 30);

var scrollArea = new PIXI.DisplayObjectContainer();

scrollArea.scale.x = maze.length/5;
scrollArea.scale.y = maze.length/5;

// Draw the maze
var i, j;
for (i=0; i < maze.length; ++i) {
    row = maze[i];
    for (j=0; j < row.length; ++j){
        if (!row[j]){
            wall_sprite = new PIXI.Sprite(wallTexture);
            wall_sprite.width = blocksize;
            wall_sprite.height = blocksize;
            wall_sprite.position.x = i * blocksize;
            wall_sprite.position.y = j * blocksize;
            scrollArea.addChild(wall_sprite);
        }
    }
}

stage.addChild(scrollArea);

var movespeed = 10;

requestAnimFrame( animate );

function handle_input() {
    if (kd.LEFT.isDown()) {
        scrollArea.position.x += movespeed;
    }
    else if (kd.RIGHT.isDown()) {
        scrollArea.position.x -= movespeed;
    }
    else if (kd.UP.isDown()) {
        scrollArea.position.y += movespeed;
    }
    else if (kd.DOWN.isDown()) {
        scrollArea.position.y -= movespeed;
    }
}

function animate() {
    handle_input();
    requestAnimFrame( animate );
    renderer.render(stage);
}
