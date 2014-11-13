from django.contrib import admin
from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView

from hubcave.core import views

import socketio.sdjango
socketio.sdjango.autodiscover()

admin.autodiscover()

urlpatterns = patterns(
    '',
    url(r'^$', views.Index.as_view(), name='index'),
    url(r'^grappelli/', include('grappelli.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^logout/$', 'django.contrib.auth.views.logout', {'next_page': '/'}),
    url(r'^robots\.txt$', TemplateView.as_view(template_name='robots.txt',
                                               content_type='text/plain')),
    url('', include('hubcave.dashboard.urls')),
    url('', include('hubcave.game.urls')),
    url('', include('social.apps.django_app.urls', namespace='social')),
    url('', include('django.contrib.auth.urls', namespace='auth')),
    url("^socket\.io", include(socketio.sdjango.urls)),
)
