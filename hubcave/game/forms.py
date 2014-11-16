import re

from django import forms
from django.forms import ModelForm
from django.core.validators import RegexValidator
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, ButtonHolder, Submit

from hubcave.game.models import Game

# TODO add point system based on commits and item collection

class GameUpdateForm(ModelForm):

    class Meta:
        model = Game
        fields = [
            'map_type'
        ]
        widgets = {'map_type': forms.Select(choices=(('maze', 'Maze'),
                                                     ('cave', 'Cave')))}

    def __init__(self, *args, **kwargs):
        self.helper = FormHelper()
        self.helper.form_class = 'form-horizontal'
        self.helper.label_class = 'col-lg-2'
        self.helper.field_class = 'col-lg-8'
        self.helper.layout = Layout(
            'map_type',
            ButtonHolder(
                Submit('submit', "Update Game".format(css_class='button'))
            )
        )

        super(GameUpdateForm, self).__init__(*args, **kwargs)
