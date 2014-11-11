#!/usr/bin/env python
import os
import sys

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.base")

    sys.path.append(os.getcwd())

    from django.conf import settings

    if getattr(settings, 'SOCKETIO_ENABLED', False):
        from gevent import monkey
        monkey.patch_all()

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
