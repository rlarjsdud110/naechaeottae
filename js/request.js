let isLoggedIn = false;
let userRole = null;

document.addEventListener("DOMContentLoaded", function () {
    // AccessToken 확인 및 로그인 상태 초기화
    const accessToken = localStorage.getItem("AccessToken");
    if (accessToken) {
        isLoggedIn = true;
        userRole = localStorage.getItem("Role");

    } else {
        alert("로그인이 필요한 서비스 입니다. 로그인 후 이용해주세요.");
        window.location.href = "../html/index.html";
        return;
    }
    // 로그인 상태 업데이트
    updateLoginState();
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
        window.location.href = '../html/index.html';
    } else {
        // 로그인 상태에서 로그아웃 처리 후 페이지 갱신
        window.location.href = '../html/login.html';  // 로그인 페이지로 리다이렉트
    }

    // 로그인 상태 갱신 (로그아웃 후 상태 변경)
    updateLoginState();
}

// 파일 첨부 영역 클릭 시 파일 입력 트리거
document.getElementById("fileDropArea").addEventListener("click", function () {
    document.getElementById("fileInput").click();
});

// 파일 선택 후 처리
document.getElementById("fileInput").addEventListener("change", function (event) {
    const fileList = document.getElementById("fileList");
    fileList.innerHTML = ""; // 기존 목록 초기화
    const files = event.target.files;

    // 선택된 파일을 목록에 추가
    for (let i = 0; i < files.length; i++) {
        const li = document.createElement("li");
        li.classList.add("list-group-item");

        // 파일 이름과 크기 표시
        li.textContent = files[i].name + " (" + (files[i].size / 1024).toFixed(1) + "KB)";

        // 삭제 버튼 추가
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("btn", "btn-danger", "btn-sm", "ms-2");
        deleteButton.textContent = "삭제";
        deleteButton.addEventListener("click", function () {
            li.remove(); // 파일 항목 삭제
        });

        li.appendChild(deleteButton); // 삭제 버튼을 항목에 추가
        fileList.appendChild(li); // 파일 항목을 리스트에 추가
    }
});

// 문의 폼 제출 함수
document.getElementById("submitBtn").addEventListener("click", function (event) {
    event.preventDefault(); // 폼 기본 동작 방지

    // 폼 데이터 가져오기
    const email = document.getElementById("email").value;
    const statusType = document.getElementById("statusType").value;
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const fileInput = document.getElementById("fileInput");
    const files = fileInput.files;

    // 이메일 필드 확인
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim()) { // email.value에서 email로 수정
        alert("이메일을 입력하세요.");
        return false;
    } else if (!emailPattern.test(email.trim())) { // email.value에서 email로 수정
        alert("유효한 이메일 주소를 입력하세요.");
        return false;
    }

    // 문의 유형 확인
    if (!statusType.trim()) { // inquiryType -> statusType으로 수정
        alert("문의 유형을 선택하세요.");
        return false;
    }

    // 제목 필드 확인
    if (!title.trim()) {
        alert("제목을 입력하세요.");
        title.focus();
        return false;
    }

    // 내용 필드 확인
    if (!content.trim()) {
        alert("내용을 입력하세요.");
        content.focus();
        return false;
    }

    // dto 객체 준비 (필요한 값들로 구성)
    const dto = {
        email: email,
        statusType: statusType,
        title: title,
        content: content
    };

    // FormData 생성
    const formData = new FormData();

    // JSON 형태로 직렬화하여 "dto" 이름으로 추가
    formData.append("dto", new Blob([JSON.stringify(dto)], { type: "application/json" }));

    // 파일 첨부가 있으면 FormData에 추가
    for (let i = 0; i < files.length; i++) {
        formData.append("file", files[i]);
    }

    // Axios 요청을 보내기 전에 AccessToken 가져오기
    const accessToken = localStorage.getItem("AccessToken");

    if (!accessToken) {
        alert("로그인 상태가 아닙니다.");
        return;
    }

    console.log("Axios 요청을 보내고 있습니다.");

    // Axios 요청 보내기
    axios.post("http://localhost:8080/api/consult", formData, {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            // "Content-Type"은 자동으로 처리됨
        }
    })
        .then(response => {
            console.log(response); // 서버 응답 확인
            alert("문의가 성공적으로 제출되었습니다.");
            window.location.href = "../html/mypage.html"; // 성공 후 리디렉션
        })
        .catch(error => {
            console.error(error); // 오류 확인
            alert("문의 제출에 실패했습니다. 다시 시도해주세요.");
        });
});

// 문의 유형에 따라 폼을 보여주는 함수
function selectInquiryType(type) {
    // 드롭다운 버튼 텍스트 변경
    document.getElementById('inquiryDropdown').textContent = type;

    // 선택된 값을 hidden input에 저장
    document.getElementById('statusType').value = type;

}
