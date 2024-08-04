from django.urls import path
from . import views

urlpatterns = [
    path('signup/step1/', views.signup_step1, name='signup_step1'),
    path('signup/step2/', views.signup_step2, name='signup_step2'),
    path('signup/step3/', views.signup_step3, name='signup_step3'),
    #path('signup/step4_senior/', views.signup_step4_senior, name='signup_step4_senior'),
    #path('signup/step4_senior/meal_time/', views.meal_time, name='meal_time'),
    #path('signup/step4_senior/meal_time_flags/', views.get_meal_time_flags, name='meal_time_flags'), 
    #path('signup/step4_senior/medicine_register/', views.medicine_register, name='medicine_register'),
    #path('signup/step4_senior/save_medicine/', views.save_medicine, name='save_medicine'),
    path('signup/step4_protector/', views.signup_step4_protector, name='signup_step4_protector'),
    path('signup/complete/', views.signup_complete, name='signup_complete'),
    path('clear_signup_session/', views.clear_signup_session, name='clear_signup_session'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('', views.main, name='main'),
    path('accounts/protector/home_protector/', views.home_protector, name='home_protector'),
    path('accounts/senior/home_senior/', views.home_senior, name='home_senior'),
    path('profile/', views.profile, name='profile'),
    path('profile/change/', views.profile_change, name='profile_change'),
    path('accept_protector_request/', views.accept_protector_request, name='accept_protector_request'),
    path('remove_connection/', views.remove_connection, name='remove_connection'),
]
