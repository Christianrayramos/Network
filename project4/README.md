# CS50 Network
## A Django based social networking platform with posting, following and interactive features.

### Overview
This project is part of Harvard’s CS50 Web Programming with Python and JavaScript course.
It implements a mini social network where users can create posts, follow other users, edit content, and interact through likes — all enhanced with asynchronous JavaScript for a smooth user experience.

🚀 Features
- User authentication: registration, login, logout
- Create and edit posts directly from the UI
- Like and unlike posts dynamically using JavaScript
- Follow and unfollow other users
- Personalized feed showing posts from followed users
- Pagination for browsing large numbers of posts
- RESTful endpoints for updating likes and edits

## How to Run this Application
- Clone the repository to your local machine and navigate into the project directory
- Install dependencies listed in the requirements.txt file by running pip install -r requirements.txt.
- Apply database migrations using python manage.py makemigrations followed by python manage.py migrate.
- Start the development server by running python manage.py runserver.
- Open your browser and go to http://127.0.0.1:8000/ to access the app.