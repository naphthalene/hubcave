import json
from datetime import timedelta, datetime

from django.db import connection
from django.views.generic import TemplateView

class Index(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super(Index, self).get_context_data(**kwargs)
        return context
