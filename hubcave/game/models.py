from github import Github
from datetime import datetime
from django.db import models
from django.contrib.auth.models import User

from hubcave.core.mixins.models import TrackingFields

class Game(TrackingFields):
    user = models.ForeignKey(User)
    repository = models.CharField(max_length=255, unique=True)
    map_data = models.BinaryField(null=True)
    size = models.IntegerField(null=True)
    commits = models.IntegerField(null=True)
    points_spent = models.IntegerField(default=0)
    repository_deleted = models.BooleanField(default=False)

    def __unicode__(self):
        return self.repository

    @property
    def token(self):
        return self.user.social_auth.get(provider='github').extra_data['access_token']

    def generate_or_update_map(self):
        if self._map_data is None:
            self.generate_map()
        else:
            self.update_map()

    def update_repo_magnitude(self, since_update=False):
        """
        Query github API for data necessary to build map. Update the
        object instance with size and commits
        """

        if self.repo is None:
            g = Github(self.token)
            self.repo = g.get_user().get_repo(self.repository)

        self.size = self.repo.size
        if since_update:
            self.commits_since \
                = self.repo.get_commits(since=self.date_updated)
        self.commits = repo.get_commits()

        # We will tokenize the readme to gather some strings to be
        # used inside the map terrain
        # readme = repo.get_readme()

    def update_map(self):
        """
        """
        pass

    def generate_map(self):
        """
        """
        self.update_repo_magnitude()
        print self.commits_since.totalCount
