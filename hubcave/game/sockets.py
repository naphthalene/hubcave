import logging
import sys
import subprocess
from base64 import b64decode, b64encode
from threading import Thread
import time
import fcntl
import os

from django.contrib.auth.models import User
from django.utils import formats

from socketio.namespace import BaseNamespace
from socketio.mixins import BroadcastMixin
from socketio.sdjango import namespace

from hubcave.game.item_effects import actions
from hubcave.userprofile.models import UserProfile
from hubcave.game.mixins import GameMixin
from hubcave.game.models import Game, Player, Message, Inventory, MapItem
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
        self.profile, _ = UserProfile.objects.get_or_create(user=self.user)
        self.inventory = Inventory.objects.get(user=self.user)
        self.join(str(self.game_id))
        print("{} joined {}/{}".format(self.user.username,
                                       self.game.user.username,
                                       self.game.repository))
        self.player, created = Player.objects.get_or_create(user=self.user,
                                                            game=self.game)
        msges = self.game.messages.order_by('-when')[:15]

        self.emit('loading', {
            'map' : self.game.map_dict(),
            'messages' : map(lambda m: {
                'user_id' : m.user.id,
                'user_name': m.user.username,
                'text' : m.text,
                'when' : formats.date_format(m.when, "TIME_FORMAT")
            }, msges)
        })

        self.emit('profile', {
            'hp' : self.profile.health,
            'gold' : self.profile.gold
        })

        if len(self.inventory.items.all()) <> 0:
            self.emit('inventory_add', {
                'items' : map(lambda i: {
                    'id': i.id,
                    'type': i.item.kind,
                    'texture': i.item.texture_location
                }, self.inventory.items.all())
            })

        if len(self.game.items.all()) <> 0:
            self.emit('map_item_add', {
                'items' : map(lambda i: {
                    'id' : i.id,
                    'type': i.item.kind,
                    'x': i.x,
                    'y': i.y,
                    'texture': i.item.texture_location
                }, self.game.items.all())
            })

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


    def on_death(self, data):
        print "Dedz"
        self.profile.health = 100
        self.profile.save()
        return True

    def on_collect(self, data):
        # Here, different items should do different things
        try:
            item = MapItem.objects.get(id=data['data']['id'])
            print "{} collected ({}){} in {}".format(self.user.get_full_name(),
                                                     item.id,
                                                     item.item.kind,
                                                     self.game)
            def emit_success():
                item.delete()
                self.emit('collect_ok', data)
                self.emit_to_room(str(self.game_id), 'collected_item', data)

            if item.item.kind in actions:
                actions[item.item.kind](self, item)
            else:
                actions['default'](self, item)
            emit_success()

        except MapItem.DoesNotExist as dne:
            return True

        except Exception as e:
            print e
            # Don't emit anything

        return True

    def on_msg(self, data):
        data['text'] = data['text'].replace('<', '&lt;').replace('>', '&gt;')
        print("[Room {}]({}) {}".format(str(self.game_id),
                                        data['user_name'],
                                        data['text']))
        msg = Message.objects.create(user=self.user,
                                     game=self.game,
                                     text=data['text'])
        msg.save()
        data['when'] = formats.date_format(msg.when, "TIME_FORMAT")
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
