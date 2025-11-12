// CSS 파일 import
import './styles.css';

// 별 데이터 저장
const starData = [];

// 프레임 레이트 모니터링
class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        this.adaptiveInterval = 60; 
    }
    
    update() {
        const currentTime = performance.now();
        
        // 1초마다 FPS 계산
        if (currentTime >= this.lastTime + 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // FPS에 따라 체크 간격 조절
            if (this.fps < 30) {
                this.adaptiveInterval = 150;
            } else if (this.fps < 45) {
                this.adaptiveInterval = 80;
            } else if (this.fps < 55) {
                this.adaptiveInterval = 50;
            } else {
                this.adaptiveInterval = 40; 
            }
        }
        
        return this.adaptiveInterval;
    }
    
    getInterval() {
        return this.adaptiveInterval;
    }
}

const performanceMonitor = new PerformanceMonitor();

// 윈도우 크기 캐싱
let cachedWindowSize = {
    width: window.innerWidth,
    height: window.innerHeight,
    maxDimension: Math.max(window.innerWidth, window.innerHeight)
};

// 윈도우 리사이즈 시 캐시 업데이트
let resizeTimeout = null;
window.addEventListener('resize', () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        cachedWindowSize.width = window.innerWidth;
        cachedWindowSize.height = window.innerHeight;
        cachedWindowSize.maxDimension = Math.max(window.innerWidth, window.innerHeight);
    }, 100);
}, { passive: true });

// 별 생성 
function createStars() {
    const starfield = document.getElementById('starfield');
    const starCount = 150; 
    
    // DocumentFragment 사용하여 DOM 조작 최소화
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // 별 크기 랜덤 선택 
        const size = Math.random();
        if (size > 0.75) {
            star.classList.add('large');
        } else if (size > 0.45) {
            star.classList.add('medium');
        }
        
        // 랜덤 위치
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        star.style.left = left + '%';
        star.style.top = top + '%';
        
        // 랜덤 애니메이션 딜레이 
        const delay = Math.random() * 4 + 1; // 1-5초
        const duration = Math.random() * 3 + 2.5; // 2.5-5.5초
        star.style.animationDelay = delay + 's';
        star.style.animationDuration = duration + 's';
        
        // 별 데이터 저장
        starData.push({
            element: star,
            leftPercent: left,
            topPercent: top
        });
        
        fragment.appendChild(star);
    }
    
    // 한 번에 모든 별 추가
    starfield.appendChild(fragment);
}

// 별 반짝임 체크 함수
function checkStarsInRipple(clickX, clickY, currentRadius, maxRadius) {
    // 캐시된 윈도우 크기 사용
    const { width: windowWidth, height: windowHeight, maxDimension } = cachedWindowSize;
    const maxDimensionPercent = maxDimension / 100;
    
    // 클릭 위치를 퍼센트로 변환 
    const clickXPercent = (clickX / windowWidth) * 100;
    const clickYPercent = (clickY / windowHeight) * 100;
    
    // 파동의 가장자리 근처에 있는 별 감지 
    const waveThickness = maxDimension * 0.15;
    const innerRadius = currentRadius - waveThickness;
    const outerRadius = currentRadius + waveThickness;
    
    // 퍼센트 단위로 반경 계산 
    const innerRadiusPercent = innerRadius / maxDimensionPercent;
    const outerRadiusPercent = outerRadius / maxDimensionPercent;
    const innerRadiusSquared = innerRadiusPercent * innerRadiusPercent;
    const outerRadiusSquared = outerRadiusPercent * outerRadiusPercent;
    
    // 배치 처리로 DOM 조작 최소화
    const starsToSparkle = [];
    const starDataLength = starData.length;
    
    // 별 데이터를 사용하여 계산
    for (let i = 0; i < starDataLength; i++) {
        const starInfo = starData[i];
        const star = starInfo.element;
        
        // 이미 반짝임 중인 별은 건너뛰기
        if (star.classList.contains('sparkle')) continue;
        
        // 퍼센트 단위로 거리 계산 
        const dx = starInfo.leftPercent - clickXPercent;
        const dy = starInfo.topPercent - clickYPercent;
        const distancePercentSquared = dx * dx + dy * dy;
        
        // 파동 가장자리 근처에 있는 별만 반짝임
        if (distancePercentSquared >= innerRadiusSquared && distancePercentSquared <= outerRadiusSquared) {
            starsToSparkle.push(star);
        }
    }
    
    // 배치로 한 번에 처리
    if (starsToSparkle.length > 0) {
        starsToSparkle.forEach(star => {
            star.classList.add('sparkle');
            
            // 애니메이션 종료 후 클래스 제거
            setTimeout(() => {
                if (star.classList.contains('sparkle')) {
                    star.classList.remove('sparkle');
                }
            }, 700); 
        });
    }
}

// 클릭 중복 방지
let isAnimating = false;

