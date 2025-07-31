// Основные переменные
let scene, camera, renderer;
let raycaster, pointer = new THREE.Vector2();

// Функция для простого всплывающего уведомления
function showToast(message, duration = 2000) {
    // Создаем элемент уведомления
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #4caf50;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    toast.textContent = message;
    
    // Добавляем в DOM
    document.body.appendChild(toast);
    
    // Показываем
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);
    
    // Скрываем через duration
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, duration);
}

// Данные для заданий
const socialTasks = [
    {
        title: 'Исследовать TG miniAP',
        description: 'Изучите возможности Telegram Mini App',
        reward: '10k',
        progress: 1,
        target: 1
    },
    {
        title: 'Присоединиться к Pismakov Path',
        description: 'Станьте частью сообщества разработчиков',
        reward: '100k',
        progress: 0,
        target: 1
    },
    {
        title: 'Присоединиться к BOOKE Path',
        description: 'Присоединитесь к официальному пути BOOKE',
        reward: '100k',
        progress: 0,
        target: 1
    }
];

const bookeTasks = [
    {
        title: 'Подписаться на BOOKE',
        description: 'Подпишитесь на официальный канал BOOKE',
        reward: '50k',
        progress: 0,
        target: 1
    },
    {
        title: 'Поделиться достижением',
        description: 'Поделитесь своим прогрессом в социальных сетях',
        reward: '25k',
        progress: 0,
        target: 1
    }
];

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

// Inventory data
const inventoryItems = {
    safes: [
        { name: 'Обычный сейф', rarity: 'common', icon: '🔒' },
        { name: 'Золотой сейф', rarity: 'rare', icon: '💰' },
        { name: 'Мистический сейф', rarity: 'epic', icon: '✨' },
        { name: 'Обычный сейф', rarity: 'common', icon: '🔒' }
    ],
    coins: [
        { name: 'Горстка монет', rarity: 'common', icon: '🪙' },
        { name: 'Ящик монет', rarity: 'rare', icon: '📦' },
        { name: 'Огромный сундук', rarity: 'epic', icon: '💎' }
    ],
    characters: [
        { name: 'Реджи', rarity: 'common', icon: '👤' },
        { name: 'Спайки', rarity: 'rare', icon: '👤' },
        { name: 'Блуми', rarity: 'rare', icon: '👤' },
        { name: 'Перпи', rarity: 'epic', icon: '👤' },
        { name: 'Гринни', rarity: 'epic', icon: '👤' }
    ]
};

