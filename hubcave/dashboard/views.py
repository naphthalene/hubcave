from django.views.generic import TemplateView
# from hubcave.dashboard.models import Dashboard

# Create your views here.

class Dashboard(TemplateView):
    template_name = 'dashboard.html'
