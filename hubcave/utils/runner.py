from logan.runner import run_app, configure_app

import sys
import base64
import os

KEY_LENGTH = 40


CONFIG_TEMPLATE = """
from hubcave.core.settings.base import *

CONF_ROOT = os.path.dirname(__file__)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(CONF_ROOT, 'hubcave.db'),
        'USER': 'sqlite3',
        'PASSWORD': '',
        'HOST': '',
        'PORT': '',
    }
}

SECRET_KEY = %(default_key)r
SOCIAL_AUTH_GITHUB_KEY = ''
SOCIAL_AUTH_GITHUB_SECRET = ''
SOCKETIO_ENABLED = True

USE_TZ = False # Temporary chat fix
TIME_ZONE = "America/New_York"
"""


def generate_settings():
    output = CONFIG_TEMPLATE % dict(
        default_key=base64.b64encode(os.urandom(KEY_LENGTH)),
    )

    return output


def configure():
    configure_app(
        project='hubcave',
        default_config_path='~/.hubcave/settings.py',
        default_settings='hubcave.core.settings.base',
        settings_initializer=generate_settings,
        settings_envvar='HUBCAVE_CONF',
    )


def main(progname=sys.argv[0]):
    run_app(
        project='hubcave',
        default_config_path='~/.hubcave/settings.py',
        default_settings='hubcave.core.settings.base',
        settings_initializer=generate_settings,
        settings_envvar='HUBCAVE_CONF',
    )

if __name__ == '__main__':
    main()
