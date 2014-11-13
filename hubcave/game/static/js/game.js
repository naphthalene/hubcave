// HUBCAVE
// window.onbeforeunload = function (e) {
//   return "Quit game?";
// };

// create an new instance of a pixi stage
var stage = new PIXI.Stage(0x000000);
    graphics = new PIXI.Graphics();

var render_size = Math.min(window.innerWidth - 50,
                           window.innerHeight - 150);


var renderer = PIXI.autoDetectRenderer(render_size,
                                       render_size);


var wallTexture = PIXI.Texture.fromImage("/static/img/wall.png");
var floorTexture = PIXI.Texture.fromImage("/static/img/floortile.png");
var projectileTexture = PIXI.Texture.fromImage("/static/img/arrow.png");
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
scrollArea.interactive = true;

var max_width = 0,
    max_height = 0;
var maze = {};
var projectiles = [];

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
}

scrollArea.scale.x = render_size / blocksize / 5;
scrollArea.scale.y = scrollArea.scale.x;

player_sprite = new PIXI.Sprite(charTexture);
player_sprite.width = blocksize / 2;
player_sprite.height = blocksize / 2;
if(typeof hubcave_data.starting_x === 'undefined' ||
   typeof hubcave_data.starting_y === 'undefined') {
    player_sprite.position.y = player_sprite.height / 2;
    player_sprite.position.x = blocksize + player_sprite.width / 2;
} else {
    player_sprite.position.y = parseInt(hubcave_data.starting_x * blocksize +
                                        player_sprite.width / 2);
    player_sprite.position.x = parseInt(hubcave_data.starting_y * blocksize +
                                        player_sprite.height / 2);
}

player_sprite.pivot.x = player_sprite.width;
player_sprite.pivot.y = player_sprite.height;

scrollArea.addChild(player_sprite);

vignette_sprite = new PIXI.Sprite(vignetteTexture);
vignette_position = function(){
    vignette_sprite.position.x = player_sprite.position.x -
        vignette_sprite.width / 2 +
        player_sprite.width / 2;
    vignette_sprite.position.y = player_sprite.position.y -
        vignette_sprite.height / 2 +
        player_sprite.height / 2;
};
vignette_position();
scrollArea.addChild(vignette_sprite);

stage.addChild(scrollArea);

movespeed = blocksize / 20;
shootspeed = blocksize / 20;
rotatespeed = Math.PI / 100;
edge_buffer = render_size / 3;

scrollArea.position.x = -(player_sprite.position.x * scrollArea.scale.x);
scrollArea.position.y = -(player_sprite.position.y * scrollArea.scale.y);

function update_scroll() {
    // Adjust the viewport if character is past buffer minimum
    if (player_sprite.x * scrollArea.scale.x + edge_buffer >
        -scrollArea.x + render_size)
    {
        // Move the viewport to the right
        scrollArea.position.x += (-scrollArea.x + render_size) -
            (player_sprite.x * scrollArea.scale.x + edge_buffer);
    } else if (player_sprite.x * scrollArea.scale.x - edge_buffer <
               -scrollArea.x){
        // Move it to the left
        scrollArea.position.x += (-scrollArea.x) -
            (player_sprite.x * scrollArea.scale.x - edge_buffer);
    }
    if (player_sprite.y * scrollArea.scale.y + edge_buffer >
        -scrollArea.y + render_size) {
        // Move the viewport to the down
        scrollArea.position.y += (-scrollArea.y + render_size) -
            (player_sprite.y * scrollArea.scale.y + edge_buffer);
    } else if (player_sprite.y * scrollArea.scale.y - edge_buffer <
               -scrollArea.y){
        // Move it up
        scrollArea.position.y += (-scrollArea.y) -
            (player_sprite.y * scrollArea.scale.y - edge_buffer);
    }
}

// console.log(player_sprite.getBounds().x * scrollArea.scale.x +
//             player_sprite.getBounds().width + edge_buffer,
//             render_size - scrollArea.position.x);
// console.log(player_sprite.getBounds().x * scrollArea.scale.x - edge_buffer,
//             (-scrollArea.position.x));

scrollArea.mousemove = function(idata) {
    var dist_x = idata.originalEvent.layerX -
        (player_sprite.getBounds().x + player_sprite.getBounds().width / 2);
    var dist_y = idata.originalEvent.layerY -
        (player_sprite.getBounds().y + player_sprite.getBounds().height / 2);
    player_sprite.rotation = Math.atan2(-dist_x, dist_y);
    // player_sprite.getBounds().y + player_sprite.getBounds().height / 2,
    // idata.originalEvent.layerX,
    // idata.originalEvent.layerY;
};
scrollArea.mousedown = function(idata) {
    var p = new PIXI.Sprite(projectileTexture);
    p.position.x = player_sprite.position.x;
    p.position.y = player_sprite.position.y;
    p.rotation = player_sprite.rotation;
    p.scale.x = 12 / blocksize;
    p.scale.y = 12 / blocksize;
    p.lifedist = blocksize * 5;
    p.distanceTraveled = 0;
    projectiles.push(p);
    scrollArea.addChild(p);
};


requestAnimFrame( animate );

function colliding_with_maze(sprite){
    var right_block = Math.floor((sprite.x + sprite.pivot.x / 2) / blocksize);
    var left_block = Math.max(Math.floor((sprite.x - sprite.pivot.x / 2) / blocksize), 0);
    var below_block = Math.floor((sprite.y + sprite.pivot.x / 2) / blocksize);
    var above_block = Math.max(Math.floor((sprite.y - sprite.pivot.x / 2) / blocksize), 0);

    return (above_block < 0 | left_block < 0 |
            below_block >= max_width |
            right_block >= max_width) ||
        !(maze[below_block][right_block] &
          maze[below_block][left_block] &
          maze[above_block][right_block] &
          maze[above_block][left_block]);
}

function handle_input() {
    var original_position = {
        x: player_sprite.x,
        y: player_sprite.y
    };
    if (kd.A.isDown()) {
        player_sprite.position.x -= movespeed;
    }
    else if (kd.D.isDown()) {
        player_sprite.position.x += movespeed;
    }
    else if (kd.W.isDown()) {
        player_sprite.position.y -= movespeed;
    }
    else if (kd.S.isDown()) {
        player_sprite.position.y += movespeed;
    }

    if (colliding_with_maze(player_sprite)) {
        player_sprite.position.x = original_position.x;
        player_sprite.position.y = original_position.y;
    }
    vignette_position();
    update_scroll();
}

function update_projectiles() {
    for (i=0; i < projectiles.length; ++i) {
        var p = projectiles[i];
        p.position.x -= shootspeed * Math.sin(p.rotation);
        p.position.y += shootspeed * Math.cos(p.rotation);
        // console.log(p.position.x, p.position.y);
        p.distanceTraveled += shootspeed;
        if (p.distanceTraveled > p.lifedist || colliding_with_maze(p)){
            projectiles.splice(i, 1);
            scrollArea.removeChild(p);
        }
    }
}

function animate() {
    handle_input();
    update_projectiles();
    requestAnimFrame( animate );
    renderer.render(stage);
}
