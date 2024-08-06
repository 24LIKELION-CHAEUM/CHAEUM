// 입력 필드와 버튼을 변수에 저장
const inputId = document.querySelector('.input_id');
const inputPassword = document.querySelector('.input_password');
const signinBtn = document.getElementById('signin_btn'); // id로 선택

// 입력 필드의 값이 변경될 때 호출되는 함수
function validateInputs() {
    // 두 입력 필드의 값이 모두 비어 있지 않으면 버튼 활성화
    if (inputId.value.trim() !== '' && inputPassword.value.trim() !== '') {
        signinBtn.disabled = false; // 버튼 활성화
    } else {
        signinBtn.disabled = true; // 버튼 비활성화
    }
}

// 입력 필드에 이벤트 리스너 추가
inputId.addEventListener('input', validateInputs);
inputPassword.addEventListener('input', validateInputs);

// 로그인 폼의 동작을 처리하는 코드
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    var formData = new FormData(this);

    fetch('/login/', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 토큰 저장
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            // 로그인 성공 알림 및 리다이렉트
            alert('Login successful');
            window.location.href = data.redirect_url;
        } else {
            // 로그인 실패 시 오류 메시지 표시
            alert('Login failed: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during login. Please try again.');
    });
});

// 인증된 요청을 만드는 함수 (예시)
function makeAuthenticatedRequest() {
    var accessToken = localStorage.getItem('access_token');

    fetch('/some-protected-endpoint/', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    });
}