// Функция для рендеринга предметов инвентаря
function renderInventoryItems(category = 'safes') {
    console.log(`🎯 Rendering inventory items for category: ${category}`);
    
    const grid = document.getElementById('inventory-grid');
    if (!grid) {
        console.error('❌ Inventory grid not found!');
        return;
    }
    
    // Проверяем, что панель инвентаря открыта
    const inventoryPanel = document.getElementById('inventory-panel');
    if (!inventoryPanel || inventoryPanel.style.display === 'none') {
        console.log('⚠️ Inventory panel is not open, skipping render');
        return;
    }
    
    // Очищаем сетку
    grid.innerHTML = '';
    
    // Получаем предметы для выбранной категории
    const items = inventoryItems[category] || [];
    console.log(`📦 Found ${items.length} items for category ${category}`);
    
    if (items.length === 0) {
        console.log('⚠️ No items found for this category');
        grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666; font-size: 16px;">Нет предметов в этой категории</div>';
        return;
    }
    
    // Создаем элементы для каждого предмета
    items.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.style.cssText = `
            background: linear-gradient(135deg, #fff 0%, #f8f8f8 100%);
            border-radius: 12px;
            padding: 12px;
            display: flex;
            flex-direction: row;
            gap: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border: 1px solid #e0e0e0;
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            width: calc(100% - 24px);
            height: 70px;
            align-items: center;
            margin: 0 auto;
        `;
        
        // Добавляем hover эффект
        itemDiv.onmouseover = function() {
            this.style.transform = 'translateY(-6px)';
            this.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
            this.style.borderColor = '#424242';
        };
        
        itemDiv.onmouseout = function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
            this.style.borderColor = '#e0e0e0';
        };
        
        // Иконка предмета (место для PNG)
        const iconDiv = document.createElement('div');
        iconDiv.style.cssText = `
            width: 45px;
            height: 45px;
            background: #f0f0f0;
            border: 2px dashed #ccc;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            color: #999;
            flex-shrink: 0;
        `;
        iconDiv.textContent = 'PNG';
        
        // Контейнер для текста
        const textContainer = document.createElement('div');
        textContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex: 1;
            min-width: 0;
        `;
        
        // Название предмета
        const titleDiv = document.createElement('div');
        titleDiv.style.cssText = `
            font-size: 13px;
            font-weight: 600;
            color: #333;
            line-height: 1.2;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        `;
        titleDiv.textContent = item.name;
        
        // Индикатор редкости
        const rarityDiv = document.createElement('div');
        const rarityColors = {
            common: '#666',
            rare: '#2196F3',
            epic: '#9C27B0'
        };
        rarityDiv.style.cssText = `
            font-size: 9px;
            font-weight: 700;
            color: ${rarityColors[item.rarity] || '#666'};
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 2px 5px;
            background: rgba(255,255,255,0.9);
            border-radius: 6px;
            border: 1px solid ${rarityColors[item.rarity] || '#666'};
            display: inline-block;
            width: fit-content;
        `;
        rarityDiv.textContent = item.rarity;
        
        // Кнопка "Открыть"
        const buttonDiv = document.createElement('button');
        buttonDiv.style.cssText = `
            background: linear-gradient(135deg, #424242 0%, #2d2d2d 100%);
            border: none;
            border-radius: 8px;
            color: #fff;
            padding: 6px 12px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            text-transform: uppercase;
            letter-spacing: 0.3px;
            flex-shrink: 0;
            white-space: nowrap;
        `;
        buttonDiv.textContent = 'Открыть';
        
        // Добавляем hover эффект для кнопки
        buttonDiv.onmouseover = function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
        };
        
        buttonDiv.onmouseout = function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        };
        
        // Добавляем обработчик для кнопки "Открыть"
        buttonDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log(`🎁 Opening ${item.name} (${item.type})`);
            // Здесь можно добавить логику открытия предмета
            showToast(`Открываю ${item.name}!`, 2000);
        });
        
        // Собираем элемент
        itemDiv.appendChild(iconDiv);
        itemDiv.appendChild(textContainer);
        textContainer.appendChild(titleDiv);
        textContainer.appendChild(rarityDiv);
        itemDiv.appendChild(buttonDiv);
        
        // Добавляем в сетку
        grid.appendChild(itemDiv);
    });
    
    console.log(`✅ Rendered ${items.length} items for category ${category}`);
}

// Функция для установки активного таба
function setActiveInventoryTab(category) {
    console.log(`🔄 Setting active inventory tab: ${category}`);
    
    // Проверяем, что панель инвентаря открыта
    const inventoryPanel = document.getElementById('inventory-panel');
    if (!inventoryPanel || inventoryPanel.style.display === 'none') {
        console.log('⚠️ Inventory panel is not open, opening it first...');
        openInventory();
        // Небольшая задержка для рендеринга
        setTimeout(() => {
            setActiveInventoryTab(category);
        }, 100);
        return;
    }
    
    // Убираем активный класс со всех табов
    const allTabs = document.querySelectorAll('.inventory-tab');
    console.log(`📋 Found ${allTabs.length} inventory tabs`);
    
    allTabs.forEach(tab => {
        tab.classList.remove('active');
        tab.style.background = 'transparent';
        tab.style.color = '#666';
        tab.style.boxShadow = 'none';
    });
    
    // Добавляем активный класс к выбранному табу
    const activeTab = document.getElementById(`tab-${category}`);
    if (activeTab) {
        activeTab.classList.add('active');
        activeTab.style.background = '#424242';
        activeTab.style.color = '#fff';
        activeTab.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        console.log(`✅ Active tab ${category} styled successfully`);
    } else {
        console.error(`❌ Active tab tab-${category} not found!`);
        return;
    }
    
    // Рендерим предметы для выбранной категории
    console.log(`🎯 Rendering items for category: ${category}`);
    renderInventoryItems(category);
    
    // Обновляем глобальную переменную
    currentInventoryTab = category;
    console.log(`✅ Current inventory tab set to: ${currentInventoryTab}`);
}

// Функция для открытия инвентаря
function openInventory() {
    console.log('🚀 Opening inventory panel');
    const inventoryPanel = document.getElementById('inventory-panel');
    if (inventoryPanel) {
        inventoryPanel.style.display = 'flex';
        renderInventoryItems('safes');
        setActiveInventoryTab('safes');
        console.log('✅ Inventory panel opened');
    } else {
        console.error('❌ inventory-panel not found!');
    }
}

// Функция для закрытия инвентаря
function closeInventory() {
    console.log('🔒 Closing inventory panel');
    const inventoryPanel = document.getElementById('inventory-panel');
    if (inventoryPanel) {
        inventoryPanel.style.display = 'none';
        console.log('✅ Inventory panel closed');
    } else {
        console.error('❌ inventory-panel not found!');
    }
}

// Функция для открытия инвентаря из профиля
function openInventoryFromProfile() {
    console.log('👤 Opening inventory from profile');
    // Закрываем профиль и открываем инвентарь
    const profilePanel = document.getElementById('profile-panel');
    if (profilePanel) {
        profilePanel.style.display = 'none';
    }
    openInventory();
}

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
function setBalance(v){localStorage.setItem('balance',v);document.getElementById('money-amount').textContent=formatNumber(v);document.getElementById('money-amount').dataset.val=v;document.getElementById('bc-value').textContent=formatNumber(v);

    // Обновляем статистику если панель открыта
    if(window.refreshStatistics) {
        window.refreshStatistics();
    }
    
    // Проверяем выполнение заданий связанных с деньгами
    if(window.onMoneyEarned) {
        window.onMoneyEarned(v);
    }
}

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
        
        // Обновляем статистику если панель открыта
        if(window.refreshStatistics) {
            window.refreshStatistics();
        }
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
    showPanelWithAnimation('shop-panel');
    // Инициализируем магазин при открытии
    setTimeout(initializeShop, 50);
});
document.getElementById('shop-close').addEventListener('click',()=>{
    hidePanelWithAnimation('shop-panel', () => {
    setActiveNavButton(0); // сбрасываем активное состояние
    });
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
    mystic:{cost:150,lvlReq:0, money:[1500,3000],credits:[8,15]},
    legendary:{cost:500,lvlReq:0, money:[5000,10000],credits:[25,50]},
    divine:{cost:1000,lvlReq:0, money:[15000,30000],credits:[75,150]}
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

    // Показываем красивое уведомление с XP
    showPurchaseNotification('Сейф открыт!', {
        money: moneyReward,
        credits: creditReward,
        xp: 10
    }, 'safes');
}

function showPurchaseNotification(title, rewards, itemType = 'safes') {
    const overlay = document.getElementById('crate-overlay');
    
    // Определяем иконку в зависимости от типа товара
    let iconSrc = 'assets/icons/money.png';
    let bgColor = '#2d6a4f';
    let borderColor = '#1b4332';
    
    switch(itemType) {
        case 'safes':
            iconSrc = 'assets/icons/safe.png';
            bgColor = '#424242';
            borderColor = '#2d2d2d';
            break;
        case 'coins':
            iconSrc = 'assets/icons/coin.png';
            bgColor = '#b8860b';
            borderColor = '#8b6914';
            break;
        case 'sets':
            iconSrc = 'assets/icons/gift.png';
            bgColor = '#8e24aa';
            borderColor = '#6a1b9a';
            break;
        default:
            iconSrc = 'assets/icons/check.png';
            bgColor = '#2d6a4f';
            borderColor = '#1b4332';
    }
    
    // Создаем HTML для наград
    let rewardsHTML = '';
    if (rewards.money) {
        rewardsHTML += `<div style="display:flex;align-items:center;gap:8px;margin:8px 0;padding:8px 12px;background:rgba(255,255,255,0.1);border-radius:8px;border:1px solid rgba(255,255,255,0.2);">
            <div style="width:24px;height:24px;background:#ccc;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#666;">PNG</div>
            <span style="font-size:18px;font-weight:600;color:#fff;">+${formatNumber(rewards.money)}$</span>
        </div>`;
    }
    if (rewards.credits) {
        rewardsHTML += `<div style="display:flex;align-items:center;gap:8px;margin:8px 0;padding:8px 12px;background:rgba(255,255,255,0.1);border-radius:8px;border:1px solid rgba(255,255,255,0.2);">
            <div style="width:24px;height:24px;background:#ccc;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#666;">PNG</div>
            <span style="font-size:18px;font-weight:600;color:#fff;">+${rewards.credits}</span>
        </div>`;
    }
    if (rewards.xp) {
        rewardsHTML += `<div style="display:flex;align-items:center;gap:8px;margin:8px 0;padding:8px 12px;background:rgba(255,255,255,0.1);border-radius:8px;border:1px solid rgba(255,255,255,0.2);">
            <div style="width:24px;height:24px;background:#ccc;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#666;">PNG</div>
            <span style="font-size:18px;font-weight:600;color:#fff;">+${rewards.xp} XP</span>
        </div>`;
    }
    
    overlay.innerHTML = `
        <div style="
            background: linear-gradient(135deg, ${bgColor} 0%, ${borderColor} 100%);
            padding: 24px 28px;
            border-radius: 16px;
            text-align: center;
            animation: purchasePop 0.5s ease-out;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            border: 2px solid rgba(255,255,255,0.1);
            max-width: 320px;
            width: 90%;
            position: relative;
            overflow: hidden;
        ">
            <!-- Декоративные элементы -->
            <div style="position:absolute;top:-20px;right:-20px;width:60px;height:60px;background:rgba(255,255,255,0.1);border-radius:50%;"></div>
            <div style="position:absolute;bottom:-30px;left:-30px;width:80px;height:80px;background:rgba(255,255,255,0.05);border-radius:50%;"></div>
            
            <!-- Иконка -->
            <div style="width:64px;height:64px;background:#ccc;border-radius:12px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#666;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
                PNG-image
            </div>
            
            <!-- Заголовок -->
            <h3 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#fff;text-shadow:0 2px 4px rgba(0,0,0,0.3);">
                ${title}
            </h3>
            
            <!-- Награды -->
            <div style="margin-bottom:24px;">
                ${rewardsHTML}
            </div>
            
            <!-- Кнопка -->
            <button id="purchase-ok" style="
                background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
                border: none;
                border-radius: 12px;
                color: #fff;
                font-size: 16px;
                font-weight: 600;
                padding: 12px 32px;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 4px 12px rgba(76,175,80,0.3);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 16px rgba(76,175,80,0.4)'" 
               onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 12px rgba(76,175,80,0.3)'">
                Отлично!
            </button>
        </div>
    `;
    
    overlay.style.display = 'flex';
    overlay.querySelector('#purchase-ok').onclick = () => {
        overlay.style.display = 'none';
    };
}

// Обновляем функцию showCrateOverlay для использования новой системы (обратная совместимость)
function showCrateOverlay(money, credits) {
    showPurchaseNotification('Сейф открыт!', {
        money: money,
        credits: credits,
        xp: 10
    }, 'safes');
}

// Добавляем CSS анимацию для нового уведомления
const stylePurchasePop = document.createElement('style');
stylePurchasePop.textContent = `
@keyframes purchasePop {
    0% {
        transform: scale(0.3) rotate(-10deg);
        opacity: 0;
    }
    50% {
        transform: scale(1.05) rotate(2deg);
    }
    100% {
        transform: scale(1) rotate(0deg);
        opacity: 1;
    }
}
`;
document.head.appendChild(stylePurchasePop);

// === CITY BUILD PANEL ===
const cityPanel=document.getElementById('city-panel');
document.querySelector('#bottom-nav button:nth-child(3)').addEventListener('click',()=>{
    updateCityButtons();
    showPanelWithAnimation('city-panel');
});
document.getElementById('city-close').addEventListener('click',()=>{
    hidePanelWithAnimation('city-panel', () => {
    setActiveNavButton(0); // сбрасываем активное состояние
    });
});

// === CHARACTERS PANEL ===
const charactersPanel=document.getElementById('characters-panel');
document.querySelector('#bottom-nav button:nth-child(2)').addEventListener('click',()=>{
    if (isAnyPanelOpen()) return; // Блокируем если открыта любая панель
    setActiveNavButton(2);
    renderCharacters('all');
    showPanelWithAnimation('characters-panel');
});
document.getElementById('chars-close').addEventListener('click',()=>{
    hidePanelWithAnimation('characters-panel', () => {
    setActiveNavButton(0); // сбрасываем активное состояние
    });
    
    // Сбрасываем активную вкладку персонажей
    document.querySelectorAll('.char-tab').forEach(tab=>{
        tab.style.background='none';
        tab.style.color='#000';
        tab.classList.remove('active');
    });
    document.getElementById('tab-all').style.background='#e0e0e0';
    document.getElementById('tab-all').style.color='#000';
    document.getElementById('tab-all').classList.add('active');
});

function updateCityButtons(){
    const factoryBuilt=localStorage.getItem('factoryBuilt')==='1';
    const factoryBtn = document.getElementById('btn-build-factory');
    if(factoryBtn) {
        factoryBtn.disabled=factoryBuilt;
        factoryBtn.textContent=factoryBuilt?'Построено':'Построить -35k';
    }
    
    const libraryBuilt=localStorage.getItem('libraryBuilt')==='1';
    const libraryBtn = document.getElementById('btn-build-library');
    if(libraryBtn) {
        libraryBtn.disabled=libraryBuilt;
        libraryBtn.textContent=libraryBuilt?'Построено':'Построить -135k';
    }
    
    const statueBuilt=localStorage.getItem('statueBuilt')==='1';
    const statueBtn = document.getElementById('btn-build-statue');
    if(statueBtn) {
        statueBtn.disabled=statueBuilt;
        statueBtn.textContent=statueBuilt?'Построено':'Построить -500k';
    }
}

// build factory
document.getElementById('btn-build-factory').addEventListener('click',()=>{
    if(localStorage.getItem('factoryBuilt')==='1')return;
    const cost=35000;
    if(getBalance()<cost){alert('Недостаточно денег');return;}
    setBalance(getBalance()-cost);
    localStorage.setItem('factoryBuilt','1');
    createFactory();
    updateCityButtons();
});

// build library
document.getElementById('btn-build-library').addEventListener('click',()=>{
    if(localStorage.getItem('libraryBuilt')==='1')return;
    const cost=135000;
    if(getBalance()<cost){alert('Недостаточно денег');return;}
    setBalance(getBalance()-cost);
    localStorage.setItem('libraryBuilt','1');
    alert('Библиотека построена!');
    updateCityButtons();
});

// build statue (звезды)
const STAR_KEY='stars';
function getStars(){return parseInt(localStorage.getItem(STAR_KEY)||'0');}
function setStars(v){localStorage.setItem(STAR_KEY,v);} // пока без UI
document.getElementById('btn-build-statue').addEventListener('click',()=>{
    const cost=500000;
    if(localStorage.getItem('statueBuilt')==='1')return;
    if(getBalance()<cost){alert('Недостаточно денег');return;}
    setBalance(getBalance()-cost);
    localStorage.setItem('statueBuilt','1');
    alert('Статуя построена!');
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
        
        // Обновляем статистику если панель открыта
        if(window.refreshStatistics) {
            window.refreshStatistics();
        }
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

    document.getElementById('btn-phone').addEventListener('click',()=>{
        phonePanel.style.display = 'flex';
        showHome();
        toggleCircles(false);
        setActiveSideButton('btn-phone');
    });
    document.getElementById('phone-close').addEventListener('click',()=>{
        phonePanel.style.display = 'none';
        toggleCircles(true);
        clearActiveSideButton();
    });
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
    // Используем единую функцию синхронизации
    syncLevelAndXP();
    
    // Загружаем информацию о пользователе (ID и никнейм)
    loadUserInfo();
    
    // Обновляем статистику если панель открыта
    if(window.refreshStatistics) {
        window.refreshStatistics();
    }
}

// Функция для синхронизации уровня и ХП между профилем и статистикой
function syncLevelAndXP() {
    // Получаем данные игрока
    const currentPlayerLevel = parseInt(localStorage.getItem('playerLevel') || '1');
    const currentPlayerXP = parseInt(localStorage.getItem('playerXP') || '0');
    
    // Функция для расчета XP для следующего уровня
    const XP_BASE = 20;
    function xpForLevel(lvl) {
        if (lvl <= 1) return 0;
        if (lvl === 2) return XP_BASE;
        const mult = Math.pow(1.25, lvl - 2);
        return Math.round(XP_BASE * mult);
    }
    
    // Рассчитываем XP для текущего и следующего уровня
    const currentLevelXP = xpForLevel(currentPlayerLevel);
    const nextLevelXP = xpForLevel(currentPlayerLevel + 1);
    const xpInCurrentLevel = currentPlayerXP - currentLevelXP;
    const xpToNextLevel = nextLevelXP - currentPlayerXP;
    
    // Рассчитываем прогресс (процент заполнения текущего уровня)
    const progressPercent = nextLevelXP > currentLevelXP ? 
        ((currentPlayerXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100 : 0;
    
    // === ОБНОВЛЕНИЕ ПРОФИЛЯ ===
    // Обновляем номер уровня в круге профиля
    const profileLevelNumber = document.querySelector('.profile-level-number');
    if (profileLevelNumber) {
        profileLevelNumber.textContent = currentPlayerLevel;
    }
    
    // Обновляем текст уровня в профиле
    const profileLevelText = document.querySelector('.profile-level-text');
    if (profileLevelText) {
        profileLevelText.textContent = `Уровень ${currentPlayerLevel}`;
    }
    
    // Обновляем прогресс-бар XP в профиле
    const profileXpProgressBar = document.querySelector('.profile-xp-progress-bar');
    if (profileXpProgressBar) {
        profileXpProgressBar.style.width = `${Math.min(100, Math.max(0, progressPercent))}%`;
    }
    
    // Обновляем информацию об XP в профиле
    const profileCurrentXp = document.querySelector('.profile-current-xp');
    if (profileCurrentXp) {
        profileCurrentXp.textContent = xpInCurrentLevel;
    }
    
    const profileNextLevelXp = document.querySelector('.profile-next-level-xp');
    if (profileNextLevelXp) {
        profileNextLevelXp.textContent = nextLevelXP - currentLevelXP;
    }
    
    const profileXpToNext = document.querySelector('.profile-xp-to-next');
    if (profileXpToNext) {
        profileXpToNext.textContent = xpToNextLevel;
    }
    
    const profileXpToNextBottom = document.querySelector('.profile-xp-to-next-bottom');
    if (profileXpToNextBottom) {
        profileXpToNextBottom.textContent = xpToNextLevel;
    }
    
    // === ОБНОВЛЕНИЕ СТАТИСТИКИ ===
    // Обновляем отображение уровня в статистике
    const statsLevelProgress = document.querySelector('#statistics-panel .level-progress');
    if (statsLevelProgress) {
        const statsLevelNumber = statsLevelProgress.querySelector('.level-number');
        if (statsLevelNumber) {
            statsLevelNumber.textContent = currentPlayerLevel;
        }
    }
    
    const statsLevelText = document.querySelector('#statistics-panel .level-text');
    if (statsLevelText) {
        statsLevelText.textContent = `Уровень ${currentPlayerLevel}`;
    }
    
    // Обновляем прогресс-бар XP в статистике
    const statsXpProgressBar = document.querySelector('#statistics-panel .xp-progress-bar');
    if (statsXpProgressBar) {
        statsXpProgressBar.style.width = `${Math.min(100, Math.max(0, progressPercent))}%`;
    }
    
    // Обновляем информацию об XP в статистике
    const statsCurrentXp = document.querySelector('#statistics-panel .current-xp');
    if (statsCurrentXp) {
        statsCurrentXp.textContent = xpInCurrentLevel;
    }
    
    const statsNextLevelXp = document.querySelector('#statistics-panel .next-level-xp');
    if (statsNextLevelXp) {
        statsNextLevelXp.textContent = nextLevelXP - currentLevelXP;
    }
    
    const statsXpToNext = document.querySelector('#statistics-panel .xp-to-next');
    if (statsXpToNext) {
        statsXpToNext.textContent = xpToNextLevel;
    }
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
    syncLevelAndXP(); // Используем единую функцию синхронизации
    if(gained>0) enqueueLevelAnimations(startLvl,gained);
    
    // Обновляем статистику если панель открыта
    if(window.refreshStatistics) {
        window.refreshStatistics();
    }
}

// кнопки профиля
const profileBtn=document.querySelector('#bottom-nav button:nth-child(5)');
if(profileBtn){profileBtn.addEventListener('click',()=>{
    updateProfileUI(); // Обновляем данные профиля перед открытием
    showPanelWithAnimation('profile-panel');
});}
const profileClose=document.getElementById('profile-close');
if(profileClose){profileClose.addEventListener('click',()=>{hidePanelWithAnimation('profile-panel');});}
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

function addToStorage(type,qty,unitCost){
    if(!canStore(qty)) return false; 
    if(type==='books') {
        storedBooks+=qty; 
        // Проверяем, была ли напечатана первая книга
        if (storedBooks === qty && window.onBookPrinted) {
            window.onBookPrinted();
        }
    } else {
        storedMags+=qty; 
    }
    saleQueue.push({type,qty,originalQty:qty,unitCost,revenue:0,defective:0}); 
    saveStorage();
    updateStorageUI(); 
    scheduleSale(); 
    return true;
}

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
function refreshDeliveryList(){const cont=document.getElementById('orders-container');if(!cont) return;cont.innerHTML='';if(orders.length===0){cont.innerHTML='<p style="text-align:center;width:100%;opacity:.6">Нет заказов</p>';return;}orders.forEach((o,idx)=>{const div=document.createElement('div');div.className='order-item';div.innerHTML=`<span>${o.type==='books'?'Книги':'Журналы'} ×${o.qty}</span><span>${formatNumber(o.cost)}$</span>`;cont.appendChild(div);});}
function collectSelected(){const checkboxes=[...document.querySelectorAll('#orders-container input[type=checkbox]')];const selIdxs=checkboxes.filter(ch=>ch.checked).map(ch=>parseInt(ch.dataset.idx));if(selIdxs.length===0){alert('Ничего не выбрано');return;} let totalQty=0;selIdxs.forEach(i=>{totalQty+=orders[i].qty;});if(!canStore(totalQty)){alert('Недостаточно места в хранилище');return;} // добавить партии
const newOrders=[];orders.forEach((o,i)=>{if(selIdxs.includes(i)){const unit=o.cost/o.qty;addToStorage(o.type,o.qty,unit);}else newOrders.push(o);});orders=newOrders;saveOrders();refreshDeliveryList();}
// переопределяем collect-all
const collectAllBtn=document.getElementById('btn-collect-all');if(collectAllBtn){collectAllBtn.onclick=()=>{let total=0;orders.forEach(o=>total+=o.qty);if(!canStore(total)){alert('Недостаточно места в хранилище');return;}orders.forEach(o=>{const unit=o.cost/o.qty;addToStorage(o.type,o.qty,unit);});orders=[];saveOrders();refreshDeliveryList();};} 

const STORAGE_BASE_COST=1000;const STORAGE_RATE=1.25;const STORAGE_INC=500;
function storageNextCost(){return Math.round(STORAGE_BASE_COST*Math.pow(STORAGE_RATE,storageUpgrades));}
function updateStorageUpgradeCost(){const c=storageNextCost();document.getElementById('storage-upgrade-cost').textContent=formatNumber(c);const afford=getBalance()>=c;document.getElementById('storage-upgrade-btn').disabled=!afford;document.getElementById('storage-upgrade-btn').style.opacity=afford?1:0.5;}
function upgradeStorage(){const cost=storageNextCost();if(getBalance()<cost){alert('Недостаточно денег');return;}setBalance(getBalance()-cost);storageUpgrades++;storageCapacity=STORAGE_BASE_CAP+storageUpgrades*STORAGE_INC;saveStorage();updateStorageUI();updateStorageUpgradeCost();addXP(storageUpgrades);

    // Обновляем статистику если панель открыта
    if(window.refreshStatistics) {
        window.refreshStatistics();
    }
}
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
 {name:'Блуми',  level:parseInt(localStorage.getItem('employee_bloomi_level')||'1'), skill:'Бегущая почта',     rarity:1, img:'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRkY5ODAwIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QjwvdGV4dD4KPC9zdmc+'},
 {name:'Реджи', level:parseInt(localStorage.getItem('employee_reggi_level')||'1'), skill:'Калькулятор',       rarity:1, img:'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRkY1NzIyIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UjwvdGV4dD4KPC9zdmc+'},
 {name:'Спайки', level:parseInt(localStorage.getItem('employee_spikes_level')||'1'), skill:'Логистика',        rarity:3, img:'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRkY1NzIyIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UzwvdGV4dD4KPC9zdmc+'},
 {name:'Гринни',  level:parseInt(localStorage.getItem('employee_grinni_level')||'1'), skill:'Лояльность',        rarity:3, img:'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjNENBRjUwIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RzwvdGV4dD4KPC9zdmc+'},
 {name:'Перпи',  level:parseInt(localStorage.getItem('employee_perpi_level')||'1'), skill:'Мастер-фломастер',  rarity:5, img:'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjOUMyN0IwIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UDwvdGV4dD4KPC9zdmc+'},
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
            'Гринни': '#4caf50',  // зеленый
            'Спайки': '#2196f3'  // синий
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
        
        // Проверяем, был ли нанят Реджи
        if (empName === 'Реджи' && window.onReggiHired) {
            window.onReggiHired();
        }
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

function starsHTML(r){let s='';for(let i=1;i<=5;i++){s+=i<=r?'★':'☆';}return `<span style="color:#000;font-size:12px">${s}</span>`;}

function renderCharacters(filter = 'all'){
    const container = document.getElementById('chars-list');
    container.innerHTML = '';
    
    if(filter === 'suitable') {
        // Показываем рекомендации для подходящих персонажей
        const recommendationsDiv = document.createElement('div');
        recommendationsDiv.innerHTML = `
            <div style="background:#5a5a5a;border-radius:20px;padding:20px;text-align:center;color:#fff;">
                <h3 style="margin:0 0 16px;font-size:18px;font-weight:700;">Рекомендации</h3>
                <div style="font-size:14px;color:#fff;margin-bottom:12px;">
                    <p style="margin:0 0 8px;">⭐ Оптимизируйте команду для максимальной эффективности</p>
                    <p style="margin:0 0 8px;">⭐ Выбирайте персонажей с подходящими навыками</p>
                    <p style="margin:0 0 8px;">⭐ Учитывайте редкость и уровень персонажей</p>
                </div>
                <div style="font-size:12px;color:#ccc;">
                    <p style="margin:0;">Используйте фильтры для поиска идеальных кандидатов</p>
                </div>
            </div>
        `;
        container.appendChild(recommendationsDiv);
        return;
    }
    
    // Список персонажей
    const characters = [
        {name: 'Блуми', level: 12, skill: 'Бегущая почта', rarity: 1},
        {name: 'Реджи', level: 1, skill: 'Калькулятор', rarity: 1},
        {name: 'Перпи', level: 5, skill: 'Мастер-фломастер', rarity: 4},
        {name: 'Грини', level: 8, skill: 'Быстрый набор', rarity: 2},
        {name: 'Спайки', level: 15, skill: 'Логистика', rarity: 3}
    ];
    
    characters.forEach(char => {
        const item = document.createElement('div');
        item.style.cssText='background:#fff;border-radius:12px;padding:16px;display:flex;gap:12px;align-items:center;position:relative;box-shadow:0 2px 4px rgba(0,0,0,.1);';
        
        item.innerHTML = `
            <div style="width:70px;height:70px;background:#ccc;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#666;position:absolute;left:-8px;top:50%;transform:translateY(-50%);">PNG-image</div>
            <div style="flex:1;margin-left:62px;">
                <h3 style="margin:0 0 8px;font-size:16px;font-weight:700;color:#2d2d2d;">${char.name}</h3>
                <div style="display:flex;justify-content:space-between;font-size:14px;color:#666;margin-bottom:4px;">
                    <span>Уровень</span>
                    <span style="font-weight:600;color:#2d2d2d;">${char.level}</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:14px;color:#666;margin-bottom:4px;">
                    <span>Навык</span>
                    <span style="font-weight:600;color:#2d2d2d;">${char.skill}</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:14px;color:#666;align-items:center;">
                    <span>Редкость</span>
                    <span style="color:#000;font-weight:600;">${starsHTML(char.rarity)}</span>
                </div>
            </div>
        `;
        
        container.appendChild(item);
    });
}

// Tab switching for characters
document.getElementById('tab-all').addEventListener('click',()=>{
    document.querySelectorAll('.char-tab').forEach(tab=>{
        tab.style.background='none';
        tab.style.color='#000';
        tab.classList.remove('active');
    });
    document.getElementById('tab-all').style.background='#e0e0e0';
    document.getElementById('tab-all').style.color='#000';
    document.getElementById('tab-all').classList.add('active');
    renderCharacters('all');
});

document.getElementById('tab-suitable').addEventListener('click',()=>{
    document.querySelectorAll('.char-tab').forEach(tab=>{
        tab.style.background='none';
        tab.style.color='#000';
        tab.classList.remove('active');
    });
    document.getElementById('tab-suitable').style.background='#e0e0e0';
    document.getElementById('tab-suitable').style.color='#000';
    document.getElementById('tab-suitable').classList.add('active');
    renderCharacters('suitable');
});

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
    showPanelWithAnimation('tasks-panel');
});
document.getElementById('tasks-back').addEventListener('click',()=>{
    hidePanelWithAnimation('tasks-panel', () => {
    setActiveNavButton(0); // сбрасываем активное состояние
    });
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
    const container = document.getElementById('tasks-list');
    container.innerHTML = '';
    
    const tasks = category === 'social' ? socialTasks : bookeTasks;
    
    tasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.style.cssText = 'background:#5a5a5a;border-radius:16px;padding:16px;margin-bottom:8px;color:#fff;';
        
        taskDiv.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <h4 style="margin:0;font-size:16px;font-weight:700;color:#fff;">${task.title}</h4>
                <span style="background:#2d2d2d;color:#fff;padding:4px 8px;border-radius:6px;font-size:12px;font-weight:600;">${task.reward}</span>
            </div>
            <p style="margin:0 0 12px;font-size:14px;color:#ccc;line-height:1.4;">${task.description}</p>
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:12px;color:#ccc;">Прогресс: ${task.progress}/${task.target}</span>
                <button style="background:#2d2d2d;border:none;color:#fff;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;${task.progress >= task.target ? '' : 'opacity:0.5;cursor:not-allowed;'}">${task.progress >= task.target ? 'Получить' : 'В процессе'}</button>
            </div>
        `;
        
        container.appendChild(taskDiv);
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

// === SIDE PANEL ACTIVE STATE MANAGEMENT ===
function setActiveSideButton(buttonId) {
    // Убираем активное состояние со всех кнопок боковой панели
    document.querySelectorAll('.side-btn').forEach((btn) => {
        btn.classList.remove('panel-active');
    });
    
    // Устанавливаем активное состояние для выбранной кнопки
    const activeButton = document.getElementById(buttonId);
    if (activeButton) {
        activeButton.classList.add('panel-active');
    }
}

function clearActiveSideButton() {
    // Убираем активное состояние со всех кнопок боковой панели
    document.querySelectorAll('.side-btn').forEach((btn) => {
        btn.classList.remove('panel-active');
    });
}

// === BOTTOM NAVIGATION HANDLERS ===
// Магазин (1-я кнопка)
document.querySelector('#bottom-nav button:nth-child(1)').addEventListener('click',()=>{
    if (isAnyPanelOpen()) return; // Блокируем если открыта любая панель
    setActiveNavButton(1);
    showPanelWithAnimation('shop-panel');
    // Инициализируем магазин при открытии
    setTimeout(initializeShop, 50);
});

// Персонажи (2-я кнопка)
document.querySelector('#bottom-nav button:nth-child(2)').addEventListener('click',()=>{
    if (isAnyPanelOpen()) return; // Блокируем если открыта любая панель
    setActiveNavButton(2);
    renderCharacters('all');
    showPanelWithAnimation('characters-panel');
});

// Город (3-я кнопка)
document.querySelector('#bottom-nav button:nth-child(3)').addEventListener('click',()=>{
    if (isAnyPanelOpen()) return; // Блокируем если открыта любая панель
    setActiveNavButton(3);
    updateCityButtons();
    showPanelWithAnimation('city-panel');
});

// Задания (4-я кнопка)
document.querySelector('#bottom-nav button:nth-child(4)').addEventListener('click',()=>{
    if (isAnyPanelOpen()) return; // Блокируем если открыта любая панель
    setActiveNavButton(4);
    renderTasks();
    showPanelWithAnimation('tasks-panel');
});

// Профиль (5-я кнопка)
document.querySelector('#bottom-nav button:nth-child(5)').addEventListener('click',()=>{
    if (isAnyPanelOpen()) return; // Блокируем если открыта любая панель
    setActiveNavButton(5);
    showPanelWithAnimation('profile-panel');
});

// === PANEL CLOSE HANDLERS ===
// Закрытие панелей сбрасывает активное состояние
document.getElementById('shop-close').addEventListener('click',()=>{
    hidePanelWithAnimation('shop-panel', () => {
    setActiveNavButton(0); // сбрасываем активное состояние
    });
});

document.getElementById('chars-close').addEventListener('click',()=>{
    hidePanelWithAnimation('characters-panel', () => {
    setActiveNavButton(0); // сбрасываем активное состояние
    });
});

document.getElementById('city-close').addEventListener('click',()=>{
    hidePanelWithAnimation('city-panel', () => {
    setActiveNavButton(0); // сбрасываем активное состояние
    });
});

document.getElementById('tasks-back').addEventListener('click',()=>{
    hidePanelWithAnimation('tasks-panel', () => {
    setActiveNavButton(0); // сбрасываем активное состояние
    });
});

document.getElementById('profile-close').addEventListener('click',()=>{
    hidePanelWithAnimation('profile-panel', () => {
    setActiveNavButton(0); // сбрасываем активное состояние
    });
});

// === INVENTORY SYSTEM ===
let currentInventoryTab = 'safes';

// Инициализация обработчиков событий для инвентаря
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 === Initializing Inventory System ===');
    
    // Инициализируем инвентарь
        renderInventoryItems('safes');
        setActiveInventoryTab('safes');
    
    // Обработчики для табов
    const tabSafes = document.getElementById('tab-safes');
    const tabCoins = document.getElementById('tab-coins');
    const tabCharacters = document.getElementById('tab-characters');
    
    console.log('📋 Inventory tabs found:', {
        safes: !!tabSafes,
        coins: !!tabCoins,
        characters: !!tabCharacters
    });
    
    if (tabSafes) {
        tabSafes.addEventListener('click', () => {
            console.log('🔒 === Safes tab clicked ===');
            setActiveInventoryTab('safes');
        });
        console.log('✅ Safes tab event listener added');
    }
    
    if (tabCoins) {
        tabCoins.addEventListener('click', () => {
            console.log('🪙 === Coins tab clicked ===');
            setActiveInventoryTab('coins');
        });
        console.log('✅ Coins tab event listener added');
    }
    
    if (tabCharacters) {
        tabCharacters.addEventListener('click', () => {
            console.log('👤 === Characters tab clicked ===');
            setActiveInventoryTab('characters');
        });
        console.log('✅ Characters tab event listener added');
    }
    
    // Обработчики для кнопок закрытия
    const inventoryClose = document.getElementById('inventory-close');
    const inventoryBack = document.getElementById('inventory-back');
    
    console.log('🔘 Inventory buttons found:', {
        close: !!inventoryClose,
        back: !!inventoryBack
    });
    
    if (inventoryClose) {
        inventoryClose.addEventListener('click', () => {
            console.log('❌ === Inventory close button clicked ===');
            closeInventory();
        });
        console.log('✅ Close button event listener added');
    }
    
    if (inventoryBack) {
        inventoryBack.addEventListener('click', () => {
            console.log('⬅️ === Inventory back button clicked ===');
            closeInventory();
        });
        console.log('✅ Back button event listener added');
    }
    
    // Обработчик для кнопки инвентаря в профиле
    setTimeout(() => {
        const profileInventoryBtn = document.getElementById('profile-inventory-btn');
        if (profileInventoryBtn) {
            console.log('👤 Found profile inventory button, adding click handler');
            profileInventoryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🎯 Profile inventory button clicked');
                openInventoryFromProfile();
            });
        } else {
            console.error('❌ Profile inventory button not found!');
        }
    }, 100);
    
    console.log('🎉 Inventory system initialized successfully');
});

