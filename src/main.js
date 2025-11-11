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
        this.adaptiveInterval = 200; // 기본 체크 간격 증가
    }
    
    update() {
        this.frameCount++;
        const currentTime = performance.now();
        
        // 1초마다 FPS 계산
        if (currentTime >= this.lastTime + 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // FPS에 따라 체크 간격 조절
            if (this.fps < 30) {
                this.adaptiveInterval = 300; // 낮은 FPS일 때 간격 대폭 증가
            } else if (this.fps < 45) {
                this.adaptiveInterval = 200;
            } else if (this.fps < 55) {
                this.adaptiveInterval = 150;
            } else {
                this.adaptiveInterval = 120; // 높은 FPS일 때 간격 감소
            }
        }
        
        return this.adaptiveInterval;
    }
    
    getInterval() {
        return this.adaptiveInterval;
    }
}

const performanceMonitor = new PerformanceMonitor();

// 별 생성 
function createStars() {
    const starfield = document.getElementById('starfield');
    const starCount = 175; 
    
    // DocumentFragment 사용하여 DOM 조작 최소화
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // 별 크기 랜덤 선택
        const size = Math.random();
        if (size > 0.7) {
            star.classList.add('large');
        } else if (size > 0.4) {
            star.classList.add('medium');
        }
        
        // 랜덤 위치
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        star.style.left = left + '%';
        star.style.top = top + '%';
        
        // 랜덤 애니메이션 딜레이
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (Math.random() * 2 + 2) + 's';
        
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
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // 픽셀 단위로 거리를 계산하기 위해 기준값 설정 (한 번만 계산)
    const maxDimension = Math.max(windowWidth, windowHeight);
    const maxDimensionPercent = maxDimension / 100; // 퍼센트를 픽셀으로 변환하는 상수
    
    // 클릭 위치를 퍼센트로 변환 (한 번만 계산)
    const clickXPercent = (clickX / windowWidth) * 100;
    const clickYPercent = (clickY / windowHeight) * 100;
    
    // 파동의 가장자리 근처에 있는 별 감지 (파동 굴곡과 만나는 지점)
    const waveThickness = maxDimension * 0.06; // 파동 두께 증가 (5% → 6% - 더 넓은 범위로 체크 빈도 감소)
    const innerRadius = currentRadius - waveThickness;
    const outerRadius = currentRadius + waveThickness;
    
    // 퍼센트 단위로 반경 계산
    const innerRadiusPercent = innerRadius / maxDimensionPercent;
    const outerRadiusPercent = outerRadius / maxDimensionPercent;
    
    // 배치 처리로 DOM 조작 최소화
    const starsToSparkle = [];
    
    // 별 데이터를 사용하여 계산
    for (let i = 0; i < starData.length; i++) {
        const starInfo = starData[i];
        const star = starInfo.element;
        
        // 이미 반짝임 중인 별은 건너뛰기
        if (star.classList.contains('sparkle')) continue;
        
        // 퍼센트 단위로 거리 계산 (제곱으로 비교 - Math.sqrt 제거)
        const dx = starInfo.leftPercent - clickXPercent;
        const dy = starInfo.topPercent - clickYPercent;
        const distancePercentSquared = dx * dx + dy * dy;
        
        // 제곱으로 비교 (Math.sqrt 제거로 성능 향상)
        const innerRadiusSquared = innerRadiusPercent * innerRadiusPercent;
        const outerRadiusSquared = outerRadiusPercent * outerRadiusPercent;
        
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
            }, 600); // 500ms → 600ms (애니메이션 시간과 일치)
        });
    }
}

// 클릭 중복 방지
let isAnimating = false;

