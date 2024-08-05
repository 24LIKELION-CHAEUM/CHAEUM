document.querySelectorAll('.select').forEach(function(select) {
    select.addEventListener('click', function() {
        selectOption(this);
    });
});

function selectOption(element) {
    document.querySelectorAll('.select').forEach(function(select) {
        select.classList.remove('selected');
        select.querySelector('.check').src = staticPath('img/check_unactivated.svg');
    });

    element.classList.add('selected');
    element.querySelector('.check').src = staticPath('img/check_activated.svg');

    document.getElementById('id_user_type').value = element.getAttribute('data-value');

    document.getElementById('signin_btn').disabled = false;
}

function staticPath(relativePath) {
    return '/static/' + relativePath;
}

document.getElementById('user-type-form').addEventListener('submit', function(event) {
    if (!document.getElementById('id_user_type').value) {
        event.preventDefault();
        alert('가입 유형을 선택해주세요.');
    }
});
