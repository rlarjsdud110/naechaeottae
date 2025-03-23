let accessToken = '';
let isLoggedIn = false;
let userRole = null;

document.addEventListener("DOMContentLoaded", function () {
    accessToken = localStorage.getItem("AccessToken");
    if (accessToken) {
        isLoggedIn = true;
        userRole = localStorage.getItem("Role");
    }
    updateLoginState();
    loadCarDetail();
    loadRecommendedCars();
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
        alert('로그아웃 완료');
        isLoggedIn = false;
        window.location.href = '/login.html';
    } else {
        window.location.href = '/login.html';
    }

    updateLoginState();
}

function getCarIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

function displayCarDetail(carData) {
    document.querySelector('#car-model').textContent = `${carData.model} ${carData.modelYear}`;
    document.querySelector('#car-registration-number').textContent = `등록번호: ${carData.id}`;

    const viewCountElement = document.createElement('p');
    viewCountElement.textContent = `조회수: ${carData.viewCount}`;
    document.querySelector('#car-details').appendChild(viewCountElement);

    const price = carData.price ? carData.price : 0;
    const priceContainer = document.querySelector('#car-price');
    if (carData.hotDeal) {
        priceContainer.innerHTML = `
            <span class="text-muted text-decoration-line-through" style="font-size: 1.5rem;">
                ₩${price.toLocaleString()}만원
            </span>
            <span class="fw-bold text-danger ms-1" style="font-size: 1.8rem;">
                ₩${carData.discountedPrice.toLocaleString()}만원
            </span>
        `;
    } else {
        priceContainer.textContent = `₩${price.toLocaleString()}만원`;
    }

    const carInfoList = document.querySelector('#car-details');
    carInfoList.innerHTML = `
        <li><strong>제조사 : </strong> ${carData.carType}</li>
        <li><strong>연식 : </strong> ${carData.modelYear}년형</li>
        <li><strong>주행거리 : </strong> ${carData.mileage.toLocaleString()}km</li>
        <li><strong>연료 : </strong> ${carData.fuelType || '정보 없음'}</li>
        <li><strong>변속기 : </strong> ${carData.transmission || '정보 없음'}</li>
        <li><strong>색상 : </strong> ${carData.color || '정보 없음'}</li>
    `;

    const carOptionsContainer = document.querySelector('#car-options');
    const options = [
        { name: "전/후방 센서", key: "frontRearSensor", icon: "🚗" },
        { name: "후방 센서", key: "rearSensor", icon: "🚗" },
        { name: "전방 센서", key: "frontSensor", icon: "🚗" },
        { name: "열선 시트", key: "heatedSeat", icon: "🔥" },
        { name: "통풍 시트", key: "ventilatedSeat", icon: "❄️" },
        { name: "스마트키", key: "smartKey", icon: "🔑" },
        { name: "내비게이션", key: "navigation", icon: "🗺️" },
        { name: "LED 헤드라이트", key: "ledHeadlight", icon: "💡" },
        { name: "썬루프", key: "sunroof", icon: "☀️" }
    ];

    carOptionsContainer.innerHTML = '';
    options.forEach(option => {
        const optionElement = document.createElement('p');
        optionElement.classList.add('option');
        if (carData[option.key]) {
            optionElement.classList.add('active');
        } else {
            optionElement.classList.add('inactive');
        }
        optionElement.textContent = `${option.icon} ${option.name}`;
        carOptionsContainer.appendChild(optionElement);
    });

    const swiperWrapper = document.querySelector('#car-images');
    swiperWrapper.innerHTML = '';
    carData.imagesUrl.forEach(imageUrl => {
        const slide = document.createElement('div');
        slide.classList.add('swiper-slide');
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Car Image';
        slide.appendChild(img);
        swiperWrapper.appendChild(slide);
    });

    carImgSwiper();

    const wishlistBtn = document.getElementById('wishlist-btn');
    const heartIcon = wishlistBtn.querySelector('i');

    if (carData.cart) {
        heartIcon.classList.remove('bi-heart');
        heartIcon.classList.add('bi-heart-fill');
    } else {
        heartIcon.classList.remove('bi-heart-fill');
        heartIcon.classList.add('bi-heart');
    }
}

