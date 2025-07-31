// Основные переменные
let scene, camera, renderer;
let raycaster, pointer = new THREE.Vector2();

// placeholders to избежать ReferenceError до их создания позже
let factoryProgressDiv, factoryBankDiv;

// Анимация платформ
let mapPlatforms = [];
let platformLabels = [];
let isAnimating = false;
let selectedPlatform = null;
let clicksBlocked = false; // блокировка кликов при анимации
let originalPositions = [];
let originalScales = [];

// GLOBAL ORDERS ARRAY (delivery)
let orders=[];

// Инициализация сцены
function init() {
    // Создаем сцену
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd0d0d0);

    // Настраиваем камеру
    const aspect = window.innerWidth / window.innerHeight;
    const orthoSize = 8; // увеличиваем для лучшего обзора
    camera = new THREE.OrthographicCamera(
        -orthoSize * aspect,
        orthoSize * aspect,
        orthoSize,
        -orthoSize,
        0.1,
        1000
    );
    // Камера под углом 45 градусов к плоскости платформ
    camera.position.set(10, 10, 0);
    camera.lookAt(0, 0, 0); // смотрим в центр

    // Создаем рендерер
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.domElement.style.zIndex = '5'; // Увеличиваем z-index чтобы canvas был поверх всех элементов
    document.body.appendChild(renderer.domElement);

    // Отключаем управление камерой для фиксированного вида
    // cameraControllerInit();
    
    // Добавляем освещение
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(10, 20, 10);
    scene.add(dir);

    // === ПЛАТФОРМЫ КАРТЫ ===
    function createMapPlatforms(){
        const names=['library','factory','storage','print'];
        const positions=[
            new THREE.Vector3(0,1,3.5),  // Библиотека - верх (поднята)
            new THREE.Vector3(3.5,1,0),  // Завод - право (поднят)
            new THREE.Vector3(-3.5,1,0), // Хранилище - лево (поднято)
            new THREE.Vector3(0,1,-3.5)  // Типография - низ (поднята)
        ];
        names.forEach((n,i)=>{
            const geo=new THREE.BoxGeometry(4,0.2,4); // уменьшили высоту в 3 раза
            const mat=new THREE.MeshLambertMaterial({color:0x575757});
            const mesh=new THREE.Mesh(geo,mat);
            mesh.position.copy(positions[i]);
            mesh.rotation.y=Math.PI/4; // ромб сверху
            mesh.name=n;
            mesh.userData.isPlatform=true;
            scene.add(mesh);
            mapPlatforms.push(mesh);

            // Сохраняем оригинальные позиции и масштабы
            originalPositions.push(positions[i].clone());
            originalScales.push(new THREE.Vector3(1, 1, 1));

            // Объемный текст как будто напечатан на платформе
            const text = n==='print'?'Типография': (n==='library'?'Библиотека': n==='factory'?'Завод':'Хранилище');
            
            // Создаем 3D текст
            const textGeometry = new THREE.PlaneGeometry(3, 0.8);
            const textMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x000000,
                transparent: true,
                opacity: 0.9
            });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            
            // Позиционируем текст на платформе
            textMesh.position.set(positions[i].x, positions[i].y + 0.12, positions[i].z);
            textMesh.rotation.y = Math.PI/4; // поворачиваем как платформу
            textMesh.rotation.x = 0; // текст лежит ровно на платформе
            textMesh.rotation.z = 0;
            
            // Создаем canvas для текста и накладываем как текстуру
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 84px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, 256, 64);
            
            const texture = new THREE.CanvasTexture(canvas);
            textMaterial.map = texture;
            textMaterial.needsUpdate = true;
            
            scene.add(textMesh);
            platformLabels.push(textMesh);
        });
    }
    // Помещаем платформы
    createMapPlatforms();

    // Функции анимации платформ
    function animatePlatformsToCenter(selectedIndex) {
        console.log('animatePlatformsToCenter вызвана с индексом:', selectedIndex);
        if (isAnimating) {
            console.log('Анимация уже идет, выходим');
            return;
        }
        isAnimating = true;
        clicksBlocked = true; // блокируем клики
        selectedPlatform = selectedIndex;
        
        const duration = 800; // 800ms
        const startTime = Date.now();
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out
            
            mapPlatforms.forEach((platform, index) => {
                if (index === selectedIndex) {
                    // Выбранная платформа - зум и центр
                    const targetScale = 1.3;
                    const currentScale = 1 + (targetScale - 1) * easeProgress;
                    platform.scale.set(currentScale, currentScale, currentScale);
                    
                    // Центрируем выше, чтобы панель не перекрывала
                    const targetPos = new THREE.Vector3(0, 4.5, 0); // поднимаем выше
                    const currentPos = originalPositions[index].clone().lerp(targetPos, easeProgress);
                    platform.position.copy(currentPos);
                    
                    // Анимируем текст
                    if (platformLabels[index]) {
                        platformLabels[index].scale.set(currentScale, currentScale, currentScale);
                        platformLabels[index].position.copy(currentPos);
                        platformLabels[index].position.y = currentPos.y + 0.12;
                    }
                } else {
                    // Остальные платформы - разлетаются
                    const direction = originalPositions[index].clone().normalize();
                    const distance = 15;
                    const targetPos = direction.multiplyScalar(distance);
                    const currentPos = originalPositions[index].clone().lerp(targetPos, easeProgress);
                    platform.position.copy(currentPos);
                    
                    // Уменьшаем масштаб
                    const targetScale = 0.3;
                    const currentScale = 1 - (1 - targetScale) * easeProgress;
                    platform.scale.set(currentScale, currentScale, currentScale);
                    
                    // Анимируем текст
                    if (platformLabels[index]) {
                        platformLabels[index].position.copy(currentPos);
                        platformLabels[index].position.y = currentPos.y + 0.12;
                        platformLabels[index].scale.set(currentScale, currentScale, currentScale);
                    }
                }
            });
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                isAnimating = false;
            }
        }
        
        animate();
    }
    
    function animatePlatformsBack() {
        console.log('animatePlatformsBack вызвана');
        if (isAnimating) {
            console.log('Анимация уже идет, выходим');
            return;
        }
        isAnimating = true;
        clicksBlocked = true; // блокируем клики
        
        const duration = 600; // 600ms
        const startTime = Date.now();
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out
            
            mapPlatforms.forEach((platform, index) => {
                // Возвращаем в исходные позиции
                const currentPos = platform.position.clone().lerp(originalPositions[index], easeProgress);
                platform.position.copy(currentPos);
                
                // Возвращаем исходный масштаб
                const currentScale = 1 - (1 - platform.scale.x) * easeProgress;
                platform.scale.set(currentScale, currentScale, currentScale);
                
                // Анимируем текст
                if (platformLabels[index]) {
                    platformLabels[index].position.copy(currentPos);
                    platformLabels[index].position.y = currentPos.y + 0.12;
                    platformLabels[index].scale.set(currentScale, currentScale, currentScale);
                }
            });
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                console.log('Анимация возврата завершена');
                isAnimating = false;
                clicksBlocked = false; // разблокируем клики
                selectedPlatform = null;
            }
        }
        
        animate();
    }
    
    // Экспортируем функции для использования в HTML
    window.animatePlatformsToCenter = animatePlatformsToCenter;
    window.animatePlatformsBack = animatePlatformsBack;
    window.clicksBlocked = clicksBlocked; // экспортируем переменную блокировки

    // расширяем фрустум под карту
    function adjustFrustum(){
        const a = window.innerWidth / window.innerHeight;
        const view=12; // увеличиваем для лучшего обзора
        camera.top = view;
        camera.bottom = -view;
        camera.left = -view * a;
        camera.right = view * a;
        camera.updateProjectionMatrix();
    }
    adjustFrustum();

    function highlightPlatform(name){
        mapPlatforms.forEach(p=>{
            if(p.name===name){p.scale.set(1.2,1.2,1.2);}else{p.scale.set(0.001,0.001,0.001);} });
    }
    function showAllPlatforms(){mapPlatforms.forEach(p=>p.scale.set(1,1,1));}
    window.highlightPlatform=highlightPlatform;
    window.showAllPlatforms=showAllPlatforms;
    
    // Луч для кликов
    raycaster = new THREE.Raycaster();
    window.addEventListener('pointerdown', onPointerDown);

    // Обработчик изменения размера окна
    window.addEventListener('resize', onWindowResize, false);

    // После добавления объектов – центрируем камеру
    // fitCameraToScene();
}

// === CAMERA CONTROLLER (drag + zoom) ===
let isDragging = false, lastPos = { x: 0, y: 0 };
let zoom = 5, minZoom = 1, maxZoom = 5;

function cameraControllerInit() {
    // Отключаем управление камерой для фиксированного вида как на макете
    // window.addEventListener('pointerdown', (e) => { isDragging = true; lastPos.x = e.clientX; lastPos.y = e.clientY; });
    // window.addEventListener('pointermove', (e) => {
    //     if (!isDragging) return;
    //     const dx = (e.clientX - lastPos.x) * 0.08; // чувствительность *5
    //     const dy = (e.clientY - lastPos.y) * 0.1;
    //     lastPos.x = e.clientX;
    //     lastPos.y = e.clientY;

    //     // направления камеры в мировой системе
    //     const right = new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion).setY(0).normalize();
    //     const forward = new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion).setY(0).normalize();

    //     camera.position.addScaledVector(right, -dx);
    //     camera.position.addScaledVector(forward, dy);
    //     camera.updateMatrixWorld();
    //     clampCamera();
    // });
    // window.addEventListener('pointerup', () => { isDragging = false; });

    // window.addEventListener('wheel', (e) => {
    //     zoom += e.deltaY * 0.001;
    //     zoom = THREE.MathUtils.clamp(zoom, minZoom, maxZoom);
    //     camera.zoom = 5 / zoom;
    //     camera.updateProjectionMatrix();
    // }, { passive: true });
}

function clampCamera() { /* ограничения временно отключены */ }

// === CLICK HANDLING ===
function isAnyPanelOpen() {
    const panels = [
        'shop-panel',
        'characters-panel', 
        'city-panel',
        'tasks-panel',
        'profile-panel',
        'friends-panel',
        'inventory-panel'
    ];
    
    return panels.some(panelId => {
        const panel = document.getElementById(panelId);
        return panel && panel.style.display !== 'none';
    });
}

function onPointerDown(event) {
    // Блокируем клики во время анимации
    if (clicksBlocked) return;
    
    // Блокируем клики если открыта любая панель
    if (isAnyPanelOpen()) return;
    
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if(intersects.length>0){
        const obj=intersects[0].object;
        
        if(obj.userData && obj.userData.isPlatform){
            // Находим индекс платформы
            const platformIndex = mapPlatforms.findIndex(p => p.name === obj.name);
            if (platformIndex !== -1) {
                // Запускаем анимацию
                animatePlatformsToCenter(platformIndex);
                // Открываем панель
                if(window.platformClicked) window.platformClicked(obj.name);
            }
        }
    }
}

