import logging
import sys
import subprocess
from threading import Thread
import time
import fcntl
import os

from socketio.namespace import BaseNamespace
from socketio.mixins import RoomsMixin, BroadcastMixin
from socketio.sdjango import namespace

from hubcave.game.models import Game

@namespace('/game')
class ChatNamespace(BaseNamespace, RoomsMixin, BroadcastMixin):

    def initialize(self):
        # self.logger = logging.getLogger("socketio.game")
        print("Socketio session started")
        # self.log("Socketio session started")

    def log(self, message):
        print("[{0}] {1}".format(self.socket.sessid, message))

    def on_join(self, game_id):
        self.game = Game.objects.get(pk=game_id)
        self.emit('loading', self.game.map_dict())
        return True

    def on_player(self, data):
        print("Player data: {}".format(data))
        return True

    def recv_disconnect(self):
        # Remove nickname from the list.
        print('Disconnected')
        self.disconnect(silent=True)
        return True
