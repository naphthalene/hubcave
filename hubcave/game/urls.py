from django.conf.urls import patterns, url
from django.contrib.auth.decorators import login_required

from hubcave.game import views

urlpatterns = patterns(
    '',
    url(r'^game/$',
        login_required(views.GameList.as_view(), login_url='/'),
        name='game_game_list'),
    url(r'^game/update/(?P<slug>[a-zA-Z0-9_\-]+)$',
        login_required(views.GameUpdate.as_view(), login_url='/'),
        name='game_game_update'),
    url(r'^game/create/(?P<slug>[a-zA-Z0-9_\-]+)$',
        login_required(views.GameCreate.as_view(), login_url='/'),
        name='game_game_create'),
    url(r'^game/(?P<slug>[a-zA-Z0-9_\-]+)/$',
        login_required(views.GameDetail.as_view(), login_url='/'),
        name='game_game'),
)
