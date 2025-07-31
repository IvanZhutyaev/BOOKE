// Система настроек и локализации
let currentLanguage = localStorage.getItem('language') || 'ru';

// Переводы для разных языков
const translations = {
    ru: {
        // Настройки
        settings: 'Настройки',
        language: 'Язык',
        privacy_policy: 'Политика конфиденциальности',
        faq: 'FAQ',
        about_us: 'О нас',
        ok: 'Ок',
        back: 'Назад',
        language_selection: 'Выбор языка',
        russian: 'Русский',
        english: 'English',
        spanish: 'Español',
        
        // Основные элементы интерфейса
        shop: 'Магазин',
        characters: 'Персонажи',
        city: 'Город',
        quests: 'Задания',
        profile: 'Профиль',
        statistics: 'Статистика',
        gifts: 'Подарки',
        phone: 'Телефон',
        sound: 'Звук',
        
        // Магазин
        shop_title: 'МАГАЗИН',
        safes: 'Сейфы',
        coins: 'Монеты',
        sets: 'Наборы',
        buy: 'Купить',
        free: 'БЕСПЛАТНО',
        cost: 'Стоимость',
        rarity: 'Редкость',
        common: 'Обычные',
        rare: 'Редкие',
        unique: 'Уникальные',
        epic: 'Эпические',
        legendary: 'Легендарные',
        
        // Сейфы
        common_safe: 'Обычный сейф',
        gold_safe: 'Золотой сейф',
        mystic_safe: 'Мистический сейф',
        
        // Монеты
        coin_handful: 'Горстка монет',
        coin_chest: 'Сундук монет',
        coin_bag: 'Мешок монет',
        
        // Наборы
        bloomi_set: 'Набор Блуми',
        available: 'Доступно',
        
        // Статистика
        income: 'Доходы',
        expenses: 'Расходы',
        balance: 'Баланс',
        employees: 'Сотрудники',
        
        // Здания
        library: 'Библиотека',
        factory: 'Завод',
        storage: 'Хранилище',
        statue: 'Статуя',
        post_office: 'Почта',
        level: 'Уровень',
        income_per_sec: 'доход',
        upgrade: 'Улучшить',
        
        // Уведомления
        insufficient_funds: 'Недостаточно денег',
        coins_purchased: 'Сундук монет куплен!',
        set_purchased: 'Набор куплен!',
        nothing_selected: 'Ничего не выбрано',
        insufficient_storage: 'Недостаточно места в хранилище',
        welcome_back: 'С ВОЗВРАЩЕНИЕМ!',
        offline_earnings: 'В твоё отсутствие заработок составил:',
        collect: 'ПОЛУЧИТЬ',
        collect_x3: 'ПОЛУЧИ x3',
        collect_x4: 'ПОЛУЧИ x4',
        
        // Задания
        explore_tg: 'Исследовать TG miniAP',
        explore_tg_desc: 'Изучите возможности Telegram Mini App',
        join_pismakov: 'Присоединиться к Pismakov Path',
        join_pismakov_desc: 'Станьте частью сообщества разработчиков',
        join_booke: 'Присоединиться к BOOKE Path',
        join_booke_desc: 'Присоединитесь к официальному пути BOOKE',
        subscribe_booke: 'Подписаться на BOOKE',
        subscribe_booke_desc: 'Подпишитесь на официальный канал BOOKE',
        share_achievement: 'Поделиться достижением',
        share_achievement_desc: 'Поделитесь своим прогрессом в социальных сетях',
        
        // Социальные
        social: 'Социальные',
        booke: 'BOOKE',
        
        // Инвентарь
        inventory: 'Инвентарь',
        all: 'Все',
        suitable: 'Подходящие',
        
        // Профиль
        level_up: 'УРОВЕНЬ ПОВЫШЕН!',
        experience: 'Опыт',
        next_level: 'Следующий уровень',
        
        // P2P
        p2p_market: 'P2P\nmarket'
    },
    
    en: {
        // Settings
        settings: 'Settings',
        language: 'Language',
        privacy_policy: 'Privacy Policy',
        faq: 'FAQ',
        about_us: 'About Us',
        ok: 'Ok',
        back: 'Back',
        language_selection: 'Language Selection',
        russian: 'Русский',
        english: 'English',
        spanish: 'Español',
        
        // Main UI elements
        shop: 'Shop',
        characters: 'Characters',
        city: 'City',
        quests: 'Quests',
        profile: 'Profile',
        statistics: 'Statistics',
        gifts: 'Gifts',
        phone: 'Phone',
        sound: 'Sound',
        
        // Shop
        shop_title: 'SHOP',
        safes: 'Safes',
        coins: 'Coins',
        sets: 'Sets',
        buy: 'Buy',
        free: 'FREE',
        cost: 'Cost',
        rarity: 'Rarity',
        common: 'Common',
        rare: 'Rare',
        unique: 'Unique',
        epic: 'Epic',
        legendary: 'Legendary',
        
        // Safes
        common_safe: 'Common Safe',
        gold_safe: 'Gold Safe',
        mystic_safe: 'Mystic Safe',
        
        // Coins
        coin_handful: 'Coin Handful',
        coin_chest: 'Coin Chest',
        coin_bag: 'Coin Bag',
        
        // Sets
        bloomi_set: 'Bloomi Set',
        available: 'Available',
        
        // Statistics
        income: 'Income',
        expenses: 'Expenses',
        balance: 'Balance',
        employees: 'Employees',
        
        // Buildings
        library: 'Library',
        factory: 'Factory',
        storage: 'Storage',
        statue: 'Statue',
        post_office: 'Post Office',
        level: 'Level',
        income_per_sec: 'income',
        upgrade: 'Upgrade',
        
        // Notifications
        insufficient_funds: 'Insufficient funds',
        coins_purchased: 'Coin chest purchased!',
        set_purchased: 'Set purchased!',
        nothing_selected: 'Nothing selected',
        insufficient_storage: 'Insufficient storage space',
        welcome_back: 'WELCOME BACK!',
        offline_earnings: 'Your earnings while away:',
        collect: 'COLLECT',
        collect_x3: 'COLLECT x3',
        collect_x4: 'COLLECT x4',
        
        // Tasks
        explore_tg: 'Explore TG miniAP',
        explore_tg_desc: 'Explore Telegram Mini App capabilities',
        join_pismakov: 'Join Pismakov Path',
        join_pismakov_desc: 'Become part of the developer community',
        join_booke: 'Join BOOKE Path',
        join_booke_desc: 'Join the official BOOKE path',
        subscribe_booke: 'Subscribe to BOOKE',
        subscribe_booke_desc: 'Subscribe to the official BOOKE channel',
        share_achievement: 'Share Achievement',
        share_achievement_desc: 'Share your progress on social media',
        
        // Social
        social: 'Social',
        booke: 'BOOKE',
        
        // Inventory
        inventory: 'Inventory',
        all: 'All',
        suitable: 'Suitable',
        
        // Profile
        level_up: 'LEVEL UP!',
        experience: 'Experience',
        next_level: 'Next level',
        
        // P2P
        p2p_market: 'P2P\nmarket'
    },
    
    es: {
        // Configuración
        settings: 'Configuración',
        language: 'Idioma',
        privacy_policy: 'Política de Privacidad',
        faq: 'FAQ',
        about_us: 'Sobre Nosotros',
        ok: 'Ok',
        back: 'Atrás',
        language_selection: 'Selección de Idioma',
        russian: 'Русский',
        english: 'English',
        spanish: 'Español',
        
        // Elementos principales de la UI
        shop: 'Tienda',
        characters: 'Personajes',
        city: 'Ciudad',
        quests: 'Misiones',
        profile: 'Perfil',
        statistics: 'Estadísticas',
        gifts: 'Regalos',
        phone: 'Teléfono',
        sound: 'Sonido',
        
        // Tienda
        shop_title: 'TIENDA',
        safes: 'Cajas Fuertes',
        coins: 'Monedas',
        sets: 'Conjuntos',
        buy: 'Comprar',
        free: 'GRATIS',
        cost: 'Costo',
        rarity: 'Rareza',
        common: 'Común',
        rare: 'Raro',
        unique: 'Único',
        epic: 'Épico',
        legendary: 'Legendario',
        
        // Cajas fuertes
        common_safe: 'Caja Fuerte Común',
        gold_safe: 'Caja Fuerte Dorada',
        mystic_safe: 'Caja Fuerte Mística',
        
        // Monedas
        coin_handful: 'Puñado de Monedas',
        coin_chest: 'Cofre de Monedas',
        coin_bag: 'Bolsa de Monedas',
        
        // Conjuntos
        bloomi_set: 'Conjunto Bloomi',
        available: 'Disponible',
        
        // Estadísticas
        income: 'Ingresos',
        expenses: 'Gastos',
        balance: 'Balance',
        employees: 'Empleados',
        
        // Edificios
        library: 'Biblioteca',
        factory: 'Fábrica',
        storage: 'Almacén',
        statue: 'Estatua',
        post_office: 'Oficina de Correos',
        level: 'Nivel',
        income_per_sec: 'ingresos',
        upgrade: 'Mejorar',
        
        // Notificaciones
        insufficient_funds: 'Fondos insuficientes',
        coins_purchased: '¡Cofre de monedas comprado!',
        set_purchased: '¡Conjunto comprado!',
        nothing_selected: 'Nada seleccionado',
        insufficient_storage: 'Espacio de almacenamiento insuficiente',
        welcome_back: '¡BIENVENIDO DE VUELTA!',
        offline_earnings: 'Tus ganancias mientras estabas ausente:',
        collect: 'RECOLECTAR',
        collect_x3: 'RECOLECTAR x3',
        collect_x4: 'RECOLECTAR x4',
        
        // Misiones
        explore_tg: 'Explorar TG miniAP',
        explore_tg_desc: 'Explora las capacidades de Telegram Mini App',
        join_pismakov: 'Unirse a Pismakov Path',
        join_pismakov_desc: 'Conviértete en parte de la comunidad de desarrolladores',
        join_booke: 'Unirse a BOOKE Path',
        join_booke_desc: 'Únete al camino oficial de BOOKE',
        subscribe_booke: 'Suscribirse a BOOKE',
        subscribe_booke_desc: 'Suscríbete al canal oficial de BOOKE',
        share_achievement: 'Compartir Logro',
        share_achievement_desc: 'Comparte tu progreso en redes sociales',
        
        // Social
        social: 'Social',
        booke: 'BOOKE',
        
        // Inventario
        inventory: 'Inventario',
        all: 'Todo',
        suitable: 'Adecuado',
        
        // Perfil
        level_up: '¡SUBIDA DE NIVEL!',
        experience: 'Experiencia',
        next_level: 'Siguiente nivel',
        
        // P2P
        p2p_market: 'P2P\nmarket'
    }
};