// === PANEL LOGIC ===
const panel = document.getElementById('upgrade-panel');
const closeBtn = document.getElementById('panel-close');
closeBtn.addEventListener('click', () => {
    panel.style.display = 'none';
    // Возвращаем платформы в исходное положение
    console.log('Закрытие панели, вызываем animatePlatformsBack');
    if (window.animatePlatformsBack) {
        window.animatePlatformsBack();
    } else {
        console.error('animatePlatformsBack не найдена!');
    }
});

// позиционируем панель по центру через CSS
panel.style.left = '50%';
panel.style.top = '50%';
panel.style.transform = 'translate(-50%, -50%)';

function openUpgradePanel() {
    panel.style.display = 'block';
}

// Обработчик изменения размера окна
function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const orthoSize = 1;
    camera.left = -orthoSize * aspect;
    camera.right = orthoSize * aspect;
    camera.top = orthoSize;
    camera.bottom = -orthoSize;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    adjustFrustum(); // обновляем фрустум при ресайзе
}

// === INCOME & UPGRADE LOGIC ===
let upgradesCount = parseInt(localStorage.getItem('upCnt')||'0');
let intermediateBalance = parseFloat(localStorage.getItem('interBal')||'0');
const costBase = 100;
const rateGrowth = 1.15;
const productionBase = 19.87;

// HTML элементы для круга
const incomeProgress = document.createElement('div');
incomeProgress.id = 'income-progress';
incomeProgress.style.cssText = 'position:absolute;width:70px;height:70px;border-radius:50%;background:conic-gradient(#4caf50 0deg, transparent 0deg);pointer-events:none;z-index:1;visibility:hidden;';
document.body.appendChild(incomeProgress);

// внутренний круг, чтобы оставалась только обводка
const incomeInner=document.createElement('div');
incomeInner.style.cssText='position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:60px;height:60px;border-radius:50%;background:#2b2b2b;pointer-events:none;';
incomeProgress.appendChild(incomeInner);

const incomeBank = document.createElement('div');
incomeBank.id = 'income-bank';
incomeBank.style.cssText = 'position:absolute;width:70px;height:70px;border-radius:50%;background:#8d0000;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;z-index:1;cursor:pointer;';
document.body.appendChild(incomeBank);

// === STORAGE SALE PROGRESS CIRCLE ===
const storageProgressDiv=document.createElement('div');
storageProgressDiv.id='storage-sale-progress';
storageProgressDiv.style.cssText='position:absolute;width:70px;height:70px;border-radius:50%;background:conic-gradient(#4caf50 0deg, transparent 0deg);display:none;pointer-events:none;z-index:1;visibility:hidden;';
document.body.appendChild(storageProgressDiv);
const storageInner=document.createElement('div');
storageInner.style.cssText='position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:60px;height:60px;border-radius:50%;background:#2b2b2b;pointer-events:none;';
storageProgressDiv.appendChild(storageInner);

incomeBank.addEventListener('click', () => {
    const newBal = getBalance()+intermediateBalance;
    setBalance(newBal);
    intermediateBalance = 0;
    window.intermediateBalance = 0; // обновляем глобальную переменную
    incomeBank.textContent = formatNumber(intermediateBalance);
    refreshUpgradeCost();
});

function formatNumber(value){
    const units=['','K','M','B','T'];
    const alphabetStart='a'.charCodeAt(0);
    if(value<0) return '-'+formatNumber(Math.abs(value));
    if(value<1) return value.toFixed(2);
    if(value<1000) return Math.floor(value).toString();

    const n=Math.floor(Math.log(value)/Math.log(1000));
    const m=value/Math.pow(1000,n);

    let unit='';
    if(n<units.length){
        unit=units[n];
    }else{
        const unitInt=n-units.length;
        const first=Math.floor(unitInt/26);
        const second=unitInt%26;
        unit=String.fromCharCode(alphabetStart+first)+String.fromCharCode(alphabetStart+second);
    }
    return (Math.floor(m*100)/100).toFixed(2).replace(/\.00$/,'').replace(/(\.\d)0$/,'$1')+unit;
}

function getIncomePerSecond(){
    if(upgradesCount===0) return 0;
    return productionBase * Math.pow(1.05, upgradesCount);
}

function getNextUpgradeCost(){
    return costBase * Math.pow(rateGrowth, upgradesCount);
}

// Прогресс анимация
let progress = 0;
setInterval(()=>{
    progress += 1;
    if(progress>=60){
        progress = 0;
        // начисляем доход
        const inc = getIncomePerSecond();
        intermediateBalance += inc;
        window.intermediateBalance = intermediateBalance; // обновляем глобальную переменную
        incomeBank.textContent = formatNumber(intermediateBalance);
    }
},1000/60);

function updateProgressVisual(){
    // всегда показываем; при 0-уровне просто не заполняем ободок
    incomeProgress.style.visibility='visible';
    const deg = upgradesCount===0 ? 0 : progress * 6; // 60fps => 360deg
    incomeProgress.style.background = `conic-gradient(#4caf50 ${deg}deg, transparent ${deg}deg)`;
}

// BALANCE helpers + persistence
function getBalance(){return parseFloat(localStorage.getItem('balance')||'100');}
function setBalance(v){localStorage.setItem('balance',v);document.getElementById('money-amount').textContent=formatNumber(v);document.getElementById('money-amount').dataset.val=v;document.getElementById('bc-value').textContent=formatNumber(v);}

// init balance from storage
setBalance(getBalance());

// Switch x1 / MAX
const switchWrapper = document.createElement('div');
switchWrapper.style.cssText='display:flex;gap:2px;margin-top:6px;';
panel.querySelector('#panel-content').appendChild(switchWrapper);

const btnX1 = document.createElement('button');
btnX1.textContent='x1';
btnX1.style.cssText='flex:1;background:#1976d2;border:none;color:#fff;border-radius:6px 0 0 6px;height:32px;cursor:pointer;font-weight:bold;';
const btnMax = document.createElement('button');
btnMax.textContent='MAX';
btnMax.style.cssText='flex:1;background:#000;border:none;color:#fff;border-radius:0 16px 16px 0;height:32px;cursor:pointer;font-weight:bold;';
switchWrapper.append(btnX1,btnMax);

let isMaxMode=false;
function updateSwitch(){
    if(isMaxMode){
        btnX1.style.background='#000';
        btnX1.style.opacity=0.4;
        btnMax.style.background='#1976d2';
        btnMax.style.opacity=1;
    }else{
        btnX1.style.background='#1976d2';
        btnX1.style.opacity=1;
        btnMax.style.background='#000';
        btnMax.style.opacity=0.4;
    }
}
btnX1.onclick=()=>{isMaxMode=false;updateSwitch();refreshUpgradeCost();};
btnMax.onclick=()=>{isMaxMode=true;updateSwitch();refreshUpgradeCost();};
updateSwitch();

// Upgrade button logic
const upgradeBtn = document.getElementById('upgrade-btn');
const levelLabel=document.getElementById('building-level');
const incomeLabel=document.getElementById('building-income');

function updateLevelAndIncome(){
    levelLabel.textContent=upgradesCount;
    incomeLabel.textContent=formatNumber(getIncomePerSecond());
}
updateLevelAndIncome();

function calcMaxAffordableCost(){
    let balance=getBalance();
    let tempUp=upgradesCount;
    let total=0;
    while(true){
        const c= costBase*Math.pow(rateGrowth,tempUp);
        if(balance>=c){total+=c;balance-=c;tempUp++;}
        else break;
    }
    return total>0?total:getNextUpgradeCost();
}

function refreshUpgradeCost(){
    const cost=isMaxMode?calcMaxAffordableCost():getNextUpgradeCost();
    upgradeBtn.querySelector('#upgrade-cost').textContent=formatNumber(cost);
    const afford=getBalance()>=cost;
    upgradeBtn.disabled=!afford;
    upgradeBtn.style.opacity=afford?1:0.5;
}

upgradeBtn.addEventListener('click',()=>{
    const startLvl=upgradesCount;
    let balance=getBalance();
    if(isMaxMode){
        while(balance>=getNextUpgradeCost()){
            const c=getNextUpgradeCost();
            balance-=c;
            upgradesCount++;
        }
    }else{
        const cost=getNextUpgradeCost();
        if(balance>=cost){
            balance-=cost;
            upgradesCount++;
        }
    }
    if(upgradesCount>startLvl){
        setBalance(balance);
        refreshUpgradeCost();
        updateLevelAndIncome();
        // XP суммой от (startLvl+1) до upgradesCount
        const n=upgradesCount-startLvl;
        const sumXP=(startLvl+1+upgradesCount)*n/2;
        addXP(sumXP);
    }
});

// LOAD saved upgradesCount
refreshUpgradeCost();
updateLevelAndIncome();

// save on change
function saveProgress(){localStorage.setItem('upCnt',upgradesCount);localStorage.setItem('interBal',intermediateBalance);}

setInterval(saveProgress,1000);

// RESET BUTTON
document.getElementById('reset-data').addEventListener('click',()=>{
    localStorage.clear();
    location.reload();
});

// === ANIMATE ===
function animate() {
    requestAnimationFrame(animate);
    updateProgressVisual();

    // позиционируем кружки над кубом
    const cube = scene.getObjectByName('library');
    if(cube){
        // позиция вершины куба (верхний центр)
        const topWorld = cube.position.clone();
        const halfH = (cube.geometry.parameters.height * cube.scale.y) / 2;
        topWorld.y += halfH;
        topWorld.project(camera);
        const sx = ( topWorld.x * 0.5 + 0.5) * window.innerWidth;
        const sy = ( -topWorld.y * 0.5 + 0.5) * window.innerHeight;
        incomeProgress.style.left = (sx-35)+'px'; // ширина 70 => радиус 35
        incomeProgress.style.top  = (sy-85)+'px'; // подняли на 50px выше
        incomeBank.style.left = (sx-35)+'px';
        incomeBank.style.top  = (sy-160)+'px'; // ещё выше над прогрессом
    }

    // позиционируем кружки над заводом
    const factoryObjRef = scene.getObjectByName('factory');
    if(factoryObjRef && factoryProgressDiv && factoryBankDiv){
        const top2=factoryObjRef.position.clone();
        const halfH2=(factoryObjRef.geometry.parameters.height*factoryObjRef.scale.y)/2;
        top2.y+=halfH2;
        top2.project(camera);
        const sx2=(top2.x*0.5+0.5)*window.innerWidth;
        const sy2=(-top2.y*0.5+0.5)*window.innerHeight;
        factoryProgressDiv.style.left=(sx2-35)+'px';
        factoryProgressDiv.style.top =(sy2-85)+'px';
        factoryBankDiv.style.left=(sx2-35)+'px';
        factoryBankDiv.style.top =(sy2-160)+'px';
    }

    // позиционируем кружок над хранилищем
    const storObj = scene.getObjectByName('storage');
    if(storObj && storageProgressDiv && storageProgressDiv.style.display!=='none'){
        const top3=storObj.position.clone();
        const halfH3=(storObj.geometry.parameters.height*storObj.scale.y)/2;
        top3.y+=halfH3;
        top3.project(camera);
        const sx3=(top3.x*0.5+0.5)*window.innerWidth;
        const sy3=(-top3.y*0.5+0.5)*window.innerHeight;
        storageProgressDiv.style.left=(sx3-35)+'px';
        storageProgressDiv.style.top =(sy3-85)+'px';
        if(selling){
            const elapsed=Date.now()-saleStartTime;
            let deg=0;
            if(saleDelayMs>0){deg=Math.min(360,(elapsed/saleDelayMs)*360);} 
            storageProgressDiv.style.background=`conic-gradient(#4caf50 ${deg}deg, transparent ${deg}deg)`;
        }
    }

    renderer.render(scene, camera);
}

