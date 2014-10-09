from django.conf.urls import patterns, include, url
from django.contrib import admin

from hubcave.core import views

admin.autodiscover()

urlpatterns = patterns(
    '',
    # Examples:
    url(r'^grappelli/', include('grappelli.urls')),
    url(r'^$', views.Index.as_view(), name='index'),
    url(r'^admin/', include(admin.site.urls)),
    url('', include('social.apps.django_app.urls', namespace='social'))
)
