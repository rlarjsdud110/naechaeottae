let isEditing = false;

document.addEventListener("DOMContentLoaded", function () {
    const accessToken = localStorage.getItem("AccessToken");
    if (accessToken) {
        isLoggedIn = true;
    } else {
        alert("로그인이 필요한 서비스 입니다. 로그인 후 이용해주세요.");
        window.location.href = "/index.html";
        return;
    }
    updateLoginState();
    fetchInquiryDetails(accessToken);
});

function updateLoginState() {
    if (isLoggedIn) {
        document.getElementById('login-logout-btn').textContent = '로그아웃';
        document.getElementById('my-page-btn').style.display = 'inline-block';
    } else {
        document.getElementById('login-logout-btn').textContent = '로그인';
        document.getElementById('my-page-btn').style.display = 'none';
    }
}

function toggleLoginState() {
    if (isLoggedIn) {

        localStorage.removeItem("AccessToken");
        alert('로그아웃 완료');
        isLoggedIn = false;
        window.location.href = '/index.html';
    } else {

        window.location.href = '/login.html';
    }

    updateLoginState();
}

function fetchInquiryDetails(accessToken) {
    const inquiryId = getQueryParam("id");

    axios.get(`http://localhost:8080/api/consult/${inquiryId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then(response => {
            if (response.data.resultCode === "SUCCESS") {
                const inquiry = response.data.result;

                document.getElementById("email").value = inquiry.email;
                document.getElementById("inquiryType").value = inquiry.statusType;
                document.getElementById("title").value = inquiry.title;
                document.getElementById("content").value = inquiry.content;

                const answerContainer = document.getElementById("answer-container");
                const answerDiv = document.getElementById("answer").querySelector("p");

                if (inquiry.answer) {
                    answerDiv.textContent = inquiry.answer;
                    answerContainer.style.display = "block";
                } else {
                    answerContainer.style.display = "none";
                }
                const fileList = document.getElementById("fileList");
                fileList.innerHTML = "";

                inquiry.imagesUrl.forEach((imageUrl, index) => {
                    const listItem = document.createElement("li");
                    listItem.classList.add("list-group-item");

                    const img = document.createElement("img");
                    img.src = imageUrl;
                    img.alt = `첨부 이미지 ${index + 1}`;
                    img.classList.add("img-fluid");
                    img.style.maxWidth = "100%";
                    img.style.maxHeight = "100px";

                    listItem.appendChild(img);
                    fileList.appendChild(listItem);
                });
            } else {
                alert("문의 내역을 불러오지 못했습니다.");
            }
        })
        .catch(error => {
            console.error("문의 내역 불러오기 실패:", error);
            alert("서버와의 통신 중 오류가 발생했습니다.");
        });
}

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function toggleBack() {
    window.history.back();
}

function deleteInquiry() {
    const inquiryId = getQueryParam("id");

    if (isEditing) {
        saveInquiryChanges();
    } else {
        axios.delete(`http://13.124.146.78:8080/api/consult/${inquiryId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("AccessToken")}`
            }
        })
            .then(response => {
                if (response.data.resultCode === "SUCCESS") {
                    alert("문의 내역이 삭제되었습니다.");
                    window.location.href = "/mypage.html";
                } else {
                    alert("삭제에 실패했습니다.");
                }
            })
            .catch(error => {
                console.error("삭제 실패:", error);
                alert("삭제 중 오류가 발생했습니다.");
            });
    }
}