// Центрирует ортографическую камеру так, чтобы вся сцена влезла в кадр
function fitCameraToScene() {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    // Ставим камеру по диагонали сверху (45°) и чуть выше
    const offset = maxDim * 1.2;
    // заменяем авто-подгон: фиксированная камера сверху
    camera.position.set(0,20,0);
    camera.lookAt(0,0,0);

    // Автоподбор zoom для ортокамеры
    const aspect = window.innerWidth / window.innerHeight;
    const frustumHeight = maxDim * 1.5;
    const frustumWidth = frustumHeight * aspect;

    camera.top = frustumHeight / 2;
    camera.bottom = -frustumHeight / 2;
    camera.left = -frustumWidth / 2;
    camera.right = frustumWidth / 2;
    camera.updateProjectionMatrix();
}

// === PLACEHOLDER UI FOR FACTORY CIRCLES (needed before animate starts)
factoryProgressDiv=document.createElement('div');
factoryProgressDiv.id='factory-income-progress';
factoryProgressDiv.style.cssText='position:absolute;width:70px;height:70px;border-radius:50%;background:conic-gradient(#2196f3 0deg, transparent 0deg);display:none;pointer-events:none;z-index:1;visibility:hidden;';
document.body.appendChild(factoryProgressDiv);
factoryBankDiv=document.createElement('div');
factoryBankDiv.id='factory-income-bank';
factoryBankDiv.style.cssText='position:absolute;width:70px;height:70px;border-radius:50%;background:#004ba0;display:none;align-items:center;justify-content:center;color:#fff;font-weight:bold;z-index:1;cursor:pointer;';
document.body.appendChild(factoryBankDiv);
// Запускаем приложение
init();
animate(); 
animate(); 

// ������������� ������� ��� �������� ����
renderTasks();
// credits plus click demo
document.getElementById('credits-plus').addEventListener('click',()=>{
    alert('Открыть магазин кредитов');
}); 

// handle bottom nav buttons open shop
document.querySelector('#bottom-nav button:nth-child(1)').addEventListener('click',()=>{
    if (isAnyPanelOpen()) return; // Блокируем если открыта любая панель
    setActiveNavButton(1);
    document.getElementById('shop-panel').style.display='block';
});
document.getElementById('shop-close').addEventListener('click',()=>{
    document.getElementById('shop-panel').style.display='none';
    setActiveNavButton(0); // сбрасываем активное состояние
}); 

// credits helpers
function getCredits(){return parseInt(localStorage.getItem('credits')||'0');}
function setCredits(v){localStorage.setItem('credits',v);document.getElementById('credits-amount').textContent=v;document.getElementById('rbc-value').textContent=v;}

// init credits display
setCredits(getCredits());

// === CRATES LOGIC ===
const crates={
    free :{cost:0,   lvlReq:4, money:[50,120],  credits:[0,0]},
    gold :{cost:30,  lvlReq:0, money:[400,800], credits:[2,5]},
    mystic:{cost:150,lvlReq:0, money:[1500,3000],credits:[8,15]}
};

function randRange(arr){const [min,max]=arr;return Math.floor(Math.random()*(max-min+1))+min;}

function openCrate(type){
    const cfg=crates[type];
    if(!cfg) return;
    if(cfg.lvlReq>0 && upgradesCount<cfg.lvlReq){alert(`Требуется уровень ${cfg.lvlReq}`);return;}
    if(cfg.cost>0 && getCredits()<cfg.cost){alert('Недостаточно RBC');return;}

    // списываем стоимость
    if(cfg.cost>0){setCredits(getCredits()-cfg.cost);}

    const moneyReward=randRange(cfg.money);
    const creditReward=randRange(cfg.credits);

    setBalance(getBalance()+moneyReward);
    if(creditReward>0) setCredits(getCredits()+creditReward);
    // award XP
    addXP(10);

    showCrateOverlay(moneyReward,creditReward);
}

function showCrateOverlay(money,credits){
    const overlay=document.getElementById('crate-overlay');
    overlay.innerHTML=`<div style="background:#424242;padding:20px 26px;border-radius:12px;text-align:center;animation:pop .4s ease-out">
        <h3 style="margin:0 0 10px;font-size:22px">Сейф открыт!</h3>
        <p style="margin:6px 0;font-size:18px">+$${formatNumber(money)}</p>
        ${credits>0?'<p style="margin:6px 0;font-size:18px">+'+credits+' <i class="fa-solid fa-circle" style="color:#b71c1c"></i></p>':''}
        <button id="crate-ok" style="margin-top:12px;padding:6px 18px;border:none;border-radius:6px;background:#4caf50;color:#fff;font-size:16px;cursor:pointer">OK</button>
    </div>`;
    overlay.style.display='flex';
    overlay.querySelector('#crate-ok').onclick=()=>{overlay.style.display='none';};
}

// pop animation keyframes (inject once)
const stylePop=document.createElement('style');
stylePop.textContent='@keyframes pop{0%{transform:scale(.5);opacity:0}100%{transform:scale(1);opacity:1}}';
document.head.appendChild(stylePop);

// crate click listeners
document.getElementById('crate-free').addEventListener('click',()=>openCrate('free'));
document.getElementById('crate-gold').addEventListener('click',()=>openCrate('gold'));
document.getElementById('crate-mystic').addEventListener('click',()=>openCrate('mystic'));

// === CITY BUILD PANEL ===
const cityPanel=document.getElementById('city-panel');
document.querySelector('#bottom-nav button:nth-child(3)').addEventListener('click',()=>{
    updateCityButtons();
    cityPanel.style.display='block';
});
document.getElementById('city-close').addEventListener('click',()=>{
    cityPanel.style.display='none';
    setActiveNavButton(0); // сбрасываем активное состояние
});

// === CHARACTERS PANEL ===
const charactersPanel=document.getElementById('characters-panel');
document.querySelector('#bottom-nav button:nth-child(2)').addEventListener('click',()=>{
    if (isAnyPanelOpen()) return; // Блокируем если открыта любая панель
    setActiveNavButton(2);
    renderCharacters();
    charactersPanel.style.display='flex';
});
document.getElementById('chars-close').addEventListener('click',()=>charactersPanel.style.display='none');

function updateCityButtons(){
    const factoryBuilt=localStorage.getItem('factoryBuilt')==='1';
    document.getElementById('btn-build-factory').disabled=factoryBuilt;
    document.getElementById('btn-build-factory').textContent=factoryBuilt?'Построено':'Построить 1K';
    const statueBuilt=localStorage.getItem('statueBuilt')==='1';
    document.getElementById('btn-build-statue').disabled=statueBuilt;

    const storageBuilt=localStorage.getItem('storageBuilt')==='1';
    const storBtn=document.getElementById('btn-build-storage');
    if(storBtn){storBtn.disabled=storageBuilt;storBtn.textContent=storageBuilt?'Построено':'Построить 1K';}
}

// build factory
document.getElementById('btn-build-factory').addEventListener('click',()=>{
    if(localStorage.getItem('factoryBuilt')==='1')return;
    const cost=1000;
    if(getBalance()<cost){alert('Недостаточно денег');return;}
    setBalance(getBalance()-cost);
    localStorage.setItem('factoryBuilt','1');
    createFactory();
    updateCityButtons();
});

// build statue (звезды)
const STAR_KEY='stars';
function getStars(){return parseInt(localStorage.getItem(STAR_KEY)||'0');}
function setStars(v){localStorage.setItem(STAR_KEY,v);} // пока без UI
document.getElementById('btn-build-statue').addEventListener('click',()=>{
    const cost=200;
    if(localStorage.getItem('statueBuilt')==='1')return;
    if(getStars()<cost){alert('Недостаточно звёзд');return;}
    setStars(getStars()-cost);
    localStorage.setItem('statueBuilt','1');
    alert('Статуя построена (бонус пока не применён)');
    updateCityButtons();
});

// === FACTORY BUILDING ===
let factoryObj=null;
let factoryProgress=0;
factoryProgressDiv=document.createElement('div');
factoryProgressDiv.id='factory-income-progress';
factoryProgressDiv.style.cssText='position:absolute;width:70px;height:70px;border-radius:50%;background:conic-gradient(#2196f3 0deg, transparent 0deg);display:none;pointer-events:none;z-index:1;visibility:hidden;';
document.body.appendChild(factoryProgressDiv);
factoryBankDiv=document.createElement('div');
factoryBankDiv.id='factory-income-bank';
factoryBankDiv.style.cssText='position:absolute;width:70px;height:70px;border-radius:50%;background:#004ba0;display:none;align-items:center;justify-content:center;color:#fff;font-weight:bold;z-index:1;cursor:pointer;';
document.body.appendChild(factoryBankDiv);

let factoryIntermediate=0;
let factoryUpgrades=0; // future
const factoryProductionBase=19.87; // то же
const factoryCostBase=100;
const factoryRateGrowth=1.15;

// storage load
factoryUpgrades=parseInt(localStorage.getItem('f_upCnt')||'0');
factoryIntermediate=parseFloat(localStorage.getItem('f_interBal')||'0');
factoryBankDiv.textContent=formatNumber(factoryIntermediate);

function getFactoryIncomePerSecond(){
    if(factoryUpgrades===0) return 0;
    return factoryProductionBase * Math.pow(1.05, factoryUpgrades);
}

function factoryGetNextUpgradeCost(){return factoryCostBase*Math.pow(factoryRateGrowth,factoryUpgrades);}

// PANEL logic
const fPanel=document.getElementById('factory-upgrade-panel');
const fClose=document.getElementById('factory-panel-close');
fClose.onclick=()=>fPanel.style.display='none';

const fUpgradeBtn=document.getElementById('factory-upgrade-btn');
const fLevelLbl=document.getElementById('factory-level');
const fIncomeLbl=document.getElementById('factory-income');

