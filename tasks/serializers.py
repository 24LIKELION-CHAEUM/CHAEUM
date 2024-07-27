# tasks/serializers.py

from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

    # def validate(self, data):
    #     if data['task_type'] == 'MED':
    #         user = self.context['request'].user
    #         medicine_count = Task.objects.filter(user=user, task_type='MED').count()
    #         if medicine_count > 3:
    #             raise serializers.ValidationError("You can only register up to 3 medicines.")
    #     return data