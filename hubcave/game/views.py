from django.conf import settings
from django.http import HttpResponseRedirect
from django.contrib import messages
from django_tables2 import SingleTableView
from django.shortcuts import redirect, get_object_or_404
from django.views.generic import (UpdateView, DetailView,
                                  CreateView, RedirectView)
from django.core.urlresolvers import reverse_lazy, reverse
from django.contrib.auth.models import User

from hubcave.game.forms import GameUpdateForm
from hubcave.game.models import Game
from hubcave.game.tables import GameTable

# Create your views here.

class GameRedirectView(RedirectView):
    query_string = True
    permanent = False
    pattern_name = "game_game"

    def get_redirect_url(self, *args, **kwargs):
        username = kwargs.get("username");
        repo = kwargs.get("repository");
        game = get_object_or_404(Game, user__username=username,
                                 repository=repo)
        return reverse('game_game', kwargs={'pk' : game.pk})

class GameDetail(DetailView):
    model = Game

    def get_template_names(self):
        if getattr(settings, 'SOCKETIO_ENABLED', False):
            print "Sockets are enabled! Go forth and conquer"
            return ['game/game_detail_socketio.html']
        else:
            return ['game/game_detail.html']

    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super(GameDetail, self).get_context_data(**kwargs)
        context['user_id'] = self.request.user.id;
        context['user_name'] = self.request.user.username;
        self.object.map_type = "cave";
        self.object.generate_or_update_map()
        return context

class GameUpdate(UpdateView):
    """
    Update a game
    """
    model = Game
    form_class = GameUpdateForm
    template_name_suffix = '_update'
    success_url = reverse_lazy('dashboard_dashboard_view')

    def dispatch(self, request, *args, **kwargs):
        g = get_object_or_404(Game, id=kwargs['pk'])
        if request.user != g.user:
            # Can't edit someone else's repo maaan
            return HttpResponseRedirect(reverse('game_game', kwargs={'pk' : g.pk}))
        else:
            return super(GameUpdate, self).dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        self.object.generate_map()
        return super(GameUpdate, self).form_valid(form)
