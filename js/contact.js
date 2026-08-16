// ===== contact-merged.js =====
(function() {
    'use strict';

    const API_BASE_URL = 'https://api.mimtehran.ir/api';

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
        }, 5000);
    }

    // ===== ارسال پیام تماس =====
    async function submitContact(formData) {
        try {
            // ابتدا در localStorage ذخیره کن
            const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
            messages.push({
                id: Date.now(),
                ...formData,
                date: new Date().toISOString(),
                status: 'unread'
            });
            localStorage.setItem('contact_messages', JSON.stringify(messages));
            
            // اگر API موجود است، به سرور هم ارسال کن
            try {
                const response = await fetch(`${API_BASE_URL}/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                    return { success: true, message: 'پیام با موفقیت ارسال شد' };
                }
            } catch(apiError) {
                console.log('API not available, saved to localStorage only');
            }
            
            return { success: true, message: 'پیام با موفقیت ذخیره شد' };
            
        } catch (error) {
            console.error('Error saving message:', error);
            return { success: false, message: 'خطا در ارسال پیام' };
        }
    }

    // ===== هندلر فرم =====
    async function handleSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('contactName')?.value.trim();
    const email = document.getElementById('contactEmail')?.value.trim();
    const phone = document.getElementById('contactPhone')?.value.trim();
    const message = document.getElementById('contactMessage')?.value.trim();
    
    const lang = 'fa'; // دیفالت فارسی
    
    if (!name || !email || !phone || !message) {
        showMessage('errorMessage', '❌ لطفاً تمام فیلدها را پر کنید', true);
        return;
    }
    
    if (!validateEmail(email)) {
        showMessage('errorMessage', '❌ آدرس ایمیل معتبر نیست', true);
        return;
    }
    
    if (!validatePhone(phone)) {
        showMessage('errorMessage', '❌ شماره تلفن معتبر نیست (مثال: 09123456789)', true);
        return;
    }
    
    const result = await submitContact({ 
        name, 
        email, 
        phone, 
        message,
        lang
    });
    
    if (result.success) {
        showMessage('successMessage', '✅ ' + result.message, false);
        document.getElementById('contactForm')?.reset();
    } else {
        showMessage('errorMessage', '❌ ' + result.message, true);
    }
}

    // ===== اضافه کردن استایل‌ها =====
    function addContactStyles() {
        if (document.getElementById('contact-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'contact-styles';
        style.textContent = `
            .page-title {
                text-align: center;
                margin-top: 40px;
                margin-bottom: 40px;
            }
            .main-title {
                font-size: 32px;
                color: #333;
                font-weight: 300;
            }
            .contact-section {
                max-width: 1280px;
                margin: 0 auto;
                padding: 20px 20px 60px;
            }
            .contact-wrap {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 50px;
                align-items: center;
                background: white;
                border-radius: 24px;
                padding: 40px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                margin-bottom: 40px;
            }
            .contact-wrap.reverse {
                direction: ltr;
            }
            .contact-wrap.reverse .contact-right,
            .contact-wrap.reverse .contact-data {
                direction: rtl;
            }
            .contact-img {
                width: 100%;
            }
            .section-image {
                width: 100%;
                border-radius: 20px;
                object-fit: cover;
            }
            .contact-right h2 {
                font-size: 28px;
                font-weight: 600;
                margin-bottom: 15px;
                color: #333;
            }
            .contact-right p {
                color: #666;
                line-height: 1.8;
                margin-bottom: 25px;
            }
            .contact-form {
                margin-top: 20px;
            }
            .field-wrap {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            .input {
                width: 100%;
                padding: 14px 18px;
                border: 1px solid #ddd;
                border-radius: 12px;
                font-size: 14px;
                transition: all 0.2s;
            }
            .input:focus {
                outline: none;
                border-color: #8B5E3C;
            }
            .textarea {
                width: 100%;
                padding: 14px 18px;
                border: 1px solid #ddd;
                border-radius: 12px;
                font-size: 14px;
                min-height: 120px;
                resize: vertical;
            }
            .textarea:focus {
                outline: none;
                border-color: #8B5E3C;
            }
            .submit-btn {
                background: #8B5E3C;
                color: white;
                border: none;
                padding: 14px 32px;
                border-radius: 40px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                margin-top: 10px;
            }
            .submit-btn:hover {
                background: #6d4c2f;
                transform: translateY(-2px);
            }
            .success-message, .error-message {
                display: none;
                padding: 12px 20px;
                border-radius: 8px;
                margin-top: 20px;
                text-align: center;
            }
            .contact-data {
                display: flex;
                flex-direction: column;
                gap: 25px;
            }
            .contact-block h5 {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 12px;
                color: #8B5E3C;
            }
            .contact-links {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .plain-link {
                color: #555;
                text-decoration: none;
                transition: color 0.2s;
                display: inline-block;
            }
            .plain-link:hover {
                color: #8B5E3C;
            }
            .contact-address {
                color: #666;
                line-height: 1.6;
                margin: 5px 0;
            }
            @media (max-width: 768px) {
                .contact-wrap {
                    grid-template-columns: 1fr;
                    padding: 25px;
                    gap: 30px;
                }
                .contact-wrap.reverse {
                    direction: rtl;
                }
                .contact-right h2 {
                    font-size: 24px;
                }
                .main-title {
                    font-size: 28px;
                }
            }
            @media (max-width: 480px) {
                .contact-wrap {
                    padding: 20px;
                }
                .submit-btn {
                    width: 100%;
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

    function renderContactPage() {
        const pageDataDiv = document.querySelector('.page-data');
        if (!pageDataDiv) return;
        
        const contactHtml = `
            <section class="page-title">
                <div class="container" style="max-width: 1280px; margin: 0 auto; padding: 0 20px;">
                    <h1 class="main-title">تماس با ما</h1>
                </div>
            </section>

            <div class="contact-section">
                <div class="container" style="max-width: 1280px; margin: 0 auto; padding: 0 20px;">
                    
                    <div class="contact-wrap">
                        <div class="contact-img">
                            <img src="asset/imag/2.jpg" loading="eager" alt="Contact Image" class="section-image" onerror="this.src='https://placehold.co/600x400?text=Contact'">
                        </div>
                        <div class="contact-right">
                            <h2>ارسال پیام</h2>
                            <p>
                                سوال، پیشنهاد یا انتقادی دارید؟ خوشحال می‌شویم از شما بشنویم! 
                                فرم زیر را پر کنید تا در اسرع وقت با شما تماس بگیریم.
                            </p>
                            
                            <div class="contact-form">
                                <form id="contactForm">
                                    <div class="field-wrap">
                                        <input class="input" maxlength="256" name="name" placeholder="نام و نام خانوادگی" type="text" id="contactName" required />
                                        <input class="input email" maxlength="256" name="email" placeholder="آدرس ایمیل" type="email" id="contactEmail" required />
                                        <input class="input phone" maxlength="256" name="phone" placeholder="شماره تلفن" type="tel" id="contactPhone" required />
                                        <textarea id="contactMessage" name="message" maxlength="5000" placeholder="متن پیام شما..." required class="textarea"></textarea>
                                    </div>
                                    <div class="form-btn">
                                        <input type="submit" data-wait="لطفا صبر کنید..." class="submit-btn" value="ارسال پیام" />
                                    </div>
                                </form>
                                <div id="successMessage" class="success-message" style="display: none;"></div>
                                <div id="errorMessage" class="error-message" style="display: none;"></div>
                            </div>
                        </div>
                    </div>
                    
                    
                    
                </div>
            </div>
        `;
        
        pageDataDiv.innerHTML = contactHtml;
        
        // تنظیم event listener برای فرم
        const form = document.getElementById('contactForm');
        if (form) {
            form.addEventListener('submit', handleSubmit);
        }
    }

    // ===== مقداردهی اولیه =====
    async function init() {
        addContactStyles();
        loadFooter();
        renderContactPage();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();