// HUBCAVE

// Disable the chat window initially
$('#chat_input').width($('.chat-panel').width() - 50);

var socket = io.connect("/game", {
                            transports: ['websocket',
                                         'flashsocket',
                                         'polling']
                        });
socket.on('connect', function () {
              socket.emit('join', [game_id, user_id]);
          });

var loaded = false;
socket.on('loading', function (data) {
              if (!loaded) {
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
                  loaded = true;
                  run_game();
              }
          });

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
    var blankItemTexture = PIXI.Texture.fromImage("/static/img/items/blank.png");
    var charTexture = PIXI.Texture.fromImage("/static/img/ghlogo.png");
    var vignetteTexture = PIXI.Texture.fromImage("/static/img/vignette.png");

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
    map_items = {};

    // Bow is default item at '1'
    // Items/keys -> map 2-0 keys to select
    // HP/ammo

    // DECLARE PLAYER OBJECT

    player_sprite = new PIXI.Sprite(charTexture);
    player_sprite.velocity_x = 0;
    player_sprite.velocity_y = 0;
    player_sprite.width = blocksize / 2;
    player_sprite.height = blocksize / 2;
    player_sprite.previous_position = {};

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
        // This is set by the socket event
        player_hp = 0;
        player_gold = 0;
        // This is untracked for now
        player_ammo = 500;
    }; reset_player();

    player_sprite.pivot.x = player_sprite.width;
    player_sprite.pivot.y = player_sprite.height;

    var nick = new PIXI.Text(user_name,
                             {
                                 font: 'bold 9px Arial'
                             });
    player_sprite.addChild(nick);

    // enemies = [];

    scrollArea.addChild(player_sprite);

    stage.addChild(scrollArea);

    // Add ui overlay
    ui_show = true;

    var ui = new PIXI.DisplayObjectContainer();
    ui.position.x = 0;
    ui.position.y = 0;
    ui.width = render_size;
    ui.height = blocksize;
    ui.interactive = true;
    ui.buttonMode = true;
    stage.addChild(ui);

    hitpoints_counter = new PIXI.Text("HP: " + player_hp.toString(),
                                      { fill: 'white',
                                        font: 'bold 13px Arial' });

    hitpoints_counter.x = 15;
    hitpoints_counter.y = 3;
    ui.addChild(hitpoints_counter);

    ammo_counter = new PIXI.Text("Arrows: " + player_ammo.toString(),
                                      { fill: 'white' ,
                                        font: 'bold 13px Arial'});
    ammo_counter.x = 30 + hitpoints_counter.width;
    ammo_counter.y = 3;

    ui.addChild(ammo_counter);

    gold_counter = new PIXI.Text("Gold: " + player_gold.toString(),
                                      { fill: 'white' ,
                                        font: 'bold 13px Arial'});
    gold_counter.x = 15;
    gold_counter.y = hitpoints_counter.height + 8;

    ui.addChild(gold_counter);

    var inventory_container = new PIXI.DisplayObjectContainer();
    // Initial offsets from the left and top
    inventory_container.position.x = ammo_counter.width + ammo_counter.x + 15;
    inventory_container.position.y = 3;
    inventory_container.width = ui._width;
    inventory_container.height = ui._height;

    var gfx = new PIXI.Graphics();

    inventory_container.addChild(gfx);
    inventory_container.gfx = gfx;

    ui.addChild(inventory_container);

    // inventory_container.addChild(new PIXI.Sprite(wallTexture));
    // This should be set by the server over the socket on 'loading'
    // This is a list of Items defined above (at most 9 here)
    function Inventory (items, container) {
        this.items = items;
        this.padding = 0.1;
        this.container = container;
        this.container.gfx.clearActive = function() {
            this.clear();
            this.beginFill(0xFFFFFF, 0.8);
            this.drawRect(0, 0, this.parent.width, this.parent.height + 10);
            this.endFill();
        };
        this.update();
        this.container.gfx.clearActive();
        for (var i=0,offset=this.padding; i<9; ++i) {
            var index_text = new PIXI.Text((i + 1).toString(),
                                           {
                                               font: '9px Arial'
                                           });
            index_text.position.x = offset;
            index_text.position.y = this.padding * this.sprite_size;
            this.container.addChild(index_text);
            offset += ((2 * this.padding) + this.sprite_size);
            // Can't use keydrown for this....
            document.addEventListener(
                'keyup',
                function(inv, index) {
                    return function(evt) {
                        if (evt.keyCode == (index + 49)){
                            var previously_active = inv.active_item;
                            try {
                                inv.setActive(inv.items[index]);
                            } catch (x) {
                                inv.setActive(previously_active);
                                console.log('Tried to access item that does not exist');
                            }
                        }
                    }; }(this, i));
        }
    }
    // People you follow's activity will be shown in a live updating feed on the dashboard.
    // Need to reorganize the dash, make it better for mobile

    // ---
    // Each slot is assigned an item
    //
    Inventory.prototype.setActive = function(item) {
        this.container.gfx.clearActive();
        this.active_item = item;
        this.container.gfx.beginFill(0x0, 0.2);
        this.container.gfx.lineStyle(2, 0xBB0000);
        var s = item.getSprite();
        this.container.gfx.drawRect(
            s.position.x, s.position.y,
            s._width, s._height);
        this.container.gfx.endFill();
    };

    Inventory.prototype.addItem = function(item) {
        if (this.items.length < 9){
            this.items.push(item);
            this.update();
            this.setActive(item);
            return true;
        } else {
            return false;
        }
    };

    Inventory.prototype.hasItem = function(item_type) {
        for (var i=0; i<this.items.length; ++i){
            if (this.items[i].type == item_type) {
                return true;
            }
        }
        return false;
    };

    Inventory.prototype.stackItem = function(item_type) {
        for (var i=0; i<this.items.length; ++i){
            var item = this.items[i];
            if (item.type == item_type) {
                item.count += 1;
            }
            this.update();
        }
    };

    Inventory.prototype.popItem = function(item) {
        this.items.pop(item);
        this.update();
    };

    Inventory.prototype.update = function() {
        // Get the bounds of the container
        // Space out evenly, the number of items in the list
        var cell_size = this.container._height;
        // Handle selected item (draw bounding box)
        // each item container has a padding from each side proportional
        // to the item container width. The rectangle formed by this
        // inside padding is what the scale of the item sprite should
        // be. Could be able to achieve this by setting widths
        this.sprite_size = cell_size -
            (2 * this.padding * cell_size);

        for (var i=0,offset=this.padding; i<9; ++i){
            if (i > this.items.length - 1){
                var s = new PIXI.Sprite(blankItemTexture);
                s.width = this.sprite_size;
                s.height = this.sprite_size;
                s.position.x = offset;
                s.position.y = this.padding * this.sprite_size;
                this.container.addChild(s);
            } else {
                var item = this.items[i];
                if (!(typeof item === "undefined")) {
                    var s = item.getSprite();
                    s.width = this.sprite_size;
                    s.height = this.sprite_size;
                    s.position.x = offset;
                    s.position.y = this.padding * this.sprite_size;
                    if (item.stackable) {
                        item.counter_text.setText(item.count);
                    }
                    this.container.addChild(s);
                }
            }
            offset += ((2 * this.padding) + this.sprite_size);
        }
    };

    var extend = augment.extend;

    var Item = augment(
        Object,
        function () {
            this.getSprite = function () {
                if (typeof this.sprite === 'undefined') {
                    this.sprite = new PIXI.Sprite(this.texture);
                }
                return this.sprite;
            };
            this.InventoryItem = extend(
                this,
                {
                    constructor: function(type, textureloc, stackable, count) {
                        this.type = type;
                        this.stackable = stackable;
                        this.texture = PIXI.Texture.fromImage(textureloc);
                        this.getSprite();
                        this.sprite.interactive = true;
                        this.sprite.buttonMode = true;
                        this.sprite.mousedown = function(item) {
                            return function(idata) {
                                inventory.setActive(item);
                            }; }(this);
                        this.count = count;
                        if (stackable) {
                            this.counter_text = new PIXI.Text(
                                (this.count).toString(),
                                { font: '14px Arial' });
                            this.counter_text.position.y = 35;
                            this.sprite.addChild(this.counter_text);
                        }
                    }
                });
            this.MapItem = extend(
                this,
                {
                    constructor: function(id, type, x, y, textureloc) {
                        this.id = id;
                        this.type = type;
                        this.texture = PIXI.Texture.fromImage(textureloc);
                        var s = this.getSprite();
                        s.position.x = x;
                        s.position.y = y;
                        s.width = blocksize / 5;
                        s.height = blocksize / 5;
                        // s.pivot.x = s._width;
                        // s.pivot.y = s._height;
                        // Add a random rotation, why not
                        // Inheriting classes can override this anyway
                        // s.rotation = Math.random() * Math.pi * 2;
                        scrollArea.addChild(s);
                    },
                    collect: function () {
                        socket.emit('collect', {
                                        data: {
                                            user: user_id,
                                            id: this.id
                                        }
                                    });
                    }
                });
        });

    socket.on('collect_ok' ,function (data) {
                  var item = map_items[data.data.id];
                  scrollArea.removeChild(item.sprite);
                  delete map_items[data.data.id];
              });

    // Populate inventory using socket data
    var inventory = new Inventory([], inventory_container);

    socket.on('inventory_add', function (data) {
                  for (var i=0; i < data.items.length; ++i) {
                      var item_data = data.items[i];
                      if (item_data.stackable &&
                          inventory.hasItem(item_data.type)) {
                          inventory.stackItem(item_data.type);
                      } else {
                          var item = new Item.InventoryItem(
                              item_data.type,
                              item_data.texture,
                              item_data.stackable,
                              item_data.count);
                          inventory.addItem(item);
                      }
                  }});

    socket.on('map_item_add', function (data) {
                  for (var i=0; i < data.items.length; ++i) {
                      var item_data = data.items[i],
                          item = new Item.MapItem(item_data.id,
                                                  item_data.type,
                                                  item_data.y * blocksize + Math.random() * blocksize,
                                                  item_data.x * blocksize + Math.random() * blocksize,
                                                  item_data.texture);
                      // console.log("** New Map Item : " + item_data.type, item.sprite);
                      map_items[item.id] = item;
                  }});

    socket.on('collected_item', function (data) {
                  console.log(data.data.user + " collected " + data.data.id);
                  var item = map_items[data.data.id];
                  scrollArea.removeChild(item.getSprite());
                  delete map_items[data.data.id];
              });

    socket.on('add_gold', function(amount) {
                  console.log("Got some gold:", amount);
                  player_gold += amount;
              });

    function update_ui(){
        if (ui_show){
            hitpoints_counter.setText("HP: " + player_hp.toString());
            ammo_counter.setText("Arrows: " + player_ammo.toString());
            gold_counter.setText("Gold: " + player_gold.toString());
        }
    }

    update_ui();
    socket.on('profile', function(data) {
                  player_hp = data.hp;
                  player_gold = data.gold;
                  update_ui();
              });

    movespeed = blocksize / 20;
    var max_abs_velocity = movespeed;
    var player_friction_coefficient = 0.95;
    var wall_bounce_coefficient = 0;
    var player_acceleration = 1;
    shootspeed = blocksize / 10;
    rotatespeed = Math.PI / 50;
    edge_buffer = render_size / 2.5;

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
        player_sprite.mouse_x = idata.originalEvent.layerX;
        player_sprite.mouse_y = idata.originalEvent.layerY;
        update_player_sprite_rotation();
    };

    function update_player_sprite_rotation() {
        var dist_x = player_sprite.mouse_x -
            (player_sprite.getBounds().x + player_sprite.getBounds().width / 2);
        var dist_y = player_sprite.mouse_y -
            (player_sprite.getBounds().y + player_sprite.getBounds().height / 2);

        player_sprite.rotation = Math.atan2(-dist_x, dist_y);
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
            var new_velocity = player_sprite.velocity_x + (velo_delta * player_acceleration);
            if (Math.abs(new_velocity) <= max_abs_velocity) {
                player_sprite.velocity_x = new_velocity;
            }
        } else if (direction == 'y') {
            var new_velocity = player_sprite.velocity_y + (velo_delta * player_acceleration);
            if (Math.abs(new_velocity) <= max_abs_velocity) {
                player_sprite.velocity_y = new_velocity;
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
                    if (kd.W.isDown() || kd.S.isDown()){
                        add_player_velocity(-1 / Math.sqrt(2),'x');
                    } else {
                        add_player_velocity(-1,'x');
                    }
                }
                else if (kd.D.isDown() && !kd.A.isDown()) {
                    if (kd.W.isDown() || kd.S.isDown()){
                        add_player_velocity(1 / Math.sqrt(2),'x');
                    } else{
                        add_player_velocity(1,'x');
                    }
                }

                // handle verticle motion
                if (kd.W.isDown() && !kd.S.isDown()) {
                    if (kd.A.isDown() || kd.D.isDown()){
                        add_player_velocity(-1 / Math.sqrt(2),'y');
                    } else {
                        add_player_velocity(-1,'y');
                    }
                }
                else if (kd.S.isDown() && !kd.W.isDown()) {
                    if (kd.A.isDown() || kd.D.isDown()){
                        add_player_velocity(1 / Math.sqrt(2),'y');
                    } else {
                        add_player_velocity(1,'y');
                    }
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
        // emulate friction
        player_sprite.velocity_x *= player_friction_coefficient;
        player_sprite.velocity_y *= player_friction_coefficient;

        // if the player is moving emit locational data
        if (Math.abs(player_sprite.velocity_x) >= 1 || Math.abs(player_sprite.velocity_y) >= 1) {
            do_emit = true;
        }

        // Forms a triangle with: previous position corners , current position
        // corners and block corners

        if (do_emit) {
            // Check for collisions with the map
            function blkaddr(loc) {
                // Get the floor tile :P
                return Math.floor(loc / blocksize);
            }
            function signed_determinant(p0, p1, blk_corner) {
                return (blk_corner.x - p0.x) * (p1.y - p0.y) -
                    (blk_corner.y - p0.y) * (p1.x - p0.x);
            }
            // These represent the edges of the sprite
            var
            pleft = player_sprite.x - player_sprite.pivot.x / 2,
            pright = player_sprite.x + player_sprite.pivot.x / 2,
            ptop = player_sprite.y - player_sprite.pivot.y / 2,
            pbottom = player_sprite.y + player_sprite.pivot.y / 2,
            ppleft = player_sprite.previous_position.x - player_sprite.pivot.x / 2,
            ppright = player_sprite.previous_position.x + player_sprite.pivot.x / 2,
            pptop = player_sprite.previous_position.y - player_sprite.pivot.y / 2,
            ppbottom = player_sprite.previous_position.y + player_sprite.pivot.y / 2;

            var
            bleft = blkaddr(pleft),
            bright = blkaddr(pright),
            btop = blkaddr(ptop),
            bbottom = blkaddr(pbottom);

            function bounce_y() {
                player_sprite.velocity_y = (-player_sprite.velocity_y) * wall_bounce_coefficient;
                player_sprite.position.y = player_sprite.previous_position.y;
                player_sprite.position.x += player_sprite.velocity_x;
            }
            function bounce_x() {
                player_sprite.velocity_x = (-player_sprite.velocity_x) * wall_bounce_coefficient;
                player_sprite.position.x = player_sprite.previous_position.x;
                player_sprite.position.y += player_sprite.velocity_y;
            }
            if ([!terrain[btop][bleft],
                 !terrain[btop][bright],
                 !terrain[bbottom][bright],
                 !terrain[bbottom][bleft]].reduce(function (prev, curr, i, arr)
                         {
                             return prev + (curr ? 1 : 0);
                         }) == 3) {
                // Three corners are colliding, bounce back both ways
                bounce_x(); bounce_y();
            } else if (!terrain[btop][bleft] && !terrain[btop][bright]) {
                // We are colliding with both top corners.
                bounce_y();
            } else if (!terrain[btop][bleft] && !terrain[bbottom][bleft]) {
                // Left side is colliding completely, bounce along x
                bounce_x();
            } else if (!terrain[btop][bright] && !terrain[bbottom][bright]) {
                // Right side is colliding completely, bounce along x
                bounce_x();
            } else if (!terrain[bbottom][bleft] && !terrain[bbottom][bright]) {
                // Bottom side is colliding completely, bounce along y
                bounce_y();
            } // Now handle single corner collisions
            else if (!terrain[btop][bleft]) {
                // top left is intersecting a wall
                var blk_corner = {
                    x: (bleft * blocksize) + blocksize,
                    y: (btop * blocksize) + blocksize
                },
                d = signed_determinant({ x : pleft, y: ptop },
                                       { x : ppleft, y: pptop },
                                       blk_corner);
                if (d > 0) {
                    bounce_y();
                } else if (d < 0) {
                    bounce_x();
                } else {
                    bounce_x(); bounce_y();
                }
            }
            else if (!terrain[btop][bright]) {
                // top right is intersecting a wall
                var blk_corner = {
                    x: (bright * blocksize),
                    y: (btop * blocksize) + blocksize
                },
                d = signed_determinant({ x : pright, y: ptop },
                                       { x : ppright, y: pptop },
                                       blk_corner);
                if (d > 0) {
                    bounce_x();
                } else if (d < 0) {
                    bounce_y();
                } else {
                    bounce_x(); bounce_y();
                }
            }
            else if (!terrain[bbottom][bleft]) {
                // bottom left is intersecting a wall
                var blk_corner = {
                    x: (bleft * blocksize) + blocksize,
                    y: (bbottom * blocksize)
                },
                d = signed_determinant({ x : pleft, y: pbottom },
                                       { x : ppleft, y: ppbottom },
                                       blk_corner);
                if (d > 0) {
                    bounce_x();
                } else if (d < 0) {
                    bounce_y();
                } else {
                    bounce_x(); bounce_y();
                }
            }
            else if (!terrain[bbottom][bright]) {
                // bottom right is intersecting a wall
                var blk_corner = {
                    x: (bright * blocksize),
                    y: (bbottom * blocksize)
                },
                d = signed_determinant({ x : pright, y: pbottom },
                                       { x : ppright, y: ppbottom },
                                       blk_corner);
                if (d > 0) {
                    bounce_y();
                } else if (d < 0) {
                    bounce_x();
                } else {
                    bounce_x(); bounce_y();
                }
            } else {
                // No collisions
                player_sprite.previous_position.x = player_sprite.x;
                player_sprite.previous_position.y = player_sprite.y;
                player_sprite.position.x += player_sprite.velocity_x;
                player_sprite.position.y += player_sprite.velocity_y;
            }

            // update rotation
            update_player_sprite_rotation();

            emit_player_data();

            for (var id in map_items) {
                var item = map_items[id];
                if (is_intersecting(player_sprite, item.sprite)){
                    item.collect();
                }
            }
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
                        socket.emit('death', {});
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
