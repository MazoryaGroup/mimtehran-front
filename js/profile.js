// ===== profile-merged.js =====
(function() {
    'use strict';

    const API_BASE_URL = 'https://api.mimtehran.ir/api';

    // ===== بررسی لاگین =====
    function checkAuth() {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            window.location.href = 'log-in.html';
            return false;
        }
        return token;
    }

    // ===== نمایش پیام =====
    function showMessage(message, isError = false) {
        const msgDiv = document.getElementById('successMsg');
        if (!msgDiv) return;
        
        msgDiv.textContent = message;
        msgDiv.style.background = isError ? '#f8d7da' : '#d4edda';
        msgDiv.style.color = isError ? '#721c24' : '#155724';
        msgDiv.style.display = 'block';
        
        setTimeout(() => {
            msgDiv.style.display = 'none';
        }, 3000);
    }

    // ===== لود اطلاعات پروفایل =====
    async function loadProfile() {
    const token = checkAuth();
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        
        if (response.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = 'log-in.html';
            return;
        }
        
        const result = await response.json();
        const user = result.data || result;
        
        document.getElementById('profileEmail').value = user.email || '';
        document.getElementById('profileFirstName').value = user.first_name || '';
        document.getElementById('profileLastName').value = user.last_name || '';
        document.getElementById('profilePhone').value = user.phone || '';
        
        localStorage.setItem('user_data', JSON.stringify(user));
        
        await loadAddresses();  // ← آدرس‌ها از API لود میشن
        
    } catch (error) {
        console.error('Error loading profile:', error);
        showMessage('خطا در دریافت اطلاعات پروفایل', true);
    }
}

    // ===== آپدیت پروفایل =====
    async function updateProfile(formData) {
        const token = checkAuth();
        if (!token) return false;
        
        try {
            const response = await fetch(`${API_BASE_URL}/update-profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'خطا در بروزرسانی پروفایل');
            }
            
            const updatedUser = result.data || result;
            localStorage.setItem('user_data', JSON.stringify(updatedUser));
            
            return { success: true, data: updatedUser };
            
        } catch (error) {
            console.error('Error updating profile:', error);
            showMessage(error.message, true);
            return { success: false };
        }
    }

  // ==================== مدیریت آدرس‌ها با API ====================
let userAddresses = [];
let editingAddressId = null;

// ===== گرفتن آدرس‌ها از API =====
async function loadAddresses() {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/addresses`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            userAddresses = result.data || result.addresses || result || [];
            renderAddresses();
        } else if (response.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = 'log-in.html';
        }
    } catch (error) {
        console.error('Error loading addresses:', error);
        showMessage('خطا در دریافت آدرس‌ها', true);
    }
}

function renderAddresses() {
    const container = document.getElementById('addressesList');
    if (!container) return;
    
    if (!userAddresses || userAddresses.length === 0) {
        container.innerHTML = '<div style="color:#999; padding:15px 0; text-align:center;">هیچ آدرسی ثبت نشده است</div>';
        return;
    }
    
    container.innerHTML = userAddresses.map(addr => `
        <div class="address-card" data-id="${addr.id}">
            <div class="address-header">
                <div>
                    <span class="address-title">🏠 ${escapeHtml(addr.title)}</span>
                </div>
                <div class="address-actions">
                    <button class="edit-address" onclick="window.editAddress(${addr.id})" title="ویرایش">✏️</button>
                    <button class="delete-address" onclick="window.deleteAddress(${addr.id})" title="حذف">🗑️</button>
                </div>
            </div>
            <div class="address-detail">
                ${escapeHtml(addr.city)}<br>
                ${escapeHtml(addr.address)}<br>
                کد پستی: ${escapeHtml(addr.post_code)}
            </div>
        </div>
    `).join('');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function resetAddressForm() {
    document.getElementById('addrTitle').value = '';
    document.getElementById('addrCity').value = '';
    document.getElementById('addrFull').value = '';
    document.getElementById('addrPost_Code').value = '';
    document.getElementById('addrIsDefault').checked = false;
    editingAddressId = null;
    document.getElementById('saveAddressBtn').textContent = 'ذخیره آدرس';
    document.getElementById('addAddressForm').style.display = 'none';
    document.getElementById('showAddAddressBtn').style.display = 'block';
}

function editAddress(id) {
    const address = userAddresses.find(a => a.id === id);
    if (!address) return;
    
    editingAddressId = id;
    document.getElementById('addrTitle').value = address.title || '';
    document.getElementById('addrCity').value = address.city || '';
    document.getElementById('addrFull').value = address.address || '';
    document.getElementById('addrPost_Code').value = address.post_code || '';
    document.getElementById('addrIsDefault').checked = address.is_default || false;
    document.getElementById('addAddressForm').style.display = 'block';
    document.getElementById('showAddAddressBtn').style.display = 'none';
    document.getElementById('saveAddressBtn').textContent = 'ویرایش آدرس';
}

async function deleteAddress(id) {
    if (!confirm('آیا از حذف این آدرس مطمئن هستید؟')) return;
    
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            await loadAddresses();
            showMessage('آدرس با موفقیت حذف شد');
        } else {
            const result = await response.json();
            throw new Error(result.message || 'خطا در حذف آدرس');
        }
    } catch (error) {
        console.error('Error deleting address:', error);
        showMessage(error.message, true);
    }
}

