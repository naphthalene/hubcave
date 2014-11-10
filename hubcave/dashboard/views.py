from django.views.generic import TemplateView
from hubcave.dashboard.models import Dashboard
from hubcave.dashboard.view_mixins import CacheViewMixin


class DashboardView(CacheViewMixin, TemplateView):
    template_name = 'dashboard.html'

    def get_cache_params(self, *args, **kwargs):
        return ('dashboard', 60 * 15)

    def get_context_data(self, **kwargs):
        context = super(DashboardView, self).get_context_data(**kwargs)
        # Display repositories
        dash = Dashboard.objects.get_or_create(user=self.request.user)[0]
        dash.get_or_update_games()
        return context
