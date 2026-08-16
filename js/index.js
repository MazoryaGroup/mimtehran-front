// ===== index-merged.js =====
(function() {
    'use strict';

    const API_BASE_URL = 'https://api.mimtehran.ir/api';

    // ============================
    // ===== بخش صفحه اصلی (index) =====
    // ============================

    function addIndexStyles() {
        if (document.getElementById('index-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'index-styles';
        style.textContent = `
            .main {
                max-width: 1400px;
                margin: 0 auto;
                overflow-x: hidden;
            }
            .hero {
                position: relative;
                height: 85vh;
                min-height: 550px;
                
                background-size: cover;
                background-position: center;
                display: flex;
                align-items: center;
                
            }
            .hero::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.3);
                border-radius: 0 0 40px 40px;
            }
            .hero-content {
                position: relative;
                z-index: 1;
                max-width: 600px;
            }
            .hero-sub {
                font-size: 14px;
                letter-spacing: 3px;
                color: #fff;
                margin-bottom: 16px;
                text-transform: uppercase;
            }
            .hero-title {
                font-size: 52px;
                font-weight: 300;
                line-height: 1.2;
                margin-bottom: 20px;
                color: #fff;
            }
            .hero-title strong {
                font-weight: 600;
                color: #573c27;
            }
            .hero-desc {
                font-size: 16px;
                color: rgba(255,255,255,0.9);
                line-height: 1.6;
                margin-bottom: 32px;
            }
            .btn {
                display: inline-block;
                padding: 14px 32px;
                background: #573c27;
                color: white;
                text-decoration: none;
                border-radius: 40px;
                font-weight: 500;
                transition: all 0.3s;
                border: none;
                cursor: pointer;
            }
            .btn:hover {
                background: #6d4c2f;
                transform: translateY(-2px);
            }
            .section {
                padding: 60px 32px;
            }
            .section-title {
                text-align: center;
                font-size: 32px;
                font-weight: 300;
                margin-bottom: 50px;
            }
            .section-title span {
                font-weight: 600;
                color: #8B5E3C;
            }
            .products {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 32px;
                max-width: 1400px;
                margin: 0 auto;
            }
            .product {
                background: white;
                border-radius: 20px;
                overflow: hidden;
                text-decoration: none;
                transition: transform 0.3s, box-shadow 0.3s;
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            .product:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .product-img {
                width: 100%;
                aspect-ratio: 3/4;
                object-fit: cover;
                transition: transform 0.5s;
            }
            .product:hover .product-img {
                transform: scale(1.05);
            }
            .product-title {
                padding: 16px 16px 8px;
                font-weight: 500;
                color: #333;
                font-size: 14px;
            }
            .product-price {
                padding: 0 16px 20px;
                color: #8B5E3C;
                font-weight: bold;
                font-size: 15px;
            }
            .sale-price {
                color: #8B5E3C;
                font-weight: bold;
            }
            .compare-price {
                font-size: 13px;
                color: #999;
                text-decoration: line-through;
                margin-right: 8px;
                font-weight: normal;
                display: inline-block;
            }
            .two-col {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 60px;
                align-items: center;
                max-width: 1280px;
                margin: 0 auto;
            }
            .two-col-img {
                width: 100%;
                border-radius: 24px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            .two-col-title {
                font-size: 36px;
                font-weight: 300;
                margin-bottom: 24px;
            }
            .two-col-text {
                color: #666;
                line-height: 1.8;
                margin-bottom: 32px;
            }
            .instagram {
                text-align: center;
                padding: 80px 32px;
                background: linear-gradient(135deg, #f9f5f0 0%, #f0e8df 100%);
            }
            .instagram-title {
                font-size: 28px;
                font-weight: 600;
                color: #8B5E3C;
                margin-bottom: 16px;
            }
            .instagram-link {
                color: #333;
                text-decoration: none;
                font-size: 16px;
                border-bottom: 2px solid #8B5E3C;
                padding-bottom: 4px;
                transition: color 0.3s;
            }
            .instagram-link:hover {
                color: #8B5E3C;
            }
            
            /* ===== ریسپانسیو کامل برای موبایل ===== */
            @media (max-width: 992px) {
                .hero-title {
                    font-size: 42px;
                }
                .two-col-title {
                    font-size: 32px;
                }
                .section {
                    padding: 50px 25px;
                }
            }
            
            @media (max-width: 768px) {
                .hero {
                    height: 70vh;
                    min-height: 500px;
                    padding: 0 20px;
                    margin-bottom: 40px;
                }
                .hero-title {
                    font-size: 32px;
                }
                .hero-sub {
                    font-size: 12px;
                }
                .hero-desc {
                    font-size: 14px;
                }
                .hero-desc br {
                    display: none;
                }
                .btn {
                    padding: 12px 28px;
                    font-size: 14px;
                }
                .section {
                    padding: 40px 20px;
                }
                .section-title {
                    font-size: 28px;
                    margin-bottom: 35px;
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
                .instagram {
                    padding: 60px 20px;
                }
                .instagram-title {
                    font-size: 24px;
                }
                .instagram-link {
                    font-size: 14px;
                }
            }
            
            @media (max-width: 576px) {
                .hero {
                    height: 60vh;
                    min-height: 450px;
                }
                .hero-title {
                    font-size: 26px;
                }
                .hero-desc {
                    font-size: 13px;
                }
                .products {
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    gap: 15px;
                }
                .product-title {
                    font-size: 12px;
                    padding: 12px 12px 5px;
                }
                .product-price {
                    font-size: 13px;
                    padding: 0 12px 15px;
                }
                .section-title {
                    font-size: 24px;
                }
                .two-col-title {
                    font-size: 24px;
                }
                .btn {
                    padding: 10px 24px;
                    font-size: 13px;
                }
            }
            
            @media (max-width: 480px) {
                .hero {
                    padding: 0 15px;
                }
                .hero-title {
                    font-size: 22px;
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

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // تابع نمایش محصولات ویژه (فقط محصولات با تخفیف ویژه)
    function updateSpecialProductsDisplay(products) {
        const specialContainer = document.querySelector('#special-products');
        if (!specialContainer) return;
        
        // فیلتر محصولاتی که تخفیف ویژه دارند
        const specialProducts = products.filter(product => 
            product.is_special_sale_active === true
        );
        
        // فقط 4 محصول اول از محصولات ویژه
        const productsToShow = specialProducts.slice(-4);
        
        if (productsToShow.length > 0) {
            let html = '';
            productsToShow.forEach(product => {
                const price = parseFloat(product.price || 0).toLocaleString('fa-IR');
                const discountPrice = product.discount_price ? parseFloat(product.discount_price).toLocaleString('fa-IR') : null;
                const hasDiscount = true; // اینجا حتماً تخفیف داره چون فیلتر شده
                const image = product.main_image || 'https://placehold.co/600x800?text=Product';
                
                html += `
                    <a href="details-product.html?id=${product.id}" class="product">
                        <img src="${image}" alt="${escapeHtml(product.name)}" class="product-img" onerror="this.src='https://placehold.co/600x800?text=+'">
                        <div class="product-title">${escapeHtml(product.name)}</div>
                        <div class="product-price">
                            <div class="sale-price">${discountPrice || price} تومان</div>
                            ${discountPrice ? `<div class="compare-price">${price} تومان</div>` : ''}
                        </div>
                    </a>
                `;
            });
            specialContainer.innerHTML = html;
        } else {
            // اگر محصول ویژه وجود نداشت، پیام نمایش بده
            specialContainer.innerHTML = '<div style="text-align:center; grid-column:1/-1; padding:40px;">هیچ محصول ویژه‌ای یافت نشد</div>';
        }
    }

    // تابع نمایش جدیدترین محصولات (آخرین ۴ محصول)
    function updateLatestProductsDisplay(products) {
        const latestContainer = document.querySelector('#latest-products');
        if (!latestContainer) return;
        
        // مرتب‌سازی بر اساس id (یا created_at) نزولی و گرفتن ۴ تای آخر
        const sortedProducts = [...products].sort((a, b) => (b.id || 0) - (a.id || 0));
        const latestProducts = sortedProducts.slice(0, 4);
        
        if (latestProducts.length > 0) {
            let html = '';
            latestProducts.forEach(product => {
                const price = parseFloat(product.price || 0).toLocaleString('fa-IR');
                const discountPrice = product.discount_price ? parseFloat(product.discount_price).toLocaleString('fa-IR') : null;
                const hasDiscount = product.is_special_sale_active === true && discountPrice;
                const image = product.main_image || 'https://placehold.co/600x800?text=Product';
                
                html += `
                    <a href="details-product.html?id=${product.id}" class="product">
                        <img src="${image}" alt="${escapeHtml(product.name)}" class="product-img" onerror="this.src='https://placehold.co/600x800?text=+'">
                        <div class="product-title">${escapeHtml(product.name)}</div>
                        <div class="product-price">
                            ${hasDiscount ? `
                                <div class="sale-price">${discountPrice} تومان</div>
                                <div class="compare-price">${price} تومان</div>
                            ` : `
                                <div class="sale-price">${price} تومان</div>
                            `}
                        </div>
                    </a>
                `;
            });
            latestContainer.innerHTML = html;
        } else {
            latestContainer.innerHTML = '<div style="text-align:center; grid-column:1/-1; padding:40px;">محصولی یافت نشد</div>';
        }
    }
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products?per_page=50`, {
            headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
            const result = await response.json();
            
            // ✅ اصلاح: بررسی ساختارهای مختلف دیتا
            let products = [];
            
            if (result.data && Array.isArray(result.data.data)) {
                products = result.data.data;
            } else if (result.data && Array.isArray(result.data)) {
                products = result.data;
            } else if (Array.isArray(result.data)) {
                products = result.data;
            } else if (Array.isArray(result.products)) {
                products = result.products;
            } else if (Array.isArray(result)) {
                products = result;
            } else {
                products = [];
            }
            
            console.log('Products loaded:', products.length); // برای دیباگ
            
            // ✅ فقط اگر products آرایه بود و خالی نبود، توابع رو صدا بزن
            if (Array.isArray(products) && products.length > 0) {
                updateSpecialProductsDisplay(products);
                updateLatestProductsDisplay(products);
            } else {
                console.warn('No products found or products is not an array');
                // نمایش پیام خالی بودن
                const specialContainer = document.querySelector('#special-products');
                const latestContainer = document.querySelector('#latest-products');
                if (specialContainer) specialContainer.innerHTML = '<div style="text-align:center; grid-column:1/-1; padding:40px;">هیچ محصول ویژه‌ای یافت نشد</div>';
                if (latestContainer) latestContainer.innerHTML = '<div style="text-align:center; grid-column:1/-1; padding:40px;">محصولی یافت نشد</div>';
            }
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

    function renderIndexPage() {
        const mainContainer = document.querySelector('.main');
        if (mainContainer) return;
        
        const indexHtml = `
            <div class="main">
                <section class="hero">
                    <div class="hero-content">
                        <div class="hero-sub"> تجسم لطافت و ظرافت</div>
                        <h1 class="hero-title">زیبایی را با<br><strong>جزئیات لوکس</strong> تجربه کنید</h1>
                        <p class="hero-desc">طراحی مینیمال، کیفیت بی‌نظیر. گلچینی از نفیس‌ترین شال‌ها، پاپوش‌ها و بدلیجات <br>خاص برای کسانی که به ماندگاری استایل خود اهمیت می‌دهند.</p>
                        <a href="shop.html" class="btn">مشاهده محصولات</a>
                    </div>
                </section>
                
                <div class="section">
                    <h2 class="section-title">محصولات <span>ویژه</span></h2>
                    <div id="special-products" class="products"></div>
                </div>
                
                <div class="section">
                    <div class="two-col">
                        <div>
                            <img src="asset/imag/2.jpg" alt="شال حریر" class="two-col-img" onerror="this.src='https://placehold.co/800x1000?text=+'">
                        </div>
                        <div>
                            <h2 class="two-col-title">حریر درجه یک<br>با طرح‌های خاص</h2>
                            <p class="two-col-text">شال‌های حریر ما با بهترین نخ‌ها بافته شده‌اند. لطافت و سبکی بی‌نظیر، مناسب فصول گرم سال. هر شال با دقت و ظرافت خاصی طراحی شده تا زیبایی خاصی به استایل شما ببخشد.</p>
                            <a href="shop.html" class="btn">بیشتر بدانید</a>
                        </div>
                    </div>
                </div>
                
                <div class="section" style="background: #fafafa; margin: 0; padding: 100px 32px; border-radius: 0;">
                    <div class="section-title" style="margin-bottom: 60px;">
                        <h2 class="section-title">جدیدترین <span>مدل‌ها</span></h2>
                    </div>
                    <div id="latest-products" class="products" style="max-width: 1400px; margin: 0 auto;"></div>
                </div>
                
                <div class="instagram">
                    <div class="instagram-title">MIM_TEHRAN@</div>
                    <a href="#" class="instagram-link">دنبال کنید در اینستاگراممم →</a>
                </div>
            </div>
        `;
        
        const existingMain = document.querySelector('.main');
        if (existingMain) {
            existingMain.outerHTML = indexHtml;
        } else {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = indexHtml;
            const header = document.getElementById('header');
            const footer = document.getElementById('footer');
            
            if (header && header.nextSibling) {
                header.parentNode.insertBefore(wrapper.firstElementChild, header.nextSibling);
            } else if (header) {
                header.parentNode.appendChild(wrapper.firstElementChild);
            } else {
                document.body.appendChild(wrapper.firstElementChild);
            }
        }
    }

    async function initIndexPage() {
        renderIndexPage();
        await loadProducts();
    }

    // ============================
    // ===== مقداردهی اولیه =====
    // ============================

    async function init() {
        addIndexStyles();
        await initIndexPage();
        
        // به روز رسانی سبد خرید از هدر (اگر تابع وجود داشته باشد)
        if (window.updateHeaderCartCount) {
            await window.updateHeaderCartCount();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();