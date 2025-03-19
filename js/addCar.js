const isHotDealCheckbox = document.getElementById("isHotDeal");
const discountedPriceInput = document.getElementById("discounted_price");
let accessToken = null;

document.addEventListener('DOMContentLoaded', () => {
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
function checkAdminRole() {
    const admin = localStorage.getItem("Role");
    return admin === "ADMIN";
}

isHotDealCheckbox.addEventListener("change", function () {
    if (this.checked) {
        discountedPriceInput.disabled = false;
    } else {
        discountedPriceInput.disabled = true;
    }
});

document.getElementById("carForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // 기본 폼 제출 방지

    // FormData 객체 생성
    const formData = new FormData();

    // usedCarDto 데이터 추가
    const usedCarDto = {
        model: document.getElementById("model").value,
        carType: document.getElementById("carType").value,
        transmission: document.getElementById("transmission").value,
        licensePlate: document.getElementById("licensePlate").value,
        engine: document.getElementById("engine").value,
        color: document.getElementById("color").value,
        modelYear: document.getElementById("modelYear").value,
        mileage: document.getElementById("mileage").value,
        price: document.getElementById("price").value,
        discountedPrice: document.getElementById("discounted_price").value || 0,
        fuelType: document.getElementById("fuelType").value,
        isHotDeal: document.getElementById("isHotDeal").checked,
    };

    // carOptionsDto 데이터 추가 (체크된 옵션만 추가)
    const carOptionsDto = {
        frontRearSensor: document.getElementById("frontRearSensor").checked,
        rearSensor: document.getElementById("rearSensor").checked,
        frontSensor: document.getElementById("frontSensor").checked,
        heatedSeat: document.getElementById("heatedSeat").checked,
        ventilatedSeat: document.getElementById("ventilatedSeat").checked,
        smartKey: document.getElementById("smartKey").checked,
        navigation: document.getElementById("navigation").checked,
        ledHeadlight: document.getElementById("ledHeadlight").checked,
        sunroof: document.getElementById("sunroof").checked,
    };

    // imageTypes 배열 생성
    const imageTypes = [];
    const imageFields = ["frontImage", "rearImage", "leftImage", "rightImage", "dashboardImage"];
    imageFields.forEach(field => {
        const fileInput = document.getElementById(field);
        if (fileInput.files.length > 0) {
            const type = field.replace("Image", "").toLowerCase(); // 이미지 필드에서 타입 추출
            imageTypes.push(type); // 이미지 타입을 imageTypes 배열에 추가

            // 해당 이미지 파일들을 FormData에 추가
            Array.from(fileInput.files).forEach(file => {
                formData.append("multipartFiles", file); // 파일 추가
            });
        }
    });

    // DTO 객체로 묶어서 하나로 추가
    const dto = {
        usedCarDto: usedCarDto,
        carOptionsDto: carOptionsDto,
        imageTypes: imageTypes
    };

    // DTO를 FormData에 추가 (JSON으로 전송)
    formData.append("dto", new Blob([JSON.stringify(dto)], { type: "application/json" }));

    // imageTypes 값 확인 (디버깅)
    console.log("imageTypes:", imageTypes);
    if (imageTypes.length > 0) {
        formData.append("imageTypes", JSON.stringify(imageTypes)); // imageTypes 배열도 추가
    }

    try {
        // POST 요청 전송
        const response = await axios.post("http://localhost:8080/api/admin/car/create", formData, {
            headers: {
                "Content-Type": "multipart/form-data", // 파일과 함께 보내는 데이터의 Content-Type
                "Authorization": `Bearer ${accessToken}` // 토큰 추가
            }
        });

        // 성공 시 알림
        alert("등록 성공!");
        console.log(response.data);
        window.location.href = '../html/adminCars.html';
    } catch (error) {
        // 에러 처리
        if (error.response && error.response.status === 403) {
            alert('토큰이 만료되었습니다. 다시 로그인해주세요.');
            window.location.href = '../html/login.html';
        } else {
            alert("등록 실패!");
        }
        console.error(error);
    }
});
