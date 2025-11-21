from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, get_object_or_404
from django.urls import reverse
import json
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator

from .models import User,Post,Profile


def index(request):
    return render(request, "network/index.html")

@csrf_exempt
@login_required
def posts(request):
    if request.method != "POST":
        return JsonResponse({"error": "post request required"}, status=400)
    
    data = json.loads(request.body)
    content = data.get("content", "")
    new_post = Post(author=request.user, content=content)
    new_post.save()

    return JsonResponse({"message":"post created"}, status=201)

@csrf_exempt
def get_posts(request, feed):
    if feed == 'all-posts':
        posts = Post.objects.all()
    elif feed == 'profile':
        posts = Post.objects.filter(author=request.user)
    elif feed == 'following':
        profile = request.user.profile
        followings = profile.following.all()
        posts = Post.objects.filter(author__in=followings).order_by('-timestamp')
    
    else:
        return JsonResponse({'error':'invalid request feed'}, status=400)
    
    posts = posts.order_by('-timestamp')

    page_number = request.GET.get("page",1)
    paginator = Paginator(posts, 10)

    page_obj = paginator.get_page(page_number)
    print([post.serialize() for post in posts])
    return JsonResponse({
        "posts": [post.serialize() for post in page_obj],
        "has_next": page_obj.has_next(),
        "has_previous": page_obj.has_previous(),
        "page": page_obj.number,
        "num_pages": paginator.num_pages,
    },safe=False) 



@login_required
@csrf_exempt
def edit(request, postID):
    try:
        post = Post.objects.get(author=request.user, pk=postID)
    except Post.DoesNotExist:
        return JsonResponse({"error":"Post not found."}, status=404)
    
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

        content = data.get('content')
        data = json.loads(request.body)
        post.content = content
        post.save()
        return JsonResponse({"message":"Post updated successfully"})
    
    return JsonResponse({"error":"request get or put required"}, status=400)

@login_required
@csrf_exempt
def like(request, postID):
    post = get_object_or_404(Post, pk=postID)
    user = request.user
    liked = False

    if user in post.liked_by.all():
        post.liked_by.remove(user)
    else:
        post.liked_by.add(user)
        liked = True

    data = post.serialize()
    data['liked'] = liked

    return JsonResponse(data)


@login_required
@csrf_exempt
def like_status(request, postID):
    post = get_object_or_404(Post, pk=postID)
    user = request.user
    liked = user in post.liked_by.all()

    data = post.serialize()
    data['liked'] = liked

    return JsonResponse(data)



@login_required 
@csrf_exempt
def profile_posts(request, username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({'error':'user not found'}, status=404)
    

    posts = Post.objects.filter(author=user).order_by('-timestamp')

    page_number = request.GET.get("page",1)
    paginator = Paginator(posts, 10)

    page_obj = paginator.get_page(page_number)
    print([post.serialize() for post in posts])
    return JsonResponse({
        "posts": [post.serialize() for post in page_obj],
        "has_next": page_obj.has_next(),
        "has_previous": page_obj.has_previous(),
        "page": page_obj.number,
        "num_pages": paginator.num_pages,
    },safe=False) 




@login_required
@csrf_exempt
def profile_page(request, username):
    try:
        user = User.objects.get(username=username)
        profile = Profile.objects.get(user=user)
    except User.DoesNotExist:
        return JsonResponse({'error':'user not found'}, status=400)
    except Profile.DoesNotExist:
        return JsonResponse({'error': 'profile not found'}, status=400)
    
    
    return JsonResponse(profile.serialize(), safe=False)

@login_required
@csrf_exempt
def follow(request, username):
    if request.method == 'POST':
        try:
            person = User.objects.get(username=username)
        except User.DoesNotExist:
            return JsonResponse({'error':'user not found'}, status=404)
        
        profile = request.user.profile

        if person in profile.following.all():
            profile.following.remove(person)
            following = False
        else:
            profile.following.add(person)
            following = True

        followers_count = person.followers.count()

        return JsonResponse({
            "following": following,
            "followers_count": followers_count
        })

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
            Profile.objects.create(user=user)
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
