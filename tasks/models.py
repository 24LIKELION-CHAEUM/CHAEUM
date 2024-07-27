from django.db import models
# from django.contrib.auth import get_user_model
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

    # user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    time = models.TimeField()
    completed = models.BooleanField(default=False)
    type = models.CharField(max_length=4, choices=TYPE_CHOICES, null=False)
    date = models.DateField(default=get_current_date)
    repeat_days = models.JSONField(default=dict, blank=True, null=True)

    def __str__(self):
        return self.title