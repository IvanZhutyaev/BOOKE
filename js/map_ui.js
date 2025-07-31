// Логика интерфейса новой карты с ромбами
// Предполагает, что main.js уже загрузился и глобальные переменные доступны

(function(){
    // canvas оставляем видимым для новых 3-D платформ
    // оставляем слушатель кликов из main.js для новых платформ 

    const BUILDING_NAMES = {library:'Библиотека',factory:'Завод',storage:'Хранилище',print:'Типография'};
    // скрываем старые круги/банки, но не ломаем логику
    const hideOldIds = ['income-progress','income-bank','factory-income-progress','factory-income-bank','storage-sale-progress'];
    hideOldIds.forEach(id=>{const el=document.getElementById(id); if(el) el.style.display='none';});

    const btnShowAll = document.getElementById('btn-show-all');
    const infoPanel  = document.getElementById('building-info-panel');

    window.platformClicked = (building)=> openBuilding(building);
    btnShowAll.addEventListener('click', closeMap);

    // кнопки будут добавляться динамически внутри updateInfoPanel

    function openBuilding(building){
        if(window.highlightPlatform) window.highlightPlatform(building);
        btnShowAll.style.display='flex';
        infoPanel.style.display='block';
        infoPanel.dataset.building = building;
        updateInfoPanel(building);
    }

    function closeMap(){
        if(window.animatePlatformsBack) window.animatePlatformsBack();
        btnShowAll.style.display='none';
        infoPanel.style.display='none';
        
        // Останавливаем автоматическое обновление панели
        if (window.panelUpdateInterval) {
            clearInterval(window.panelUpdateInterval);
            window.panelUpdateInterval = null;
        }
    }

    function updateInfoPanel(building){
        const titleEl   = document.getElementById('info-title');
        const levelEl   = document.getElementById('info-level');
        const incomeEl  = document.getElementById('info-income');
        const bankAmtEl = document.getElementById('hour-bank-amt');
        const bankFill  = document.getElementById('hour-progress-fill');
        const empBtn    = document.getElementById('info-employee-btn');

        let lvl = 0, perSec = 0, bank = 0;
        if(building==='library'){
            lvl  = window.upgradesCount || parseInt(localStorage.getItem('upCnt')||'0');
            perSec = window.getIncomePerSecond ? window.getIncomePerSecond() : 0;
            bank = window.intermediateBalance || parseFloat(localStorage.getItem('interBal')||'0');
        }else if(building==='factory'){
            lvl  = window.factoryUpgrades || parseInt(localStorage.getItem('f_upCnt')||'0');
            perSec = window.getFactoryIncomePerSecond ? window.getFactoryIncomePerSecond() : 0;
            bank = window.factoryIntermediate || parseFloat(localStorage.getItem('f_interBal')||'0');
        }else if(building==='storage'){
            lvl  = parseInt(localStorage.getItem('stor_up')||'0');
            perSec = 0;
            bank = 0;
        }
        // вычисления
        const hourlyIncome = perSec*3600;
        let percent = 0;
        if(building==='library'){
            // Прогресс-бар заполняется на протяжении часа (3600 секунд)
            // bank показывает накопленный доход, который растет каждую секунду
            percent = perSec>0 ? Math.min(100, (bank/(perSec*3600))*100) : 0;
        }else if(building==='factory'){
            // Аналогично для завода
            percent = perSec>0 ? Math.min(100, (bank/(perSec*3600))*100) : 0;
        }

        // сотрудник
        const emp = window.getEmpByBuilding ? window.getEmpByBuilding(building) : null;
        const empHTML = emp?`
            <div style="display:flex;gap:10px;align-items:center;">
                <img src="${emp.img}" style="width:60px;height:60px;object-fit:contain;background:#e0e0e0;border-radius:8px;">
                <div style="flex:1;">
                    <div style="font-weight:700;font-size:16px">${emp.name}</div>
                    <div style="font-size:12px;opacity:.8">Уровень ${emp.level}</div>
                    <div style="font-size:12px;">Навык ${emp.skill}</div>
                </div>
            </div>`
            : `<div style="display:flex;justify-content:center;align-items:center;height:60px;font-size:12px;opacity:.6">Нет сотрудника</div>`;

        // строим HTML панели
        infoPanel.innerHTML = `
            <div class="info-section" style="text-align:center;background:#e0e0e0;border:none;box-shadow:none;"> <h2 style="margin:0;font-size:22px;font-weight:700;color:#333">${BUILDING_NAMES[building]}</h2></div>

            <div class="info-section">
                <div style="font-size:18px;font-weight:700;margin-bottom:6px;">Уровень <span id="info-level">${lvl}</span></div>
                ${empHTML}
                <button id="btn-emp" class="btn-main" style="margin-top:12px;">${emp? 'Снять/Назначить' : 'Назначить'}</button>
            </div>

            <div class="info-section">
                <div style="font-weight:700;margin-bottom:12px;color:#333;">Текущий доход</div>
                <div style="font-size:13px;margin-bottom:12px;color:#666;" id="hourly-income-display">Доход в час: ${window.formatNumber(hourlyIncome)}</div>
                <div class="progress-bar" style="background:#444;margin-bottom:8px;"><div class="fill" data-building="${building}" style="width:${percent}%;background:#000;"></div></div>
                <div style="display:flex;justify-content:space-between;font-size:12px;color:#666;margin-bottom:16px;">
                    <span>0 мин.</span>
                    <span>1 ч.</span>
                </div>
                <button id="btn-collect-hour" class="btn-main" style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;">
                    <span>Получить</span>
                    <div style="background:#555;border-radius:8px;padding:6px 10px;display:flex;align-items:center;gap:6px;">
                        <img src="assets/icons/money.svg" style="width:16px;height:16px;filter:brightness(0) invert(1);" alt="money">
                        <span style="color:#fff;font-size:14px;font-weight:600;">${window.formatNumber(bank)}</span>
                    </div>
                </button>
            </div>

            <div class="info-section">
                <div style="font-weight:700;margin-bottom:6px;">Улучшение</div>
                <button id="btn-info-upgrade" class="btn-main" style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;">
                    <span>Улучшить</span>
                    <div style="background:#555;border-radius:8px;padding:6px 10px;display:flex;align-items:center;gap:6px;">
                        <img src="assets/icons/money.svg" style="width:16px;height:16px;filter:brightness(0) invert(1);" alt="money">
                        <span style="color:#fff;font-size:14px;font-weight:600;" id="upgrade-cost-display">0</span>
                    </div>
                </button>
            </div>`;

        // назначаем обработчики
        infoPanel.querySelector('#btn-collect-hour').onclick = ()=>{
            let collected = false;
            
            if(building==='library'){ 
                collected = window.collectLibraryMoney ? window.collectLibraryMoney() : false;
            }
            else if(building==='factory'){ 
                collected = window.collectFactoryMoney ? window.collectFactoryMoney() : false;
            }
            
            if (collected) {
                // Мгновенно обновляем UI после получения денег
                setTimeout(() => {
                    if (window.updateCollectButtonAmounts) {
                        window.updateCollectButtonAmounts();
                    }
                    if (window.updatePanelProgressBars) {
                        window.updatePanelProgressBars();
                    }
                    if (window.updateHourlyIncomeInPanel) {
                        window.updateHourlyIncomeInPanel();
                    }
                }, 10);
            } else {
                alert('Нет денег для получения!');
            }
        };

        infoPanel.querySelector('#btn-info-upgrade').onclick = ()=>{
            let upgraded = false;
            
            if(building==='library')      { 
                upgraded = window.upgradeLibraryDirectly ? window.upgradeLibraryDirectly() : false;
            }
            else if(building==='factory')  { 
                upgraded = window.upgradeFactoryDirectly ? window.upgradeFactoryDirectly() : false;
            }
            else if(building==='storage')  { 
                upgraded = window.upgradeStorageDirectly ? window.upgradeStorageDirectly() : false;
            }
            else { 
                alert('Постройка ещё в разработке'); 
                return;
            }
            
            if (upgraded) {
                console.log('Здание улучшено, обновляем UI...');
                // Мгновенно обновляем UI после улучшения
                setTimeout(() => {
                    if (window.updatePanelIncomeDisplay) {
                        window.updatePanelIncomeDisplay();
                    }
                    if (window.updateLevelInPanel) {
                        window.updateLevelInPanel();
                    }
                    if (window.updateUpgradeCostInPanel) {
                        window.updateUpgradeCostInPanel();
                    }
                    if (window.updateHourlyIncomeInPanel) {
                        window.updateHourlyIncomeInPanel();
                    }
                    console.log('UI обновлен после улучшения');
                }, 10);
            } else {
                alert('Недостаточно денег для улучшения!');
            }
        };

        infoPanel.querySelector('#btn-emp').onclick = ()=> {
            window.openAssignOverlay(building);
            // Обновляем доход в час после назначения/снятия сотрудника
            setTimeout(() => {
                if (window.updatePanelIncomeDisplay) {
                    window.updatePanelIncomeDisplay();
                }
                if (window.updateHourlyIncomeInPanel) {
                    window.updateHourlyIncomeInPanel();
                }
                updateUpgradeCost(building);
            }, 100);
        };
        
        // Обновляем доход в час в реальном времени
        if (window.updatePanelIncomeDisplay) {
            window.updatePanelIncomeDisplay();
        }
        
        // Обновляем стоимость улучшения
        updateUpgradeCost(building);
        
        // Запускаем автоматическое обновление панели в реальном времени
        startPanelAutoUpdate(building);
    }
    
    function updateUpgradeCost(building) {
        // Используем глобальную функцию для обновления стоимости улучшения
        if (window.updateUpgradeCostInPanel) {
            window.updateUpgradeCostInPanel();
        }
    }
    
    // Делаем функцию доступной глобально
    window.updateInfoPanel = updateInfoPanel;

    // Функция для автоматического обновления панели в реальном времени
    function startPanelAutoUpdate(building) {
        // Останавливаем предыдущий интервал, если он есть
        if (window.panelUpdateInterval) {
            clearInterval(window.panelUpdateInterval);
        }
        
        // Запускаем новый интервал обновления каждую секунду
        window.panelUpdateInterval = setInterval(() => {
            if (infoPanel.style.display === 'block') {
                // Обновляем сумму в кнопке "Получить"
                if (window.updateCollectButtonAmounts) {
                    window.updateCollectButtonAmounts();
                }
                // Обновляем прогресс-бар
                if (window.updatePanelProgressBars) {
                    window.updatePanelProgressBars();
                }
            } else {
                // Если панель закрыта, останавливаем обновление
                clearInterval(window.panelUpdateInterval);
            }
        }, 1000);
    }
})(); 