// Ripple 효과 생성 - 물방울 떨어뜨리는 느낌
function createRipple(event) {
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
    
    // CSS 변수로 클릭 위치 설정 (배경 파동 효과를 위한 중심점)
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
        // 직접 픽셀 값 설정 (calc() 대신)
        waveLayer.style.setProperty('--max-size', maxSize + 'px');
        // transform은 CSS에서 처리하므로 여기서는 제거
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
    
    // 기존 wave 클래스 제거 (중복 방지)
    background.classList.remove('wave');
    starfield.classList.remove('wave');
    
    // 강제 리플로우 후 클래스 추가
    void background.offsetWidth;
    void starfield.offsetWidth;
    
    background.classList.add('wave');
    starfield.classList.add('wave');
    
    // 별 반짝임 효과 - 파동이 퍼져나가는 동안
    const maxRadius = Math.max(windowWidth, windowHeight) * 1.5;
    const totalDuration = 2100; // 애니메이션 시간 조정 (2200 → 2100, CSS와 동기화)
    const startTime = performance.now();
    let animationFrameId = null;
    let lastCheckTime = 0;
    let frameSkipCount = 0;
    let isActive = true;
    
    // requestAnimationFrame을 사용하여 부드러운 애니메이션
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
            // 프레임 레이트 모니터링 업데이트 (간격 조절)
            const adaptiveInterval = performanceMonitor.update();
            
            // 적응형 체크 간격 사용 (성능에 따라 자동 조절)
            if (currentTime - lastCheckTime >= adaptiveInterval) {
                const progress = elapsed / totalDuration; // Math.min 제거
                const currentRadius = maxRadius * progress;
                
                // 프레임 드롭 감지 시 별 체크 건너뛰기 (더 적극적으로 - 5프레임마다 체크)
                const shouldCheck = performanceMonitor.fps >= 45 || frameSkipCount % 5 === 0;
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
        // 별바다 애니메이션은 이미 처리됨 (background와 함께 처리)
    };
    
    // 애니메이션 종료 이벤트 리스너 등록
    background.addEventListener('animationend', handleAnimationEnd, { once: true });
    starfield.addEventListener('animationend', handleStarfieldEnd, { once: true });
    
    // 리플라이프 안전장치 (최대 3초 후 자동 제거)
    const cleanupTimer = setTimeout(() => {
        if (background.classList.contains('wave')) {
            background.removeEventListener('animationend', handleAnimationEnd);
            starfield.removeEventListener('animationend', handleStarfieldEnd);
            
            requestAnimationFrame(() => {
                ripple.remove();
                // 모든 파장 레이어 제거 (배치 처리)
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

// 이미지 작가 정보 매핑 (파일명: 작가명)
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
        const folderName = path.split('/')[2]; // 'fan work/@kikokiko612/...' 형식
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
const DOUBLE_CLICK_DELAY = 300; // 더블 클릭 감지 시간 (ms)

function handleDoubleClick(event) {
    const currentTime = performance.now(); // Date.now() 대신 performance.now() 사용
    
    // 더블 클릭 감지 (300ms 이내)
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
    if (isMenuMode || isGalleryMode) return; // 이미 메뉴 모드이거나 갤러리 모드면 무시
    
    isMenuMode = true;
    
    // 이미지 목록 초기화
    if (officialImages.length === 0 || fanWorkImages.length === 0) {
        initializeImageList();
    }
    
    // 제목 숨기기
    document.body.classList.add('menu-mode');
    
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
    
    if (selectionMenu) {
        selectionMenu.classList.remove('active');
        setTimeout(() => {
            if (selectionMenu && !selectionMenu.classList.contains('active')) {
                selectionMenu.remove();
                selectionMenu = null;
            }
        }, 400); // transition duration과 맞춤
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

// 이미지 갤러리 시작
function startImageGallery(event, type = 'official') {
    if (isGalleryMode) return; // 이미 갤러리 모드면 무시
    
    isGalleryMode = true;
    const x = event.clientX;
    const y = event.clientY;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // 클릭 위치를 퍼센트로 변환 (한 번만 계산)
    const clickXPercent = (x / windowWidth) * 100;
    const clickYPercent = (y / windowHeight) * 100;
    
    // CSS 변수 설정 (배치 처리)
    const root = document.documentElement;
    root.style.setProperty('--gallery-click-x', clickXPercent + '%');
    root.style.setProperty('--gallery-click-y', clickYPercent + '%');
    
    // 원형 마스크 애니메이션 시작
    const body = document.body;
    body.classList.add('gallery-mode');
    
    // 선택된 타입에 따라 이미지 목록 설정
    if (type === 'official') {
        imageList = [...officialImages];
    } else if (type === 'fanwork') {
        imageList = [...fanWorkImages];
    } else {
        // 기본값 (기존 호환성)
        if (imageList.length === 0) {
            initializeImageList();
            imageList = [...officialImages, ...fanWorkImages];
        }
    }
    
    // 사용된 이미지 초기화
    usedImages = [];
    
    // 이미지 프리로드 시작
    if (imageList.length > 0) {
        imageList.forEach(imgObj => {
            preloadImage(imgObj.path).catch(() => {
                // 이미지 로드 실패 시 무시
            });
        });
    }
    
    // 첫 번째 이미지 표시 (requestAnimationFrame 사용)
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
    
    // 사용되지 않은 이미지 중 랜덤 선택 (filter 대신 직접 계산)
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
    
    // 이미지 컨테이너 생성 또는 업데이트 (캐싱 활용)
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

// 이미지 표시 함수 (DOM 조작 최소화)
function displayImage(src, imgElement) {
    if (!isGalleryMode || !imageContainer) return;
    
    // 기존 이미지 제거 (배치 처리)
    const existingImg = imageContainer.querySelector('.gallery-image');
    const hasExistingImg = !!existingImg;
    
    if (existingImg) {
        existingImg.classList.add('fade-out');
        // 애니메이션 완료 후 제거 (600ms = fade-out 애니메이션 시간)
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
        // 기존 이미지가 있으면 fade-out 완료 후 추가 (600ms)
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
    
    // 크레딧 스크롤 시간 계산 (작가 수에 따라 조정)
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

// 원래 페이지로 복귀
function returnToMainPage() {
    // 이미 복귀 중이면 무시
    if (!isGalleryMode) return;
    
    isGalleryMode = false;
    isMenuMode = false; // 메뉴 모드도 해제
    
    // 타이머 정리
    if (galleryTimeout) {
        clearTimeout(galleryTimeout);
        galleryTimeout = null;
    }
    
    // 갤러리 모드 해제 (원형 마스크 역방향 애니메이션)
    const body = document.body;
    body.classList.remove('gallery-mode');
    body.classList.remove('menu-mode'); // 메뉴 모드 클래스도 제거
    body.classList.add('gallery-exit');
    
    // 이미지 컨테이너도 배경과 함께 서서히 사라지게 (1초 = 배경 애니메이션 시간)
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
                imageContainer = null; // 참조 제거 (메모리 최적화)
            }, 1000);
        });
    }
    
    // 애니메이션 완료 후 클래스 제거
    setTimeout(() => {
        body.classList.remove('gallery-exit');
    }, 1000);
    
    // 프리로드 캐시 정리 (메모리 최적화 - 선택적)
    // preloadedImages.clear(); // 필요시 주석 해제
}

// 이벤트 리스너
document.addEventListener('click', handleDoubleClick, { passive: true });

// 별 생성 초기화
createStars();

// 이미지 목록 초기화
initializeImageList();

