// ===== drap-popup.js =====
// فقط کافیه این فایل رو به هر صفحه‌ای اضافه کنی، پاپ‌آپ خودکار نمایش داده میشه

(function() {
    'use strict';

    // تنظیمات پاپ‌آپ (میتونی تغییر بدی)
    const POPUP_CONFIG = {
        apiUrl: 'https://api.mimtehran.ir/api/waiting-list',
        delay: 1000,           // تاخیر در نمایش (میلی ثانیه)
        showOnce: true,        // فقط یکبار نمایش داده بشه
        expirationDays: 0,     // بعد از چند روز دوباره نمایش داده بشه (اگر showOnce true باشه)
        title: '🔥 فروش ویژه در راه است!',
        subtitle: 'برای اطلاع از تخفیف‌های ویژه و محصولات جدید، اطلاعات خود را ثبت کنید',
        buttonText: 'ثبت نام و اطلاع رسانی',
        icon: '🎁'
    };

    // ===== استایل پاپ‌آپ =====
    function addPopupStyles() {
        if (document.getElementById('drap-popup-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'drap-popup-styles';
        style.textContent = `
            .drap-popup-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.75);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99999;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                backdrop-filter: blur(3px);
            }
            .drap-popup-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            .drap-popup-container {
                background: white;
                width: 90%;
                max-width: 450px;
                border-radius: 28px;
                padding: 35px 30px;
                position: relative;
                transform: scale(0.9);
                transition: transform 0.3s ease;
                box-shadow: 0 25px 50px rgba(0,0,0,0.3);
                text-align: center;
            }
            .drap-popup-overlay.active .drap-popup-container {
                transform: scale(1);
            }
            .drap-popup-close {
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #999;
                transition: color 0.2s;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }
            .drap-popup-close:hover {
                color: #8B5E3C;
                background: #f5f5f5;
            }
            .drap-popup-icon {
                text-align: center;
                font-size: 52px;
                margin-bottom: 15px;
            }
            .drap-popup-title {
                text-align: center;
                font-size: 24px;
                font-weight: 700;
                color: #8B5E3C;
                margin-bottom: 10px;
            }
            .drap-popup-subtitle {
                text-align: center;
                font-size: 13px;
                color: #888;
                margin-bottom: 25px;
                line-height: 1.6;
            }
            .drap-popup-form {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .drap-popup-input {
                width: 100%;
                padding: 14px 16px;
                border: 1px solid #e0e0e0;
                border-radius: 14px;
                font-size: 14px;
                transition: all 0.2s;
                font-family: inherit;
                box-sizing: border-box;
            }
            .drap-popup-input:focus {
                outline: none;
                border-color: #8B5E3C;
                box-shadow: 0 0 0 2px rgba(139,94,60,0.1);
            }
            .drap-popup-btn {
                background: #8B5E3C;
                color: white;
                border: none;
                padding: 14px;
                border-radius: 40px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                margin-top: 5px;
                font-family: inherit;
            }
            .drap-popup-btn:hover {
                background: #6d4c2f;
                transform: translateY(-1px);
            }
            .drap-popup-btn:disabled {
                background: #ccc;
                cursor: not-allowed;
                transform: none;
            }
            .drap-popup-message {
                padding: 10px;
                border-radius: 10px;
                margin-top: 12px;
                text-align: center;
                font-size: 13px;
                display: none;
            }
            .drap-popup-message.success {
                background: #d4edda;
                color: #155724;
                display: block;
            }
            .drap-popup-message.error {
                background: #f8d7da;
                color: #721c24;
                display: block;
            }
            .drap-popup-footer {
                text-align: center;
                margin-top: 18px;
                font-size: 12px;
            }
            .drap-popup-footer a {
                color: #8B5E3C;
                text-decoration: none;
                cursor: pointer;
            }
            .drap-popup-footer a:hover {
                text-decoration: underline;
            }
            @media (max-width: 480px) {
                .drap-popup-container {
                    padding: 25px 20px;
                }
                .drap-popup-title {
                    font-size: 20px;
                }
                .drap-popup-icon {
                    font-size: 42px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ===== اعتبارسنجی =====
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validatePhone(phone) {
        return /^09[0-9]{9}$/.test(phone);
    }

    // ===== بررسی اینکه پاپ‌آپ باید نمایش داده بشه یا نه =====
    function shouldShowPopup() {
        if (!POPUP_CONFIG.showOnce) return true;
        
        const lastSeen = localStorage.getItem('drap_popup_seen_date');
        if (!lastSeen) return true;
        
        const daysPassed = (Date.now() - parseInt(lastSeen)) / (1000 * 60 * 60 * 24);
        return daysPassed >= POPUP_CONFIG.expirationDays;
    }

    // ===== ثبت نام در لیست انتظار =====
    async function submitToWaitingList(formData) {
        try {
            // ذخیره در localStorage
            const waitingList = JSON.parse(localStorage.getItem('waiting_list') || '[]');
            waitingList.push({
                id: Date.now(),
                ...formData,
                date: new Date().toISOString(),
                status: 'pending',
                source: window.location.pathname
            });
            localStorage.setItem('waiting_list', JSON.stringify(waitingList));
            
            // ارسال به API
            try {
                const response = await fetch(POPUP_CONFIG.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                    return { success: true, message: '✅ با موفقیت ثبت نام کردید. به زودی به شما اطلاع می‌دهیم.' };
                }
            } catch(apiError) {
                console.log('API not available, saved to localStorage only');
            }
            
            return { success: true, message: '✅ اطلاعات شما با موفقیت ثبت شد.' };
            
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: '❌ خطا در ثبت اطلاعات. لطفاً دوباره تلاش کنید.' };
        }
    }

    // ===== بستن پاپ‌آپ =====
    function closePopup() {
        const overlay = document.getElementById('drapPopupOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    // ===== نمایش پاپ‌آپ =====
    function showPopup() {
        if (!shouldShowPopup()) return;
        
        setTimeout(() => {
            const overlay = document.getElementById('drapPopupOverlay');
            if (overlay) {
                overlay.classList.add('active');
            }
        }, POPUP_CONFIG.delay);
    }

    // ===== هندلر ثبت نام =====
    async function handleSubmit(event) {
        event.preventDefault();
        
        const fullName = document.getElementById('popupFullName')?.value.trim();
        const email = document.getElementById('popupEmail')?.value.trim();
        const phone = document.getElementById('popupPhone')?.value.trim();
        const submitBtn = document.getElementById('popupSubmitBtn');
        const messageDiv = document.getElementById('popupMessage');
        
        // پاک کردن پیام قبلی
        messageDiv.className = 'drap-popup-message';
        messageDiv.style.display = 'none';
        
        if (!fullName || !email || !phone) {
            messageDiv.textContent = '❌ لطفاً تمام فیلدها را پر کنید';
            messageDiv.className = 'drap-popup-message error';
            messageDiv.style.display = 'block';
            return;
        }
        
        if (!validateEmail(email)) {
            messageDiv.textContent = '❌ آدرس ایمیل معتبر نیست';
            messageDiv.className = 'drap-popup-message error';
            messageDiv.style.display = 'block';
            return;
        }
        
        if (!validatePhone(phone)) {
            messageDiv.textContent = '❌ شماره تلفن معتبر نیست (مثال: 09123456789)';
            messageDiv.className = 'drap-popup-message error';
            messageDiv.style.display = 'block';
            return;
        }
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'در حال ثبت نام...';
        }
        
        const result = await submitToWaitingList({ full_name: fullName, email, phone });
        
        if (result.success) {
            messageDiv.textContent = result.message;
            messageDiv.className = 'drap-popup-message success';
            messageDiv.style.display = 'block';
            
            // ثبت زمان نمایش برای عدم نمایش مجدد
            if (POPUP_CONFIG.showOnce) {
                localStorage.setItem('drap_popup_seen_date', Date.now().toString());
            }
            
            // پاک کردن فرم
            document.getElementById('popupFullName').value = '';
            document.getElementById('popupEmail').value = '';
            document.getElementById('popupPhone').value = '';
            
            // بستن پاپ‌آپ بعد از 2 ثانیه
            setTimeout(() => {
                closePopup();
            }, 2000);
        } else {
            messageDiv.textContent = result.message;
            messageDiv.className = 'drap-popup-message error';
            messageDiv.style.display = 'block';
        }
        
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = POPUP_CONFIG.buttonText;
        }
    }

    // ===== رندر پاپ‌آپ =====
    function renderPopup() {
        if (document.getElementById('drapPopupOverlay')) return;
        
        const popupHtml = `
            <div id="drapPopupOverlay" class="drap-popup-overlay">
                <div class="drap-popup-container">
                    <button class="drap-popup-close" id="drapPopupClose">✕</button>
                    <div class="drap-popup-icon">${POPUP_CONFIG.icon}</div>
                    <h2 class="drap-popup-title">${POPUP_CONFIG.title}</h2>
                    <p class="drap-popup-subtitle">${POPUP_CONFIG.subtitle}</p>
                    <form id="drapPopupForm" class="drap-popup-form">
                        <input type="text" id="popupFullName" class="drap-popup-input" placeholder="نام و نام خانوادگی" autocomplete="name">
                        <input type="email" id="popupEmail" class="drap-popup-input" placeholder="آدرس ایمیل" autocomplete="email">
                        <input type="tel" id="popupPhone" class="drap-popup-input" placeholder="شماره تلفن" autocomplete="tel">
                        <button type="submit" id="popupSubmitBtn" class="drap-popup-btn">${POPUP_CONFIG.buttonText}</button>
                        <div id="popupMessage" class="drap-popup-message"></div>
                    </form>
                    <div class="drap-popup-footer">
                        <a id="popupLaterBtn">بعداً یادآوری کن</a>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', popupHtml);
        
        // تنظیم رویدادها
        const closeBtn = document.getElementById('drapPopupClose');
        const laterBtn = document.getElementById('popupLaterBtn');
        const overlay = document.getElementById('drapPopupOverlay');
        const form = document.getElementById('drapPopupForm');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', closePopup);
        }
        
        if (laterBtn) {
            laterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.setItem('drap_popup_seen_date', Date.now().toString());
                closePopup();
            });
        }
        
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    localStorage.setItem('drap_popup_seen_date', Date.now().toString());
                    closePopup();
                }
            });
        }
        
        if (form) {
            form.addEventListener('submit', handleSubmit);
        }
    }

    // ===== تغییر تنظیمات از طریق کنسول (برای دیباگ) =====
    window.DrapPopup = {
        show: showPopup,
        hide: closePopup,
        config: POPUP_CONFIG,
        reset: function() {
            localStorage.removeItem('drap_popup_seen_date');
            localStorage.removeItem('waiting_list_registered');
            showPopup();
        }
    };

    // ===== مقداردهی اولیه =====
    function init() {
        addPopupStyles();
        renderPopup();
        showPopup();
    }

    // اجرا بعد از لود کامل صفحه
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();