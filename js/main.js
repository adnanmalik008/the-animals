/* =============================================
   THE ANIMALS DASHBOARD - MAIN JS
   ============================================= */

// =============================================
// DATA
// =============================================
const newsData = [
    {
        time: "10:00 pm ET",
        date: "Nov. 24, 2025",
        source: "WSJ",
        category: "RETAIL",
        headline: "This Sneaker Brand Keeps Raising Prices — and Consumers Don't Seem to Care",
        author: "@INTI PACHECO",
        summary: "Explores On's ability to raise prices without losing customers while preparing for potential tariff impacts.",
        link: "https://www.wsj.com/business/retail/on-sneakers-price-increases-nike-tariffs-df33a504"
    },
    {
        time: "16:55 pm ET",
        date: "Nov. 12, 2025",
        source: "WWD",
        category: "FOOTWEAR NEWS",
        headline: "On Is Betting on These Sneakers to Drive 2026",
        author: "@DANIELLE KAY",
        summary: "Highlights the brand's confidence in upcoming 2026 launches, including the Cloudrunner 3 and Cloudmonster 3.",
        link: "https://footwearnews.com/business/earnings/on-running-sneakers-drive-growth-2026-1203713028/"
    },
    {
        time: "10:00 pm ET",
        date: "Oct. 20, 2025",
        source: "Wirecutter",
        category: "REVIEW",
        headline: "How to Choose the Best Running Shoes for You",
        author: "@ SETH BERKMAN",
        summary: "Our experts tested dozens of running shoes to help you find the perfect fit for your running style and foot type.",
        link: "https://www.nytimes.com/wirecutter/reviews/best-running-shoes/"
    },
    {
        time: "00:00 pm ET",
        date: "OCT. 17, 2025",
        source: "BBC",
        category: "BUSINESS",
        headline: "Customers sue over 'embarrassing' squeaky On Cloud shoes",
        author: "@VICKI M. YOUNG",
        summary: "Covers a class-action lawsuit alleging that a defect in the CloudTec sole causes an 'embarrassing' squeaking sound.",
        link: "https://www.bbc.com/news/articles/cp9zlj99n9zo"
    },
    {
        time: "10:23 pm ET",
        date: "NOV. 12, 2025",
        source: "Reuters",
        category: "BUSINESS",
        headline: "Sportswear brand On lifts annual targets again amid strong demand",
        author: "@HELEN REID",
        authors: ["@HELEN REID", "@JUVERIA TABUSSUM"],
        summary: "Reports that On raised its annual revenue target for the third time in 2025 due to sustained high demand.",
        link: "https://www.reuters.com/business/sportswear-brand-lifts-annual-targets-again-amid-strong-demand-2025-11-12/"
    },
    {
        time: "10:00 pm ET",
        date: "Nov. 24, 2025",
        source: "WSJ",
        category: "RETAIL",
        headline: "This Sneaker Brand Keeps Raising Prices — and Consumers Don't Seem to Care",
        author: "@INTI PACHECO",
        summary: "Explores On's ability to raise prices without losing customers while preparing for potential tariff impacts.",
        link: "https://www.wsj.com/business/retail/on-sneakers-price-increases-nike-tariffs-df33a504"
    },
    {
        time: "16:55 pm ET",
        date: "Nov. 12, 2025",
        source: "WWD",
        category: "FOOTWEAR NEWS",
        headline: "On Is Betting on These Sneakers to Drive 2026",
        author: "@DANIELLE KAY",
        summary: "Highlights the brand's confidence in upcoming 2026 launches, including the Cloudrunner 3 and Cloudmonster 3.",
        link: "https://footwearnews.com/business/earnings/on-running-sneakers-drive-growth-2026-1203713028/"
    },
    {
        time: "10:00 pm ET",
        date: "Oct. 20, 2025",
        source: "Wirecutter",
        category: "REVIEW",
        headline: "How to Choose the Best Running Shoes for You",
        author: "@ SETH BERKMAN",
        summary: "Our experts tested dozens of running shoes to help you find the perfect fit for your running style and foot type.",
        link: "https://www.nytimes.com/wirecutter/reviews/best-running-shoes/"
    },
    {
        time: "00:00 pm ET",
        date: "OCT. 17, 2025",
        source: "BBC",
        category: "BUSINESS",
        headline: "Customers sue over 'embarrassing' squeaky On Cloud shoes",
        author: "@VICKI M. YOUNG",
        summary: "Covers a class-action lawsuit alleging that a defect in the CloudTec sole causes an 'embarrassing' squeaking sound.",
        link: "https://www.bbc.com/news/articles/cp9zlj99n9zo"
    },
    {
        time: "10:23 pm ET",
        date: "NOV. 12, 2025",
        source: "Reuters",
        category: "BUSINESS",
        headline: "Sportswear brand On lifts annual targets again amid strong demand",
        author: "@HELEN REID",
        authors: ["@HELEN REID", "@JUVERIA TABUSSUM"],
        summary: "Reports that On raised its annual revenue target for the third time in 2025 due to sustained high demand.",
        link: "https://www.reuters.com/business/sportswear-brand-lifts-annual-targets-again-amid-strong-demand-2025-11-12/"
    }
];

