// ===== shop-merged.js =====
(function() {
    'use strict';

    const API_BASE_URL = 'https://api.mimtehran.ir/api';
    let currentPage = 1;
    let totalPages = 1;
    let isLoading = false;
    let currentCategory = '';
    let currentSort = 'newest';
    let categories = []; // ذخیره دسته‌بندی‌ها از API

    // ===== گرفتن دسته‌بندی‌ها از API =====
    async function loadCategories() {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                categories = result.data || result.categories || result || [];
                renderCategoryButtons();
            } else {
                // در صورت خطا، دسته‌بندی‌های پیش‌فرض
                categories = [
                    { id: 'all', name: 'همه', slug: 'all' },
                    { id: 'scarves', name: 'شال و روسری', slug: 'scarves' },
                    { id: 'shoes', name: 'کفش', slug: 'shoes' },
                    { id: 'dress', name: 'لباس', slug: 'dress' },
                    { id: 'accessory', name: 'اکسسوری', slug: 'accessory' }
                ];
                renderCategoryButtons();
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            // دسته‌بندی‌های پیش‌فرض
            categories = [
                { id: 'all', name: 'همه', slug: 'all' },
                { id: 'scarves', name: 'شال و روسری', slug: 'scarves' },
                { id: 'shoes', name: 'کفش', slug: 'shoes' },
                { id: 'dress', name: 'لباس', slug: 'dress' },
                { id: 'accessory', name: 'اکسسوری', slug: 'accessory' }
            ];
            renderCategoryButtons();
        }
    }

    // ===== رندر دکمه‌های دسته‌بندی =====
    function renderCategoryButtons() {
        const container = document.querySelector('.category-list');
        if (!container) return;
        
        if (!categories || categories.length === 0) return;
        
        let buttonsHtml = '';
        categories.forEach(cat => {
            const isActive = (currentCategory === cat.slug) || (cat.slug === 'all' && currentCategory === '');
            buttonsHtml += `
                <button class="category-btn ${isActive ? 'active' : ''}" data-category="${cat.slug}">
                    ${cat.name}
                </button>
            `;
        });
        
        container.innerHTML = buttonsHtml;
        setupCategoryFilters();
    }

    // ===== لود محصولات از API =====
    async function loadProducts(append = false) {
        if (isLoading) return;
        isLoading = true;
        
        showLoading(append);
        
        try {
            let url = `${API_BASE_URL}/products?page=${currentPage}&sort=${currentSort}`;
            if (currentCategory && currentCategory !== 'all') {
                url += `&category=${encodeURIComponent(currentCategory)}`;
            }
            
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'خطا در دریافت محصولات');
            }
            
            const data = result.data || result;
            const products = data.data || data.products || data;
            totalPages = data.last_page || data.meta?.last_page || 1;
            
            renderProducts(products, append);
            
            if (!append) {
                setupProductClicks();
            }
            
        } catch (error) {
            console.error('Error:', error);
            showError(error.message, append);
        } finally {
            isLoading = false;
        }
    }

    function showLoading(append) {
        const productList = document.querySelector('.product-list');
        if (!append && productList) {
            productList.innerHTML = `
                <div class="loading-container" style="grid-column: 1/-1; text-align: center; padding: 50px;">
                    <div class="loading-spinner"></div>
                    <p style="margin-top: 20px;">در حال بارگذاری محصولات...</p>
                </div>
            `;
        } else if (append) {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'loading-more';
            loadingDiv.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div class="loading-spinner-small"></div>
                    <p>در حال بارگذاری بیشتر...</p>
                </div>
            `;
            document.querySelector('.product-list')?.appendChild(loadingDiv);
        }
    }

    function showError(message, append) {
        const productList = document.querySelector('.product-list');
        if (productList && !append) {
            productList.innerHTML = `
                <div class="error-container" style="grid-column: 1/-1; text-align: center; padding: 50px;">
                    <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                    <h3 style="color: #c62828;">خطا در بارگذاری</h3>
                    <p style="margin: 20px 0;">${message}</p>
                    <button onclick="location.reload()" style="padding: 10px 25px; background: #8B5E3C; color: white; border: none; border-radius: 5px; cursor: pointer;">تلاش مجدد</button>
                </div>
            `;
        } else if (append) {
            const loadingDiv = document.querySelector('.loading-more');
            if (loadingDiv) loadingDiv.remove();
        }
    }

    function renderProducts(products, append = false) {
        const productList = document.querySelector('.product-list');
        if (!productList) return;
        
        if (!append) {
            productList.innerHTML = '';
        }
        
        const loadingMore = document.querySelector('.loading-more');
        if (loadingMore) loadingMore.remove();
        
        if (!products || products.length === 0) {
            if (!append) {
                productList.innerHTML = `
                    <div class="empty-products" style="grid-column: 1/-1; text-align: center; padding: 50px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">🛍️</div>
                        <h3>محصولی یافت نشد</h3>
                        <p>لطفاً دسته‌بندی دیگری را امتحان کنید.</p>
                    </div>
                `;
            }
            return;
        }
        
        products.forEach(product => {
            const productHtml = createProductCard(product);
            productList.insertAdjacentHTML('beforeend', productHtml);
        });
        
        updateCartCount();
    }

    function createProductCard(product) {
        const price = parseFloat(product.price || 0).toLocaleString('fa-IR');
        const discountPrice = product.discount_price ? parseFloat(product.discount_price).toLocaleString('fa-IR') : null;
        const hasDiscount = product.is_special_discount_active === true && discountPrice;
        const hasSpecialSale = product.is_special_sale_active === true;
        const discountPercent = hasDiscount ? Math.round((1 - (product.discount_price / product.price)) * 100) : 0;
        const image = product.main_image || 'https://placehold.co/600x600?text=Product';
        const productId = product.id;
        const productName = escapeHtml(product.name);
        const productidName = escapeHtml(product.idname);
        
        let badgeHtml = '';
        if (hasSpecialSale) {
            badgeHtml = '<span class="special-badge special-sale">🔥 حراج ویژه</span>';
        } else if (hasDiscount) {
            badgeHtml = `<span class="special-badge discount-badge">${discountPercent}% تخفیف</span>`;
        }
        
        return `
            <div class="product-item" data-product-id="${productId}">
                ${badgeHtml ? `<div class="product-badges">${badgeHtml}</div>` : ''}
                <a href="details-product.html?id=${productId}" class="product-link">
                    <div class="product-img">
                        <img alt="${productName}" loading="lazy" src="${image}" class="product-image" onerror="this.src='https://placehold.co/400x400?text=Product'" />
                    </div>
                    <div class="product-data">
                        <h6 class="product-name">${productName} - ${productidName}</h6>
                        <div class="product-price">
                            ${hasDiscount ? `
                                <div class="sale-price">${discountPrice} تومان</div>
                                <div class="compare-price">${price} تومان</div>
                            ` : `
                                <div class="sale-price">${price} تومان</div>
                            `}
                        </div>
                       
                    </div>
                </a>
                
            </div>
        `;
    }

    // ===== دسته‌بندی محصولات =====
    function setupCategoryFilters() {
        const categoryBtns = document.querySelectorAll('.category-btn');
        
        categoryBtns.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                
                // حذف کلاس active از همه
                document.querySelectorAll('.category-btn').forEach(cb => {
                    cb.classList.remove('active');
                });
                newBtn.classList.add('active');
                
                // تنظیم دسته‌بندی جاری
                currentCategory = category === 'all' ? '' : category;
                currentPage = 1;
                loadProducts(false);
            });
        });
    }

    function createCategorySection() {
        const container = document.querySelector('.products-section .container');
        if (!container) {
            console.error('❌ المنت .products-section .container پیدا نشد!');
            return;
        }
        
        if (document.querySelector('.category-section')) return;
        
        const categoryHtml = `
            <div class="category-section">
                <div class="category-list"></div>
            </div>
        `;
        
        container.insertAdjacentHTML('afterbegin', categoryHtml);
        
        // بارگذاری دسته‌بندی‌ها از API
        loadCategories();
    }

    function setupFilters() {
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            const newSelect = sortSelect.cloneNode(true);
            sortSelect.parentNode.replaceChild(newSelect, sortSelect);
            newSelect.addEventListener('change', (e) => {
                currentSort = e.target.value;
                currentPage = 1;
                loadProducts(false);
            });
        }
    }

    function createFilterSection() {
        const container = document.querySelector('.products-section .container');
        if (!container) return;
        
        if (document.querySelector('.filter-section')) return;
        
        const filterHtml = `
            <div class="filter-section">
                <div class="filter-row">
                    <div class="sort-wrapper">
                        <label>مرتب سازی:</label>
                        <select id="sort-select" class="sort-select">
                            <option value="newest">جدیدترین</option>
                            <option value="price_asc">ارزان‌ترین</option>
                            <option value="price_desc">گران‌ترین</option>
                            <option value="popular">پرفروش‌ترین</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', filterHtml);
        setupFilters();
    }

    function setupInfiniteScroll() {
        window.addEventListener('scroll', () => {
            if (isLoading) return;
            
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            if (scrollTop + windowHeight >= documentHeight - 200) {
                if (currentPage < totalPages) {
                    currentPage++;
                    loadProducts(true);
                }
            }
        });
    }

    function setupProductClicks() {
        document.querySelectorAll('.quick-add-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', handleQuickAdd);
        });
    }

    async function handleQuickAdd(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const btn = e.currentTarget;
        const productId = btn.dataset.id;
        const productName = btn.dataset.name;
        const originalText = btn.innerHTML;
        
        const token = localStorage.getItem('auth_token');
        if (!token) {
            if (confirm('برای افزودن به سبد خرید باید وارد شوید. آیا به صفحه ورود بروید؟')) {
                window.location.href = 'log-in.html';
            }
            return;
        }
        
        btn.innerHTML = '⏳ در حال افزودن...';
        btn.disabled = true;
        
        try {
            const response = await fetch(`${API_BASE_URL}/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: 1
                })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'خطا در افزودن به سبد خرید');
            }
            
            showCartMessage(`✅ ${productName} به سبد خرید اضافه شد!`);
            updateCartCount();
            
            btn.innerHTML = '✓ اضافه شد';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 2000);
            
        } catch (err) {
            btn.innerHTML = originalText;
            btn.disabled = false;
            showCartMessage(`❌ ${err.message}`, true);
        }
    }

    function showCartMessage(message, isError = false) {
        let messageDiv = document.getElementById('cart-message');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'cart-message';
            messageDiv.className = 'cart-message';
            document.body.appendChild(messageDiv);
        }
        
        messageDiv.textContent = message;
        messageDiv.style.background = isError ? '#c62828' : '#4caf50';
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 2000);
    }

    function updateCartCount() {
        const token = localStorage.getItem('auth_token');
        const cartCountSpan = document.getElementById('cartCount');
        
        if (!cartCountSpan) return;
        
        if (token) {
            fetch(`${API_BASE_URL}/cart/count`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(res => res.json())
            .then(data => {
                const count = data.count || data.data?.count || 0;
                cartCountSpan.textContent = count;
                cartCountSpan.style.display = count > 0 ? 'flex' : 'flex';
            })
            .catch(() => {
                const cart = JSON.parse(localStorage.getItem('shal_cart') || '[]');
                cartCountSpan.textContent = cart.length;
                cartCountSpan.style.display = cart.length > 0 ? 'flex' : 'flex';
            });
        } else {
            const cart = JSON.parse(localStorage.getItem('shal_cart') || '[]');
            cartCountSpan.textContent = cart.length;
            cartCountSpan.style.display = cart.length > 0 ? 'flex' : 'flex';
        }
        
        if (window.updateHeaderCartCount) {
            window.updateHeaderCartCount();
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

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function addStyles() {
        if (document.getElementById('shop-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'shop-styles';
        style.textContent = `
            .products-section {
                max-width: 1280px;
                margin: 0 auto;
                padding: 40px 20px;
            }
            .page-title {
                text-align: center;
                margin-bottom: 30px;
            }
            .main-title {
                font-size: 32px;
                color: #333;
                font-weight: 300;
            }
            .main-title.center {
                text-align: center;
            }
            
            /* ===== دسته‌بندی ===== */
            .category-section {
                margin-bottom: 30px;
            }
            .category-list {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 12px;
            }
            .category-btn {
                padding: 10px 28px;
                background: #f5f5f5;
                border: 1px solid #e0e0e0;
                border-radius: 40px;
                font-size: 14px;
                font-weight: 500;
                color: #666;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .category-btn:hover {
                background: #fef5e8;
                border-color: #8B5E3C;
                color: #8B5E3C;
            }
            .category-btn.active {
                background: #8B5E3C;
                border-color: #8B5E3C;
                color: white;
            }
            
            .product-badges {
                position: absolute;
                top: 10px;
                right: 10px;
                z-index: 10;
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            .special-badge {
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: bold;
                color: white;
            }
            .special-sale {
                background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            }
            .discount-badge {
                background: #4caf50;
            }
            .quick-add-btn {
                width: 90%;
                margin: 10px auto;
                padding: 8px 12px;
                background: #8B5E3C;
                color: white;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s ease;
                display: block;
                text-align: center;
            }
            .quick-add-btn:hover {
                background: #6d4c2f;
                transform: scale(1.02);
            }
            .quick-add-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            .filter-section {
                margin-bottom: 30px;
                padding: 15px 20px;
                background: #f9f9f9;
                border-radius: 10px;
            }
            .filter-row {
                display: flex;
                justify-content: flex-end;
            }
            .sort-wrapper {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .sort-wrapper label {
                font-size: 14px;
                color: #666;
            }
            .sort-select {
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 14px;
                cursor: pointer;
            }
            .product-sold {
                margin-top: 5px;
                font-size: 11px;
                color: #999;
            }
            .sold-count {
                direction: ltr;
                display: inline-block;
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
            .loading-spinner-small {
                width: 30px;
                height: 30px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #8B5E3C;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 10px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .cart-message {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #4caf50;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                display: none;
                z-index: 1000;
                animation: slideIn 0.3s ease;
                font-size: 14px;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            
            .product-link {
                text-decoration: none;
            }
            
           
            .product-data {
                padding: 15px;
            }
            .product-name {
                font-size: 14px;
                font-weight: 500;
                color: #333;
                margin-bottom: 8px;
                height: 40px;
                overflow: hidden;
            }
            .product-price {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
            }
            .sale-price {
                font-size: 16px;
                font-weight: bold;
                color: #8B5E3C;
            }
            .compare-price {
                font-size: 13px;
                color: #999;
                text-decoration: line-through;
            }
            .empty-products, .error-container {
                text-align: center;
                padding: 50px;
                grid-column: 1/-1;
            }
            @media (max-width: 768px) {
                .product-list {
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    gap: 15px;
                }
                .products-section {
                    padding: 20px;
                }
                .main-title {
                    font-size: 28px;
                }
                .product-name {
                    font-size: 12px;
                    height: auto;
                }
                .sale-price {
                    font-size: 14px;
                }
                .category-btn {
                    padding: 8px 20px;
                    font-size: 13px;
                }
                .category-list {
                    gap: 8px;
                }
                  .products {
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 20px;
                }
                .two-col {
                    grid-template-columns: 1fr;
                    gap: 30px;
                }
                .two-col-title {
                    font-size: 28px;
                    text-align: center;
                }
                .two-col-text {
                    font-size: 14px;
                    text-align: center;
                }
                .two-col .btn {
                    display: block;
                    text-align: center;
                    width: fit-content;
                    margin: 0 auto;
                }
            }
            @media (max-width: 480px) {
                .category-btn {
                    padding: 6px 14px;
                    font-size: 12px;
                }
                    .products {
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                .product-title {
                    font-size: 11px;
                }
                .product-price {
                    font-size: 12px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function renderShopPage() {
        const pageDataDiv = document.querySelector('.page-data');
        if (!pageDataDiv) return;
        
        const shopHtml = `
            <section class="page-title">
                <div style="max-width: 1280px; margin: 0 auto; padding: 0 20px; text-align: center;">
                    <h1 class="main-title center">محصولات</h1>
                </div>
            </section>

            <section class="products-section">
                <div class="container" style="max-width: 1280px; margin: 0 auto; padding: 0 20px;">
                    <div class="product-list"></div>
                </div>
            </section>
        `;
        
        pageDataDiv.innerHTML = shopHtml;
        
        createCategorySection();
        createFilterSection();
        setupInfiniteScroll();
    }

    // ===== مقداردهی اولیه =====
    async function init() {
        addStyles();
        loadFooter();
        renderShopPage();
        await loadProducts(false);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();