function fUpdateLevelIncome(){fLevelLbl.textContent=factoryUpgrades;fIncomeLbl.textContent=formatNumber(getFactoryIncomePerSecond());}

// добавляем переключатель x1 / MAX
const fSwitchWrapper=document.createElement('div');
fSwitchWrapper.style.cssText='display:flex;gap:2px;margin-top:6px;';
document.getElementById('factory-panel-content').appendChild(fSwitchWrapper);

const fBtnX1=document.createElement('button');
fBtnX1.textContent='x1';
fBtnX1.style.cssText='flex:1;background:#1976d2;border:none;color:#fff;border-radius:6px 0 0 6px;height:32px;cursor:pointer;font-weight:bold;';
const fBtnMax=document.createElement('button');
fBtnMax.textContent='MAX';
fBtnMax.style.cssText='flex:1;background:#000;border:none;color:#fff;border-radius:0 16px 16px 0;height:32px;cursor:pointer;font-weight:bold;';
fSwitchWrapper.append(fBtnX1,fBtnMax);

let fIsMaxMode=false;
function fUpdateSwitch(){
    if(fIsMaxMode){
        fBtnX1.style.background='#000';
        fBtnX1.style.opacity=0.4;
        fBtnMax.style.background='#1976d2';
        fBtnMax.style.opacity=1;
    }else{
        fBtnX1.style.background='#1976d2';
        fBtnX1.style.opacity=1;
        fBtnMax.style.background='#000';
        fBtnMax.style.opacity=0.4;
    }
}
fBtnX1.onclick=()=>{fIsMaxMode=false;fUpdateSwitch();fRefreshCost();};
fBtnMax.onclick=()=>{fIsMaxMode=true;fUpdateSwitch();fRefreshCost();};
fUpdateSwitch();

// функция для рассчёта стоимости при MAX
function fCalcMaxAffordableCost(){
    let balance=getBalance();
    let temp=factoryUpgrades;
    let total=0;
    while(true){
        const c=factoryCostBase*Math.pow(factoryRateGrowth,temp);
        if(balance>=c){total+=c;balance-=c;temp++;}
        else break;
    }
    return total>0?total:factoryGetNextUpgradeCost();
}

function fRefreshCost(){const c=fIsMaxMode?fCalcMaxAffordableCost():factoryGetNextUpgradeCost();fUpgradeBtn.querySelector('span').textContent=formatNumber(c);const afford=getBalance()>=c;fUpgradeBtn.disabled=!afford;fUpgradeBtn.style.opacity=afford?1:0.5;}
fUpdateLevelIncome();fRefreshCost();

fUpgradeBtn.onclick=()=>{
    const start=factoryUpgrades;
    let bal=getBalance();
    if(fIsMaxMode){
        while(bal>=factoryGetNextUpgradeCost()){
            const c=factoryGetNextUpgradeCost();
            bal-=c;
            factoryUpgrades++;
        }
    }else{
        const cost=factoryGetNextUpgradeCost();
        if(bal>=cost){bal-=cost;factoryUpgrades++;}
    }
    if(factoryUpgrades>start){
        setBalance(bal);
        fUpdateLevelIncome();
        fRefreshCost();
        saveFactory();
        const n=factoryUpgrades-start;
        const sumXP=(start+1+factoryUpgrades)*n/2;
        addXP(sumXP);
    }
};

function saveFactory(){localStorage.setItem('f_upCnt',factoryUpgrades);localStorage.setItem('f_interBal',factoryIntermediate);} // called periodically

function createFactory(){
    if(factoryObj) return;
    const geo=new THREE.BoxGeometry(2,2,2);
    const mat=new THREE.MeshLambertMaterial({color:0xffdd55});
    factoryObj=new THREE.Mesh(geo,mat);
    factoryObj.name='factory';
    factoryObj.scale.set(3,3,3);
    factoryObj.position.set(18,3,0); // поднят на половину высоты
    scene.add(factoryObj);

    // show DOM elements
    factoryProgressDiv.style.display='flex';
    factoryBankDiv.style.display='flex';

    // click handler
    window.addEventListener('pointerdown',(e)=>{
        // Блокируем клики если открыта любая панель
        if (isAnyPanelOpen()) return;
        
        pointer.x=(e.clientX/window.innerWidth)*2-1;
        pointer.y=-(e.clientY/window.innerHeight)*2+1;
        raycaster.setFromCamera(pointer,camera);
        const ints=raycaster.intersectObjects([factoryObj],true);
        if(ints.length>0){fPanel.style.display='block';fRefreshCost();fUpdateLevelIncome();}
    });

    // после appendChild(factoryProgressDiv)
    const factoryInner=document.createElement('div');
    factoryInner.style.cssText='position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:60px;height:60px;border-radius:50%;background:#2b2b2b;pointer-events:none;';
    factoryProgressDiv.appendChild(factoryInner);
}

// recreate if built earlier
if(localStorage.getItem('factoryBuilt')==='1'){
    createFactory();
}

// income loop extension
setInterval(()=>{
    // factory progress (3s cycle => 180 steps)
    if(factoryObj){
        factoryProgress+=1;
        if(factoryProgress>=180){
            factoryProgress=0;
            const inc=getFactoryIncomePerSecond()*3;
            factoryIntermediate+=inc;
            window.factoryIntermediate = factoryIntermediate; // обновляем глобальную переменную
            factoryBankDiv.textContent=formatNumber(factoryIntermediate);
        }
        // update circle deg
        const deg = factoryUpgrades===0 ? 0 : (factoryProgress/180)*360;
        factoryProgressDiv.style.visibility='visible';
        factoryProgressDiv.style.background=circleBG('factory',deg,EMP_COLORS.default);
    }
},1000/60);

// collect factory money
factoryBankDiv.onclick=()=>{if(factoryIntermediate>0){setBalance(getBalance()+factoryIntermediate);factoryIntermediate=0;window.factoryIntermediate=0;factoryBankDiv.textContent='0';fRefreshCost();}};

// === OFFLINE INCOME ===
const LAST_ONLINE_KEY='lastOnlineTime';
const MAX_OFFLINE_HOURS=21.5;

function saveLastOnline(){localStorage.setItem(LAST_ONLINE_KEY,Date.now().toString());}
window.addEventListener('beforeunload',saveLastOnline);

function calculateOffline(){
  const saved=localStorage.getItem(LAST_ONLINE_KEY);
  if(!saved){saveLastOnline();return;}
  const last=parseInt(saved);
  if(isNaN(last)){saveLastOnline();return;}
  let diffMs=Date.now()-last;
  if(diffMs<1000) {saveLastOnline();return;} // менее секунды — игнор
  const diffHours=diffMs/3.6e6;
  const cappedHours=Math.min(diffHours,MAX_OFFLINE_HOURS);
  const incomePerSec=getIncomePerSecond();
  const earnings=incomePerSec*cappedHours*3600; // секунды
  showOfflinePanel(earnings,cappedHours);
}

function showOfflinePanel(earnings,hours){
  const pnl=document.getElementById('offline-panel');
  document.getElementById('offline-amount').textContent=formatNumber(earnings);
  // progress
  const percent=hours/MAX_OFFLINE_HOURS*100;
  document.getElementById('offline-progress-fill').style.width=percent+'%';
  pnl.style.display='flex';

  // кнопки
  const btn1=document.getElementById('btn-off-collect');
  const btn3=document.getElementById('btn-off-x3');
  const btn4=document.getElementById('btn-off-x4');

  function claim(mult){
      setBalance(getBalance()+earnings*mult);
      pnl.style.display='none';
      saveLastOnline();
  }
  btn1.onclick=()=>claim(1);
  btn3.onclick=()=>{alert('Реклама просмотрена');claim(3);} // заглушка рекламы
  btn4.onclick=()=>{
      const cost=30;
      if(getCredits()>=cost){setCredits(getCredits()-cost);claim(4);}else{alert('Недостаточно RBC');}
  };
}

// проверить оффлайн при загрузке
calculateOffline(); 

// save factory progress periodically
setInterval(saveFactory,1000); 

// referrals helpers
function getRefs(){return parseInt(localStorage.getItem('refs')||'0');}
function setRefs(v){localStorage.setItem('refs',v);document.getElementById('ref-value').textContent=v;}
// init stat values
document.getElementById('bc-value').textContent=formatNumber(getBalance());
document.getElementById('rbc-value').textContent=getCredits();
document.getElementById('ref-value').textContent=getRefs();

