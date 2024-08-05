document.addEventListener("DOMContentLoaded", function() {

    const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];
    const today = new Date();
    const currentDay = today.getDay(); // 0 (일요일)부터 6 (토요일)까지의 숫자
    const currentDate = today.getDate();
    const fullDate = today.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const dayOfWeek = daysOfWeek[(currentDay + 6) % 7]; // 일요일을 월요일로 맞추기

    const weekCalendar = document.getElementById('week-calendar');
    const taskList = document.querySelector('.tasks');
    const plusButton = document.getElementById('plus-button');
    const modalBackdrop = document.querySelector('.modal-backdrop');
    const modal2 = document.getElementById('modal2');
    const hourInput2 = document.getElementById('hour2');
    const minuteInput2 = document.getElementById('minute2');
    const errorMessage2 = document.getElementById('error-message2');
    const submitButton2 = document.getElementById('submit-button2');
    const taskNameInput2 = document.getElementById('reason2');
    const taskDays = document.querySelectorAll('.repeat-btn');

    // Fetch tasks from API
    async function fetchTasks() {
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch('http://127.0.0.1:8000/tasks/', {
                headers: {
                    'Authorization': 'Bearer <token>'
                }
            });
            if (response.ok) {
                const data = await response.json();
                displayTasks(data);
            } else {
                handleError(response.status);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }

    // Display tasks
    function displayTasks(tasks) {
        taskList.innerHTML = tasks.map(task => `
            <div class="task ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-icon"><img src="/assets/default.png" alt=""></div>
                <div class="task-info">
                    <div class="task-title">${task.title}</div>
                    <div class="task-time">${task.time}</div>
                </div>
                <div class="task-status">
                    <img src="/assets/check_unactivated.svg" alt="체크" data-completed="${task.completed}">
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.task-status img').forEach(img => {
            img.addEventListener('click', toggleTaskCompletion);
        });
    }

    // Toggle task completion
    function toggleTaskCompletion(event) {
        const taskElement = event.target.closest('.task');
        const taskId = taskElement.dataset.id;
        const isCompleted = event.target.dataset.completed === 'true';

        // Toggle UI
        taskElement.classList.toggle('completed');
        event.target.dataset.completed = !isCompleted;

        // Update server (assuming there's an endpoint for this)
        fetch(`http://127.0.0.1:8000/senior_tasks/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer <token>'
            },
            body: JSON.stringify({ completed: !isCompleted })
        }).catch(error => console.error('Error updating task:', error));
    }

    // Handle errors
    function handleError(status) {
        if (status === 403) {
            alert('시니어의 할 일을 조회할 수 있는 권한이 없습니다.');
        } else {
            alert('할 일을 불러오는 데 오류가 발생했습니다.');
        }
    }

    // Call the fetchTasks function on page load
    fetchTasks();

    // Modal open/close
    plusButton.addEventListener('click', () => openModal(modal2));

    function openModal(modal) {
        modal.classList.add('show');
        modalBackdrop.classList.add('show');
    }

    function closeModal() {
        modal2.classList.remove('show');
        modalBackdrop.classList.remove('show');
    }

    const closeModalButtons = document.querySelectorAll('.close');
    closeModalButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    // Task form validation
    function validateTaskForm() {
        const taskName = taskNameInput2.value.trim();
        const hour = hourInput2.value.trim();
        const minute = minuteInput2.value.trim();
        const selectedDays = Array.from(taskDays).filter(dayButton => dayButton.classList.contains('selected')).length;
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

        if (taskName && hour && minute && selectedDays > 0 && isTimeValid) {
            submitButton2.classList.add('enabled');
            submitButton2.classList.remove('disabled');
            submitButton2.disabled = false;
        } else {
            submitButton2.classList.remove('enabled');
            submitButton2.classList.add('disabled');
            submitButton2.disabled = true;
        }
    }

    function validateTime(hour, minute) {
        const hourNum = parseInt(hour, 10);
        const minuteNum = parseInt(minute, 10);
        return !isNaN(hourNum) && hourNum >= 0 && hourNum < 24 && !isNaN(minuteNum) && minuteNum >= 0 && minuteNum < 60;
    }

    function handleSubmit() {
        if (!submitButton2.disabled) {
            const task = {
                title: taskNameInput2.value,
                time: `${hourInput2.value}:${minuteInput2.value}`,
                repeat_days: Array.from(taskDays).filter(dayButton => dayButton.classList.contains('selected')).map(dayButton => daysOfWeek.indexOf(dayButton.textContent))
            };
            // Here you might want to send task to the server
            console.log('New task:', task);

            closeModal();

            // Reset form
            taskNameInput2.value = '';
            hourInput2.value = '';
            minuteInput2.value = '';
            taskDays.forEach(dayButton => dayButton.classList.remove('selected'));
            validateTaskForm();
        }
    }

    submitButton2.addEventListener('click', handleSubmit);

    [taskNameInput2, hourInput2, minuteInput2].forEach(input => {
        input.addEventListener('input', validateTaskForm);
    });

    taskDays.forEach(dayButton => {
        dayButton.addEventListener('click', () => {
            dayButton.classList.toggle('selected');
            validateTaskForm();
        });
    });

    // Week calendar display
    function calculateWeekDates() {
        const startDate = new Date(today);
        startDate.setDate(currentDate - (currentDay === 0 ? 6 : currentDay - 1));

        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            weekDates.push({
                day: daysOfWeek[i],
                date: date.getDate()
            });
        }
        return weekDates;
    }

    function displayWeekCalendar() {
        const weekDates = calculateWeekDates();
        weekCalendar.innerHTML = weekDates.map(({ day, date }, index) => `
            <div class="day ${index === (currentDay === 0 ? 6 : currentDay - 1) ? 'active' : ''}">
                <span class="day-name">${day}</span>
                <span class="day-date">${date}</span>
            </div>
        `).join('');
    }

    displayWeekCalendar();
    document.getElementById('full-date').textContent = fullDate;
    document.getElementById('day-of-week').textContent = `${dayOfWeek}요일`;
});
