document.addEventListener('DOMContentLoaded', function() {
    const editProfileButton = document.querySelector('.my-edit-profile-button');
    const modal = document.getElementById('modal');
    const closeModalButton = document.querySelector('.close');
    const modalBackdrop = document.querySelector('.modal-backdrop');
    
    const nameInput = document.getElementById('name');
    const birthdateInput = document.getElementById('birthdate');
    const profileImageInput = document.getElementById('profile_image');
    const submitButton = document.getElementById('submit-button');
    
    let initialName = nameInput.value;
    let initialBirthdate = birthdateInput.value;
    let initialProfileImage = profileImageInput.files[0]; 

    /**
    if (editProfileButton) {
        editProfileButton.addEventListener('click', () => {
            modal.classList.add('show'); 
            modalBackdrop.classList.add('show');
        });
    }
    */

    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            closeModal(); 
        });
    }

    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', () => {
            closeModal(); 
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    function closeModal() {
        modal.classList.remove('show');
        modalBackdrop.classList.remove('show'); 
    }

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

    nameInput.addEventListener('input', checkChanges);
    birthdateInput.addEventListener('input', checkChanges);
    profileImageInput.addEventListener('change', checkChanges);

});