// === PHONE PANEL ===
const phonePanel=document.getElementById('phone-panel');
if(phonePanel){
    const phoneHome=document.getElementById('phone-home');
    const bookeioScreen=document.getElementById('bookeio-app');
    const deliveryScreen=document.getElementById('delivery-app');
    const messagesScreen=document.getElementById('messages-app');

    function showHome(){
        phoneHome.style.display='flex';
        bookeioScreen.style.display='none';
        deliveryScreen.style.display='none';
        messagesScreen.style.display='none';
    }
    function openScreen(scr){
        phoneHome.style.display='none';
        bookeioScreen.style.display='none';
        deliveryScreen.style.display='none';
        scr.style.display='flex';
    }

    // открытие/закрытие телефона
    function toggleCircles(show){
        const list=[incomeProgress,incomeBank,factoryProgressDiv,factoryBankDiv,storageProgressDiv];
        list.forEach(el=>{el.style.visibility=show?'visible':'hidden';});
    }

    document.getElementById('btn-phone').addEventListener('click',()=>{phonePanel.style.display='flex';showHome();toggleCircles(false);});
    document.getElementById('phone-close').addEventListener('click',()=>{phonePanel.style.display='none';toggleCircles(true);});
    document.querySelectorAll('.phone-back').forEach(btn=>btn.addEventListener('click',()=>{showHome();}));
    document.getElementById('app-bookeio').addEventListener('click',()=>openScreen(bookeioScreen));
    document.getElementById('app-delivery').addEventListener('click',()=>{refreshDeliveryList();openScreen(deliveryScreen);});
    document.getElementById('app-messages').addEventListener('click',()=>{renderMessages();openScreen(messagesScreen);messagesArr.forEach(m=>m.read=true);saveMessages();updateDots();});

    // данные заказов и цены
    const BOOK_COST=50;
    const MAG_COST=10;
    const SELL_MULT=2;
    orders=JSON.parse(localStorage.getItem('orders')||'[]');
    function saveOrders(){localStorage.setItem('orders',JSON.stringify(orders));}

    // слайдеры и отображение стоимости
    const bookSlider=document.getElementById('book-slider');
    const magSlider=document.getElementById('mag-slider');
    const bookCostLabel=document.getElementById('book-cost');
    const magCostLabel=document.getElementById('mag-cost');
    const bookQtyLabel=document.getElementById('book-qty');
    const magQtyLabel=document.getElementById('mag-qty');
    function updateCostLabels(){
        bookCostLabel.textContent = formatNumber(bookSlider.value*BOOK_COST)+'$';
        magCostLabel.textContent = formatNumber(magSlider.value*MAG_COST)+'$';
        bookQtyLabel.textContent = bookSlider.value;
        magQtyLabel.textContent  = magSlider.value;
    }
    if(bookSlider){bookSlider.addEventListener('input',updateCostLabels);} 
    if(magSlider){magSlider.addEventListener('input',updateCostLabels);}
    updateCostLabels();

    // отдельные заказы
    const orderBookBtn=document.getElementById('btn-order-book');
    const orderMagBtn=document.getElementById('btn-order-mag');
    if(orderBookBtn){orderBookBtn.addEventListener('click',()=>{
        const qty=parseInt(bookSlider.value);
        if(qty<=0){alert('Выберите количество');return;}
        const cost=qty*BOOK_COST;
        if(getBalance()<cost){alert('Недостаточно BC');return;}
        setBalance(getBalance()-cost);
        bookSlider.value=0;updateCostLabels();
        alert('Заказ оформлен!');
        const qtyCopy=qty;
        setTimeout(()=>{
            orders.push({type:'books',qty:qtyCopy,cost:cost});
            saveOrders();
            pushNotification('DELIVERY',`Книги (${qtyCopy}) доставлены на почту`,'assets/icons/delivery.svg');
            updateDots();
            refreshDeliveryList();
        },15000);
    });}
    if(orderMagBtn){orderMagBtn.addEventListener('click',()=>{
        const qty=parseInt(magSlider.value);
        if(qty<=0){alert('Выберите количество');return;}
        const cost=qty*MAG_COST;
        if(getBalance()<cost){alert('Недостаточно BC');return;}
        setBalance(getBalance()-cost);
        magSlider.value=0;updateCostLabels();
        alert('Заказ оформлен!');
        const qtyCopy=qty;
        setTimeout(()=>{
            orders.push({type:'magazines',qty:qtyCopy,cost:cost});
            saveOrders();
            pushNotification('DELIVERY',`Журналы (${qtyCopy}) доставлены на почту`,'assets/icons/delivery.svg');
            updateDots();
            refreshDeliveryList();
        },15000);
    });}

    function refreshDeliveryList(){
        const cont=document.getElementById('orders-container');
        cont.innerHTML='';
        if(orders.length===0){cont.innerHTML='<p style="text-align:center;width:100%;opacity:.6">Нет заказов</p>';return;}
        orders.forEach(o=>{
            const div=document.createElement('div');
            div.className='order-item';
            div.innerHTML=`<span>${o.type==='books'?'Книги':'Журналы'} ×${o.qty}</span><span>${formatNumber(o.cost)}$</span>`;
            cont.appendChild(div);
        });
    }

    // удалён старый обработчик "забрать всё" (моментальная продажа). Новый обработчик определён ниже.
} 

// === NOTIFICATION & MESSAGES ===
let messagesArr=JSON.parse(localStorage.getItem('messages')||'[]');
function saveMessages(){localStorage.setItem('messages',JSON.stringify(messagesArr));}
function hasUnread(){return messagesArr.some(m=>!m.read);} 
function updateDots(){
   const show=hasUnread();
   document.getElementById('phone-dot').style.display=show?'block':'none';
   document.getElementById('msg-dot').style.display=show?'block':'none';
}
function pushNotification(app,text,icon){
   const msg={app,text,time:Date.now(),read:false,icon};
   messagesArr.push(msg);saveMessages();updateDots();
}
function formatTimeHHMM(t){const d=new Date(t);return d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});}
function renderMessages(){
   const cont=document.getElementById('messages-container');if(!cont) return;
   cont.innerHTML='';
   messagesArr.slice().reverse().forEach(m=>{
      const item=document.createElement('div');item.style.cssText='display:flex;align-items:center;gap:6px;background:#6d6d6d;border-radius:8px;padding:6px;margin-bottom:6px;font-size:12px;';
      item.innerHTML=`<img src="${m.icon||'assets/icons/delivery.svg'}" style="width:24px;height:24px;"> <div style="flex:1;">${m.text}</div><span style="opacity:.6;">${formatTimeHHMM(m.time)}</span>`;
      cont.appendChild(item);
   });
}
// статус-бар время
setInterval(()=>{const t=new Date();document.getElementById('phone-status').textContent=t.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});},1000*30);
// open Messages app (обработчик добавлен внутри phonePanel блока)
// initialize dots
updateDots(); 

// === PLAYER LEVEL SYSTEM ===
const XP_BASE=20;
let playerLevel=parseInt(localStorage.getItem('playerLevel')||'1');
let playerXP=parseInt(localStorage.getItem('playerXP')||'0');
function xpForLevel(lvl){
    if(lvl<=1) return 0;
    if(lvl===2) return XP_BASE;
    const mult=Math.pow(1.25,lvl-2);
    return Math.round(XP_BASE*mult);
}
function saveXP(){localStorage.setItem('playerLevel',playerLevel);localStorage.setItem('playerXP',playerXP);} 
function updateProfileUI(){
    const lvlEl=document.getElementById('player-level');
    if(!lvlEl) return;
    lvlEl.textContent=playerLevel;
    const nextLvl=playerLevel+1;
    const nextXP=xpForLevel(nextLvl);
    document.getElementById('next-level').textContent=nextLvl;
    document.getElementById('xp-to-next').textContent=nextXP-playerXP;
    const progress=nextXP>0?playerXP/nextXP*100:0;
    document.getElementById('level-progress').style.width=progress+'%';
}
function addXP(amount){
    let gained=0;
    playerXP+=amount;
    const startLvl=playerLevel;
    while(playerXP>=xpForLevel(playerLevel+1)){
        playerXP-=xpForLevel(playerLevel+1);
        playerLevel++;gained++;
    }
    saveXP();
    updateProfileUI();
    if(gained>0) enqueueLevelAnimations(startLvl,gained);
}
updateProfileUI();
// кнопки профиля
const profileBtn=document.querySelector('#bottom-nav button:nth-child(5)');
if(profileBtn){profileBtn.addEventListener('click',()=>{document.getElementById('profile-panel').style.display='block';});}
const profileClose=document.getElementById('profile-close');
if(profileClose){profileClose.addEventListener('click',()=>{document.getElementById('profile-panel').style.display='none';});}
// === award XP on upgrades ===
// library upgrade: in upgradeBtn click after each upgrade increment
// modify inside existing handler
// ... existing code ... 

const overlay=document.getElementById('levelup-overlay');
const badge=document.getElementById('levelup-badge');
let levelQueue=[];let levelPlaying=false;
function enqueueLevelAnimations(startLevel,gained){
    for(let i=1;i<=gained;i++) levelQueue.push(startLevel+i);
    if(!levelPlaying) playNext();
}

function playNext(){
    if(levelQueue.length===0){levelPlaying=false;overlay.style.display='none';return;}
    levelPlaying=true;
    const lvl=levelQueue.shift();
    badge.textContent=lvl-1; // показываем текущий
    overlay.style.display='flex';
    badge.className='lvl-slide-in';
}

badge.addEventListener('animationend',e=>{
    if(e.animationName==='slideIn'){
        // смена текста и shake
        badge.textContent=parseInt(badge.textContent)+1;
        badge.className='lvl-shake';
    }else if(e.animationName==='shake'){
        badge.className='lvl-slide-out';
    }else if(e.animationName==='slideOut'){
        playNext();
    }
});

// inject css
const st=document.createElement('style');st.textContent=`
#levelup-overlay{background:rgba(0,0,0,.6);} 
.lvl-slide-in{animation:slideIn .8s forwards;}
.lvl-shake{animation:shake .3s forwards;}
.lvl-slide-out{animation:slideOut .8s forwards;}
@keyframes slideIn{0%{transform:translateX(-150%) scale(1);}100%{transform:translateX(0) scale(1);} }
@keyframes shake{0%,100%{transform:translateX(0);}20%{transform:translateX(-4px);}40%{transform:translateX(4px);}60%{transform:translateX(-3px);}80%{transform:translateX(3px);} }
@keyframes slideOut{0%{transform:translateX(0);}100%{transform:translateX(150%);} }
`;document.head.appendChild(st); 

// === STORAGE SYSTEM ===
const STORAGE_BASE_CAP=1000;
let storageUpgrades=parseInt(localStorage.getItem('stor_up')||'0');
let storageCapacity=STORAGE_BASE_CAP+storageUpgrades*500; // +500 за ап
let storedBooks=parseInt(localStorage.getItem('stor_books')||'0');
let storedMags =parseInt(localStorage.getItem('stor_mags') ||'0');
function saveStorage(){localStorage.setItem('stor_up',storageUpgrades);localStorage.setItem('stor_books',storedBooks);localStorage.setItem('stor_mags',storedMags);localStorage.setItem('stor_queue',JSON.stringify(saleQueue));} 
function updateStorageUI(){const total=storedBooks+storedMags;const pct=Math.min(100,total/storageCapacity*100);const bar=document.getElementById('storage-progress-bar');const txt=document.getElementById('storage-progress-text');const amt=document.getElementById('storage-amount');if(bar){bar.style.width=pct+'%';const hue=120-(pct*1.2);bar.style.background=`hsl(${hue},80%,45%)`;txt.textContent=Math.round(pct)+'%';txt.style.color=`hsl(${hue},80%,55%)`;amt.textContent=`${total}/${storageCapacity}`;} const cardPct=document.getElementById('storage-card-percent');const cardAmt=document.getElementById('storage-card-amt');if(cardPct){cardPct.textContent=Math.round(pct)+'%';}if(cardAmt){cardAmt.textContent=`${total} / ${storageCapacity}`;}} 
function canStore(q){return storedBooks+storedMags+q<=storageCapacity;} 
let saleQueue=JSON.parse(localStorage.getItem('stor_queue')||'[]');let selling=false;let saleTimer=null;
let saleStartTime=0, saleDelayMs=0; // для круга прогресса
function scheduleSale(){if(selling||saleQueue.length===0) return; selling=true; const delay=500+Math.random()*1500; saleStartTime=Date.now(); saleDelayMs=delay; storageProgressDiv.style.visibility='visible'; saleTimer=setTimeout(processSale,delay);} 
function processSale(){if(saleQueue.length===0){selling=false;storageProgressDiv.style.visibility='hidden';return;} const order=saleQueue[0]; order.qty--; const defective=Math.random()<0.1; const priceMultiplier=defective?(0.5+Math.random()*0.5):2; const revenue=order.unitCost*priceMultiplier; setBalance(getBalance()+revenue); order.revenue+=revenue; if(defective) order.defective++; if(order.type==='books') storedBooks--; else storedMags--; updateStorageUI(); if(order.qty===0){ // order complete
    pushNotification('STORAGE',`${order.type==='books'?'Книги':'Журналы'} партия (${order.originalQty}) продана за ${formatNumber(Math.round(order.revenue))}$, брак: ${order.defective}`,'assets/icons/delivery.svg');
    saleQueue.shift();
 }
 saveStorage(); selling=false; if(saleQueue.length>0){scheduleSale();}else{storageProgressDiv.style.visibility='hidden';}}

