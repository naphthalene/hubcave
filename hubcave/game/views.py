from django.views.generic import TemplateView
# from hubcave.game.models import Game

# Create your views here.

class Game(TemplateView):
    template_name = 'game.html'
#     model = Game
#     slug_field = 'repository'

#     def get_context_data(self, **kwargs):
#         # Call the base implementation first to get a context
#         context = super(Game, self).get_context_data(**kwargs)
#         print self.object.token
#         # From here use self.object to gather info about the game
#         return context
