let accessToken = null;
document.addEventListener('DOMContentLoaded', () => {
    const addNoticeBtn = document.getElementById('addNoticeBtn');
    const addNoticeForm = document.getElementById('addNoticeForm');
    const noticeForm = document.getElementById('noticeForm');
    const cancelBtn = document.getElementById('cancelBtn');

    accessToken = localStorage.getItem("AccessToken");
    if (!accessToken) {
        alert('관리자만 접근 가능합니다.');
        window.location.href = '/login.html';
        return;
    }

    const isAdmin = checkAdminRole();

    if (!isAdmin) {
        alert('관리자만 접근 가능합니다.');
        window.location.href = '/login.html';
        return;
    }

    addNoticeBtn.addEventListener('click', () => addNoticeForm.style.display = 'block');

    cancelBtn.addEventListener('click', () => {
        addNoticeForm.style.display = 'none';
        noticeForm.reset();
    });

    noticeForm.addEventListener('submit', (event) => {
        event.preventDefault();
        submitNoticeForm();
    });
    fetchNotices();
});

async function fetchNotices() {
    try {
        const response = await axios.get('https://naechaeottae.shop/api/notice/list');
        const { resultCode, result } = response.data;

        const noticeTableBody = document.getElementById('noticeTableBody');
        if (!noticeTableBody) {
            console.error('공지사항 테이블 요소를 찾을 수 없습니다.');
            return;
        }

        if (resultCode === "SUCCESS" && result) {
            noticeTableBody.innerHTML = '';

            result.forEach((notice, index) => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${notice.title}</td>
                    <td>${notice.content}</td>
                    <td>${new Date(notice.createdAt).toLocaleDateString()}</td>
                    <td>
                    <button class="btn btn-warning btn-sm" onclick="enableEditing(this)">수정</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteNotice(${notice.id})">삭제</button>
                    </td>
                `;

                noticeTableBody.appendChild(row);
            });
        } else {
            console.error('공지사항 데이터를 가져오는 데 실패했습니다.');
        }
    } catch (error) {
        console.error('공지사항 데이터 요청 중 오류 발생:', error);
    }
}

async function fetchNotices() {
    try {
        const response = await axios.get('https://naechaeottae.shop/api/notice/list');
        const { resultCode, result } = response.data;

        const noticeTableBody = document.getElementById('noticeTableBody');
        if (!noticeTableBody) {
            console.error('공지사항 테이블 요소를 찾을 수 없습니다.');
            return;
        }

        if (resultCode === "SUCCESS" && result) {
            noticeTableBody.innerHTML = '';

            result.forEach((notice, index) => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', notice.id);

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td class="editable" data-field="title">${notice.title}</td>
                    <td class="editable" data-field="content">${notice.content}</td>
                    <td>${new Date(notice.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editNotice(${notice.id})">수정</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteNotice(${notice.id})">삭제</button>
                    </td>
                `;
                noticeTableBody.appendChild(row);
            });
        } else {
            console.error('공지사항 데이터를 가져오는 데 실패했습니다.');
        }
    } catch (error) {
        console.error('공지사항 데이터 요청 중 오류 발생:', error);
    }
}

function editNotice(noticeId) {
    const row = document.querySelector(`tr[data-id="${noticeId}"]`);
    const titleCell = row.querySelector('td[data-field="title"]');
    const contentCell = row.querySelector('td[data-field="content"]');

    titleCell.innerHTML = `<input style="width: 200px; type="text" value="${titleCell.innerText}">`;
    contentCell.innerHTML = `<textarea style="resize: none; width: 300px;">${contentCell.innerText}</textarea>`;

    const actionCell = row.querySelector('td:last-child');
    actionCell.innerHTML = `
        <button class="btn btn-success btn-sm" onclick="saveChanges(${noticeId})">저장</button>
        <button class="btn btn-secondary btn-sm" onclick="cancelEdit(${noticeId})">취소</button>
    `;
}

function cancelEdit() {
    fetchNotices();
}

async function saveChanges(noticeId) {
    const row = document.querySelector(`tr[data-id="${noticeId}"]`);
    const titleCell = row.querySelector('td[data-field="title"]');
    const contentCell = row.querySelector('td[data-field="content"]');

    const updatedTitle = titleCell.querySelector('input').value;
    const updatedContent = contentCell.querySelector('textarea').value;

    const updatedData = {
        title: updatedTitle,
        content: updatedContent
    };

    try {
        const response = await axios.put(`https://naechaeottae.shop/api/admin/notice/${noticeId}`, updatedData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.data.resultCode === 'SUCCESS') {
            alert('공지사항이 수정되었습니다.');
            fetchNotices();
        } else {
            alert(`수정 실패: ${response.data.message}`);
        }
    } catch (error) {
        if (error.response && error.response.status === 403) {
            alert('토큰이 만료되었습니다. 다시 로그인해주세요.');
            window.location.href = '/login.html';
        } else {
            console.error('공지사항 수정 중 오류 발생:', error);
            alert('공지사항 수정 중 오류가 발생했습니다.');
        }
    };


}

async function deleteNotice(noticeId) {
    const confirmDelete = confirm('정말로 이 공지사항을 삭제하시겠습니까?');

    if (confirmDelete) {
        try {
            const response = await axios.delete(`https://naechaeottae.shop/api/admin/notice/${noticeId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.data.resultCode === 'SUCCESS') {
                alert('공지사항이 삭제되었습니다.');
                fetchNotices();
            } else {
                alert(`삭제 실패: ${response.data.message}`);
            }
        } catch (error) {
            if (error.response && error.response.status === 403) {
                alert('토큰이 만료되었습니다. 다시 로그인해주세요.');
                window.location.href = '/login.html';
            } else {
                console.error('공지사항 삭제 중 오류 발생:', error);
                alert('공지사항 삭제 중 오류가 발생했습니다.');
            }
        };
    }
}

function submitNoticeForm() {
    const title = document.getElementById('noticeTitle').value;
    const content = document.getElementById('noticeContent').value;

    if (!title || !content) {
        alert('제목과 내용을 입력해주세요.');
        return;
    }

    const newNotice = {
        title: title,
        content: content
    };

    axios.post('https://naechaeottae.shop/api/admin/notice', newNotice, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
        .then(response => {
            if (response.data.resultCode === 'SUCCESS') {
                alert('공지사항이 추가되었습니다.');
                window.location.reload();
            } else {
                alert(`추가 실패: ${response.data.message}`);
            }
        })
        .catch(error => {
            console.error('공지사항 추가 중 오류 발생:', error);
            alert('공지사항 추가 중 오류가 발생했습니다.');
        });
}


function checkAdminRole() {
    const admin = localStorage.getItem("Role");
    return admin === "ADMIN";
}

function toggleLoginState() {
    const isLoggedIn = localStorage.getItem("AccessToken");

    if (isLoggedIn) {
        localStorage.removeItem("AccessToken");
        localStorage.removeItem("Role");
        alert('로그아웃 완료');
        window.location.href = '/login.html';
    } else {
        window.location.href = '/login.html';
    }
}