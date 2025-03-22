let isLoggedIn = false;
let userRole = null;

document.addEventListener("DOMContentLoaded", function () {
    fetchRankingData();
    fetchHotDeals();
    fetchNotices();

    const accessToken = localStorage.getItem("AccessToken");
    if (accessToken) {
        isLoggedIn = true;
        userRole = localStorage.getItem("Role");
    }

    updateLoginState();
});

function updateLoginState() {
    if (isLoggedIn) {
        document.getElementById('login-logout-btn').textContent = '로그아웃';

        if (userRole === 'ADMIN') {
            document.getElementById('admin-page-btn').style.display = 'inline-block';
            document.getElementById('my-page-btn').style.display = 'none';
        } else if (userRole === 'USER') {
            document.getElementById('admin-page-btn').style.display = 'none';
            document.getElementById('my-page-btn').style.display = 'inline-block';
        }
    } else {
        document.getElementById('login-logout-btn').textContent = '로그인';
        document.getElementById('my-page-btn').style.display = 'none';
        document.getElementById('admin-page-btn').style.display = 'none';
    }
}

function toggleLoginState() {
    if (isLoggedIn) {
        localStorage.removeItem("AccessToken");
        localStorage.removeItem("Role");
        alert('로그아웃 완료');
        isLoggedIn = false;
    } else {
        window.location.href = '/login.html';
    }

    updateLoginState();
}

async function fetchNotices() {
    try {
        const response = await axios.get('https://naechaeottae.shop/api/notice/list');
        const { resultCode, result } = response.data;

        const swiperWrapper = document.querySelector('.swiper-wrapper');
        if (!swiperWrapper) {
            console.error('Swiper wrapper 요소를 찾을 수 없습니다.');
            return;
        }

        if (resultCode === "SUCCESS" && result) {
            swiperWrapper.innerHTML = '';


            const colors = [
                { backgroundColor: '#d1ecf1', borderColor: '#bee5eb', color: '#0c5460' },
                { backgroundColor: '#fff3cd', borderColor: '#ffeeba', color: '#856404' },
                { backgroundColor: '#f8d7da', borderColor: '#f5c6cb', color: '#721c24' },
            ];

            result.forEach((notice, index) => {
                const slide = document.createElement('div');
                slide.classList.add('swiper-slide');

                const noticeDiv = document.createElement('div');
                noticeDiv.classList.add('notice-card');

                const colorIndex = index % colors.length;
                const { backgroundColor, borderColor, color } = colors[colorIndex];

                noticeDiv.style.backgroundColor = backgroundColor;
                noticeDiv.style.borderColor = borderColor;
                noticeDiv.style.color = color;

                noticeDiv.innerHTML = `
                <a href="javascript:void(0);" class="text-decoration-none">${notice.title}</a>
                <p>${notice.content}</p>`;

                slide.appendChild(noticeDiv);
                swiperWrapper.appendChild(slide);
            });

            new Swiper(".notice", {
                slidesPerView: 1,
                spaceBetween: 10,
                loop: true,
                autoplay: {
                    delay: 3500,
                    disableOnInteraction: false,
                },
            });
        } else {
            console.error('공지사항 데이터를 가져오는 데 실패했습니다.');
        }
    } catch (error) {
        console.error('공지사항 데이터 요청 중 오류 발생:', error);
    }
}

async function fetchRankingData() {
    try {
        const response = await axios.get('https://naechaeottae.shop/api/cars/rankings');
        const { resultCode, result } = response.data;

        if (resultCode === "SUCCESS" && result) {
            const { viewRankings, recentRankings } = result;

            if (viewRankings && Array.isArray(viewRankings)) {
                viewRankings.sort((a, b) => b.viewCount - a.viewCount);

                const viewRankingsList = document.getElementById('viewRankings');
                viewRankingsList.innerHTML = '';
                viewRankings.forEach((ranking, index) => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `<a href="/html/details.html?id=${ranking.id}">${index + 1}. ${ranking.model}</a>`;
                    viewRankingsList.appendChild(listItem);
                });
            }

            if (recentRankings && Array.isArray(recentRankings)) {
                const recentRankingsList = document.getElementById('recentRankings');
                recentRankingsList.innerHTML = '';
                recentRankings.forEach((ranking, index) => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `<a href="/html/details.html?id=${ranking.id}">${index + 1}. ${ranking.model}</a>`;
                    recentRankingsList.appendChild(listItem);
                });
            }
        } else {
            console.error('순위 데이터를 가져오는 데 실패했습니다.');
        }
    } catch (error) {
        console.error('순위 데이터 요청 중 오류 발생:', error);
    }
}

