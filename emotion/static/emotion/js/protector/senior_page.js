document.addEventListener('DOMContentLoaded', function() {
    
    // API를 통해 할 일 목록을 받아오는 함수
    async function fetchTasks() {
        const url = `http://127.0.0.1:8000/senior_tasks/`;
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
            displayTasks(data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }

       // 할 일 목록 화면에 표시하기
       function displayTasks(tasks) {
        const tasksContainer = document.getElementById('task-list');
        const currentTime = new Date();

        tasksContainer.innerHTML = ''; // 기존 내용을 지우기

        tasks.forEach((task, index) => {
            const taskTime = new Date();
            const [hours, minutes] = task.time.split(':');
            taskTime.setHours(hours);
            taskTime.setMinutes(minutes);

            const timeDiff = (currentTime - taskTime) / (1000 * 60 * 60); // 시간 차이 계산
            let timeStatus = '';
            let taskClass = '';

            if (task.completed) {
                timeStatus = `<s>${task.title}</s>`;
                taskClass = 'completed';
            } else {
                if (timeDiff > 0) {
                    timeStatus = `<span style="color: red;">${task.title}</span>`;
                    taskClass = 'overdue';
                } else {
                    timeStatus = task.title;
                    taskClass = 'upcoming';
                }
            }

            const taskElement = `
                <div class="task ${taskClass}">
                    <img src="/assets/${task.type.toLowerCase()}.png" alt="${task.title} icon">
                    <div class="task-details">
                        <div>${timeStatus}</div>
                        <div class="time">${task.notify_time}</div>
                    </div>
                    <div class="task-status">
                        <div>${task.completed ? '완료' : '완료 전'}</div>
                        ${!task.completed && timeDiff > 0 ? `<div class="status">예정 시간으로부터 ${Math.floor(timeDiff)}시간 지났어요</div>` : ''}
                    </div>
                </div>
                ${index < tasks.length - 1 ? '<hr>' : ''}
            `;
            tasksContainer.innerHTML += taskElement;
        });
    }

    // 초기 할 일 목록 표시
    fetchTasks();
    
    

    // 바텀 시트 및 오버레이 제어
    const overlay = document.getElementById('overlay');
    const bottomSheet = document.getElementById('bottom-sheet');
    const closeButton = document.getElementById('close-sheet');
    const commentInput = document.getElementById('comment');
    const submitButton = document.querySelector('.sheet-submit');

    openButton.addEventListener('click', () => {
        if (!openButton.disabled) {
            overlay.style.display = 'block';
            bottomSheet.style.transform = 'translateY(0)';
        }
    });

    closeButton.addEventListener('click', () => {
        overlay.style.display = 'none';
        bottomSheet.style.transform = 'translateY(100%)';
    });

    overlay.addEventListener('click', () => {
        overlay.style.display = 'none';
        bottomSheet.style.transform = 'translateY(100%)';
    });

    commentInput.addEventListener('input', () => {
        if (commentInput.value.trim() !== "") {
            submitButton.disabled = false;
            submitButton.style.backgroundColor = '#8f6cff';
        } else {
            submitButton.disabled = true;
            submitButton.style.backgroundColor = '#7b7b7e';
        }
    });

    submitButton.addEventListener('click', () => {
        if (commentInput.value.trim() !== "") {
            // 등록 처리 로직을 여기에 추가 (예시)
            console.log("등록 완료:", commentInput.value);

            // 등록 완료 후 바텀 시트 닫기
            overlay.style.display = 'none';
            bottomSheet.style.transform = 'translateY(100%)';
        }
    });
});
