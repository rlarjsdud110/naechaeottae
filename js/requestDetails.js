let isEditing = false;  // 수정 상태 여부를 확인하는 변수

document.addEventListener("DOMContentLoaded", function () {
    // AccessToken 확인 및 로그인 상태 초기화
    const accessToken = localStorage.getItem("AccessToken");
    if (accessToken) {
        isLoggedIn = true;
    } else {
        alert("로그인이 필요한 서비스 입니다. 로그인 후 이용해주세요.");
        window.location.href = "../html/index.html";
        return;
    }
    // 로그인 상태 업데이트
    updateLoginState();
    fetchInquiryDetails(accessToken);
});

// 로그인/로그아웃 상태 업데이트 함수
function updateLoginState() {
    // 로그인/로그아웃 상태에 따라 버튼 변경
    if (isLoggedIn) {
        document.getElementById('login-logout-btn').textContent = '로그아웃';
        document.getElementById('my-page-btn').style.display = 'inline-block';
    } else {
        document.getElementById('login-logout-btn').textContent = '로그인';
        document.getElementById('my-page-btn').style.display = 'none';
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

// 문의 데이터 불러오기 함수
function fetchInquiryDetails(accessToken) {
    const inquiryId = getQueryParam("id");

    axios.get(`http://localhost:8080/api/consult/${inquiryId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}` // 토큰을 헤더에 추가
        }
    })
        .then(response => {
            if (response.data.resultCode === "SUCCESS") {
                const inquiry = response.data.result;

                // 데이터를 HTML 요소에 삽입
                document.getElementById("email").value = inquiry.email;
                document.getElementById("inquiryType").value = inquiry.statusType;
                document.getElementById("title").value = inquiry.title;
                document.getElementById("content").value = inquiry.content;

                // 관리자 답변 처리
                const answerContainer = document.getElementById("answer-container");
                const answerDiv = document.getElementById("answer").querySelector("p");

                if (inquiry.answer) {
                    answerDiv.textContent = inquiry.answer;
                    answerContainer.style.display = "block"; // 답변이 있으면 보이게 설정
                } else {
                    answerContainer.style.display = "none"; // 답변이 없으면 숨김
                }
                // 이미지 목록 처리
                const fileList = document.getElementById("fileList");
                fileList.innerHTML = "";  // 기존 리스트 초기화

                inquiry.imagesUrl.forEach((imageUrl, index) => {
                    // 이미지 미리보기 추가
                    const listItem = document.createElement("li");
                    listItem.classList.add("list-group-item");

                    const img = document.createElement("img");
                    img.src = imageUrl;
                    img.alt = `첨부 이미지 ${index + 1}`;
                    img.classList.add("img-fluid");
                    img.style.maxWidth = "100%";
                    img.style.maxHeight = "100px";  // 이미지 크기를 제한

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

// 삭제하기 버튼 클릭 시
function deleteInquiry() {
    const inquiryId = getQueryParam("id");

    // 수정 완료 상태일 때는 삭제 처리 대신 수정 데이터를 저장
    if (isEditing) {
        saveInquiryChanges();  // 수정된 내용을 저장
    } else {
        // 삭제 버튼을 클릭하면 해당 문의 내역 삭제
        axios.delete(`http://localhost:8080/api/consult/${inquiryId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("AccessToken")}`
            }
        })
            .then(response => {
                if (response.data.resultCode === "SUCCESS") {
                    alert("문의 내역이 삭제되었습니다.");
                    window.location.href = "mypage.html";  // 삭제 후 고객센터 페이지로 이동
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
