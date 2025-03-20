document.addEventListener("DOMContentLoaded", function () {
    const registerButton = document.getElementById("toggle-register");
    const toggleToRegister = document.getElementById("toggle-register");
    const toggleToLogin = document.getElementById("toggle-login");
    const formTitle = document.getElementById("form-title");

    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    if (toggleToRegister) {
        toggleToRegister.addEventListener("click", function (event) {
            event.preventDefault();
            loginForm.style.display = "none";
            registerForm.style.display = "block";
            toggleToRegister.style.display = "none";
            toggleToLogin.style.display = "block";
        });
    }

    if (toggleToLogin) {
        toggleToLogin.addEventListener("click", function (event) {
            event.preventDefault();
            registerForm.style.display = "none";
            loginForm.style.display = "block";
            toggleToLogin.style.display = "none";
            toggleToRegister.style.display = "block";
        });
    }

    if (registerButton) {
        registerButton.addEventListener("click", function (event) {
            event.preventDefault();
            loginForm.style.display = "none";
            registerForm.style.display = "block";
            formTitle.textContent = "회원가입";
        });
    }

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

    const passwordField = document.getElementById("signup-password");
    const confirmPasswordField = document.getElementById("confirm-password");
    const passwordError = document.getElementById("password-error");

    confirmPasswordField.addEventListener("input", function () {
        if (passwordField.value !== confirmPasswordField.value) {
            passwordError.style.display = "block";
            confirmPasswordField.classList.add("is-invalid");
        } else {
            passwordError.style.display = "none";
            confirmPasswordField.classList.remove("is-invalid");
        }
    });

    passwordField.addEventListener("input", function () {
        if (passwordField.value !== confirmPasswordField.value) {
            passwordError.style.display = "block";
            confirmPasswordField.classList.add("is-invalid");
        } else {
            passwordError.style.display = "none";
            confirmPasswordField.classList.remove("is-invalid");
        }
    });

    const registerFormSubmit = document.getElementById("register-form");
    if (registerFormSubmit) {
        registerFormSubmit.addEventListener("submit", function (event) {
            event.preventDefault();
            const formData = new FormData(registerFormSubmit);
            const formObject = {};

            formData.forEach((value, key) => {
                if (key !== 'confirmPassword') {
                    formObject[key] = value;
                }
            });

            axios.post('http://localhost:8080/api/users/signup', formObject)
                .then(response => {
                    if (response.data.resultCode === 'SUCCESS') {
                        alert('회원가입 성공');
                        window.location.href = '/login.html';
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

    const loginFormSubmit = document.getElementById("login-form");
    if (loginFormSubmit) {
        loginFormSubmit.addEventListener("submit", function (event) {
            event.preventDefault();
            const formData = new FormData(loginFormSubmit);
            const formObject = {};

            formData.forEach((value, key) => {
                formObject[key] = value;
            });

            axios.post('http://localhost:8080/api/users/login', formObject)
                .then(response => {
                    if (response.data.resultCode === "SUCCESS" && response.data.result.role === "USER") {
                        const token = response.data.result.token;
                        localStorage.setItem("AccessToken", token);
                        localStorage.setItem("Role", response.data.result.role);
                        window.location.href = '/index.html';
                    } else if (response.data.resultCode === "SUCCESS" && response.data.result.role === "ADMIN") {
                        const token = response.data.result.token;
                        localStorage.setItem("AccessToken", token);
                        localStorage.setItem("Role", response.data.result.role);
                        window.location.href = '/admin.html';
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
