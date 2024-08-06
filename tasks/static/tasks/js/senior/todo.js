document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem('access_token');

    const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];
    const today = new Date();
    const koreaTime = new Date(today.setHours(today.getHours() + 9));
    let selectedDate = koreaTime.toISOString().split('T')[0];
    const currentDay = koreaTime.getDay();
    const currentDate = koreaTime.getDate();
    const fullDate = koreaTime.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const dayOfWeek = daysOfWeek[currentDay === 0 ? 6 : currentDay - 1];
    const tasks = document.querySelectorAll('.task');
    const options = document.querySelectorAll('.option');
    const submitButton = document.getElementById('submit-button');

    const weekCalendar = document.getElementById('week-calendar');
    const plusButton = document.getElementById('plus-button');
    const modalBackdrop = document.querySelector('.modal-backdrop');
    const modal1 = document.getElementById('modal1');
    const modal2 = document.getElementById('modal2');
    const modal3 = document.getElementById('modal3');
    const modal4 = document.getElementById('modal4');
    const hourInput = document.getElementById('hour');
    const minuteInput = document.getElementById('minute');
    const submitButton3 = document.getElementById('submit-button3');
    const errorMessage = document.getElementById('error-message');
    const medicationNameInput = document.getElementById('reason');
    const medicationDays = document.querySelectorAll('.repeat-btn');
    const recordedEmotionStatus = document.getElementById('mediation-status');
    const medicationStatus = document.getElementById('medication-status');
    

    // modal2
    const hourInput2 = document.getElementById('hour2');
    const minuteInput2 = document.getElementById('minute2');
    const errorMessage2 = document.getElementById('error-message2');
    const submitButton2 = document.getElementById('submit-button2');
    const taskNameInput2 = document.getElementById('reason2');
    const taskDays = document.querySelectorAll('.repeat-btn2');

    //modal4
    const mealSelect = document.getElementById('meal-select');
    const mealStatus = document.getElementById('meal-status');
    const hourInput3 = document.getElementById('hour3');
    const minuteInput3 = document.getElementById('minute3');
    const errorMessage3 = document.getElementById('error-message3');
    const submitButton4 = document.getElementById('submit-button4');
    const taskNameInput3 = document.getElementById('reason3');


    const taskForm = document.getElementById('task-form');
    const taskTitleInput = document.getElementById('task-title');
    const taskTimeInput = document.getElementById('task-time');
    const taskTypeSelect = document.getElementById('task-type');
    const repeatDaysInputs = document.querySelectorAll('#repeat-days input[type="checkbox"]');

    let selectedOption = null; // 현재 선택된 옵션 저장 변수
    let medicationCount = 0; // 등록된 약물 개수 저장 변수
    let mealTimes = []; // 식사 시간 저장 배열

    // 현재 날짜 정보와 주간 날짜 생성
    function calculateWeekDates() {
        const startDate = new Date(koreaTime);
        startDate.setDate(currentDate - (currentDay === 0 ? 6 : currentDay - 1));

        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            weekDates.push({
                day: daysOfWeek[(startDate.getDay() + i - 1) % 7],
                date: date.getDate(),
                fullDate: date.toLocaleDateString('en-CA') // fullDate 추가
            });
        }
        return weekDates;
    }

    // 주간 달력 표시
    function displayWeekCalendar() {
        const weekDates = calculateWeekDates();
        if (weekCalendar) {
            weekCalendar.innerHTML = weekDates.map(({ day, date, fullDate }, index) => `
            <div class="day ${index === (currentDay === 0 ? 6 : currentDay - 1) ? 'active' : ''}" data-full-date="${fullDate}">
                <span class="day-name">${day}</span>
                <span class="day-date">${date}</span>
            </div>
        `).join('');

            // 날짜 클릭 이벤트 리스너 추가
            const days = document.querySelectorAll('.day');
            days.forEach(day => {
                day.addEventListener('click', (event) => {
                    const selectedDate = event.currentTarget.dataset.fullDate;
                    days.forEach(d => d.classList.remove('active'));
                    event.currentTarget.classList.add('active');
                    console.log("클릭이벤트 후",selectedDate);
                    updateDateInfo(selectedDate);
                    fetchTasks(selectedDate);
                });
            });
        } else {
            console.error('weekCalendar element not found');
        }
    }

    // 선택된 날짜 정보 업데이트
    function updateDateInfo(selectedDate) {
        const selectedDateObj = new Date(selectedDate);
        const fullDate = selectedDateObj.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        const dayOfWeek = daysOfWeek[(selectedDateObj.getDay() - 1 + 7) % 7];
        const fullDateElement = document.getElementById('full-date');
        const dayOfWeekElement = document.getElementById('day-of-week');
        if (fullDateElement) fullDateElement.textContent = fullDate;
        if (dayOfWeekElement) dayOfWeekElement.textContent = `${dayOfWeek}요일`;
    }


    function formatTime(time) {
        const [hours, minutes] = time.split(':');
        const intHours = parseInt(hours, 10);
        const period = intHours < 12 ? '오전' : '오후';
        const formattedHours = intHours % 12 || 12; // 0시는 12시로 표시
        return `${period} ${formattedHours.toString().padStart(2, '0')}:${minutes}`;
    }

    // API에서 할 일 목록 가져오기
    async function fetchTasks(date) {
        const url = `http://127.0.0.1:8000/tasks?date=${date}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log(data);
            displayTasks(data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }

    // 할 일 목록 화면에 표시하기
    function displayTasks(tasks) {
        const tasksContainer = document.getElementById('tasks');
        if (!tasksContainer) {
            console.error('tasksContainer element not found');
            return;
        }
        tasksContainer.innerHTML = tasks.map(task => {
            let imageSrc;
            switch (task.type) {
                case 'MEAL':
                    imageSrc = staticUrls.riceImg;
                    break;
                case 'MED':
                    imageSrc = staticUrls.medicineImg;
                    break;
                case 'TASK':
                    imageSrc = staticUrls.taskImg;
                    break;
            }
            return `
                <div class="task" data-id="${task.id}">
                    <div class="task-icon"><img src="${imageSrc}" alt=""></div>
                    <div class="task-info">
                        <div class="task-title" style="text-decoration: ${task.is_completed ? 'line-through' : 'none'}; color: ${task.is_completed ? '#7B7B7E' : 'inherit'};">${task.title}</div>
                        <div class="task-time">${formatTime(task.time)}</div>
                    </div>
                    <div class="task-status">
                        <img src="${task.is_completed ? staticUrls.checkActivatedImg : staticUrls.checkUnactivatedImg}" alt="체크" class="check-button">
                    </div>
                </div>
            `;
        }).join('');
        addCheckButtonListeners();
    }

    // 새로운 할 일 생성하기
    async function createTask(task) {
        const url = 'http://127.0.0.1:8000/tasks/';
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(task)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Task created:', data);
            // console.log(task.date)
            fetchTasks(task.date);
            // fetchTasks(koreaTime.toISOString().split('T')[0]); // 새로 생성된 할 일 목록을 다시 가져옵니다.
        } catch (error) {
            console.error('Error creating task:', error);
        }
    }

     // 새로운 약물 생성하기
     async function createMedication(medication) {
        const url = 'http://127.0.0.1:8000/tasks/';
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(medication)
            });
            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.error) {
                    showModalWithError(errorData.error);
                }
                throw new Error(`HTTP error! status: ${response.status}`);

            }
            const data = await response.json();
            console.log('Medication created:', data);
            fetchTasks(medication.date);
            // fetchTasks(koreaTime.toISOString().split('T')[0]); // 새로 생성된 할 일 목록을 다시 가져옵니다.
            medicationCount++;
            updateMedicationCount();
        } catch (error) {
            console.error('Error creating medication:', error);
        }
    }


    //약 3개 초과 시 체크
    function showModalWithError(errorMessage) {
        const mediationStatus = document.getElementById('mediation-status');
        const recordInfo = document.querySelector('.record-info');

        mediationStatus.textContent = "3개";
        mediationStatus.style.color = 'red';
        recordInfo.style.color = 'red';
    }

    // 체크 버튼 이벤트 리스너 추가
    function addCheckButtonListeners() {
        const checkButtons = document.querySelectorAll('.check-button');
        checkButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const taskId = event.target.closest('.task').dataset.id;
                const currentStatus = event.target.closest('.task').dataset.completed === 'true';
                toggleTaskStatus(taskId, currentStatus);
            });
        });
    }

    function toggleTaskStatus(taskId, currentStatus) {
        const newStatus = !currentStatus;
        updateTaskStatus(taskId, newStatus);
    }


     //새로운 식사 생성하기
     async function createMeal(meal) {
        const url = 'http://127.0.0.1:8000/tasks/';
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(meal)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Meal created:', data);
            fetchTasks(koreaTime.toISOString().split('T')[0]); // 새로 생성된 할 일 목록을 다시 가져옵니다.
        } catch (error) {
            console.error('Error creating medication:', error);
        }
    }

    // 식사 시간을 백엔드에서 가져오기
    async function fetchMealTimes() {
        const url = 'http://127.0.0.1:8000/tasks/';
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Meals fetched:', data);
            mealTimes = data.filter(task => task.type === 'MEAL').map(meal => meal.title);
            updateMealStatus();
        } catch (error) {
            console.error('Error fetching meals:', error);
        }
    }
    // 식사 시간을 화면에 표시하기
    function updateMealStatus() {
        if (mealStatus) {
            mealStatus.textContent = mealTimes.length > 0 ? mealTimes.join(', ') : ' ';
        }
    }
    /* medication 상태를 백엔드에서 가져오기
    async function fetchMedicationStatus() {
        const url = 'http://127.0.0.1:8000/tasks/med_count/';
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Medication status fetched:', data);
            const selectedDaysCount = data.med_count === 0 ? 1 : data.med_count === 1 ? 2 : data.med_count === 2 ? 3 : 0;
            updateMedicationStatus(selectedDaysCount);
        } catch (error) {
            console.error('Error fetching medication status:', error);
        }
    }

    // medication 상태를 화면에 표시하기
    function updateMedicationStatus(count) {
        if (recordedEmotionStatus) {
            recordedEmotionStatus.textContent = `${count}회`;
        }
    }*/

    // 할 일 완료 상태 업데이트
    async function updateTaskStatus(taskId, completed) {
        const url = `http://127.0.0.1:8000/tasks/${taskId}/check_complete/`;
        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ completed })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Task status updated:', data);

            fetchTasks(selectedDate);
            addCheckButtonListeners();
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    }


    // 폼 제출 이벤트 리스너
    if (taskForm) {
        taskForm.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log("selectedDate=", selectedDate);
            const newTask = {
                title: taskTitleInput.value.trim(),
                time: taskTimeInput.value,
                completed: false,
                type: taskTypeSelect.value,
                date: selectedDate,
                repeat_days: Array.from(repeatDaysInputs).filter(input => input.checked).map(input => parseInt(input.value))
            };
            console.log(newTask.date);
            createTask(newTask);

            // 입력 필드 초기화
            taskTitleInput.value = '';
            taskTimeInput.value = '';
            taskTypeSelect.value = 'MEAL';
            repeatDaysInputs.forEach(input => input.checked = false);
        });
    }

    options.forEach(option => {
        option.addEventListener('click', function() {
            options.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedOption = this;
            submitButton.disabled = false;
        });
    });

    function resetOptionAndButton() {
        options.forEach(option => option.classList.remove('selected'));
        selectedOption = null;
        submitButton.disabled = true;
    }

    function validateTime(hour, minute) {
        const hourNum = parseInt(hour, 10);
        const minuteNum = parseInt(minute, 10);
        return !isNaN(hourNum) && hourNum >= 0 && hourNum < 24 && !isNaN(minuteNum) && minuteNum >= 0 && minuteNum < 60;
    }

    function validateMedicationForm() {
        if (!medicationNameInput || !hourInput || !minuteInput) return;

        const medicationName = medicationNameInput.value.trim();
        const hour = hourInput.value.trim();
        const minute = minuteInput.value.trim();
        const selectedDays = Array.from(medicationDays).filter(dayButton => dayButton.classList.contains('selected')).map(dayButton => daysOfWeek.indexOf(dayButton.textContent));
        const isTimeValid = validateTime(hour, minute);

        if (hour || minute) {
            if (!isTimeValid) {
                errorMessage.classList.remove('hidden');
            } else {
                errorMessage.classList.add('hidden');
            }
        } else {
            errorMessage.classList.add('hidden');
        }

        if (medicationName && hour && minute && selectedDays.length > 0 && isTimeValid && medicationCount < 4) {
            submitButton3.classList.add('enabled');
            submitButton3.classList.remove('disabled');
            submitButton3.disabled = false;
        } else {
            submitButton3.classList.remove('enabled');
            submitButton3.classList.add('disabled');
            submitButton3.disabled = true;
        }
    }

    function validateTaskForm() {
        if (!taskNameInput2 || !hourInput2 || !minuteInput2) return;

        const taskName = taskNameInput2.value.trim();
        const hour = hourInput2.value.trim();
        const minute = minuteInput2.value.trim();
        const selectedDays = Array.from(taskDays).filter(dayButton => dayButton.classList.contains('selected')).map(dayButton => daysOfWeek.indexOf(dayButton.textContent));
        const isTimeValid = validateTime(hour, minute);

        if (hour || minute) {
            if (!isTimeValid) {
                errorMessage2.classList.remove('hidden');
            } else {
                errorMessage2.classList.add('hidden');
            }
        } else {
            errorMessage2.classList.add('hidden');
        }

        if (taskName && hour && minute && selectedDays.length > 0 && isTimeValid) {
            submitButton2.classList.add('enabled');
            submitButton2.classList.remove('disabled');
            submitButton2.disabled = false;
        } else {
            submitButton2.classList.remove('enabled');
            submitButton2.classList.add('disabled');
            submitButton2.disabled = true;
        }
    }
    function validateMealForm() {
        if (!mealSelect || !hourInput3 || !minuteInput3) return;

        const selectedMeal = mealSelect.value;
        const hour = hourInput3.value.trim();
        const minute = minuteInput3.value.trim();
        const isTimeValid = validateTime(hour, minute);

        if (hour || minute) {
            if (!isTimeValid) {
                errorMessage3.classList.remove('hidden');
            } else if (!selectedMeal) {
                errorMessage3.classList.remove('hidden');
            }
            else {
                errorMessage3.classList.add('hidden');
            }
        } else {
            errorMessage3.classList.add('hidden');
        }

        if (selectedMeal && hour && minute && isTimeValid) {
            submitButton4.classList.add('enabled');
            submitButton4.classList.remove('disabled');
            submitButton4.disabled = false;
        } else {
            submitButton4.classList.remove('enabled');
            submitButton4.classList.add('disabled');
            submitButton4.disabled = true;
        }
    }

    function updateRecordedEmotionStatus() {
        const selectedDaysCount = Array.from(medicationDays).filter(dayButton => dayButton.classList.contains('selected')).length;
        const statusText = selectedDaysCount > 0 ? `${selectedDaysCount}회` : '없음';
        if (recordedEmotionStatus) recordedEmotionStatus.textContent = statusText;
        medicationCount = selectedDaysCount;
        updateMedicationCount();
    }

    function updateMedicationCount() {
        if (medicationStatus) {
            medicationStatus.textContent = `${medicationCount}/3`;
        }
        if (medicationCount >= 3) {
            submitButton3.disabled = true;
            submitButton3.classList.remove('enabled');
            submitButton3.classList.add('disabled');
        } else {
            validateMedicationForm();
        }
    }
 
    function openModal(modal) {
        const modals = [modal1, modal2, modal3, modal4];
        modals.forEach(m => m.classList.remove('show'));

        if (modal) {
            modal.classList.add('show');
            modalBackdrop.classList.add('show');
        }
    }

    function closeModal() {
        modal1.classList.remove('show');
        modal2.classList.remove('show');
        modal3.classList.remove('show');
        modal4.classList.remove('show');
        modalBackdrop.classList.remove('show');
        resetOptionAndButton();
    }

    function handleSubmit() {
        if (!submitButton.disabled && selectedOption) {
            const optionText = selectedOption.querySelector('.option-title').textContent;

            if (optionText === "투약할 약 추가하기") {
                openModal(modal3);
            } else if (optionText === "다른 할 일 추가하기") {
                openModal(modal2);
            } else if (optionText === "식사 시간 등록하기") {
                openModal(modal4);
            }

            
            modal1.classList.remove('show');
        }
    }

    if (plusButton) {
        plusButton.addEventListener('click', () => openModal(modal1));
    }

    const closeModalButtons = document.querySelectorAll('.close');
    closeModalButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    if (submitButton) {
        submitButton.addEventListener('click', handleSubmit);
    }

    if (medicationNameInput && hourInput && minuteInput) {
        [medicationNameInput, hourInput, minuteInput].forEach(input => {
            input.addEventListener('input', validateMedicationForm);
        });
    }

    if (medicationDays) {
        medicationDays.forEach(dayButton => {
            dayButton.addEventListener('click', () => {
                dayButton.classList.toggle('selected');
                validateMedicationForm();
            });
        });
    }

    if (taskNameInput2 && hourInput2 && minuteInput2) {
        [taskNameInput2, hourInput2, minuteInput2].forEach(input => {
            input.addEventListener('input', validateTaskForm);
        });
    }

    if (mealSelect && hourInput3 && minuteInput3) {
        [mealSelect, hourInput3, minuteInput3].forEach(input => {
            input.addEventListener('input', validateMealForm);
        });
    }

    if (taskDays) {
        taskDays.forEach(dayButton => {
            dayButton.addEventListener('click', () => {
                dayButton.classList.toggle('selected');
                validateTaskForm();
            });
        });
    }

    if (submitButton3) {
        submitButton3.addEventListener('click', () => {
            if (!submitButton3.disabled) {
                const medication = {
                    title: medicationNameInput.value.trim(),
                    time: `${hourInput.value.trim()}:${minuteInput.value.trim()}`,
                    completed: false,
                    type: 'MED',
                    date: selectedDate,
                    repeat_days: Array.from(medicationDays).filter(dayButton => dayButton.classList.contains('selected')).map(dayButton => daysOfWeek.indexOf(dayButton.textContent))
                };

                createMedication(medication);

                updateRecordedEmotionStatus();

                medicationNameInput.value = '';
                hourInput.value = '';
                minuteInput.value = '';
                medicationDays.forEach(dayButton => dayButton.classList.remove('selected'));
                validateMedicationForm();
            }
        });
    }

    if (submitButton2) {
        submitButton2.addEventListener('click', () => {
            if (!submitButton2.disabled) {
                const newTask = {
                    title: taskNameInput2.value.trim(),
                    time: `${hourInput2.value.trim()}:${minuteInput2.value.trim()}`,
                    completed: false,
                    type: 'TASK',
                    date: selectedDate,
                    repeat_days: Array.from(taskDays).filter(dayButton => dayButton.classList.contains('selected')).map(dayButton => daysOfWeek.indexOf(dayButton.textContent))
                };

                createTask(newTask);

                taskNameInput2.value = '';
                hourInput2.value = '';
                minuteInput2.value = '';
                taskDays.forEach(dayButton => dayButton.classList.remove('selected'));
                validateTaskForm();
            }
        });
    }

    if (submitButton4) {
        submitButton4.addEventListener('click', () => {
            if (!submitButton4.disabled) {
                const selectedMeal = mealSelect.value;
                const meal = {
                    title: selectedMeal,
                    time: `${hourInput3.value.trim()}:${minuteInput3.value.trim()}`,
                    completed: false,
                    type: 'MEAL',
                };

                createMeal(meal);

                taskNameInput3.value = '';
                hourInput3.value = '';
                minuteInput3.value = '';
                validateMealForm();
                
            }
        });
    }

       

    displayWeekCalendar();
    const fullDateElement = document.getElementById('full-date');
    const dayOfWeekElement = document.getElementById('day-of-week');
    if (fullDateElement) fullDateElement.textContent = fullDate;
    if (dayOfWeekElement) dayOfWeekElement.textContent = `${dayOfWeek}요일`;


    const initialDate = koreaTime.toISOString().split('T')[0];
    updateDateInfo(selectedDate);
    fetchTasks(selectedDate);
    fetchMealTimes(); // 페이지 로드 시 식사 시간 가져오기
    updateMedicationCount();
});

   