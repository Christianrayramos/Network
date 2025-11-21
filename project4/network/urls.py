
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    
    #API
    path("posts/profile/<str:username>", views.profile_posts, name="profile_posts"),
    path("posts", views.posts, name="posts"),
    path("posts/<str:feed>", views.get_posts, name="get_posts"),
    path("edit/<int:postID>", views.edit, name="edit"),
    path("like/<int:postID>", views.like, name='like'),
    path("like/status/<int:postID>", views.like_status, name="like_status"),
    path("profile/<str:username>",views.profile_page, name='profile_page'),
    path("follow/<str:username>", views.follow, name='follow')
]
