from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.contrib.sessions.models import Session

from hubcave.game.models import Game

from datetime import datetime

def sidebar_lists(request):
    context = {}
    context['sidebar_games'] = Game.objects.filter(user_id=request.user.id)
    return context
