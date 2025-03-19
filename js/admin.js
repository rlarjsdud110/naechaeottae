let accessToken = null;
window.addEventListener('DOMContentLoaded', event => {
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {

        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
            localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
        });
    }
    accessToken = localStorage.getItem("AccessToken");
    if (!accessToken) {
        alert('관리자만 접근 가능합니다.');
        window.location.href = '../html/login.html';
        return;
    }

    const isAdmin = checkAdminRole();

    if (!isAdmin) {
        alert('관리자만 접근 가능합니다.');
        window.location.href = '../html/login.html';
        return;
    }
    fetchDashboardStats();
    fetchDashboardData();
});

function toggleLoginState() {
    const isLoggedIn = localStorage.getItem("AccessToken");

    if (isLoggedIn) {
        localStorage.removeItem("AccessToken");
        localStorage.removeItem("Role");
        alert('로그아웃 완료');
        window.location.href = '../html/login.html';
    } else {
        window.location.href = '../html/login.html';
    }
}

function fetchDashboardStats() {
    axios.get('http://localhost:8080/api/admin/dashboard', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }).then(response => {
        const data = response.data.result;

        document.getElementById('vehicleCount').textContent = `${data.vehicleCount}건`;
        document.getElementById('totalUsersCount').textContent = `${data.totalUsersCount}명`;
        document.getElementById('unresolvedConsultCount').textContent = `${data.unresolvedConsultCount}건`;
        document.getElementById('totalNoticesCount').textContent = `${data.totalNoticesCount}건`;
    }).catch(error => {
        if (error.response && error.response.status === 403) {
            alert('토큰이 만료되었습니다. 다시 로그인해주세요.');
            window.location.href = '../html/login.html';
        } else {
            alert("데이터를 불러오는 데 실패했습니다.");
        }
        console.error(error);
    });
}

function checkAdminRole() {
    const admin = localStorage.getItem("Role");
    return admin === "ADMIN";
}

function fetchDashboardData() {
    axios.get('http://localhost:8080/api/admin/recent', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }).then(response => {
        const data = response.data.result;

        if (data) {
            updateNoticeTable(data);
            updateCustomerTable(data);
            updateConsultationTable(data);
            updateVehicleTable(data);
        }
    })
        .catch(error => {
            console.error('데이터를 가져오는 데 오류가 발생했습니다.', error);
        });
}

function updateVehicleTable(cars) {
    const tableBody = document.querySelector('#recentCarsTable tbody');
    tableBody.innerHTML = ''; // 기존 데이터를 초기화

    cars.forEach(car => {
        // car 값이 null이 아니고 각 속성이 null이 아닌지 확인
        if (car && car.carModel && car.carModelYear && car.carPrice !== null && car.carCreatedAt) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${car.carModel}</td>
                <td>${car.carModelYear}</td>
                <td>${car.carPrice}</td>
                <td>${new Date(car.carCreatedAt).toLocaleDateString()}</td>
            `;
            tableBody.appendChild(row);
        }
    });
}

function updateConsultationTable(consultations) {
    const tableBody = document.querySelector('#recentConsultationsTable tbody');
    tableBody.innerHTML = ''; // 기존 데이터를 초기화

    consultations.forEach(consultation => {
        // consultation 값이 null이 아니고 각 속성이 null이 아닌지 확인
        if (consultation && consultation.consultEmail && consultation.consultTitle && consultation.consultStatus && consultation.consultCreatedAt) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${consultation.consultEmail}</td>
                <td>${consultation.consultTitle}</td>
                <td>${consultation.consultStatus}</td>
                <td>${new Date(consultation.consultCreatedAt).toLocaleDateString()}</td>
            `;
            tableBody.appendChild(row);
        }
    });
}

function updateNoticeTable(notices) {
    const tableBody = document.querySelector('#recentNoticesTable tbody');
    tableBody.innerHTML = ''; // 기존 데이터를 초기화

    notices.forEach(notice => {
        // notice 값이 null이 아니고 각 속성이 null이 아닌지 확인
        if (notice) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${notice.noticeTitle}</td>
                <td>${notice.noticeContent}</td>
                <td>${new Date(notice.noticeCreatedAt).toLocaleDateString()}</td>
            `;
            tableBody.appendChild(row);
        }
    });
}

function updateCustomerTable(customers) {
    const tableBody = document.querySelector('#recentCustomersTable tbody');
    tableBody.innerHTML = ''; // 기존 데이터를 초기화

    customers.forEach(customer => {
        if (customer) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.username}</td>
                <td>${customer.userEmail}</td>
                <td>${customer.userId}</td>
                <td>${new Date(customer.userCreatedAt).toLocaleDateString()}</td>
            `;
            tableBody.appendChild(row);
        }
    });
}