// === NAVIGATION ACTIVE STATE MANAGEMENT ===

// === SHOP PANEL ===
// Обработчики для новой панели магазина
function initializeShop() {
    console.log('Initializing shop...');
    
    // Инициализация карточек товаров в магазине
    initializeShopCards();
    
    // Удаляем старые обработчики, если они есть
    document.querySelectorAll('.shop-buy-btn').forEach(btn => {
        btn.removeEventListener('click', shopBuyHandler);
    });
    
    document.querySelectorAll('.shop-nav-btn').forEach(btn => {
        btn.removeEventListener('click', shopNavHandler);
    });
    
    // Добавляем новые обработчики кнопок покупки
    document.querySelectorAll('.shop-buy-btn').forEach(btn => {
        btn.addEventListener('click', shopBuyHandler);
    });
    
    // Добавляем новые обработчики кнопок навигации
    document.querySelectorAll('.shop-nav-btn').forEach(btn => {
        btn.addEventListener('click', shopNavHandler);
    });
    
    console.log('Shop initialized successfully');
}

// Обработчик покупки товаров
function shopBuyHandler(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const itemType = this.getAttribute('data-item');
    console.log('Shop buy button clicked:', itemType);
    handleShopPurchase(itemType);
}

// Обработчик навигации по товарам
function shopNavHandler(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const direction = this.textContent === '→' ? 'next' : 'prev';
    const card = this.closest('.shop-item-card');
    if (card) {
        const section = card.getAttribute('data-section');
        const currentIndex = parseInt(card.getAttribute('data-index') || '0');
        console.log('Shop nav button clicked:', section, currentIndex, direction);
        navigateShopItem(section, currentIndex, direction);
    }
}

