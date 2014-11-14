import django_tables2 as tables

from hubcave.core.mixins.tables import ActionsColumn, PaginateTable
from hubcave.game.models import Game

class GameTable(PaginateTable):
    """
    Table used to display games
    Provides actions to:
     - update the map
    """
    actions = ActionsColumn([
        {
            # Show page to update repository
            'title' : '<i class="glyphicon glyphicon-file"></i>',
            'url' : 'game_game_update',
            'args' : [tables.A('user'), tables.A('repository')],
            'attrs': {
                'data-toggle': 'tooltip',
                'title': 'View Project',
                'data-delay': '{ "show": 300, "hide": 0 }'
            }
        }
    ])

    name = tables.LinkColumn('game_game_view',
                             kwargs={'repository': tables.A('repository')})

    class Meta:
        model = Game
        attrs = {"class": "table table-striped"}
        sequence = fields = (
            'name',
            'actions',
        )