// Функция для получения перевода
function t(key) {
    return translations[currentLanguage][key] || key;
}

// Функция для смены языка
function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    updateLanguageUI();
    updateAllTexts();
}

// Обновление UI выбора языка
function updateLanguageUI() {
    // Скрываем все галочки
    document.querySelectorAll('.language-check').forEach(check => {
        check.style.display = 'none';
    });
    
    // Показываем галочку для текущего языка
    const currentOption = document.querySelector(`[data-lang="${currentLanguage}"] .language-check`);
    if (currentOption) {
        currentOption.style.display = 'inline';
    }
}

// Обновление всех текстов в игре
function updateAllTexts() {
    // Настройки
    document.querySelector('#settings-panel h2').textContent = t('settings');
    document.querySelector('#settings-language span').textContent = t('language');
    document.querySelector('#settings-privacy span').textContent = t('privacy_policy');
    document.querySelector('#settings-faq span').textContent = t('faq');
    document.querySelector('#settings-about span').textContent = t('about_us');
    document.querySelector('#settings-ok').textContent = t('ok');
    
    // Панель языка
    document.querySelector('#language-panel h2').textContent = t('language_selection');
    document.querySelector('#language-back').textContent = t('back');
    
    // Нижняя навигация
    const navButtons = document.querySelectorAll('#bottom-nav button span');
    if (navButtons.length >= 5) {
        navButtons[0].textContent = t('shop');
        navButtons[1].textContent = t('characters');
        navButtons[2].textContent = t('city');
        navButtons[3].textContent = t('quests');
        navButtons[4].textContent = t('profile');
    }
    
    // Заголовки кнопок правой панели
    const rightPanelButtons = document.querySelectorAll('#right-panel button');
    if (rightPanelButtons.length >= 5) {
        rightPanelButtons[0].title = t('sound');
        rightPanelButtons[1].title = t('gifts');
        rightPanelButtons[2].title = t('phone');
        rightPanelButtons[3].title = t('statistics');
        rightPanelButtons[4].title = t('settings');
    }
    
    // Магазин
    const shopTitle = document.querySelector('#shop-content h2');
    if (shopTitle) shopTitle.textContent = t('shop_title');
    
    // Обновляем заголовки секций магазина
    const shopSections = document.querySelectorAll('#shop-content h3');
    if (shopSections.length >= 3) {
        shopSections[0].textContent = t('safes');
        shopSections[1].textContent = t('coins');
        shopSections[2].textContent = t('sets');
    }
    
    // Обновляем кнопки покупки
    document.querySelectorAll('.shop-buy-btn').forEach(btn => {
        btn.textContent = t('buy');
    });
    
    // Обновляем названия товаров
    updateShopItems();
    
    // Обновляем панели зданий
    updateBuildingPanels();
    
    // Обновление статистики
    updateStatistics();
    
    // Обновляем задания
    updateTasks();
}

