document.addEventListener('DOMContentLoaded', function() {
    const inputName = document.getElementById('input_name');
    const inputDob = document.getElementById('input_dob');
    const dobError = document.getElementById('dob_error');
    const signinBtn = document.getElementById('signin_btn');
    const form = document.querySelector('form');

    // 초기 설정: 에러 메시지를 숨김
    if (dobError) {
        dobError.style.display = 'none';
    }

    function checkInputs() {
        if (!inputName || !inputDob || !signinBtn) return;

        const nameValue = inputName.value.trim();
        const dobValue = inputDob.value; // 날짜 선택기는 이미 YYYY-MM-DD 형식으로 값이 설정됨

        // 이름 확인
        const isNameValid = nameValue.length > 0;

        // 생년월일 확인
        const isDobValid = dobValue.length > 0; // 날짜 선택기가 설정되었는지 확인

        // 이름 비어있지 않고, 생년월일 유효 -> 버튼 활성화
        signinBtn.disabled = !(isNameValid && isDobValid);

        if (!isDobValid && dobValue.length > 0) {
            inputDob.classList.add('error');
            if (dobError) dobError.style.display = 'block';
        } else {
            inputDob.classList.remove('error');
            if (dobError) dobError.style.display = 'none';
        }
    }

    if (inputName) inputName.addEventListener('input', checkInputs);
    if (inputDob) inputDob.addEventListener('input', checkInputs);

    window.addEventListener('load', checkInputs);

    if (signinBtn) {
        signinBtn.addEventListener('click', function(event) {
            if (signinBtn.disabled) {
                event.preventDefault();
            } else {
                if (userType === 'senior') {
                    form.action = "{% url 'signup_complete' %}";
                } else if (userType === 'protector') {
                    form.action = "{% url 'signup_step4_protector' %}";
                }
                form.submit();
            }
        });
    }

    // 초기 체크
    checkInputs();
});