// Hidden article that appears after 30 seconds - Hollywood Reporter
const newArticle = {
    time: "18:03 pm ET",
    date: "DEC. 4, 2025",
    source: "Hollywood Reporter",
    category: "RETAIL",
    headline: "On Shoes Are Up to Half Off: A Ranking of the Best Sneakers to Gift Runners...",
    author: "@ERIN LASSNER",
    summary: "Holiday gift guide featuring the best On Running shoes currently on sale for the running enthusiast in your life.",
    isNew: true
};

const cultureData = [
    { src: "assets/images/culture-pulse/Reddit user using shoes as taxonomy.png", alt: "Reddit user using shoes as taxonomy", platform: "reddit" },
    { src: "assets/images/culture-pulse/Reddit user asking for men's fashion advice.png", alt: "Reddit user asking for men's fashion advice", platform: "reddit" },
    { src: "assets/images/culture-pulse/TikTok comic.png", alt: "TikTok comic", platform: "tiktok" },
    { src: "assets/images/culture-pulse/TikTok comic roundup of what your running shoes say about you.png", alt: "TikTok comic roundup", platform: "tiktok" },
    { src: "assets/images/culture-pulse/Reddit user asking the sneaker communityfor recommendations.png", alt: "Reddit user asking for recommendations", platform: "reddit" },
    { src: "assets/images/culture-pulse/Reddit global question.png", alt: "Reddit global question", platform: "reddit" },
    { src: "assets/images/culture-pulse/Reddit user sharing experience of shoes running.png", alt: "Reddit user sharing experience", platform: "reddit" },
    { src: "assets/images/culture-pulse/Comic real life situation.png", alt: "Comic real life situation", platform: "instagram" },
    { src: "assets/images/culture-pulse/Podiatrist reviews the shoe.png", alt: "Podiatrist reviews the shoe", platform: "tiktok" },
    { src: "assets/images/culture-pulse/comic social media share.png", alt: "Comic social media share", platform: "instagram" },
    { src: "assets/images/culture-pulse/Screenshot 2025-12-03 at 18.00.16.png", alt: "Screenshot", platform: "instagram" }
];

