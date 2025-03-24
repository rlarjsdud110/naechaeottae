let accessToken = null;
let currentTab = 'general';

document.addEventListener('DOMContentLoaded', () => {
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

    fetchRequestList(currentTab);
    const tabs = document.querySelectorAll('#requestTabs a');
    tabs.forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();

            const tabId = e.target.getAttribute('href').substring(1);

            let currentTabValue = tabId;
            if (tabId === 'purchaseRequests') {
                currentTabValue = 'purchase';
            }

            currentTab = currentTabValue;
            fetchRequestList(currentTab);

            tabs.forEach(tab => tab.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
});

function checkAdminRole() {
    const admin = localStorage.getItem("Role");
    return admin === "ADMIN";
}

function fetchRequestList(tab) {
    let url = '';
    if (tab === 'general') {
        url = 'https://naechaeottae.shop/api/admin/consult';
    } else if (tab === 'purchase') {
        url = 'https://naechaeottae.shop/api/admin/purchase';
    }

    axios.get(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
        .then(response => {
            const requests = response.data.result;
            renderRequestList(requests, tab);
        })
        .catch(error => {
            if (error.response && error.response.status === 403) {
                alert('토큰이 만료되었습니다. 다시 로그인해주세요.');
                window.location.href = '/login.html';
            } else {
                console.error('문의 목록을 가져오는 데 실패했습니다:', error);
            }
        });
}

function renderRequestList(requests, tab) {
    let listElement;

    if (tab === 'general') {
        listElement = document.getElementById('generalRequestList');
    } else if (tab === 'purchase') {
        listElement = document.getElementById('purchaseRequestList');
    }

    if (!listElement) {
        return;
    }

    listElement.innerHTML = '';

    requests.forEach(request => {
        const row = document.createElement('tr');

        let taskTypeClass = '';
        if (request.taskType === '답변완료') {
            taskTypeClass = 'text-success';
        } else if (request.taskType === '접수완료') {
            taskTypeClass = 'text-danger';
        }

        if (tab === 'general') {
            row.innerHTML = `
                <td>${request.email}</td>
                <td>${request.title || request.carName}</td>
                <td>${request.statusType || request.requestStatus}</td>
                <td class="${taskTypeClass}">${request.taskType}</td>
                <td>${new Date(request.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-outline-dark mt-auto" onclick="viewRequestDetail(${request.id}, '${tab}')">상세보기</button>
                    <button class="btn btn-danger" onclick="deleteRequest(${request.id}, '${tab}')">삭제</button>
                </td>
            `;
        } else if (tab === 'purchase') {
            row.innerHTML = `
                <td>${request.carId}</td>
                <td>${request.userName}</td>
                <td>${request.phone}</td>
                <td>${new Date(request.createdAt).toLocaleDateString()}</td>
                <td>
                    <a class="btn btn-outline-dark mt-auto" href="/details.html?id=${request.carId}">상세 정보</a>
                    <button class="btn btn-danger" onclick="deleteRequest(${request.purchaseId}, '${tab}')">삭제</button>
                </td>
            `;
        }
        listElement.appendChild(row);
    });
}

function viewRequestDetail(requestId) {
    const requestDetailElement = document.getElementById('requestDetail');

    if (!requestDetailElement) {
        console.error('requestDetail 요소를 찾을 수 없습니다.');
        return;
    }

    axios.get(`https://naechaeottae.shop/api/consult/${requestId}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
        .then(response => {
            const request = response.data.result;
            const imageHtml = request.imagesUrl.map(url => `
                <img src="${url}" alt="Consult Image" class="img-fluid mb-2" style="max-width: 100px; height: 100px;" />
            `).join('');

            const detailHtml = `
            <div class="card">
                <div class="card-header">
                    <h3>문의 상세</h3>
                </div>
                <div class="card-body">
                    <p><strong>작성자:</strong> ${request.email}</p>
                    <p><strong>제목:</strong> ${request.title}</p>
                    <p><strong>내용:</strong> ${request.content}</p>
                    <p><strong>상태:</strong> ${request.statusType}</p>
                    <p><strong>작성일:</strong> ${new Date(request.createdAt).toLocaleDateString()}</p>
                    <div class="mb-3">
                        <strong>이미지:</strong>
                        ${imageHtml}  
                    </div>
                    <textarea id="adminAnswer" class="form-control" rows="4" placeholder="답변을 입력하세요..."></textarea>
                    <button id="submitAnswer" class="btn btn-primary mt-2">답변 등록</button>
                    <button id="cancelButton" class="btn btn-secondary mt-2">취소</button>
                </div>
            </div>
            `;
            requestDetailElement.innerHTML = detailHtml;

            document.getElementById('submitAnswer').addEventListener('click', () => {
                const answer = document.getElementById('adminAnswer').value;

                if (!answer.trim()) {
                    alert('답변을 입력해주세요.');
                    return;
                }

                const dataToSend = {
                    answer: answer,
                    taskType: '답변완료'
                };

                axios.patch(`https://naechaeottae.shop/api/admin/consult/${requestId}`, dataToSend,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    })
                    .then(() => {
                        alert('답변이 등록되었습니다.');
                        requestDetailElement.innerHTML = '';
                        fetchRequestList(currentTab);
                    })
                    .catch(error => {
                        console.error('답변 등록 오류:', error);
                        alert('답변 등록에 실패했습니다.');
                    });
            });

            document.getElementById('cancelButton').addEventListener('click', () => {
                requestDetailElement.innerHTML = '';
            });
        })
        .catch(error => {
            if (error.response && error.response.status === 403) {
                alert('토큰이 만료되었습니다. 다시 로그인해주세요.');
                window.location.href = '/login.html';
            } else {
                console.error('상세보기 오류:', error);
            }
        });
}


function deleteRequest(requestId, tab) {
    let url = '';

    if (tab === 'general') {
        url = `https://naechaeottae.shop/api/consult/${requestId}`;
    } else if (tab === 'purchase') {
        url = `https://naechaeottae.shop/api/admin/purchase/${requestId}`;
    }

    axios.delete(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
        .then(response => {
            alert('요청이 삭제되었습니다.');
            fetchRequestList(tab);
        })
        .catch(error => {
            console.error('삭제 실패:', error);
            alert('요청 삭제에 실패했습니다.');
        });
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