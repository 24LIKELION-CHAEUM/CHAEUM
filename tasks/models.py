from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

def get_current_date():
    return timezone.now().date()

# Create your models here.
class Task(models.Model):
    TYPE_CHOICES = [
        ('MED', 'Medication'),
        ('MEAL', 'Meal'),
        ('TASK', 'Task'),
    ]

    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    type = models.CharField(max_length=4, choices=TYPE_CHOICES, null=False)
    time = models.TimeField()
    date = models.DateField(default=get_current_date)
    repeat_days = models.JSONField(default=list, blank=True, null=True)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class Notification(models.Model):
    TYPE_CHOICES = [
        ('MED', 'Medication'),
        ('MEAL', 'Meal'),
        ('TASK', 'Task'),
    ]
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    type = models.CharField(max_length=4, choices=TYPE_CHOICES, null=False)
    notify_time = models.TimeField()
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Notification for {self.task.title} at {self.notify_time}"