const videoData = [
    {
        id: "I2rdFe9S71Y",
        title: "YOUTUBE LIVE: SMART KICKS",
        description: "AI Info: Smart Kicks is a Youtuber with 157k subscribers that reviews a variety of sneakers in hand he is fair...",
        thumbnail: "https://img.youtube.com/vi/I2rdFe9S71Y/maxresdefault.jpg"
    },
    {
        id: "FsMK-cHOylg",
        title: "ON CLOUD REVIEW 2025",
        description: "AI Info: Comprehensive review of the latest On Cloud models, covering comfort, durability, and value...",
        thumbnail: "https://img.youtube.com/vi/FsMK-cHOylg/maxresdefault.jpg"
    },
    {
        id: "Fb9PYpxaYQ0",
        title: "RUNNING IN ON CLOUDS",
        description: "AI Info: Real-world test of On Running shoes across different terrains and distances...",
        thumbnail: "https://img.youtube.com/vi/Fb9PYpxaYQ0/maxresdefault.jpg"
    }
];

const voiceData = {
    drivers: [
        "Comfort for standing and walking all day",
        "Perfect for both gym and casual wear",
        "So lightweight I forget I'm wearing them",
        "Love the unique look - always get compliments",
        "Great community of On runners online",
        "The Swiss engineering really shows"
    ],
    problems: [
        "Shoes occasionally squeak",
        "Not suitable for cold weather",
        "Some people think they look weird",
        "Price keeps going up every year",
        "Cushioning wears out faster than expected",
        "Hard to clean the CloudTec pods"
    ],
    solutions: [
        "New colorways that look more mainstream",
        "Finally offering wide sizes",
        "Student discount program launched",
        "DIY repair videos are helpful",
        "Recycling program for old shoes",
        "Winter-ready Cloudrock coming soon"
    ]
};

// =============================================
// CLOCK FUNCTIONALITY
// =============================================
function updateClock() {
    const now = new Date();

    // Get GMT time
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');

    document.getElementById('clock-hours').textContent = hours;
    document.getElementById('clock-minutes').textContent = minutes;
    document.getElementById('clock-seconds').textContent = seconds;

    // Update day and date
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    document.getElementById('clock-day').textContent = days[now.getUTCDay()];
    document.getElementById('clock-date-num').textContent = now.getUTCDate();
    document.getElementById('clock-month').textContent = months[now.getUTCMonth()];
}

// =============================================
// NEWS WIRE
// =============================================
// Source logo mappings
const sourceLogos = {
    'WSJ': 'assets/images/source-logos/wsj.png',
    'WWD': 'assets/images/source-logos/wwd.png',
    'Wirecutter': 'assets/images/source-logos/wirecutter.png',
    'BBC': 'assets/images/source-logos/bbc.png',
    'Reuters': 'assets/images/source-logos/reuters.png',
    'Hollywood Reporter': 'assets/images/source-logos/hollywood-reporter.png'
};

function renderNewsWire() {
    const newsList = document.getElementById('news-list');
    newsList.innerHTML = '';

    newsData.forEach((item, index) => {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';

        // Handle multiple authors
        let authorHtml = item.author;
        if (item.authors && item.authors.length > 1) {
            authorHtml = item.authors.map(a => `<span>${a}</span>`).join('<br>');
        }

        // Get logo or fallback to text
        const logoPath = sourceLogos[item.source];
        const sourceHtml = logoPath
            ? `<img src="${logoPath}" alt="${item.source}" class="source-logo">`
            : item.source;

        newsItem.innerHTML = `
            <div class="news-time">${item.time}<br>${item.date}</div>
            <div class="news-source">${sourceHtml}</div>
            <div class="news-content">
                <div class="news-category">${item.category}</div>
                <div class="news-headline">${item.headline}</div>
            </div>
            <div class="news-author">${authorHtml}</div>
            <div class="news-tooltip">${item.summary}</div>
        `;

        // Make item clickable if it has a link
        if (item.link) {
            newsItem.addEventListener('click', () => {
                window.open(item.link, '_blank');
            });
        }

        newsList.appendChild(newsItem);
    });
}