// Ripple 효과 생성 - 물방울 떨어뜨리는 느낌
function createRipple(event) {
    // 갤러리 모드나 메뉴 모드일 때는 리플 효과 생성 안 함
    if (isGalleryMode || isMenuMode) return;
    // 애니메이션 중이면 무시
    if (isAnimating) return;
    
    isAnimating = true;
    
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    
    // 클릭 위치 계산
    const x = event.clientX;
    const y = event.clientY;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // 클릭 위치를 퍼센트로 변환
    const clickXPercent = (x / windowWidth) * 100;
    const clickYPercent = (y / windowHeight) * 100;
    
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    document.body.appendChild(ripple);
    
    // 배경 물결 파동 효과
    const background = document.getElementById('background');
    const starfield = document.getElementById('starfield');
    
    // CSS 변수로 클릭 위치 설정 
    document.documentElement.style.setProperty('--click-x', clickXPercent + '%');
    document.documentElement.style.setProperty('--click-y', clickYPercent + '%');
    
    // 물결 파장 레이어 생성
    const maxDimension = Math.max(windowWidth, windowHeight);
    const waveCount = 1; // 파장 개수 1개
    const maxSize = maxDimension * 2;
    
    // DocumentFragment 사용하여 DOM 조작 최소화
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < waveCount; i++) {
        const waveLayer = document.createElement('div');
        waveLayer.className = 'wave-layer';
        waveLayer.style.left = clickXPercent + '%';
        waveLayer.style.top = clickYPercent + '%';
        waveLayer.style.animationDelay = (i * 0.4) + 's'; // 파장 순차 생성
        waveLayer.style.setProperty('--max-size', maxSize + 'px');
        fragment.appendChild(waveLayer);
        
        // 애니메이션 종료 후 제거
        setTimeout(() => {
            if (waveLayer.parentNode) {
                waveLayer.remove();
            }
        }, 2100);
    }
    
    // 한 번에 모든 요소 추가
    background.appendChild(fragment);
    
    // 기존 wave 클래스 제거
    background.classList.remove('wave');
    starfield.classList.remove('wave');
    
    // 강제 리플로우 후 클래스 추가
    void background.offsetWidth;
    void starfield.offsetWidth;
    
    background.classList.add('wave');
    starfield.classList.add('wave');
    
    // 별 반짝임 효과 - 파동이 퍼져나가는 동안
    const maxRadius = Math.max(windowWidth, windowHeight) * 1.5;
    const totalDuration = 2100; // 애니메이션 시간 조정
    const startTime = performance.now();
    let animationFrameId = null;
    let lastCheckTime = 0;
    let frameSkipCount = 0;
    let isActive = true;
    
    // requestAnimationFrame을 사용
    function animateSparkle(currentTime) {
        if (!isActive) {
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            return;
        }
        
        const elapsed = currentTime - startTime;
        
        if (elapsed < totalDuration) {
            // 프레임 레이트 모니터링 업데이트
            performanceMonitor.frameCount++;
            const timeSinceLastUpdate = currentTime - performanceMonitor.lastTime;
            if (timeSinceLastUpdate >= 1000) {
                performanceMonitor.update();
            }
            
            // 적응형 체크 간격 사용
            const adaptiveInterval = performanceMonitor.getInterval();
            if (currentTime - lastCheckTime >= adaptiveInterval) {
                const progress = elapsed / totalDuration;
                const currentRadius = maxRadius * progress;
                // 체크 빈도 증가: FPS 조건 완화
                const shouldCheck = performanceMonitor.fps >= 25 || frameSkipCount % 2 === 0;
                if (shouldCheck) {
                    checkStarsInRipple(x, y, currentRadius, maxRadius);
                    frameSkipCount = 0;
                } else {
                    frameSkipCount++;
                }
                
                lastCheckTime = currentTime;
            }
            
            animationFrameId = requestAnimationFrame(animateSparkle);
        } else {
            isActive = false;
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        }
    }
    
    animationFrameId = requestAnimationFrame(animateSparkle);
    
    // 애니메이션 종료 감지 함수
    const handleAnimationEnd = () => {
        background.removeEventListener('animationend', handleAnimationEnd);
        starfield.removeEventListener('animationend', handleStarfieldEnd);
        
        // 배치 처리로 DOM 조작 최소화
        requestAnimationFrame(() => {
            ripple.remove();
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
            }
            
            // 약간의 지연 후 클래스 제거 및 애니메이션 상태 리셋
            setTimeout(() => {
                background.classList.remove('wave');
                starfield.classList.remove('wave');
                isAnimating = false; // 애니메이션 상태 리셋
            }, 50);
        });
    };
    
    const handleStarfieldEnd = () => {
        // 별바다 애니메이션은 이미 처리됨 
    };
    
    // 애니메이션 종료 이벤트 리스너 등록
    background.addEventListener('animationend', handleAnimationEnd, { once: true });
    starfield.addEventListener('animationend', handleStarfieldEnd, { once: true });
    
    // 리플라이프 안전장치
    const cleanupTimer = setTimeout(() => {
        if (background.classList.contains('wave')) {
            background.removeEventListener('animationend', handleAnimationEnd);
            starfield.removeEventListener('animationend', handleStarfieldEnd);
            
            requestAnimationFrame(() => {
                ripple.remove();
                // 모든 파장 레이어 제거
                const waveLayers = background.querySelectorAll('.wave-layer');
                waveLayers.forEach(layer => layer.remove());
                if (animationFrameId !== null) {
                    cancelAnimationFrame(animationFrameId);
                }
                background.classList.remove('wave');
                starfield.classList.remove('wave');
                isAnimating = false; // 애니메이션 상태 리셋
            });
        }
    }, 3000);
    
    // cleanup timer도 저장해서 필요시 정리
    if (handleAnimationEnd.cleanupTimer) {
        clearTimeout(handleAnimationEnd.cleanupTimer);
    }
    handleAnimationEnd.cleanupTimer = cleanupTimer;
}

// 이미지 갤러리 관련 변수
let isGalleryMode = false;
let isMenuMode = false; // 선택 메뉴 모드
let imageList = []; // 현재 사용할 이미지 목록
let officialImages = []; // 공식 이미지 목록
let fanWorkImages = []; // 2차 창작 이미지 목록
let currentImageIndex = 0;
let usedImages = []; // 사용된 이미지 추적
let galleryTimeout = null;
let imageContainer = null; // 이미지 컨테이너 캐싱
let preloadedImages = new Map(); // 프리로드된 이미지 캐시
let selectionMenu = null; // 선택 메뉴 요소
let exitButton = null; // 나가기 버튼
let devToolsInterval = null; // 개발자 도구 감지 interval

