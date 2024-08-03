document.addEventListener('DOMContentLoaded', function() {
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
});