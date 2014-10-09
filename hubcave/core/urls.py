from django.conf.urls import patterns, include, url
from django.contrib import admin

from hubcave.core import views

admin.autodiscover()

urlpatterns = patterns(
    '',
    url(r'^$', views.Index.as_view(), name='index'),
    url(r'^grappelli/', include('grappelli.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^logout/$', 'django.contrib.auth.views.logout', {'next_page': '/'}),
    url('', include('social.apps.django_app.urls', namespace='social')),
    url('', include('django.contrib.auth.urls', namespace='auth')),
)
