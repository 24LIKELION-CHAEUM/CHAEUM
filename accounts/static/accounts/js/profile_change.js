function goBack() {
    window.history.back();
}

document.addEventListener('DOMContentLoaded', function() {
    const nameInput = document.getElementById('name');
    const birthdateInput = document.getElementById('birthdate');
    const profileImageInput = document.getElementById('profile_image');
    const submitButton = document.getElementById('submit-button');
    const profileImagePreview = document.getElementById('profile-image-preview');

    let initialName = nameInput.value;
    let initialBirthdate = birthdateInput.value;
    let initialProfileImageSelected = profileImageInput.files[0];

    function checkChanges() {
        const currentName = nameInput.value;
        const currentBirthdate = birthdateInput.value;
        const currentProfileImageSelected = profileImageInput.files[0];

        const isNameChanged = currentName !== initialName;
        const isBirthdateChanged = currentBirthdate !== initialBirthdate;
        const isProfileImageChanged = currentProfileImageSelected !== initialProfileImageSelected;

        submitButton.disabled = !(isNameChanged || isBirthdateChanged || isProfileImageChanged);
    }

    function handleFileSelect() {
        const file = profileImageInput.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = function(e) {
                profileImagePreview.src = e.target.result;
            };

            reader.readAsDataURL(file);
        } else {
            profileImagePreview.src = "{% static 'img/default_profile.png' %}";
        }
    }

    nameInput.addEventListener('input', checkChanges);
    birthdateInput.addEventListener('input', checkChanges);
    profileImageInput.addEventListener('change', function() {
        handleFileSelect();
        checkChanges();
    });

    checkChanges();
});
