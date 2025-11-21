from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.timezone import localtime


class User(AbstractUser):
    pass

class Post (models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    liked_by = models.ManyToManyField(User, related_name='liked', blank=True)

    
    def serialize(self):
        return{
            "id": self.id,
            "author": self.author.username,
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likecount": self.liked_by.count()
        }
    

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    following = models.ManyToManyField(User, related_name='followers', blank=True)

    def __str__(self):
        return self.user.username

    def serialize(self):
        return{
            'username': self.user.username,
            'followings_count' : self.following.count(),
            'followers_count' : self.user.followers.count(),
            'following': [a.username for a in self.following.all()],
            'followers': [p.user.username for p in self.user.followers.all()]
        } 
    
    