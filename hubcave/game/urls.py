from django.conf.urls import patterns, url
from django.contrib.auth.decorators import login_required

from hubcave.game import views

urlpatterns = patterns(
    '',
    url(r'^game/$', login_required(views.Game.as_view(),
                                   login_url='/'), name='game_view'),
)