function addNewArticle() {
    const newsList = document.getElementById('news-list');
    const newsItem = document.createElement('div');
    newsItem.className = 'news-item new';
    newsItem.innerHTML = `
        <div class="news-time">
            <span class="just-in-badge">JUST IN</span>
            ${newArticle.time}<br>${newArticle.date}
        </div>
        <div class="news-source">${newArticle.source}</div>
        <div class="news-content">
            <div class="news-category">${newArticle.category}</div>
            <div class="news-headline">${newArticle.headline}</div>
        </div>
        <div class="news-author">${newArticle.author}</div>
        <div class="news-tooltip">${newArticle.summary}</div>
    `;
    newsList.insertBefore(newsItem, newsList.firstChild);

    // Scroll to top to show new article
    newsList.scrollTop = 0;
}

// =============================================
// CULTURE PULSE
// =============================================
let currentCultureFilter = 'all';

function renderCulturePulse() {
    const cultureGrid = document.getElementById('culture-grid');
    cultureGrid.innerHTML = '';

    cultureData.forEach((item) => {
        const cultureItem = document.createElement('div');
        cultureItem.className = 'culture-item';
        cultureItem.dataset.platform = item.platform;
        cultureItem.innerHTML = `<img src="${item.src}" alt="${item.alt}">`;
        cultureGrid.appendChild(cultureItem);
    });
}

function filterCulturePulse(platform) {
    currentCultureFilter = platform;
    const cultureItems = document.querySelectorAll('.culture-item');

    // Update filter button states
    document.querySelectorAll('.culture-filter').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.platform === platform) {
            btn.classList.add('active');
        }
    });

    // Filter items
    cultureItems.forEach(item => {
        if (platform === 'all' || item.dataset.platform === platform) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
}

// =============================================
// VIDEO CAROUSEL
// =============================================
let currentVideoIndex = 0;
let videoAutoplayInterval;
let isVideoPlaying = false;
let sliderTrack = null;

function initVideoSlider() {
    const container = document.getElementById('video-container');

    // Create slider track with all videos
    sliderTrack = document.createElement('div');
    sliderTrack.className = 'video-slider-track';

    videoData.forEach((video, index) => {
        const slide = document.createElement('div');
        slide.className = 'video-slide';
        slide.dataset.index = index;
        slide.innerHTML = `
            <img class="video-thumbnail" src="${video.thumbnail}" alt="${video.title}" onerror="this.style.display='none'">
            <div class="video-play-overlay">▶</div>
        `;
        sliderTrack.appendChild(slide);
    });

    container.appendChild(sliderTrack);
    updateVideoInfo(0);
}

function updateSliderPosition(animate = true) {
    if (!sliderTrack) return;

    if (!animate) {
        sliderTrack.style.transition = 'none';
    } else {
        sliderTrack.style.transition = 'transform 0.5s ease';
    }

    const offset = currentVideoIndex * (100 / videoData.length);
    sliderTrack.style.transform = `translateX(-${offset}%)`;

    // Force reflow for non-animated changes
    if (!animate) {
        sliderTrack.offsetHeight;
        sliderTrack.style.transition = 'transform 0.5s ease';
    }
}

function updateVideoInfo(index) {
    const video = videoData[index];
    document.getElementById('video-title').textContent = video.title;
    document.getElementById('video-description').innerHTML = video.description + ' <a href="#" class="read-more">Read More</a>';
}

function playVideo() {
    isVideoPlaying = true;
    clearInterval(videoAutoplayInterval);

    // Replace current slide with iframe
    const currentSlide = sliderTrack.querySelector(`.video-slide[data-index="${currentVideoIndex}"]`);
    const video = videoData[currentVideoIndex];
    currentSlide.innerHTML = `
        <iframe
            src="https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
        </iframe>
    `;
}

function stopVideo() {
    isVideoPlaying = false;

    // Replace iframe back with thumbnail
    const currentSlide = sliderTrack.querySelector(`.video-slide[data-index="${currentVideoIndex}"]`);
    const video = videoData[currentVideoIndex];
    currentSlide.innerHTML = `
        <img class="video-thumbnail" src="${video.thumbnail}" alt="${video.title}" onerror="this.style.display='none'">
        <div class="video-play-overlay">▶</div>
    `;

    startVideoCarousel();
}

function nextVideo() {
    if (isVideoPlaying) {
        stopVideo();
    }
    currentVideoIndex = (currentVideoIndex + 1) % videoData.length;
    updateSliderPosition();
    updateVideoInfo(currentVideoIndex);
}

function prevVideo() {
    if (isVideoPlaying) {
        stopVideo();
    }
    currentVideoIndex = (currentVideoIndex - 1 + videoData.length) % videoData.length;
    updateSliderPosition();
    updateVideoInfo(currentVideoIndex);
}

function startVideoCarousel() {
    clearInterval(videoAutoplayInterval);
    videoAutoplayInterval = setInterval(() => {
        if (!isVideoPlaying) {
            nextVideo();
        }
    }, 8000); // Change video every 8 seconds
}

// =============================================
// DETERRENTS/DRIVERS TABS
// =============================================
let currentTab = 'problems';
let currentVoiceIndex = 0;
let voiceAutoplayInterval;
let isVoiceHovered = false;

function switchTab(tab) {
    currentTab = tab;
    currentVoiceIndex = 0;

    // Update tab styles
    document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
        if (t.dataset.tab === tab) {
            t.classList.add('active');
        }
    });

    // Update voice quote
    updateVoiceQuote();

    // Restart auto-rotation
    startVoiceCarousel();
}