// Инициализация карточек товаров в магазине
function initializeShopCards() {
    const sections = ['safes', 'coins', 'sets'];
    sections.forEach(section => {
        updateShopCard(section, 0);
    });
}

// Функция навигации по товарам
function navigateShopItem(section, currentIndex, direction) {
    const items = getShopItems(section);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    // Циклическая навигация
    if (newIndex >= items.length) newIndex = 0;
    if (newIndex < 0) newIndex = items.length - 1;
    
    updateShopCard(section, newIndex);
}

// Получение списка товаров для секции
function getShopItems(section) {
    switch(section) {
        case 'safes':
            return [
                { name: 'Обычный сейф', cost: 0, rarity: 1, type: 'free' },
                { name: 'Золотой сейф', cost: 30000, rarity: 2, type: 'gold' },
                { name: 'Мистический сейф', cost: 150000, rarity: 3, type: 'mystic' },
                { name: 'Легендарный сейф', cost: 500000, rarity: 4, type: 'legendary' },
                { name: 'Божественный сейф', cost: 1000000, rarity: 5, type: 'divine' }
            ];
        case 'coins':
            return [
                { name: 'Горстка монет', cost: 10000, rarity: 1, coins: 50 },
                { name: 'Сундук монет', cost: 35000, rarity: 3, coins: 100 },
                { name: 'Ящик монет', cost: 75000, rarity: 4, coins: 200 },
                { name: 'Огромный сундук', cost: 150000, rarity: 5, coins: 500 }
            ];
        case 'sets':
            return [
                { name: 'Набор Блуми', cost: 500, rarity: 1, character: 'Блуми' },
                { name: 'Набор Реджи', cost: 1000, rarity: 2, character: 'Реджи' },
                { name: 'Набор Перпи', cost: 2500, rarity: 3, character: 'Перпи' },
                { name: 'Набор Грини', cost: 5000, rarity: 4, character: 'Грини' },
                { name: 'Легендарный набор', cost: 10000, rarity: 5, character: 'Легендарный' }
            ];
        default:
            return [];
    }
}

