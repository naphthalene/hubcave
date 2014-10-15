from django.conf.urls import patterns, url
from django.contrib.auth.decorators import login_required

from hubcave.dashboard import views

urlpatterns = patterns(
    '',
    url(r'^dashboard/$', login_required(views.Dashboard.as_view(),
                                        login_url='/'),
        name='dashboard'),
)
