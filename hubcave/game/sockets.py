import logging
import sys
import subprocess
from base64 import b64decode, b64encode
from threading import Thread
import time
import fcntl
import os

from django.contrib.auth.models import User

from socketio.namespace import BaseNamespace
from socketio.mixins import BroadcastMixin
from socketio.sdjango import namespace

from hubcave.game.mixins import GameMixin
from hubcave.game.models import Game, Player
from hubcave.game.protobuf import hubcave_pb2

@namespace('/game')
class GameNamespace(BaseNamespace, GameMixin, BroadcastMixin):

    def initialize(self):
        # self.logger = logging.getLogger("socketio.game")
        print("Socketio session started")
        # self.log("Socketio session started")

    def on_join(self, (game_id, user_id)):
        self.game_id = game_id
        self.game = Game.objects.get(pk=game_id)
        self.user = User.objects.get(pk=user_id)
        self.join(str(self.game_id))
        print("{} joined {}/{}".format(self.user.username,
                                       self.game.user.username,
                                       self.game.repository))
        self.player, created = Player.objects.get_or_create(user=self.user,
                                                            game=self.game)
        self.emit('loading', self.game.map_dict())
        self.emit_to_room(str(self.game_id), 'joining', {
            'data' : {
                'user_id': user_id,
                'user_name' : self.user.username,
                'x' : self.game.starting_x,
                'y' : self.game.starting_y
            }
        })
        return True

    def on_projectile(self, data):
        self.emit_to_room(str(self.game_id), 'projectile', data)
        return True

    def on_msg(self, data):
        print("[Room {}]({}) {}".format(str(self.game_id),
                                        data['user_name'],
                                        data['text']))
        self.emit_to_room(str(self.game_id), 'msg', data)
        return True

    def on_player(self, data):
        self.emit_to_room(str(self.game_id), 'pstate', data)
        return True

    def recv_disconnect(self):
        self.leave(str(self.game_id))
        print("{} disconnected".format(self.user.username))
        self.emit_to_room(str(self.game_id), 'leaving', {
            'user' : self.user.id,
            'username' : self.user.username
        })
        self.player.delete()
        self.disconnect(silent=True)
        return True
