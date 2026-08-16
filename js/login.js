// ===== login-merged.js =====
(function() {
    'use strict';

    const API_BASE_URL = 'https://api.mimtehran.ir/api';

    // ===== توابع لاگین =====
    
    async function loginWithEmail(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'ایمیل یا رمز عبور اشتباه است');
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async function requestLoginOtp(phone) {
        try {
            const response = await fetch(`${API_BASE_URL}/login-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ phone })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'خطا در ارسال کد تأیید');
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async function verifyLoginOtp(phone, code) {
        try {
            const response = await fetch(`${API_BASE_URL}/verify-login-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ phone, code })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'کد تأیید نامعتبر است');
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    function saveUserSession(userData, token) {
        localStorage.setItem('user_logged_in', 'true');
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify({
            id: userData.id, 
            email: userData.email, 
            phone: userData.phone,
            first_name: userData.first_name, 
            last_name: userData.last_name, 
            loginAt: new Date().toISOString()
        }));
        sessionStorage.setItem('isLoggedIn', 'true');
        
        // به روز رسانی هدر اگر تابع وجود داشته باشد
        if (window.updateHeaderCartCount) {
            window.updateHeaderCartCount();
        }
    }

    function showSuccessAndRedirect() {
        const successState = document.getElementById('successState');
        const emailTab = document.getElementById('email-tab');
        const phoneTab = document.getElementById('phone-tab');
        if (successState) {
            if (emailTab) emailTab.style.display = 'none';
            if (phoneTab) phoneTab.style.display = 'none';
            successState.style.display = 'block';
        }
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);
    }

    function showError(message, isOtpError = false) {
        const errorState = isOtpError ? document.getElementById('errorStateOtp') : document.getElementById('errorState');
        if (errorState) {
            const errorDiv = errorState.querySelector('div');
            if (errorDiv) errorDiv.textContent = message;
            errorState.style.display = 'block';
            setTimeout(() => { errorState.style.display = 'none'; }, 3000);
        } else {
            alert('❌ ' + message);
        }
    }

    // ===== تایمر OTP =====
    let otpTimerInterval = null;
    
    function startResendTimer() {
        const resendBtn = document.getElementById('resend-otp-btn');
        const timerSpan = document.getElementById('resend-timer');
        let timeLeft = 90;
        if (otpTimerInterval) clearInterval(otpTimerInterval);
        resendBtn.disabled = true;
        otpTimerInterval = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(otpTimerInterval);
                resendBtn.disabled = false;
                timerSpan.textContent = '';
            } else {
                timerSpan.textContent = `${timeLeft} ثانیه`;
                timeLeft--;
            }
        }, 1000);
        
        const newResendBtn = resendBtn.cloneNode(true);
        resendBtn.parentNode.replaceChild(newResendBtn, resendBtn);
        newResendBtn.onclick = async () => {
            const phone = localStorage.getItem('temp_login_phone');
            const result = await requestLoginOtp(phone);
            if (result.success) {
                timeLeft = 90;
                newResendBtn.disabled = true;
                alert('✅ کد مجدداً ارسال شد');
                if (otpTimerInterval) clearInterval(otpTimerInterval);
                startResendTimer();
            } else {
                alert('❌ ' + result.error);
            }
        };
    }

    function backToLogin() {
        const otpRequestDiv = document.getElementById('otpRequestDiv');
        const otpSection = document.getElementById('otpSection');
        if (otpRequestDiv) otpRequestDiv.style.display = 'block';
        if (otpSection) otpSection.style.display = 'none';
        localStorage.removeItem('temp_login_phone');
        const phoneInput = document.getElementById('wf-log-in-phone');
        if (phoneInput) phoneInput.value = '';
        if (otpTimerInterval) clearInterval(otpTimerInterval);
    }

    function switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        
        const emailTab = document.getElementById('email-tab');
        const phoneTab = document.getElementById('phone-tab');
        if (emailTab) emailTab.style.display = tabName === 'email' ? 'block' : 'none';
        if (phoneTab) phoneTab.style.display = tabName === 'phone' ? 'block' : 'none';
    }

    // ===== هندلرها =====
    async function handleEmailLogin(event) {
        event.preventDefault();
        const email = document.getElementById('wf-log-in-email')?.value;
        const password = document.getElementById('wf-log-in-password')?.value;
        if (!email || !password) {
            showError('لطفاً ایمیل و رمز عبور را وارد کنید');
            return;
        }
        const result = await loginWithEmail(email, password);
        if (result.success) {
            const userInfo = result.data?.data?.user || result.data?.user || {};
            const token = result.data?.data?.access_token || result.data?.access_token;
            if (token) saveUserSession(userInfo, token);
            showSuccessAndRedirect();
        } else {
            showError(result.error);
        }
    }

    async function handleRequestOtp(event) {
        event.preventDefault();
        const phone = document.getElementById('wf-log-in-phone')?.value;
        const phoneRegex = /^09[0-9]{9}$/;
        if (!phone || !phoneRegex.test(phone)) {
            showError('شماره موبایل معتبر وارد کنید (09123456789)', true);
            return;
        }
        const result = await requestLoginOtp(phone);
        if (result.success) {
            localStorage.setItem('temp_login_phone', phone);
            const otpRequestDiv = document.getElementById('otpRequestDiv');
            const otpSection = document.getElementById('otpSection');
            const otpPhoneNumber = document.getElementById('otp-phone-number');
            if (otpRequestDiv) otpRequestDiv.style.display = 'none';
            if (otpSection) otpSection.style.display = 'block';
            if (otpPhoneNumber) otpPhoneNumber.textContent = phone;
            startResendTimer();
        } else {
            showError(result.error, true);
        }
    }

    async function handleVerifyOtp(event) {
        event.preventDefault();
        const code = document.getElementById('otp-code')?.value;
        const phone = localStorage.getItem('temp_login_phone');
        if (!code || code.length !== 6) {
            showError('لطفاً کد ۶ رقمی را وارد کنید', true);
            return;
        }
        const result = await verifyLoginOtp(phone, code);
        if (result.success) {
            const userInfo = result.data?.data?.user || result.data?.user || {};
            const token = result.data?.data?.access_token || result.data?.access_token;
            if (token) saveUserSession(userInfo, token);
            localStorage.removeItem('temp_login_phone');
            showSuccessAndRedirect();
        } else {
            showError(result.error, true);
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
        const loginForm = document.getElementById('loginForm');
        const otpRequestForm = document.getElementById('otpRequestForm');
        const otpVerifyForm = document.getElementById('otpVerifyForm');
        const backBtn = document.getElementById('back-to-login-btn');
        
        if (loginForm) loginForm.addEventListener('submit', handleEmailLogin);
        if (otpRequestForm) otpRequestForm.addEventListener('submit', handleRequestOtp);
        if (otpVerifyForm) otpVerifyForm.addEventListener('submit', handleVerifyOtp);
        if (backBtn) backBtn.addEventListener('click', backToLogin);
    }

    // ===== رندر محتوای صفحه ورود =====
    function renderPageContent() {
        if (document.getElementById('email-tab')) return;

        const loginHtml = `
            <section class="page-title">
                <div style="max-width: 1280px; margin: 0 auto; padding: 0 20px; text-align: center;">
                    <h1 class="main-title center">ورود</h1>
                </div>
            </section>

            <div class="page-data">
                <section class="form-section">
                    <div class="w-users-userloginformwrapper login-form">
                        
                        <div tabindex="-1" class="w-users-userformsuccessstate success-state w-form-success" style="display: none;" id="successState">
                            <div class="w-users-userformheader"><h4>✅ ورود موفق</h4></div>
                            <p>در حال انتقال به صفحه اصلی...</p>
                        </div>
                        
                        <div class="login-tabs">
                            <button class="tab-btn active" data-tab="email" onclick="window.switchTab && window.switchTab('email')">ورود با ایمیل</button>
                            <button class="tab-btn" data-tab="phone" onclick="window.switchTab && window.switchTab('phone')">ورود با شماره موبایل</button>
                        </div>
                        
                        <div id="email-tab" class="tab-pane" style="display: block;">
                            <form class="form" id="loginForm">
                                <div class="login-fields">
                                    <div class="form-field">
                                        <label class="field-label">ایمیل</label>
                                        <input maxlength="256" placeholder="example@email.com" id="wf-log-in-email" class="plain-input w-input" type="email" required />
                                    </div>
                                    <div class="form-field">
                                        <label class="field-label">رمز عبور</label>
                                        <input maxlength="256" placeholder="********" id="wf-log-in-password" class="plain-input w-input" type="password" required />
                                    </div>
                                </div>
                                <div class="login-btn">
                                    <input type="submit" class="w-users-userformbutton primary-btn fill w-button" value="ورود" />
                                </div>
                                <div class="w-users-userformfooter">
                                    <span>حساب کاربری ندارید؟</span>
                                    <a href="sign-up.html">ثبت نام</a>
                                </div>
                            </form>
                        </div>
                        
                        <div id="phone-tab" class="tab-pane" style="display: none;">
                            <div id="otpRequestDiv">
                                <form id="otpRequestForm">
                                    <div class="login-fields">
                                        <div class="form-field">
                                            <label class="field-label">شماره موبایل</label>
                                            <input maxlength="11" placeholder="09123456789" id="wf-log-in-phone" class="plain-input w-input" type="tel" required />
                                        </div>
                                    </div>
                                    <div class="login-btn">
                                        <button type="submit" id="request-otp-btn" class="w-users-userformbutton primary-btn fill w-button">ارسال کد تأیید</button>
                                    </div>
                                </form>
                            </div>
                            <div id="otpSection" style="display: none;">
                                <div style="text-align: center; padding: 20px;">
                                    <p>کد تأیید به شماره <strong id="otp-phone-number"></strong> ارسال شد.</p>
                                    <form id="otpVerifyForm">
                                        <div class="form-field">
                                            <label class="field-label">کد تأیید ۶ رقمی</label>
                                            <input type="text" id="otp-code" maxlength="6" style="width:100%; padding:12px; font-size:20px; text-align:center; letter-spacing:5px;" placeholder="------" required />
                                        </div>
                                        <div class="login-btn">
                                            <button type="submit" id="verify-otp-btn" class="w-users-userformbutton primary-btn fill w-button">تأیید و ورود</button>
                                        </div>
                                        <div style="text-align:center; margin-top:15px;">
                                            <button type="button" id="resend-otp-btn" style="background:none; border:none; color:#8B5E3C; cursor:pointer;">ارسال مجدد کد</button>
                                            <span id="resend-timer" style="font-size:12px; color:#999;"></span>
                                        </div>
                                        <div style="text-align:center; margin-top:15px;">
                                            <button type="button" id="back-to-login-btn" style="background:none; border:none; color:#999; cursor:pointer;">← بازگشت</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        
                        <div style="display: none" data-wf-user-form-error="true" class="error-state w-form-fail" id="errorState"><div></div></div>
                        <div style="display: none" class="error-state w-form-fail" id="errorStateOtp"><div style="color:red;"></div></div>
                    </div>
                </section>
            </div>
        `;

        const pageDataDiv = document.querySelector('.page-data');
        if (pageDataDiv) {
            pageDataDiv.innerHTML = loginHtml;
        } else {
            const wrapper = document.createElement('div');
            wrapper.className = 'page-data';
            wrapper.innerHTML = loginHtml;
            const header = document.getElementById('header');
            if (header && header.nextSibling) {
                header.parentNode.insertBefore(wrapper, header.nextSibling);
            } else if (header) {
                header.parentNode.appendChild(wrapper);
            } else {
                document.body.appendChild(wrapper);
            }
        }

        // اضافه کردن استایل‌های لاگین
        if (!document.getElementById('login-styles')) {
            const style = document.createElement('style');
            style.id = 'login-styles';
            style.textContent = `
                .login-tabs { display: flex; gap: 10px; margin-bottom: 30px; border-bottom: 2px solid #eee; justify-content: center; }
                .tab-btn { background: none; border: none; padding: 12px 24px; font-size: 16px; font-weight: 500; cursor: pointer; color: #666; transition: all 0.3s ease; }
                .tab-btn.active { color: #8B5E3C; border-bottom: 2px solid #8B5E3C; }
                .tab-pane { animation: fadeIn 0.3s ease; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .error-state { margin-top: 20px; padding: 10px; border-radius: 5px; }
                .form-section { max-width: 500px; margin: 0 auto; padding: 40px 20px; }
                .login-form { background: white; border-radius: 20px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
                .login-fields { margin-bottom: 1px; }
                .form-field { margin-bottom: 20px; }
                .field-label { display: block; margin-bottom: 8px; font-weight: 500; color: #333; }
                .plain-input { width: 100%; padding: 12px 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
                .plain-input:focus { outline: none; border-color: #8B5E3C; }
                .login-btn { margin-top: 20px; }
                .primary-btn { width: 100%; padding: 14px; background: #8B5E3C; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; }
                .primary-btn:hover { background: #6d4c2f; }
                .w-users-userformfooter { text-align: center; margin-top: 20px; font-size: 14px; }
                .w-users-userformfooter a { color: #8B5E3C; text-decoration: none; }
                .page-title { text-align: center; margin-top: 40px; }
                .main-title { font-size: 28px; color: #333; }
            `;
            document.head.appendChild(style);
        }
        
        setupEventListeners();
    }

    // ===== مقداردهی اولیه =====
    async function init() {
        loadFooter();
        renderPageContent();
        
        window.switchTab = switchTab;
        window.backToLogin = backToLogin;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();