// Обновление товаров магазина
function updateShopItems() {
    // Сейфы
    const safeNames = document.querySelectorAll('[data-section="safes"] .item-name');
    if (safeNames.length > 0) {
        safeNames[0].textContent = t('common_safe');
    }
    
    // Монеты
    const coinNames = document.querySelectorAll('[data-section="coins"] .item-name');
    if (coinNames.length > 0) {
        coinNames[0].textContent = t('coin_handful');
    }
    
    // Наборы
    const setNames = document.querySelectorAll('[data-section="sets"] .item-name');
    if (setNames.length > 0) {
        setNames[0].textContent = t('bloomi_set');
    }
}

// Обновление панелей зданий
function updateBuildingPanels() {
    // Панель улучшения библиотеки
    const libraryPanel = document.querySelector('#upgrade-panel');
    if (libraryPanel) {
        const title = libraryPanel.querySelector('#panel-title');
        if (title) title.textContent = t('library');
        
        const content = libraryPanel.querySelector('#panel-content p');
        if (content) {
            content.innerHTML = `${t('level')}: <span id="building-level">1</span> | ${t('income_per_sec')}: <span id="building-income">0</span>/с`;
        }
        
        const upgradeBtn = libraryPanel.querySelector('#upgrade-btn');
        if (upgradeBtn) upgradeBtn.textContent = `${t('upgrade')} 100`;
    }
    
    // Панель улучшения завода
    const factoryPanel = document.querySelector('#factory-upgrade-panel');
    if (factoryPanel) {
        const title = factoryPanel.querySelector('#factory-panel-title');
        if (title) title.textContent = t('factory');
        
        const content = factoryPanel.querySelector('#factory-panel-content p');
        if (content) {
            content.innerHTML = `${t('level')}: <span id="factory-level">1</span> | ${t('income_per_sec')}: <span id="factory-income">0</span>/с`;
        }
        
        const upgradeBtn = factoryPanel.querySelector('#factory-upgrade-btn');
        if (upgradeBtn) upgradeBtn.textContent = `${t('upgrade')} 100`;
    }
}

