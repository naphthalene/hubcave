from django.conf.urls import patterns, url
from django.contrib.auth.decorators import login_required

from hubcave.userprofile.views import ProfileDetail

urlpatterns = patterns(
    '',
    url(r'^profile/(?P<pk>\w+)/$',
        login_required(ProfileDetail.as_view(), login_url='/'),
        name='userprofile_profile')
)