// Обновление карточки товара
function updateShopCard(section, index) {
    const items = getShopItems(section);
    const item = items[index];
    const card = document.querySelector(`[data-section="${section}"]`);
    
    if (!card || !item) return;
    
    card.setAttribute('data-index', index);
    
    // Обновляем содержимое карточки
    const nameEl = card.querySelector('.item-name');
    const costEl = card.querySelector('.item-cost');
    const rarityEl = card.querySelector('.item-rarity');
    const buyBtn = card.querySelector('.shop-buy-btn');
    
    if (nameEl) nameEl.textContent = item.name;
    if (costEl) {
        if (section === 'safes' && item.cost === 0) {
            costEl.innerHTML = 'БЕСПЛАТНО';
        } else {
            costEl.innerHTML = `<i class="fa-solid fa-eye" style="color:#666;"></i> ${formatNumber(item.cost)}`;
        }
    }
    if (rarityEl) {
        const rarityText = getRarityText(item.rarity);
        const stars = '★'.repeat(item.rarity) + '☆'.repeat(5 - item.rarity);
        rarityEl.innerHTML = `${rarityText} ${stars}`;
    }
    if (buyBtn) {
        buyBtn.setAttribute('data-item', `${section}-${item.type || index}`);
    }
    
    // Специальная обработка для наборов
    if (section === 'sets') {
        const priceEl = card.querySelector('.set-price');
        if (priceEl) {
            priceEl.textContent = `${formatNumber(item.cost)}$`;
        }
    }
}

