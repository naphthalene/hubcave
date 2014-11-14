// HUBCAVE
// window.onbeforeunload = function (e) {
//   return "Quit game?";
// };

socket = io.connect("/game", {
                        transports: ['websocket',
                                     'flashsocket',
                                     'polling']
                    });
socket.on('connect', function () {
              socket.emit('join', [game_id, user_id]);
          });

socket.on('loading', function (data) {
              hubcave_data = data;
              // show_loading_screen
              run_game();
          });

function run_game() {
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

    scrollArea = new PIXI.DisplayObjectContainer();
    scrollArea.interactive = true;

    var max_width = 0,
    max_height = 0;
    var terrain = {};
    projectiles = {};

    for (i=0; i < hubcave_data.blockdata.length; ++i) {
        var block = hubcave_data.blockdata[i];
        terrain[block.x] = terrain[block.x] ? terrain[block.x] : {};
        terrain[block.x][block.y] = block.blktype;
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

    user_sprites = {};

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

    var nick = new PIXI.Text(user_name,
                             {
                                 font: 'bold 12px Arial'
                             });
    player_sprite.addChild(nick);

    enemies = [];

    scrollArea.addChild(player_sprite);

    // vignette_sprite = new PIXI.Sprite(vignetteTexture);
    // vignette_position = function(){
    //     vignette_sprite.position.x = player_sprite.position.x -
    //         vignette_sprite.width / 2 +
    //         player_sprite.width / 2;
    //     vignette_sprite.position.y = player_sprite.position.y -
    //         vignette_sprite.height / 2 +
    //         player_sprite.height / 2;
    // };
    // vignette_position();
    // scrollArea.addChild(vignette_sprite);

    stage.addChild(scrollArea);

    movespeed = blocksize / 20;
    shootspeed = blocksize / 20;
    rotatespeed = Math.PI / 100;
    edge_buffer = render_size / 3;

    scrollArea.position.x = -(player_sprite.position.x * scrollArea.scale.x);
    scrollArea.position.y = -(player_sprite.position.y * scrollArea.scale.y);

    // Update world on state event
    socket.on('pstate', function (data) {
                  
                  var user_sprite = null;
                  if (user_sprites[data.data.id]) {
                      user_sprite = user_sprites[data.data.id];
                      user_sprite.position.x = data.data.x;
                      user_sprite.position.y = data.data.y;
                      user_sprite.rotation = data.data.rot;
                  } else {
                      user_sprite = new PIXI.Sprite(charTexture);
                      user_sprite.width = blocksize / 2;
                      user_sprite.height = blocksize / 2;
                      user_sprite.pivot.x = user_sprite.width;
                      user_sprite.pivot.y = player_sprite.height;
                      user_sprite.position.x = data.data.x;
                      user_sprite.position.y = data.data.y;
                      user_sprite.rotation = data.data.rot;
                      
                      var nick = new PIXI.Text(data.data.user_name,
                                               {
                                                   font: 'bold 12px Arial'
                                               });
                      user_sprite.addChild(nick);

                      console.log("Adding new sprite for user " + data.data.id);
                      user_sprites[data.data.id] = user_sprite;
                      // scrollArea.removeChild(vignette_sprite);
                      scrollArea.addChild(user_sprite);
                      // scrollArea.addChildAt(vignette_sprite,
                      //                       scrollArea.children.length - 1);
                  }
              });

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
            // Move it left
            scrollArea.position.x += (-scrollArea.x) -
                (player_sprite.x * scrollArea.scale.x - edge_buffer);
        }
        if (player_sprite.y * scrollArea.scale.y + edge_buffer >
            -scrollArea.y + render_size) {
            // Move it down
            scrollArea.position.y += (-scrollArea.y + render_size) -
                (player_sprite.y * scrollArea.scale.y + edge_buffer);
        } else if (player_sprite.y * scrollArea.scale.y - edge_buffer <
                   -scrollArea.y){
            // Move it up
            scrollArea.position.y += (-scrollArea.y) -
                (player_sprite.y * scrollArea.scale.y - edge_buffer);
        }
    }

    scrollArea.mousemove = function(idata) {
        var dist_x = idata.originalEvent.layerX -
            (player_sprite.getBounds().x + player_sprite.getBounds().width / 2);
        var dist_y = idata.originalEvent.layerY -
            (player_sprite.getBounds().y + player_sprite.getBounds().height / 2);
        player_sprite.rotation = Math.atan2(-dist_x, dist_y);
        // emit_player_data();
    };

    function shootProjectile(user, position, rotation) {
        var p = new PIXI.Sprite(projectileTexture);
        p.position.x = position.x;
        p.position.y = position.y;
        p.rotation = rotation;
        p.scale.x = 12 / blocksize;
        p.scale.y = 12 / blocksize;
        p.lifedist = blocksize * 5;
        p.distanceTraveled = 0;
        if (!projectiles[user]) { projectiles[user] = []; }; 
        projectiles[user].push(p);
        scrollArea.addChild(p);
    };    
    
    socket.on('projectile', function (data) {
                  // A projectile has been fired, keep track of its location locally
                  shootProjectile(data.data.user, 
                                  new PIXI.Point(data.data.start_x,
                                                 data.data.start_y),
                                  data.data.start_rot);
              });

    scrollArea.mousedown = function(idata) {
        var p = new PIXI.Sprite(projectileTexture);
        shootProjectile(user_id, player_sprite.position, player_sprite.rotation);
        emit_projectile_data();
    };


    requestAnimFrame( animate );

    function colliding_with_map(sprite){
        var right_block = Math.floor((sprite.x + sprite.pivot.x / 2) / blocksize);
        var left_block = Math.max(Math.floor((sprite.x - sprite.pivot.x / 2) / blocksize), 0);
        var below_block = Math.floor((sprite.y + sprite.pivot.x / 2) / blocksize);
        var above_block = Math.max(Math.floor((sprite.y - sprite.pivot.x / 2) / blocksize), 0);

        return (above_block < 0 | left_block < 0 |
                below_block >= max_width |
                right_block >= max_width) ||
            !(terrain[below_block][right_block] &
              terrain[below_block][left_block] &
              terrain[above_block][right_block] &
              terrain[above_block][left_block]);
    }

    function is_intersecting(r1, r2) {
        return !(r2.x > (r1.x + r1.width)  || 
                 (r2.x + r2.width ) < r1.x || 
                 r2.y > (r1.y + r1.height) ||
                 (r2.y + r2.height) < r1.y);

    }

    function emit_player_data() {
        socket.emit('player', {
                        data : {
                            id: user_id,
                            user_name: user_name,
                            x : player_sprite.position.x,
                            y : player_sprite.position.y,
                            rot : player_sprite.rotation
                        }
                    });
    }

    function emit_projectile_data() {
        socket.emit('projectile', {
                        data : {
                            user: user_id,
                            start_x : player_sprite.position.x,
                            start_y : player_sprite.position.y,
                            start_rot : player_sprite.rotation
                        }
                    });
    }

    function handle_input() {
        var original_position = {
            x: player_sprite.x,
            y: player_sprite.y
        };
        var do_emit = true;
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
        else {
            do_emit = false;
        }

        if (colliding_with_map(player_sprite)) {
            player_sprite.position.x = original_position.x;
            player_sprite.position.y = original_position.y;
        }
        // vignette_position();
        update_scroll();
        if (do_emit) {
            emit_player_data();
        }
    }

    

    function update_projectiles() {
        // See if you can refactor, this might get really slow
        for (var user in projectiles) {
            for (var i = 0; i < projectiles[user].length; ++i){
                projectiles[user][i].position.x -= shootspeed * Math.sin(projectiles[user][i].rotation);
                projectiles[user][i].position.y += shootspeed * Math.cos(projectiles[user][i].rotation);
                projectiles[user][i].distanceTraveled += shootspeed;
                var hit_user = false;
                for (var user_sprite in user_sprites){
                    var s = user_sprites[user_sprite];
                    if (user != user_sprite && 
                        is_intersecting(s, projectiles[user][i])){
                        hit_user = true;
                        // TODO Update hp here
                    }
                }
                if (user != user_id && 
                    is_intersecting(projectiles[user][i], player_sprite)){
                    hit_user = true;
                    console.log("You got hit");
                    // TODO Update hp here
                }
                if (projectiles[user][i].distanceTraveled > projectiles[user][i].lifedist
                    || colliding_with_map(projectiles[user][i])
                    || hit_user){
                    scrollArea.removeChild(projectiles[user][i]);
                    projectiles[user].splice(i, 1);
                }
            }
        }
    }

    function animate() {
        handle_input();
        update_projectiles();
        requestAnimFrame( animate );
        renderer.render(stage);
    }
}
