// ===== cart-merged.js =====
(function() {
    'use strict';

    const API_BASE_URL = 'https://api.mimtehran.ir/api';
    let cartItems = [];
    let isLoading = false;

    // ============================
    // ===== بخش سبد خرید =====
    // ============================

    function addCartStyles() {
        if (document.getElementById('cart-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'cart-styles';
        style.textContent = `
            .cart-page {
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
            .cart-container {
                display: grid;
                grid-template-columns: 1fr 350px;
                gap: 30px;
            }
            .cart-items {
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                overflow: hidden;
            }
            .cart-header-row {
                display: grid;
                grid-template-columns: 120px 280px 100px 140px 100px 120px 30px;
                background: #f5f5f5;
                padding: 15px;
                font-weight: bold;
                font-size: 14px;
                border-bottom: 1px solid #eee;
            }
            .cart-item {
                display: grid;
                grid-template-columns: 120px 250px 100px 110px 100px 120px 30px;
                padding: 15px;
                align-items: center;
                border-bottom: 1px solid #eee;
                transition: background 0.2s;
            }
            .cart-item:hover {
                background: #fafafa;
            }
            .cart-item-image-placeholder {
                width: 60px;
                height: 60px;
                background: #f5f5f5;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                color: #8B5E3C;
                text-align: center;
                word-break: break-all;
                padding: 5px;
                border: 1px solid #eee;
            }
            .cart-item-title {
                font-size: 14px;
                color: #333;
                text-decoration: none;
            }
            .cart-item-title:hover {
                color: #8B5E3C;
            }
            .cart-item-price {
                font-size: 14px;
                color: #666;
            }
            .cart-item-quantity {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .quantity-btn {
                width: 28px;
                height: 28px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
                transition: all 0.2s;
            }
            .quantity-btn:hover {
                background: #8B5E3C;
                color: white;
                border-color: #8B5E3C;
            }
            .quantity-input {
                width: 45px;
                text-align: center;
                padding: 5px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 14px;
            }
            .cart-item-total {
                font-size: 14px;
                font-weight: bold;
                color: #8B5E3C;
            }
            .remove-item {
                background: none;
                border: none;
                cursor: pointer;
                color: #c62828;
                font-size: 18px;
                transition: transform 0.2s;
            }
            .remove-item:hover {
                transform: scale(1.1);
            }
            .cart-summary {
                background: white;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                height: fit-content;
                position: sticky;
                top: 90px;
            }
            .summary-title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #8B5E3C;
            }
            .summary-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 15px;
                font-size: 14px;
            }
            .summary-total {
                display: flex;
                justify-content: space-between;
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #eee;
                font-size: 18px;
                font-weight: bold;
                color: #8B5E3C;
            }
            .checkout-btn {
                width: 100%;
                padding: 15px;
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
            .checkout-btn:hover {
                background: #6d4c2f;
            }
            .checkout-btn:disabled {
                background: #ccc;
                cursor: not-allowed;
            }
            .empty-cart {
                text-align: center;
                padding: 60px 20px;
                background: white;
                border-radius: 12px;
            }
            .empty-cart svg {
                width: 80px;
                height: 80px;
                color: #ccc;
                margin-bottom: 20px;
            }
            .empty-cart h3 {
                font-size: 20px;
                color: #666;
                margin-bottom: 10px;
            }
            .empty-cart p {
                color: #999;
                margin-bottom: 20px;
            }
            .shop-now-btn {
                display: inline-block;
                padding: 12px 30px;
                background: #8B5E3C;
                color: white;
                text-decoration: none;
                border-radius: 25px;
                transition: background 0.2s;
            }
            .shop-now-btn:hover {
                background: #6d4c2f;
            }
            .loading-cart {
                text-align: center;
                padding: 60px;
            }
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #8B5E3C;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @media (max-width: 568px) {
    .cart-container {
        grid-template-columns: 1fr;
    }

    .cart-header-row {
        display: none;
    }

    .cart-item {
        display: grid;
        grid-template-columns: 60px 1fr;
        grid-template-areas:
            "img title"
            "img idneme"
            "img price"
            "img quantity"
            "img total"
            "img remove";
        gap: 8px;
        position: relative;
        padding: 15px;
        align-items: center;
    }

    .cart-item-image-placeholder {
        grid-area: img;
        width: 60px;
        height: 60px;
    }

    

    .cart-item-price {
        grid-area: price;
        font-size: 13px;
    }

    .cart-item-quantity {
        grid-area: quantity;
    }

    .cart-item-total {
        grid-area: total;
        font-weight: bold;
    }

    .remove-item {
        grid-area: remove;
        justify-self: end;
        font-size: 12px;
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

    async function loadCartItems() {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            window.location.href = 'log-in.html';
            return;
        }

        isLoading = true;
        showLoading();

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
            renderCart();

        } catch (error) {
            console.error('Error loading cart:', error);
            showError(error.message);
        } finally {
            isLoading = false;
        }
    }

    function showLoading() {
        const container = document.querySelector('.cart-container');
        if (container) {
            container.innerHTML = `
                <div class="loading-cart" style="grid-column: 1/-1;">
                    <div class="loading-spinner"></div>
                    <p>در حال بارگذاری سبد خرید...</p>
                </div>
            `;
        }
    }

    function showError(message) {
        const container = document.querySelector('.cart-container');
        if (container) {
            container.innerHTML = `
                <div class="empty-cart" style="grid-column: 1/-1;">
                    <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                    <h3>خطا در بارگذاری</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" style="padding: 10px 25px; background: #8B5E3C; color: white; border: none; border-radius: 5px; cursor: pointer;">تلاش مجدد</button>
                </div>
            `;
        }
    }

    function renderCart() {
        const container = document.querySelector('.cart-container');
        if (!container) return;

        if (!cartItems || cartItems.length === 0) {
            container.innerHTML = `
                <div class="empty-cart" style="grid-column: 1/-1;">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 18v3" />
                    </svg>
                    <h3>سبد خرید شما خالی است</h3>
                    <p>محصولات مورد نظر خود را به سبد خرید اضافه کنید</p>
                    <a href="shop.html" class="shop-now-btn">مشاهده محصولات</a>
                </div>
            `;
            return;
        }

        let subtotal = 0;
        
        const itemsHtml = cartItems.map(item => {
            const itemTotal = (item.price || 0) * (item.quantity || 1);
            subtotal += itemTotal;
            
            return `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-image-placeholder">
                        <span class="product-code">${escapeHtml(item.product_idname || item.product_id)}</span>
                    </div>
                    
                    <a href="details-product.html?id=${item.product_id}" class="cart-item-title">
                        ${escapeHtml(item.product_name || item.name)}
                    </a>
                    
            <a href="details-product.html?id=${item.product_id}" class="cart-item-title">
    ${escapeHtml(item.product_color || item.name)}
    ${item.color ? `<span style="font-size: 12px; color: #999; display: block; margin-top: 4px;">رنگ: ${escapeHtml(item.color)}</span>` : ''}
</a>

                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                    
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="decrementQuantity(${item.id}, ${item.quantity})">-</button>
                        <input type="number" class="quantity-input" id="qty-${item.id}" value="${item.quantity}" min="1" max="99" 
                               onchange="updateQuantity(${item.id}, this.value)">
                        <button class="quantity-btn" onclick="incrementQuantity(${item.id}, ${item.quantity})">+</button>
                    </div>
                    
                    <div class="cart-item-total">${formatPrice(itemTotal)}</div>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">🗑️</button>
                </div>
            `;
        }).join('');

        const total = subtotal;
        const grandTotal = total ;

        container.innerHTML = `
            <div class="cart-items">
                <div class="cart-header-row">
                    <span>کد محصول</span>
                    <span>نام محصول</span>
                    <span> رنگ </span>
                    <span>قیمت واحد</span>
                    <span>تعداد</span>
                    <span>جمع</span>
                    <span></span>
                </div>
                ${itemsHtml}
            </div>
            <div class="cart-summary">
                <div class="summary-title">خلاصه سبد خرید</div>
                <div class="summary-row">
                    <span>جمع کل</span>
                    <span>${formatPrice(total)}</span>
                </div>
                <div class="summary-total">
                    <span>قابل پرداخت</span>
                    <span>${formatPrice(grandTotal)}</span>
                </div>
                <button class="checkout-btn" onclick="proceedToCheckout()">ثبت سفارش</button>
            </div>
        `;
    }

    async function updateQuantity(cartId, newQuantity) {
        const quantity = parseInt(newQuantity);
        if (isNaN(quantity) || quantity < 1) return;

        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/cart/update/${cartId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ quantity: quantity })
            });

            if (response.ok) {
                await loadCartItems();
                if (window.updateHeaderCartCount) window.updateHeaderCartCount();
            } else {
                const input = document.getElementById(`qty-${cartId}`);
                if (input) {
                    const item = cartItems.find(i => i.id === cartId);
                    if (item) input.value = item.quantity;
                }
                alert('خطا در بروزرسانی تعداد');
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('خطا در بروزرسانی تعداد');
        }
    }

    async function incrementQuantity(cartId, currentQty) {
        await updateQuantity(cartId, currentQty + 1);
    }

    async function decrementQuantity(cartId, currentQty) {
        if (currentQty > 1) {
            await updateQuantity(cartId, currentQty - 1);
        }
    }

    async function removeFromCart(cartId) {
        if (!confirm('آیا از حذف این محصول از سبد خرید مطمئن هستید؟')) return;

        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/cart/remove/${cartId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                await loadCartItems();
                if (window.updateHeaderCartCount) window.updateHeaderCartCount();
            } else {
                alert('خطا در حذف محصول');
            }
        } catch (error) {
            console.error('Error removing item:', error);
            alert('خطا در حذف محصول');
        }
    }

    async function proceedToCheckout() {
        if (!cartItems || cartItems.length === 0) {
            alert('سبد خرید شما خالی است');
            return;
        }
        window.location.href = 'checkout.html';
    }

    function setupGlobalFunctions() {
        window.updateQuantity = updateQuantity;
        window.incrementQuantity = incrementQuantity;
        window.decrementQuantity = decrementQuantity;
        window.removeFromCart = removeFromCart;
        window.proceedToCheckout = proceedToCheckout;
    }

    function loadFooter() {
        const footerEl = document.getElementById('footer');
        if (!footerEl) return;
        
        // اگه قبلاً فوتر لود شده، دوباره لود نکن
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

    function renderCartPage() {
        const mainContainer = document.querySelector('.page-data') || document.body;
        
        if (document.querySelector('.cart-page')) return;
        
        const cartHtml = `
            <section class="page-title">
                <div class="container-minimal" style="display: block; text-align: center;">
                    <h1 class="main-title">سبد خرید</h1>
                </div>
            </section>
            <div class="cart-page">
                <div class="cart-container"></div>
            </div>
        `;
        
        const existingPageData = document.querySelector('.page-data');
        if (existingPageData) {
            existingPageData.outerHTML = cartHtml;
        } else {
            const wrapper = document.createElement('div');
            wrapper.className = 'page-data';
            wrapper.innerHTML = cartHtml;
            const header = document.getElementById('header');
            if (header && header.nextSibling) {
                header.parentNode.insertBefore(wrapper, header.nextSibling);
            } else if (header) {
                header.parentNode.appendChild(wrapper);
            } else {
                document.body.appendChild(wrapper);
            }
        }
        
        setupGlobalFunctions();
        loadCartItems();
    }

    // ============================
    // ===== مقداردهی اولیه =====
    // ============================

    async function init() {
        addCartStyles();
        loadFooter();
        renderCartPage();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();