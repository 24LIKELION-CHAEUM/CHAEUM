# tasks/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, NotificationViewSet, SeniorTaskViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'notifications', NotificationViewSet)
router.register(r'senior-tasks', SeniorTaskViewSet, basename='senior-tasks')

urlpatterns = [
    # path('api/', include(router.urls)),
    path('', include(router.urls)),
]
