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
from hubcave.game.models import Game
from hubcave.game.protobuf import hubcave_pb2

@namespace('/game')
class GameNamespace(BaseNamespace, GameMixin, BroadcastMixin):

    def initialize(self):
        # self.logger = logging.getLogger("socketio.game")
        print("Socketio session started")
        # self.log("Socketio session started")

    def log(self, message):
        print("[{0}] {1}".format(self.socket.sessid, message))

    def on_join(self, (game_id, user_id)):
        self.game_id = game_id
        self.game = Game.objects.get(pk=game_id)
        self.user = User.objects.get(pk=user_id)
        self.join(str(self.game_id))
        self.emit('loading', self.game.map_dict())
        return True

    def on_projectile(self, data):
        print data
        self.emit_to_room(str(self.game_id), 'projectile', data)
        return True

    def on_player(self, data):
        # Here, need to get changes
        self.emit_to_room(str(self.game_id), 'pstate', data)
        return True

    def recv_disconnect(self):
        print('Disconnected')
        self.leave(str(self.game_id))
        self.disconnect(silent=True)
        return True
