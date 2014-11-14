from django.shortcuts import render
from django.views.generic import UpdateView, DetailView, CreateView
from django.core.urlresolvers import reverse_lazy, reverse
from django.contrib.auth.models import User
from hubcave.userprofile.models import UserProfile
from hubcave.game.models import Game

# Create your views here.
class ProfileDetail(DetailView):
    model = User

    def dispatch(self, request, *args, **kwargs):
        return super(ProfileDetail, self).dispatch(request, *args, **kwargs)

    def get_template_names(self):
        return ['userprofile/profile_detail.html']

    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super(ProfileDetail, self).get_context_data(**kwargs)
        context['users_games'] = Game.objects.filter(user=self.object)
        profile = UserProfile.objects.get(user=self.object)
        return context
