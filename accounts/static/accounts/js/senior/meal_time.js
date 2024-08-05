document.addEventListener('DOMContentLoaded', function() {
    const mealTypeSelect = document.getElementById('meal_type');
    const bottomSheet = document.getElementById('bottomSheet');
    const mealOptions = document.querySelectorAll('.bottom-sheet li');
    const completeButton = document.getElementById('complete_registration');

    mealTypeSelect.addEventListener('click', function() {
        bottomSheet.classList.add('active');
    });

    mealOptions.forEach(option => {
        option.addEventListener('click', function() {
            mealOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            mealTypeSelect.innerHTML = `<option value="${this.getAttribute('data-meal-type')}" selected>${this.innerText}</option>`;
            bottomSheet.classList.remove('active');
        });
    });

    window.onclick = function(event) {
        if (event.target === bottomSheet) {
            bottomSheet.classList.remove('active');
        }
    };

    document.getElementById('meal_time_form').addEventListener('submit', function(event) {
        event.preventDefault();
        const mealType = mealTypeSelect.querySelector('option[selected]').value;
        const time = document.getElementById('id_time').value;

        fetch("{% url 'meal_time' %}", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': '{{ csrf_token }}'
            },
            body: new URLSearchParams({
                meal_type: mealType,
                time: time
            })
        }).then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById(`${mealType}-time`).classList.add('active');
                checkAllMealTimes();
            } else {
                alert('저장 중 오류가 발생했습니다.');
            }
        });
    });

    function checkAllMealTimes() {
        fetch("{% url 'meal_time_flags' %}")
            .then(response => response.json())
            .then(data => {
                if (data.breakfast && data.lunch && data.dinner) {
                    completeButton.disabled = false;
                } else {
                    completeButton.disabled = true;
                }
            });
    }

    completeButton.addEventListener('click', function() {
        window.location.href = "{% url 'signup_step4_senior' %}";
    });

    checkAllMealTimes();
});
