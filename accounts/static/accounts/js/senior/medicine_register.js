document.addEventListener("DOMContentLoaded", function() {
    // HTML 요소 선택
    const hourInput = document.getElementById('hour');
    const minuteInput = document.getElementById('minute');
    const submitButton2 = document.getElementById('submit-button2');
    const errorMessage = document.getElementById('error-message');
    const medicationNameInput = document.getElementById('reason');
    const medicationDays = document.querySelectorAll('.emotion-btn');
    const recordedEmotionStatus = document.getElementById('recorded-emotion-status');
    const span1 = document.querySelector('.span1'); // 문구를 변경할 요소

    // 유효성 검사
    function validateTime(hour, minute) {
        const hourNum = parseInt(hour, 10);
        const minuteNum = parseInt(minute, 10);
        return !isNaN(hourNum) && hourNum >= 0 && hourNum < 24 && !isNaN(minuteNum) && minuteNum >= 0 && minuteNum < 60;
    }

    function validateMedicationForm() {
        const medicationName = medicationNameInput.value.trim();
        const hour = hourInput.value.trim();
        const minute = minuteInput.value.trim();
        const selectedDays = Array.from(medicationDays).filter(dayButton => dayButton.classList.contains('selected')).length;
        const isTimeValid = validateTime(hour, minute);

        // 시간 유효성 검사
        if (hour || minute) {
            if (!isTimeValid) {
                errorMessage.classList.remove('hidden');
            } else {
                errorMessage.classList.add('hidden');
            }
        } else {
            errorMessage.classList.add('hidden');
        }

        // 버튼 활성화 조건 검사
        if (medicationName && hour && minute && selectedDays > 0 && isTimeValid) {
            submitButton2.classList.add('enabled');
            submitButton2.classList.remove('disabled');
            submitButton2.disabled = false;
        } else {
            submitButton2.classList.remove('enabled');
            submitButton2.classList.add('disabled');
            submitButton2.disabled = true;
        }
    }

    function updateRecordedEmotionStatus() {
        const selectedDaysCount = Array.from(medicationDays).filter(dayButton => dayButton.classList.contains('selected')).length;
        const statusText = selectedDaysCount > 0 ? `${selectedDaysCount}회` : '없음';
        recordedEmotionStatus.textContent = statusText;
    }

    // 버튼 클릭 시 동작 처리
    medicationDays.forEach(dayButton => {
        dayButton.addEventListener('click', () => {
            dayButton.classList.toggle('selected');
            validateMedicationForm();
        });
    });

    // 입력 필드 변경 시 동작 처리
    [medicationNameInput, hourInput, minuteInput].forEach(input => {
        input.addEventListener('input', validateMedicationForm);
    });

    submitButton2.addEventListener('click', () => {
        if (!submitButton2.disabled) {
            updateRecordedEmotionStatus();
            
            // 등록 후 문구 변경
            span1.textContent = '💊 등록된 투약 시간';

            // 입력 필드 및 버튼 초기화
            medicationNameInput.value = '';
            hourInput.value = '';
            minuteInput.value = '';
            medicationDays.forEach(dayButton => dayButton.classList.remove('selected'));
            validateMedicationForm();

            localStorage.setItem('medicationRegistered', 'true');
        }
    });

    // 초기화
    function displayWeekCalendar() {
        // 여기에 주간 캘린더 표시 로직을 추가합니다.
    }

    const fullDate = new Date().toLocaleDateString(); // 적절한 날짜 형식으로 수정 필요
    const dayOfWeek = new Date().toLocaleDateString('ko-KR', { weekday: 'long' }); // 적절한 요일 형식으로 수정 필요

    displayWeekCalendar();
    document.getElementById('full-date').textContent = fullDate;
    document.getElementById('day-of-week').textContent = `${dayOfWeek}요일`;
});