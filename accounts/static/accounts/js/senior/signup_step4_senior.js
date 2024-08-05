document.addEventListener("DOMContentLoaded", function() {
    // 각 option 요소 선택
    const optionElements = document.querySelectorAll('.option');
    const signinButton = document.getElementById('signin_btn');

    // 각 option 요소에 클릭 이벤트 리스너 추가
    optionElements.forEach(option => {
        option.addEventListener('click', function() {
            // data-href 속성 값으로 페이지 이동
            const href = this.getAttribute('data-href');
            if (href) {
                window.location.href = href;
            }
        });
    });

    // 회원가입 완료 버튼 활성화/비활성화 함수
    function checkRegistrationCompletion() {
        const allMealsRegistered = localStorage.getItem('allMealsRegistered') === 'true';
        const medicationRegistered = localStorage.getItem('medicationRegistered') === 'true';

        if (allMealsRegistered && medicationRegistered) {
            signinButton.disabled = false;
        } else {
            signinButton.disabled = true;
        }
    }

    // 초기 체크
    checkRegistrationCompletion();

    // 등록 상태가 변경될 때마다 체크
    window.addEventListener('storage', checkRegistrationCompletion);

    signinButton.addEventListener('click', function(event) {
        // 페이지 이동 전에 localStorage 초기화
        localStorage.setItem('allMealsRegistered', 'false');
        localStorage.setItem('medicationRegistered', 'false');
    });
});