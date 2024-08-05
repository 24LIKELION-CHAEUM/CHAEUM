$(document).ready(function() {
    $('.poke-form').on('submit', function(event) {
        event.preventDefault();
        var form = $(this);
        $.ajax({
            type: form.attr('method'),
            url: form.attr('action'),
            data: form.serialize(),
            success: function(response) {
                location.reload();
            },
            error: function(response) {
                alert('Error occurred. Please try again.');
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');

    searchButton.addEventListener('click', function() {
        searchInput.submit();
    });

    document.querySelectorAll('.profile-checkmark').forEach(function(button) {
        button.addEventListener('click', function() {
            var formId = button.id.replace('profile-checkmark', 'poke-form');
            var form = document.getElementById(formId);
            form.submit(); 
        });
    });
});