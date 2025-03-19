let accessToken = '';  // 전역 변수로 선언
let isLoggedIn = false;
let userRole = null;

document.addEventListener("DOMContentLoaded", function () {
    // AccessToken 확인 및 로그인 상태 초기화
    accessToken = localStorage.getItem("AccessToken");
    if (accessToken) {
        isLoggedIn = true;
        userRole = localStorage.getItem("Role");
    }
    updateLoginState();
    loadCarDetail(); // 페이지 로드 시 차량 상세 정보 불러오기
    loadRecommendedCars();
});

// 로그인/로그아웃 상태 업데이트 함수
function updateLoginState() {
    // 로그인/로그아웃 상태에 따라 버튼 변경
    if (isLoggedIn) {
        document.getElementById('login-logout-btn').textContent = '로그아웃';

        // 역할에 따라 버튼을 변경
        if (userRole === 'ADMIN') {
            document.getElementById('admin-page-btn').style.display = 'inline-block';
            document.getElementById('my-page-btn').style.display = 'none'; // 마이페이지는 숨김
        } else if (userRole === 'USER') {
            document.getElementById('admin-page-btn').style.display = 'none'; // 관리자페이지 숨김
            document.getElementById('my-page-btn').style.display = 'inline-block'; // 마이페이지 표시
        }
    } else {
        document.getElementById('login-logout-btn').textContent = '로그인';
        document.getElementById('my-page-btn').style.display = 'none';
        document.getElementById('admin-page-btn').style.display = 'none'; // 로그아웃 상태에서는 관리자 버튼도 숨김
    }
}

// 로그인 상태 토글 함수
function toggleLoginState() {
    if (isLoggedIn) {
        // 로그아웃 처리
        localStorage.removeItem("AccessToken");
        alert('로그아웃 완료');
        isLoggedIn = false;
        window.location.href = '../html/login.html';
    } else {
        // 로그인 상태에서 로그아웃 처리 후 페이지 갱신
        window.location.href = '../html/login.html';  // 로그인 페이지로 리다이렉트
    }

    // 로그인 상태 갱신 (로그아웃 후 상태 변경)
    updateLoginState();
}

// URL에서 id 값 추출
function getCarIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id'); // "id" 파라미터 값 반환
}

// 차량 상세 정보를 화면에 표시
function displayCarDetail(carData) {
    // 자동차 모델명, 등록번호 등 업데이트
    document.querySelector('#car-model').textContent = `${carData.model} ${carData.modelYear}`;
    document.querySelector('#car-registration-number').textContent = `등록번호: ${carData.id}`;

    // 조회수 표시 추가
    const viewCountElement = document.createElement('p');
    viewCountElement.textContent = `조회수: ${carData.viewCount}`;
    document.querySelector('#car-details').appendChild(viewCountElement);  // 차량 세부 정보 목록에 추가

    // 가격 처리 (핫딜일 경우 할인 가격 표시)
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

    // 자동차 세부 정보 업데이트
    const carInfoList = document.querySelector('#car-details');
    carInfoList.innerHTML = `
        <li><strong>제조사 : </strong> ${carData.carType}</li>
        <li><strong>연식 : </strong> ${carData.modelYear}년형</li>
        <li><strong>주행거리 : </strong> ${carData.mileage.toLocaleString()}km</li>
        <li><strong>연료 : </strong> ${carData.fuelType || '정보 없음'}</li>
        <li><strong>변속기 : </strong> ${carData.transmission || '정보 없음'}</li>
        <li><strong>색상 : </strong> ${carData.color || '정보 없음'}</li>
    `;

    // 자동차 옵션 업데이트
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

    carOptionsContainer.innerHTML = ''; // 기존 옵션 초기화
    options.forEach(option => {
        const optionElement = document.createElement('p');
        optionElement.classList.add('option');
        if (carData[option.key]) {
            optionElement.classList.add('active');
        } else {
            optionElement.classList.add('inactive');
        }
        optionElement.textContent = `${option.icon} ${option.name}`; // 아이콘 변경
        carOptionsContainer.appendChild(optionElement);
    });

    // 자동차 이미지 슬라이더 업데이트
    const swiperWrapper = document.querySelector('#car-images');
    swiperWrapper.innerHTML = ''; // 기존 이미지 초기화
    carData.imagesUrl.forEach(imageUrl => {
        const slide = document.createElement('div');
        slide.classList.add('swiper-slide');
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Car Image';
        slide.appendChild(img);
        swiperWrapper.appendChild(slide);
    });

    // 스와이퍼 초기화
    carImgSwiper();

    const wishlistBtn = document.getElementById('wishlist-btn');
    const heartIcon = wishlistBtn.querySelector('i');

    if (carData.cart) {
        // 찜하기 상태 활성화
        heartIcon.classList.remove('bi-heart');
        heartIcon.classList.add('bi-heart-fill');
    } else {
        // 찜하기 상태 비활성화
        heartIcon.classList.remove('bi-heart-fill');
        heartIcon.classList.add('bi-heart');
    }
}