async function saveCurrentAddress() {
    const title = document.getElementById('addrTitle').value.trim();
    const city = document.getElementById('addrCity').value.trim();
    const fullAddress = document.getElementById('addrFull').value.trim();
    const post_Code = document.getElementById('addrPost_Code').value.trim();

    if (!title || !city || !fullAddress || !post_Code) {
        showMessage('لطفاً عنوان، شهر، آدرس و کد پستی را پر کنید', true);
        return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
        showMessage('لطفاً ابتدا وارد شوید', true);
        return;
    }

    const addressData = {
        title: title,
        city: city,
        address: fullAddress,
        post_code: post_Code,
    };

    try {
        let response;
        
        if (editingAddressId) {
            response = await fetch(`${API_BASE_URL}/addresses/${editingAddressId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(addressData)
            });
        } else {
            response = await fetch(`${API_BASE_URL}/addresses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(addressData)
            });
        }

        if (response.ok) {
            await loadAddresses();
            showMessage(editingAddressId ? 'آدرس با موفقیت ویرایش شد' : 'آدرس با موفقیت اضافه شد');
            resetAddressForm();
        } else {
            const result = await response.json();
            throw new Error(result.message || 'خطا در ذخیره آدرس');
        }
    } catch (error) {
        console.error('Error saving address:', error);
        showMessage(error.message, true);
    }
}
    // ==================== Event Listeners ====================
    function setupEventListeners() {
        // فرم پروفایل
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const password = document.getElementById('profilePassword').value;
                const confirmPassword = document.getElementById('profileConfirmPassword').value;
                
                if (password !== confirmPassword) {
                    showMessage('رمز عبور و تکرار آن مطابقت ندارند', true);
                    return;
                }
                
                if (password && password.length < 8) {
                    showMessage('رمز عبور باید حداقل ۸ کاراکتر باشد', true);
                    return;
                }
                
                const formData = {
                    first_name: document.getElementById('profileFirstName').value,
                    last_name: document.getElementById('profileLastName').value,
                    email: document.getElementById('profileEmail').value
                };
                
                if (password) {
                    formData.password = password;
                }
                
                const result = await updateProfile(formData);
                if (result.success) {
                    showMessage('اطلاعات پروفایل با موفقیت بروزرسانی شد');
                    document.getElementById('profilePassword').value = '';
                    document.getElementById('profileConfirmPassword').value = '';
                }
            });
        }
        
        // آدرس‌ها
        const showAddAddressBtn = document.getElementById('showAddAddressBtn');
        const cancelAddressBtn = document.getElementById('cancelAddressBtn');
        const saveAddressBtn = document.getElementById('saveAddressBtn');
        
        if (showAddAddressBtn) {
            const newBtn = showAddAddressBtn.cloneNode(true);
            showAddAddressBtn.parentNode.replaceChild(newBtn, showAddAddressBtn);
            newBtn.addEventListener('click', () => {
                resetAddressForm();
                document.getElementById('addAddressForm').style.display = 'block';
                newBtn.style.display = 'none';
            });
        }
        
        if (cancelAddressBtn) {
            const newBtn = cancelAddressBtn.cloneNode(true);
            cancelAddressBtn.parentNode.replaceChild(newBtn, cancelAddressBtn);
            newBtn.addEventListener('click', resetAddressForm);
        }
        
        if (saveAddressBtn) {
            const newBtn = saveAddressBtn.cloneNode(true);
            saveAddressBtn.parentNode.replaceChild(newBtn, saveAddressBtn);
            newBtn.addEventListener('click', saveCurrentAddress);
        }
        
        // خروج
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            const newBtn = logoutBtn.cloneNode(true);
            logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('آیا از خروج از حساب خود مطمئن هستید؟')) {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user_logged_in');
                    localStorage.removeItem('user_data');
                    sessionStorage.removeItem('isLoggedIn');
                    window.location.href = 'index.html';
                }
            });
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

    // ==================== رندر صفحه پروفایل ====================
    function renderProfilePage() {
        const pageDataDiv = document.querySelector('.page-data');
        if (!pageDataDiv) return;
        
        const profileHtml = `
            <section class="page-title">
                <div style="max-width: 1280px; margin: 0 auto; padding: 0 20px; text-align: center;">
                    <h1 class="main-title center">پروفایل کاربری</h1>
                </div>
            </section>

            <div class="profile-container">
                <!-- پیام موفقیت/خطا -->
                <div id="successMsg" class="success-message" style="display: none;"></div>
                
                <!-- فرم اطلاعات شخصی -->
                <div class="profile-card">
                    <h3 class="card-title">اطلاعات شخصی</h3>
                    <form id="profileForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label>نام</label>
                                <input type="text" id="profileFirstName" class="form-control" placeholder="نام">
                            </div>
                            <div class="form-group">
                                <label>نام خانوادگی</label>
                                <input type="text" id="profileLastName" class="form-control" placeholder="نام خانوادگی">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>ایمیل</label>
                                <input type="email" id="profileEmail" class="form-control" placeholder="example@email.com">
                            </div>
                            <div class="form-group">
                                <label>شماره همراه</label>
                                <input type="tel" id="profilePhone" class="form-control" disabled placeholder="۰۹۱۲۳۴۵۶۷۸۹">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>رمز عبور جدید</label>
                                <input type="password" id="profilePassword" class="form-control" placeholder="********">
                            </div>
                            <div class="form-group">
                                <label>تکرار رمز عبور</label>
                                <input type="password" id="profileConfirmPassword" class="form-control" placeholder="********">
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-save">ذخیره تغییرات</button>
                        </div>
                    </form>
                </div>
                
                <!-- بخش آدرس‌ها -->
                <div class="profile-card">
                    <div class="card-header">
                        <h3 class="card-title">آدرس‌های من</h3>
                        <button id="showAddAddressBtn" class="btn-add-address">+ افزودن آدرس جدید</button>
                    </div>
                    
                    <div id="addressesList" class="addresses-list"></div>
                    
                    <!-- فرم افزودن آدرس (مخفی در ابتدا) -->
                    <div id="addAddressForm" class="add-address-form" style="display: none;">
                        <h4 class="form-subtitle">آدرس جدید</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>عنوان آدرس *</label>
                                <input type="text" id="addrTitle" class="form-control" placeholder="مثال: منزل، محل کار">
                            </div>
                            
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>شهر *</label>
                                <input type="text" id="addrCity" class="form-control" placeholder="مثال: تهران">
                            </div>
                            <div class="form-group">
                                <label>کد پستی</label>
                                <input type="text" id="addrPost_Code" class="form-control" placeholder="۱۲۳۴۵۶۷۸۹۰">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>آدرس کامل *</label>
                            <textarea id="addrFull" class="form-control" rows="3" placeholder="خیابان، پلاک، واحد..."></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="addrIsDefault"> آدرس پیش‌فرض
                                </label>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button id="saveAddressBtn" class="btn-save">ذخیره آدرس</button>
                            <button id="cancelAddressBtn" class="btn-cancel">انصراف</button>
                        </div>
                    </div>
                </div>
                
                <!-- دکمه خروج -->
                <div class="profile-card logout-card">
                    <button id="logoutBtn" class="btn-logout">خروج از حساب کاربری</button>
                </div>
            </div>
        `;
        
        pageDataDiv.innerHTML = profileHtml;
        
        // اضافه کردن استایل‌ها
        if (!document.getElementById('profile-styles')) {
            const style = document.createElement('style');
            style.id = 'profile-styles';
            style.textContent = `
                .profile-container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 40px 20px;
                }
                .page-title {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .main-title {
                    font-size: 28px;
                    color: #333;
                    font-weight: 300;
                }
                .success-message {
                    padding: 12px 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
                .profile-card {
                    background: white;
                    border-radius: 16px;
                    padding: 25px;
                    margin-bottom: 25px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                }
                .card-title {
                    font-size: 20px;
                    font-weight: 600;
                    margin-bottom: 20px;
                    color: #333;
                    border-right: 3px solid #8B5E3C;
                    padding-right: 12px;
                }
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    margin-bottom: 20px;
                }
                .btn-add-address {
                    background: #8B5E3C;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 13px;
                }
                .btn-add-address:hover {
                    background: #6d4c2f;
                }
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 15px;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                }
                .form-group label {
                    font-size: 13px;
                    color: #666;
                    margin-bottom: 5px;
                }
                .form-control {
                    padding: 10px 12px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    font-size: 14px;
                }
                .form-control:focus {
                    outline: none;
                    border-color: #8B5E3C;
                }
                .form-control:disabled {
                    background: #f5f5f5;
                    color: #999;
                }
                textarea.form-control {
                    resize: vertical;
                }
                .checkbox-group {
                    flex-direction: row;
                    align-items: center;
                }
                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                }
                .form-actions {
                    display: flex;
                    gap: 15px;
                    margin-top: 20px;
                }
                .btn-save {
                    background: #8B5E3C;
                    color: white;
                    border: none;
                    padding: 10px 25px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                }
                .btn-save:hover {
                    background: #6d4c2f;
                }
                .btn-cancel {
                    background: #e0e0e0;
                    color: #333;
                    border: none;
                    padding: 10px 25px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                }
                .btn-cancel:hover {
                    background: #ccc;
                }
                .addresses-list {
                    margin-top: 15px;
                }
                .address-card {
                    border: 1px solid #eee;
                    border-radius: 12px;
                    padding: 15px;
                    margin-bottom: 12px;
                    transition: all 0.2s;
                }
                .address-card:hover {
                    border-color: #8B5E3C;
                }
                .address-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    margin-bottom: 10px;
                }
                .address-title {
                    font-weight: 600;
                    font-size: 15px;
                }
                .address-badge {
                    background: #8B5E3C;
                    color: white;
                    font-size: 10px;
                    padding: 2px 8px;
                    border-radius: 15px;
                    margin-right: 10px;
                }
                .address-actions {
                    display: flex;
                    gap: 10px;
                }
                .edit-address, .delete-address {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 16px;
                    padding: 5px;
                }
                .edit-address:hover {
                    transform: scale(1.1);
                }
                .delete-address:hover {
                    transform: scale(1.1);
                }
                .address-detail {
                    font-size: 13px;
                    color: #666;
                    line-height: 1.6;
                }
                .logout-card {
                    text-align: center;
                }
                .btn-logout {
                    background: none;
                    color: #c62828;
                    border: 1px solid #c62828;
                    padding: 12px 30px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                .btn-logout:hover {
                    background: #c62828;
                    color: white;
                }
                @media (max-width: 768px) {
                    .profile-container {
                        padding: 20px;
                    }
                    .form-row {
                        grid-template-columns: 1fr;
                        gap: 10px;
                    }
                    .card-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 10px;
                    }
                    .address-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }
                    .address-actions {
                        align-self: flex-end;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        setupEventListeners();
        renderAddresses();
    }

    // ==================== مقداردهی اولیه ====================
    async function init() {
        loadFooter();
        renderProfilePage();
        await loadProfile();
        
        window.editAddress = editAddress;
        window.deleteAddress = deleteAddress;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();