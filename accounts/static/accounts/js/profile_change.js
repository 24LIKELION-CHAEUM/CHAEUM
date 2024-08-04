function goBack() {
    window.history.back();
}
document.addEventListener('DOMContentLoaded', function() {
    const nameInput = document.getElementById('name');
    const birthdateInput = document.getElementById('birthdate');
    const profileImageInput = document.getElementById('profile_image');
    const submitButton = document.getElementById('submit-button');

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

    nameInput.addEventListener('input', checkChanges);
    birthdateInput.addEventListener('input', checkChanges);
    profileImageInput.addEventListener('change', checkChanges);

    checkChanges();
    
});