from django.contrib import admin
from .models import UserProfile, Relationship
from emotion.models import Emotion

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'user_type', 'name', 'birth_date', 'get_related_users')
    search_fields = ('user__username', 'name')

    def get_related_users(self, obj):
        if obj.user_type == 'senior':
            return ', '.join([relation.protector.user.username for relation in obj.protector_relationships.filter(pending=False)])
        elif obj.user_type == 'protector':
            return ', '.join([relation.senior.user.username for relation in obj.senior_relationships.filter(pending=False)])
        return 'None'
    
    get_related_users.short_description = 'Related Users'

@admin.register(Relationship)
class RelationshipAdmin(admin.ModelAdmin):
    list_display = ('senior', 'protector', 'relationship_type', 'pending')
    search_fields = ('senior__user__username', 'protector__user__username', 'relationship_type')

# MealTimeAdmin 클래스 주석 처리
# @admin.register(MealTime)
# class MealTimeAdmin(admin.ModelAdmin):
#     list_display = ('user', 'meal_type', 'time')
#     search_fields = ('user__username', 'meal_type')

# MedicineAdmin 클래스 주석 처리
# @admin.register(Medicine)
# class MedicineAdmin(admin.ModelAdmin):
#     list_display = ('user', 'name', 'time', 'days')
#     search_fields = ('user__username', 'name')

@admin.register(Emotion)
class EmotionAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'emotion', 'time', 'description')
    search_fields = ('user__username', 'emotion', 'description')
