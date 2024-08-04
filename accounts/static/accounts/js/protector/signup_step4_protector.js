document.addEventListener('DOMContentLoaded', () => {
    const resultItems = document.querySelectorAll('.result_item');
    const signinBtn = document.getElementById('signin_btn');
    const modal = document.getElementById('myModal');
    const modalBackdrop = document.querySelector('.modal-backdrop');
    const relationSpan = document.querySelector('.relation');
    const searchForm = document.getElementById('search-form');
    let selectedItem = null;

    // 프로필 클릭 시
    resultItems.forEach(item => {
        item.addEventListener('click', () => {
            resultItems.forEach(el => {
                el.classList.remove('selected');
                el.querySelector('.profile-checkmark').style.display = 'none';
            });
            item.classList.add('selected');
            item.querySelector('.profile-checkmark').style.display = 'block';
            selectedItem = item;
            document.getElementById('selected_senior_id').value = item.getAttribute('data-user-id');
            showRelationModal(); // 모달 표시 함수 호출
        });
    });

    // 모달 열기
    function showRelationModal() {
        modal.classList.add('show');
        modalBackdrop.classList.add('show');
    }

    // 모달 닫기
    function closeModal() {
        modal.classList.remove('show');
        modalBackdrop.classList.remove('show');
    }

    // 모달 닫기 이벤트
    document.querySelector('.modal-handler').addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);

    // 모달에서 관계 버튼 클릭 시
    document.querySelectorAll('.relation-btn-wrapper').forEach(btnWrapper => {
        btnWrapper.addEventListener('click', () => {
            const relationText = btnWrapper.getAttribute('data-relation');
            relationSpan.textContent = ` | ${relationText}`;
            document.getElementById('selected_relationship').value = relationText;

            // 선택된 프로필의 체크마크와 검색창 숨기기
            if (selectedItem) {
                selectedItem.querySelector('.profile-checkmark').style.display = 'block';
                selectedItem.classList.remove('selected');
                searchForm.style.display = 'none'; // 검색창 숨기기
                selectedItem.querySelector('.profile-checkmark').style.display = 'none'; // 체크마크 숨기기
            }

            signinBtn.disabled = false; // 버튼 활성화

            closeModal();
        });
    });

    signinBtn.addEventListener('click', (event) => {
        if (!document.getElementById('selected_relationship').value) {
            event.preventDefault();
            alert('관계를 선택해주세요.');
        }
    });
});
