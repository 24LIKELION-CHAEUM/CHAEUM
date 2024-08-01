from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from .models import Task, Notification
from .serializers import TaskSerializer, NotificationSerializer
from datetime import timedelta, datetime
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.permissions import IsAuthenticated



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
        # 약 개수 제한 체크
        if serializer.validated_data['type'] == 'MED':
            med_count = Task.objects.filter(type='MED', user=user).values('title').distinct().count()
            if med_count >= 3:
                raise ValidationError({"error": "약을 추가할 수 없습니다. 약은 3개까지만 등록이 가능합니다."})

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
        task.is_completed = not task.is_completed
        task.save()
        return Response({'status': 'completed updated'})


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