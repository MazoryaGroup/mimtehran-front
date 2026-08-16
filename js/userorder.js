// ===== orders-merged.js =====
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
        const msgDiv = document.getElementById('messageContainer');
        if (!msgDiv) return;
        
        msgDiv.textContent = message;
        msgDiv.style.background = isError ? '#f8d7da' : '#d4edda';
        msgDiv.style.color = isError ? '#721c24' : '#155724';
        msgDiv.style.display = 'block';
        
        setTimeout(() => {
            msgDiv.style.display = 'none';
        }, 3000);
    }

    // ===== دریافت وضعیت سفارش به فارسی =====
    function getStatusText(status) {
        const statusMap = {
            'pending': 'در انتظار پرداخت',
            'completed': 'ارسال شده',
            'fail': 'لغو شده',
            'paid': 'پرداخت شده',
            
        };
        return statusMap[status] || status || 'در انتظار';
    }

    // ===== دریافت کلاس وضعیت =====
    function getStatusClass(status) {
        const classMap = {
            'pending': 'status-pending',
            'processing': 'status-processing',
            'completed': 'status-delivered',
            'shipped': 'status-shipped',
            'delivered': 'status-delivered',
            'fail': 'status-cancelled',
            'paid': 'status-processing',
            'unpaid': 'status-pending'
        };
        return classMap[status] || 'status-pending';
    }

    // ===== فرمت تاریخ =====
    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('fa-IR') + ' ' + date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    }

    // ===== فرمت قیمت =====
    function formatPrice(price) {
        return parseFloat(price || 0).toLocaleString('fa-IR') + ' تومان';
    }

    // ===== escape HTML =====
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===== دریافت سفارشات از API =====
    async function loadOrders() {
        const token = checkAuth();
        if (!token) return;

        showLoading();

        try {
            const response = await fetch(`${API_BASE_URL}/user-orders`, {
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
                throw new Error('خطا در دریافت سفارشات');
            }

            const result = await response.json();
            // بر اساس ساختار API شما: result.data
            const orders = result.data || result.orders || result || [];
            
            renderOrders(orders);

        } catch (error) {
            console.error('Error loading orders:', error);
            showError(error.message);
        }
    }

    // ===== نمایش لودینگ =====
    function showLoading() {
        const container = document.getElementById('ordersListContainer');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px;">
                    <div class="loading-spinner"></div>
                    <p style="margin-top: 20px; color: #666;">در حال بارگذاری سفارشات...</p>
                </div>
            `;
        }
    }

    // ===== نمایش خطا =====
    function showError(message) {
        const container = document.getElementById('ordersListContainer');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px;">
                    <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                    <h3 style="color: #c62828;">خطا در بارگذاری</h3>
                    <p style="color: #666; margin-bottom: 20px;">${escapeHtml(message)}</p>
                    <button onclick="location.reload()" style="padding: 10px 25px; background: #8B5E3C; color: white; border: none; border-radius: 5px; cursor: pointer;">تلاش مجدد</button>
                </div>
            `;
        }
    }

    // ===== رندر سفارشات =====
    function renderOrders(orders) {
        const container = document.getElementById('ordersListContainer');
        if (!container) return;

        if (!orders || orders.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px;">
                    <div style="font-size: 48px; margin-bottom: 20px;">📦</div>
                    <h3 style="color: #666;">هیچ سفارشی ثبت نشده است</h3>
                    <p style="color: #999; margin-bottom: 20px;">شما تاکنون سفارشی ثبت نکرده‌اید</p>
                    <a href="shop.html" style="display: inline-block; padding: 12px 30px; background: #8B5E3C; color: white; text-decoration: none; border-radius: 25px;">مشاهده محصولات</a>
                </div>
            `;
            return;
        }

        let ordersHtml = '';
        
        orders.forEach(order => {
            // استخراج اطلاعات از ساختار API
            const orderId = order.order_id || order.id;
            const trackingCode = order.tracking_code || '';
            const status = order.status || 'pending';
            const total = order.total || order.amount || 0;
            const createdAt = order.created_at;
            const shippingCost = order.shipping_cost || 0;
            
            const address = order.address || '';
            const items = order.items || [];

            // آیتم‌های سفارش
            let itemsHtml = '';
            items.forEach(item => {
                const itemName = item.name || `محصول شماره ${item.product_id}`;
                const itemQuantity = item.quantity || 1;
                const itemPrice = item.price || 0;
                const itemTotal = item.total || (itemPrice * itemQuantity);
                const colorName = item.color_name || item.color || '';

                itemsHtml += `
                    <div class="order-item">
                        <div class="order-item-info">
                            <div class="order-item-name">${escapeHtml(itemName)}</div>
                            <div class="order-item-meta">
                                تعداد: ${itemQuantity} عدد
                                ${colorName ? ` | رنگ: ${escapeHtml(colorName)}` : ''}
                            </div>
                        </div>
                        <div class="order-item-price">${formatPrice(itemTotal)}</div>
                    </div>
                `;
            });

            ordersHtml += `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <span class="order-number">📋 شماره سفارش: ${escapeHtml(orderId || 'نامشخص')}</span>
                            <span class="order-date">📅 ${formatDate(createdAt)}</span>
                        </div>
                        <div>
                            <span class="order-status ${getStatusClass(status)}">${getStatusText(status)}</span>
                        </div>
                    </div>
                    
                    <div class="order-body">
                        <div class="order-items">
                            ${itemsHtml}
                        </div>
                        ${address ? `
                            <div class="order-address">
                                <span class="address-label">📍 آدرس ارسال:</span>
                                <span class="address-text">${escapeHtml(address)}</span>
                            </div>
                        ` : ''}
                        
                    </div>
                    
                    <div class="order-footer">
                        <div class="order-total">
                            جمع کل: <span>${formatPrice(total)}</span>
                            ${shippingCost > 0 ? `<div class="shipping-cost">(هزینه ارسال: ${formatPrice(shippingCost)})</div>` : ''}
                        </div>
                        
                    </div>
                </div>
            `;
        });

        container.innerHTML = ordersHtml;
    }

    // ===== چاپ برچسب پستی =====
    function printLabel(orderId) {
        window.open(`label.html?order_id=${orderId}`, '_blank');
    }

    // ===== پیگیری مرسوله =====
    function trackOrder(trackingCode) {
        window.open(`https://tracking.post.ir/?id=${trackingCode}`, '_blank');
    }

    // ===== لود فوتر =====
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

    // ===== اضافه کردن استایل‌ها =====
    function addStyles() {
        if (document.getElementById('orders-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'orders-styles';
        style.textContent = `
            .orders-container {
                max-width: 1000px;
                margin: 0 auto;
                padding: 40px 20px;
            }
            .page-title {
                text-align: center;
                margin-bottom: 40px;
            }
            .main-title {
                font-size: 32px;
                color: #333;
                font-weight: 300;
            }
            .main-title span {
                font-weight: 600;
                color: #8B5E3C;
            }
            .orders-list {
                display: flex;
                flex-direction: column;
                gap: 25px;
            }
            .order-card {
                background: white;
                border-radius: 16px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                overflow: hidden;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .order-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            }
            .order-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                padding: 15px 20px;
                background: #f9f5f0;
                border-bottom: 1px solid #eee;
                gap: 10px;
            }
            .order-number {
                font-weight: bold;
                color: #8B5E3C;
                font-size: 14px;
                margin-left: 15px;
            }
            .order-date {
                font-size: 12px;
                color: #999;
            }
            .order-status {
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
            }
            .status-pending {
                background: #fff3e0;
                color: #f5a623;
            }
            .status-processing {
                background: #e3f2fd;
                color: #2196f3;
            }
            .status-shipped {
                background: #e8f5e9;
                color: #4caf50;
            }
            .status-delivered {
                background: #e8f5e9;
                color: #2e7d32;
            }
            .status-cancelled {
                background: #ffebee;
                color: #c62828;
            }
            .order-body {
                padding: 20px;
            }
            .order-items {
                margin-bottom: 15px;
            }
            .order-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid #eee;
                flex-wrap: wrap;
                gap: 10px;
            }
            .order-item:last-child {
                border-bottom: none;
            }
            .order-item-info {
                flex: 1;
            }
            .order-item-name {
                font-size: 14px;
                font-weight: 500;
                color: #333;
            }
            .order-item-meta {
                font-size: 12px;
                color: #999;
                margin-top: 4px;
            }
            .order-item-price {
                font-size: 14px;
                font-weight: bold;
                color: #8B5E3C;
            }
            .order-address, .order-payment {
                margin-top: 10px;
                padding: 8px 0;
                font-size: 13px;
                border-top: 1px solid #eee;
            }
            .address-label, .payment-label {
                color: #8B5E3C;
                font-weight: bold;
                margin-left: 8px;
            }
            .address-text, .payment-text {
                color: #666;
            }
            .order-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                padding: 15px 20px;
                background: #fafafa;
                border-top: 1px solid #eee;
                gap: 15px;
            }
            .order-total {
                font-size: 14px;
                font-weight: 500;
            }
            .order-total span {
                color: #8B5E3C;
                font-size: 18px;
                font-weight: bold;
            }
            .shipping-cost {
                font-size: 11px;
                color: #999;
                margin-top: 4px;
            }
            .order-actions {
                display: flex;
                gap: 10px;
            }
            .btn-label, .btn-track {
                padding: 8px 18px;
                border-radius: 25px;
                font-size: 12px;
                text-decoration: none;
                transition: all 0.2s;
                cursor: pointer;
                border: none;
                display: inline-block;
            }
            .btn-label {
                background: #8B5E3C;
                color: white;
            }
            .btn-label:hover {
                background: #6d4c2f;
            }
            .btn-track {
                background: #f5f5f5;
                color: #333;
                border: 1px solid #ddd;
            }
            .btn-track:hover {
                background: #e0e0e0;
            }
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #8B5E3C;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @media (max-width: 768px) {
                .orders-container {
                    padding: 20px;
                }
                .order-header {
                    flex-direction: column;
                    align-items: flex-start;
                }
                .order-footer {
                    flex-direction: column;
                    align-items: stretch;
                }
                .order-actions {
                    justify-content: center;
                }
                .btn-label, .btn-track {
                    text-align: center;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ===== رندر صفحه سفارشات =====
    function renderOrdersPage() {
        const pageDataDiv = document.querySelector('.page-data');
        if (!pageDataDiv) return;
        
        const ordersHtml = `
            <section class="page-title">
                <div style="max-width: 1280px; margin: 0 auto; padding: 0 20px; text-align: center;">
                    <h1 class="main-title">سفارشات <span>من</span></h1>
                </div>
            </section>

            <div class="orders-container">
                <div id="messageContainer" class="message-container" style="display: none; margin-bottom: 20px; padding: 12px; border-radius: 8px;"></div>
                <div id="ordersListContainer" class="orders-list"></div>
            </div>
        `;
        
        pageDataDiv.innerHTML = ordersHtml;
    }

    // ===== مقداردهی اولیه =====
    async function init() {
        addStyles();
        loadFooter();
        renderOrdersPage();
        await loadOrders();
        
        window.printLabel = printLabel;
        window.trackOrder = trackOrder;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();