function addToStorage(type,qty,unitCost){if(!canStore(qty)) return false; if(type==='books') storedBooks+=qty; else storedMags+=qty; saleQueue.push({type,qty,originalQty:qty,unitCost,revenue:0,defective:0}); saveStorage();updateStorageUI(); scheduleSale(); return true;} 
updateStorageUI();
// открытие/закрытие панели хранилища
const storagePanel=document.getElementById('storage-upgrade-panel');
if(storagePanel){document.getElementById('storage-panel-close').onclick=()=>storagePanel.style.display='none';}
// город строит хранилище
const btnStorageBuild=document.getElementById('btn-build-storage');
if(btnStorageBuild){btnStorageBuild.addEventListener('click',()=>{if(localStorage.getItem('storageBuilt')==='1')return;const cost=1000;if(getBalance()<cost){alert('Недостаточно денег');return;}setBalance(getBalance()-cost);localStorage.setItem('storageBuilt','1');btnStorageBuild.disabled=true;btnStorageBuild.textContent='Построено';createStorage();});}
function createStorage(){
    if(scene.getObjectByName('storage')) return;
    const geo=new THREE.BoxGeometry(2,2,2);
    const mat=new THREE.MeshLambertMaterial({color:0x9c27b0});
    const stor=new THREE.Mesh(geo,mat);
    stor.name='storage';
    stor.scale.set(3,3,3);
    stor.position.set(-18,3,0);
    scene.add(stor);

    // show storage progress circle
    storageProgressDiv.style.display='flex';
    storageProgressDiv.style.visibility='visible';

    // click handler open panel
    window.addEventListener('pointerdown',(e)=>{
        // Блокируем клики если открыта любая панель
        if (isAnyPanelOpen()) return;
        
        pointer.x=(e.clientX/window.innerWidth)*2-1;
        pointer.y=-(e.clientY/window.innerHeight)*2+1;
        raycaster.setFromCamera(pointer,camera);
        const ints=raycaster.intersectObjects([stor],true);
        if(ints.length>0){storagePanel.style.display='block';updateStorageUI();updateStorageUpgradeCost();}
    });
}
// recreate storage if built earlier
if(localStorage.getItem('storageBuilt')==='1') createStorage();

// DELIVERY UI modifications
const collectSelBtn=document.getElementById('btn-collect-selected');if(collectSelBtn){collectSelBtn.addEventListener('click',collectSelected);} 
function refreshDeliveryList(){const cont=document.getElementById('orders-container');if(!cont) return;cont.innerHTML='';if(orders.length===0){cont.innerHTML='<p style="text-align:center;width:100%;opacity:.6">Нет заказов</p>';return;}orders.forEach((o,idx)=>{const div=document.createElement('div');div.className='order-item';div.innerHTML=`<input type="checkbox" data-idx="${idx}"><span>${o.type==='books'?'Книги':'Журналы'} ×${o.qty}</span><span>${formatNumber(o.cost)}$</span>`;cont.appendChild(div);});}
function collectSelected(){const checkboxes=[...document.querySelectorAll('#orders-container input[type=checkbox]')];const selIdxs=checkboxes.filter(ch=>ch.checked).map(ch=>parseInt(ch.dataset.idx));if(selIdxs.length===0){alert('Ничего не выбрано');return;} let totalQty=0;selIdxs.forEach(i=>{totalQty+=orders[i].qty;});if(!canStore(totalQty)){alert('Недостаточно места в хранилище');return;} // добавить партии
const newOrders=[];orders.forEach((o,i)=>{if(selIdxs.includes(i)){const unit=o.cost/o.qty;addToStorage(o.type,o.qty,unit);}else newOrders.push(o);});orders=newOrders;saveOrders();refreshDeliveryList();}
// переопределяем collect-all
const collectAllBtn=document.getElementById('btn-collect-all');if(collectAllBtn){collectAllBtn.onclick=()=>{let total=0;orders.forEach(o=>total+=o.qty);if(!canStore(total)){alert('Недостаточно места в хранилище');return;}orders.forEach(o=>{const unit=o.cost/o.qty;addToStorage(o.type,o.qty,unit);});orders=[];saveOrders();refreshDeliveryList();};} 

const STORAGE_BASE_COST=1000;const STORAGE_RATE=1.25;const STORAGE_INC=500;
function storageNextCost(){return Math.round(STORAGE_BASE_COST*Math.pow(STORAGE_RATE,storageUpgrades));}
function updateStorageUpgradeCost(){const c=storageNextCost();document.getElementById('storage-upgrade-cost').textContent=formatNumber(c);const afford=getBalance()>=c;document.getElementById('storage-upgrade-btn').disabled=!afford;document.getElementById('storage-upgrade-btn').style.opacity=afford?1:0.5;}
function upgradeStorage(){const cost=storageNextCost();if(getBalance()<cost){alert('Недостаточно денег');return;}setBalance(getBalance()-cost);storageUpgrades++;storageCapacity=STORAGE_BASE_CAP+storageUpgrades*STORAGE_INC;saveStorage();updateStorageUI();updateStorageUpgradeCost();addXP(storageUpgrades);}
// attach btn
const storUpBtn=document.getElementById('storage-upgrade-btn');if(storUpBtn){storUpBtn.onclick=upgradeStorage;updateStorageUpgradeCost();}
// open panel when item clicked
const cityItemStorage=document.getElementById('item-storage');if(cityItemStorage){cityItemStorage.addEventListener('click',()=>{if(localStorage.getItem('storageBuilt')==='1'){storagePanel.style.display='block';updateStorageUI();updateStorageUpgradeCost();}});} 

// watchdog: каждые 2 секунды проверяем, запущена ли продажа
setInterval(()=>{if(!selling && saleQueue.length>0) scheduleSale();},2000); 

// === ОФФЛАЙН-ПРОДАЖА ХРАНИЛИЩА ===
function simulateOfflineStorageSales(ms){
   let remaining=ms;
   while(remaining>0 && saleQueue.length>0){
       const delay=500+Math.random()*1500;
       if(remaining<delay) break;
       remaining-=delay;
       const order=saleQueue[0];
       order.qty--; 
       const defective=Math.random()<0.1;
       const priceMultiplier=defective?(0.5+Math.random()*0.5):2;
       const revenue=order.unitCost*priceMultiplier;
       setBalance(getBalance()+revenue);
       order.revenue+=revenue;
       if(defective) order.defective++;
       if(order.type==='books') storedBooks--; else storedMags--;
       if(order.qty===0){
           pushNotification('STORAGE',`${order.type==='books'?'Книги':'Журналы'} партия (${order.originalQty}) продана за ${formatNumber(Math.round(order.revenue))}$, брак: ${order.defective}`,'assets/icons/delivery.svg');
           saleQueue.shift();
       }
   }
   saveStorage();
   updateStorageUI();
}
function handleOfflineStorageSales(){
   const saved=localStorage.getItem(LAST_ONLINE_KEY);
   if(!saved) return;
   const last=parseInt(saved);
   if(isNaN(last)) return;
   const diffMs=Date.now()-last;
   if(diffMs<500) return;
   simulateOfflineStorageSales(diffMs);
   if(saleQueue.length>0) scheduleSale();
}
handleOfflineStorageSales(); 

// === CHARACTERS DATA ===
const employees=[
 {name:'Блуми',  level:1, skill:'Бегущая почта',     rarity:1, img:'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRkY5ODAwIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QjwvdGV4dD4KPC9zdmc+'},
 {name:'Реджи', level:1, skill:'Калькулятор',       rarity:1, img:'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRkY1NzIyIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UjwvdGV4dD4KPC9zdmc+'},
 {name:'Перпи',  level:1, skill:'Мастер-фломастер',  rarity:5, img:'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjOUMyN0IwIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UDwvdGV4dD4KPC9zdmc+'},
 {name:'Грини',  level:1, skill:'Лояльность',        rarity:3, img:'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjNENBRjUwIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RzwvdGV4dD4KPC9zdmc+'},
];

// Цвета для сотрудников
const EMP_COLORS = {
    default: '#4caf50',
    assigned: '#2196f3',
    unassigned: '#9e9e9e'
};

// Назначения сотрудников
let assignments = JSON.parse(localStorage.getItem('emp_map') || '{}');

// Функция для создания фона круга
function circleBG(building, deg, color) {
    return `conic-gradient(${color} 0deg, ${color} ${deg}deg, transparent ${deg}deg)`;
}

// Функция для открытия панели назначения сотрудников
function openAssignOverlay(building) {
    const overlay = document.getElementById('assign-overlay');
    const grid = document.getElementById('assign-grid');
    grid.innerHTML = '';
    
    // Добавляем кнопку закрытия
    const closeButton = document.createElement('button');
    closeButton.style.cssText = 'position:absolute;top:8px;right:8px;background:none;border:none;color:#fff;font-size:24px;cursor:pointer;z-index:10;';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => {
        overlay.style.display = 'none';
    };
    grid.appendChild(closeButton);
    
    // Проверяем, есть ли уже назначенный сотрудник
    const currentEmployee = assignments[building];
    
    // Добавляем кнопку "Снять работника" если есть назначенный сотрудник
    if (currentEmployee) {
        const removeButton = document.createElement('button');
        removeButton.style.cssText = 'grid-column:1/-1;background:#f44336;border:none;border-radius:8px;color:#fff;padding:10px;font-size:14px;font-weight:bold;cursor:pointer;margin-bottom:8px;';
        removeButton.textContent = 'Снять работника';
        removeButton.onclick = () => {
            delete assignments[building];
            localStorage.setItem('emp_map', JSON.stringify(assignments));
            overlay.style.display = 'none';
            if (window.updateInfoPanel) {
                window.updateInfoPanel(building);
            }
        };
        grid.appendChild(removeButton);
    }
    
    // Создаем сетку 2x2 для сотрудников
    employees.forEach(emp => {
        const isAssigned = assignments[building] === emp.name;
        const div = document.createElement('div');
        div.style.cssText = 'background:#2b2b2b;border-radius:8px;padding:12px;display:flex;flex-direction:column;align-items:center;gap:8px;position:relative;';
        
        // Создаем иконку с первой буквой имени
        const iconDiv = document.createElement('div');
        iconDiv.style.cssText = 'width:50px;height:50px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold;color:#fff;';
        
        // Цвета для разных сотрудников
        const colors = {
            'Блуми': '#ff9800', // оранжевый
            'Перпи': '#9c27b0', // фиолетовый
            'Реджи': '#f44336', // красный
            'Грини': '#4caf50'  // зеленый
        };
        
        iconDiv.style.background = colors[emp.name] || '#666';
        iconDiv.textContent = emp.name.charAt(0);
        
        // Добавляем тег "УСТАНОВЛЕН" если сотрудник назначен
        if (isAssigned) {
            const assignedTag = document.createElement('div');
            assignedTag.style.cssText = 'position:absolute;top:4px;right:4px;background:#4caf50;color:#fff;font-size:10px;font-weight:bold;padding:2px 6px;border-radius:4px;transform:rotate(15deg);';
            assignedTag.textContent = 'УСТАНОВЛЕН';
            div.appendChild(assignedTag);
        }
        
        // Имя сотрудника
        const nameDiv = document.createElement('div');
        nameDiv.style.cssText = 'color:#fff;font-size:14px;font-weight:bold;text-align:center;';
        nameDiv.textContent = emp.name;
        
        // Добавляем элементы в карточку
        div.appendChild(iconDiv);
        div.appendChild(nameDiv);
        
        // Делаем карточку кликабельной только если сотрудник не назначен
        if (!isAssigned) {
            div.style.cursor = 'pointer';
            div.onclick = () => {
                assignments[building] = emp.name;
                localStorage.setItem('emp_map', JSON.stringify(assignments));
                overlay.style.display = 'none';
                if (window.updateInfoPanel) {
                    window.updateInfoPanel(building);
                }
            };
        } else {
            // Если сотрудник назначен, делаем карточку полупрозрачной
            div.style.opacity = '0.6';
        }
        
        grid.appendChild(div);
    });
    
    overlay.style.display = 'flex';
}