const carsPerPage = 4;
let currentPage = 1;
let cars = [];
let totalPages = 0;

const carList = document.getElementById('car-list');
const pagination = document.getElementById('pagination');
const prevButton = document.getElementById('prev-page');
const nextButton = document.getElementById('next-page');
const pageNumbers = document.getElementById('page-numbers');

async function fetchHotDeals() {
    try {
        const response = await axios.get('https://naechaeottae.shop/api/cars/hotDeals');
        const { resultCode, result } = response.data;

        if (resultCode === 'SUCCESS') {
            cars = result.map(car => ({
                ...car,
                year: car.modelYear,
                fuel: car.fuelType
            }));

            totalPages = Math.ceil(cars.length / carsPerPage);
            initPagination();
        } else {
            console.error('핫딜 데이터를 불러오는 데 실패했습니다.');
        }
    } catch (error) {
        console.error('핫딜 데이터 요청 중 오류 발생:', error);
    }
}

function createPagination() {
    pageNumbers.innerHTML = '';
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageNumber = document.createElement('button');
        pageNumber.classList.add('btn', 'btn-outline-dark', 'mx-1');
        pageNumber.innerText = i;

        if (i === currentPage) {
            pageNumber.classList.add('active');
        }

        pageNumber.addEventListener('click', () => changePage(i));
        pageNumbers.appendChild(pageNumber);
    }
}

function changePage(page) {
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    renderCars();
    updatePaginationButtons();
    createPagination();
}

function renderCars() {
    carList.innerHTML = '';
    const startIndex = (currentPage - 1) * carsPerPage;
    const endIndex = startIndex + carsPerPage;
    const carsToDisplay = cars.slice(startIndex, endIndex);

    carsToDisplay.forEach(car => {
        const carCard = document.createElement('div');
        carCard.classList.add('col', 'mb-4');
        const isHotDeal = car.isHotDeal && car.discountedPrice > 0;

        const hotDealBadge = isHotDeal ? `
            <div class="badge bg-danger text-white position-absolute" style="top: 0.5rem; right: 0.5rem;">
                핫딜
            </div>` : '';

        const priceHTML = isHotDeal ? `
            <p>
                <span class="text-muted text-decoration-line-through" style="font-size: 0.9rem;">
                    ${car.price.toLocaleString()}만원
                </span>
                <span class="fw-bold text-danger ms-1" style="font-size: 1.2rem;">
                    ${car.discountedPrice.toLocaleString()}만원
                </span>
            </p>` : `
            <p>
                <span class="fw-bold text-danger ms-1" style="font-size: 1.2rem;">
                    ${car.price.toLocaleString()}만원
                </span>
            </p>`;

        carCard.innerHTML = `
            <div class="card">
                <img class="card-img-top" src="${car.imagesUrls}" alt="${car.model}" />
                ${hotDealBadge}
                <div class="card-body p-2">
                    <h5 class="fw-bolder">${car.model} (${car.year}년식)</h5>
                    <p><strong class="text-secondary">주행거리:</strong> ${car.mileage.toLocaleString()}km</p>
                    <p><strong class="text-secondary">연료 타입:</strong> ${car.fuel}</p>
                    ${priceHTML}
                </div>
                <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
                    <div class="text-center"><a class="btn btn-outline-dark mt-auto" href="/html/details.html?id=${car.id}">상세 정보</a></div>
                </div>
            </div>
        `;

        carList.appendChild(carCard);
    });
}


function updatePaginationButtons() {
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
    pagination.style.display = totalPages > 1 ? 'block' : 'none';
}

prevButton.addEventListener('click', () => changePage(currentPage - 1));
nextButton.addEventListener('click', () => changePage(currentPage + 1));

function initPagination() {
    createPagination();
    renderCars();
    updatePaginationButtons();
}
