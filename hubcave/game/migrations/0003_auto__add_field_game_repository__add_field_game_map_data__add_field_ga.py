# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Game.repository'
        db.add_column(u'game_game', 'repository',
                      self.gf('django.db.models.fields.CharField')(default='foo', unique=True, max_length=255),
                      keep_default=False)

        # Adding field 'Game.map_data'
        db.add_column(u'game_game', 'map_data',
                      self.gf('django.db.models.fields.BinaryField')(null=True),
                      keep_default=False)

        # Adding field 'Game.starting_x'
        db.add_column(u'game_game', 'starting_x',
                      self.gf('django.db.models.fields.IntegerField')(null=True),
                      keep_default=False)

        # Adding field 'Game.starting_y'
        db.add_column(u'game_game', 'starting_y',
                      self.gf('django.db.models.fields.IntegerField')(null=True),
                      keep_default=False)

        # Adding field 'Game.map_type'
        db.add_column(u'game_game', 'map_type',
                      self.gf('django.db.models.fields.CharField')(default='cave', max_length=255),
                      keep_default=False)

        # Adding field 'Game.size'
        db.add_column(u'game_game', 'size',
                      self.gf('django.db.models.fields.IntegerField')(null=True),
                      keep_default=False)

        # Adding field 'Game.commits'
        db.add_column(u'game_game', 'commits',
                      self.gf('django.db.models.fields.IntegerField')(null=True),
                      keep_default=False)

        # Adding field 'Game.points_spent'
        db.add_column(u'game_game', 'points_spent',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Game.repository_deleted'
        db.add_column(u'game_game', 'repository_deleted',
                      self.gf('django.db.models.fields.BooleanField')(default=False),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Game.repository'
        db.delete_column(u'game_game', 'repository')

        # Deleting field 'Game.map_data'
        db.delete_column(u'game_game', 'map_data')

        # Deleting field 'Game.starting_x'
        db.delete_column(u'game_game', 'starting_x')

        # Deleting field 'Game.starting_y'
        db.delete_column(u'game_game', 'starting_y')

        # Deleting field 'Game.map_type'
        db.delete_column(u'game_game', 'map_type')

        # Deleting field 'Game.size'
        db.delete_column(u'game_game', 'size')

        # Deleting field 'Game.commits'
        db.delete_column(u'game_game', 'commits')

        # Deleting field 'Game.points_spent'
        db.delete_column(u'game_game', 'points_spent')

        # Deleting field 'Game.repository_deleted'
        db.delete_column(u'game_game', 'repository_deleted')


    models = {
        u'auth.group': {
            'Meta': {'object_name': 'Group'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        u'auth.permission': {
            'Meta': {'ordering': "(u'content_type__app_label', u'content_type__model', u'codename')", 'unique_together': "((u'content_type', u'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        u'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'related_name': "u'user_set'", 'blank': 'True', 'to': u"orm['auth.Group']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'related_name': "u'user_set'", 'blank': 'True', 'to': u"orm['auth.Permission']"}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        u'game.game': {
            'Meta': {'object_name': 'Game'},
            'commits': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'map_data': ('django.db.models.fields.BinaryField', [], {'null': 'True'}),
            'map_type': ('django.db.models.fields.CharField', [], {'default': "'cave'", 'max_length': '255'}),
            'points_spent': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'repository': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '255'}),
            'repository_deleted': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'size': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'starting_x': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'starting_y': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"})
        }
    }

    complete_apps = ['game']