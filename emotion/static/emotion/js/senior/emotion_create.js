document.addEventListener("DOMContentLoaded", function() {
    const plusButton = document.getElementById('plus-button');
    const modalBackdrop = document.querySelector('.modal-backdrop');
    const modal = document.getElementById('modal');
    const closeModalButton = document.querySelector('.close');
    const submitButton = document.getElementById('submit-button');
    const hourInput = document.getElementById('hour');
    const minuteInput = document.getElementById('minute');
    const reasonInput = document.getElementById('reason');
    const errorMessage = document.getElementById('error-message');
    const emotionButtons = document.querySelectorAll('.emotion-card'); // 수정된 부분
    const recordedEmotionStatus = document.getElementById('recorded-emotion-status');
    const formTimeInput = document.getElementById('time-field'); // Django form 필드를 선택
    const commentReason = document.querySelectorAll('.comment-reason');
    const moodReason = document.querySelectorAll('.mood-reason');
    const selectedDateKr = "{{ selected_date|date:'Y년 n월 j일' }}";
    const daysOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const dayOfWeekElement = document.getElementById('day-of-week');
    let selectedEmotionText = null;

    function formatDateToKR(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}년 ${month}월 ${day}일`;
    }

    if (dayOfWeekElement) {
        const date = new Date();
        const dayOfWeek = daysOfWeek[date.getDay()];
        dayOfWeekElement.textContent = dayOfWeek;
    }

    function truncateText(element, maxLength) {
        let text = element.textContent;
        if (text.length > maxLength) {
            element.textContent = text.slice(0, maxLength) + '...';
        }
    }

    moodReason.forEach(function(element) {
        truncateText(element, 19);
    });
    commentReason.forEach(function(element) {
        truncateText(element, 30);
    });

    function validateTime(hour, minute) {
        const hourValue = parseInt(hour, 10);
        const minuteValue = parseInt(minute, 10);
        const isValidHour = !isNaN(hourValue) && hourValue >= 0 && hourValue < 24;
        const isValidMinute = !isNaN(minuteValue) && minuteValue >= 0 && minuteValue < 60;
        return isValidHour && isValidMinute;
    }

    function checkTimeInput() {
        const hour = hourInput.value;
        const minute = minuteInput.value;
        if (validateTime(hour, minute)) {
            errorMessage.classList.add('hidden');
        } else {
            errorMessage.classList.remove('hidden');
        }
    }

    function isFormValid() {
        const hour = hourInput.value;
        const minute = minuteInput.value;
        const reason = reasonInput.value.trim();
        return selectedEmotionText && validateTime(hour, minute) && reason !== '';
    }

    function updateSubmitButtonState() {
        if (isFormValid()) {
            submitButton.disabled = false;
        } else {
            submitButton.disabled = true;
        }
    }

    function updateTimeField() {
        const hour = hourInput.value.padStart(2, '0');
        const minute = minuteInput.value.padStart(2, '0');
        const timeString = `${hour}:${minute}`;

        if (formTimeInput) { 
            formTimeInput.value = timeString;
            console.log('Updated time:', timeString);
        } else {
            console.error('formTimeInput element not found');
        }
    }

    hourInput.addEventListener('input', function() {
        checkTimeInput();
        updateTimeField();
        updateSubmitButtonState();
    });

    minuteInput.addEventListener('input', function() {
        checkTimeInput();
        updateTimeField();
        updateSubmitButtonState();
    });

    reasonInput.addEventListener('input', updateSubmitButtonState);

    emotionButtons.forEach(button => {
        button.addEventListener('click', function() {
            selectedEmotionText = this.querySelector('.emoji').textContent.trim();
            emotionButtons.forEach(btn => btn.classList.remove('selected')); 
            this.classList.add('selected'); 
            updateSubmitButtonState();
        });
    });

    submitButton.addEventListener('click', function(event) {
        const hour = hourInput.value;
        const minute = minuteInput.value;
        if (!validateTime(hour, minute)) {
            event.preventDefault();
            errorMessage.classList.remove('hidden');
        } else {
            recordedEmotionStatus.textContent = selectedEmotionText || '없음';
            modal.classList.remove('show');
            modalBackdrop.classList.remove('show');
            submitButton.disabled = true;
        }
    });
});