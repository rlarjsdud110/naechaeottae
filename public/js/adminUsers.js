let accessToken = null;

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchUser");
    const prevPageBtn = document.getElementById("prev-page");
    const nextPageBtn = document.getElementById("next-page");

    let currentPage = 0;
    let totalPages = 1;

    accessToken = localStorage.getItem("AccessToken");

    if (!accessToken || !checkAdminRole()) {
        alert('관리자만 접근 가능합니다.');
        window.location.href = '/login.html';
        return;
    }

    searchInput.addEventListener("input", function () {
        fetchUsers(0, searchInput.value);
    });


    prevPageBtn.addEventListener("click", function () {
        if (currentPage > 0) fetchUsers(currentPage - 1, searchInput.value);
    });

    nextPageBtn.addEventListener("click", function () {
        if (currentPage < totalPages - 1) fetchUsers(currentPage + 1, searchInput.value);
    });

    fetchUsers();
});

function fetchUsers(page = 0, searchQuery = "") {
    const url = `http://naechaeottae.shop/api/admin/users?page=${page}&size=10&search=${searchQuery}`;

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

function renderUserList(users) {
    const userList = document.getElementById("user-list");
    userList.innerHTML = "";

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

function checkAdminRole() {
    const adminRole = localStorage.getItem("Role");
    return adminRole === "ADMIN";
}

function toggleLoginState() {
    const isLoggedIn = localStorage.getItem("AccessToken");
    if (isLoggedIn) {
        localStorage.removeItem("AccessToken");
        localStorage.removeItem("Role");
        alert('로그아웃 완료');
    }
    window.location.href = '/login.html';
}
