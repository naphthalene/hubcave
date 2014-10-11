from django.views.generic import TemplateView

# Create your views here.

class Dashboard(TemplateView):
    template_name = 'dashboard.html'
