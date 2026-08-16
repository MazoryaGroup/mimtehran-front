// ===== shop-merged.js =====
(function() {
    'use strict';

    const API_BASE_URL = 'https://api.mimtehran.ir/api';
    let currentPage = 1;
    let totalPages = 1;
    let isLoading = false;
    let currentCategory = '';
    let currentSort = 'newest';

    // ===== لود محصولات از API /drops =====
    async function loadProducts(append = false) {
        if (isLoading) return;
        isLoading = true;
        
        showLoading(append);
        
        try {
            // ✅ استفاده از API /drops
            let url = `${API_BASE_URL}/drops?page=${currentPage}`;
            
            if (currentSort === 'price_asc') {
                url += `&sort=price&order=asc`;
            } else if (currentSort === 'price_desc') {
                url += `&sort=price&order=desc`;
            } else if (currentSort === 'newest') {
                url += `&sort=created_at&order=desc`;
            }
            
            if (currentCategory) {
                url += `&category=${encodeURIComponent(currentCategory)}`;
            }
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'خطا در دریافت محصولات');
            }
            
            // پردازش دیتا
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
        if (!productList) return;
        
        if (!append) {
            productList.innerHTML = `
                <div class="loading-container" style="grid-column: 1/-1; text-align: center; padding: 50px;">
                    <div class="loading-spinner"></div>
                    <p style="margin-top: 20px;">در حال بارگذاری محصولات...</p>
                </div>
            `;
        } else if (append) {
            const oldLoading = document.querySelector('.loading-more');
            if (oldLoading) oldLoading.remove();
            
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'loading-more';
            loadingDiv.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div class="loading-spinner-small"></div>
                    <p>در حال بارگذاری بیشتر...</p>
                </div>
            `;
            productList.appendChild(loadingDiv);
        }
    }

    function showError(message, append) {
        const productList = document.querySelector('.product-list');
        if (!productList) return;
        
        if (!append) {
            productList.innerHTML = `
                <div class="error-container" style="grid-column: 1/-1; text-align: center; padding: 50px;">
                    <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                    <h3 style="color: #c62828;">خطا در بارگذاری</h3>
                    <p style="margin: 20px 0;">${message}</p>
                    <button onclick="location.reload()" style="padding: 10px 25px; background: #8B5E3C; color: white; border: none; border-radius: 5px; cursor: pointer;">تلاش مجدد</button>
                </div>
            `;
        } else {
            const loadingDiv = document.querySelector('.loading-more');
            if (loadingDiv) loadingDiv.remove();
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-more';
            errorDiv.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #c62828;">
                    <p>❌ ${message}</p>
                    <button onclick="loadProducts(true)" style="margin-top: 10px; padding: 5px 15px; background: #8B5E3C; color: white; border: none; border-radius: 5px; cursor: pointer;">تلاش مجدد</button>
                </div>
            `;
            productList.appendChild(errorDiv);
            
            setTimeout(() => {
                errorDiv.remove();
            }, 3000);
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
        
        const errorMore = document.querySelector('.error-more');
        if (errorMore) errorMore.remove();
        
        if (!products || products.length === 0) {
            if (!append) {
                productList.innerHTML = `
                    <div class="empty-products" style="grid-column: 1/-1; text-align: center; padding: 50px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">🛍️</div>
                        <h3>محصولی یافت نشد</h3>
                        <p>لطفاً فیلترهای دیگری را امتحان کنید.</p>
                    </div>
                `;
            }
            return;
        }
        
        const fragment = document.createDocumentFragment();
        const tempDiv = document.createElement('div');
        
        products.forEach(product => {
            const productHtml = createProductCard(product);
            tempDiv.innerHTML = productHtml;
            fragment.appendChild(tempDiv.firstElementChild);
        });
        
        productList.appendChild(fragment);
        
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
        const productIdname = escapeHtml(product.idname);
        
        let badgeHtml = '';
        if (hasSpecialSale) {
            badgeHtml += '<span class="special-badge special-sale">🔥 حراج ویژه</span>';
        } else if (hasDiscount) {
            badgeHtml += `<span class="special-badge discount-badge">${discountPercent}% تخفیف</span>`;
        }
        
        return `
            <div class="product-item" data-product-id="${productId}">
                ${badgeHtml ? `<div class="product-badges">${badgeHtml}</div>` : ''}
                <a href="details-product.html?id=${productId}" class="product-link">
                    <div class="product-img">
                        <img alt="${productName}" loading="lazy" src="${image}" class="product-image" onerror="this.src='https://placehold.co/400x400?text=Product'" />
                    </div>
                    <div class="product-data">
                        <h6 class="product-name">${productName} - ${productIdname}</h6>
                        <div class="product-price">
                            ${hasDiscount ? `
                                <div class="sale-price">${discountPrice} تومان</div>
                                <div class="compare-price">${price} تومان</div>
                            ` : `
                                <div class="sale-price">${price} تومان</div>
                            `}
                        </div>
                        ${product.sold_count ? `
                            <div class="product-sold">
                                <span class="sold-count">${product.sold_count} فروش</span>
                            </div>
                        ` : ''}
                    </div>
                </a>
                
            </div>
        `;
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
        
        const categoryFilters = document.querySelectorAll('.category-filter');
        categoryFilters.forEach(filter => {
            const newFilter = filter.cloneNode(true);
            filter.parentNode.replaceChild(newFilter, filter);
            newFilter.addEventListener('click', (e) => {
                currentCategory = e.target.dataset.category || '';
                currentPage = 1;
                loadProducts(false);
                
                categoryFilters.forEach(f => f.classList.remove('active'));
                newFilter.classList.add('active');
            });
        });
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
        
        container.insertAdjacentHTML('afterbegin', filterHtml);
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
                headers: { 'Authorization': `Bearer ${token}` }
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