document.getElementById('wishlist-btn').addEventListener('click', function () {
    if (!isLoggedIn) {
        alert('로그인 후 이용 가능한 서비스입니다. 로그인 페이지로 이동합니다.');
        window.location.href = '/login.html';
    } else {
        const heartIcon = document.querySelector('#wishlist-btn i');
        const carId = getCarIdFromURL();

        if (heartIcon.classList.contains('bi-heart')) {
            axios.post(`https://naechaeottae.shop/api/users/cart/add/${carId}`, {}, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
                .then(response => {
                    heartIcon.classList.remove('bi-heart');
                    heartIcon.classList.add('bi-heart-fill');
                    alert('찜 목록에 추가되었습니다 마이페이지에서 확인해주세요.');
                })
                .catch(error => {
                    console.error('찜 추가 실패:', error);
                    alert('찜 추가에 실패했습니다.');
                });
        } else {
            axios.delete(`https://naechaeottae.shop/api/users/cart/delete/${carId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
                .then(response => {
                    heartIcon.classList.remove('bi-heart-fill');
                    heartIcon.classList.add('bi-heart');
                    alert('찜 목록에서 삭제되었습니다 마이페이지에서 확인해주세요');
                })
                .catch(error => {
                    console.error('찜 삭제 실패:', error);
                    alert('찜 삭제에 실패했습니다.');
                });
        }
    }
});

function carImgSwiper() {
    new Swiper(".swiper", {
        loop: true,
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
    });
}

function loadCarDetail() {
    const carId = getCarIdFromURL();

    const headers = accessToken ? {
        'Authorization': `Bearer ${accessToken}`
    } : {};

    axios.get(`https://naechaeottae.shop/api/cars/detail/${carId}`, { headers })
        .then(response => {
            const carData = response.data.result;
            displayCarDetail(carData);
        })
        .catch(error => {
            console.error('차량 정보를 불러오는 데 실패했습니다:', error);
            alert('차량 정보를 불러오는데 실패했습니다.');
        });
}

function loadRecommendedCars() {
    axios.get('https://naechaeottae.shop/api/cars/recommend')
        .then(response => {
            const recommendedCars = response.data.result;
            displayRecommendedCars(recommendedCars);
        })
        .catch(error => {
            console.error('추천 차량 정보를 불러오는 데 실패했습니다:', error);
            alert('추천 차량 정보를 불러오는데 실패했습니다.');
        });
}

function displayRecommendedCars(cars) {
    const container = document.getElementById('car-cards-container');
    container.innerHTML = '';

    cars.forEach(car => {
        const carCard = document.createElement('div');
        carCard.classList.add('col');
        let hotDealBadge = '';
        if (car.hotDeal) {
            hotDealBadge = `
                <div class="badge bg-danger text-white position-absolute" style="top: 0.5rem; right: 0.5rem;">
                    핫딜
                </div>
            `;
        }
        const isHotDeal = car.hotDeal && car.discountedPrice > 0;
        const priceHTML = isHotDeal ? `
            <p>
                <span class="text-muted text-decoration-line-through" style="font-size: 0.9rem;">
                    ₩${car.price.toLocaleString()}만원
                </span>
                <span class="fw-bold text-danger ms-1" style="font-size: 1.2rem;">
                    ₩${car.discountedPrice.toLocaleString()}만원
                </span>
            </p>` : `
            <p>
                <span class="fw-bold ms-1" style="font-size: 1.2rem;">
                    ₩${car.price.toLocaleString()}만원
                </span>
            </p>`;

        const carCardHTML = `
            <div class="card h-100 shadow-sm">
            ${hotDealBadge} 
                <img src="${car.imageUrl}" class="card-img-top" alt="${car.model} 이미지">
                <div class="card-body">
                    <h5 class="card-title">${car.model}</h5>
                    ${priceHTML}
                </div>
                <div class="card-footer p-2 border-top-0 bg-transparent">
                    <div class="text-center mb-2"><a class="btn btn-outline-dark " href="/details.html?id=${car.id}">상세 정보</a></div>
                </div>
            </div>
        `;

        carCard.innerHTML = carCardHTML;
        container.appendChild(carCard);
    });
}

function viewCarDetail(carId) {
    window.location.href = `car-detail.html?id=${carId}`;
}

function showPurchaseModal() {
    const purchaseModal = new bootstrap.Modal(document.getElementById('purchaseModal'));
    purchaseModal.show();
}

document.getElementById('purchaseRequestBtn').addEventListener('click', function () {
    if (!isLoggedIn) {
        alert('로그인 후 구매 요청을 하실 수 있습니다.');
        window.location.href = '/login.html';
        return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');

    axios.post(`https://naechaeottae.shop/api/users/purchase/${carId}`, {}, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
        .then(response => {
            alert('구매 요청이 성공적으로 접수되었습니다.');
            window.location.reload();
        })
        .catch(error => {
            if (error.response && error.response.data && error.response.data.resultCode) {
                alert('이미 이 차량에 대한 구매 요청이 존재합니다.');
            } else {
                console.error('차량 정보를 불러오는 데 실패했습니다:', error);
                alert('차량 정보를 불러오는데 실패했습니다.');
            }
        });
});
