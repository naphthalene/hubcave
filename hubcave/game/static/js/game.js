// HUBCAVE
// window.onbeforeunload = function (e) {
//   return "Quit game?";
// };

// Disable the chat window initially
$('#chat_input').width($('.chat-panel').width() - 50);

socket = io.connect("/game", {
                        transports: ['websocket',
                                     'flashsocket',
                                     'polling']
                    });
socket.on('connect', function () {
              socket.emit('join', [game_id, user_id]);
          });

socket.on('loading', function (data) {
              hubcave_data = data.map;
              for (var i = data.messages.length - 1; i >= 0; --i){
                  var msg = data.messages[i];
                  $("#room_chat ul").prepend(
                      '<li>[' + msg.when + '] ' +
                          '<a href=/profile/' + msg.user_id + '>' +
                          msg.user_name + ' </a><span> ' +
                          msg.text + ' </span>' +
                          '</li>');
              }
              run_game();
          });

// Let us kick off the show

function run_game() {
    // create an new instance of a pixi stage
    var stage = new PIXI.Stage(0x000000);

    var render_size = Math.min($('#game_panel').width() - 50,
                               $('#game_panel').width());

    var renderer = PIXI.autoDetectRenderer(render_size,
                                           render_size);

    // Define textures
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
    $('.canvas-panel').append(renderer.view);

    //
    // Build out the map sprites according to blockdata
    //

    scrollArea = new PIXI.DisplayObjectContainer();
    scrollArea.interactive = true;
    scrollArea.buttonMode = true;
    scrollArea.defaultCursor = "crosshair";

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

    users = {};

    // Bow is default item at '1'
    // Items/keys -> map 2-0 keys to select
    // HP/ammo

    // DECLARE PLAYER OBJECT

    player_sprite = new PIXI.Sprite(charTexture);
    player_sprite.velocity_x = 0
    player_sprite.velocity_y = 0
    player_sprite.width = blocksize / 2;
    player_sprite.height = blocksize / 2;
    function reset_player() {
        if(typeof hubcave_data.starting_x === 'undefined' ||
           typeof hubcave_data.starting_y === 'undefined') {
            player_sprite.position.y = player_sprite.height;
            player_sprite.position.x = blocksize + player_sprite.width;
        } else {
            player_sprite.position.y = parseInt(hubcave_data.starting_x * blocksize +
                                                player_sprite.width);
            player_sprite.position.x = parseInt(hubcave_data.starting_y * blocksize +
                                                player_sprite.height);
        }
        player_hp = 100;
        player_ammo = 500;
        player_items = {};
    }; reset_player();

    player_sprite.pivot.x = player_sprite.width;
    player_sprite.pivot.y = player_sprite.height;

    var nick = new PIXI.Text(user_name,
                             {
                                 font: 'bold 12px Arial'
                             });
    player_sprite.addChild(nick);

    enemies = [];

    scrollArea.addChild(player_sprite);

    stage.addChild(scrollArea);

    // Define our items
    // Location is 2D vector
    function Item (type, location) {
        this.type = type;
        this.sprite.location = location;
        this.sprite.pivot.x = this.sprite.width;
        this.sprite.pivot.y = this.sprite.height;
        // Add a random rotation, why not
        this.sprite.rotation = Math.random() * Math.pi * 2;
        // Inheriting classes can override this anyway
    }

    function Item__Gold(location, opts){
        Item.apply(this, 'item__gold', location);
    }
    Item__Gold.prototype.sprite = PIXI.Texture.fromImage("/static/img/items/gold.png");

    function Item__Arrow(location, opts){
        Item.apply(this, 'item__arrow', location);
    }
    Item__Arrow.prototype.sprite = projectileTexture;

    // Add ui overlay
    ui_show = true;

    ui = new PIXI.DisplayObjectContainer();
    ui.position.x = 0;
    ui.position.y = 0;
    ui.width = render_size;
    ui.height = blocksize;
    ui.interactive = true;
    ui.buttonMode = true;
    stage.addChild(ui);

    inventory = new PIXI.Graphics();
    // inventory.x = 5;
    // inventory.y = 5;
    // inventory.width = render_size - 5;
    // inventory.height = 40;

    ui.addChild(inventory);

    inventory.beginFill(0xFFFFFF, 0.3);
    inventory.drawRect(5,5, render_size - 10, 40);
    inventory.endFill();

    hitpoints_counter = new PIXI.Text("HP: " + player_hp.toString(),
                                      { fill: 'white' });
    hitpoints_counter.x = 15;
    hitpoints_counter.y = 15;

    ui.addChild(hitpoints_counter);

    ammo_counter = new PIXI.Text("Ammo: " + player_ammo.toString(),
                                      { fill: 'white' });
    ammo_counter.x = 30 + hitpoints_counter.width;
    ammo_counter.y = 15;

    ui.addChild(ammo_counter);

    ui.mousedown = function(idata) {
        console.log(idata.originalEvent.layerX, idata.originalEvent.layerY);
    };

    // var ui_panel = new PIXI.DisplayObjectContainer();
    // ui_panel.position.x = 15;
    // ui_panel.position.y = 15;
    // ui_panel.width = render_size - 15;
    // ui_panel.height = blocksize - 15;
    // ui_panel.interactive = true;
    // ui_panel.alpha = 0.5;

    // ui_panel.buttonMode = true;
    // ui.addChild(ui_panel);

    // hitpoints_counter = new PIXI.Text("HP: " + player_hp.toString(),
    //                                   { fill: 'white' });

    // ui_panel.addChild(hitpoints_counter);
    // stage.addChild(ui);

    function update_ui(){
        if (ui_show){
            // ui.removeChild(hitpoints_counter);
            hitpoints_counter.setText("HP: " + player_hp.toString());
            ammo_counter.setText("Ammo: " + player_ammo.toString());
            // ui.addChild(hitpoints_counter);
        }
    }

    update_ui();

    movespeed = blocksize / 20;
    var max_abs_velocity = movespeed;
    var player_friction_coefficient = 0.95;
    var player_acceleration = 1;
    shootspeed = blocksize / 10;
    rotatespeed = Math.PI / 50;
    edge_buffer = render_size / 3;

    scrollArea.position.x = -(player_sprite.position.x * scrollArea.scale.x);
    scrollArea.position.y = -(player_sprite.position.y * scrollArea.scale.y);

    function update_active_users() {
        var active_users_panel = $("#active_users ul");
        active_users_panel.empty();
        for (var id in users) {
            var uname = users[id].username;
            active_users_panel.append(
                '<li><a href=/profile/' + id + '>' +
                    uname + ' </a></li>');
        }
        active_users_panel.append(
            '<li><a href=/profile/' + user_id + '>' +
                user_name + ' </a></li>');
    } update_active_users();

    // Update world on state event
    socket.on('pstate', function (data) {
                  var user_sprite = null;
                  if (users[data.data.id]) {
                      user_sprite = users[data.data.id].sprite;
                      user_sprite.position.x = data.data.x;
                      user_sprite.position.y = data.data.y;
                      user_sprite.rotation = data.data.rot;
                  } else {
                      // New sprite must be drawn
                      user_sprite = new PIXI.Sprite(charTexture);
                      user_sprite.width = blocksize / 2;
                      user_sprite.height = blocksize / 2;
                      user_sprite.pivot.x = user_sprite.width;
                      user_sprite.pivot.y = user_sprite.height;
                      user_sprite.position.x = data.data.x;
                      user_sprite.position.y = data.data.y;
                      user_sprite.rotation = data.data.rot;

                      var nick = new PIXI.Text(data.data.user_name,
                                               {
                                                   font: 'bold 12px Arial'
                                               });
                      user_sprite.addChild(nick);

                      console.log("Adding new sprite for " + data.data.user_name);
                      users[data.data.id] = {
                          username: data.data.user_name,
                          sprite: user_sprite
                      };
                      scrollArea.addChild(user_sprite);
                      update_active_users();
                  }
              });

    function chat_time_format() {
        var d = new Date();
        var hr = d.getHours();
        var min = d.getMinutes();
        if (min < 10) {
            min = "0" + min;
        }
        if (hr < 12) {
            var ampm = " a.m.";
        } else {
            var ampm = " p.m.";
            hr -= 12;
        }
        return "[" + hr + ":" + min + ampm + "] ";
    }

    socket.on('joining', function (data) {
                  $("#room_chat ul").prepend(
                      '<li style="color: #00FF00;">' + chat_time_format() +
                          '<a href=/profile/' + data.data.user_id + '>' +
                          data.data.user_name + ' </a>Joined!</li>');
                  emit_player_data();
              });

    socket.on('leaving', function (data) {
                  $("#room_chat ul").prepend(
                      '<li style="color: #FF0000;">' + chat_time_format() +
                          '<a href=/profile/' + data.user + '>' +
                          data.username + ' </a>Quit</li>');
                  scrollArea.removeChild(users[data.user].sprite);
                  delete users[data.user];
                  update_active_users();
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

    emit_player_data();

    scrollArea.mousemove = function(idata) {
        player_sprite.mouse_x = idata.originalEvent.layerX
        player_sprite.mouse_y = idata.originalEvent.layerY
    };

    function update_player_sprite_rotation(sprite) {
        var dist_x = player_sprite.mouse_x -
            (sprite.getBounds().x + sprite.getBounds().width / 2);
        var dist_y = player_sprite.mouse_y -
            (sprite.getBounds().y + sprite.getBounds().height / 2);

        sprite.rotation = Math.atan2(-dist_x, dist_y);
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

    socket.on('msg', function (data) {
                  // Received message from someone
                  $("#room_chat ul").prepend(
                      '<li>[' + data.when + '] ' +
                          '<a href=/profile/' + data.user_id + '>' +
                          data.user_name + ' </a><span> ' +
                          data.text + ' </span>' +
                          '</li>');
                  console.log(data.text);
              });

    socket.on('projectile', function (data) {
                  // A projectile has been fired, keep track of its location locally
                  shootProjectile(data.data.user,
                                  new PIXI.Point(data.data.start_x,
                                                 data.data.start_y),
                                  data.data.start_rot);
              });

    scrollArea.mousedown = function(idata) {
        if (player_ammo > 0) {
            var p = new PIXI.Sprite(projectileTexture);
            shootProjectile(user_id, player_sprite.position, player_sprite.rotation);
            emit_projectile_data();
            player_ammo -= 1;
        }
    };

    requestAnimFrame( animate );

    function colliding_with_map(sprite){
        var right_block = Math.floor((sprite.x + sprite.pivot.x / 2) / blocksize);
        var left_block = Math.max(Math.floor((sprite.x - sprite.pivot.x / 2) / blocksize), 0);
        var below_block = Math.floor((sprite.y + sprite.pivot.x / 2) / blocksize);
        var above_block = Math.max(Math.floor((sprite.y - sprite.pivot.x / 2) / blocksize), 0);


        return (above_block < 0 || left_block < 0 ||
                below_block >= max_width ||
                right_block >= max_width) ||
            !(terrain[below_block][right_block] &&
              terrain[below_block][left_block] &&
              terrain[above_block][right_block] &&
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

    var typing = false;

    $('#chat_input').focus(
        function() {
            console.log("Focused by mouse");
            typing = true;
        });

    $('#chat_input').onblur = function() {
        typing = false;
        $('.rendererView').focus();
    };

    kd.T.up(function() {
                var chat_input = $('#chat_input');
                if (!typing) {
                    $('#chat_input').width($('.chat-panel').width() - 50);
                    typing = true;
                    chat_input.focus();
                }
            });

    kd.SPACE.up(function() {
                      if (!typing && player_ammo > 0) {
                          var p = new PIXI.Sprite(projectileTexture);
                          shootProjectile(user_id, player_sprite.position, player_sprite.rotation);
                          emit_projectile_data();
                          player_ammo -= 1;
                      }
                  });

    kd.ESC.up(function() {
                  var chat_input = $('#chat_input');
                  if (typing) {
                      $('#chat_input').width($('.chat-panel').width() - 50);
                      typing = false;
                      $('#chat_input').blur();
                      $('.rendererView').focus();
                  }
              });

    kd.ENTER.up(function() {
                    var chat_input = $('#chat_input'),
                        chat_msg = chat_input.val();
                    // Escape any html inside the message
                    chat_msg = chat_msg.replace(/</g, '&lt;').replace(/>/g, '&gt;');

                    if (typing && chat_msg != "") {
                        console.log(user_name, " is submitting ", chat_msg);
                        socket.emit('msg', {
                                        user_id: user_id,
                                        user_name: user_name,
                                        text: chat_msg
                                    });
                        $("#room_chat ul").prepend(
                            '<li>' + chat_time_format() +
                                '<a href=/profile/' + user_id + '>' +
                                user_name + ' </a><span> ' +
                                chat_msg +
                                '</li>');
                        chat_input.val("");
                        $('#chat_input').width($('.chat-panel').width() - 50);
                        $('#chat_input').blur();
                        typing = false;
                        $('.rendererView').focus();
                    }
            });

    // adds velocity to player sprite for x or y within max_abs_velocity bounds
    function add_player_velocity(velo_delta, direction) {
      if (direction == 'x') {
        if (Math.abs(player_sprite.velocity_x) <= max_abs_velocity) {
          player_sprite.velocity_x += (velo_delta * player_acceleration);
        }
      } else if (direction == 'y') {
        if (Math.abs(player_sprite.velocity_y) <= max_abs_velocity) {
          player_sprite.velocity_y += (velo_delta * player_acceleration);
        }
      }
    }

    function handle_input() {
        if (!typing) {
            var do_emit = true;
            if (!typing){

                // Keyboard rotation handling
                if (kd.RIGHT.isDown()) {
                    player_sprite.rotation += rotatespeed;
                }
                else if (kd.LEFT.isDown()) {
                    player_sprite.rotation -= rotatespeed;
                }

                // handle lateral motion
                if (kd.A.isDown() && !kd.D.isDown()) {
                    add_player_velocity(-1,'x');
                }
                else if (kd.D.isDown() && !kd.A.isDown()) {
                    add_player_velocity(1,'x');
                }

                // handle verticle motion
                if (kd.W.isDown() && !kd.S.isDown()) {
                    add_player_velocity(-1,'y');
                }
                else if (kd.S.isDown() && !kd.W.isDown()) {
                    add_player_velocity(1,'y');
                }

            } else {
                do_emit = false;
            }

                        // vignette_position();
            update_scroll();
            if (do_emit) {
                emit_player_data();
            }
        }
    }

    function update_player_physics () {
      do_emit = false;
      var original_position = {
          x: player_sprite.x,
          y: player_sprite.y
      };
      // emulate friction
      player_sprite.velocity_x *= player_friction_coefficient
      player_sprite.velocity_y *= player_friction_coefficient

      // if the player is moving emit locational data
      if (Math.abs(player_sprite.velocity_x) >= 1 || Math.abs(player_sprite.velocity_y) >= 1) {
        do_emit = true;
      }

      if (do_emit) {
        // move the sprite baesd on current velocity
        player_sprite.position.x += player_sprite.velocity_x;
        player_sprite.position.y += player_sprite.velocity_y;

        // check for collisions
        if (colliding_with_map(player_sprite)) {
          player_sprite.position.x = original_position.x;
          player_sprite.position.y = original_position.y;
        }

        // update rotation
        update_player_sprite_rotation(player_sprite);

        emit_player_data();
      }
    }


    function update_projectiles() {
        // See if you can refactor, this might get really slow
        // Empirically is okay, but with many users in a map could bring
        // down the DO box
        for (var user in projectiles) {
            for (var i = 0; i < projectiles[user].length; ++i){
                projectiles[user][i].position.x -= shootspeed * Math.sin(projectiles[user][i].rotation);
                projectiles[user][i].position.y += shootspeed * Math.cos(projectiles[user][i].rotation);
                projectiles[user][i].distanceTraveled += shootspeed;
                var hit_user = false;
                for (var other_user in users){
                    var u = users[other_user];
                    if (user != other_user &&
                        is_intersecting(u.sprite, projectiles[user][i])){
                        hit_user = true;
                        // TODO Update hp here
                    }
                }
                if (user != user_id &&
                    is_intersecting(projectiles[user][i], player_sprite)){
                    hit_user = true;
                    player_hp -= 1;
                    console.log("You got hit", player_hp);
                    if (player_hp <= 0) {
                        reset_player();
                        emit_player_data();
                    }
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
        update_player_physics();
        update_projectiles();
        update_ui();
        requestAnimFrame( animate );
        renderer.render(stage);
    }
}
