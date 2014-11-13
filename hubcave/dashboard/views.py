from django.views.generic import TemplateView
from hubcave.dashboard.models import Dashboard
from django.contrib.auth.models import User
from hubcave.dashboard.view_mixins import CacheViewMixin
from django.contrib.sessions.models import Session

from datetime import datetime

class DashboardView(CacheViewMixin, TemplateView):
    template_name = 'dashboard.html'

    def get_cache_params(self, *args, **kwargs):
        return ('dashboard', 60 * 15)

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
        dash = Dashboard.objects.get_or_create(user=self.request.user)[0]
        dash.get_or_update_games()
        context['sidebar_users'] = self.active_users()
        return context
