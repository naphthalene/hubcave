from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class UserProfile(models.Model):
    user = models.ForeignKey(User)
    gold = models.IntegerField(default=0)
    health = models.IntegerField(default=100)
