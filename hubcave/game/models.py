from json import dumps, loads
from github import Github
from datetime import datetime
from django.db import models
from django.contrib.auth.models import User

import itertools

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
    size = models.IntegerField(null=True)
    commits = models.IntegerField(null=True)
    points_spent = models.IntegerField(default=0)
    # Whether the repo has been deleted on GitHub, not in the game.
    repository_deleted = models.BooleanField(default=False)

    def __unicode__(self):
        return self.repository

    ## TODO move this to user profile?
    @property
    def token(self):
        return self.user.social_auth.get(provider='github').extra_data['access_token']

    # def update_repo_magnitude(self, since_update=False):
    #     """
    #     Query github API for data necessary to build map. Update the
    #     object instance with size and commits
    #     """

    #     if self.repository is None:
    #         g = Github(self.token)
    #         repo = g.get_user().get_repo(self.repository)

    #     self.size = self.repo.size
    #     if since_update:
    #         self.commits_since \
    #             = self.repo.get_commits(since=self.date_updated)
    #     self.commits = repo.get_commits()

        # We will tokenize the readme to gather some strings to be
        # used inside the map terrain
        # readme = repo.get_readme()

    def generate_or_update_map(self):
        if self.map_data is None:
            self.generate_map()
        else:
            self.update_map()

    def update_map(self):
        """
        """
        # self.update_repo_magnitude()
        # print self.commits_since.totalCount
        pass

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
            structure = min_cost_spanning_tree(map_size, map_size)
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