// 페이징 처리 변수
const IMAGES_PER_PAGE = 10; // 페이지당 이미지 수
let currentPage = 0; // 현재 페이지
let preloadedPageCount = 0; // 프리로드된 페이지 수

// 이미지 작가 정보 매핑
const imageArtistMap = {
    'qiqi-ice.jpg': 'unknown',
    'Lynette-wind.jpg': '@niyone09',
    'qiqi ver.2-ice.jpg': '@niyone09',
    'Nahida-grass.jpg': '@niyone09',
};

// 공식 이미지 목록 초기화
function initializeOfficialImages() {
    const imagePaths = [
        // Genshin offcial 폴더
        '/offcialIMG/Genshin offcial/1000009172.png',
        '/offcialIMG/Genshin offcial/1000009173.webp',
        '/offcialIMG/Genshin offcial/1000009175.webp',
        '/offcialIMG/Genshin offcial/1000009176.webp',
        '/offcialIMG/Genshin offcial/1000009177.webp',
        '/offcialIMG/Genshin offcial/1000009178.webp',
        '/offcialIMG/Genshin offcial/1000009179.webp',
        '/offcialIMG/Genshin offcial/1000009180.webp',
        '/offcialIMG/Genshin offcial/1000009181.webp',
        '/offcialIMG/Genshin offcial/1000009182.webp',
        '/offcialIMG/Genshin offcial/1000009183.webp',
        '/offcialIMG/Genshin offcial/1000009184.webp',
        '/offcialIMG/Genshin offcial/1000009185.webp',
        '/offcialIMG/Genshin offcial/1000009186.webp',
        '/offcialIMG/Genshin offcial/1000009187.webp',
        // Gneshinillust 폴더
        '/offcialIMG/Gneshinillust/1000009189.jpg',
        '/offcialIMG/Gneshinillust/1000009190.jpg',
        '/offcialIMG/Gneshinillust/1000009191.jpg',
        '/offcialIMG/Gneshinillust/1000009192.jpg',
        '/offcialIMG/Gneshinillust/1000009193.jpg',
        '/offcialIMG/Gneshinillust/1000009194.jpg',
        '/offcialIMG/Gneshinillust/1000009195.jpg',
        '/offcialIMG/Gneshinillust/1000009196.jpg',
        '/offcialIMG/Gneshinillust/1000009197.jpg',
        '/offcialIMG/Gneshinillust/1000009198.jpg',
        '/offcialIMG/Gneshinillust/1000009199.jpg',
        '/offcialIMG/Gneshinillust/1000009200.jpg',
        '/offcialIMG/Gneshinillust/1000009201.jpg',
        '/offcialIMG/Gneshinillust/1000009202.jpg',
        '/offcialIMG/Gneshinillust/1000009203.jpg',
        '/offcialIMG/Gneshinillust/1000009204.jpg',
        '/offcialIMG/Gneshinillust/1000009205.jpg',
        '/offcialIMG/Gneshinillust/1000009206.jpg',
        '/offcialIMG/Gneshinillust/1000009207.jpg',
        '/offcialIMG/Gneshinillust/1000009208.jpg',
        '/offcialIMG/Gneshinillust/1000009209.jpg',
        '/offcialIMG/Gneshinillust/1000009210.jpg',
        '/offcialIMG/Gneshinillust/1000009211.jpg',
        '/offcialIMG/Gneshinillust/1000009212.jpg',
        '/offcialIMG/Gneshinillust/1000009213.jpg',
        '/offcialIMG/Gneshinillust/1000009214.jpg',
        '/offcialIMG/Gneshinillust/1000009215.jpg',
        '/offcialIMG/Gneshinillust/1000009216.jpg',
        '/offcialIMG/Gneshinillust/1000009217.jpg',
        '/offcialIMG/Gneshinillust/1000009218.jpg',
    ];
    
    officialImages = imagePaths.map(path => {
        const fileName = path.split('/').pop();
        return {
            path: path,
            artist: imageArtistMap[fileName] || null,
            source: null
        };
    });
}

