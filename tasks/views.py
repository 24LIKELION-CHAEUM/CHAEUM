from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer
from datetime import timedelta
from django.utils import timezone



class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        date = self.request.query_params.get('date', None)
        # queryset = queryset.filter(user=self.request.user)
        if date is not None:
            queryset = queryset.filter(date=date)
        queryset = queryset.order_by('time')
        return queryset

    @action(detail=True, methods=['patch'])
    def mark_complete(self, request, pk=None):
        task = self.get_object()
        task.completed = not task.completed
        task.save()
        return Response({'status': 'completed status updated'})
