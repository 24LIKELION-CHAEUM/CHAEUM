from django.contrib import admin
from .models import Task, Notification

# Register your models here.
@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'type', 'time', 'date', 'is_completed')
    search_fields = ('title', 'user__username', 'type')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'type', 'notify_time', 'is_read')
    search_fields = ('title', 'user__username', 'type')