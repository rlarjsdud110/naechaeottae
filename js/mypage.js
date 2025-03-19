let accessToken = null;

document.addEventListener("DOMContentLoaded", function () {
    accessToken = localStorage.getItem("AccessToken");  // 전역 변수에 할당
    if (accessToken) {
        isLoggedIn = true;
    }
    loadUserInfo();
    updateLoginState();
    loadConsultData();
    loadCartData();
    loadPurchaseData();
});

let isLoggedIn = false;

// 로그인/로그아웃 상태 업데이트 함수
function updateLoginState() {
    if (isLoggedIn) {
        document.getElementById('login-logout-btn').textContent = '로그아웃';
    } else {
        document.getElementById('login-logout-btn').textContent = '로그인';
    }
}

// 로그인 상태 토글 함수
function toggleLoginState() {
    if (isLoggedIn) {
        // 로그아웃 처리
        localStorage.removeItem("AccessToken");
        alert('로그아웃 완료');
        isLoggedIn = false;
        window.location.href = '../html/index.html';
    } else {
        // 로그인 상태에서 로그아웃 처리 후 페이지 갱신
        window.location.href = '../html/login.html';  // 로그인 페이지로 리다이렉트
    }

    // 로그인 상태 갱신 (로그아웃 후 상태 변경)
    updateLoginState();
}

