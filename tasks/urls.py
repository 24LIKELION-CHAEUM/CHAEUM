# tasks/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, NotificationViewSet
from . import views


router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'notifications', NotificationViewSet)

urlpatterns = [
    # path('api/', include(router.urls)),
    path('', include(router.urls)),
    path('todo/', views.todolist, name='todolist'),
    path('alarm/', views.alarmlist, name='alarmlist'),
    path('senior/welfare/', views.senior_welfare, name='senior_welfare'),


]