// 2차 창작 이미지 목록 초기화
function initializeFanWorkImages() {
    const imagePaths = [
        // @kikokiko612 폴더
        '/fan work/@kikokiko612/1000009219.webp',
        '/fan work/@kikokiko612/1000009220.webp',
        '/fan work/@kikokiko612/1000009221.webp',
        '/fan work/@kikokiko612/1000009222.webp',
        '/fan work/@kikokiko612/1000009223.webp',
        '/fan work/@kikokiko612/1000009224.webp',
        '/fan work/@kikokiko612/1000009225.webp',
        '/fan work/@kikokiko612/1000009226.webp',
        '/fan work/@kikokiko612/1000009227.webp',
        '/fan work/@kikokiko612/1000009228.webp',
        // @niyone09 폴더
        '/fan work/@niyone09/1000009166.jpg',
        '/fan work/@niyone09/1000009170.jpg',
        '/fan work/@niyone09/1000009171.jpg',
        // Unknown 폴더
        '/fan work/Unknown/1000006240.jpg',
        '/fan work/Unknown/1000006346.webp',
        '/fan work/Unknown/1000006348.jpg',
        '/fan work/Unknown/1000006472.webp',
        '/fan work/Unknown/1000006735.jpg',
        '/fan work/Unknown/1000006736.jpg',
        '/fan work/Unknown/1000007998.jpg',
        '/fan work/Unknown/1000008000.png',
        '/fan work/Unknown/1000008001.webp',
        '/fan work/Unknown/1000008002.jpg',
        '/fan work/Unknown/1000008003.webp',
        '/fan work/Unknown/1000008877.jpg',
        '/fan work/Unknown/1000008878.jpg',
        '/fan work/Unknown/1000008879.webp',
        '/fan work/Unknown/1000008882.webp',
        '/fan work/Unknown/1000008883.webp',
        '/fan work/Unknown/1000008886.jpg',
        '/fan work/Unknown/1000008887.jpg',
        '/fan work/Unknown/1000008888.jpg',
        '/fan work/Unknown/1000008889.jpg',
        '/fan work/Unknown/1000008890.webp',
        '/fan work/Unknown/1000008891.jpg',
        '/fan work/Unknown/1000008892.jpg',
        '/fan work/Unknown/1000008893.jpg',
        '/fan work/Unknown/1000008894.jpg',
        '/fan work/Unknown/1000008896.jpg',
        '/fan work/Unknown/1000008897.png',
        '/fan work/Unknown/1000008898.jpg',
        '/fan work/Unknown/1000008899.webp',
        '/fan work/Unknown/1000008900.jpg',
        '/fan work/Unknown/1000008901.webp',
        '/fan work/Unknown/1000008902.jpg',
    ];
    
    fanWorkImages = imagePaths.map(path => {
        const fileName = path.split('/').pop();
        // 폴더명에서 작가명 추출
        const folderName = path.split('/')[2]; 
        let artist = null;
        if (folderName && folderName !== 'Unknown') {
            artist = folderName.replace('@', '');
        } else if (folderName === 'Unknown') {
            artist = 'unknown';
        }
        
        return {
            path: path,
            artist: artist || imageArtistMap[fileName] || null,
            source: null
        };
    });
}

// 이미지 목록 초기화 
function initializeImageList() {
    initializeOfficialImages();
    initializeFanWorkImages();
}

// 더블 클릭 감지
let lastClickTime = 0;
let clickTimeout = null;
const DOUBLE_CLICK_DELAY = 300; // 더블 클릭 감지 시간

function handleDoubleClick(event) {
    // 갤러리 모드일 때는 더블 클릭 무시
    if (isGalleryMode) return;
    
    const currentTime = performance.now(); 
    
    // 더블 클릭 감지
    if (currentTime - lastClickTime < DOUBLE_CLICK_DELAY) {
        if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
        }
        showSelectionMenu(event);
        lastClickTime = 0; // 더블 클릭 처리 후 리셋
    } else {
        lastClickTime = currentTime;
        if (clickTimeout) {
            clearTimeout(clickTimeout);
        }
        clickTimeout = setTimeout(() => {
            // 단일 클릭 처리
            createRipple(event);
            clickTimeout = null;
        }, DOUBLE_CLICK_DELAY);
    }
}

// 선택 메뉴 표시
function showSelectionMenu(event) {
    if (isMenuMode || isGalleryMode) return;
    
    isMenuMode = true;
    
    // 이미지 목록 초기화
    if (officialImages.length === 0 || fanWorkImages.length === 0) {
        initializeImageList();
    }
    
    // 제목 숨기기
    document.body.classList.add('menu-mode');
    
    // 선택 메뉴용 나가기 버튼 생성 및 추가
    if (!exitButton) {
        exitButton = document.createElement('button');
        exitButton.className = 'gallery-exit-button';
        exitButton.textContent = 'Exit';
        // exit 버튼 클릭 핸들러 - 현재 상태에 따라 적절한 함수 호출
        exitButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isGalleryMode) {
                returnToSelectionMenu();
            } else if (isMenuMode) {
                hideSelectionMenu();
            }
        }, { passive: false });
        exitButton.style.pointerEvents = 'auto';
        exitButton.style.zIndex = '1000';
        document.body.appendChild(exitButton);
    } else {
        // 이미 존재하면 표시
        exitButton.style.opacity = '1';
        exitButton.style.pointerEvents = 'auto';
        exitButton.style.zIndex = '1000';
    }
    
    // 선택 메뉴 생성
    if (!selectionMenu) {
        selectionMenu = document.createElement('div');
        selectionMenu.className = 'selection-menu';
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'selection-buttons';
        
        // 공식 버튼
        const officialButton = document.createElement('button');
        officialButton.className = 'selection-button';
        officialButton.innerHTML = '공식 <span class="button-subtitle">(Official)</span>';
        officialButton.addEventListener('click', () => {
            hideSelectionMenu();
            startImageGallery(event, 'official');
        });
        
        // 2차 창작 버튼
        const fanWorkButton = document.createElement('button');
        fanWorkButton.className = 'selection-button';
        fanWorkButton.innerHTML = '2차 창작<br><span class="button-subtitle">(Fan Work)</span>';
        fanWorkButton.addEventListener('click', () => {
            hideSelectionMenu();
            startImageGallery(event, 'fanwork');
        });
        
        buttonsContainer.appendChild(officialButton);
        buttonsContainer.appendChild(fanWorkButton);
        
        // 홈으로 돌아가기 버튼
        const homeButton = document.createElement('button');
        homeButton.className = 'home-button';
        homeButton.textContent = '홈으로 돌아가기';
        homeButton.addEventListener('click', () => {
            hideSelectionMenu();
        });
        
        selectionMenu.appendChild(buttonsContainer);
        selectionMenu.appendChild(homeButton);
        document.body.appendChild(selectionMenu);
    }
    
    // 메뉴 표시
    requestAnimationFrame(() => {
        selectionMenu.classList.add('active');
    });
}

