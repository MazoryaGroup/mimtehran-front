// ===== details-product-merged.js =====
(function() {
    'use strict';

    const API_BASE_URL = 'https://api.mimtehran.ir/api';
    const PRODUCT_ID = new URLSearchParams(window.location.search).get('id') || 4;
    
    let selectedColorInfo = null;

    // ===== لود دیتا از API =====
    async function loadProductData() {
        try {
            showLoading();

            const response = await fetch(`${API_BASE_URL}/details-product?id=${PRODUCT_ID}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            console.log('API Response:', result);

            if (!response.ok) {
                throw new Error(result.message || 'خطا در دریافت اطلاعات');
            }

            const product = result.data || result;

            if (!product || !product.id) {
                throw new Error('محصول یافت نشد');
            }

            renderProductDetails(product);
            renderSuggestedProducts(product.suggested_products || []);
            renderFeatures(product.features || []);

        } catch (error) {
            console.error('Error:', error);
            showError(error.message);
        }
    }

    function showLoading() {
        const pageData = document.querySelector('.page-data');
        if (pageData) {
            pageData.innerHTML = `
                <div class="container">
                    <div style="text-align: center; padding: 100px 20px;">
                        <div class="loading-spinner"></div>
                        <p style="margin-top: 20px; color: #666;">در حال بارگذاری محصول...</p>
                    </div>
                </div>
            `;
        }
    }

    function showError(message) {
        const pageData = document.querySelector('.page-data');
        if (pageData) {
            pageData.innerHTML = `
                <div class="container">
                    <div style="text-align: center; padding: 100px 20px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                        <h3 style="color: #c62828; margin-bottom: 10px;">خطا در بارگذاری</h3>
                        <p style="color: #666; margin-bottom: 20px;">${message}</p>
                        <button onclick="location.reload()" style="padding: 10px 25px; background: #8B5E3C; color: white; border: none; border-radius: 5px; cursor: pointer;">تلاش مجدد</button>
                    </div>
                </div>
            `;
        }
    }

    // ===== تابع کمکی برای زمانی که color_code وجود ندارد =====
    function getColorCodeFromName(colorName) {
        const colorMap = {
            'قرمز': '#e53935',
            'مشکی': '#212121',
            'سفید': '#ffffff',
            'آبی': '#032bff',
            'سبز': '#43a047',
            'زرد': '#fdd835',
            'نارنجی': '#fb8c00',
            'بنفش': '#8e24aa',
            'صورتی': '#ec407a',
            'قهوه‌ای': '#8B5E3C',
            'خاکستری': '#9e9e9e',
            'طلایی': '#ffb300',
            'نقره‌ای': '#bdbdbd',
            'کرم': '#f5e6d3',
            'آبی نفتی': '#1a237e',
            'سبز زیتونی': '#558b2f',
            'زرشکی': '#c62828',
            'فیروزه‌ای': '#00acc1',
            'نخودی': '#f7e6c4',
            'بادمجانی': '#4a148c',
            'خردلی': '#f9a825'
        };
        
        return colorMap[colorName] || '#8B5E3C';
    }

    // ===== تابع رندر دایره‌های رنگی =====
    function renderColorCircles(colors, selectedColorId, onSelect) {
        const container = document.getElementById('color-circles-list');
        if (!container) return;
        
        if (!colors || colors.length === 0) {
            container.innerHTML = '<div style="color:#999;">رنگی برای این محصول ثبت نشده است</div>';
            return;
        }
        
        let html = '';
        colors.forEach(color => {
            const colorId = color.color_id || color.id;
            const colorName = color.color_name || color.name || 'نامشخص';
            const stock = color.remaining_stock || color.inventory || 0;
            // اولویت با color_code از API، در غیر این صورت از تابع کمکی استفاده کن
            const colorCode = color.color_code || getColorCodeFromName(colorName);
            const isSelected = selectedColorId == colorId;
            const isDisabled = stock === 0;
            
            // برای رنگ سفید، حاشیه مشخص باشه
            const borderStyle = (colorName === 'سفید' || colorCode === '#ffffff') ? 'border: 1px solid #ddd;' : '';
            
            html += `
                <div class="color-circle-item" style="text-align: center;">
                    <div class="color-circle ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}" 
                         data-color-id="${colorId}"
                         data-color-name="${colorName}"
                         data-stock="${stock}"
                         style="background: ${colorCode}; ${borderStyle}">
                        ${stock > 0 ? `<div class="color-circle-stock">${stock} عدد</div>` : '<div class="color-circle-stock">ناموجود</div>'}
                    </div>
                    <div class="color-circle-name">${colorName}</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // افزودن رویداد کلیک به دایره‌ها
        document.querySelectorAll('.color-circle').forEach(circle => {
            if (circle.classList.contains('disabled')) return;
            
            circle.addEventListener('click', () => {
                const colorId = circle.dataset.colorId;
                const colorName = circle.dataset.colorName;
                const stock = parseInt(circle.dataset.stock);
                
                // حذف کلاس selected از همه
                document.querySelectorAll('.color-circle').forEach(c => c.classList.remove('selected'));
                circle.classList.add('selected');
                
                if (onSelect) {
                    onSelect(colorId, colorName, stock);
                }
            });
        });
    }

    // ===== تابع انتخاب رنگ =====
    function onColorSelect(colorId, colorName, stock) {
        selectedColorInfo = { colorId, colorName, stock };
        
        // به روز رسانی سلکت مخفی (برای ارسال به API)
        const hiddenSelect = document.getElementById('product-color-hidden');
        if (hiddenSelect) {
            hiddenSelect.value = colorId;
        }
        
        // به روز رسانی نمایش رنگ انتخاب شده
        const selectedInfoDiv = document.getElementById('selected-color-info');
        if (selectedInfoDiv) {
            selectedInfoDiv.style.display = 'flex';
            selectedInfoDiv.innerHTML = `
                <span>🎨 رنگ انتخاب شده: <span class="selected-color-name">${colorName}</span></span>
                <span class="selected-color-stock">📦 موجودی: ${stock} عدد</span>
            `;
        }
        
        // به روز رسانی ماکزیمم تعداد
        const quantityInput = document.getElementById('product-quantity');
        if (quantityInput) {
            quantityInput.max = stock;
            if (parseInt(quantityInput.value) > stock) {
                quantityInput.value = stock > 0 ? 1 : 0;
            }
        }
        
        // فعال/غیرفعال کردن دکمه افزودن به سبد خرید
        const addBtn = document.getElementById('add-to-cart-button');
        if (addBtn) {
            if (stock === 0) {
                addBtn.disabled = true;
                addBtn.textContent = 'ناموجود';
            } else {
                addBtn.disabled = false;
                addBtn.textContent = 'افزودن به سبد خرید';
            }
        }
    }

    // ===== اضافه کردن استایل دایره‌های رنگی =====
    function addColorCircleStyles() {
        if (document.getElementById('color-circle-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'color-circle-styles';
        style.textContent = `
            .color-circles-container {
                margin: 15px 0;
            }
            .color-circles-title {
                font-size: 14px;
                font-weight: 500;
                color: #666;
                margin-bottom: 12px;
                display: block;
            }
            .color-circles-list {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                align-items: center;
            }
            .color-circle-item {
                text-align: center;
            }
            .color-circle {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 2px solid #fff;
                box-shadow: 0 1px 3px rgba(0,0,0,0.15);
                position: relative;
            }
            .color-circle:hover {
                transform: scale(1.1);
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }
            .color-circle.selected {
                border: 2px solid #8B5E3C;
                box-shadow: 0 0 0 1px #fff, 0 0 0 2px #8B5E3C;
                transform: scale(1.05);
            }
            .color-circle.disabled {
                opacity: 0.4;
                cursor: not-allowed;
                filter: grayscale(0.3);
            }
            .color-circle.disabled:hover {
                transform: none;
            }
            .color-circle-stock {
                position: absolute;
                bottom: -18px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 9px;
                background: rgba(0,0,0,0.7);
                color: white;
                padding: 2px 5px;
                border-radius: 10px;
                white-space: nowrap;
                display: none;
                z-index: 10;
            }
            .color-circle:hover .color-circle-stock {
                display: block;
            }
            .color-circle-name {
                font-size: 10px;
                text-align: center;
                margin-top: 6px;
                color: #777;
            }
            .selected-color-info {
                margin-top: 15px;
                padding: 8px 12px;
                background: #fef5e8;
                border-radius: 10px;
                font-size: 13px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 8px;
            }
            .selected-color-name {
                color: #8B5E3C;
                font-weight: bold;
            }
            .selected-color-stock {
                color: #4caf50;
                font-size: 12px;
            }
            @media (max-width: 480px) {
                .color-circle {
                    width: 28px;
                    height: 28px;
                }
                .color-circle-name {
                    font-size: 9px;
                }
                .color-circles-list {
                    gap: 8px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function renderProductDetails(product) {
        const pageData = document.querySelector('.page-data');
        if (!pageData) return;

        const price = parseFloat(product.price || 0).toLocaleString('fa-IR');
        const discountPrice = product.discount_price ? parseFloat(product.discount_price).toLocaleString('fa-IR') : null;
        const hasDiscount = product.is_special_discount_active === true && discountPrice;
        const discountPercent = hasDiscount ? Math.round((1 - (product.discount_price / product.price)) * 100) : 0;

        const colors = product.colors || [];
        const images = product.images || [];
        const mainImage = product.main_image || (images.length > 0 ? images[0] : 'https://placehold.co/600x600?text=No+Image');
        const description = product.description || '';
        const productCode = product.idname || product.sku || product.id;
        const size = product.size || product.dimensions || '۱۸۰ × ۷۰ سانتی‌متر';

        const totalStock = colors.reduce((sum, color) => sum + (color.remaining_stock || 0), 0);

        const html = `
            <div class="container">
                <div class="product-wrap">
                    <div class="product-image-wrap">
                        <div class="main-image-container">
                            <img id="main-product-img" src="${mainImage}" loading="eager" alt="${product.name}" class="product-main-img" onerror="this.src='https://placehold.co/600x600?text=Product+Image'" />
                        </div>
                        ${images.length > 1 ? `
                            <div class="thumbnail-gallery">
                                ${images.map(img => `
                                    <img src="${img}" alt="تصویر محصول" class="thumbnail-img" onclick="window.changeMainImage && window.changeMainImage('${img}')" onerror="this.src='https://placehold.co/100x100?text=Image'" />
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="product-info">
                        <div>
                            ${hasDiscount ? `
                                <div class="special-discount-badge">
                                    <span class="badge-text">🔥 فروش ویژه</span>
                                    <span class="discount-percent">${discountPercent}% تخفیف</span>
                                </div>
                            ` : ''}
                            
                            <h2 class="product-main-name">${escapeHtml(product.name)}</h2>
                            <div class="product-code">کد محصول: ${escapeHtml(productCode)}</div>
                            
                            <div class="price-wrap">
                                ${hasDiscount ? `
                                    <div class="sale-price">${discountPrice} تومان</div>
                                    <div class="old-price">${price} تومان</div>
                                ` : `
                                    <div class="sale-price">${price} تومان</div>
                                `}
                            </div>
                            
                            <div class="product-description">
                                ${description}
                            </div>
                        </div>
                        
                        <div class="product-data-info">
                            <div class="product-info-list">
                                <div class="product-detail">
                                    <div class="info-title">ابعاد:</div>
                                    <div class="data-info">${escapeHtml(size)}</div>
                                </div>
                                <div class="product-detail">
                                    <div class="info-title">موجودی کل:</div>
                                    <div class="data-info ${totalStock === 0 ? 'out-of-stock' : ''}">
                                        ${totalStock === 0 ? 'ناموجود' : `${totalStock} عدد در انبار`}
                                    </div>
                                </div>
                            </div>
                            
                            <!-- رنگ‌ها به صورت دایره‌ای -->
                            <div class="color-circles-container">
                                <span class="color-circles-title">🎨 انتخاب رنگ:</span>
                                <div id="color-circles-list" class="color-circles-list"></div>
                                <input type="hidden" id="product-color-hidden" value="">
                                <div id="selected-color-info" class="selected-color-info" style="display: none;"></div>
                            </div>
                            
                            <div class="add-to-cart">
                                <div class="quantity-wrapper">
                                    <label>تعداد:</label>
                                    <input type="number" id="product-quantity" min="1" value="1" class="quantity-field" ${totalStock === 0 ? 'disabled' : ''} />
                                </div>
                                <button id="add-to-cart-button" class="cart-btn" ${totalStock === 0 ? 'disabled' : ''}>
                                    ${totalStock === 0 ? 'ناموجود' : 'افزودن به سبد خرید'}
                                </button>
                            </div>
                            
                            <div id="stock-error" style="display: none; margin-top: 10px; color: #c62828; font-size: 13px;"></div>
                            <div id="cart-error" style="display: none; margin-top: 10px; color: #c62828; font-size: 13px;"></div>
                        </div>
                        
                        <a href="contact-us.html" class="contact-btn">
                            <span>📞</span>
                            <div class="btn-text">برای اطلاعات بیشتر تماس بگیرید</div>
                        </a>
                    </div>
                </div>
            </div>
        `;

        pageData.innerHTML = html;

        addStyles();
        addColorCircleStyles();
        
        // رندر دایره‌های رنگی
        if (colors.length > 0) {
            const firstColor = colors[0];
            const defaultColorId = firstColor.color_id || firstColor.id;
            const defaultColorName = firstColor.color_name || firstColor.name;
            const defaultStock = firstColor.remaining_stock || firstColor.inventory || 0;
            
            renderColorCircles(colors, defaultColorId, onColorSelect);
            
            const hiddenSelect = document.getElementById('product-color-hidden');
            if (hiddenSelect) hiddenSelect.value = defaultColorId;
            
            const selectedInfoDiv = document.getElementById('selected-color-info');
            if (selectedInfoDiv) {
                selectedInfoDiv.style.display = 'flex';
                selectedInfoDiv.innerHTML = `
                    <span>🎨 رنگ انتخاب شده: <span class="selected-color-name">${defaultColorName}</span></span>
                    <span class="selected-color-stock">📦 موجودی: ${defaultStock} عدد</span>
                `;
            }
            
            const quantityInput = document.getElementById('product-quantity');
            if (quantityInput) {
                quantityInput.max = defaultStock;
            }
            
            selectedColorInfo = { colorId: defaultColorId, colorName: defaultColorName, stock: defaultStock };
            
            const addBtn = document.getElementById('add-to-cart-button');
            if (addBtn && defaultStock === 0) {
                addBtn.disabled = true;
                addBtn.textContent = 'ناموجود';
            }
        }
        
        setupProductEvents(product);
    }

    function renderSuggestedProducts(products) {
        const productList = document.querySelector('.productss .product-list');
        if (!productList) return;

        if (!products || products.length === 0) {
            const section = document.querySelector('.productss');
            if (section) section.style.display = 'none';
            return;
        }

        productList.innerHTML = products.map(product => {
            const price = parseFloat(product.price || 0).toLocaleString('fa-IR');
            const image = product.main_image || 'https://placehold.co/600x600?text=Product';
            const productId = product.id;

            return `
                <div class="product-item">
                    <a href="details-product.html?id=${productId}" class="product-link">
                        <div class="product-img">
                            <img alt="${escapeHtml(product.name)}" loading="lazy" src="${image}" class="product-image" onerror="this.src='https://placehold.co/400x400?text=Product'">
                        </div>
                        <div class="product-data">
                            <h6 class="product-name">${escapeHtml(product.name)}</h6>
                            <div class="product-price">
                                <div>${price} تومان</div>
                            </div>
                        </div>
                    </a>
                </div>
            `;
        }).join('');
    }

    function renderFeatures(features) {
        const featuresGrid = document.querySelector('.product-features .features-grid');
        if (!featuresGrid) return;

        if (!features || features.length === 0) {
            featuresGrid.innerHTML = `
                <div class="feature-card">
                    <div class="feature-icon">🧣</div>
                    <p>پارچه لطیف و ضد حساسیت</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">💨</div>
                    <p>قابل شستشو با دست</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🎨</div>
                    <p>رنگ‌بندی متنوع</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">✨</div>
                    <p>مناسب چهار فصل</p>
                </div>
            `;
            return;
        }

        featuresGrid.innerHTML = features.map(feature => `
            <div class="feature-card">
                <div class="feature-icon">${feature.icon || '✓'}</div>
                <p>${escapeHtml(feature.name)}</p>
            </div>
        `).join('');
    }

    function changeMainImage(imgSrc) {
        const mainImg = document.getElementById('main-product-img');
        if (mainImg) {
            mainImg.src = imgSrc;
        }

        document.querySelectorAll('.thumbnail-img').forEach(thumb => {
            thumb.classList.remove('active');
            if (thumb.src === imgSrc) {
                thumb.classList.add('active');
            }
        });
    }

    function setupProductEvents(product) {
        const addBtn = document.getElementById('add-to-cart-button');
        const quantityInput = document.getElementById('product-quantity');
        const stockError = document.getElementById('stock-error');
        const cartError = document.getElementById('cart-error');

        if (!addBtn) return;

        function getSelectedColorId() {
            const hiddenInput = document.getElementById('product-color-hidden');
            return hiddenInput ? hiddenInput.value : null;
        }

        function getSelectedColorName() {
            return selectedColorInfo ? selectedColorInfo.colorName : null;
        }

        function getMaxStock() {
            return selectedColorInfo ? selectedColorInfo.stock : 0;
        }

        if (quantityInput) {
            quantityInput.addEventListener('change', function () {
                let val = parseInt(this.value);
                const maxStock = getMaxStock();

                if (isNaN(val) || val < 1) this.value = 1;
                if (maxStock > 0 && val > maxStock) {
                    this.value = maxStock;
                    if (stockError) {
                        stockError.textContent = `تنها ${maxStock} عدد در انبار موجود است.`;
                        stockError.style.display = 'block';
                        setTimeout(() => {
                            if (stockError) stockError.style.display = 'none';
                        }, 3000);
                    }
                }
            });
        }

        addBtn.addEventListener('click', async function (e) {
            e.preventDefault();

            let quantity = parseInt(quantityInput?.value || 1);
            const colorId = getSelectedColorId();
            const colorName = getSelectedColorName();
            const maxStock = getMaxStock();

            if (!colorId) {
                if (cartError) {
                    cartError.textContent = 'لطفاً ابتدا رنگ مورد نظر را انتخاب کنید';
                    cartError.style.display = 'block';
                    setTimeout(() => {
                        if (cartError) cartError.style.display = 'none';
                    }, 3000);
                }
                return;
            }

            if (quantity > maxStock && maxStock > 0) {
                if (stockError) {
                    stockError.textContent = `تنها ${maxStock} عدد در انبار موجود است.`;
                    stockError.style.display = 'block';
                    setTimeout(() => {
                        if (stockError) stockError.style.display = 'none';
                    }, 3000);
                }
                return;
            }

            const token = localStorage.getItem('auth_token');
            if (!token) {
                if (confirm('برای افزودن به سبد خرید باید وارد شوید. آیا به صفحه ورود بروید؟')) {
                    window.location.href = 'log-in.html';
                }
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/cart/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        product_id: product.id,
                        quantity: quantity,
                        color: colorName,
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'خطا در افزودن به سبد خرید');
                }

                showCartMessage(`✅ ${product.name} - ${colorName} به سبد خرید اضافه شد!`);

                if (window.updateHeaderCartCount) {
                    await window.updateHeaderCartCount();
                }

            } catch (err) {
                if (cartError) {
                    cartError.textContent = err.message;
                    cartError.style.display = 'block';
                    setTimeout(() => {
                        if (cartError) cartError.style.display = 'none';
                    }, 3000);
                }
            }
        });
    }

    function showCartMessage(message) {
        let messageDiv = document.getElementById('cart-message');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'cart-message';
            messageDiv.className = 'cart-message';
            document.body.appendChild(messageDiv);
        }

        messageDiv.textContent = message;
        messageDiv.style.display = 'block';

        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 2000);
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
        if (document.getElementById('product-details-styles')) return;

        const style = document.createElement('style');
        style.id = 'product-details-styles';
        style.textContent = `
            .container {
                max-width: 1280px;
                margin: 0 auto;
                padding: 40px 20px;
            }
            .product-wrap {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 60px;
                margin-bottom: 60px;
            }
            
            .main-image-container {
                width: 100%;
                aspect-ratio: 1;
                overflow: hidden;
                border-radius: 20px;
                background: #f5f5f5;
            }
            .product-main-img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .thumbnail-gallery {
                display: flex;
                gap: 10px;
                margin-top: 15px;
                flex-wrap: wrap;
            }
            .thumbnail-img {
                width: 70px;
                height: 70px;
                object-fit: cover;
                border-radius: 8px;
                cursor: pointer;
                border: 2px solid transparent;
                transition: all 0.2s ease;
            }
            .thumbnail-img:hover, .thumbnail-img.active {
                border-color: #8B5E3C;
            }
            .special-discount-badge {
                display: inline-flex;
                gap: 10px;
                background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                padding: 5px 15px;
                border-radius: 20px;
                margin-bottom: 15px;
            }
            .badge-text {
                color: white;
                font-weight: bold;
                font-size: 14px;
            }
            .discount-percent {
                background: white;
                color: #ee5a24;
                padding: 2px 8px;
                border-radius: 15px;
                font-size: 12px;
                font-weight: bold;
            }
            .product-main-name {
                font-size: 28px;
                font-weight: 600;
                margin-bottom: 10px;
                color: #333;
            }
            .product-code {
                font-size: 12px;
                color: #999;
                margin-bottom: 15px;
            }
            .price-wrap {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
            .sale-price {
                font-size: 28px;
                font-weight: bold;
                color: #8B5E3C;
            }
            .old-price {
                font-size: 18px;
                color: #999;
                text-decoration: line-through;
            }
            .product-description {
                color: #666;
                line-height: 1.8;
                margin-bottom: 30px;
            }
            .product-data-info {
                background: #f9f9f9;
                padding: 20px;
                border-radius: 16px;
                margin: 20px 0;
            }
            .product-info-list {
                margin-bottom: 20px;
            }
            .product-detail {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #eee;
            }
            .info-title {
                font-weight: 500;
                color: #666;
            }
            .data-info {
                color: #333;
            }
            .out-of-stock {
                color: #c62828;
                font-weight: bold;
            }
            .add-to-cart {
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
                align-items: center;
                margin-top: 20px;
            }
            .quantity-wrapper {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .quantity-wrapper label {
                font-size: 14px;
                color: #666;
            }
            .quantity-field {
                width: 80px;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 48px;
                text-align: center;
                font-size: 16px;
            }
            .cart-btn {
                padding: 12px 20px;
                background: #8B5E3C;
                color: white;
                border: none;
                border-radius: 40px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: background 0.2s;
                flex: 1;
            }
            .cart-btn:hover {
                background: #6d4c2f;
            }
            .cart-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            .contact-btn {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                margin-top: 20px;
                color: #8B5E3C;
                text-decoration: none;
                font-size: 14px;
            }
            .productss {
                margin-top: 60px;
                padding-top: 40px;
                border-top: 1px solid #eee;
            }
            .section-title {
                text-align: center;
                font-size: 28px;
                font-weight: 300;
                margin-bottom: 40px;
            }
            .section-title span {
                font-weight: 600;
                color: #8B5E3C;
            }
            
            .product-item {
                background: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                transition: transform 0.3s;
            }
            .product-item:hover {
                transform: translateY(-5px);
            }
            .product-link {
                text-decoration: none;
            }
           
            .product-data {
                padding: 15px;
            }
            .product-name {
                font-size: 14px;
                color: #333;
                margin-bottom: 8px;
            }
            .product-price {
                font-size: 16px;
                font-weight: bold;
                color: #8B5E3C;
            }
            .product-features {
                margin-top: 60px;
                padding-top: 40px;
                border-top: 1px solid #eee;
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
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @media (max-width: 768px) {
                .product-wrap {
                    grid-template-columns: 1fr;
                    gap: 30px;
                }
                .product-main-name {
                    font-size: 24px;
                }
                .sale-price {
                    font-size: 24px;
                }
                .container {
                    padding: 20px;
                }
                .product-list {
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    gap: 15px;
                }
                    .cart-btn {
                padding: 15px 1px;
                background: #8B5E3C;
                color: white;
                border: none;
                border-radius: 40px;
                font-size: 12px;
                font-weight: bold;
                cursor: pointer;
                transition: background 0.2s;
                flex: 1;
            }
            }
        `;
        document.head.appendChild(style);
    }

    function renderPageContent() {
        const pageDataDiv = document.querySelector('.page-data');
        if (!pageDataDiv) return;

        const html = `
            <div class="container">
                <div class="product-wrap">
                    <div class="product-image-wrap">
                        <div class="main-image-container">
                            <div class="loading-spinner"></div>
                        </div>
                    </div>
                    <div class="product-info">
                        <div class="loading-spinner"></div>
                    </div>
                </div>
            </div>
            <div class="productss">
                <div class="container">
                    <h2 class="section-title">محصولات <span>مشابه</span></h2>
                    <div class="product-list"></div>
                </div>
            </div>
            <div class="product-features">
                <div class="container">
                    <h2 class="section-title">ویژگی‌های <span>محصول</span></h2>
                    <div class="features-grid"></div>
                </div>
            </div>
        `;

        pageDataDiv.innerHTML = html;
    }

    // ===== مقداردهی اولیه =====
    async function init() {
        addStyles();
        loadFooter();
        renderPageContent();
        await loadProductData();

        window.changeMainImage = changeMainImage;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();