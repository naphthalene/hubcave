from django.conf.urls import patterns, url
from django.contrib.auth.decorators import login_required

from hubcave.game import views

urlpatterns = patterns(
    '',
    url(r'^game/$',
        login_required(views.GameList.as_view(), login_url='/'),
        name='game_game_list'),
    url(r'^game/update/(?P<pk>\w+)$',
        login_required(views.GameUpdate.as_view(), login_url='/'),
        name='game_game_update'),
    url(r'^game/create/$',
        login_required(views.GameCreate.as_view(), login_url='/'),
        name='game_game_create'),
    url(r'^game/(?P<pk>\w+)/$',
        login_required(views.GameDetail.as_view(), login_url='/'),
        name='game_game'),
    url(r'^r/(?P<username>[a-zA-Z0-9_\-]+)/(?P<repository>[a-zA-Z0-9_\-]+)',
        login_required(views.GameRedirectView.as_view(), login_url='/'),
        name='game_redirect'),
)
