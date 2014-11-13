import os
import os.path
import sys

from thread import start_new_thread

# Add the project to the python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), os.pardir))
sys.stdout = sys.stderr

# Configure the application (Logan)
from hubcave.utils.runner import configure
configure()

from hubcave.game.management.commands.runserver_socketio import run_socket_server, get_handler

from django.core.wsgi import get_wsgi_application

start_new_thread(run_socket_server, ("0.0.0.0", "8018"))
application = get_wsgi_application()
