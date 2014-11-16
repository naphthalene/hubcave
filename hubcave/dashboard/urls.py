from django.conf.urls import patterns, url
from django.contrib.auth.decorators import login_required

from hubcave.dashboard.views import DashboardView

urlpatterns = patterns(
    '',
    url(r'^dashboard/$',
        login_required(DashboardView.as_view(), login_url='/'),
        name='dashboard_dashboard_view')
)
