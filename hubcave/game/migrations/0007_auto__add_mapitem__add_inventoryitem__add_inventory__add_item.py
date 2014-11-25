# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'MapItem'
        db.create_table(u'game_mapitem', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('game', self.gf('django.db.models.fields.related.ForeignKey')(related_name='items', to=orm['game.Game'])),
            ('item', self.gf('django.db.models.fields.related.ForeignKey')(related_name='m_instances', to=orm['game.Item'])),
            ('x', self.gf('django.db.models.fields.FloatField')()),
            ('y', self.gf('django.db.models.fields.FloatField')()),
        ))
        db.send_create_signal(u'game', ['MapItem'])

        # Adding model 'InventoryItem'
        db.create_table(u'game_inventoryitem', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('inventory', self.gf('django.db.models.fields.related.ForeignKey')(related_name='items', to=orm['game.Inventory'])),
            ('item', self.gf('django.db.models.fields.related.ForeignKey')(related_name='i_instances', to=orm['game.Item'])),
        ))
        db.send_create_signal(u'game', ['InventoryItem'])

        # Adding model 'Inventory'
        db.create_table(u'game_inventory', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['auth.User'])),
        ))
        db.send_create_signal(u'game', ['Inventory'])

        # Adding model 'Item'
        db.create_table(u'game_item', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('kind', self.gf('django.db.models.fields.CharField')(max_length=256)),
            ('texture', self.gf('django.db.models.fields.CharField')(max_length=256)),
        ))
        db.send_create_signal(u'game', ['Item'])


    def backwards(self, orm):
        # Deleting model 'MapItem'
        db.delete_table(u'game_mapitem')

        # Deleting model 'InventoryItem'
        db.delete_table(u'game_inventoryitem')

        # Deleting model 'Inventory'
        db.delete_table(u'game_inventory')

        # Deleting model 'Item'
        db.delete_table(u'game_item')


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
            'map_type': ('django.db.models.fields.CharField', [], {'default': "'maze'", 'max_length': '255'}),
            'points_spent': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'repository': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '255'}),
            'repository_deleted': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'size': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'starting_x': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'starting_y': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"})
        },
        u'game.inventory': {
            'Meta': {'object_name': 'Inventory'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"})
        },
        u'game.inventoryitem': {
            'Meta': {'object_name': 'InventoryItem'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'inventory': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'items'", 'to': u"orm['game.Inventory']"}),
            'item': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'i_instances'", 'to': u"orm['game.Item']"})
        },
        u'game.item': {
            'Meta': {'object_name': 'Item'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'kind': ('django.db.models.fields.CharField', [], {'max_length': '256'}),
            'texture': ('django.db.models.fields.CharField', [], {'max_length': '256'})
        },
        u'game.mapitem': {
            'Meta': {'object_name': 'MapItem'},
            'game': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'items'", 'to': u"orm['game.Game']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'item': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'m_instances'", 'to': u"orm['game.Item']"}),
            'x': ('django.db.models.fields.FloatField', [], {}),
            'y': ('django.db.models.fields.FloatField', [], {})
        },
        u'game.message': {
            'Meta': {'object_name': 'Message'},
            'game': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'messages'", 'to': u"orm['game.Game']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'text': ('django.db.models.fields.TextField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"}),
            'when': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'})
        },
        u'game.player': {
            'Meta': {'unique_together': "(('user', 'game'),)", 'object_name': 'Player'},
            'game': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'players'", 'to': u"orm['game.Game']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['auth.User']"})
        }
    }

    complete_apps = ['game']