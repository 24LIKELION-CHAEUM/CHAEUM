from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from .models import Task, Notification
from accounts.models import UserProfile, Relationship
from .serializers import TaskSerializer, NotificationSerializer
from datetime import timedelta, datetime
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import render

from django.shortcuts import render

def todolist(request):
    return render(request, 'tasks/senior/todo.html')
def alarmlist(request):
    return render(request, 'tasks/senior/alarm.html')
def senior_welfare(request):
    return render(request, 'tasks/senior/welfare.html')

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        date = self.request.query_params.get('date', None)
        queryset = queryset.filter(user=self.request.user)
        if date is not None:
            queryset = queryset.filter(date=date)
        queryset = queryset.order_by('time')
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        task = serializer.save(user=user)  # user=user

        # 반복요일 설정
        if task.repeat_days:
            current_date = task.date

            for week in range(4):   #한달 반복
                for day in task.repeat_days:
                    day_diff = (day - current_date.weekday() + 7) % 7
                    if day_diff == 0 and week == 0:
                        continue  # 첫 주의 현재 요일은 건너뜀
                    Task.objects.create(
                        user=user,
                        title=task.title,
                        time=task.time,
                        is_completed=task.is_completed,
                        type=task.type,
                        date=current_date + timedelta(days=day_diff + week * 7),
                        repeat_days=task.repeat_days
                    )


    @action(detail=True, methods=['patch'])
    def check_complete(self, request, pk=None):
        task = self.get_object()
        task.is_completed = True
        task.save()
        return Response({'status': 'completed updated'})

    @action(detail=False, methods=['get'])
    def senior_tasks(self, request):
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.user_type != 'protector':
            return Response({"error": "시니어의 할 일을 조회할 수 있는 권한이 없습니다."}, status=status.HTTP_403_FORBIDDEN)

        today = timezone.localtime().date()
        relationships = Relationship.objects.filter(protector=user_profile, pending=False)
        senior_tasks = Task.objects.filter(user__userprofile__in=[rel.senior for rel in relationships], date=today)

        serializer = self.get_serializer(senior_tasks, many=True)
        return Response(serializer.data)


@receiver(post_save, sender=Task)
def create_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.user,
            task=instance,
            title=instance.title,
            type=instance.type,
            notify_time=instance.time
        )

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        today = timezone.localtime().date()
        now = timezone.localtime().time()
        # 오늘 날짜의 알림 중 현재 시간보다 전인 것만 조회
        queryset = queryset.filter(user=self.request.user, task__date=today, notify_time__lte=now)
        return queryset.order_by('notify_time')

    @action(detail=True, methods=['patch'])
    def check_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response({'status': 'completed updated'})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        today = timezone.localtime().date()
        now = timezone.localtime().time()
        unread_count = Notification.objects.filter(user=self.request.user, is_read=False, task__date=today, notify_time__lte=now).count()
        return Response({'unread_count': unread_count})