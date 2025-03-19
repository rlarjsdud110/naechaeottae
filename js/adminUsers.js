let accessToken = null;

document.addEventListener("DOMContentLoaded", function () {
    // DOM 요소들 초기화
    const searchInput = document.getElementById("searchUser");
    const prevPageBtn = document.getElementById("prev-page");
    const nextPageBtn = document.getElementById("next-page");

    let currentPage = 0;
    let totalPages = 1;

    accessToken = localStorage.getItem("AccessToken");

    // 로그인 및 권한 체크
    if (!accessToken || !checkAdminRole()) {
        alert('관리자만 접근 가능합니다.');
        window.location.href = '../html/login.html';
        return;
    }

    // 검색 입력에 따라 유저 목록을 새로 고침
    searchInput.addEventListener("input", function () {
        fetchUsers(0, searchInput.value); // 페이지는 첫 페이지로 리셋
    });

    // 이전 페이지 버튼 클릭 시
    prevPageBtn.addEventListener("click", function () {
        if (currentPage > 0) fetchUsers(currentPage - 1, searchInput.value);
    });

    // 다음 페이지 버튼 클릭 시
    nextPageBtn.addEventListener("click", function () {
        if (currentPage < totalPages - 1) fetchUsers(currentPage + 1, searchInput.value);
    });

    // 초기 유저 목록 불러오기 (검색어 없이)
    fetchUsers();
});

// 유저 목록을 가져오는 함수
function fetchUsers(page = 0, searchQuery = "") {
    const url = `http://localhost:8080/api/admin/users?page=${page}&size=10&search=${searchQuery}`;

    axios.get(url, {
        headers: { "Authorization": `Bearer ${accessToken}` }
    })
        .then(response => {
            const { result } = response.data;
            totalPages = result.totalPages;
            currentPage = result.number;
            renderUserList(result.content);
            renderPagination();
        })
        .catch(error => console.error("Error fetching users:", error));
}

// 유저 목록을 렌더링하는 함수
function renderUserList(users) {
    const userList = document.getElementById("user-list");
    userList.innerHTML = "";  // 이전 데이터를 비움

    users.forEach(user => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.userId}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
        `;
        userList.appendChild(tr);
    });
}

// 페이지네이션 버튼을 렌더링하는 함수
function renderPagination() {
    const pageNumbers = document.getElementById("page-numbers");
    pageNumbers.innerHTML = `${currentPage + 1} / ${totalPages}`;

    const paginationContainer = document.getElementById("pagination");
    paginationContainer.style.display = totalPages > 1 ? "block" : "none";

    const prevPageBtn = document.getElementById("prev-page");
    const nextPageBtn = document.getElementById("next-page");
    prevPageBtn.disabled = currentPage === 0;
    nextPageBtn.disabled = currentPage === totalPages - 1;
}

// 관리자 권한 체크
function checkAdminRole() {
    const adminRole = localStorage.getItem("Role");
    return adminRole === "ADMIN";
}

// 로그인 상태 토글 함수
function toggleLoginState() {
    const isLoggedIn = localStorage.getItem("AccessToken");
    if (isLoggedIn) {
        localStorage.removeItem("AccessToken");
        localStorage.removeItem("Role");
        alert('로그아웃 완료');
    }
    window.location.href = '../html/login.html';
}