// 선택 메뉴 숨기기
function hideSelectionMenu() {
    if (!isMenuMode) return;
    
    isMenuMode = false;
    document.body.classList.remove('menu-mode');
    
    // 나가기 버튼 숨기기
    if (exitButton) {
        exitButton.style.opacity = '0';
        exitButton.style.pointerEvents = 'none';
        setTimeout(() => {
            if (exitButton && exitButton.parentNode && !isGalleryMode) {
                exitButton.remove();
                exitButton = null;
            }
        }, 300);
    }
    
    if (selectionMenu) {
        selectionMenu.classList.remove('active');
        setTimeout(() => {
            if (selectionMenu && !selectionMenu.classList.contains('active')) {
                selectionMenu.remove();
                selectionMenu = null;
            }
        }, 400); 
    }
}

// 이미지 프리로드
function preloadImage(src) {
    if (preloadedImages.has(src)) {
        return Promise.resolve(preloadedImages.get(src));
    }
    
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            preloadedImages.set(src, img);
            resolve(img);
        };
        img.onerror = reject;
        img.src = src;
    });
}

// 페이지 단위 이미지 프리로드
function preloadPageImages(pageIndex) {
    const startIndex = pageIndex * IMAGES_PER_PAGE;
    const endIndex = Math.min(startIndex + IMAGES_PER_PAGE, imageList.length);
    
    if (startIndex >= imageList.length) return;
    
    // 현재 페이지와 다음 페이지까지 프리로드
    for (let i = startIndex; i < endIndex; i++) {
        const imgObj = imageList[i];
        if (!preloadedImages.has(imgObj.path)) {
            preloadImage(imgObj.path).catch(() => {
                // 이미지 로드 실패 시 무시
            });
        }
    }
    
    preloadedPageCount = Math.max(preloadedPageCount, pageIndex + 1);
    
    // 다음 페이지도 미리 프리로드
    if (endIndex < imageList.length && pageIndex + 1 <= preloadedPageCount) {
        const nextPageStart = (pageIndex + 1) * IMAGES_PER_PAGE;
        if (nextPageStart < imageList.length) {
            for (let i = nextPageStart; i < Math.min(nextPageStart + IMAGES_PER_PAGE, imageList.length); i++) {
                const imgObj = imageList[i];
                if (!preloadedImages.has(imgObj.path)) {
                    preloadImage(imgObj.path).catch(() => {
                        // 이미지 로드 실패 시 무시
                    });
                }
            }
        }
    }
}

// 우클릭 방지 함수
function preventContextMenu(e) {
    if (isGalleryMode) {
        e.preventDefault();
        return false;
    }
}

// 선택 방지 함수
function preventSelect(e) {
    if (isGalleryMode) {
        e.preventDefault();
        return false;
    }
}

// 사용자 이메일 확인 함수 (여러 방법 지원)
function getUserEmail() {
    // 방법 1: 로컬 스토리지에서 확인
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
        return storedEmail;
    }
    
    // 방법 2: 세션 스토리지에서 확인
    const sessionEmail = sessionStorage.getItem('userEmail');
    if (sessionEmail) {
        return sessionEmail;
    }
    
    // 방법 3: 쿠키에서 확인
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'userEmail' && value) {
            return decodeURIComponent(value);
        }
    }
    
    // 방법 4: URL 파라미터에서 확인
    const urlParams = new URLSearchParams(window.location.search);
    const urlEmail = urlParams.get('email');
    if (urlEmail) {
        return urlEmail;
    }
    
    // 방법 5: window 객체에서 확인 (서버에서 주입한 경우)
    if (window.userEmail) {
        return window.userEmail;
    }
    
    return null;
}

// F12 비활성화 대상 이메일 목록
const DISABLED_F12_EMAILS = ['dragon63503514@gmail.com'];

// F12 비활성화 여부 확인
function shouldDisableF12() {
    const userEmail = getUserEmail();
    if (!userEmail) return false;
    
    return DISABLED_F12_EMAILS.includes(userEmail.toLowerCase().trim());
}

