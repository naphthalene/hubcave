from django.views.generic import TemplateView

# Create your views here.

class Game(TemplateView):
    template_name = 'game.html'
