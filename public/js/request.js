let isLoggedIn = false;
let userRole = null;

document.addEventListener("DOMContentLoaded", function () {
    const accessToken = localStorage.getItem("AccessToken");
    if (accessToken) {
        isLoggedIn = true;
        userRole = localStorage.getItem("Role");

    } else {
        alert("로그인이 필요한 서비스 입니다. 로그인 후 이용해주세요.");
        window.location.href = "/login.html";
        return;
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
        alert('로그아웃 완료');
        isLoggedIn = false;
        window.location.href = '/index.html';
    } else {
        window.location.href = '/login.html';
    }

    updateLoginState();
}

document.getElementById("fileDropArea").addEventListener("click", function () {
    document.getElementById("fileInput").click();
});

document.getElementById("fileInput").addEventListener("change", function (event) {
    const fileList = document.getElementById("fileList");
    fileList.innerHTML = "";
    const files = event.target.files;

    for (let i = 0; i < files.length; i++) {
        const li = document.createElement("li");
        li.classList.add("list-group-item");

        li.textContent = files[i].name + " (" + (files[i].size / 1024).toFixed(1) + "KB)";

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("btn", "btn-danger", "btn-sm", "ms-2");
        deleteButton.textContent = "삭제";
        deleteButton.addEventListener("click", function () {
            li.remove();
        });

        li.appendChild(deleteButton);
        fileList.appendChild(li);
    }
});

document.getElementById("submitBtn").addEventListener("click", function (event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const statusType = document.getElementById("statusType").value;
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const fileInput = document.getElementById("fileInput");
    const files = fileInput.files;

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim()) {
        alert("이메일을 입력하세요.");
        return false;
    } else if (!emailPattern.test(email.trim())) {
        alert("유효한 이메일 주소를 입력하세요.");
        return false;
    }

    if (!statusType.trim()) {
        alert("문의 유형을 선택하세요.");
        return false;
    }

    if (!title.trim()) {
        alert("제목을 입력하세요.");
        title.focus();
        return false;
    }

    if (!content.trim()) {
        alert("내용을 입력하세요.");
        content.focus();
        return false;
    }

    const dto = {
        email: email,
        statusType: statusType,
        title: title,
        content: content
    };

    const formData = new FormData();

    formData.append("dto", new Blob([JSON.stringify(dto)], { type: "application/json" }));

    for (let i = 0; i < files.length; i++) {
        formData.append("file", files[i]);
    }

    const accessToken = localStorage.getItem("AccessToken");

    if (!accessToken) {
        alert("로그인 상태가 아닙니다.");
        return;
    }

    console.log("Axios 요청을 보내고 있습니다.");

    axios.post("http://naechaeottae.shop/api/consult", formData, {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        }
    })
        .then(response => {
            console.log(response);
            alert("문의가 성공적으로 제출되었습니다.");
            window.location.href = "/mypage.html";
        })
        .catch(error => {
            console.error(error);
            alert("문의 제출에 실패했습니다. 다시 시도해주세요.");
        });
});

function selectInquiryType(type) {
    document.getElementById('inquiryDropdown').textContent = type;

    document.getElementById('statusType').value = type;

}
