let accessToken = null;
const isHotDealCheckbox = document.getElementById("isHotDeal");
const discountedPriceInput = document.getElementById("discounted_price");

document.addEventListener('DOMContentLoaded', function () {
    accessToken = localStorage.getItem('AccessToken');

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
    fetchCarDetails();
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
        window.location.href = '../html/login.html';
    } else {
        window.location.href = '../html/login.html';
    }
}

function fetchCarDetails() {
    const carId = getCarIdFromURL();

    axios.get(`http://localhost:8080/api/cars/detail/${carId}`, {

    })
        .then(response => {
            const carData = response.data.result;
            document.getElementById('model').value = carData.model;
            document.getElementById('carType').value = carData.carType;
            document.getElementById('color').value = carData.color;
            document.getElementById('modelYear').value = carData.modelYear;
            document.getElementById('mileage').value = carData.mileage;
            document.getElementById('fuelType').value = carData.fuelType;
            document.getElementById('transmission').value = carData.transmission;
            document.getElementById('licensePlate').value = carData.licensePlate;
            document.getElementById('engine').value = carData.engine;
            document.getElementById('price').value = carData.price;
            document.getElementById('discounted_price').value = carData.discountedPrice;
            document.getElementById('isHotDeal').checked = carData.hotDeal;

            document.getElementById('frontRearSensor').checked = carData.frontRearSensor;
            document.getElementById('rearSensor').checked = carData.rearSensor;
            document.getElementById('frontSensor').checked = carData.frontSensor;
            document.getElementById('heatedSeat').checked = carData.heatedSeat;
            document.getElementById('ventilatedSeat').checked = carData.ventilatedSeat;
            document.getElementById('smartKey').checked = carData.smartKey;
            document.getElementById('navigation').checked = carData.navigation;
            document.getElementById('ledHeadlight').checked = carData.ledHeadlight;
            document.getElementById('sunroof').checked = carData.sunroof;

            if (carData.hotDeal) {
                discountedPriceInput.disabled = false;
            } else {
                discountedPriceInput.disabled = true;
            }
        })
        .catch(error => {
            console.error('Error loading car data:', error);
        });

}

function getCarIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

isHotDealCheckbox.addEventListener("change", function () {
    if (this.checked) {
        discountedPriceInput.disabled = false;
    } else {
        discountedPriceInput.disabled = true;
    }
});

document.getElementById("cancelBtn").addEventListener("click", function () {
    window.history.back();
});

document.getElementById("carForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const carId = getCarIdFromURL();

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
        const response = await axios.put(`http://localhost:8080/api/admin/car/update/${carId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${accessToken}`
            }
        });

        alert("등록 성공!");
        console.log(response.data);
        window.location.href = '../html/adminCars.html';
    } catch (error) {
        if (error.response && error.response.status === 403) {
            alert('토큰이 만료되었습니다. 다시 로그인해주세요.');
            window.location.href = '../html/login.html';
        } else {
            alert("등록 실패!");
        }
        console.error(error);
    }
});