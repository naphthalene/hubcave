from math import floor
from json import dumps, loads
from github import Github
from random import random
from datetime import datetime
from django.db import models
from model_utils.managers import InheritanceManager
from django.contrib.auth.models import User

import itertools

from hubcave.userprofile.models import UserProfile
from hubcave.core.mixins.models import TrackingFields
from hubcave.game.mazes import min_cost_spanning_tree
from hubcave.game.random_walk import random_walk
from hubcave.game.protobuf.hubcave_pb2 import Map
from protobuf_to_dict import protobuf_to_dict

class Game(models.Model):
    user = models.ForeignKey(User)
    repository = models.CharField(max_length=255, unique=True)
    map_data = models.BinaryField(null=True)
    starting_x = models.IntegerField(null=True)
    starting_y = models.IntegerField(null=True)
    map_type = models.CharField(max_length=255, default="maze")
    updated = models.DateTimeField(default=datetime.now, blank=True)
    # Whether the repo has been deleted on GitHub, not in the game.
    repository_deleted = models.BooleanField(default=False)

    def __unicode__(self):
        return "{}/{}".format(self.user, self.repository)

    @property
    def token(self):
        return self.user.social_auth.get(provider='github').extra_data['access_token']

    def api_repo(self):
        """
        Query github API for data necessary to build map. Update the
        object instance with size and commits
        """

        g = Github(self.token)
        return g.get_user().get_repo(self.repository)

    def generate_or_update_map(self):
        if self.map_data is None:
            self.generate_map()
        else:
            self.update_map()

    def update_map(self):
        repo = self.api_repo()

        commits = repo.get_commits(since=self.updated)
        self.updated = datetime.now()
        self.save()

        for c in commits:
            i = Item.objects.get(kind='gold')
            self.drop_item(i)

    def generate_map(self):
        """
        """
        # self.update_repo_magnitude()
        gmap = Map()

        structure = None
        if self.map_type == "cave":
            (starting_x, starting_y), structure = random_walk()
            self.starting_x = starting_x
            gmap.starting_x = starting_x
            self.starting_y = starting_y
            gmap.starting_y = starting_y
        else:
            map_size = 10
            (starting_x, starting_y), structure = min_cost_spanning_tree(map_size, map_size)
            self.starting_x = starting_x
            gmap.starting_x = starting_x
            self.starting_y = starting_y
            gmap.starting_y = starting_y
        for i, row in enumerate(structure):
            for j, el in enumerate(row):
                blk = gmap.blockdata.add()
                blk.blktype = el
                blk.x = i
                blk.y = j
        self.map_data = gmap.SerializeToString()
        self.save()

    def map_dict(self):
        gmap = Map()
        gmap.ParseFromString(self.map_data)
        return protobuf_to_dict(gmap)

    def points_dict(self):
        ret = {}
        max_x = max_y = 0
        d = self.map_dict()
        for b in d['blockdata']:
            if b['x'] not in ret:
                ret[b['x']] = {}
            ret[b['x']][b['y']] = b['blktype']
            if b['x'] > max_x:
                max_x = b['x']
            if b['y'] > max_y:
                max_y = b['y']

        return (ret, max_x, max_y)

    def drop_item(self, item, item_location=None):
        """
        Drop an item onto the map, either at a random or specified
        location
        """
        if not item_location:
            d, max_x, max_y = self.points_dict()
            while True:
                item_location = (floor(random()*max_x),
                                 floor(random()*max_y))
                if d[item_location[0]][item_location[1]]:
                    break

        print "Dropping item {} in {}".format(item.kind, self.repository)
        return MapItem.objects.create(game=self,
                                      item=item,
                                      x=item_location[0],
                                      y=item_location[1])

class Player(models.Model):
    user = models.ForeignKey(User)
    game = models.ForeignKey(Game, related_name="players")

    class Meta:
        unique_together = (("user", "game"),)

class Message(models.Model):
    user = models.ForeignKey(User)
    game = models.ForeignKey(Game, related_name="messages")
    text = models.TextField()
    when = models.DateTimeField(auto_now_add=True)


class Inventory(models.Model):
    user = models.ForeignKey(User)

class Item(models.Model):
    TEXTURE_LOCATION = '/static/img/items/'
    """
    Information (where to get texture, id and effects)
    """
    kind = models.CharField(max_length=256)
    texture = models.CharField(max_length=256)
    stackable = models.BooleanField(default=False)

    @property
    def texture_location(self):
        return Item.TEXTURE_LOCATION + self.texture + ".png"

class InventoryItem(models.Model):
    inventory = models.ForeignKey(Inventory, related_name="items")
    item = models.ForeignKey(Item, related_name="i_instances")

    objects = InheritanceManager()

class StackableInventoryItem(InventoryItem):
    count = models.IntegerField()

class MapItem(models.Model):
    game = models.ForeignKey(Game, related_name="items")
    item = models.ForeignKey(Item, related_name="m_instances")
    x = models.FloatField()
    y = models.FloatField()
