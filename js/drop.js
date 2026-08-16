// ===== drap-merged.js =====
(function () {
    'use strict';

    // داینامیک برای لوکال و سرور
    const API_BASE_URL = `https://api.mimtehran.ir/api`;

    // ===== اعتبارسنجی =====
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validatePhone(phone) {
        return /^09[0-9]{9}$/.test(phone);
    }

    // ===== نمایش پیام =====
    function showMessage(elementId, message, isError = false) {
        const msgDiv = document.getElementById(elementId);
        if (!msgDiv) return;

        msgDiv.textContent = message;
        msgDiv.style.background = isError ? '#f8d7da' : '#d4edda';
        msgDiv.style.color = isError ? '#721c24' : '#155724';
        msgDiv.style.display = 'block';

        setTimeout(() => {
            msgDiv.style.display = 'none';
        }, 4000);
    }

    // ===== بررسی پسورد =====
    async function checkPassword(password) {
        try {
            const response = await fetch(`${API_BASE_URL}/check-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ password })
            });

            let result = {};

            try {
                result = await response.json();
            } catch (e) {
                result = {};
            }

            if (response.ok && result.is_status) {
                return {
                    success: true,
                    message: result.message
                };
            }

            return {
                success: false,
                message: result.message || 'رمز عبور اشتباه است'
            };

        } catch (error) {
            console.error('Error checking password:', error);

            return {
                success: false,
                message: 'خطا در ارتباط با سرور'
            };
        }
    }

    // ===== ثبت لیست انتظار =====
    async function submitToWaitingList(formData) {
        try {
            const response = await fetch(`${API_BASE_URL}/waiting-list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            let result = {};

            try {
                result = await response.json();
            } catch (e) {
                result = {};
            }

            if (response.ok) {
                return {
                    success: true,
                    message: result.message || 'اطلاعات شما با موفقیت ثبت شد.'
                };
            }

            // فقط اگر API fail شد ذخیره local
            const waitingList = JSON.parse(
                localStorage.getItem('waiting_list') || '[]'
            );

            waitingList.push({
                id: Date.now(),
                ...formData,
                date: new Date().toISOString(),
                status: 'pending'
            });

            localStorage.setItem(
                'waiting_list',
                JSON.stringify(waitingList)
            );

            return {
                success: true,
                message: 'اطلاعات ذخیره شد و بعداً ارسال خواهد شد.'
            };

        } catch (error) {
            console.error('Error saving waiting list:', error);

            const waitingList = JSON.parse(
                localStorage.getItem('waiting_list') || '[]'
            );

            waitingList.push({
                id: Date.now(),
                ...formData,
                date: new Date().toISOString(),
                status: 'pending'
            });

            localStorage.setItem(
                'waiting_list',
                JSON.stringify(waitingList)
            );

            return {
                success: true,
                message: 'اطلاعات شما ذخیره شد.'
            };
        }
    }

    // ===== هندلر پسورد =====
    async function handlePasswordSubmit(event) {
        event.preventDefault();

        const password = document.getElementById('drapPassword')?.value;
        const errorMsg = document.getElementById('passwordError');
        const submitBtn = document.querySelector('#passwordForm .btn-submit');

        if (!password) {
            showMessage(
                'passwordError',
                '❌ لطفاً رمز عبور را وارد کنید',
                true
            );
            return;
        }

        try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'در حال بررسی...';
            }

            const result = await checkPassword(password);

            if (result.success) {
                localStorage.setItem('drap_access', 'true');
                localStorage.setItem(
                    'drap_access_time',
                    Date.now().toString()
                );

                window.location.href = 'drop_shop.html';
            } else {
                showMessage(
                    'passwordError',
                    `❌ ${result.message}`,
                    true
                );
            }

        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'ورود به بخش ویژه';
            }
        }
    }

    // ===== هندلر لیست انتظار =====
    async function handleWaitingListSubmit(event) {
        event.preventDefault();

        const fullName = document.getElementById('waitingFullName')?.value.trim();
        const email = document.getElementById('waitingEmail')?.value.trim();
        const phone = document.getElementById('waitingPhone')?.value.trim();

        if (!fullName || !email || !phone) {
            showMessage(
                'waitingError',
                '❌ لطفاً تمام فیلدها را پر کنید',
                true
            );
            return;
        }

        if (!validateEmail(email)) {
            showMessage(
                'waitingError',
                '❌ ایمیل معتبر نیست',
                true
            );
            return;
        }

        if (!validatePhone(phone)) {
            showMessage(
                'waitingError',
                '❌ شماره معتبر نیست',
                true
            );
            return;
        }

        const result = await submitToWaitingList({
            full_name: fullName,
            email,
            phone
        });

        if (result.success) {
            showMessage(
                'waitingSuccess',
                `✅ ${result.message}`
            );

            document
                .getElementById('waitingListForm')
                ?.reset();
        } else {
            showMessage(
                'waitingError',
                `❌ ${result.message}`,
                true
            );
        }
    }

    // ===== تغییر تب =====
    function switchTab(tabName) {
        const tabs = document.querySelectorAll('.tab-btn');
        const panes = document.querySelectorAll('.tab-pane');

        tabs.forEach(tab => tab.classList.remove('active'));
        panes.forEach(pane => pane.classList.remove('active'));

        const targetTab = document.querySelector(
            `.tab-btn[data-tab="${tabName}"]`
        );

        const targetPane = document.getElementById(
            `${tabName}-tab`
        );

        if (targetTab) {
            targetTab.classList.add('active');
        }

        if (targetPane) {
            targetPane.classList.add('active');
        }
    }


    // ===== اضافه کردن استایل‌ها =====
    function addDrapStyles() {
        if (document.getElementById('drap-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'drap-styles';
        style.textContent = `
            .page-container {
                max-width: 500px;
                margin: 0 auto;
                padding: 60px 20px;
                min-height: 100vh;
                display: flex;
                align-items: center;
            }
            .tabs {
                display: flex;
                gap: 10px;
                margin-bottom: 30px;
                background: white;
                border-radius: 60px;
                padding: 5px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            .tab-btn {
                flex: 1;
                padding: 14px 20px;
                background: transparent;
                border: none;
                border-radius: 50px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                color: #666;
            }
            .tab-btn.active {
                background: #8B5E3C;
                color: white;
                box-shadow: 0 2px 8px rgba(139,94,60,0.3);
            }
            .tab-pane {
                display: none;
                background: white;
                border-radius: 24px;
                padding: 35px 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .tab-pane.active {
                display: block;
            }
            .tab-pane h2 {
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 10px;
                color: #333;
                text-align: center;
            }
            .tab-pane p {
                color: #666;
                text-align: center;
                margin-bottom: 25px;
                font-size: 14px;
            }
            .form-group {
                margin-bottom: 20px;
            }
            .form-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                color: #333;
            }
            .form-control {
                width: 100%;
                padding: 14px 16px;
                border: 1px solid #ddd;
                border-radius: 12px;
                font-size: 15px;
                transition: all 0.2s;
            }
            .form-control:focus {
                outline: none;
                border-color: #8B5E3C;
            }
            .btn-submit {
                width: 100%;
                padding: 14px;
                background: #8B5E3C;
                color: white;
                border: none;
                border-radius: 40px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                margin-top: 10px;
            }
            .btn-submit:hover {
                background: #6d4c2f;
                transform: translateY(-2px);
            }
            .btn-submit:disabled {
                background: #ccc;
                cursor: not-allowed;
                transform: none;
            }
            .message {
                display: none;
                padding: 12px 16px;
                border-radius: 10px;
                margin-top: 20px;
                text-align: center;
                font-size: 14px;
            }
            .admin-note {
                background: #fef5e8;
                padding: 12px;
                border-radius: 10px;
                margin-bottom: 20px;
                font-size: 12px;
                color: #8B5E3C;
                text-align: center;
            }
            @media (max-width: 480px) {
                .page-container {
                    padding: 40px 15px;
                }
                .tab-pane {
                    padding: 25px 20px;
                }
                .tab-pane h2 {
                    font-size: 20px;
                }
                .btn-submit {
                    padding: 12px;
                }
            }
        `;
        document.head.appendChild(style);
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

    function renderDrapPage() {
        const pageDataDiv = document.querySelector('.page-data');
        if (!pageDataDiv) return;
        
        const drapHtml = `
            <div class="page-container">
                <div style="width: 100%;">
                    <div class="tabs">
                        <button class="tab-btn active" data-tab="password" onclick="window.switchTab && window.switchTab('password')">🔐 دسترسی ویژه</button>
                        <button class="tab-btn" data-tab="waiting" onclick="window.switchTab && window.switchTab('waiting')">📝 ثبت نام در لیست انتظار</button>
                    </div>
                    
                    <!-- تب پسورد -->
                    <div id="password-tab" class="tab-pane active">
                        <h2>ورود به بخش ویژه</h2>
                        <p>لطفاً رمز عبور را وارد کنید</p>
                        <div class="admin-note">
                            🔒 در صورت نداشتن رمز عبور، با مدیریت تماس بگیرید.
                        </div>
                        <form id="passwordForm">
                            <div class="form-group">
                                <label>رمز عبور</label>
                                <input type="password" id="drapPassword" class="form-control" placeholder="********" autocomplete="off">
                            </div>
                            <button type="submit" class="btn-submit">ورود به بخش ویژه</button>
                            <div id="passwordError" class="message" style="display: none;"></div>
                        </form>
                    </div>
                    
                    <!-- تب لیست انتظار -->
                    <div id="waiting-tab" class="tab-pane">
                        <h2>ثبت نام در لیست انتظار</h2>
                        <p>برای اطلاع از محصولات جدید و تخفیف‌های ویژه، اطلاعات خود را وارد کنید</p>
                        <form id="waitingListForm">
                            <div class="form-group">
                                <label>نام و نام خانوادگی</label>
                                <input type="text" id="waitingFullName" class="form-control" placeholder="مثال: زهرا محمدی">
                            </div>
                            <div class="form-group">
                                <label>آدرس ایمیل</label>
                                <input type="email" id="waitingEmail" class="form-control" placeholder="example@email.com">
                            </div>
                            <div class="form-group">
                                <label>شماره تلفن</label>
                                <input type="tel" id="waitingPhone" class="form-control" placeholder="09123456789">
                            </div>
                            <button type="submit" class="btn-submit">ثبت نام در لیست انتظار</button>
                            <div id="waitingSuccess" class="message" style="display: none;"></div>
                            <div id="waitingError" class="message" style="display: none;"></div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        pageDataDiv.innerHTML = drapHtml;
        
        // تنظیم event listenerها
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', handlePasswordSubmit);
        }
        
        const waitingForm = document.getElementById('waitingListForm');
        if (waitingForm) {
            waitingForm.addEventListener('submit', handleWaitingListSubmit);
        }
        
        window.switchTab = switchTab;
    }

    // ===== بررسی دسترسی قبلی (اختیاری) =====
    function checkExistingAccess() {
        const hasAccess = localStorage.getItem('drap_access');
        const accessTime = localStorage.getItem('drap_access_time');
        
        // اگر دسترسی وجود دارد و کمتر از 24 ساعت گذشته باشد
        if (hasAccess === 'true' && accessTime) {
            const timeDiff = Date.now() - parseInt(accessTime);
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            if (hoursDiff < 24) {
                window.location.href = 'drop_shop.html';
            } else {
                // منقضی شده - پاک کن
                localStorage.removeItem('drap_access');
                localStorage.removeItem('drap_access_time');
            }
        }
    }

    // ===== مقداردهی اولیه =====
    async function init() {
        addDrapStyles();
        loadFooter();
        renderDrapPage();
        
        window.switchTab = switchTab;
        
        // بررسی دسترسی قبلی (اگر میخوای بعد از لاگین دیگه پسورد نپرسه)
        // checkExistingAccess();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();