// Получение текста редкости
function getRarityText(rarity) {
    switch(rarity) {
        case 1: return 'Обычные';
        case 2: return 'Редкие';
        case 3: return 'Уникальные';
        case 4: return 'Эпические';
        case 5: return 'Легендарные';
        default: return 'Обычные';
    }
}

function handleShopPurchase(itemType) {
    const [section, type] = itemType.split('-');
    const card = document.querySelector(`[data-section="${section}"]`);
    const index = parseInt(card?.getAttribute('data-index') || '0');
    const items = getShopItems(section);
    const item = items[index];
    
    if (!item) return;
    
    switch(section) {
        case 'safes':
            // Проверяем баланс RBC для платных сейфов
            if (item.cost > 0 && getCredits() < item.cost) {
                alert('Недостаточно RBC');
                return;
            }
            openCrate(item.type);
            break;
        case 'coins':
            if(getBalance() < item.cost) {
                alert('Недостаточно денег');
                return;
            }
            setBalance(getBalance() - item.cost);
            setCredits(getCredits() + item.coins);
            
            // Начисляем XP за покупку монет (зависит от редкости)
            const coinXP = item.rarity * 2; // 2 XP за каждую звезду редкости
            addXP(coinXP);
            
            // Показываем красивое уведомление о покупке монет
            showPurchaseNotification('Монеты получены!', {
                credits: item.coins,
                xp: coinXP
            }, 'coins');
            break;
        case 'sets':
            if(getBalance() < item.cost) {
                alert('Недостаточно денег');
                return;
            }
            setBalance(getBalance() - item.cost);
            // Даем награды в зависимости от редкости
            const baseReward = item.cost * (1 + item.rarity * 0.5);
            const rewards = Math.floor(baseReward + Math.random() * baseReward * 0.5);
            setBalance(getBalance() + rewards);
            
            // Начисляем XP за покупку набора (зависит от редкости)
            const setXP = item.rarity * 5; // 5 XP за каждую звезду редкости
            addXP(setXP);
            
            // Показываем красивое уведомление о покупке набора
            showPurchaseNotification(`${item.character} куплен!`, {
                money: rewards,
                xp: setXP
            }, 'sets');
            
            // Проверяем, был ли куплен диван (если это набор с диваном)
            if (item.character && item.character.toLowerCase().includes('диван') && window.onSofaBought) {
                window.onSofaBought();
            }
            break;
        default:
            console.log('Unknown item type:', itemType);
    }
}

