// ===== global-header.js (نسخه اصلاح شده نهایی) =====
(function() {
    'use strict';

    const API_BASE_URL = 'https://api.mimtehran.ir/api';
    let cartCount = 0;
    let pollingInterval = null;

    function addHeaderStyles() {
        if (document.getElementById('header-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'header-styles';
        style.textContent = `
            .navbar-minimal {
                background: white;
                padding: 15px 0;
                border-bottom: 1px solid #eee;
                position: sticky;
                top: 0;
                z-index: 1000;
            }
            .container-minimal {
                max-width: 1280px;
                margin: 0 auto;
                padding: 0 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .logo-text {
                font-size: 20px;
                font-weight: bold;
                text-decoration: none;
                color: #8B5E3C;
            }
            .nav-links-minimal {
                display: flex;
                gap: 25px;
            }
            .nav-links-minimal a {
                text-decoration: none;
                color: #333;
                font-size: 14px;
            }
            .nav-links-minimal a:hover { color: #8B5E3C; }
            .nav-icons-minimal {
                display: flex;
                gap: 20px;
                align-items: center;
            }
            .icon-minimal {
                background: none;
                border: none;
                cursor: pointer;
                color: #333;
                display: flex;
                align-items: center;
                text-decoration: none;
                position: relative;
            }
            .icon-minimal:hover { color: #8B5E3C; }
            .cart-count-minimal {
                position: absolute;
                top: -8px;
                right: -12px;
                background: #8B5E3C;
                color: white;
                font-size: 10px;
                min-width: 18px;
                height: 18px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .cart-count-minimal.disabled {
                background: #ccc;
                cursor: not-allowed;
            }
            .user-menu-wrapper { position: relative; }
            .user-menu-btn {
                background: none;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 5px 10px;
                border-radius: 30px;
            }
            .user-menu-btn:hover { background: #f5f5f5; }
            .user-avatar-mini {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: #f0f0f0;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .user-name-header {
                font-size: 13px;
                font-weight: 500;
                max-width: 80px;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .user-dropdown-menu {
                position: absolute;
                top: 100%;
                left: 0;
                background: white;
                min-width: 200px;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                padding: 8px 0;
                display: none;
                z-index: 1001;
                margin-top: 10px;
            }
            .user-dropdown-menu.show { display: block; }
            .user-dropdown-menu a {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 20px;
                text-decoration: none;
                color: #333;
                font-size: 13px;
            }
            .user-dropdown-menu a:hover { background: #f5f5f5; color: #8B5E3C; }
            .user-dropdown-menu hr { margin: 8px 0; border-top: 1px solid #eee; }
            .dropdown-mask {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 999;
                display: none;
            }
            .dropdown-mask.active { display: block; }
            @media (max-width: 768px) {
                .nav-links-minimal { display: none; }
                .user-name-header { display: none; }
            }
        `;
        document.head.appendChild(style);
    }

    function getHeaderStructure() {
        return `
            <div class="navbar-minimal">
                <div class="container-minimal">
                    <a href="index.html" class="logo-text">
                        <img src="/asset/imag/logo.png" alt="MIM TEHRAN Logo" style="height: 90px; width: auto; display: block;">
                    </a>
                    <div class="nav-links-minimal">
                        <a href="index.html">خانه</a>
                        <a href="shop.html">محصولات</a>
                        <a href="contact-us.html">تماس با ما</a>
                        <a href="drop.html" style="border-radius: 15px; background-color: #8b5e3c; color: white; padding: 3px 20px; text-decoration: none; display: inline-block;">دراپ</a>

                    </div>
                    <div class="nav-icons-minimal">
                        <div id="userSection"></div>
                        <button class="icon-minimal" id="cartIconBtn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            <span class="cart-count-minimal" id="cartCount">0</span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="dropdown-mask" id="dropdownMask"></div>
        `;
    }

    // بررسی اعتبار توکن از سرور
    async function verifyTokenAndGetUser() {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            return null;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/user`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                const userData = result.data || result;
                localStorage.setItem('user_data', JSON.stringify(userData));
                return userData;
            } else if (response.status === 401) {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
                sessionStorage.clear();
                return null;
            }
        } catch (error) {
            console.error('Error verifying token:', error);
            return null;
        }
        
        return null;
    }

    // ===== API سبد خرید =====
    async function getCartCount() {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            cartCount = 0;
            updateCartDisplay();
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/cart/count`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                cartCount = result.count || result.data?.count || 0;
            } else if (response.status === 401) {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
                cartCount = 0;
            } else {
                cartCount = 0;
            }
        } catch (error) {
            console.error('Error getting cart count:', error);
            cartCount = 0;
        }
        
        updateCartDisplay();
    }

    function updateCartDisplay() {
        const cartSpan = document.getElementById('cartCount');
        if (cartSpan) {
            cartSpan.textContent = cartCount;
        }
    }

    window.updateCartCount = async function() {
        await getCartCount();
        return cartCount;
    };

   // تابع اصلی برای به‌روزرسانی وضعیت کاربر
async function updateUserSection() {
    const userSection = document.getElementById('userSection');
    if (!userSection) return;

    // ابتدا از localStorage اطلاعات رو بگیر
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user_data');
    
    let userData = null;
    let isValidSession = false;
    
    if (token && storedUser) {
        try {
            userData = JSON.parse(storedUser);
            isValidSession = true;
        } catch(e) {
            console.error('Error parsing user_data:', e);
        }
    }
    
    // اگر توکن داریم ولی user_data نداریم، از سرور بگیر
    if (token && !userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/user`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                userData = result.data || result;
                localStorage.setItem('user_data', JSON.stringify(userData));
                isValidSession = true;
            } else if (response.status === 401) {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
                isValidSession = false;
                userData = null;
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    }
    
    console.log('isValidSession:', isValidSession, 'userData:', userData);
    
    if (isValidSession && userData) {
        // حالت لاگین شده - نمایش دکمه با منو
        const displayName = userData.first_name || userData.email || userData.phone || userData.mobile || 'کاربر';
        userSection.innerHTML = `
            <div class="user-menu-wrapper">
                <button class="user-menu-btn" id="userMenuBtn">
                    <div class="user-avatar-mini"><span>👤</span></div>
                    <span class="user-name-header">${escapeHtml(displayName)}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
                <div class="user-dropdown-menu" id="userDropdownMenu">
                    <a href="profile.html">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        پروفایل من
                    </a>
                    <a href="userorder.html">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        سفارشات من
                    </a>
                    <hr>
                    <a href="#" id="logoutBtnHeader">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        خروج از حساب
                    </a>
                </div>
            </div>
        `;
    } else {
        // حالت لاگین نشده - نمایش لینک ورود/ثبت نام
        userSection.innerHTML = `
            <a href="log-in.html" class="icon-minimal" title="ثبت نام / ورود">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </a>
        `;
    }
    
    attachDropdownEvents();
}
    
    // تابع کمکی برای جلوگیری از XSS
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function attachDropdownEvents() {
        const menuBtn = document.getElementById('userMenuBtn');
        const mask = document.getElementById('dropdownMask');
        
        if (menuBtn) {
            const newBtn = menuBtn.cloneNode(true);
            menuBtn.parentNode.replaceChild(newBtn, menuBtn);
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const dropdown = document.getElementById('userDropdownMenu');
                if (dropdown) {
                    const isOpen = dropdown.classList.contains('show');
                    closeAllDropdowns();
                    
                    if (!isOpen) {
                        dropdown.classList.add('show');
                        if (mask) mask.classList.add('active');
                    }
                }
            });
        }
        
        const logoutBtn = document.getElementById('logoutBtnHeader');
        if (logoutBtn) {
            const newLogout = logoutBtn.cloneNode(true);
            logoutBtn.parentNode.replaceChild(newLogout, logoutBtn);
            newLogout.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (confirm('آیا مطمئن هستید که می‌خواهید خارج شوید؟')) {
                    const token = localStorage.getItem('auth_token');
                    if (token) {
                        try {
                            await fetch(`${API_BASE_URL}/logout`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Accept': 'application/json'
                                }
                            });
                        } catch(e) {
                            console.error('Logout error:', e);
                        }
                    }
                    
                    localStorage.clear();
                    sessionStorage.clear();
                    
                    document.cookie.split(";").forEach(function(c) { 
                        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                    });
                    
                    window.location.href = 'index.html';
                }
            });
        }
        
        if (mask) {
            const newMask = mask.cloneNode(true);
            mask.parentNode.replaceChild(newMask, mask);
            newMask.addEventListener('click', closeAllDropdowns);
        }
        
        document.removeEventListener('click', handleOutsideClick);
        document.addEventListener('click', handleOutsideClick);
    }
    
    function handleOutsideClick(e) {
        const wrapper = document.querySelector('.user-menu-wrapper');
        const dropdown = document.getElementById('userDropdownMenu');
        const mask = document.getElementById('dropdownMask');
        
        if (wrapper && dropdown && !wrapper.contains(e.target)) {
            dropdown.classList.remove('show');
            if (mask) mask.classList.remove('active');
        }
    }
    
    function closeAllDropdowns() {
        const dropdown = document.getElementById('userDropdownMenu');
        const mask = document.getElementById('dropdownMask');
        if (dropdown) dropdown.classList.remove('show');
        if (mask) mask.classList.remove('active');
    }

    function attachCartEvent() {
    const cartBtn = document.getElementById('cartIconBtn');
    if (cartBtn) {
        const newCart = cartBtn.cloneNode(true);
        cartBtn.parentNode.replaceChild(newCart, cartBtn);
        
        const token = localStorage.getItem('auth_token');
        newCart.addEventListener('click', (e) => {
            e.preventDefault();
            if (!token) {
                if (confirm('برای مشاهده سبد خرید باید وارد شوید. آیا به صفحه ورود بروید؟')) {
                    window.location.href = 'log-in.html';
                }
            } else {
                window.location.href = 'cart.html';
            }
        });
    }
}

    async function updateHeaderContent() {
        await Promise.all([
            getCartCount(),
            updateUserSection()
        ]);
        // بعد از به روز رسانی، رویداد سبد خرید را دوباره تنظیم کن (برای تغییر وضعیت لاگین)
        attachCartEvent();
    }

    async function renderHeader() {
        const headerContainer = document.getElementById('header');
        if (!headerContainer) {
            console.error('❌ المنت #header پیدا نشد!');
            return;
        }
        
        if (!headerContainer.hasChildNodes()) {
            headerContainer.innerHTML = getHeaderStructure();
            addHeaderStyles();
        }
        
        await updateHeaderContent();
        
        if (pollingInterval) clearInterval(pollingInterval);
        
        if (localStorage.getItem('auth_token')) {
            pollingInterval = setInterval(async () => {
                await updateHeaderContent();
            }, 30000);
        }
    }

    async function loadFooter() {
        const footerEl = document.getElementById('footer');
        if (!footerEl) return;
        
        try {
            const footerRes = await fetch("footer.html");
            footerEl.innerHTML = await footerRes.text();
        } catch (error) {
            console.error('Error loading footer:', error);
            footerEl.innerHTML = `<div style="text-align:center; padding:20px; background:#f5f5f5;">© 2024 MIM TEHRAN</div>`;
        }
    }

    async function init() {
        await renderHeader();
        await loadFooter();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();