function startVoiceCarousel() {
    clearInterval(voiceAutoplayInterval);
    voiceAutoplayInterval = setInterval(() => {
        if (!isVoiceHovered) {
            nextVoice();
        }
    }, 5000); // Rotate every 5 seconds
}

function updateVoiceQuote() {
    const quotes = voiceData[currentTab];
    // Show two quotes at a time
    const index1 = currentVoiceIndex * 2;
    const index2 = currentVoiceIndex * 2 + 1;

    document.getElementById('voice-quote-1').textContent = quotes[index1] || '';
    document.getElementById('voice-quote-2').textContent = quotes[index2] || '';
}

function nextVoice() {
    const quotes = voiceData[currentTab];
    const maxIndex = Math.ceil(quotes.length / 2) - 1;
    currentVoiceIndex = (currentVoiceIndex + 1) > maxIndex ? 0 : currentVoiceIndex + 1;
    updateVoiceQuote();
}

function prevVoice() {
    const quotes = voiceData[currentTab];
    const maxIndex = Math.ceil(quotes.length / 2) - 1;
    currentVoiceIndex = (currentVoiceIndex - 1) < 0 ? maxIndex : currentVoiceIndex - 1;
    updateVoiceQuote();
}

// =============================================
// MODAL
// =============================================
function showModal() {
    document.getElementById('modal-overlay').classList.add('active');
}

function hideModal() {
    document.getElementById('modal-overlay').classList.remove('active');
}

// =============================================
// AI VISIBILITY COUNTER ANIMATION
// =============================================
let aiCounterAnimated = false;
const aiMetricValues = {
    visibility: 42,
    mentions: 10.8,
    citedPages: 14.8
};
const platformValues = {
    chatgpt: { mentions: 2.8, cited: 8 },
    aiOverview: { mentions: 1.2, cited: 1.8 },
    aiMode: { mentions: 3.2, cited: 5.5 },
    gemini: { mentions: 3.7, cited: 930 }
};

function animateCounter(element, target, suffix = '', duration = 1000, isDecimal = false) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = start + (target - start) * easeOutQuart;

        if (isDecimal) {
            element.textContent = current.toFixed(1) + suffix;
        } else if (target >= 100) {
            element.textContent = Math.round(current) + suffix;
        } else {
            element.textContent = Math.round(current) + suffix;
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            // Ensure final value is exact
            if (isDecimal) {
                element.textContent = target.toFixed(1) + suffix;
            } else {
                element.textContent = target + suffix;
            }
        }
    }

    requestAnimationFrame(update);
}

