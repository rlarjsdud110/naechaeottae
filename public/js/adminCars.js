let accessToken = null;

let currentPage = 1;
const itemsPerPage = 12;
let totalElements = 0;
let totalPages = 0;
let searchQuery = '';
document.addEventListener("DOMContentLoaded", function () {

    accessToken = localStorage.getItem('AccessToken');

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

    loadCarList();
});

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

async function loadCarList() {
    try {
        let response;

        if (searchQuery) {
            response = await axios.get(`http://localhost:8080/api/cars/search`, {
                params: {
                    size: itemsPerPage,
                    page: currentPage - 1,
                    sort: 'id,desc',
                    search: searchQuery,
                }
            });
        } else {
            response = await axios.get(`http://localhost:8080/api/cars/carList`, {
                params: {
                    size: itemsPerPage,
                    page: currentPage - 1,
                    sort: 'id,desc'
                }
            });
        }

        const data = response.data;
        totalElements = data.result.totalElements;
        totalPages = data.result.totalPages;

        renderCarList(data.result.content);
        renderPagination();
    } catch (error) {
        console.error('차량 리스트 불러오기 오류:', error);
    }
}

function renderCarList(cars) {
    const carListContainer = document.getElementById('car-list');
    carListContainer.innerHTML = '';

    if (cars.length === 0) {
        carListContainer.innerHTML = `<p style="text-align: center; font-size: 24px; font-weight: bold;">검색된 차량이 없습니다.</p>`;
        return;
    }

    cars.forEach(car => {
        let hotDealBadge = '';
        if (car.hotDeal) {
            hotDealBadge = `
                <div class="badge bg-danger text-white position-absolute" style="top: 0.5rem; right: 0.5rem;">
                    핫딜
                </div>
            `;
        }

        const carItem = document.createElement('div');
        carItem.classList.add('col-12', 'col-md-6', 'col-lg-4');
        carItem.innerHTML = `
            <div class="card shadow-sm position-relative mt-3 mb-3">
                ${hotDealBadge} <!-- 핫딜 배지 -->
                <img class="card-img-top" src="${car.imageUrl}" alt="${car.model}" style="width: 100%; height: 250px;">
                <div class="card-body p-3">
                    <h5 class="card-title mb-2">${car.model} (${car.modelYear}년식)</h5>
                    <p class="text-secondary mb-1"><strong>주행거리:</strong> ${car.mileage.toLocaleString()} km</p>
                    <p class="text-secondary mb-1"><strong>연료:</strong> ${car.fuelType}</p>
                    <div class="d-flex justify-content-start align-items-center" style="gap: 5px;"> 
                        <!-- 가격이 discountedPrice로 설정된 경우와 그렇지 않은 경우 분리 -->
                        ${car.discountedPrice > 0 ? `
                            <span class="text-muted text-decoration-line-through" style="font-size: 1rem;">
                                ${car.price.toLocaleString()} 만원
                            </span>
                            <span class="fw-bold text-danger" style="font-size: 1.2rem;">
                                ${car.discountedPrice.toLocaleString()} 만원
                            </span>
                        ` : `
                            <span class="fw-bold" style="font-size: 1.2rem;">
                                ${car.price.toLocaleString()} 만원
                            </span>
                        `}
                    </div>
                    <div class="card-footer p-2 mt-2 border-top-0 bg-transparent">
                        <div class="text-center">
                            <a class="btn btn-outline-dark mt-auto" href="/html/details.html?id=${car.id}">상세 정보</a>
                            <a class="btn btn-outline-dark mt-auto" href="/html/editCar.html?id=${car.id}">수정</a>
                            <button class="btn btn-danger mt-auto" data-id="${car.id}" onclick="deleteCarHandler(this)">삭제</button>
                            </div>
                    </div>                
                </div>
            </div>
        `;

        carListContainer.appendChild(carItem);
    });
}

function renderPagination() {
    const paginationContainer = document.getElementById('pagination');
    const pageNumbersContainer = document.getElementById('page-numbers');
    paginationContainer.style.display = 'block';
    pageNumbersContainer.innerHTML = '';

    const prevButton = document.getElementById('prev-page');
    prevButton.disabled = (currentPage === 1);
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadCarList();
        }
    });

    if (totalPages > 1) {
        const startPage = Math.max(1, currentPage - 1);
        const endPage = Math.min(totalPages, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.classList.add('btn', 'btn-outline-dark', 'mx-1');

            if (i === currentPage) {
                pageButton.classList.add('active');
            }

            pageButton.addEventListener('click', () => {
                currentPage = i;
                loadCarList();
            });

            pageNumbersContainer.appendChild(pageButton);
        }
    }

    const nextButton = document.getElementById('next-page');
    nextButton.disabled = (currentPage === totalPages || totalPages === 0);
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadCarList();
        }
    });
}

async function deleteCarHandler(button) {
    const carId = button.dataset.id;
    if (confirm("정말 삭제하시겠습니까?")) {
        await deleteCar(carId);
    }
}

async function deleteCar(carId) {
    try {
        await axios.delete(`http://localhost:8080/api/admin/car/${carId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        alert("삭제 완료!");
        loadCarList();
    } catch (error) {
        console.error("삭제 실패:", error);
        alert("삭제 실패!");
    }
}