// Функция для обновления уровней сотрудников
function updateEmployeeLevels() {
    // Обновляем массив employees с актуальными уровнями
    employees.forEach(emp => {
        const employeeKey = emp.name.toLowerCase().replace('ё', 'е');
        const level = parseInt(localStorage.getItem(`employee_${employeeKey}_level`) || '1');
        emp.level = level;
    });
    
    // Обновляем отображение в панели статистики
    if (window.employeeLevels && window.employeeLevels.updateAll) {
        window.employeeLevels.updateAll();
    }
}

// Функция для увеличения уровня сотрудника
function increaseEmployeeLevel(employeeName, amount = 1) {
    const employeeKey = employeeName.toLowerCase().replace('ё', 'е');
    const currentLevel = parseInt(localStorage.getItem(`employee_${employeeKey}_level`) || '1');
    const newLevel = currentLevel + amount;
    
    localStorage.setItem(`employee_${employeeKey}_level`, newLevel.toString());
    
    // Обновляем массив employees
    const employee = employees.find(emp => emp.name.toLowerCase().replace('ё', 'е') === employeeKey);
    if (employee) {
        employee.level = newLevel;
    }
    
    // Обновляем отображение
    updateEmployeeLevels();
    
    return newLevel;
}

// Экспортируем функции для использования в других файлах
window.updateEmployeeLevels = updateEmployeeLevels;
window.increaseEmployeeLevel = increaseEmployeeLevel;

// === NICKNAME EDITING SYSTEM ===

// Функция для генерации уникального ID пользователя
function generateUniqueUserId() {
    // Проверяем, есть ли уже сохраненный ID в localStorage
    let userId = localStorage.getItem('uniqueUserId');
    
    if (!userId) {
        // Генерируем новый уникальный ID
        // Используем timestamp + случайное число для уникальности
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        userId = timestamp + random;
        
        // Сохраняем в localStorage
        localStorage.setItem('uniqueUserId', userId);
    }
    
    return parseInt(userId);
}

let currentUserId = generateUniqueUserId(); // Уникальный ID пользователя

// Функция для получения никнейма пользователя
async function loadUserNickname() {
    try {
        const response = await fetch(`api/get_nickname.php?userId=${currentUserId}`);
        const data = await response.json();
        
        if (data.success && data.nickname) {
            const nicknameElement = document.getElementById('profile-nickname');
            if (nicknameElement) {
                nicknameElement.textContent = data.nickname;
            }
        }
    } catch (error) {
        console.error('Error loading nickname:', error);
    }
}

// Функция для загрузки информации о пользователе (ID, никнейм)
async function loadUserInfo() {
    try {
        const response = await fetch(`api/get_user_info.php?userId=${currentUserId}`);
        const data = await response.json();
        
        if (data.success) {
            // Обновляем ID пользователя - используем ID из базы данных
            const userIdElement = document.getElementById('profile-user-id');
            if (userIdElement) {
                userIdElement.textContent = `ID ${data.userId}`;
            }
            
            // Обновляем никнейм если он есть
            if (data.nickname) {
                const nicknameElement = document.getElementById('profile-nickname');
                if (nicknameElement) {
                    nicknameElement.textContent = data.nickname;
                }
            }
            
            // Обновляем ID в настройках
            const settingsUserIdElement = document.getElementById('settings-userid');
            if (settingsUserIdElement) {
                settingsUserIdElement.textContent = data.userId;
            }
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

// Функция для обновления никнейма
async function updateUserNickname(newNickname) {
    try {
        const response = await fetch('api/update_nickname.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUserId,
                nickname: newNickname
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Обновляем отображение никнейма
            const nicknameElement = document.getElementById('profile-nickname');
            if (nicknameElement) {
                nicknameElement.textContent = data.nickname;
            }
            
            // Обновляем ID в настройках
            const settingsUserIdElement = document.getElementById('settings-userid');
            if (settingsUserIdElement) {
                settingsUserIdElement.textContent = currentUserId;
            }
            
            // Закрываем модальное окно
            document.getElementById('nickname-edit-modal').style.display = 'none';
            
            // Показываем простое уведомление об успехе
            showToast('Никнейм успешно обновлен!');
            
            return true;
        } else {
            throw new Error(data.error || 'Unknown error');
        }
    } catch (error) {
        console.error('Error updating nickname:', error);
        return false;
    }
}

// Обработчик кнопки редактирования никнейма
const editNicknameBtn = document.getElementById('edit-nickname-btn');
if (editNicknameBtn) {
    editNicknameBtn.addEventListener('click', () => {
        const modal = document.getElementById('nickname-edit-modal');
        const input = document.getElementById('nickname-input');
        const errorDiv = document.getElementById('nickname-error');
        
        // Очищаем предыдущие ошибки
        errorDiv.textContent = '';
        
        // Устанавливаем текущий никнейм в поле ввода
        const currentNickname = document.getElementById('profile-nickname').textContent;
        input.value = currentNickname;
        
        // Открываем модальное окно
        modal.style.display = 'flex';
        
        // Фокусируемся на поле ввода
        setTimeout(() => {
            input.focus();
            input.select();
        }, 100);
    });
}

// Обработчик кнопки отмены
const nicknameCancelBtn = document.getElementById('nickname-cancel');
if (nicknameCancelBtn) {
    nicknameCancelBtn.addEventListener('click', () => {
        document.getElementById('nickname-edit-modal').style.display = 'none';
    });
}

// Обработчик кнопки сохранения
const nicknameSaveBtn = document.getElementById('nickname-save');
if (nicknameSaveBtn) {
    nicknameSaveBtn.addEventListener('click', async () => {
        const input = document.getElementById('nickname-input');
        const errorDiv = document.getElementById('nickname-error');
        const newNickname = input.value.trim();
        
        // Валидация
        if (!newNickname) {
            errorDiv.textContent = 'Никнейм не может быть пустым';
            return;
        }
        
        if (newNickname.length > 50) {
            errorDiv.textContent = 'Никнейм не может быть длиннее 50 символов';
            return;
        }
        
        // Показываем индикатор загрузки
        nicknameSaveBtn.textContent = 'Сохранение...';
        nicknameSaveBtn.disabled = true;
        
        // Обновляем никнейм
        const success = await updateUserNickname(newNickname);
        
        if (!success) {
            errorDiv.textContent = 'Ошибка при сохранении никнейма';
            nicknameSaveBtn.textContent = 'Сохранить';
            nicknameSaveBtn.disabled = false;
        }
    });
}

// Обработчик нажатия Enter в поле ввода
const nicknameInput = document.getElementById('nickname-input');
if (nicknameInput) {
    nicknameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            nicknameSaveBtn.click();
        }
    });
}