function animateScoreRing(target, duration = 1200) {
    const ringFill = document.querySelector('.score-ring-fill');
    if (!ringFill) return;

    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = target * easeOutQuart;

        ringFill.setAttribute('stroke-dasharray', `${current}, 100`);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            ringFill.setAttribute('stroke-dasharray', `${target}, 100`);
        }
    }

    requestAnimationFrame(update);
}

function resetAICounters() {
    // Reset main metrics
    const visibilityEl = document.querySelector('.ai-metrics-grid .ai-metric:nth-child(1) .ai-metric-value');
    const mentionsEl = document.querySelector('.ai-metrics-grid .ai-metric:nth-child(2) .ai-metric-value');
    const citedEl = document.querySelector('.ai-metrics-grid .ai-metric:nth-child(3) .ai-metric-value');

    if (visibilityEl) visibilityEl.textContent = '0';
    if (mentionsEl) mentionsEl.textContent = '0K';
    if (citedEl) citedEl.textContent = '0K';

    // Reset score ring to 0
    const ringFill = document.querySelector('.score-ring-fill');
    if (ringFill) ringFill.setAttribute('stroke-dasharray', '0, 100');

    // Reset platform values
    const platformRows = document.querySelectorAll('.ai-platform-table .platform-row');
    platformRows.forEach(row => {
        const mentions = row.querySelector('.platform-mentions');
        const cited = row.querySelector('.platform-cited');
        if (mentions) mentions.textContent = '0';
        if (cited) cited.textContent = '0';
    });
}

function animateAICounters() {
    // Animate main metrics
    const visibilityEl = document.querySelector('.ai-metrics-grid .ai-metric:nth-child(1) .ai-metric-value');
    const mentionsEl = document.querySelector('.ai-metrics-grid .ai-metric:nth-child(2) .ai-metric-value');
    const citedEl = document.querySelector('.ai-metrics-grid .ai-metric:nth-child(3) .ai-metric-value');

    if (visibilityEl) animateCounter(visibilityEl, aiMetricValues.visibility, '', 1200);
    if (mentionsEl) animateCounter(mentionsEl, aiMetricValues.mentions, 'K', 1200, true);
    if (citedEl) animateCounter(citedEl, aiMetricValues.citedPages, 'K', 1200, true);

    // Animate score ring from 0 to 42
    animateScoreRing(aiMetricValues.visibility, 1200);

    // Animate platform values with staggered timing
    const platformRows = document.querySelectorAll('.ai-platform-table .platform-row');
    const platforms = ['chatgpt', 'aiOverview', 'aiMode', 'gemini'];

    platformRows.forEach((row, index) => {
        const mentions = row.querySelector('.platform-mentions');
        const cited = row.querySelector('.platform-cited');
        const platformKey = platforms[index];
        const values = platformValues[platformKey];

        setTimeout(() => {
            if (mentions && values) {
                animateCounter(mentions, values.mentions, 'K', 800, true);
            }
            if (cited && values) {
                if (values.cited >= 100) {
                    animateCounter(cited, values.cited, '', 800, false);
                } else {
                    animateCounter(cited, values.cited, 'K', 800, true);
                }
            }
        }, index * 100);
    });

    aiCounterAnimated = true;
}

function initAICounterAnimation() {
    const aiVisibilityCard = document.querySelector('.ai-visibility');

    if (aiVisibilityCard) {
        aiVisibilityCard.addEventListener('mouseenter', () => {
            if (!aiCounterAnimated) {
                resetAICounters();
                setTimeout(() => animateAICounters(), 50);
            }
        });

        aiVisibilityCard.addEventListener('mouseleave', () => {
            aiCounterAnimated = false;
        });
    }
}

