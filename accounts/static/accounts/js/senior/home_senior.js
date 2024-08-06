document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('access_token');
    const modal = document.getElementById('modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const confirmBtn = document.getElementById('confirm-btn');
    const notificationCountElement = document.getElementById('notification-count');
    
    if (notificationCountElement) {
        const count = parseInt(notificationCountElement.textContent, 10);

        if (count >= 100) {
            notificationCountElement.textContent = '99+';
        } else {
            notificationCountElement.textContent = count; // 100 미만의 경우 원래 값 유지
        }
    }
    
    function updateDayCount() {
        const dayCountElement = document.getElementById("day-count");
        if (dayCountElement) {
            const dayCountValue = dayCountElement.textContent;
            dayCountElement.innerHTML = dayCountValue.split('').map(digit => 
                `<span class="day-count-digit">${digit}</span>`
            ).join('');
        }
    }

    updateDayCount();
    
    // 모달 관련 기능
    function showModal() {
        modal.classList.add('show');
        modal.classList.remove('hide');
        modal.style.display = 'flex'; 
    }

    function closeModal() {
        modal.classList.add('hide');
        setTimeout(() => {
            modal.classList.remove('show', 'hide');
            modal.style.display = 'none';
        }, 300);
    }
    
    cancelBtn.addEventListener('click', function() {
        closeModal();
    });

    confirmBtn.addEventListener('click', function() {
        closeModal();
    });

    // 처음 방문 시에만 모달 표시
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
        showModal();
        localStorage.setItem('hasVisited', 'true');
    }
    //  읽지 않은 알림 개수 가져오기
    async function fetchUnreadCount() {
        const url = 'http://43.201.81.113/notifications/unread_count/';
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            displayUnreadCount(data.unread_count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }

    function displayUnreadCount(count) {
        const unreadCountElement = document.getElementById('notification-count');
        if (unreadCountElement) {
            unreadCountElement.textContent = `${count}`;
        }
    }
    fetchUnreadCount()
});