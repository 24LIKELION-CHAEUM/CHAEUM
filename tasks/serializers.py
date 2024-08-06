# tasks/serializers.py

from rest_framework import serializers
from .models import Task, Notification

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['user']

    def get_med_count(self, instance):
        user = self.context['request'].user
        med_count = Task.objects.filter(type='MED', user=user).values('title').distinct().count()
        if instance:
            med_count -= 1  # 편집 중인 약을 제외
        return med_count

    def get_mealtime(self, instance):
        if instance.type == 'MEAL':
            if instance.title == "아침":
                return "아침"
            elif instance.title == "점심":
                return "점심"
            elif instance.title == "저녁":
                return "저녁"
        return None

    def validate(self, data):
        user = self.context['request'].user
        if data['type'] == 'MED':
            med_count = Task.objects.filter(type='MED', user=user).values('title').distinct().count()
            if self.instance:
                med_count -= 1  # 편집 중인 약을 제외
            if med_count >= 3:
                raise serializers.ValidationError({"error": "약을 추가할 수 없습니다. 약은 3개까지만 등록이 가능합니다."})
        return data

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.type == 'MED':
            representation['med_count'] = self.get_med_count(instance)
        if instance.type == 'MEAL':
            mealtime = self.get_mealtime(instance)
            if mealtime:
                representation['mealtime'] = mealtime
        return representation


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['user', 'task']