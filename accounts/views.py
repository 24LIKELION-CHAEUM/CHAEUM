from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponseRedirect
from django.contrib.auth import login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.models import User
from django.db import IntegrityError, transaction
from django.views.decorators.csrf import csrf_protect
from django.urls import reverse
from .forms import UserTypeForm, CustomUserCreationForm, UserProfileForm
from .models import UserProfile, Relationship
from datetime import datetime
from rest_framework_simplejwt.tokens import RefreshToken

def home(request):
    return render(request, 'accounts/home.html')

def home_protector(request):
    user_profile = UserProfile.objects.get(user=request.user)
    days_since_signup = (datetime.now().date() - user_profile.created_at.date()).days
    return render(request, 'accounts/protector/home_protector.html', {'days_since_signup': days_since_signup})

def home_senior(request):
    user_profile = UserProfile.objects.get(user=request.user)
    days_since_signup = (datetime.now().date() - user_profile.created_at.date()).days
    return render(request, 'accounts/senior/home_senior.html', {'days_since_signup': days_since_signup})

def main(request):
    return render(request, 'accounts/main.html')

def tip(request):
    return render(request, 'accounts/protector/tip.html')

@login_required
def profile(request):
    user_profile = UserProfile.objects.get(user=request.user)
    pending_requests = Relationship.objects.filter(senior=user_profile, pending=True) if user_profile.user_type == 'senior' else None
    seniors = user_profile.seniors if user_profile.user_type == 'protector' else None
    protectors = user_profile.protectors if user_profile.user_type == 'senior' else None
    return render(request, 'accounts/profile.html', {
        'user_profile': user_profile,
        'pending_requests': pending_requests,
        'seniors': seniors,
        'protectors': protectors
    })

@login_required
def profile_change(request):
    user_profile = UserProfile.objects.get(user=request.user)

    if request.method == 'POST':
        form = UserProfileForm(request.POST, request.FILES, instance=user_profile)
        if form.is_valid():
            form.save()
            return redirect('profile')
    else:
        form = UserProfileForm(instance=user_profile)

    return render(request, 'accounts/profile_change.html', {'form': form, 'user_profile': user_profile})

@login_required
@csrf_protect
def accept_protector_request(request):
    if request.method == 'POST':
        protector_id = request.POST.get('protector_id')
        user_profile = get_object_or_404(UserProfile, user=request.user)
        try:
            protector_profile = UserProfile.objects.get(user__id=protector_id)
            relationship = Relationship.objects.get(senior=user_profile, protector=protector_profile, pending=True)
            
            if 'accept' in request.POST:
                relationship_type = request.POST.get('relationship', '기타')  # 기본 값으로 '기타' 사용
                relationship.relationship_type = relationship_type
                relationship.pending = False
                relationship.save()
            elif 'reject' in request.POST:
                relationship.delete()
            return redirect('profile')
        except Relationship.DoesNotExist:
            return redirect('profile')
    return redirect('profile')

@csrf_protect
@login_required
def remove_connection(request):
    if request.method == 'POST':
        # 요청에서 삭제할 관계의 사용자 ID를 가져옴
        user_id = request.POST.get('user_id')
        current_user_profile = UserProfile.objects.get(user=request.user)

        try:
            # 삭제할 사용자 프로필을 찾음
            other_user_profile = UserProfile.objects.get(user__id=user_id)

            if current_user_profile.user_type == 'senior':
                # 현재 사용자가 시니어인 경우, 보호자와의 관계를 삭제
                relationship = Relationship.objects.get(senior=current_user_profile, protector=other_user_profile)
            elif current_user_profile.user_type == 'protector':
                # 현재 사용자가 보호자인 경우, 시니어와의 관계를 삭제
                relationship = Relationship.objects.get(senior=other_user_profile, protector=current_user_profile)
            else:
                return JsonResponse({'error': '잘못된 사용자 유형입니다.'}, status=400)

            # 관계 삭제
            relationship.delete()
            return HttpResponseRedirect('/accounts/profile/')  # 프로필 페이지로 리디렉션

        except UserProfile.DoesNotExist:
            return JsonResponse({'error': '해당 사용자를 찾을 수 없습니다.'}, status=404)
        except Relationship.DoesNotExist:
            return JsonResponse({'error': '해당 관계를 찾을 수 없습니다.'}, status=404)
    return JsonResponse({'error': '잘못된 요청입니다.'}, status=400)

