let accessToken = null;

document.addEventListener("DOMContentLoaded", function () {
    accessToken = localStorage.getItem("AccessToken");
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

function updateLoginState() {
    if (isLoggedIn) {
        document.getElementById('login-logout-btn').textContent = '로그아웃';
    } else {
        document.getElementById('login-logout-btn').textContent = '로그인';
    }
}

function toggleLoginState() {
    if (isLoggedIn) {
        localStorage.removeItem("AccessToken");
        alert('로그아웃 완료');
        isLoggedIn = false;
        window.location.href = '/index.html';
    } else {
        window.location.href = '/login.html';
    }

    updateLoginState();
}

function loadConsultData() {
    axios.get('http://13.124.146.78:8080/api/consult/list', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then(response => {
            const inquiries = response.data.result;
            const tbody = document.querySelector('tbody');

            inquiries.forEach(inquiry => {
                const tr = document.createElement('tr');

                const titleTd = document.createElement('td');
                titleTd.textContent = inquiry.title;
                tr.appendChild(titleTd);

                const dateTd = document.createElement('td');
                dateTd.textContent = new Date(inquiry.createdAt).toLocaleDateString();
                tr.appendChild(dateTd);

                const actionTd = document.createElement('td');

                const taskBadge = document.createElement('span');
                taskBadge.classList.add('badge');
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

                actionTd.appendChild(taskBadge);
                tr.appendChild(actionTd);

                tr.onclick = function () {
                    window.location.href = `requestDetails.html?id=${inquiry.id}`;
                };

                tbody.appendChild(tr);
            });
        })
        .catch(error => {
            if (error.response && error.response.status === 403) {
                alert("토큰이 만료되었습니다. 로그인 페이지로 이동합니다.");
                localStorage.removeItem("AccessToken");
                window.location.href = "/login.html";
            } else {
                console.error("문의 내역 로딩 실패:", error);
                alert('문의 내역을 불러오는 데 실패했습니다.');
            }
        });
}

function loadUserInfo() {
    if (!accessToken) {
        alert("토큰이 만료되었습니다. 다시 로그인해 주세요.");
        window.location.href = "/index.html";
        return;
    }

    axios.get('http://13.124.146.78:8080/api/users/userInfo', {
        headers: {
            Authorization: `Bearer ${accessToken}`
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

            if (error.response && error.response.data && error.response.data.resultCode === "USER_NOT_FOUND") {
                alert("사용자를 찾을 수 없습니다. 다시 로그인해 주세요.");
                localStorage.removeItem("AccessToken");
                window.location.href = "/index.html";
            }
        });
}

let originalUserInfo = {};

function editUserInfo() {
    const userName = document.getElementById("user-name");
    const userEmail = document.getElementById("user-email");
    const userPhone = document.getElementById("user-phone");

    originalUserInfo = {
        name: userName.innerHTML,
        email: userEmail.innerHTML,
        phone: userPhone.innerHTML
    };

    userName.innerHTML = `<input type="text" id="edit-name" value="${userName.innerHTML}" class="form-control">`;
    userEmail.innerHTML = `<input type="email" id="edit-email" value="${userEmail.innerHTML}" class="form-control">`;
    userPhone.innerHTML = `<input type="tel" id="edit-phone" value="${userPhone.innerHTML}" class="form-control">`;

    const editButton = document.getElementById("edit-info-btn");
    editButton.innerHTML = "수정 완료";
    editButton.setAttribute("onclick", "saveUserInfo()");

    const cancelButton = document.getElementById("cancel-info-btn");
    cancelButton.style.display = "inline-block";
    cancelButton.setAttribute("onclick", "cancelEditUserInfo()");
}

function saveUserInfo() {
    const updatedName = document.getElementById("edit-name").value;
    const updatedEmail = document.getElementById("edit-email").value;
    const updatedPhone = document.getElementById("edit-phone").value;

    document.getElementById("user-name").innerText = updatedName;
    document.getElementById("user-email").innerText = updatedEmail;
    document.getElementById("user-phone").innerText = updatedPhone;

    const editButton = document.getElementById("edit-info-btn");
    editButton.innerHTML = "회원 정보 수정";
    editButton.setAttribute("onclick", "editUserInfo()");

    const cancelButton = document.getElementById("cancel-info-btn");
    cancelButton.style.display = "none";

    axios.put('http://13.124.146.78:8080/api/users/update', {
        name: updatedName,
        email: updatedEmail,
        phone: updatedPhone
    }, {
        headers: {
            Authorization: `Bearer ${accessToken}`
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

function cancelEditUserInfo() {
    const userName = document.getElementById("user-name");
    const userEmail = document.getElementById("user-email");
    const userPhone = document.getElementById("user-phone");

    userName.innerText = originalUserInfo.name;
    userEmail.innerText = originalUserInfo.email;
    userPhone.innerText = originalUserInfo.phone;

    const editButton = document.getElementById("edit-info-btn");
    editButton.innerHTML = "회원 정보 수정";
    editButton.setAttribute("onclick", "editUserInfo()");

    const cancelButton = document.getElementById("cancel-info-btn");
    cancelButton.style.display = "none";
}

const signupPhone = document.getElementById("user-phone");
if (signupPhone) {
    signupPhone.addEventListener("input", function (e) {
        let phone = e.target.value.replace(/[^0-9]/g, '');
        if (phone.length > 3 && phone.length <= 6) {
            phone = phone.replace(/(\d{3})(\d{1,4})/, '$1-$2');
        } else if (phone.length > 6) {
            phone = phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        }
        e.target.value = phone.slice(0, 13);
    });
}

function loadCartData() {
    axios.get('http://13.124.146.78:8080/api/users/cart', {
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
                    window.location.href = `/details.html?id=${item.id}`;
                };

                const modelSpan = document.createElement('span');
                modelSpan.textContent = item.model;

                const removeButton = document.createElement('button');
                removeButton.textContent = '삭제';
                removeButton.classList.add('btn', 'btn-outline-danger', 'btn-sm');

                removeButton.onclick = function (event) {
                    event.stopPropagation();
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

function loadPurchaseData() {
    axios.get('http://13.124.146.78:8080/api/users/purchase', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then(response => {
            const purchases = response.data.result;
            const tbody = document.getElementById("purchase-list");

            purchases.forEach(purchase => {
                const tr = document.createElement('tr');

                const carTd = document.createElement('td');
                carTd.textContent = purchase.model;
                tr.appendChild(carTd);

                const dateTd = document.createElement('td');
                dateTd.textContent = new Date(purchase.createdAt).toLocaleDateString();
                tr.appendChild(dateTd);

                const cancelButtonTd = document.createElement('td');
                const cancelButton = document.createElement('button');
                cancelButton.textContent = '취소';
                cancelButton.classList.add('btn', 'btn-outline-danger', 'btn-sm');

                cancelButton.onclick = function (event) {
                    event.stopPropagation();
                    removePurchaseItem(purchase.id);
                };

                cancelButtonTd.appendChild(cancelButton);
                tr.appendChild(cancelButtonTd);

                tbody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error("구매 내역 로딩 실패:", error);
            alert('구매 내역을 불러오는 데 실패했습니다.');
        });
}

function removePurchaseItem(purchaseId) {
    axios.delete(`http://13.124.146.78:8080/api/users/purchase/${purchaseId}`, {
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

function removeCartItem(itemId) {
    axios.delete(`http://13.124.146.78:8080/api/users/cart/delete/${itemId}`, {
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
