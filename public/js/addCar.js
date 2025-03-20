const isHotDealCheckbox = document.getElementById("isHotDeal");
const discountedPriceInput = document.getElementById("discounted_price");
let accessToken = null;

document.addEventListener('DOMContentLoaded', () => {
    accessToken = localStorage.getItem("AccessToken");
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
});
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
    event.preventDefault();

    const formData = new FormData();

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

    const imageTypes = [];
    const imageFields = ["frontImage", "rearImage", "leftImage", "rightImage", "dashboardImage"];
    imageFields.forEach(field => {
        const fileInput = document.getElementById(field);
        if (fileInput.files.length > 0) {
            const type = field.replace("Image", "").toLowerCase();
            imageTypes.push(type);

            Array.from(fileInput.files).forEach(file => {
                formData.append("multipartFiles", file);
            });
        }
    });

    const dto = {
        usedCarDto: usedCarDto,
        carOptionsDto: carOptionsDto,
        imageTypes: imageTypes
    };

    formData.append("dto", new Blob([JSON.stringify(dto)], { type: "application/json" }));

    console.log("imageTypes:", imageTypes);
    if (imageTypes.length > 0) {
        formData.append("imageTypes", JSON.stringify(imageTypes));
    }

    try {
        const response = await axios.post("http://localhost:8080/api/admin/car/create", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${accessToken}`
            }
        });

        alert("등록 성공!");
        console.log(response.data);
        window.location.href = '/adminCars.html';
    } catch (error) {
        if (error.response && error.response.status === 403) {
            alert('토큰이 만료되었습니다. 다시 로그인해주세요.');
            window.location.href = '/login.html';
        } else {
            alert("등록 실패!");
        }
        console.error(error);
    }
});
