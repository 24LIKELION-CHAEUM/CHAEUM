document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem('access_token');

    async function fetchNotifications() {
        const url = 'http://127.0.0.1:8000/notifications/';
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
            displayNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }

    function displayNotifications(notifications) {
        const notificationList = document.querySelector('.notification-list');
        notificationList.innerHTML = '';  // 기존 내용 초기화
    
        notifications.forEach(notification => {
            const currentTime = new Date();
            const [hours, minutes, seconds] = notification.notify_time.split(':');
            const notifyTime = new Date(currentTime); // 현재 날짜를 기반으로 한 새로운 Date 객체 생성
            notifyTime.setHours(hours);
            notifyTime.setMinutes(minutes);
            notifyTime.setSeconds(seconds);
    
            const timeDiff = (currentTime - notifyTime) / (1000 * 60 * 60); // 시간 차이 계산
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item ${notification.is_read ? 'read' : ''}`;
            notificationItem.style.backgroundColor = notification.is_read ? 'white' : '#F6F4FF'; // 수정된 부분
            let imageSrc;
            switch (notification.type) {
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
            notificationItem.innerHTML = `
                <img src="${imageSrc}" class="notification-image" alt="대체 텍스트">
                <div class="notification-details">
                    <div class="notification-meta">
                        <span class="task-date">오늘의 할 일</span>
                        <span class="task-time"> | ${Math.floor(timeDiff)}시간</span>
                    </div>
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">님 ${notification.title}을 할 시간이예요!</div>
                </div>
            `;
            notificationList.appendChild(notificationItem);
    
            // 알림 읽음 처리 이벤트 리스너 추가
            notificationItem.addEventListener('click', () => {
                markAsRead(notification.id);
            });
        });
    
        // 텍스트 길이 제한 함수 호출
        truncateTextElements();
    }

    //알림읽음
    async function markAsRead(notificationID) {
        const url = `http://127.0.0.1:8000/notifications/${notificationID}/check_read/`;
        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Notification marked as read:', data);
            fetchNotifications();  // 알림 목록 다시 불러오기

        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    

    // 알림 삭제하기
    async function deleteNotification(notificationID) {
        const url = `http://127.0.0.1:8000/notifications/${notificationID}/`;
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log('Notification deleted');
            fetchNotifications();  // 알림 목록 다시 불러오기
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }

    //텍스트 길이 제한
    function truncateText(element, maxLength) {
        let text = element.textContent;
        if (text.length > maxLength) {
            element.textContent = text.slice(0, maxLength) + '...';
        }
    }

    function truncateTextElements() {
        let titleElements = document.querySelectorAll('.notification-title');
        let messageElements = document.querySelectorAll('.notification-message');

        titleElements.forEach(function(element) {
            truncateText(element, 18);
        });
        messageElements.forEach(function(element) {
            truncateText(element, 24);
        });
    }

    // 초기화
    fetchNotifications();
   
});