// 개발자 도구 단축키 방지 함수
function preventDevTools(e) {
    if (!isGalleryMode) return;
    
    // 특정 이메일 계정일 때만 F12 비활성화
    if (!shouldDisableF12()) return;
    
    // F12
    if (e.keyCode === 123 || e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    // Ctrl+Shift+I (개발자 도구)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.keyCode === 73 || e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    // Ctrl+Shift+J (콘솔)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.keyCode === 74 || e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    // Ctrl+Shift+C (요소 선택)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.keyCode === 67 || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    // Ctrl+Shift+K (Firefox 콘솔)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.keyCode === 75 || e.key === 'K' || e.key === 'k')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    // Ctrl+U (소스 보기)
    if ((e.ctrlKey || e.metaKey) && (e.keyCode === 85 || e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    // Ctrl+S (저장)
    if ((e.ctrlKey || e.metaKey) && (e.keyCode === 83 || e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    // Ctrl+P (인쇄)
    if ((e.ctrlKey || e.metaKey) && (e.keyCode === 80 || e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    // Ctrl+Shift+Delete (개발자 도구 - 일부 브라우저)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 46) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
}

// 개발자 도구 감지 및 차단 (다중 방법)
function detectDevTools() {
    if (!isGalleryMode) return;
    
    // 특정 이메일 계정일 때만 개발자 도구 감지
    if (!shouldDisableF12()) return;
    
    // 방법 1: 창 크기 변화 감지
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    if (widthThreshold || heightThreshold) {
        window.location.reload();
        return;
    }
    
    // 방법 2: 디버거 감지 (개발자 도구가 열려있으면 실행 시간이 길어짐)
    const start = performance.now();
    debugger;
    const end = performance.now();
    if (end - start > 100) {
        window.location.reload();
        return;
    }
}

// 콘솔 오픈 감지 (고급)
function detectConsoleOpen() {
    // 특정 이메일 계정일 때만 콘솔 감지
    if (!shouldDisableF12()) return;
    
    const threshold = 160;
    let devtoolsOpen = false;
    
    const checkInterval = setInterval(() => {
        if (!isGalleryMode || !shouldDisableF12()) {
            clearInterval(checkInterval);
            return;
        }
        
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                window.location.reload();
            }
        } else {
            devtoolsOpen = false;
        }
    }, 500);
    
    // 콘솔 함수 오버라이드
    const noop = () => {};
    const methods = ['log', 'debug', 'info', 'warn', 'error', 'assert', 'dir', 'dirxml', 
                     'group', 'groupEnd', 'time', 'timeEnd', 'count', 'trace', 'profile', 'profileEnd'];
    
    methods.forEach(method => {
        if (window.console && window.console[method]) {
            const original = window.console[method];
            window.console[method] = function() {
                if (isGalleryMode && shouldDisableF12()) {
                    window.location.reload();
                }
                original.apply(console, arguments);
            };
        }
    });
}

// 이미지 갤러리 시작
function startImageGallery(event, type = 'official') {
    if (isGalleryMode) return; // 이미 갤러리 모드면 무시
    
    isGalleryMode = true;
    
    // 갤러리 모드에서 우클릭 및 선택 방지
    document.addEventListener('contextmenu', preventContextMenu, { passive: false });
    document.addEventListener('selectstart', preventSelect, { passive: false });
    document.addEventListener('keydown', preventDevTools, { passive: false });
    document.addEventListener('keyup', preventDevTools, { passive: false });
    document.addEventListener('keypress', preventDevTools, { passive: false });
    
    // 개발자 도구 감지 초기화
    detectConsoleOpen();
    
    // 개발자 도구 감지 (주기적으로 체크)
    if (devToolsInterval) {
        clearInterval(devToolsInterval);
    }
    devToolsInterval = setInterval(() => {
        if (isGalleryMode) {
            detectDevTools();
        } else {
            if (devToolsInterval) {
                clearInterval(devToolsInterval);
                devToolsInterval = null;
            }
        }
    }, 200);
    const x = event.clientX;
    const y = event.clientY;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // 클릭 위치를 퍼센트로 변환
    const clickXPercent = (x / windowWidth) * 100;
    const clickYPercent = (y / windowHeight) * 100;
    
    // CSS 변수 설정
    const root = document.documentElement;
    root.style.setProperty('--gallery-click-x', clickXPercent + '%');
    root.style.setProperty('--gallery-click-y', clickYPercent + '%');
    
    // 원형 마스크 애니메이션 시작
    const body = document.body;
    body.classList.add('gallery-mode');
    
    // 나가기 버튼 생성 및 추가
    if (!exitButton) {
        exitButton = document.createElement('button');
        exitButton.className = 'gallery-exit-button';
        exitButton.textContent = 'Exit';
        // exit 버튼 클릭 핸들러 - 현재 상태에 따라 적절한 함수 호출
        exitButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isGalleryMode) {
                returnToSelectionMenu();
            } else if (isMenuMode) {
                hideSelectionMenu();
            }
        }, { passive: false });
        exitButton.style.pointerEvents = 'auto';
        exitButton.style.zIndex = '1000';
        document.body.appendChild(exitButton);
    } else {
        // 이미 존재하면 표시
        exitButton.style.pointerEvents = 'auto';
        exitButton.style.zIndex = '1000';
    }
    
    // 선택된 타입에 따라 이미지 목록 설정
    if (type === 'official') {
        imageList = [...officialImages];
    } else if (type === 'fanwork') {
        imageList = [...fanWorkImages];
    } else {
        if (imageList.length === 0) {
            initializeImageList();
            imageList = [...officialImages, ...fanWorkImages];
        }
    }
    
    // 사용된 이미지 초기화
    usedImages = [];
    
    // 페이징 초기화
    currentPage = 0;
    preloadedPageCount = 0;
    
    // 첫 페이지 이미지 프리로드
    preloadPageImages(0);
    
    // 첫 번째 이미지 표시
    requestAnimationFrame(() => {
        setTimeout(() => {
            showNextImage();
        }, 800); // 마스크 애니메이션 완료 후 이미지 표시
    });
}

// 다음 이미지 표시
function showNextImage() {
    if (!isGalleryMode) return;
    
    // 사용 가능한 이미지가 없으면 출처 표시 후 원래 페이지로 복귀
    if (usedImages.length >= imageList.length) {
        showCredits();
        return;
    }
    
    // 사용되지 않은 이미지 중 랜덤 선택
    const availableCount = imageList.length - usedImages.length;
    if (availableCount === 0) {
        showCredits();
        return;
    }
    
    let randomIndex;
    let selectedImageObj;
    let attempts = 0;
    const maxAttempts = 100; // 무한 루프 방지
    
    // 중복되지 않는 이미지 선택
    do {
        randomIndex = Math.floor(Math.random() * imageList.length);
        selectedImageObj = imageList[randomIndex];
        attempts++;
    } while (usedImages.some(used => used.path === selectedImageObj.path) && attempts < maxAttempts);
    
    // 사용된 이미지 목록에 추가
    usedImages.push(selectedImageObj);
    currentImageIndex = usedImages.length - 1;
    
    // 현재 페이지 계산 및 다음 페이지 프리로드
    const newPage = Math.floor(usedImages.length / IMAGES_PER_PAGE);
    if (newPage > currentPage) {
        currentPage = newPage;
        // 다음 페이지 프리로드
        preloadPageImages(currentPage + 1);
    }
    
    // 이미지 컨테이너 생성 또는 업데이트
    if (!imageContainer) {
        imageContainer = document.createElement('div');
        imageContainer.id = 'gallery-image-container';
        imageContainer.className = 'gallery-image-container';
        document.body.appendChild(imageContainer);
    }
    
    // 프리로드된 이미지 사용 또는 새로 로드
    const preloadedImg = preloadedImages.get(selectedImageObj.path);
    
    if (preloadedImg && preloadedImg.complete) {
        // 프리로드된 이미지 사용
        displayImage(selectedImageObj.path, preloadedImg);
    } else {
        // 이미지 로드 후 표시
        preloadImage(selectedImageObj.path).then((img) => {
            if (isGalleryMode) {
                displayImage(selectedImageObj.path, img);
            }
        }).catch(() => {
            // 이미지 로드 실패 시 다음 이미지로
            if (isGalleryMode) {
                galleryTimeout = setTimeout(() => {
                    showNextImage();
                }, 100);
            }
        });
    }
}

// 이미지 표시 함수 
function displayImage(src, imgElement) {
    if (!isGalleryMode || !imageContainer) return;
    
    // 기존 이미지 제거 
    const existingImg = imageContainer.querySelector('.gallery-image');
    const hasExistingImg = !!existingImg;
    
    if (existingImg) {
        existingImg.classList.add('fade-out');
        // 애니메이션 완료 후 제거
        requestAnimationFrame(() => {
            setTimeout(() => {
                if (existingImg.parentNode) {
                    existingImg.remove();
                }
            }, 600);
        });
    }
    
    // 새 이미지 요소 생성
    const img = imgElement || document.createElement('img');
    if (!imgElement) {
        img.src = src;
    }
    img.className = 'gallery-image';
    img.alt = 'Gallery Image';
    
    // 이미지 다운로드 방지
    img.draggable = false;
    img.addEventListener('dragstart', (e) => {
        e.preventDefault();
        return false;
    });
    img.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });
    img.addEventListener('selectstart', (e) => {
        e.preventDefault();
        return false;
    });
    
    // 새 이미지 추가 타이밍 조정
    const addNewImage = () => {
        if (!isGalleryMode || !imageContainer) return;
        
        img.classList.add('fade-in');
        imageContainer.appendChild(img);
        
        // 2.5초 후 다음 이미지로 전환
        if (galleryTimeout) {
            clearTimeout(galleryTimeout);
        }
        galleryTimeout = setTimeout(() => {
            showNextImage();
        }, 2500);
    };
    
    if (hasExistingImg) {
        // 기존 이미지가 있으면 fade-out 완료 후 추가 
        requestAnimationFrame(() => {
            setTimeout(() => {
                addNewImage();
            }, 600);
        });
    } else {
        // 기존 이미지가 없으면 바로 추가
        requestAnimationFrame(() => {
            addNewImage();
        });
    }
}

