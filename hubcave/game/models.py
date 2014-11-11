from json import dumps, loads
from github import Github
from datetime import datetime
from django.db import models
from django.contrib.auth.models import User

import itertools

from hubcave.core.mixins.models import TrackingFields
from hubcave.game.mazes import min_cost_spanning_tree
from hubcave.game.protobuf.hubcave_pb2 import Map

class Game(TrackingFields):
    user = models.ForeignKey(User)
    repository = models.CharField(max_length=255, unique=True)
    map_data = models.BinaryField(null=True)
    size = models.IntegerField(null=True)
    commits = models.IntegerField(null=True)
    points_spent = models.IntegerField(default=0)
    # Whether the repo has been deleted on GitHub, not in the game.
    repository_deleted = models.BooleanField(default=False)

    def __unicode__(self):
        return self.repository

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
        map_size = 10
        self.map_data = Map()
        # self.map_data.user = self.user.social_auth.get(provider='github').get_username(self.user)
        # self.map_data.repository = self.repository

        blockmatrix = self.map_data.blockmatrix.add()
        maze = min_cost_spanning_tree(map_size, map_size)
        blockmatrix.rows = map_size
        blockmatrix.cols = map_size
        print(list(itertools.chain.from_iterable(maze)))
        blockmatrix.data.extend(list(itertools.chain.from_iterable(maze)))
        # self.save()

    def map_json(self):
        map_size = self.map_data.blockmatrix
        data = self.map_data.blockmatrix.data
        matrix = [data[i:i+map_size] for i in range(0, len(data), map_size)]
        return dumps({ "matrix" : matrix })