// 찜하기 버튼 클릭 처리
document.getElementById('wishlist-btn').addEventListener('click', function () {
    if (!isLoggedIn) {
        alert('로그인 후 이용 가능한 서비스입니다. 로그인 페이지로 이동합니다.');
        window.location.href = '../html/login.html';  // 로그인 페이지로 리다이렉트
    } else {
        const heartIcon = document.querySelector('#wishlist-btn i');  // 하트 아이콘 선택
        const carId = getCarIdFromURL();  // 차량 ID 가져오기

        // 찜하기 상태에 따라 아이콘 변경
        if (heartIcon.classList.contains('bi-heart')) {
            // 찜 추가 요청 (POST)
            axios.post(`http://localhost:8080/api/users/cart/add/${carId}`, {}, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
                .then(response => {
                    heartIcon.classList.remove('bi-heart');  // 빈 하트 아이콘 제거
                    heartIcon.classList.add('bi-heart-fill');  // 꽉 찬 하트 아이콘 추가
                    alert('찜 목록에 추가되었습니다 마이페이지에서 확인해주세요.');
                })
                .catch(error => {
                    console.error('찜 추가 실패:', error);
                    alert('찜 추가에 실패했습니다.');
                });
        } else {
            // 찜 삭제 요청 (DELETE)
            axios.delete(`http://localhost:8080/api/users/cart/delete/${carId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
                .then(response => {
                    heartIcon.classList.remove('bi-heart-fill');  // 꽉 찬 하트 아이콘 제거
                    heartIcon.classList.add('bi-heart');  // 빈 하트 아이콘 추가
                    alert('찜 목록에서 삭제되었습니다 마이페이지에서 확인해주세요');
                })
                .catch(error => {
                    console.error('찜 삭제 실패:', error);
                    alert('찜 삭제에 실패했습니다.');
                });
        }
    }
});

// 슬라이더 함수
function carImgSwiper() {
    new Swiper(".swiper", {
        loop: true,  // 무한 루프
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

// 서버에서 차량 상세 정보를 불러오는 함수
function loadCarDetail() {
    const carId = getCarIdFromURL();

    // accessToken이 있을 때만 헤더에 Authorization 추가
    const headers = accessToken ? {
        'Authorization': `Bearer ${accessToken}`
    } : {};

    // 서버에서 차량 상세 정보를 받아오기 (Axios 예시)
    axios.get(`http://localhost:8080/api/cars/detail/${carId}`, { headers })
        .then(response => {
            // 서버에서 받은 차량 데이터 처리
            const carData = response.data.result;
            displayCarDetail(carData);
        })
        .catch(error => {
            console.error('차량 정보를 불러오는 데 실패했습니다:', error);
            alert('차량 정보를 불러오는데 실패했습니다.');
        });
}

// 추천 차량 데이터를 불러오는 함수
function loadRecommendedCars() {
    axios.get('http://localhost:8080/api/cars/recommend')  // 추천 차량 API 호출
        .then(response => {
            const recommendedCars = response.data.result;  // 추천 차량 데이터
            displayRecommendedCars(recommendedCars);  // 추천 차량 카드 표시
        })
        .catch(error => {
            console.error('추천 차량 정보를 불러오는 데 실패했습니다:', error);
            alert('추천 차량 정보를 불러오는데 실패했습니다.');
        });
}

function displayRecommendedCars(cars) {
    const container = document.getElementById('car-cards-container');
    container.innerHTML = '';  // 기존 카드 초기화

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
        // 가격 처리
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
                    <div class="text-center mb-2"><a class="btn btn-outline-dark " href="/html/details.html?id=${car.id}">상세 정보</a></div>
                </div>
            </div>
        `;

        carCard.innerHTML = carCardHTML;
        container.appendChild(carCard);
    });
}

// 차량 상세 페이지로 이동하는 함수
function viewCarDetail(carId) {
    window.location.href = `car-detail.html?id=${carId}`;
}

function showPurchaseModal() {
    const purchaseModal = new bootstrap.Modal(document.getElementById('purchaseModal'));
    purchaseModal.show();
}

// 구매 요청 버튼 클릭 이벤트
document.getElementById('purchaseRequestBtn').addEventListener('click', function () {
    if (!isLoggedIn) {
        alert('로그인 후 구매 요청을 하실 수 있습니다.');
        window.location.href = '../html/login.html';  // 로그인 페이지로 리다이렉트
        return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');

    // Axios를 사용하여 POST 요청 보내기
    axios.post(`http://localhost:8080/api/users/purchase/${carId}`, {}, {
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
                // 서버에서 반환한 오류 메시지
                alert('이미 이 차량에 대한 구매 요청이 존재합니다.');
            } else {
                // 일반적인 오류 처리
                console.error('차량 정보를 불러오는 데 실패했습니다:', error);
                alert('차량 정보를 불러오는데 실패했습니다.');
            }
        });
});