// Функция для назначения сотрудника
function assignEmployee(building, empName) {
    if (assignments[building] === empName) {
        // Снимаем сотрудника
        delete assignments[building];
    } else {
        // Назначаем сотрудника
        assignments[building] = empName;
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('emp_map', JSON.stringify(assignments));
    
    // Закрываем панель
    document.getElementById('assign-overlay').style.display = 'none';
    
    // Обновляем панель здания
    if (window.updateInfoPanel) {
        window.updateInfoPanel(building);
    }
}

// Функция для получения сотрудника по зданию
function getEmpByBuilding(building) {
    const empName = assignments[building];
    return employees.find(emp => emp.name === empName);
}

// Функция для сохранения назначений
function saveAssignments() {
    localStorage.setItem('emp_map', JSON.stringify(assignments));
}

// Делаем функции глобально доступными
window.openAssignOverlay = openAssignOverlay;
window.assignEmployee = assignEmployee;
window.getEmpByBuilding = getEmpByBuilding;
window.saveAssignments = saveAssignments;
window.getNextUpgradeCost = getNextUpgradeCost;
window.factoryGetNextUpgradeCost = factoryGetNextUpgradeCost;
window.getIncomePerSecond = getIncomePerSecond;
window.getFactoryIncomePerSecond = getFactoryIncomePerSecond;
window.formatNumber = formatNumber;

// Функции обновления панелей
window.updatePanelIncomeDisplay = function() {
    const building = document.getElementById('building-info-panel').dataset.building;
    if (building && window.updateHourlyIncomeInPanel) {
        window.updateHourlyIncomeInPanel();
    }
};

window.updateCollectButtonAmounts = function() {
    const building = document.getElementById('building-info-panel').dataset.building;
    if (building) {
        let bank = 0;
        if (building === 'library') {
            bank = intermediateBalance;
        } else if (building === 'factory') {
            bank = factoryIntermediate;
        }
        
        const btn = document.querySelector('#btn-collect-hour span:last-child');
        if (btn) {
            btn.textContent = window.formatNumber(bank);
        }
    }
};

window.updatePanelProgressBars = function() {
    const building = document.getElementById('building-info-panel').dataset.building;
    if (building) {
        let bank = 0, perSec = 0;
        if (building === 'library') {
            bank = intermediateBalance;
            perSec = window.getIncomePerSecond ? window.getIncomePerSecond() : 0;
        } else if (building === 'factory') {
            bank = factoryIntermediate;
            perSec = window.getFactoryIncomePerSecond ? window.getFactoryIncomePerSecond() : 0;
        }
        
        const percent = perSec > 0 ? Math.min(100, (bank / (perSec * 3600)) * 100) : 0;
        const progressBar = document.querySelector('.progress-bar .fill');
        if (progressBar) {
            progressBar.style.width = percent + '%';
        }
    }
};

window.updateHourlyIncomeInPanel = function() {
    const building = document.getElementById('building-info-panel').dataset.building;
    if (building) {
        let perSec = 0;
        if (building === 'library') {
            perSec = window.getIncomePerSecond ? window.getIncomePerSecond() : 0;
        } else if (building === 'factory') {
            perSec = window.getFactoryIncomePerSecond ? window.getFactoryIncomePerSecond() : 0;
        }
        
        const hourlyIncome = perSec * 3600;
        const display = document.getElementById('hourly-income-display');
        if (display) {
            display.textContent = `Доход в час: ${window.formatNumber(hourlyIncome)}`;
        }
    }
};

window.updateUpgradeCostInPanel = function() {
    const building = document.getElementById('building-info-panel').dataset.building;
    if (building) {
        let cost = 0;
        if (building === 'library') {
            cost = window.getNextUpgradeCost ? window.getNextUpgradeCost() : 0;
        } else if (building === 'factory') {
            cost = window.factoryGetNextUpgradeCost ? window.factoryGetNextUpgradeCost() : 0;
        }
        
        const costDisplay = document.getElementById('upgrade-cost-display');
        if (costDisplay) {
            costDisplay.textContent = window.formatNumber(cost);
        }
    }
};

window.updateLevelInPanel = function() {
    const building = document.getElementById('building-info-panel').dataset.building;
    if (building) {
        let level = 0;
        if (building === 'library') {
            level = upgradesCount;
        } else if (building === 'factory') {
            level = factoryUpgrades;
        }
        
        const levelDisplay = document.getElementById('info-level');
        if (levelDisplay) {
            levelDisplay.textContent = level;
        }
    }
};

// Функции для прямого сбора денег и улучшения
window.collectLibraryMoney = function() {
    if (intermediateBalance > 0) {
        setBalance(getBalance() + intermediateBalance);
        intermediateBalance = 0;
        window.intermediateBalance = 0; // обновляем глобальную переменную
        incomeBank.textContent = formatNumber(intermediateBalance);
        refreshUpgradeCost();
        return true;
    }
    return false;
};

window.collectFactoryMoney = function() {
    if (factoryIntermediate > 0) {
        setBalance(getBalance() + factoryIntermediate);
        factoryIntermediate = 0;
        factoryBankDiv.textContent = formatNumber(factoryIntermediate);
        return true;
    }
    return false;
};

window.upgradeLibraryDirectly = function() {
    const cost = getNextUpgradeCost();
    if (getBalance() >= cost) {
        setBalance(getBalance() - cost);
        upgradesCount++;
        saveProgress();
        return true;
    }
    return false;
};

window.upgradeFactoryDirectly = function() {
    const cost = factoryGetNextUpgradeCost();
    if (getBalance() >= cost) {
        setBalance(getBalance() - cost);
        factoryUpgrades++;
        saveFactory();
        return true;
    }
    return false;
};

window.upgradeStorageDirectly = function() {
    const cost = storageNextCost();
    if (getBalance() >= cost) {
        setBalance(getBalance() - cost);
        storageUpgrades++;
        storageCapacity = STORAGE_BASE_CAP + storageUpgrades * STORAGE_INC;
        saveStorage();
        updateStorageUI();
        updateStorageUpgradeCost();
        addXP(storageUpgrades);
        return true;
    }
    return false;
};

function starsHTML(r){let s='';for(let i=1;i<=5;i++){s+=i<=r?'★':'☆';}return `<span style="color:#ffeb3b;font-size:12px">${s}</span>`;}

function renderCharacters(){
  const list=document.getElementById('chars-list');if(!list)return;
  list.innerHTML='';
  employees.forEach(e=>{
    const item=document.createElement('div');
    item.style.cssText='display:flex;align-items:center;gap:10px;background:#2b2b2b;color:#fff;border-radius:10px;padding:10px';
    item.innerHTML=`<img src="${e.img}" style="width:60px;height:60px;object-fit:contain;background:#fff;border-radius:6px;">
    <div style="flex:1;">
       <div style="font-weight:700;font-size:15px">${e.name}</div>
       <div style="font-size:11px;opacity:.8">Уровень <span>${e.level}</span></div>
       <div style="font-size:11px;">Навык <span>${e.skill}</span></div>
       <div>${starsHTML(e.rarity)}</div>
    </div>`
    list.appendChild(item);
  });
}

renderCharacters();

// Делаем переменные глобально доступными
window.upgradesCount = upgradesCount;
window.factoryUpgrades = factoryUpgrades;
window.intermediateBalance = intermediateBalance;
window.factoryIntermediate = factoryIntermediate;

// === TASKS PANEL ===
const tasksPanel=document.getElementById('tasks-panel');
document.querySelector('#bottom-nav button:nth-child(4)').addEventListener('click',()=>{
    if (isAnyPanelOpen()) return; // Блокируем если открыта любая панель
    setActiveNavButton(4);
    renderTasks();
    tasksPanel.style.display='flex';
});
document.getElementById('tasks-back').addEventListener('click',()=>{
    tasksPanel.style.display='none';
    setActiveNavButton(0); // сбрасываем активное состояние
});

// Tab switching
document.getElementById('tab-social').addEventListener('click',()=>{
    document.querySelectorAll('.task-tab').forEach(tab=>{
        tab.style.background='none';
        tab.classList.remove('active');
    });
    document.getElementById('tab-social').style.background='#2d2d2d';
    document.getElementById('tab-social').classList.add('active');
    renderTasks('social');
});

document.getElementById('tab-booke').addEventListener('click',()=>{
    document.querySelectorAll('.task-tab').forEach(tab=>{
        tab.style.background='none';
        tab.classList.remove('active');
    });
    document.getElementById('tab-booke').style.background='#2d2d2d';
    document.getElementById('tab-booke').classList.add('active');
    renderTasks('booke');
});

function renderTasks(category='social'){
    const tasksList=document.getElementById('tasks-list');
    tasksList.innerHTML='';
    
    const tasks=[
        {
            id:1,
            title:'Иследовать TG miniAP',
            status:'completed',
            reward:10000,
            category:'social'
        },
        {
            id:2,
            title:'Присоединиться к Pismakov Path',
            status:'pending',
            reward:100000,
            category:'social'
        },
        {
            id:3,
            title:'Присоединиться к BOOKE Path',
            status:'pending',
            reward:100000,
            category:'social'
        },
        {
            id:4,
            title:'Подписаться на BOOKE',
            status:'pending',
            reward:50000,
            category:'booke'
        }
    ];
    
    const filteredTasks=category==='all'?tasks:tasks.filter(task=>task.category===category);
    
    filteredTasks.forEach(task=>{
        const taskDiv=document.createElement('div');
        const backgroundColor=task.status==='completed'?'#666':'#424242';
        taskDiv.style.cssText=`display:flex;align-items:center;background:${backgroundColor};border-radius:8px;padding:12px;gap:12px;`;
        
        const statusText=task.status==='completed'?'Завершено':'Перейти';
        const statusColor=task.status==='completed'?'#666':'#fff';
        const statusStyle=task.status==='completed'?'background:#f0f0f0;color:#2d2d2d;padding:4px 8px;border-radius:4px;text-align:center;':'background:#f0f0f0;color:#2d2d2d;padding:4px 8px;border-radius:4px;text-align:center;';
        
        // Создаем содержимое для центральной части в зависимости от статуса
        const centerContent = task.status === 'completed' 
            ? `<div style="display:flex;align-items:center;gap:8px;flex:1;">
                 <span style="font-size:14px;font-weight:600;">${task.title}</span>
               </div>`
            : `<div style="display:flex;align-items:center;gap:8px;flex:1;">
                 <span style="font-size:14px;font-weight:600;">${task.title}</span>
               </div>`;
        
        taskDiv.innerHTML=`
            <div style="color:${statusColor};font-size:12px;font-weight:600;min-width:60px;${statusStyle}">${task.status==='completed'?'✓':statusText}</div>
            ${centerContent}
            <button class="task-reward-btn" style="background:#666;border:none;color:#fff;border-radius:6px;padding:6px 10px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px;">
                <span style="font-size:10px;">💰</span>
                +${formatNumber(task.reward)}
            </button>
        `;
        
        // Add click handler for task
        const rewardBtn=taskDiv.querySelector('.task-reward-btn');
        rewardBtn.addEventListener('click',()=>{
            if(task.status==='completed'){
                // Already completed
                return;
            }
            // Mark as completed and give reward
            task.status='completed';
            setBalance(getBalance()+task.reward);
            addXP(10);
            renderTasks(category);
        });
        
        tasksList.appendChild(taskDiv);
    });
}

// // Create task button handler
// document.getElementById('create-task-btn').addEventListener('click',()=>{
//     alert('Функция создания заданий пока не реализована');
// }

// === NAVIGATION ACTIVE STATE MANAGEMENT ===
function setActiveNavButton(buttonIndex) {
    // Убираем активное состояние со всех кнопок
    document.querySelectorAll('#bottom-nav button').forEach((btn, index) => {
        btn.classList.remove('active');
        btn.style.color = '#666'; // серый цвет для неактивных
    });
    
    // Устанавливаем активное состояние для выбранной кнопки
    const activeButton = document.querySelector(`#bottom-nav button:nth-child(${buttonIndex})`);
    if (activeButton) {
        activeButton.classList.add('active');
        activeButton.style.color = '#fff'; // белый цвет для активной
    }
}

// === BOTTOM NAVIGATION HANDLERS ===
// Магазин (1-я кнопка)
document.querySelector('#bottom-nav button:nth-child(1)').addEventListener('click',()=>{
    if (isAnyPanelOpen()) return; // Блокируем если открыта любая панель
    setActiveNavButton(1);
    document.getElementById('shop-panel').style.display='block';
});

// Персонажи (2-я кнопка)
document.querySelector('#bottom-nav button:nth-child(2)').addEventListener('click',()=>{
    if (isAnyPanelOpen()) return; // Блокируем если открыта любая панель
    setActiveNavButton(2);
    renderCharacters();
    charactersPanel.style.display='flex';
});

// Город (3-я кнопка)
document.querySelector('#bottom-nav button:nth-child(3)').addEventListener('click',()=>{
    if (isAnyPanelOpen()) return; // Блокируем если открыта любая панель
    setActiveNavButton(3);
    updateCityButtons();
    cityPanel.style.display='block';
});

// Задания (4-я кнопка)
document.querySelector('#bottom-nav button:nth-child(4)').addEventListener('click',()=>{
    if (isAnyPanelOpen()) return; // Блокируем если открыта любая панель
    setActiveNavButton(4);
    renderTasks();
    tasksPanel.style.display='flex';
});

// Профиль (5-я кнопка)
document.querySelector('#bottom-nav button:nth-child(5)').addEventListener('click',()=>{
    if (isAnyPanelOpen()) return; // Блокируем если открыта любая панель
    setActiveNavButton(5);
    document.getElementById('profile-panel').style.display='flex';
});

// === PANEL CLOSE HANDLERS ===
// Закрытие панелей сбрасывает активное состояние
document.getElementById('shop-close').addEventListener('click',()=>{
    document.getElementById('shop-panel').style.display='none';
    setActiveNavButton(0); // сбрасываем активное состояние
});

document.getElementById('chars-close').addEventListener('click',()=>{
    charactersPanel.style.display='none';
    setActiveNavButton(0); // сбрасываем активное состояние
});

document.getElementById('city-close').addEventListener('click',()=>{
    cityPanel.style.display='none';
    setActiveNavButton(0); // сбрасываем активное состояние
});

document.getElementById('tasks-back').addEventListener('click',()=>{
    tasksPanel.style.display='none';
    setActiveNavButton(0); // сбрасываем активное состояние
});

document.getElementById('profile-close').addEventListener('click',()=>{
    document.getElementById('profile-panel').style.display='none';
    setActiveNavButton(0); // сбрасываем активное состояние
});

// === INVENTORY SYSTEM ===
let currentInventoryTab = 'safes';

// Inventory data
const inventoryItems = {
    safes: [
        { id: 1, name: 'Обычный сейф', type: 'safe', rarity: 'common' },
        { id: 2, name: 'Золотой сейф', type: 'safe', rarity: 'rare' },
        { id: 3, name: 'Мистический сейф', type: 'safe', rarity: 'epic' },
        { id: 4, name: 'Обычный сейф', type: 'safe', rarity: 'common' },
        { id: 5, name: 'Обычный сейф', type: 'safe', rarity: 'common' },
        { id: 6, name: 'Обычный сейф', type: 'safe', rarity: 'common' },
        { id: 7, name: 'Золотой сейф', type: 'safe', rarity: 'rare' },
        { id: 8, name: 'Золотой сейф', type: 'safe', rarity: 'rare' },
        { id: 9, name: 'Золотой сейф', type: 'safe', rarity: 'rare' },
        { id: 10, name: 'Золотой сейф', type: 'safe', rarity: 'rare' },
        { id: 11, name: 'Золотой сейф', type: 'safe', rarity: 'rare' }
    ],
    coins: [
        { id: 1, name: 'Горстка монет', type: 'coins', rarity: 'common' },
        { id: 2, name: 'Горстка монет', type: 'coins', rarity: 'common' },
        { id: 3, name: 'Ящик монет', type: 'coins', rarity: 'rare' },
        { id: 4, name: 'Огромный сундук с монетами', type: 'coins', rarity: 'epic' },
        { id: 5, name: 'Огромный сундук с монетами', type: 'coins', rarity: 'epic' }
    ],
    characters: [
        { id: 1, name: 'Редми', type: 'character', rarity: 'common' },
        { id: 2, name: 'Перпи', type: 'character', rarity: 'rare' }
    ]
};

function renderInventoryItems(category = 'safes') {
    const grid = document.getElementById('inventory-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    const items = inventoryItems[category] || [];
    
    items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.style.cssText = `
            background:#e0e0e0;
            border-radius:8px;
            padding:12px;
            display:flex;
            flex-direction:column;
            gap:8px;
            box-shadow:0 2px 4px rgba(0,0,0,.1);
        `;
        
        itemDiv.innerHTML = `
            <div style="font-size:12px;font-weight:600;color:#333;text-align:center;">${item.name}</div>
            <div style="width:100%;height:80px;background:#ccc;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#666;font-size:10px;">Image</div>
            <button class="inventory-item-btn" style="background:#424242;border:none;color:#fff;padding:6px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">Открыть</button>
        `;
        
        // Add click handler for item
        const openBtn = itemDiv.querySelector('.inventory-item-btn');
        openBtn.addEventListener('click', () => {
            alert(`Открываю ${item.name}`);
        });
        
        grid.appendChild(itemDiv);
    });
}

