function goBack() {
    window.history.back();
}

function formatDate(input) {
    if (input.length === 8) {
        const year = input.substring(0, 4);
        const month = input.substring(4, 6);
        const day = input.substring(6, 8);
        return `${year}-${month}-${day}`;
    }
    return '';
}

document.addEventListener('DOMContentLoaded', function() {
    const nameInput = document.getElementById('name');
    const birthdateInput = document.getElementById('birthdate');
    const profileImageInput = document.getElementById('profile_image');
    const submitButton = document.getElementById('submit-button');
    const form = document.querySelector('form');
    
    let initialName = nameInput.value;
    let initialBirthdate = birthdateInput.value;
    let initialProfileImage = profileImageInput.files[0]; 

    function checkChanges() {
        const currentName = nameInput.value;
        const currentBirthdate = birthdateInput.value;
        const currentProfileImage = profileImageInput.files[0];

        const isNameChanged = currentName !== initialName;
        const isBirthdateChanged = currentBirthdate !== initialBirthdate;
        const isProfileImageChanged = currentProfileImage !== initialProfileImage;

        if (isNameChanged || isBirthdateChanged || isProfileImageChanged) {
            submitButton.disabled = false; 
        } else {
            submitButton.disabled = true; 
        }
    }

    function handleBirthdateInput() {
        const input = birthdateInput.value;
        const formattedDate = formatDate(input);
        console.log('Formatted Date:', formattedDate);
    }

    nameInput.addEventListener('input', checkChanges);
    birthdateInput.addEventListener('input', function() {
        checkChanges();
        handleBirthdateInput();
    });
    profileImageInput.addEventListener('change', checkChanges);

    form.addEventListener('submit', function(event) {
        const input = birthdateInput.value;
        const formattedDate = formatDate(input);
        birthdateInput.value = formattedDate;
        console.log('Submitting Date:', formattedDate);
    });
});