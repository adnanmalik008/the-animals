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
    { src: "assets/images/culture-pulse/Reddit user using shoes as taxonomy.png", alt: "Reddit user using shoes as taxonomy" },
    { src: "assets/images/culture-pulse/Reddit user asking for men's fashion advice.png", alt: "Reddit user asking for men's fashion advice" },
    { src: "assets/images/culture-pulse/TikTok comic.png", alt: "TikTok comic" },
    { src: "assets/images/culture-pulse/TikTok comic roundup of what your running shoes say about you.png", alt: "TikTok comic roundup" },
    { src: "assets/images/culture-pulse/Reddit user asking the sneaker communityfor recommendations.png", alt: "Reddit user asking for recommendations" },
    { src: "assets/images/culture-pulse/Reddit global question.png", alt: "Reddit global question" },
    { src: "assets/images/culture-pulse/Reddit user sharing experience of shoes running.png", alt: "Reddit user sharing experience" },
    { src: "assets/images/culture-pulse/Comic real life situation.png", alt: "Comic real life situation" },
    { src: "assets/images/culture-pulse/Podiatrist reviews the shoe.png", alt: "Podiatrist reviews the shoe" },
    { src: "assets/images/culture-pulse/comic social media share.png", alt: "Comic social media share" },
    { src: "assets/images/culture-pulse/Screenshot 2025-12-03 at 18.00.16.png", alt: "Screenshot" }
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
function renderCulturePulse() {
    const cultureGrid = document.getElementById('culture-grid');
    cultureGrid.innerHTML = '';

    cultureData.forEach((item) => {
        const cultureItem = document.createElement('div');
        cultureItem.className = 'culture-item';
        cultureItem.innerHTML = `<img src="${item.src}" alt="${item.alt}">`;
        cultureGrid.appendChild(cultureItem);
    });
}

// =============================================
// VIDEO CAROUSEL
// =============================================
let currentVideoIndex = 0;
let videoAutoplayInterval;
let isVideoPlaying = false;

function renderVideo(index) {
    const container = document.getElementById('video-container');
    const video = videoData[index];

    if (isVideoPlaying) {
        // Show embedded video
        container.innerHTML = `
            <iframe
                src="https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
            </iframe>
        `;
    } else {
        // Show thumbnail with play button
        container.innerHTML = `
            <img class="video-thumbnail" src="${video.thumbnail}" alt="${video.title}" onerror="this.style.display='none'">
            <div class="video-play-overlay" onclick="playVideo()">▶</div>
        `;
    }

    document.getElementById('video-title').textContent = video.title;
    document.getElementById('video-description').innerHTML = video.description + ' <a href="#" class="read-more">Read More</a>';
}

function playVideo() {
    isVideoPlaying = true;
    clearInterval(videoAutoplayInterval);
    renderVideo(currentVideoIndex);
}

function stopVideo() {
    isVideoPlaying = false;
    renderVideo(currentVideoIndex);
    startVideoCarousel();
}

function nextVideo() {
    isVideoPlaying = false;
    currentVideoIndex = (currentVideoIndex + 1) % videoData.length;
    renderVideo(currentVideoIndex);
}

function prevVideo() {
    isVideoPlaying = false;
    currentVideoIndex = (currentVideoIndex - 1 + videoData.length) % videoData.length;
    renderVideo(currentVideoIndex);
}

function startVideoCarousel() {
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
}

function updateVoiceQuote() {
    const quotes = voiceData[currentTab];
    document.getElementById('voice-quote').textContent = quotes[currentVoiceIndex];
}

function nextVoice() {
    const quotes = voiceData[currentTab];
    currentVoiceIndex = (currentVoiceIndex + 1) % quotes.length;
    updateVoiceQuote();
}

function prevVoice() {
    const quotes = voiceData[currentTab];
    currentVoiceIndex = (currentVoiceIndex - 1 + quotes.length) % quotes.length;
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

    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Voice carousel arrows
    document.getElementById('dd-prev').addEventListener('click', prevVoice);
    document.getElementById('dd-next').addEventListener('click', nextVoice);

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
        }
    });
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

    // Initialize video
    renderVideo(0);
    startVideoCarousel();

    // Initialize voice quote
    updateVoiceQuote();

    // Set up event listeners
    initEventListeners();

    console.log('The Animals Dashboard initialized');
});
