// ===== countdown-bar.js =====
(function() {
    'use strict';

    // ===== تنظیمات =====
    const COUNTDOWN_CONFIG = {
        // تاریخ هدف (سال, ماه, روز, ساعت, دقیقه, ثانیه)
        targetDate: '2026-6-17 20:00:00',
        // پیام قبل از شروع
        messageBefore: '🔥 فروش ویژه دراپ به زودی آغاز می‌شود',
        // پیام بعد از اتمام
        messageAfter: '🎉 فروش ویژه دراپ آغاز شد! همین الان اقدام کنید',
        // لینک بعد از اتمام
        linkAfter: 'shopdrap.html',
        // رنگ پس‌زمینه نوار
        bgColor: '#8B5E3C',
        // رنگ متن
        textColor: '#ffffff'
    };

    // ===== استایل نوار =====
    function addCountdownStyles() {
        if (document.getElementById('countdown-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'countdown-styles';
        style.textContent = `
            .countdown-bar {
                background: ${COUNTDOWN_CONFIG.bgColor};
                color: ${COUNTDOWN_CONFIG.textColor};
                padding: 5px 20px;
                text-align: center;
                font-size: 14px;
                position: relative;
                z-index: 1001;
                font-family: inherit;
            }
            .countdown-container {
                max-width: 1280px;
                margin: 0 auto;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 20px;
                flex-wrap: wrap;
            }
            .countdown-message {
                font-weight: 500;
            }
            .countdown-timer {
                display: flex;
                gap: 15px;
                direction: ltr;
            }
            .countdown-unit {
                display: flex;
                flex-direction: column;
                align-items: center;
                background: rgba(255,255,255,0.2);
                padding: 5px 10px;
                border-radius: 8px;
                min-width: 60px;
            }
            .countdown-number {
                font-size: 20px;
                font-weight: bold;
                line-height: 1.2;
            }
            .countdown-label {
                font-size: 10px;
                opacity: 0.8;
            }
            .countdown-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 18px;
                padding: 5px;
                opacity: 0.7;
                transition: opacity 0.2s;
                position: absolute;
                left: 10px;
                top: 50%;
                transform: translateY(-50%);
            }
            .countdown-close:hover {
                opacity: 1;
            }
            .countdown-bar a {
                color: white;
                text-decoration: none;
            }
            .countdown-bar a:hover {
                text-decoration: underline;
            }
            @media (max-width: 768px) {
                .countdown-container {
                    flex-direction: column;
                    gap: 10px;
                    padding-right: 30px;
                    padding-left: 30px;
                }
                .countdown-timer {
                    gap: 8px;
                }
                .countdown-unit {
                    min-width: 50px;
                    padding: 3px 6px;
                }
                .countdown-number {
                    font-size: 16px;
                }
                .countdown-label {
                    font-size: 9px;
                }
                .countdown-message {
                    font-size: 12px;
                }
            }
            @media (max-width: 480px) {
                .countdown-timer {
                    gap: 5px;
                }
                .countdown-unit {
                    min-width: 40px;
                }
                .countdown-number {
                    font-size: 14px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ===== تبدیل تاریخ به تایم‌استمپ =====
    function getTargetTimestamp() {
        return new Date(COUNTDOWN_CONFIG.targetDate).getTime();
    }

    // ===== محاسبه زمان باقیمانده =====
    function getTimeRemaining() {
        const now = new Date().getTime();
        const target = getTargetTimestamp();
        const distance = target - now;
        
        if (distance < 0) {
            return {
                ended: true,
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            };
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        return {
            ended: false,
            days: days,
            hours: hours,
            minutes: minutes,
            seconds: seconds
        };
    }

    // ===== آپدیت نمایش =====
    function updateDisplay() {
        const timerElement = document.getElementById('countdownTimer');
        const messageElement = document.getElementById('countdownMessage');
        const container = document.getElementById('countdownContainer');
        
        if (!timerElement) return;
        
        const time = getTimeRemaining();
        
        if (time.ended) {
            // زمان تمام شده - نمایش پیام جدید
            if (messageElement) {
                messageElement.innerHTML = COUNTDOWN_CONFIG.messageAfter;
            }
            if (timerElement) {
                timerElement.style.display = 'none';
            }
            if (container && COUNTDOWN_CONFIG.linkAfter) {
                // کل نوار رو لینک دار کن
                container.style.cursor = 'pointer';
                container.onclick = () => {
                    window.location.href = COUNTDOWN_CONFIG.linkAfter;
                };
            }
            return;
        }
        
        // نمایش زمان باقیمانده
        if (messageElement) {
            messageElement.innerHTML = COUNTDOWN_CONFIG.messageBefore;
        }
        if (timerElement) {
            timerElement.style.display = 'flex';
            timerElement.innerHTML = `
                <div class="countdown-unit">
                    <span class="countdown-number">${String(time.days).padStart(2, '0')}</span>
                    <span class="countdown-label">روز</span>
                </div>
                <div class="countdown-unit">
                    <span class="countdown-number">${String(time.hours).padStart(2, '0')}</span>
                    <span class="countdown-label">ساعت</span>
                </div>
                <div class="countdown-unit">
                    <span class="countdown-number">${String(time.minutes).padStart(2, '0')}</span>
                    <span class="countdown-label">دقیقه</span>
                </div>
                <div class="countdown-unit">
                    <span class="countdown-number">${String(time.seconds).padStart(2, '0')}</span>
                    <span class="countdown-label">ثانیه</span>
                </div>
            `;
        }
    }

    // ===== بستن نوار =====
    function closeBar() {
        const bar = document.getElementById('countdownBar');
        if (bar) {
            bar.style.display = 'none';
            localStorage.setItem('countdown_bar_closed', Date.now().toString());
        }
    }

    // ===== بررسی اینکه نوار بسته شده یا نه =====
    function shouldShowBar() {
        const closedTime = localStorage.getItem('countdown_bar_closed');
        if (!closedTime) return true;
        
        // اگر کمتر از 24 ساعت گذشته باشه، نمایش نده
        const hoursPassed = (Date.now() - parseInt(closedTime)) / (1000 * 60 * 60);
        return hoursPassed >= 24;
    }

    // ===== رندر نوار =====
    function renderCountdownBar() {
        // اگر کاربر بسته بود و کمتر از 24 ساعت گذشته، نمایش نده
        if (!shouldShowBar()) return;
        
        // اگه نوار وجود داره، دوباره رندر نکن
        if (document.getElementById('countdownBar')) return;
        
        const barHtml = `
            <div id="countdownBar" class="countdown-bar">
                <div id="countdownContainer" class="countdown-container">
                    <span id="countdownMessage" class="countdown-message">${COUNTDOWN_CONFIG.messageBefore}</span>
                    <div id="countdownTimer" class="countdown-timer"></div>
                    <button id="countdownCloseBtn" class="countdown-close" aria-label="بستن">✕</button>
                </div>
            </div>
        `;
        
        // قرار دادن نوار بالای هدر
        const header = document.getElementById('header');
        if (header) {
            header.insertAdjacentHTML('beforebegin', barHtml);
        } else {
            document.body.insertAdjacentHTML('afterbegin', barHtml);
        }
        
        // تنظیم رویداد بستن
        const closeBtn = document.getElementById('countdownCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeBar);
        }
        
        // بروزرسانی هر ثانیه
        updateDisplay();
        setInterval(updateDisplay, 1000);
    }

    // ===== مقداردهی اولیه =====
    function init() {
        addCountdownStyles();
        renderCountdownBar();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();