// 문의 내역 데이터 로드 함수
function loadConsultData() {
    // Axios를 사용하여 서버에서 문의 내역 데이터 요청
    axios.get('http://localhost:8080/api/consult/list', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then(response => {
            const inquiries = response.data.result; // 서버에서 받은 문의 내역 데이터
            const tbody = document.querySelector('tbody'); // tbody 요소

            inquiries.forEach(inquiry => {
                const tr = document.createElement('tr'); // 새로운 tr 생성

                // 제목 열 생성
                const titleTd = document.createElement('td');
                titleTd.textContent = inquiry.title;
                tr.appendChild(titleTd);

                // 문의일 열 생성
                const dateTd = document.createElement('td');
                dateTd.textContent = new Date(inquiry.createdAt).toLocaleDateString(); // 날짜 포맷을 변환하여 표시
                tr.appendChild(dateTd);

                // 작업 열 생성 (배지 추가)
                const actionTd = document.createElement('td');

                // 작업 상태에 따라 배지 추가
                const taskBadge = document.createElement('span');
                taskBadge.classList.add('badge'); // 기본 배지 클래스
                switch (inquiry.taskType) {
                    case '접수완료':
                        taskBadge.classList.add('bg-warning');
                        taskBadge.textContent = '접수완료';
                        break;
                    case '진행중':
                        taskBadge.classList.add('bg-success');
                        taskBadge.textContent = '진행중';
                        break;
                    case '답변완료':
                        taskBadge.classList.add('bg-danger');
                        taskBadge.textContent = '답변완료';
                        break;
                    default:
                        taskBadge.classList.add('bg-secondary');
                        taskBadge.textContent = '알 수 없음';
                        break;
                }

                const statusTd = document.createElement('td');
                statusTd.textContent = inquiry.statusType;
                tr.appendChild(statusTd);

                // 상태 열 생성
                actionTd.appendChild(taskBadge);
                tr.appendChild(actionTd);

                tr.onclick = function () {
                    window.location.href = `requestDetails.html?id=${inquiry.id}`;
                };

                // 생성된 tr을 tbody에 추가
                tbody.appendChild(tr);
            });
        })
        .catch(error => {
            if (error.response && error.response.status === 403) {
                alert("토큰이 만료되었습니다. 로그인 페이지로 이동합니다.");
                localStorage.removeItem("AccessToken");
                window.location.href = "login.html"; // 로그인 페이지로 이동
            } else {
                console.error("문의 내역 로딩 실패:", error);
                alert('문의 내역을 불러오는 데 실패했습니다.');
            }
        });
}

function loadUserInfo() {
    if (!accessToken) {
        alert("토큰이 만료되었습니다. 다시 로그인해 주세요.");
        window.location.href = "../html/index.html";
        return;
    }

    axios.get('http://localhost:8080/api/users/userInfo', {
        headers: {
            Authorization: `Bearer ${accessToken}`  // 전역 변수 사용
        }
    })
        .then(response => {
            const user = response.data.result;
            document.querySelector("#user-name").textContent = user.name;
            document.querySelector("#user-email").textContent = user.email;
            document.querySelector("#user-phone").textContent = user.phone;
        })
        .catch(error => {
            console.error("사용자 정보 불러오기 실패:", error);

            // 서버에서 반환된 resultCode 확인
            if (error.response && error.response.data && error.response.data.resultCode === "USER_NOT_FOUND") {
                alert("사용자를 찾을 수 없습니다. 다시 로그인해 주세요.");
                localStorage.removeItem("AccessToken");
                window.location.href = "../html/index.html";
            }
        });
}

// 회원 정보 수정 함수
let originalUserInfo = {}; // 원본 정보 저장

function editUserInfo() {
    const userName = document.getElementById("user-name");
    const userEmail = document.getElementById("user-email");
    const userPhone = document.getElementById("user-phone");

    // 원본 정보 저장
    originalUserInfo = {
        name: userName.innerHTML,
        email: userEmail.innerHTML,
        phone: userPhone.innerHTML
    };

    // 이름을 input으로 변환
    userName.innerHTML = `<input type="text" id="edit-name" value="${userName.innerHTML}" class="form-control">`;
    // 이메일을 input으로 변환
    userEmail.innerHTML = `<input type="email" id="edit-email" value="${userEmail.innerHTML}" class="form-control">`;
    // 전화번호를 input으로 변환
    userPhone.innerHTML = `<input type="tel" id="edit-phone" value="${userPhone.innerHTML}" class="form-control">`;

    // 버튼 텍스트 변경
    const editButton = document.getElementById("edit-info-btn");
    editButton.innerHTML = "수정 완료";
    editButton.setAttribute("onclick", "saveUserInfo()");

    // 수정 취소 버튼 추가
    const cancelButton = document.getElementById("cancel-info-btn");
    cancelButton.style.display = "inline-block"; // 취소 버튼 표시
    cancelButton.setAttribute("onclick", "cancelEditUserInfo()");
}

// 수정된 정보 저장 함수
function saveUserInfo() {
    const updatedName = document.getElementById("edit-name").value;
    const updatedEmail = document.getElementById("edit-email").value;
    const updatedPhone = document.getElementById("edit-phone").value;

    // 변경된 정보를 화면에 반영
    document.getElementById("user-name").innerText = updatedName;
    document.getElementById("user-email").innerText = updatedEmail;
    document.getElementById("user-phone").innerText = updatedPhone;

    // 버튼 텍스트 변경 및 클릭 이벤트 변경
    const editButton = document.getElementById("edit-info-btn");
    editButton.innerHTML = "회원 정보 수정";
    editButton.setAttribute("onclick", "editUserInfo()");

    // 수정 취소 버튼 숨김
    const cancelButton = document.getElementById("cancel-info-btn");
    cancelButton.style.display = "none";

    // 서버에 변경된 사용자 정보 전송
    axios.put('http://localhost:8080/api/users/update', {
        name: updatedName,
        email: updatedEmail,
        phone: updatedPhone
    }, {
        headers: {
            Authorization: `Bearer ${accessToken}`  // 전역 변수 사용
        }
    })
        .then(response => {
            alert('회원 정보가 성공적으로 업데이트되었습니다.');
        })
        .catch(error => {
            console.error('회원 정보 수정 실패:', error);
            alert('회원 정보 수정에 실패했습니다.');
        });
}

// 수정 취소 함수
function cancelEditUserInfo() {
    const userName = document.getElementById("user-name");
    const userEmail = document.getElementById("user-email");
    const userPhone = document.getElementById("user-phone");

    // 원본 정보로 되돌리기
    userName.innerText = originalUserInfo.name;
    userEmail.innerText = originalUserInfo.email;
    userPhone.innerText = originalUserInfo.phone;

    // 버튼 텍스트 변경 및 클릭 이벤트 변경
    const editButton = document.getElementById("edit-info-btn");
    editButton.innerHTML = "회원 정보 수정";
    editButton.setAttribute("onclick", "editUserInfo()");

    // 수정 취소 버튼 숨김
    const cancelButton = document.getElementById("cancel-info-btn");
    cancelButton.style.display = "none";
}

const signupPhone = document.getElementById("user-phone");
if (signupPhone) {
    signupPhone.addEventListener("input", function (e) {
        let phone = e.target.value.replace(/[^0-9]/g, '');  // 숫자만 추출
        if (phone.length > 3 && phone.length <= 6) {
            phone = phone.replace(/(\d{3})(\d{1,4})/, '$1-$2');  // 3자 + 1~4자
        } else if (phone.length > 6) {
            phone = phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');  // 3자 + 4자 + 4자
        }
        e.target.value = phone.slice(0, 13);  // 13자리 이상은 잘림
    });
}

// 장바구니 데이터 로드 함수
function loadCartData() {
    axios.get('http://localhost:8080/api/users/cart', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then(response => {
            const cartItems = response.data.result;
            const listGroup = document.querySelector('.list-group');

            listGroup.innerHTML = '';

            cartItems.forEach(item => {
                const listItem = document.createElement('li');
                listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

                listItem.onclick = function () {
                    window.location.href = `/html/details.html?id=${item.id}`;
                };

                const modelSpan = document.createElement('span');
                modelSpan.textContent = item.model;

                const removeButton = document.createElement('button');
                removeButton.textContent = '삭제';
                removeButton.classList.add('btn', 'btn-outline-danger', 'btn-sm');

                // 삭제 버튼 클릭 이벤트 (이벤트 버블링 방지)
                removeButton.onclick = function (event) {
                    event.stopPropagation(); // 리스트 클릭 이벤트 방지
                    removeCartItem(item.id);
                };

                listItem.appendChild(modelSpan);
                listItem.appendChild(removeButton);
                listGroup.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error("장바구니 데이터 로딩 실패:", error);
            alert('장바구니 데이터를 불러오는 데 실패했습니다.');
        });
}

// 구매 내역 데이터 로드 함수
function loadPurchaseData() {
    // 구매 요청 내역을 API에서 받아옴
    axios.get('http://localhost:8080/api/users/purchase', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then(response => {
            const purchases = response.data.result;  // 서버에서 받은 구매 내역 데이터
            const tbody = document.getElementById("purchase-list");  // 구매 내역을 표시할 tbody 요소

            purchases.forEach(purchase => {
                const tr = document.createElement('tr');  // 새로운 tr 생성

                // 자동차 열 생성
                const carTd = document.createElement('td');
                carTd.textContent = purchase.model;  // 자동차 모델
                tr.appendChild(carTd);

                // 문의일 열 생성
                const dateTd = document.createElement('td');
                dateTd.textContent = new Date(purchase.createdAt).toLocaleDateString();  // 날짜 포맷을 변환하여 표시
                tr.appendChild(dateTd);

                // 취소 버튼 생성
                const cancelButtonTd = document.createElement('td');
                const cancelButton = document.createElement('button');
                cancelButton.textContent = '취소';
                cancelButton.classList.add('btn', 'btn-outline-danger', 'btn-sm');

                // 취소 버튼 클릭 이벤트
                cancelButton.onclick = function (event) {
                    event.stopPropagation();  // 리스트 클릭 이벤트 방지
                    removePurchaseItem(purchase.id);
                };

                cancelButtonTd.appendChild(cancelButton);
                tr.appendChild(cancelButtonTd);

                // tr을 tbody에 추가
                tbody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error("구매 내역 로딩 실패:", error);
            alert('구매 내역을 불러오는 데 실패했습니다.');
        });
}

// 구매 요청 취소 (삭제)
function removePurchaseItem(purchaseId) {
    axios.delete(`http://localhost:8080/api/users/purchase/${purchaseId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then(response => {
            alert('구매 요청이 취소되었습니다.');
            window.location.reload();
        })
        .catch(error => {
            console.error("구매 요청 취소 실패:", error);
            alert('구매 요청을 취소하는 데 실패했습니다.');
        });
}

//장바구니 삭제
function removeCartItem(itemId) {
    axios.delete(`http://localhost:8080/api/users/cart/delete/${itemId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then(response => {
            alert('차량이 장바구니에서 삭제되었습니다.');
            loadCartData();
        })
        .catch(error => {
            console.error("장바구니에서 삭제 실패:", error);
            alert('장바구니에서 차량을 삭제하는 데 실패했습니다.');
        });
}