def signup_step1(request):
    if request.method == 'POST':
        form = UserTypeForm(request.POST)
        if form.is_valid():
            request.session['user_type'] = form.cleaned_data['user_type']
            return redirect('signup_step2')
    else:
        form = UserTypeForm()
    return render(request, 'accounts/signup_step1.html', {'form': form})

def signup_step2(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            request.session['username'] = form.cleaned_data['username']
            request.session['password'] = form.cleaned_data['password']
            return redirect('signup_step3')
    else:
        form = CustomUserCreationForm()
    return render(request, 'accounts/signup_step2.html', {'form': form})

def signup_step3(request):
    if 'user_type' not in request.session or 'username' not in request.session or 'password' not in request.session:
        return redirect('signup_step1')

    user_type = request.session['user_type']

    if request.method == 'POST':
        form = UserProfileForm(request.POST)
        if form.is_valid():
            request.session['name'] = form.cleaned_data['name']
            request.session['birth_date'] = str(form.cleaned_data['birth_date'])
            if user_type == 'senior':
                # 시니어인 경우 즉시 회원가입 완료
                return redirect('signup_complete')
            elif user_type == 'protector':
                return redirect('signup_step4_protector')
    else:
        form = UserProfileForm()
    return render(request, 'accounts/signup_step3.html', {'form': form, 'user_type': user_type})


# def signup_step4_senior(request):
#     if 'user_type' not in request.session or request.session.get('user_type') != 'senior':
#         return redirect('signup_step1')

#     meal_times = request.session.get('meal_times', [])
#     meal_time_flags = {
#         'breakfast': any(mt['meal_type'] == 'breakfast' for mt in meal_times),
#         'lunch': any(mt['meal_type'] == 'lunch' for mt in meal_times),
#         'dinner': any(mt['meal_type'] == 'dinner' for mt in meal_times),
#     }
#     all_meal_times_set = all(meal_time_flags.values())
#     return render(request, 'accounts/senior/signup_step4_senior.html', {
#         'meal_time_flags': meal_time_flags,
#         'all_meal_times_set': all_meal_times_set,
#     })

# def meal_time(request):
#     if 'user_type' not in request.session or request.session.get('user_type') != 'senior':
#         return redirect('home')

#     if request.method == 'POST':
#         form = MealTimeForm(request.POST)
#         if form.is_valid():
#             meal_type = form.cleaned_data['meal_type']
#             time = form.cleaned_data['time'].strftime('%H:%M:%S')  
#             meal_times = request.session.get('meal_times', [])
#             meal_times = [mt for mt in meal_times if mt['meal_type'] != meal_type]  
#             meal_times.append({'meal_type': meal_type, 'time': time})
#             request.session['meal_times'] = meal_times
#             return JsonResponse({'success': True})
#         else:
#             return JsonResponse({'success': False})
#     else:
#         form = MealTimeForm()

#     meal_times = request.session.get('meal_times', [])
#     meal_time_flags = {
#         'breakfast': any(mt['meal_type'] == 'breakfast' for mt in meal_times),
#         'lunch': any(mt['meal_type'] == 'lunch' for mt in meal_times),
#         'dinner': any(mt['meal_type'] == 'dinner' for mt in meal_times),
#     }
#     return render(request, 'accounts/senior/meal_time.html', {'form': form, 'meal_time_flags': meal_time_flags})

# def get_meal_time_flags(request):
#     meal_times = request.session.get('meal_times', [])
#     meal_time_flags = {
#         'breakfast': any(mt['meal_type'] == 'breakfast' for mt in meal_times),
#         'lunch': any(mt['meal_type'] == 'lunch' for mt in meal_times),
#         'dinner': any(mt['meal_type'] == 'dinner' for mt in meal_times),
#     }
#     return JsonResponse(meal_time_flags)

# def medicine_register(request):
#     return render(request, 'accounts/senior/medicine_register.html')

# def save_medicine(request):
#     if request.method == 'POST':
#         form = MedicineForm(request.POST)
#         if form.is_valid():
#             medicine_data = {
#                 'name': form.cleaned_data['name'],
#                 'time': form.cleaned_data['time'].strftime('%H:%M:%S'), 
#                 'days': form.cleaned_data['days']
#             }
#             medicines = request.session.get('medicines', [])
#             medicines.append(medicine_data)
#             request.session['medicines'] = medicines
#             return JsonResponse({'success': True})
#         else:
#             errors = form.errors.as_json()
#             return JsonResponse({'success': False, 'errors': errors})
#     return JsonResponse({'success': False})

def signup_step4_protector(request):
    if 'user_type' not in request.session or request.session.get('user_type') != 'protector':
        return redirect('signup_step1')

    error = None
    senior_user = None

    if request.method == 'POST':
        if 'search' in request.POST:
            senior_username = request.POST.get('senior_username')
            try:
                senior_user = User.objects.get(username=senior_username, userprofile__user_type='senior')
            except User.DoesNotExist:
                error = '해당 아이디를 가진 시니어가 없습니다.'
        elif 'select' in request.POST:
            senior_id = request.POST.get('selected_senior_id')
            relationship = request.POST.get('relationship')
            
            if senior_id and relationship:
                request.session['senior_id'] = senior_id
                request.session['relationship'] = relationship
                
                # 다음 단계로 이동
                return redirect('signup_complete')
            else:
                error = '시니어와 관계를 모두 선택해야 합니다.'

    return render(request, 'accounts/protector/signup_step4_protector.html', {
        'senior_user': senior_user,
        'error': error
    })

@csrf_protect
def signup_complete(request):
    try:
        user_type = request.session.get('user_type')

        if user_type == 'protector':
            senior_id = request.session.get('senior_id')
            relationship = request.session.get('relationship')  # 수정된 부분
            data = {
                'username': request.session.get('username'),
                'password': request.session.get('password'),
                'name': request.session.get('name'),
                'birth_date': request.session.get('birth_date'),
            }
            if not relationship:
                return JsonResponse({'success': False, 'error': 'relationship not set'})
        else:
            data = {
                'username': request.session.get('username'),
                'password': request.session.get('password'),
                'name': request.session.get('name'),
                'birth_date': request.session.get('birth_date'),
            }

        with transaction.atomic():
            user = User.objects.create_user(
                username=data['username'],
                password=data['password']
            )

            user_profile = UserProfile.objects.create(
                user=user,
                user_type=user_type,
                name=data['name'],
                birth_date=data['birth_date'],
            )

            if user_type == 'protector':
                senior_user = User.objects.get(id=senior_id)
                senior_profile = UserProfile.objects.get(user=senior_user)
                Relationship.objects.create(
                    senior=senior_profile,
                    protector=user_profile,
                    relationship_type=relationship,
                    pending=True
                )

            # 시니어 회원가입 (step4부터 삭제)

            auth_login(request, user)
            clear_signup_session(request)
            # 리다이렉트로 수정
            return redirect('main')
    except IntegrityError as e:
        return JsonResponse({'success': False, 'error': f'IntegrityError: {str(e)}'})
    except User.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'User does not exist'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

def clear_signup_session(request):
    request.session.pop('username', None)
    request.session.pop('password', None)
    request.session.pop('name', None)
    request.session.pop('birth_date', None)
    request.session.pop('user_type', None)
    request.session.pop('meal_times', None)
    request.session.pop('medicines', None)
    request.session.pop('senior_id', None)
    request.session.pop('relationship', None)

def login(request):
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            auth_login(request, user)
            
            # JWT 토큰 생성
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # 사용자 타입에 따른 리다이렉트 URL 결정
            user_profile = UserProfile.objects.get(user=user)
            if user_profile.user_type == 'senior':
                redirect_url = reverse('home_senior')  # 시니어 홈 페이지 URL 이름
            elif user_profile.user_type == 'protector':
                redirect_url = reverse('home_protector')  # 보호자 홈 페이지 URL 이름
            else:
                redirect_url = reverse('main')  # 기본 홈 페이지 URL 이름

            # JSON 응답으로 토큰과 리다이렉트 URL 반환
            return JsonResponse({
                'success': True,
                'access_token': access_token,
                'refresh_token': refresh_token,
                'redirect_url': redirect_url
            })
        else:
            return JsonResponse({'success': False, 'error': 'Invalid credentials'})

    else:
        form = AuthenticationForm()
    return render(request, 'accounts/login.html', {'form': form})

@csrf_protect
def logout(request):
    if request.method == 'POST':
        auth_logout(request)
        return JsonResponse({'success': True, 'message': 'Logged out successfully'})
    return render(request, 'accounts/logout.html')
