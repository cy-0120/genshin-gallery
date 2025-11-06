// CSS 파일 import
import './styles.css';

// 별 데이터 저장 (성능 최적화)
const starData = [];

// 프레임 레이트 모니터링 및 성능 최적화
class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        this.adaptiveInterval = 200; // 기본 체크 간격 증가 (성능 최적화)
    }
    
    update() {
        this.frameCount++;
        const currentTime = performance.now();
        
        // 1초마다 FPS 계산
        if (currentTime >= this.lastTime + 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // FPS에 따라 체크 간격 조절 (성능 최적화 - 더 적극적으로)
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

// 별 생성 (성능 최적화 - DocumentFragment 사용)
function createStars() {
    const starfield = document.getElementById('starfield');
    const starCount = 200;
    
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
        
        // 별 데이터 저장 (성능 최적화)
        starData.push({
            element: star,
            leftPercent: left,
            topPercent: top
        });
        
        fragment.appendChild(star);
    }
    
    // 한 번에 모든 별 추가 (성능 최적화)
    starfield.appendChild(fragment);
}

// 별 반짝임 체크 함수 (성능 최적화 - 최적화된 계산)
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
    const waveThickness = maxDimension * 0.05; // 파동 두께 (화면의 5%)
    const innerRadius = currentRadius - waveThickness;
    const outerRadius = currentRadius + waveThickness;
    
    // 퍼센트 단위로 반경 계산 (성능 최적화)
    const innerRadiusPercent = innerRadius / maxDimensionPercent;
    const outerRadiusPercent = outerRadius / maxDimensionPercent;
    
    // 배치 처리로 DOM 조작 최소화
    const starsToSparkle = [];
    
    // 별 데이터를 사용하여 계산 (성능 최적화)
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
    
    // 배치로 한 번에 처리 (성능 최적화)
    if (starsToSparkle.length > 0) {
        starsToSparkle.forEach(star => {
            star.classList.add('sparkle');
            
            // 애니메이션 종료 후 클래스 제거
            setTimeout(() => {
                if (star.classList.contains('sparkle')) {
                    star.classList.remove('sparkle');
                }
            }, 600);
        });
    }
}

// 클릭 중복 방지 (성능 최적화)
let isAnimating = false;

// Ripple 효과 생성 - 물방울 떨어뜨리는 느낌
function createRipple(event) {
    // 애니메이션 중이면 무시 (성능 최적화)
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
    
    // 물결 파장 레이어 생성 (효과 강화: 2개 생성 + 성능 최적화)
    const maxDimension = Math.max(windowWidth, windowHeight);
    const waveCount = 2; // 파장 개수 2개 (시각적 효과 강화)
    const maxSize = maxDimension * 2;
    
    // DocumentFragment 사용하여 DOM 조작 최소화 (성능 최적화)
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < waveCount; i++) {
        const waveLayer = document.createElement('div');
        waveLayer.className = 'wave-layer';
        waveLayer.style.left = clickXPercent + '%';
        waveLayer.style.top = clickYPercent + '%';
        waveLayer.style.animationDelay = (i * 0.4) + 's'; // 파장 순차 생성
        // 직접 픽셀 값 설정 (calc() 대신 - 성능 최적화)
        waveLayer.style.setProperty('--max-size', maxSize + 'px');
        // transform은 CSS에서 처리하므로 여기서는 제거
        fragment.appendChild(waveLayer);
        
        // 애니메이션 종료 후 제거
        setTimeout(() => {
            if (waveLayer.parentNode) {
                waveLayer.remove();
            }
        }, 2300 + (i * 400));
    }
    
    // 한 번에 모든 요소 추가 (성능 최적화)
    background.appendChild(fragment);
    
    // 기존 wave 클래스 제거 (중복 방지)
    background.classList.remove('wave');
    starfield.classList.remove('wave');
    
    // 강제 리플로우 후 클래스 추가
    void background.offsetWidth;
    void starfield.offsetWidth;
    
    background.classList.add('wave');
    starfield.classList.add('wave');
    
    // 별 반짝임 효과 - 파동이 퍼져나가는 동안 (성능 최적화)
    const maxRadius = Math.max(windowWidth, windowHeight) * 1.5;
    const totalDuration = 2300; // 애니메이션 시간 단축 (성능 최적화)
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
                const progress = elapsed / totalDuration; // Math.min 제거 (성능 최적화)
                const currentRadius = maxRadius * progress;
                
                // 프레임 드롭 감지 시 별 체크 건너뛰기 (더 적극적으로)
                const shouldCheck = performanceMonitor.fps >= 40 || frameSkipCount % 4 === 0;
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
    
    // 애니메이션 종료 감지 함수 (성능 최적화)
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

// 이벤트 리스너 (성능 최적화 - passive 옵션)
document.addEventListener('click', createRipple, { passive: true });

// 별 생성 초기화
createStars();

