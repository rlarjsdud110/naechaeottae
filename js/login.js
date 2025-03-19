document.addEventListener("DOMContentLoaded", function () {
    const registerButton = document.getElementById("toggle-register");
    const toggleToRegister = document.getElementById("toggle-register");
    const toggleToLogin = document.getElementById("toggle-login");
    const formTitle = document.getElementById("form-title");

    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    // 로그인 → 회원가입
    if (toggleToRegister) {
        toggleToRegister.addEventListener("click", function (event) {
            event.preventDefault();
            loginForm.style.display = "none";
            registerForm.style.display = "block";
            toggleToRegister.style.display = "none";
            toggleToLogin.style.display = "block";
        });
    }

    // 회원가입 → 로그인
    if (toggleToLogin) {
        toggleToLogin.addEventListener("click", function (event) {
            event.preventDefault();
            registerForm.style.display = "none";
            loginForm.style.display = "block";
            toggleToLogin.style.display = "none";
            toggleToRegister.style.display = "block";
        });
    }

    // 회원가입 버튼 클릭 시 로그인 폼 숨기고 회원가입 폼 표시
    if (registerButton) {
        registerButton.addEventListener("click", function (event) {
            event.preventDefault();
            loginForm.style.display = "none";
            registerForm.style.display = "block";
            formTitle.textContent = "회원가입";  // 폼 제목 변경
        });
    }

    // 핸드폰 번호 자동 포맷팅 (signup-phone이 있을 경우에만)
    const signupPhone = document.getElementById("signup-phone");
    if (signupPhone) {
        signupPhone.addEventListener("input", function (e) {
            let phone = e.target.value.replace(/[^0-9]/g, '');
            if (phone.length > 3 && phone.length <= 6) {
                phone = phone.replace(/(\d{3})(\d{1,4})/, '$1-$2');
            } else if (phone.length > 6) {
                phone = phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
            }
            e.target.value = phone.slice(0, 13);
        });
    }

    // 실시간 비밀번호 확인
    const passwordField = document.getElementById("signup-password");
    const confirmPasswordField = document.getElementById("confirm-password");
    const passwordError = document.getElementById("password-error");

    // 비밀번호 확인 입력 시 실시간으로 확인
    confirmPasswordField.addEventListener("input", function () {
        if (passwordField.value !== confirmPasswordField.value) {
            passwordError.style.display = "block";
            confirmPasswordField.classList.add("is-invalid");
        } else {
            passwordError.style.display = "none";
            confirmPasswordField.classList.remove("is-invalid");
        }
    });

    // 비밀번호 입력 시에도 일치 여부 체크
    passwordField.addEventListener("input", function () {
        if (passwordField.value !== confirmPasswordField.value) {
            passwordError.style.display = "block";
            confirmPasswordField.classList.add("is-invalid");
        } else {
            passwordError.style.display = "none";
            confirmPasswordField.classList.remove("is-invalid");
        }
    });

    // 회원가입 폼 제출 시 처리
    const registerFormSubmit = document.getElementById("register-form");
    if (registerFormSubmit) {
        registerFormSubmit.addEventListener("submit", function (event) {
            event.preventDefault(); // 폼의 기본 제출 동작을 막음
            // 회원가입 데이터를 수집
            const formData = new FormData(registerFormSubmit);
            const formObject = {};

            // 비밀번호 확인 필드를 제외한 데이터를 수집
            formData.forEach((value, key) => {
                if (key !== 'confirmPassword') {  // 비밀번호 확인 필드를 제외
                    formObject[key] = value;
                }
            });

            axios.post('http://localhost:8080/api/users/signup', formObject)
                .then(response => {
                    // 정상 응답 처리
                    if (response.data.resultCode === 'SUCCESS') {
                        alert('회원가입 성공');
                        window.location.href = '../html/login.html';
                    } else {
                        alert('회원가입 실패');
                    }
                })
                .catch(error => {
                    if (error.response && error.response.data) {
                        let errorMessage = '회원가입 중 오류가 발생했습니다.';
                        if (error.response.data.resultCode === "DUPLICATED_USER_ID") {
                            errorMessage = '이미 존재하는 아이디입니다. 다른 아이디를 사용해주세요.';
                        } else if (error.response.data.resultCode === "DUPLICATED_USER_EMAIL") {
                            errorMessage = '이미 존재하는 이메일입니다. 다른 이메일을 사용해주세요.';
                        }
                        alert(errorMessage);
                    } else {
                        console.error('Error:', error);
                        alert('회원가입 중 네트워크 오류가 발생했습니다.');
                    }
                });
        });
    }

    // 로그인 폼 제출 처리 (기본 로그인 예시)
    const loginFormSubmit = document.getElementById("login-form");
    if (loginFormSubmit) {
        loginFormSubmit.addEventListener("submit", function (event) {
            event.preventDefault();
            const formData = new FormData(loginFormSubmit);
            const formObject = {};

            formData.forEach((value, key) => {
                formObject[key] = value;
            });

            // 서버에 로그인 데이터 전송
            axios.post('http://localhost:8080/api/users/login', formObject)
                .then(response => {
                    if (response.data.resultCode === "SUCCESS" && response.data.result.role === "USER") {
                        const token = response.data.result.token;
                        localStorage.setItem("AccessToken", token);
                        localStorage.setItem("Role", response.data.result.role);
                        window.location.href = '../html/index.html';
                    } else if (response.data.resultCode === "SUCCESS" && response.data.result.role === "ADMIN") {
                        const token = response.data.result.token;
                        localStorage.setItem("AccessToken", token);
                        localStorage.setItem("Role", response.data.result.role);
                        window.location.href = '../html/admin.html';
                    } else {
                        alert('로그인 실패');
                    }
                })
                .catch(error => {
                    if (error.response && error.response.data) {
                        let errorMessage = '회원가입 중 오류가 발생했습니다.';
                        if (error.response.data.resultCode === "USER_NOT_FOUND") {
                            errorMessage = '아이디를 다시 확인해주세요.';
                        } else if (error.response.data.resultCode === "INVALID_PASSWORD") {
                            errorMessage = '비밀번호를 다시 확인해주세요.';
                        }
                        alert(errorMessage);
                    } else {
                        console.error('Error:', error);
                        alert('회원가입 중 네트워크 오류가 발생했습니다.');
                    }
                });
        });
    }
});