// 출처 표시
function showCredits() {
    if (!isGalleryMode) return;
    
    // 기존 이미지 제거
    if (imageContainer) {
        const existingImg = imageContainer.querySelector('.gallery-image');
        if (existingImg) {
            existingImg.classList.add('fade-out');
            requestAnimationFrame(() => {
                setTimeout(() => {
                    if (existingImg.parentNode) {
                        existingImg.remove();
                    }
                    // 이미지 제거 후 출처 표시
                    displayCredits();
                }, 600);
            });
        } else {
            displayCredits();
        }
    } else {
        displayCredits();
    }
}

// 출처 정보 표시
function displayCredits() {
    if (!isGalleryMode) return;
    
    // 이미지 컨테이너 숨기기
    if (imageContainer) {
        imageContainer.style.display = 'none';
    }
    
    // 크레딧 페이지 컨테이너 생성
    const creditsPage = document.createElement('div');
    creditsPage.className = 'credits-page';
    document.body.appendChild(creditsPage);
    
    // 크레딧 스크롤 컨테이너
    const creditsScroll = document.createElement('div');
    creditsScroll.className = 'credits-scroll';
    creditsPage.appendChild(creditsScroll);
    
    // 제목
    const title = document.createElement('div');
    title.className = 'credits-title';
    title.textContent = '이미지 출처';
    creditsScroll.appendChild(title);
    
    // 중복 제거를 위한 Set 사용
    const uniqueArtists = new Set();
    const artistSourceMap = new Map();
    
    usedImages.forEach(imgObj => {
        if (imgObj.artist && imgObj.artist !== '작가명' && imgObj.artist.trim() !== '') {
            uniqueArtists.add(imgObj.artist);
            if (imgObj.source && imgObj.source !== '출처' && imgObj.source.trim() !== '') {
                artistSourceMap.set(imgObj.artist, imgObj.source);
            }
        }
    });
    
    if (uniqueArtists.size === 0) {
        // 출처 정보가 없으면 바로 복귀
        creditsPage.remove();
        if (imageContainer) {
            imageContainer.style.display = '';
        }
        setTimeout(() => {
            returnToMainPage();
        }, 1000);
        return;
    }
    
    // 작가 정보 표시
    uniqueArtists.forEach(artist => {
        const artistItem = document.createElement('div');
        artistItem.className = 'credits-artist-item';
        
        const artistName = document.createElement('div');
        artistName.className = 'credits-artist-name';
        artistName.textContent = artist;
        artistItem.appendChild(artistName);
        
        const source = artistSourceMap.get(artist);
        if (source) {
            const sourceText = document.createElement('div');
            sourceText.className = 'credits-source';
            sourceText.textContent = source;
            artistItem.appendChild(sourceText);
        }
        
        creditsScroll.appendChild(artistItem);
    });
    
    // 크레딧 스크롤 시간 계산 
    const scrollDuration = Math.max(5000, uniqueArtists.size * 2000 + 3000);
    
    // CSS 변수로 애니메이션 duration 설정
    creditsScroll.style.setProperty('--credits-duration', `${scrollDuration}ms`);
    
    // 크레딧 페이지 표시
    requestAnimationFrame(() => {
        creditsPage.classList.add('active');
        // 약간의 딜레이 후 스크롤 시작
        setTimeout(() => {
            creditsScroll.classList.add('scroll-up');
        }, 100);
    });
    
    // 크레딧이 모두 올라간 후 원래 페이지로 복귀
    setTimeout(() => {
        // 크레딧 페이지 fade-out과 동시에 원래 페이지가 서서히 나타나도록
        creditsPage.classList.remove('active');
        creditsPage.classList.add('fade-out');
        
        // 원래 페이지가 서서히 나타나도록 gallery-exit 애니메이션 시작
        const body = document.body;
        body.classList.remove('gallery-mode');
        body.classList.add('gallery-exit');
        
        // 크레딧 페이지 제거 및 정리
        setTimeout(() => {
            creditsPage.remove();
            if (imageContainer) {
                imageContainer.style.display = '';
            }
            // 애니메이션 완료 후 클래스 제거
            setTimeout(() => {
                body.classList.remove('gallery-exit');
                isGalleryMode = false;
            }, 1000);
        }, 1000);
    }, scrollDuration + 1000);
}

