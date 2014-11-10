from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.contrib.sessions.models import Session

from hubcave.game.models import Game

from datetime import datetime

def sidebar_lists(request):
    context = {}
    context['sidebar_games'] = Game.objects.filter(user_id=request.user.id)
    context['sidebar_users'] = get_user_model().objects.all()
    return context

def active_users():
    # Query all non-expired sessions
    sessions = Session.objects.filter(expire_date__gte=datetime.now())
    uid_list = []

    # Build a list of user ids from that query
    for session in sessions:
        data = session.get_decoded()
        uid_list.append(data.get('_auth_user_id', None))

    # Query all logged in users based on id list
    return {'active_users' : User.objects.filter(id__in=uid_list)}