// Inventory tab handlers
document.getElementById('tab-safes').addEventListener('click', () => {
    setActiveInventoryTab('safes');
    renderInventoryItems('safes');
});

document.getElementById('tab-coins').addEventListener('click', () => {
    setActiveInventoryTab('coins');
    renderInventoryItems('coins');
});

document.getElementById('tab-characters').addEventListener('click', () => {
    setActiveInventoryTab('characters');
    renderInventoryItems('characters');
});

function setActiveInventoryTab(tabName) {
    currentInventoryTab = tabName;
    
    // Remove active class from all tabs
    document.querySelectorAll('.inventory-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.style.background = 'none';
    });
    
    // Add active class to selected tab
    const activeTab = document.getElementById(`tab-${tabName}`);
    if (activeTab) {
        activeTab.classList.add('active');
        activeTab.style.background = '#fff';
    }
}

// Inventory panel handlers
document.getElementById('inventory-close').addEventListener('click', () => {
    document.getElementById('inventory-panel').style.display = 'none';
});

document.getElementById('inventory-back').addEventListener('click', () => {
    document.getElementById('inventory-panel').style.display = 'none';
});

// Profile "Перейти" button handler
document.addEventListener('click', (e) => {
    if (e.target.textContent.includes('Перейти')) {
        // Close profile panel
        document.getElementById('profile-panel').style.display = 'none';
        // Open inventory panel
        document.getElementById('inventory-panel').style.display = 'flex';
        renderInventoryItems('safes'); // Default to safes tab
    }
});

// Specific handler for profile "Перейти" button
document.addEventListener('DOMContentLoaded', () => {
    const profileGoButton = document.querySelector('#profile-content button[style*="Перейти"]');
    if (profileGoButton) {
        profileGoButton.addEventListener('click', () => {
            // Close profile panel
            document.getElementById('profile-panel').style.display = 'none';
            // Open inventory panel
            document.getElementById('inventory-panel').style.display = 'flex';
            renderInventoryItems('safes');
        });
    }
});

// Initialize inventory system after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize inventory items
    renderInventoryItems('safes');
    
    // Add specific handler for profile "Перейти" button
    setTimeout(() => {
        const profileGoButton = document.querySelector('#profile-content button');
        if (profileGoButton && profileGoButton.textContent.includes('Перейти')) {
            profileGoButton.addEventListener('click', () => {
                // Close profile panel
                document.getElementById('profile-panel').style.display = 'none';
                // Open inventory panel
                document.getElementById('inventory-panel').style.display = 'flex';
                renderInventoryItems('safes');
            });
        }
    }, 100);
});

// === NAVIGATION ACTIVE STATE MANAGEMENT ===

// Function to open inventory panel
function openInventory() {
    // Close profile panel
    document.getElementById('profile-panel').style.display = 'none';
    // Open inventory panel
    document.getElementById('inventory-panel').style.display = 'flex';
    renderInventoryItems('safes');
}
