from django.conf.urls import patterns, url
from django.contrib.auth.decorators import login_required

from hubcave.game.views import Game

urlpatterns = patterns(
    '',
    url(r'^game/$', login_required(Game.as_view(),
                                   login_url='/'),
        name='game'),
)
