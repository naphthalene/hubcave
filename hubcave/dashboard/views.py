from django.db.models import Count, Max, Min
from django.views.generic import TemplateView
from hubcave.dashboard.models import Dashboard
from django.contrib.auth.models import User
from hubcave.dashboard.view_mixins import CacheViewMixin
from django.contrib.sessions.models import Session

from hubcave.game.models import Game, Inventory

from datetime import datetime

class DashboardView(TemplateView):
    template_name = 'dashboard.html'

    def active_users(self):
        # Query all non-expired sessions
        sessions = Session.objects.filter(expire_date__gte=datetime.now())
        uid_list = []

        # Build a list of user ids from that query
        for session in sessions:
            data = session.get_decoded()
            uid_list.append(data.get('_auth_user_id', None))

        # Query all logged in users based on id list
        return User.objects.filter(id__in=uid_list)

    def get_context_data(self, **kwargs):
        context = super(DashboardView, self).get_context_data(**kwargs)
        # Display repositories
        dash, _ = Dashboard.objects.get_or_create(user=self.request.user)
        inventory, _ = Inventory.objects.get_or_create(user=self.request.user)
        try:
            dash.get_or_update_games()
        except:
            print("Failed to get or update games")

        context['popular_games'] = Game.objects.annotate(Count('players')).order_by('-players__count')[:15]
        context['sidebar_users'] = self.active_users()
        context['sidebar_games'] = Game.objects.filter(user=self.request.user)
        return context
