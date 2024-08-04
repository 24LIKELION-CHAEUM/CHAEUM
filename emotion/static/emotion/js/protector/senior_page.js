document.addEventListener('DOMContentLoaded', function() {
    // API를 통해 시니어 정보를 받아오는 부분 (예시 데이터 사용)
    const userInfo = {
        name: "홍길동",
        birthdate: "1945.06.21",
        relation: "관계"
    };

    // 사용자 정보를 표시하는 부분
    document.getElementById('user-name').innerHTML = `${userInfo.name} <span id="user-relation">${userInfo.relation}</span>`;
    document.getElementById('user-birthdate').textContent = userInfo.birthdate;

    // API를 통해 할 일 목록을 받아오는 부분 (예시 데이터 사용)
    const tasks = [
        {
            title: "당뇨약",
            time: "10:00",
            completed: true,
            registeredTime: "오전 10:00",
            imageUrl: "/img/pill.png"
        },
        {
            title: "아침 식사",
            time: "10:00",
            completed: false,
            registeredTime: "오전 10:00",
            imageUrl: "/img/rice.png"
        },
        {
            title: "점심 식사",
            time: "12:00",
            completed: false,
            registeredTime: "오후 12:00",
            imageUrl: "/img/rice.png"
        }
    ];
    
    // 예시: 감정 데이터가 없는 경우
    //const emotions = null;

    // 감정 데이터가 있는 경우 (예시)
    const emotions = {
        emotion: "슬픔",
        reason: "이유 (공백 포함 19byte, 넘어가면 ...으로 보여짐)",
        time: "오전 11:00",
        imageUrl: "/img/sad.png"
    };


    const taskList = document.getElementById('task-list');
    const currentTime = new Date();

    tasks.forEach((task, index) => {
        const taskTime = new Date();
        const [hours, minutes] = task.time.split(':');
        taskTime.setHours(hours);
        taskTime.setMinutes(minutes);

        const timeDiff = (currentTime - taskTime) / (1000 * 60 * 60); // 시간 차이 계산
        let timeStatus = '';
        let taskClass = '';
        let taskImage = '';
        
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
                <img src="${task.imageUrl}" alt="${task.title} icon">
                <div class="task-details">
                    <div>${timeStatus}</div>
                    <div class="time">${task.registeredTime}</div>
                </div>
                <div class = "task-status">
                    <div>${task.completed ? '완료' : '완료 전'}</div>
                    ${!task.completed && timeDiff > 0 ? `<div class="status">예정 시간으로부터 ${Math.floor(timeDiff)}시간 지났어요</div>` : ''}
                </div>
            </div>
            ${index < tasks.length - 1 ? '<hr>' : ''}
        `;
        taskList.innerHTML += taskElement;
    });

    // 감정 정보를 추가하는 부분
    const emotionSection = document.getElementById('emotion-section');
    let emotionElement;
    const openButton = document.createElement('button');

    if (emotions) {
        const truncatedReason = emotions.reason.length > 19 ? emotions.reason.substring(0, 19) + "..." : emotions.reason;
        emotionElement = `
            <div class="emotion">
                <div class="emotion-text">
                    <img src="${emotions.imageUrl}" alt="emotion">
                    <div class="emotion-details">
                        <div class="emotion-title">
                            <span>${emotions.emotion}</span>
                            <span class="emotion-time">${emotions.time}</span>
                        </div>
                        <div class="emotion-reason">${truncatedReason}</div>
                    </div>
                </div>
            </div>
        `;
        openButton.className = 'btn';
        openButton.id = 'open-bottom-sheet';
        openButton.textContent = '한마디 남기기';
    } else {
        emotionElement = `
            <div class="emotion">
                <div class="emotion-text no-emotion">
                    <img src="/img/no_emo.png" alt="emotion">
                    아직 기록된 감정이 없어요
                </div>
            </div>
        `;
        openButton.className = 'btn disabled';
        openButton.textContent = '한마디 남기기';
        openButton.disabled = true;
    }

    emotionSection.innerHTML = emotionElement;
    emotionSection.appendChild(openButton);

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