// 선택 메뉴로 복귀
function returnToSelectionMenu() {
    if (!isGalleryMode) return;
    
    // 갤러리 모드 해제
    isGalleryMode = false;
    
    // 이벤트 리스너 제거
    document.removeEventListener('contextmenu', preventContextMenu);
    document.removeEventListener('selectstart', preventSelect);
    document.removeEventListener('keydown', preventDevTools);
    document.removeEventListener('keyup', preventDevTools);
    document.removeEventListener('keypress', preventDevTools);
    
    // 개발자 도구 감지 interval 정리
    if (devToolsInterval) {
        clearInterval(devToolsInterval);
        devToolsInterval = null;
    }
    
    // 타이머 정리
    if (galleryTimeout) {
        clearTimeout(galleryTimeout);
        galleryTimeout = null;
    }
    
    // 이미지 컨테이너 제거
    if (imageContainer) {
        const images = imageContainer.querySelectorAll('.gallery-image');
        images.forEach(img => {
            img.classList.add('fade-out');
        });
        setTimeout(() => {
            if (imageContainer && imageContainer.parentNode) {
                imageContainer.remove();
                imageContainer = null;
            }
        }, 600);
    }
    
    // 나가기 버튼 제거
    if (exitButton) {
        exitButton.style.opacity = '0';
        setTimeout(() => {
            if (exitButton && exitButton.parentNode) {
                exitButton.remove();
                exitButton = null;
            }
        }, 300);
    }
    
    // 갤러리 모드 해제
    const body = document.body;
    body.classList.remove('gallery-mode');
    body.classList.remove('gallery-exit');
    
    // 선택 메뉴 다시 표시
    setTimeout(() => {
        showSelectionMenu({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 });
    }, 500);
}

// 원래 페이지로 복귀
function returnToMainPage() {
    // 이미 복귀 중이면 무시
    if (!isGalleryMode) return;
    
    isGalleryMode = false;
    isMenuMode = false; // 메뉴 모드도 해제
    
    // 이벤트 리스너 제거
    document.removeEventListener('contextmenu', preventContextMenu);
    document.removeEventListener('selectstart', preventSelect);
    document.removeEventListener('keydown', preventDevTools);
    document.removeEventListener('keyup', preventDevTools);
    document.removeEventListener('keypress', preventDevTools);
    
    // 개발자 도구 감지 interval 정리
    if (devToolsInterval) {
        clearInterval(devToolsInterval);
        devToolsInterval = null;
    }
    
    // 타이머 정리
    if (galleryTimeout) {
        clearTimeout(galleryTimeout);
        galleryTimeout = null;
    }
    
    // 나가기 버튼 제거
    if (exitButton) {
        exitButton.style.opacity = '0';
        setTimeout(() => {
            if (exitButton && exitButton.parentNode) {
                exitButton.remove();
                exitButton = null;
            }
        }, 300);
    }
    
    // 갤러리 모드 해제
    const body = document.body;
    body.classList.remove('gallery-mode');
    body.classList.remove('menu-mode'); // 메뉴 모드 클래스도 제거
    body.classList.add('gallery-exit');
    
    // 이미지 컨테이너도 배경과 함께 서서히 사라지게
    if (imageContainer) {
        // 이미지 컨테이너 내부의 모든 이미지에 fade-out 적용
        const images = imageContainer.querySelectorAll('.gallery-image');
        images.forEach(img => {
            img.classList.add('fade-out');
        });
        
        // 출처 컨테이너도 fade-out 적용
        const credits = imageContainer.querySelector('.gallery-credits');
        if (credits) {
            credits.classList.add('fade-out');
        }
        
        // 이미지 컨테이너 자체도 fade-out
        imageContainer.classList.add('fade-out');
        
        // 배경 애니메이션과 동시에 시작하여 1초 후 제거
        requestAnimationFrame(() => {
            setTimeout(() => {
                if (imageContainer.parentNode) {
                    imageContainer.remove();
                }
                imageContainer = null; // 참조 제거
            }, 1000);
        });
    }
    
    // 애니메이션 완료 후 클래스 제거
    setTimeout(() => {
        body.classList.remove('gallery-exit');
    }, 1000);
    
    // 프리로드 캐시 정리
}

// 이벤트 리스너
document.addEventListener('click', handleDoubleClick, { passive: true });

// 별 생성 초기화
createStars();

// 이미지 목록 초기화
initializeImageList();