// Обработчик клика вне модального окна для закрытия
const nicknameModal = document.getElementById('nickname-edit-modal');
if (nicknameModal) {
    nicknameModal.addEventListener('click', (e) => {
        if (e.target === nicknameModal) {
            nicknameModal.style.display = 'none';
        }
    });
}

// Загружаем никнейм при инициализации
loadUserNickname();

// === award XP on upgrades ===

// Загружаем информацию о пользователе при инициализации
loadUserInfo();

// Обработчик копирования ID пользователя
const copyUserIdBtn = document.getElementById('copy-user-id-btn');
if (copyUserIdBtn) {
    copyUserIdBtn.addEventListener('click', async () => {
        try {
            // Получаем ID из отображаемого элемента
            const userIdElement = document.getElementById('profile-user-id');
            const userIdText = userIdElement ? userIdElement.textContent : '';
            const userId = userIdText.replace('ID ', ''); // Убираем "ID " из текста
            
            await navigator.clipboard.writeText(userId);
            
            // Показываем простое всплывающее уведомление
            showToast('ID скопирован в буфер обмена!');
            
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            
            // Fallback для старых браузеров
            const userIdElement = document.getElementById('profile-user-id');
            const userIdText = userIdElement ? userIdElement.textContent : '';
            const userId = userIdText.replace('ID ', '');
            
            const textArea = document.createElement('textarea');
            textArea.value = userId;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            // Показываем простое всплывающее уведомление
            showToast('ID скопирован в буфер обмена!');
        }
    });
}

// Инициализация магазина после загрузки всех элементов
setTimeout(() => {
    console.log('Final shop initialization...');
    initializeShop();
}, 500);

// Делаем функции управления активным состоянием кнопок глобально доступными
window.setActiveSideButton = setActiveSideButton;
window.clearActiveSideButton = clearActiveSideButton;

// === PANEL ANIMATION FUNCTIONS ===
function showPanelWithAnimation(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    
    // Показываем панель
    if (panelId === 'city-panel') {
        panel.style.display = 'block';
    } else {
        panel.style.display = 'flex';
    }
    
    // Добавляем классы для анимации
    panel.classList.add('slide-in');
    
    // Убираем классы анимации после завершения
    setTimeout(() => {
        panel.classList.remove('slide-in');
    }, 400);
}

function hidePanelWithAnimation(panelId, callback = null) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    
    // Добавляем класс для анимации закрытия
    panel.classList.add('slide-out');
    
    // Скрываем панель после завершения анимации
    setTimeout(() => {
        panel.style.display = 'none';
        panel.classList.remove('slide-out');
        if (callback) callback();
    }, 300);
}

// Делаем функции анимации панелей глобально доступными
window.showPanelWithAnimation = showPanelWithAnimation;
window.hidePanelWithAnimation = hidePanelWithAnimation;

// Дополнительный обработчик для кнопки инвентаря (гарантированная работа)
setTimeout(() => {
    const profileInventoryBtn = document.getElementById('profile-inventory-btn');
    if (profileInventoryBtn) {
        console.log('Found profile inventory button, adding additional click handler');
        // Удаляем старые обработчики, если они есть
        profileInventoryBtn.removeEventListener('click', openInventoryFromProfile);
        // Добавляем новый обработчик
        profileInventoryBtn.addEventListener('click', openInventoryFromProfile);
    } else {
        console.error('Profile inventory button not found in final check!');
    }
}, 1000);

// Обработчик делегирования событий для кнопки инвентаря
document.addEventListener('click', (event) => {
    if (event.target && event.target.id === 'profile-inventory-btn') {
        console.log('Profile inventory button clicked via event delegation');
        openInventoryFromProfile();
    }
});

// Делаем функции глобально доступными
window.openInventory = openInventory;
window.openInventoryFromProfile = openInventoryFromProfile;
window.closeInventory = closeInventory;

// Универсальная функция для показа уведомлений о наградах
function showRewardNotification(title, rewards) {
    const overlay = document.getElementById('crate-overlay');
    
    // Создаем HTML для наград
    let rewardsHTML = '';
    if (rewards.money) {
        rewardsHTML += `<div style="display:flex;align-items:center;gap:8px;margin:8px 0;padding:8px 12px;background:rgba(255,255,255,0.1);border-radius:8px;border:1px solid rgba(255,255,255,0.2);">
            <div style="width:24px;height:24px;background:#ccc;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#666;">PNG</div>
            <span style="font-size:18px;font-weight:600;color:#fff;">+${formatNumber(rewards.money)}$</span>
        </div>`;
    }
    if (rewards.credits) {
        rewardsHTML += `<div style="display:flex;align-items:center;gap:8px;margin:8px 0;padding:8px 12px;background:rgba(255,255,255,0.1);border-radius:8px;border:1px solid rgba(255,255,255,0.2);">
            <div style="width:24px;height:24px;background:#ccc;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#666;">PNG</div>
            <span style="font-size:18px;font-weight:600;color:#fff;">+${rewards.credits}</span>
        </div>`;
    }
    if (rewards.xp) {
        rewardsHTML += `<div style="display:flex;align-items:center;gap:8px;margin:8px 0;padding:8px 12px;background:rgba(255,255,255,0.1);border-radius:8px;border:1px solid rgba(255,255,255,0.2);">
            <div style="width:24px;height:24px;background:#ccc;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#666;">PNG</div>
            <span style="font-size:18px;font-weight:600;color:#fff;">+${rewards.xp} XP</span>
        </div>`;
    }
    
    overlay.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%);
            padding: 24px 28px;
            border-radius: 16px;
            text-align: center;
            animation: purchasePop 0.5s ease-out;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            border: 2px solid rgba(255,255,255,0.1);
            max-width: 320px;
            width: 90%;
            position: relative;
            overflow: hidden;
        ">
            <!-- Декоративные элементы -->
            <div style="position:absolute;top:-20px;right:-20px;width:60px;height:60px;background:rgba(255,255,255,0.1);border-radius:50%;"></div>
            <div style="position:absolute;bottom:-30px;left:-30px;width:80px;height:80px;background:rgba(255,255,255,0.05);border-radius:50%;"></div>
            
            <!-- Иконка -->
            <div style="width:64px;height:64px;background:#ccc;border-radius:12px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#666;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
                PNG-image
            </div>
            
            <!-- Заголовок -->
            <h3 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#fff;text-shadow:0 2px 4px rgba(0,0,0,0.3);">
                ${title}
            </h3>
            
            <!-- Награды -->
            <div style="margin-bottom:24px;">
                ${rewardsHTML}
            </div>
            
            <!-- Кнопка -->
            <button id="reward-ok" style="
                background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
                border: none;
                border-radius: 12px;
                color: #fff;
                font-size: 16px;
                font-weight: 600;
                padding: 12px 32px;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 4px 12px rgba(76,175,80,0.3);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 16px rgba(76,175,80,0.4)'" 
               onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 12px rgba(76,175,80,0.3)'">
                Отлично!
            </button>
        </div>
    `;
    
    overlay.style.display = 'flex';
    overlay.querySelector('#reward-ok').onclick = () => {
        overlay.style.display = 'none';
    };
}

// Делаем функцию глобально доступной
window.showRewardNotification = showRewardNotification;
window.showPurchaseNotification = showPurchaseNotification;

// Экспортируем функцию в глобальную область для использования в statistics.js
window.syncLevelAndXP = syncLevelAndXP;

// Инициализируем синхронизацию при загрузке
document.addEventListener('DOMContentLoaded', () => {
    syncLevelAndXP();
    
    // Добавляем периодическое обновление каждые 2 секунды
    setInterval(() => {
        const statisticsPanel = document.getElementById('statistics-panel');
        if (statisticsPanel && statisticsPanel.style.display === 'flex') {
            syncLevelAndXP();
        }
    }, 2000);
});