// =============================================
// EVENT LISTENERS
// =============================================
function initEventListeners() {
    // Video carousel arrows
    document.getElementById('video-prev').addEventListener('click', prevVideo);
    document.getElementById('video-next').addEventListener('click', nextVideo);

    // Video container hover to play, mouseleave to stop
    const videoContainer = document.getElementById('video-container');
    videoContainer.addEventListener('mouseenter', () => {
        if (!isVideoPlaying) {
            playVideo();
        }
    });
    videoContainer.addEventListener('mouseleave', () => {
        if (isVideoPlaying) {
            stopVideo();
        }
    });

    // Click on play overlay to start video
    videoContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('video-play-overlay')) {
            playVideo();
        }
    });

    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Voice carousel arrows
    document.getElementById('dd-prev').addEventListener('click', prevVoice);
    document.getElementById('dd-next').addEventListener('click', nextVoice);

    // Voice carousel hover pause
    const voiceCards = document.querySelector('.voice-cards');
    if (voiceCards) {
        voiceCards.addEventListener('mouseenter', () => {
            isVoiceHovered = true;
        });
        voiceCards.addEventListener('mouseleave', () => {
            isVoiceHovered = false;
        });
    }

    // Culture pulse filters
    document.querySelectorAll('.culture-filter').forEach(filter => {
        filter.addEventListener('click', () => filterCulturePulse(filter.dataset.platform));
    });

    // Navigation tabs - show modal for non-live pages
    document.querySelectorAll('.nav-tab').forEach(navTab => {
        navTab.addEventListener('click', () => {
            const page = navTab.dataset.page;
            if (page !== 'live') {
                showModal();
            }
        });
    });

    // Modal close button
    document.getElementById('modal-close').addEventListener('click', hideModal);

    // Close modal on overlay click
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal-overlay')) {
            hideModal();
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideModal();
            closeMobileMenu();
        }
    });

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navTabs = document.getElementById('nav-tabs');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            navTabs.classList.toggle('active');
            mobileNavOverlay.classList.toggle('active');
            document.body.style.overflow = navTabs.classList.contains('active') ? 'hidden' : '';
        });
    }

    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', closeMobileMenu);
    }

    // Close mobile menu when a nav tab is clicked
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', closeMobileMenu);
    });
}

function closeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navTabs = document.getElementById('nav-tabs');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');

    if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
    if (navTabs) navTabs.classList.remove('active');
    if (mobileNavOverlay) mobileNavOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// =============================================
// NEWS WIRE AUTO-SCROLL
// =============================================
let newsScrollInterval;
let isNewsHovered = false;

function startNewsAutoScroll() {
    const newsList = document.getElementById('news-list');

    // Pause on hover
    newsList.addEventListener('mouseenter', () => {
        isNewsHovered = true;
    });

    newsList.addEventListener('mouseleave', () => {
        isNewsHovered = false;
    });

    // Auto scroll every 4 seconds
    newsScrollInterval = setInterval(() => {
        if (!isNewsHovered && newsList.children.length > 0) {
            const firstItem = newsList.children[0];
            const itemHeight = firstItem.offsetHeight + 12; // include gap

            // Animate scroll
            newsList.style.transition = 'transform 0.5s ease';
            newsList.style.transform = `translateY(-${itemHeight}px)`;

            setTimeout(() => {
                // Move first item to end
                newsList.style.transition = 'none';
                newsList.style.transform = 'translateY(0)';
                newsList.appendChild(firstItem);
            }, 500);
        }
    }, 4000);
}

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    // Start clock
    updateClock();
    setInterval(updateClock, 1000);

    // Render news wire
    renderNewsWire();

    // Start news auto-scroll
    startNewsAutoScroll();

    // Add new article after 30 seconds
    setTimeout(addNewArticle, 30000);

    // Render culture pulse
    renderCulturePulse();

    // Initialize video slider
    initVideoSlider();
    startVideoCarousel();

    // Initialize voice quote and start auto-rotation
    updateVoiceQuote();
    startVoiceCarousel();

    // Set up event listeners
    initEventListeners();

    // Initialize AI counter animation
    initAICounterAnimation();

    console.log('The Animals Dashboard initialized');
});
