// ===== register-merged.js =====
(function() {
    'use strict';

    const API_BASE_URL = 'http://127.0.0.1:8000/api';

    // ===== توابع ثبت نام =====
    
    async function sendVerificationCode(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    first_name: userData.firstName,
                    last_name: userData.lastName,
                    email: userData.email,
                    phone: userData.phone,
                    password: userData.password,
                    password_confirmation: userData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.errors || 'خطا در ثبت نام');
            }

            return { success: true, data };
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, error: error.message };
        }
    }

    async function verifyCode(phone, code) {
        try {
            const response = await fetch(`${API_BASE_URL}/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ phone: phone, code: code })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'کد تأیید نامعتبر است');
            }

            return { success: true, data };
        } catch (error) {
            console.error('Verification Error:', error);
            return { success: false, error: error.message };
        }
    }

    function showError(message, isVerification = false) {
        const errorClass = isVerification ? '.verification-error-state' : '[data-wf-user-form-error="true"]';
        const errorState = document.querySelector(errorClass);
        const errorDiv = errorState?.querySelector('div');
        
        if (errorDiv) {
            errorDiv.textContent = message;
            errorState.style.display = 'block';
        } else {
            alert('❌ ' + message);
        }
        
        setTimeout(() => {
            if (errorState) errorState.style.display = 'none';
        }, 5000);
    }

    function showVerificationForm(phone) {
        const formContainer = document.querySelector('.form-container');
        const verificationContainer = document.querySelector('.verification-container');
        
        if (formContainer) formContainer.style.display = 'none';
        if (verificationContainer) {
            verificationContainer.style.display = 'block';
            const phoneSpan = document.getElementById('verification-phone');
            if (phoneSpan) phoneSpan.textContent = phone;
        }
    }

    function showSuccessAndRedirect() {
        const successState = document.querySelector('.w-users-userformsuccessstate');
        const form = document.getElementById('signupForm');
        const verificationDiv = document.querySelector('.verification-container');
        
        if (successState) {
            if (form) form.style.display = 'none';
            if (verificationDiv) verificationDiv.style.display = 'none';
            successState.style.display = 'block';
            
            setTimeout(() => {
                window.location.href = 'log-in.html';
            }, 2000);
        } else {
            setTimeout(() => {
                window.location.href = 'log-in.html';
            }, 1500);
        }
    }

    function validateForm(formData) {
        const errors = [];
        
        const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
        if (!emailRegex.test(formData.email)) errors.push('ایمیل معتبر وارد کنید');
        if (formData.firstName.trim().length < 2) errors.push('نام باید حداقل ۲ کاراکتر باشد');
        if (formData.lastName.trim().length < 2) errors.push('نام خانوادگی باید حداقل ۲ کاراکتر باشد');
        if (formData.password.length < 8) errors.push('رمز عبور باید حداقل ۸ کاراکتر باشد');
        
        const phoneRegex = /^09[0-9]{9}$/;
        if (!phoneRegex.test(formData.phone)) errors.push('شماره تلفن باید با 09 شروع و ۱۱ رقم باشد');
        
        return errors;
    }

    function getFormData() {
        return {
            email: document.getElementById('wf-sign-up-email')?.value || '',
            firstName: document.getElementById('wf-sign-up-first-name')?.value || '',
            lastName: document.getElementById('wf-sign-up-last-name')?.value || '',
            phone: document.getElementById('wf-sign-up-phone')?.value || '',
            password: document.getElementById('wf-sign-up-password')?.value || '',
            acceptPrivacy: document.getElementById('wf-sign-up-accept-privacy')?.checked || false
        };
    }

    function storeTempUserData(userData) {
        localStorage.setItem('temp_registration', JSON.stringify({ ...userData, timestamp: Date.now() }));
    }

    function getTempUserData() {
        const data = localStorage.getItem('temp_registration');
        if (data) {
            const parsed = JSON.parse(data);
            if (Date.now() - parsed.timestamp < 30 * 60 * 1000) return parsed;
        }
        return null;
    }

    function clearTempUserData() { 
        localStorage.removeItem('temp_registration'); 
    }

    async function resendVerificationCode(phone) {
        try {
            const response = await fetch(`${API_BASE_URL}/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ phone: phone })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'خطا در ارسال مجدد کد');
            alert('✅ کد تأیید مجدداً برای شما ارسال شد');
            return true;
        } catch (error) {
            alert('❌ ' + error.message);
            return false;
        }
    }

    function startResendTimer(phone) {
        const resendBtn = document.getElementById('resend-code-btn');
        const timerSpan = document.getElementById('resend-timer');
        let timeLeft = 90;
        if (!resendBtn) return;
        
        resendBtn.disabled = true;
        
        const timer = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(timer);
                resendBtn.disabled = false;
                if (timerSpan) timerSpan.textContent = '';
                resendBtn.textContent = 'ارسال مجدد کد';
            } else {
                if (timerSpan) timerSpan.textContent = `${timeLeft} ثانیه`;
                resendBtn.textContent = 'ارسال مجدد کد';
                timeLeft--;
            }
        }, 1000);
        
        const newResendBtn = resendBtn.cloneNode(true);
        resendBtn.parentNode.replaceChild(newResendBtn, resendBtn);
        
        newResendBtn.onclick = async () => {
            newResendBtn.disabled = true;
            const success = await resendVerificationCode(phone);
            if (success) timeLeft = 90;
            else newResendBtn.disabled = false;
        };
    }

    function backToSignup() {
        const formContainer = document.querySelector('.form-container');
        const verificationContainer = document.querySelector('.verification-container');
        if (formContainer) formContainer.style.display = 'block';
        if (verificationContainer) verificationContainer.style.display = 'none';
        clearTempUserData();
    }

    async function handleSignup(event) {
        event.preventDefault();
        const errorState = document.querySelector('[data-wf-user-form-error="true"]');
        if (errorState) errorState.style.display = 'none';
        const formData = getFormData();
        const validationErrors = validateForm(formData);
        if (validationErrors.length > 0) { 
            showError(validationErrors.join(' • ')); 
            return; 
        }
        if (!formData.acceptPrivacy) { 
            showError('لطفاً قوانین و مقررات را بپذیرید'); 
            return; 
        }
        
        const submitBtn = document.querySelector('input[type="submit"]');
        const originalBtnValue = submitBtn?.value;
        if (submitBtn) { 
            submitBtn.disabled = true; 
            submitBtn.value = 'در حال ارسال...'; 
        }
        
        const result = await sendVerificationCode(formData);
        if (submitBtn) { 
            submitBtn.disabled = false; 
            submitBtn.value = originalBtnValue; 
        }
        
        if (result.success) {
            storeTempUserData(formData);
            showVerificationForm(formData.phone);
            startResendTimer(formData.phone);
        } else {
            showError(result.error || 'خطا در ارتباط با سرور');
        }
    }

    async function handleVerification(event) {
        event.preventDefault();
        const codeInput = document.getElementById('verification-code');
        const verifyBtn = document.getElementById('verify-submit-btn');
        const code = codeInput?.value.trim();
        if (!code || code.length !== 6) { 
            showError('لطفاً کد ۶ رقمی تأیید را وارد کنید', true); 
            return; 
        }
        
        const tempUserData = getTempUserData();
        if (!tempUserData) {
            showError('اطلاعات ثبت نام یافت نشد. لطفاً مجدداً ثبت نام کنید.', true);
            setTimeout(() => window.location.reload(), 2000);
            return;
        }
        
        if (verifyBtn) { 
            verifyBtn.disabled = true; 
            verifyBtn.value = 'در حال تأیید...'; 
        }
        const result = await verifyCode(tempUserData.phone, code);
        if (verifyBtn) { 
            verifyBtn.disabled = false; 
            verifyBtn.value = 'تأیید کد'; 
        }
        
        if (result.success) {
            if (result.data?.token) localStorage.setItem('auth_token', result.data.token);
            localStorage.setItem('user_registered', JSON.stringify({
                email: tempUserData.email, 
                firstName: tempUserData.firstName,
                lastName: tempUserData.lastName, 
                phone: tempUserData.phone, 
                registeredAt: new Date().toISOString()
            }));
            clearTempUserData();
            showSuccessAndRedirect();
        } else {
            showError(result.error || 'کد تأیید نامعتبر است. مجدداً تلاش کنید.', true);
        }
    }

    function loadFooter() {
        const footerEl = document.getElementById('footer');
        if (!footerEl) return;
        
        if (footerEl.hasChildNodes()) return;
        
        fetch("footer.html")
            .then((res) => res.text())
            .then((data) => {
                footerEl.innerHTML = data;
            })
            .catch(() => {
                footerEl.innerHTML = `<div style="text-align:center; padding:20px; background:#f5f5f5;">© 2024 MIM TEHRAN</div>`;
            });
    }

    function setupEventListeners() {
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            const newForm = signupForm.cloneNode(true);
            signupForm.parentNode.replaceChild(newForm, signupForm);
            newForm.addEventListener('submit', handleSignup);
        }
        
        const verificationForm = document.getElementById('verificationForm');
        if (verificationForm) {
            const newForm = verificationForm.cloneNode(true);
            verificationForm.parentNode.replaceChild(newForm, verificationForm);
            newForm.addEventListener('submit', handleVerification);
        }
    }

    // ===== رندر محتوای صفحه ثبت نام =====
    function renderPageContent() {
        if (document.getElementById('signupForm')) return;
        
        const signupHtml = `
            <section class="page-title">
                <div class="container-minimal" style="display: block; text-align: center;">
                    <h1 class="main-title center">ثبت نام</h1>
                </div>
            </section>

            <section class="form-section">
                <div class="w-users-usersignupformwrapper login-form">
                    
                    <div tabindex="-1" class="w-users-userformsuccessstate success-state w-form-success" style="display: none;">
                        <div class="w-users-userformheader"><h4>✅ ثبت نام با موفقیت انجام شد</h4></div>
                        <p>حساب کاربری شما با موفقیت ایجاد شد. به زودی به صفحه ورود هدایت خواهید شد.</p>
                        <div><a href="log-in.html" style="color: #8B5E3C;">اگر اتفاقی نیفتاد، اینجا کلیک کنید.</a></div>
                    </div>
                    
                    <div class="form-container">
                        <form class="form" id="signupForm">
                            <div class="login-fields">
                                <div class="form-field">
                                    <label for="Email-3" class="field-label">ایمیل</label>
                                    <input placeholder="example@email.com" id="wf-sign-up-email" maxlength="256" class="plain-input w-input" type="email" required />
                                </div>
                                <div class="form-field">
                                    <label class="field-label">نام</label>
                                    <input class="plain-input w-input" maxlength="256" type="text" id="wf-sign-up-first-name" required />
                                </div>
                                <div class="form-field">
                                    <label class="field-label">نام خانوادگی</label>
                                    <input class="plain-input w-input" maxlength="256" type="text" id="wf-sign-up-last-name" required />
                                </div>
                                <div class="form-field">
                                    <label class="field-label">تلفن همراه</label>
                                    <input class="plain-input w-input" maxlength="11" placeholder="09123456789" type="tel" id="wf-sign-up-phone" required />
                                </div>
                                <div class="form-field">
                                    <label class="field-label">رمز عبور</label>
                                    <input placeholder="حداقل ۸ کاراکتر" maxlength="256" class="plain-input w-input" type="password" id="wf-sign-up-password" required />
                                </div>
                            </div>
                            
                            <div class="agreement">
                                <label class="w-checkbox">
                                    <input class="w-checkbox-input" type="checkbox" id="wf-sign-up-accept-privacy" required />
                                    <span class="w-form-label">
                                        با ایجاد حساب کاربری، 
                                        <a href="privacy-policy.html">حریم خصوصی</a> و
                                        <a href="faq.html">شرایط خدمات</a> این وب‌سایت را می‌پذیرم.
                                    </span>
                                </label>
                            </div>
                            
                            <div class="login-btn">
                                <input type="submit" class="w-users-userformbutton primary-btn fill w-button" value="ثبت نام" />
                            </div>
                            
                            <div class="w-users-userformfooter">
                                <span>قبلاً حساب کاربری دارید؟</span>
                                <a href="log-in.html">ورود</a>
                            </div>
                        </form>
                    </div>
                    
                    <div class="verification-container" style="display: none;">
                        <div style="text-align: center; padding: 20px;">
                            <h3 style="color: #8B5E3C;">📱 کد تأیید</h3>
                            <p>کد تأیید به شماره <strong id="verification-phone"></strong> ارسال شد.</p>
                            <form id="verificationForm">
                                <input type="text" id="verification-code" maxlength="6" 
                                       style="width:200px; padding:12px; font-size:20px; text-align:center; letter-spacing:5px;" placeholder="------" required />
                                <div style="margin-top:20px;">
                                    <button type="submit" id="verify-submit-btn" class="w-users-userformbutton primary-btn fill w-button"
                                            style="background:#8B5E3C; color:white; padding:12px 30px; border:none;">تأیید کد</button>
                                </div>
                                <div style="margin-top:20px;">
                                    <button type="button" id="resend-code-btn" style="background:none; border:none; color:#8B5E3C; cursor:pointer;">ارسال مجدد کد</button>
                                    <span id="resend-timer" style="font-size:12px; color:#999;"></span>
                                </div>
                                <div style="margin-top:15px;">
                                    <button type="button" onclick="window.backToSignup && window.backToSignup()" 
                                            style="background:none; border:none; color:#999; cursor:pointer;">← بازگشت به فرم ثبت نام</button>
                                </div>
                            </form>
                            <div class="verification-error-state error-state w-form-fail" style="display:none; margin-top:20px;"><div style="color:red;"></div></div>
                        </div>
                    </div>
                    
                    <div style="display:none" data-wf-user-form-error="true" class="error-state w-form-fail"><div style="color:red;"></div></div>
                </div>
            </section>
        `;
        
        const pageDataDiv = document.querySelector('.page-data');
        if (pageDataDiv) {
            pageDataDiv.innerHTML = signupHtml;
        } else {
            const wrapper = document.createElement('div');
            wrapper.className = 'page-data';
            wrapper.innerHTML = signupHtml;
            const header = document.getElementById('header');
            if (header && header.nextSibling) {
                header.parentNode.insertBefore(wrapper, header.nextSibling);
            } else if (header) {
                header.parentNode.appendChild(wrapper);
            } else {
                document.body.appendChild(wrapper);
            }
        }
        
        // اضافه کردن استایل‌های فرم ثبت نام
        if (!document.getElementById('register-styles')) {
            const style = document.createElement('style');
            style.id = 'register-styles';
            style.textContent = `
                .form-section {
                    max-width: 500px;
                    margin: 0 auto;
                    padding: 20px 20px;
                }
                .login-form {
                    background: white;
                    border-radius: 10px;
                    padding: 20px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                }
                .login-fields {
                    margin-bottom: 2px;
                }
                .form-field {
                    margin-bottom: 1px;
                }
                .field-label {
                    display: block;
                    margin-bottom: 1px;
                    font-weight: 500;
                    color: #333;
                }
                .plain-input {
                    width: 100%;
                    padding: 12px 15px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    font-size: 14px;
                }
                .plain-input:focus {
                    outline: none;
                    border-color: #8B5E3C;
                }
                .agreement {
                    margin: 20px 0;
                }
                .w-checkbox {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                }
                .w-checkbox-input {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                }
                .w-form-label {
                    font-size: 13px;
                    color: #666;
                }
                .w-form-label a {
                    color: #8B5E3C;
                    text-decoration: none;
                }
                .login-btn {
                    margin-top: 2px;
                }
                .primary-btn {
                    width: 100%;
                    padding: 14px;
                    background: #8B5E3C;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                }
                .primary-btn:hover {
                    background: #6d4c2f;
                }
                .w-users-userformfooter {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 14px;
                }
                .w-users-userformfooter a {
                    color: #8B5E3C;
                    text-decoration: none;
                }
                .page-title {
                    text-align: center;
                    margin-top: 1px;
                }
                .main-title {
                    font-size: 28px;
                    color: #333;
                }
                .error-state {
                    margin-top: 20px;
                    padding: 10px;
                    border-radius: 5px;
                    background: #ffebee;
                    color: #c62828;
                }
            `;
            document.head.appendChild(style);
        }
        
        setupEventListeners();
    }

    // ===== مقداردهی اولیه =====
    async function init() {
        loadFooter();
        renderPageContent();
        
        window.backToSignup = backToSignup;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();