from django.conf import settings
from django.core.management.base import CommandError
import logging
from django.core.management.base import BaseCommand
from django.db import connection
        
class Command(BaseCommand):
    help = "Resets a database."

    def handle(self, *args, **options):
        """
        Resets a database.
    
        Note: Transaction wrappers are in reverse as a work around for
        autocommit, anybody know how to do this the right way?
        """

        print settings
        engine = settings.DATABASES['default']['ENGINE']
        name = settings.DATABASES['default']['NAME']
        user = settings.DATABASES['default']['USER']
        passwd = settings.DATABASES['default']['PASSWORD']
        host = settings.DATABASES['default']['HOST']
        port = settings.DATABASES['default']['PORT']
    
        if engine == 'django.db.backends.sqlite3':
            import os
            try:
                logging.info("Unlinking sqlite3 database")
                os.unlink(name)
            except OSError:
                pass
        elif engine == 'django.db.backends.mysql':
            import MySQLdb as Database
            kwargs = {
                'user': user,
                'passwd': passwd,
            }
            if host.startswith('/'):
                kwargs['unix_socket'] = host
            else:
                kwargs['host'] = host
            if port:
                kwargs['port'] = int(port)
            connection = Database.connect(**kwargs)
            drop_query = 'DROP DATABASE IF EXISTS %s' % name
            create_query = 'CREATE DATABASE %s' % name
            logging.info('Executing... "' + drop_query + '"')
            connection.query(drop_query)
            logging.info('Executing... "' + create_query + '"')
            connection.query(create_query)
        elif engine == 'django.db.backends.postgresql_psycopg2':
            import psycopg2 as Database
    
            if name == '':
                from django.core.exceptions import ImproperlyConfigured
                raise ImproperlyConfigured, "You need to specify DATABASE_NAME in your Django settings file."
            if user:
                conn_string = "user=%s" % (user)
            if passwd:
                conn_string += " password='%s'" % passwd
            if host:
                conn_string += " host=%s" % host
            if port:
                conn_string += " port=%s" % port
            connection = Database.connect(conn_string)
            connection.set_isolation_level(0) #autocommit false
            cursor = connection.cursor()
            drop_query = 'DROP DATABASE %s' % name
            logging.info('Executing... "' + drop_query + '"')
    
            try:
                cursor.execute(drop_query)
            except Database.ProgrammingError, e:
                logging.info("Error: "+str(e))
    
            # Encoding should be SQL_ASCII (7-bit postgres default) or prefered UTF8 (8-bit)
            create_query = ("""
CREATE DATABASE %s
    WITH OWNER = %s
        ENCODING = 'UTF8'
        TABLESPACE = pg_default;
""" % (name, user))
            logging.info('Executing... "' + create_query + '"')
            cursor.execute(create_query)
    
        else:
            raise CommandError, "Unknown database engine %s", engine
    
        logging.info("Reset success")