// Обновление статистики
function updateStatistics() {
    const statButtons = document.querySelectorAll('.stat-category-btn');
    if (statButtons.length >= 3) {
        statButtons[0].textContent = t('income');
        statButtons[1].textContent = t('expenses');
        statButtons[2].textContent = t('balance');
    }
    
    // Обновляем заголовок сотрудников (второй h3 в панели статистики)
    const employeesTitle = document.querySelector('#statistics-panel h3:nth-of-type(2)');
    if (employeesTitle) employeesTitle.textContent = t('employees');
}

// Обновление заданий
function updateTasks() {
    const taskTabs = document.querySelectorAll('#tasks-panel .tab-button');
    if (taskTabs.length >= 2) {
        taskTabs[0].textContent = t('social');
        taskTabs[1].textContent = t('booke');
    }
}

// Генерация UserID
function generateUserID() {
    const storedID = localStorage.getItem('userID');
    if (storedID) {
        return storedID;
    }
    
    const newID = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    localStorage.setItem('userID', newID);
    return newID;
}

// Инициализация настроек
function initSettings() {
    // Генерируем UserID если его нет
    const userID = generateUserID();
    document.getElementById('settings-userid').textContent = userID;
    
    // Устанавливаем текущий язык
    updateLanguageUI();
    
    // Обработчики событий для панели настроек
    document.getElementById('btn-settings').addEventListener('click', () => {
        if (window.showPanelWithAnimation) {
            window.showPanelWithAnimation('settings-panel');
        } else {
        document.getElementById('settings-panel').style.display = 'flex';
        }
        // Подсвечиваем кнопку белым цветом
        if (window.setActiveSideButton) {
            window.setActiveSideButton('btn-settings');
        }
    });
    
    document.getElementById('settings-close').addEventListener('click', () => {
        if (window.hidePanelWithAnimation) {
            window.hidePanelWithAnimation('settings-panel', () => {
                // Сбрасываем подсветку кнопки
                if (window.clearActiveSideButton) {
                    window.clearActiveSideButton();
                }
            });
        } else {
        document.getElementById('settings-panel').style.display = 'none';
            // Сбрасываем подсветку кнопки
            if (window.clearActiveSideButton) {
                window.clearActiveSideButton();
            }
        }
    });
    
    document.getElementById('settings-ok').addEventListener('click', () => {
        if (window.hidePanelWithAnimation) {
            window.hidePanelWithAnimation('settings-panel', () => {
                // Сбрасываем подсветку кнопки
                if (window.clearActiveSideButton) {
                    window.clearActiveSideButton();
                }
            });
        } else {
        document.getElementById('settings-panel').style.display = 'none';
            // Сбрасываем подсветку кнопки
            if (window.clearActiveSideButton) {
                window.clearActiveSideButton();
            }
        }
    });
    
    // Обработчик для кнопки "Язык"
    document.getElementById('settings-language').addEventListener('click', () => {
        document.getElementById('language-panel').style.display = 'flex';
    });
    
    // Обработчики для панели языка
    document.getElementById('language-close').addEventListener('click', () => {
        document.getElementById('language-panel').style.display = 'none';
    });
    
    document.getElementById('language-back').addEventListener('click', () => {
        document.getElementById('language-panel').style.display = 'none';
    });
    
    // Обработчики для выбора языка
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.getAttribute('data-lang');
            changeLanguage(lang);
        });
    });
    
    // Обработчики для других пунктов меню
    document.getElementById('settings-privacy').addEventListener('click', () => {
        alert('Политика конфиденциальности');
    });
    
    document.getElementById('settings-faq').addEventListener('click', () => {
        alert('Часто задаваемые вопросы');
    });
    
    document.getElementById('settings-about').addEventListener('click', () => {
        alert('О нас');
    });
    
    // Обновляем все тексты при инициализации
    updateAllTexts();
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', initSettings); 