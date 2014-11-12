from github import Github
from django.db import models
from django.contrib.auth.models import User

from hubcave.game.models import Game

# Create your models here.

class Dashboard(models.Model):
    user = models.ForeignKey(User)

    @property
    def token(self):
        return self.user.social_auth.get(provider='github').extra_data['access_token']

    def get_or_update_games(self):
        """
        Update the game list for the user. Do not prune deleted repositories
        """
        g = Github(self.token)
        gh_user = g.get_user()

        all_repos = filter(lambda r: not r.fork, gh_user.get_repos())
        new_repos = []
        try:
            all_games = Game.objects.filter(user=self.user)
            print all_games
            if all_games is not None:
                all_games_repos = map(lambda g: g.repository, all_games)
                new_repos = filter(lambda r: r.name not in all_games_repos,
                                   all_repos)

                deleted_repos = all_games.exclude(repository__in=all_games_repos)
                if len(deleted_repos) > 0:
                    print "Some repos have been deleted, marking them as such:\n{}".format(deleted_repos)
                    for r in deleted_repos:
                        r.repository_deleted = True
                        r.save()
            else:
                raise Game.DoesNotExist()
        except Game.DoesNotExist:
            new_repos = all_repos

        map(self.new_game_from_repo, new_repos)

    def new_game_from_repo(self, repo):
        """
        Generate a new game object, but don't generate any map data
        """
        print "Creating a new game for {}".format(repo.name)
        g = Game.objects.create(repository=repo.name,
                                user=self.user)
        g.save()
