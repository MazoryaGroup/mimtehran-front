// ===== checkout-merged.js =====
(function() {
    'use strict';

    const API_BASE_URL = 'https://api.mimtehran.ir/api';
    let cartItems = [];
    let isLoading = false;
    let userAddresses = [];
    let selectedAddressId = null;

    // ============================
    // ===== بخش تسویه حساب =====
    // ============================

    let subtotal = 0;

    function addCheckoutStyles() {
        if (document.getElementById('checkout-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'checkout-styles';
        style.textContent = `
            .checkout-form {
                max-width: 1280px;
                margin: 0 auto;
                padding: 40px 20px;
            }
            .page-title {
                text-align: center;
                margin-bottom: 30px;
            }
            .main-title {
                font-size: 28px;
                color: #333;
            }
            .w-commerce-commercelayoutcontainer {
                display: grid;
                grid-template-columns: 1fr 380px;
                gap: 30px;
            }
            .cart-title {
                font-size: 18px;
                font-weight: bold;
                margin: 0 0 5px;
            }
            .body-small {
                font-size: 12px;
                color: #999;
            }
            .default-input {
                width: 100%;
                padding: 12px 15px;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-size: 14px;
                margin-bottom: 16px;
                transition: border 0.2s;
            }
            .default-input:focus {
                outline: none;
                border-color: #8B5E3C;
            }
            .default-input[readonly] {
                background-color: #f5f5f5;
                cursor: default;
                border-color: #e0e0e0;
            }
            .w-commerce-commercecheckoutrow {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            .shipping-methods-list, .payment-methods {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .shipping-method-item, .payment-method-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 12px 15px;
                border: 1px solid #ddd;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .shipping-method-item.selected, .payment-method-item.selected {
                border-color: #8B5E3C;
                background: #fef5e8;
            }
            .shipping-method-item input, .payment-method-item input {
                width: 18px;
                height: 18px;
                cursor: pointer;
            }
            .shipping-method-item > div:first-of-type {
                flex: 1;
            }
            .card-to-card-info {
                margin-top: 15px;
                padding: 12px;
                background: #fef5e8;
                border-radius: 8px;
                font-size: 13px;
                color: #8B5E3C;
            }
            .order-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid #eee;
            }
            .order-item:last-child {
                border-bottom: none;
            }
            .order-item-info {
                flex: 1;
            }
            .order-item-name {
                font-weight: 600;
                font-size: 14px;
            }
            .order-item-code {
                font-size: 11px;
                color: #999;
                margin-top: 3px;
            }
            .order-item-price {
                font-size: 14px;
                color: #8B5E3C;
                font-weight: bold;
            }
            .order-summary-wrapper {
                background: white;
                border-radius: 20px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                position: sticky;
                top: 90px;
            }
            .summary-line-item {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                font-size: 14px;
            }
            .address-select {
                width: 100%;
                padding: 12px 15px;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-size: 14px;
                margin-bottom: 16px;
                background: white;
                cursor: pointer;
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
                margin-top: 20px;
                transition: background 0.2s;
            }
            .primary-btn:hover {
                background: #6d4c2f;
            }
            .primary-btn:disabled {
                background: #ccc;
                cursor: not-allowed;
            }
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }
            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #8B5E3C;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                background: white;
                padding: 20px;
                border-radius: 50%;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @media (max-width: 768px) {
                .w-commerce-commercelayoutcontainer {
                    grid-template-columns: 1fr;
                }
                .w-commerce-commercecheckoutrow {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatPrice(price) {
        return parseFloat(price || 0).toLocaleString('fa-IR') + ' تومان';
    }

    // ===== دریافت آدرس‌های کاربر از API =====
    async function loadUserAddresses() {
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
                populateAddressSelect();
            }
        } catch (error) {
            console.error('Error loading addresses:', error);
        }
    }

    function populateAddressSelect() {
        const addressSelect = document.getElementById('addressSelect');
        if (!addressSelect) return;

        if (!userAddresses || userAddresses.length === 0) {
            addressSelect.innerHTML = '<option value="">آدرسی ثبت نشده است</option>';
            enableAddressFields(true);
            return;
        }

        let options = '<option value="">انتخاب آدرس...</option>';
        userAddresses.forEach(addr => {
            const addressText = `${addr.city || ''} - ${addr.address || ''}`;
            options += `<option value="${addr.id}" data-address='${JSON.stringify(addr)}'>${escapeHtml(addressText)}</option>`;
        });
        addressSelect.innerHTML = options;

        const defaultAddr = userAddresses.find(a => a.is_default === true || a.isDefault === true);
        if (defaultAddr) {
            addressSelect.value = defaultAddr.id;
            selectedAddressId = defaultAddr.id;
            fillAddressFields(defaultAddr);
            enableAddressFields(false);
        } else {
            enableAddressFields(true);
        }

        addressSelect.addEventListener('change', (e) => {
            const selectedId = e.target.value;
            selectedAddressId = selectedId;
            if (selectedId) {
                const selectedAddr = userAddresses.find(a => a.id == selectedId);
                if (selectedAddr) {
                    fillAddressFields(selectedAddr);
                    enableAddressFields(false);
                }
            } else {
                clearAddressFields();
                enableAddressFields(true);
            }
        });
    }

    function enableAddressFields(enabled) {
        const cityInput = document.getElementById('checkoutCity');
        const addressInput = document.getElementById('checkoutAddress');
        const postCodeInput = document.getElementById('checkoutPost_Code');
        
        const inputs = [cityInput, addressInput, postCodeInput];
        
        inputs.forEach(input => {
            if (input) {
                if (enabled) {
                    input.removeAttribute('readonly');
                    input.style.backgroundColor = 'white';
                } else {
                    input.setAttribute('readonly', true);
                    input.style.backgroundColor = '#f5f5f5';
                }
            }
        });
    }

    function fillAddressFields(address) {
        const cityInput = document.getElementById('checkoutCity');
        const addressInput = document.getElementById('checkoutAddress');
        const postCodeInput = document.getElementById('checkoutPost_Code');
        
        if (cityInput) cityInput.value = address.city || '';
        if (addressInput) addressInput.value = address.address || '';
        if (postCodeInput) postCodeInput.value = address.post_code || '';
    }

    function clearAddressFields() {
        const cityInput = document.getElementById('checkoutCity');
        const addressInput = document.getElementById('checkoutAddress');
        const postCodeInput = document.getElementById('checkoutPost_Code');
        
        if (cityInput) cityInput.value = '';
        if (addressInput) addressInput.value = '';
        if (postCodeInput) postCodeInput.value = '';
    }

    async function loadCartItemsForCheckout() {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            window.location.href = 'log-in.html';
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/cart/items`, {
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

            if (!response.ok) {
                throw new Error('خطا در دریافت سبد خرید');
            }

            const result = await response.json();
            cartItems = result.items || result.data || result || [];
            
            updateOrderItemsDisplay();
            calculateSubtotal();

        } catch (error) {
            console.error('Error loading cart:', error);
        }
    }

    function updateOrderItemsDisplay() {
        const orderItemsContainer = document.querySelector('.order-items-container');
        if (!orderItemsContainer) return;

        if (!cartItems || cartItems.length === 0) {
            orderItemsContainer.innerHTML = '<div class="order-item">سبد خرید شما خالی است</div>';
            return;
        }

        let itemsHtml = '';
        cartItems.forEach(item => {
            const itemTotal = (item.price || 0) * (item.quantity || 1);
            const productName = item.product_name || item.name || 'محصول';
            const productCode = item.product_idname || item.product_id || item.id;
            
            itemsHtml += `
                <div class="order-item">
                    <div class="order-item-info">
                        <div class="order-item-name">${escapeHtml(productName)}</div>
                        <div class="order-item-code">کد: ${escapeHtml(productCode)}</div>
                        ${item.color ? `<div class="order-item-code">رنگ: ${escapeHtml(item.color)}</div>` : ''}
                        <div style="font-size: 12px; color: #666; margin-top: 3px;">تعداد: ${item.quantity} عدد</div>
                    </div>
                    <div class="order-item-price">${formatPrice(itemTotal)}</div>
                </div>
            `;
        });
        orderItemsContainer.innerHTML = itemsHtml;
    }

    function calculateSubtotal() {
        subtotal = 0;
        cartItems.forEach(item => {
            subtotal += (item.price || 0) * (item.quantity || 1);
        });
        updateTotals();
    }

    function updateTotals() {
        let shippingCost = 135000;
        const selectedShipping = document.querySelector('input[name="shipping-method"]:checked');
        if (selectedShipping) {
            shippingCost = parseInt(selectedShipping.value);
        }
        
        const total = subtotal + shippingCost;
        
        const subtotalEl = document.getElementById('subtotal');
        const shippingEl = document.getElementById('shippingCost');
        const totalEl = document.getElementById('total');
        
        if (subtotalEl) subtotalEl.innerHTML = formatPrice(subtotal);
        if (shippingEl) shippingEl.innerHTML = formatPrice(shippingCost);
        if (totalEl) totalEl.innerHTML = formatPrice(total);
        
        return { subtotal, shippingCost, total };
    }

    function updateShippingSelection() {
        const items = document.querySelectorAll('.shipping-method-item');
        const selectedValue = document.querySelector('input[name="shipping-method"]:checked')?.value;
        items.forEach(item => {
            const radio = item.querySelector('input');
            if (radio && radio.value === selectedValue) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    function updatePaymentSelection() {
        const items = document.querySelectorAll('.payment-method-item');
        const selectedValue = document.querySelector('input[name="payment-method"]:checked')?.value;
        items.forEach(item => {
            const radio = item.querySelector('input');
            if (radio && radio.value === selectedValue) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    function updatePaymentMethod() {
        const selectedPayment = document.querySelector('input[name="payment-method"]:checked');
        const cardInfo = document.getElementById('cardToCardInfo');
        if (selectedPayment && selectedPayment.value === 'card-to-card') {
            if (cardInfo) cardInfo.style.display = 'block';
        } else {
            if (cardInfo) cardInfo.style.display = 'none';
        }
    }

    function validatePhone(phone) {
        return /^09[0-9]{9}$/.test(phone);
    }

    function validatePostCode(zip) {
        return /^(?!0)\d{10}$/.test(zip);
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showLoading() {
        let overlay = document.getElementById('loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = '<div class="loading-spinner"></div>';
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
    }

    function hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.style.display = 'none';
    }

    // ===== خالی کردن سبد خرید بعد از ثبت سفارش =====
    async function clearCart() {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        
        try {
            // خالی کردن localStorage
            localStorage.setItem('shal_cart', '[]');
            
            // خالی کردن سبد خرید در سرور
            await fetch(`${API_BASE_URL}/cart/clear`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            
            // به روز رسانی هدر
            if (window.updateHeaderCartCount) {
                await window.updateHeaderCartCount();
            }
        } catch(e) {
            console.log('Error clearing cart:', e);
        }
    }

    // ===== پرداخت با زرین‌پال =====
    async function startPayment() {
        try {
            if (!cartItems || cartItems.length === 0) {
                alert('❌ سبد خرید شما خالی است');
                hideLoading();
                return false;
            }
            
            if (!selectedAddressId || selectedAddressId === '') {
                alert('❌ لطفاً یک آدرس را انتخاب کنید');
                hideLoading();
                return false;
            }
            
            const products = cartItems.map(item => {
                const colorName = item.color_name || item.color;
                
                if (!colorName) {
                    throw new Error(`رنگ محصول "${item.product_name || item.name}" مشخص نشده است`);
                }
                
                return {
                    product_id: item.product_id,
                    quantity: item.quantity,
                    color: colorName
                };
            });
            
            const response = await fetch(`${API_BASE_URL}/payment/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    address_id: parseInt(selectedAddressId),
                    products: products,
                    campaign_id: null
                })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || result.message || 'خطا در شروع پرداخت');
            }
            
            const paymentUrl = result.payment_url;
            
            if (paymentUrl) {
                localStorage.setItem('pending_order', JSON.stringify({
                    order_id: result.order_id,
                    tracking_code: result.tracking_code,
                    authority: result.authority,
                    timestamp: Date.now()
                }));
                
                window.location.href = paymentUrl;
            } else {
                throw new Error('لینک پرداخت دریافت نشد');
            }
            
        } catch (error) {
            console.error('Payment error:', error);
            alert('❌ خطا در شروع پرداخت: ' + error.message);
            hideLoading();
            return false;
        }
    }

    // ===== ثبت سفارش =====
    async function submitOrder(event) {
        event.preventDefault();
        
        const email = document.getElementById('checkoutEmail')?.value;
        const phone = document.getElementById('checkoutPhone')?.value;
        const name = document.getElementById('checkoutName')?.value;
        const address = document.getElementById('checkoutAddress')?.value;
        const addressMore = document.getElementById('checkoutAddressMore')?.value;
        const city = document.getElementById('checkoutCity')?.value;
        const postCode = document.getElementById('checkoutPost_Code')?.value;
        
        if (!email || !phone || !name || !address || !city || !postCode) {
            alert('❌ لطفاً تمام فیلدهای الزامی را پر کنید');
            return;
        }
        
        if (!validateEmail(email)) {
            alert('❌ ایمیل معتبر نیست');
            return;
        }
        
        if (!validatePhone(phone)) {
            alert('❌ شماره همراه معتبر نیست (۰۹۱۲۳۴۵۶۷۸۹)');
            return;
        }
        
        if (!validatePostCode(postCode)) {
            alert('❌ کد پستی باید ۱۰ رقم باشد');
            return;
        }
        
        if (!selectedAddressId || selectedAddressId === '') {
            alert('❌ لطفاً یک آدرس را انتخاب کنید');
            return;
        }
        
        if (!cartItems || cartItems.length === 0) {
            alert('❌ سبد خرید شما خالی است');
            return;
        }
        
        const selectedPayment = document.querySelector('input[name="payment-method"]:checked')?.value;
        const selectedShipping = document.querySelector('input[name="shipping-method"]:checked');
        const shippingCost = selectedShipping ? parseInt(selectedShipping.value) : 135000;
        
        showLoading();
        
        if (selectedPayment === 'zarinpal') {
            // پرداخت آنلاین
            await startPayment();
        } else {
            // پرداخت کارت به کارت یا درب منزل
            const orderId = 'ORD-' + Date.now();
            
            const orderData = {
                order_id: orderId,
                amount: subtotal + shippingCost,
                description: `سفارش از فروشگاه MIM TEHRAN - شماره: ${orderId}`,
                customer: {
                    email: email,
                    phone: phone,
                    name: name
                },
                shipping: {
                    address: address,
                    address_more: addressMore,
                    city: city,
                    post_code: postCode,
                    cost: shippingCost
                },
                items: cartItems.map(item => ({
                    product_id: item.product_id,
                    name: item.product_name || item.name,
                    quantity: item.quantity,
                    price: item.price,
                    color: item.color
                })),
                subtotal: subtotal,
                shipping_cost: shippingCost,
                total: subtotal + shippingCost,
                payment_method: selectedPayment
            };
            
            try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch(`${API_BASE_URL}/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(orderData)
                });
                
                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.message || 'خطا در ثبت سفارش');
                }
                
                // خالی کردن سبد خرید
                await clearCart();
                
                // ذخیره در localStorage
                const orders = JSON.parse(localStorage.getItem('user_orders') || '[]');
                orders.push({
                    ...orderData,
                    status: 'pending',
                    created_at: new Date().toISOString()
                });
                localStorage.setItem('user_orders', JSON.stringify(orders));
                
                alert(`✅ سفارش شما با موفقیت ثبت شد!\n📦 شماره سفارش: ${orderId}\n💰 مبلغ: ${(subtotal + shippingCost).toLocaleString()} تومان`);
                
                setTimeout(() => {
                    window.location.href = 'orders.html';
                }, 2000);
                
            } catch (error) {
                console.error('Order error:', error);
                alert('❌ خطا در ثبت سفارش: ' + error.message);
            } finally {
                hideLoading();
            }
        }
    }

    function loadProfileData() {
        const user = JSON.parse(localStorage.getItem('user_data') || '{}');
        const registered = JSON.parse(localStorage.getItem('user_registered') || '{}');
        
        const emailInput = document.getElementById('checkoutEmail');
        const phoneInput = document.getElementById('checkoutPhone');
        const nameInput = document.getElementById('checkoutName');
        
        if (emailInput) {
            if (user.email) emailInput.value = user.email;
            else if (registered.email) emailInput.value = registered.email;
        }
        
        if (phoneInput) {
            if (user.phone) phoneInput.value = user.phone;
            else if (registered.phone) phoneInput.value = registered.phone;
        }
        
        if (nameInput) {
            const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
            if (fullName) {
                nameInput.value = fullName;
            } else if (user.name) {
                nameInput.value = user.name;
            }
        }
    }

    function setupEventListeners() {
        document.querySelectorAll('input[name="shipping-method"]').forEach(radio => {
            radio.addEventListener('change', () => {
                updateTotals();
                updateShippingSelection();
            });
        });
        
        document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
            radio.addEventListener('change', () => {
                updatePaymentMethod();
                updatePaymentSelection();
            });
        });
        
        const submitBtn = document.getElementById('submitOrderBtn');
        if (submitBtn) {
            const newBtn = submitBtn.cloneNode(true);
            submitBtn.parentNode.replaceChild(newBtn, submitBtn);
            newBtn.addEventListener('click', submitOrder);
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

    function renderCheckoutPage() {
        const mainContainer = document.querySelector('.page-data') || document.body;
        
        if (document.querySelector('.checkout-form')) return;
        
        const checkoutHtml = `
            <section class="page-title">
                <div class="container-minimal" style="display: block; text-align: center;">
                    <h1 class="main-title">تسویه حساب</h1>
                </div>
            </section>

            <div class="checkout-form">
                <div class="container">
                    <div class="w-commerce-commercelayoutcontainer">
                        <div class="w-commerce-commercelayoutmain">
                            <!-- اطلاعات مشتری -->
                            <div style="background: white; border-radius: 20px; padding: 10px 24px 24px; margin-bottom: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                                <div class="w-commerce-commercecheckoutblockheader">
                                    <h4 class="cart-title">اطلاعات مشتری</h4>
                                    <div class="body-small">* الزامی</div>
                                </div>
                                
                                    <label class="w-commerce-commercecheckoutlabel">ایمیل *</label>
                                    <input id="checkoutEmail" class="default-input" type="email" placeholder="example@gmail.com" />
                                    
                                    <label class="w-commerce-commercecheckoutlabel">شماره همراه *</label>
                                    <input id="checkoutPhone" class="default-input" type="tel" placeholder="۰۹۱۲۳۴۵۶۷۸۹" />

                                    <label class="w-commerce-commercecheckoutlabel">نام و نام خانوادگی *</label>
                                    <input id="checkoutName" class="default-input" type="text" placeholder="مثال: زهرا محمدی" />
                                
                            </div>
                            
                            <!-- آدرس ارسال -->
                            <div style="background: white; border-radius: 20px; padding: 10px 24px 24px; margin-bottom: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                                <div class="w-commerce-commercecheckoutblockheader">
                                    <h4 class="cart-title">آدرس ارسال</h4>
                                    <div class="body-small">* الزامی</div>
                                </div>
                                
                                    <label class="w-commerce-commercecheckoutlabel">انتخاب آدرس</label>
                                    <select id="addressSelect" class="address-select">
                                        <option value="">در حال بارگذاری...</option>
                                    </select>
                                    
                                    <div class="w-commerce-commercecheckoutrow">
                                        <div class="w-commerce-commercecheckoutcolumn">
                                            <label class="w-commerce-commercecheckoutlabel">شهر *</label>
                                            <input id="checkoutCity" class="default-input" type="text" placeholder="مثال: تهران" />
                                        </div>
                                        <div class="w-commerce-commercecheckoutcolumn">
                                            <label class="w-commerce-commercecheckoutlabel">کد پستی *</label>
                                            <input id="checkoutPost_Code" class="default-input" type="text" placeholder="۱۲۳۴۵۶۷۸۹۰" />
                                        </div>
                                    </div>
                                    
                                    <label class="w-commerce-commercecheckoutlabel">آدرس (خیابان، پلاک، واحد) *</label>
                                    <input id="checkoutAddress" class="default-input" type="text" placeholder="خیابان ولیعصر، پلاک ۱۲۳، واحد ۵" />
                                    
                                    <input id="checkoutAddressMore" class="default-input" type="text" placeholder="توضیحات بیشتر (پلاک، نبش، ...)" />
                                    <p>📍 قبل از خرید، حتماً آدرس خود را در پروفایل ثبت کنید تا سفارشتان بدون مشکل ارسال شود.</P>
                                
                            </div>
                            
                            <!-- روش ارسال -->
                            <div style="background: white; border-radius: 20px; padding: 10px 24px 24px; margin-bottom: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                                <div class="w-commerce-commercecheckoutblockheader">
                                    <h4 class="cart-title">روش ارسال</h4>
                                </div>
                                <div class="shipping-methods-list">
                                    <label class="shipping-method-item" data-shipping-cost="135000">
                                        <input type="radio" name="shipping-method" value="135000" checked />
                                        <div>
                                            <div style="font-weight: 600;">پیشتاز</div>
                                            <div style="font-size: 13px; color: #666;">ارسال با پست پیشتاز (۲ تا ۴ روز کاری)</div>
                                        </div>
                                        <div>135,000 تومان</div>
                                    </label>
                                    <label class="shipping-method-item" data-shipping-cost="145000">
                                        <input type="radio" name="shipping-method" value="145000" />
                                        <div>
                                            <div style="font-weight: 600;">تیپاکس</div>
                                            <div style="font-size: 13px; color: #666;">ارسال با تیپاکس (۱ تا ۲ روز کاری)</div>
                                        </div>
                                        <div>,000 تومان</div>
                                    </label>
                                    <label class="shipping-method-item" data-shipping-cost="45000">
                                        <input type="radio" name="shipping-method" value="45000" />
                                        <div>
                                            <div style="font-weight: 600;">پیک شهر تهران</div>
                                            <div style="font-size: 13px; color: #666;">ارسال با پیک مخصوص تهران (همان روز)</div>
                                        </div>
                                        <div>۴۵,۰۰۰ تومان</div>
                                    </label>
                                </div>
                            </div>
                            
                            <!-- اطلاعات پرداخت -->
                            <div style="background: white; border-radius: 20px; padding: 10px 24px 24px; margin-bottom: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                                <div class="w-commerce-commercecheckoutblockheader">
                                    <h4 class="cart-title">اطلاعات پرداخت</h4>
                                    <div class="body-small">* الزامی</div>
                                </div>
                                
                                <div class="payment-methods">
                                    <label class="payment-method-item">
                                        <input type="radio" name="payment-method" value="zarinpal" checked />
                                        <span>💳 پرداخت آنلاین (زرین‌پال)</span>
                                    </label>
                                    <label class="payment-method-item">
                                        <input type="radio" name="payment-method" value="card-to-card" />
                                        <span>🏧 پرداخت با اسنپ پی</span>
                                    </label>
                                    <label class="payment-method-item">
                                        <input type="radio" name="payment-method" value="cod" />
                                        <span>🚚 پرداخت درب منزل (فقط تهران)</span>
                                    </label>
                                </div>
                               
                                
                                <div style="margin-top: 16px;">
                                    <input id="sameAsShipping" type="checkbox" checked style="margin-left: 8px;" />
                                    <label for="sameAsShipping">✅ آدرس صورتحساب همان آدرس ارسال است</label>
                                </div>
                            </div>
                            
                            <!-- محصولات سفارش -->
                            <div style="background: white; border-radius: 20px; padding: 10px 24px 24px; margin-bottom: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                                <div class="w-commerce-commercecheckoutblockheader">
                                    <h4 class="cart-title">🛍️ محصولات سفارش</h4>
                                </div>
                                <div class="order-items-container"></div>
                            </div>
                        </div>
                        
                        <div class="w-commerce-commercelayoutsidebar">
                            <div class="order-summary-wrapper">
                                <div class="w-commerce-commercecheckoutsummaryblockheader">
                                    <h4 class="cart-title">💰 خلاصه سفارش</h4>
                                </div>
                                
                                <div class="summary-line-item">
                                    <div>جمع سبد خرید</div>
                                    <div id="subtotal">۰ تومان</div>
                                </div>
                                <div class="summary-line-item">
                                    <div>هزینه ارسال</div>
                                    <div id="shippingCost">۰ تومان</div>
                                </div>
                                <div class="summary-line-item" style="display: none;">
                                    <div>مالیات (۹%)</div>
                                    <div id="tax">۰ تومان</div>
                                </div>
                                <div class="summary-line-item">
                                    <div><strong>قابل پرداخت</strong></div>
                                    <div><strong id="total">۰ تومان</strong></div>
                                </div>
                                
                                <button id="submitOrderBtn" class="primary-btn">ثبت سفارش و پرداخت</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const existingPageData = document.querySelector('.page-data');
        if (existingPageData) {
            existingPageData.outerHTML = checkoutHtml;
        } else {
            const wrapper = document.createElement('div');
            wrapper.className = 'page-data';
            wrapper.innerHTML = checkoutHtml;
            const header = document.getElementById('header');
            if (header && header.nextSibling) {
                header.parentNode.insertBefore(wrapper, header.nextSibling);
            } else if (header) {
                header.parentNode.appendChild(wrapper);
            } else {
                document.body.appendChild(wrapper);
            }
        }
    }

    async function initCheckoutPage() {
        renderCheckoutPage();
        await loadUserAddresses();
        await loadCartItemsForCheckout();
        loadProfileData();
        setupEventListeners();
        updateTotals();
        updateShippingSelection();
        updatePaymentSelection();
        updatePaymentMethod();
    }

    // ============================
    // ===== مقداردهی اولیه =====
    // ============================

    async function init() {
        addCheckoutStyles();
        loadFooter();
        await initCheckoutPage();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();