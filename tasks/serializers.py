# tasks/serializers.py

from rest_framework import serializers
from .models import Task, Notification

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['user']

    def validate(self, data):
        user = self.context['request'].user
        if data['type'] == 'MED':
            med_count = Task.objects.filter(type='MED', user=user).values('title').distinct().count()
            if self.instance:
                med_count -= 1  # 편집 중인 약을 제외
            if med_count >= 3:
                raise serializers.ValidationError({"error": "약을 추가할 수 없습니다. 약은 3개까지만 등록이 가능합니다."})
        return data


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['user', 'task']