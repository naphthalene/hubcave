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


var wallTexture = PIXI.Texture.fromImage("/static/img/wall.png");
var floorTexture = PIXI.Texture.fromImage("/static/img/floortile.png");
var charTexture = PIXI.Texture.fromImage("/static/img/ghlogo.png");
var vignetteTexture = PIXI.Texture.fromImage("/static/img/vignette.png");

for (i=0; i < hubcave_data.blockdata.length; ++i) {
    var block = hubcave_data.blockdata[i];
}

// PIXI.Texture.addTextureToCache(wallTexture, 'walltex');
var blocksize = 50;

renderer.view.className = "rendererView";
document.body.appendChild(renderer.view);

//
// Build out the map sprites according to blockdata
//

var scrollArea = new PIXI.DisplayObjectContainer();

var max_width = 0,
    max_height = 0;
var maze = {};

for (i=0; i < hubcave_data.blockdata.length; ++i) {
    var block = hubcave_data.blockdata[i];
    maze[block.x] = maze[block.x] ? maze[block.x] : {};
    maze[block.x][block.y] = block.blktype;
    if (!block.blktype) {
        wall_sprite = new PIXI.Sprite(wallTexture);
        wall_sprite.width = blocksize;
        wall_sprite.height = blocksize;
        wall_sprite.position.y = block.x * blocksize;
        wall_sprite.position.x = block.y * blocksize;
        scrollArea.addChild(wall_sprite);
    } else {
        floor_sprite = new PIXI.Sprite(floorTexture);
        floor_sprite.width = blocksize;
        floor_sprite.height = blocksize;
        floor_sprite.position.y = block.x * blocksize;
        floor_sprite.position.x = block.y * blocksize;
        scrollArea.addChild(floor_sprite);
    }
    max_width = Math.max(max_width, block.x);
    max_height = Math.max(max_height, block.y);
    console.log(max_width, max_height);
}

scrollArea.scale.x = render_size / blocksize / 5;
scrollArea.scale.y = scrollArea.scale.x;

player_sprite = new PIXI.Sprite(charTexture);
player_sprite.width = blocksize / 2;
player_sprite.height = blocksize / 2;
player_sprite.position.y = player_sprite.height / 2;
player_sprite.position.x = blocksize + player_sprite.width / 2;
scrollArea.addChild(player_sprite);

vignette_sprite = new PIXI.Sprite(vignetteTexture);
vignette_position = function(){
    vignette_sprite.position.x = player_sprite.position.x -
        vignette_sprite.width / 2 +
        player_sprite.width / 2;
    vignette_sprite.position.y = player_sprite.position.y -
        vignette_sprite.height / 2 +
        player_sprite.height / 2;
}
vignette_position();
scrollArea.addChild(vignette_sprite);

stage.addChild(scrollArea);

movespeed = blocksize / 20;
edge_buffer = 100;

requestAnimFrame( animate );

function handle_input() {
    function update_scroll() {
        // Adjust the viewport if character is past buffer minimum
        if (scrollArea.x <= 0 &
            render_size - scrollArea.x < scrollArea.width) {
            if (player_sprite.getBounds().x * scrollArea.scale.x +
                player_sprite.getBounds().width + edge_buffer >
                render_size - scrollArea.position.x)
            {
                // Move the viewport to the right
                scrollArea.position.x -= (player_sprite.getBounds().x * scrollArea.scale.x +
                                          player_sprite.getBounds().width + edge_buffer) -
                    (render_size - scrollArea.position.x);
            } else if (player_sprite.getBounds().x * scrollArea.scale.x - edge_buffer < 
                       (-scrollArea.position.x)){
                // Move it to the left
                scrollArea.position.x += (-scrollArea.position.x) -
                    (player_sprite.getBounds().x * scrollArea.scale.x - edge_buffer);
            }
            if (player_sprite.getBounds().y * scrollArea.scale.y +
                player_sprite.getBounds().height + edge_buffer >
                render_size - scrollArea.position.y) {
                // Move the viewport to the down
                scrollArea.position.y -= (player_sprite.getBounds().y * scrollArea.scale.y +
                                          player_sprite.getBounds().height + edge_buffer) -
                    (render_size - scrollArea.position.y);
            } else if (player_sprite.getBounds().y * scrollArea.scale.y - edge_buffer < 
                       (-scrollArea.position.y)){
                // Move it to the left
                scrollArea.position.y += (-scrollArea.position.y) -
                    (player_sprite.getBounds().y * scrollArea.scale.y - edge_buffer);
            }
        }
    }
    var original_position = {
        x: player_sprite.x,
        y: player_sprite.y
    };
    if (kd.LEFT.isDown()) {
        player_sprite.position.x -= movespeed;
    }
    else if (kd.RIGHT.isDown()) {
        player_sprite.position.x += movespeed;
    }
    else if (kd.UP.isDown()) {
        player_sprite.position.y -= movespeed;
    }
    else if (kd.DOWN.isDown()) {
        player_sprite.position.y += movespeed;
    }
    var right_block = Math.floor((player_sprite.x + player_sprite.width) / blocksize);
    var left_block = Math.max(Math.floor(player_sprite.x / blocksize), 0);
    var below_block = Math.floor((player_sprite.y + player_sprite.height) / blocksize);
    var above_block = Math.floor(player_sprite.y / blocksize);

    if ((above_block < 0 | left_block < 0 |
         below_block >= max_width |
         right_block >= max_width) ||
        !(maze[below_block][right_block] &
          maze[below_block][left_block] &
          maze[above_block][right_block] &
          maze[above_block][left_block])){
        player_sprite.position.x = original_position.x;
        player_sprite.position.y = original_position.y;
    }
    vignette_position();
    update_scroll();
}

function animate() {
    handle_input();
    requestAnimFrame( animate );
    renderer.render(stage);
}
