// Partner Tasks System
document.addEventListener('DOMContentLoaded', () => {
    // Добавляем новую панель в глобальную функцию isAnyPanelOpen
    if (window.isAnyPanelOpen) {
        const originalFunction = window.isAnyPanelOpen;
        window.isAnyPanelOpen = function() {
            const panels = [
                'shop-panel',
                'characters-panel', 
                'city-panel',
                'tasks-panel',
                'profile-panel',
                'friends-panel',
                'inventory-panel',
                'game-tasks-panel'
            ];
            
            return panels.some(panelId => {
                const panel = document.getElementById(panelId);
                return panel && panel.style.display !== 'none';
            });
        };
    }
    
    // Закрытие панели партнерских заданий
    const tasksClose = document.getElementById('tasks-close');
    const tasksPanel = document.getElementById('tasks-panel');
    if (tasksClose && tasksPanel) {
        tasksClose.addEventListener('click', () => {
            if (window.hidePanelWithAnimation) {
                window.hidePanelWithAnimation('tasks-panel', () => {
                    // Сбрасываем подсветку кнопки
                    if (window.clearActiveSideButton) {
                        window.clearActiveSideButton();
                    }
                });
            } else {
            tasksPanel.style.display = 'none';
                // Сбрасываем подсветку кнопки
                if (window.clearActiveSideButton) {
                    window.clearActiveSideButton();
                }
            }
        });
    }
    
    // Обработчик кнопки "Получить все награды"
    const btnGetAllPartnerRewards = document.getElementById('btn-get-all-partner-rewards');
    if (btnGetAllPartnerRewards) {
        btnGetAllPartnerRewards.addEventListener('click', () => {
            // Рассчитываем общую сумму наград
            const totalReward = calculatePartnerTotalReward();
            
            // Проверяем, есть ли награды для получения
            if (totalReward === '0') {
                alert('Нет доступных наград для получения!');
                return;
            }
            
            // Начисляем награды на баланс игрока
            const currentBalance = window.getBalance ? window.getBalance() : parseFloat(localStorage.getItem('balance') || '100');
            const rewardValue = totalReward.includes('k') 
                ? parseInt(totalReward.replace('k', '')) * 1000 
                : parseInt(totalReward);
            const newBalance = currentBalance + rewardValue;
            
            // Обновляем баланс
            if (window.setBalance) {
                window.setBalance(newBalance);
            } else {
                localStorage.setItem('balance', newBalance);
                const moneyAmount = document.getElementById('money-amount');
                if (moneyAmount) {
                    moneyAmount.textContent = window.formatNumber ? window.formatNumber(newBalance) : newBalance;
                }
            }
            
            alert(`Награды получены! +${totalReward} 💰`);
            
            // Отмечаем все выполненные задания как полученные
            const allSocialTasks = getPartnerTasksData('social');
            const allBookeTasks = getPartnerTasksData('booke');
            const allPartnerTasks = [...allSocialTasks, ...allBookeTasks];
            
            allPartnerTasks.forEach(task => {
                const isCompleted = localStorage.getItem(`partner_task_completed_${task.id}`) === 'true';
                const isClaimed = localStorage.getItem(`partner_task_claimed_${task.id}`) === 'true';
                
                if (isCompleted && !isClaimed) {
                    localStorage.setItem(`partner_task_claimed_${task.id}`, 'true');
                }
            });
            
            // Обновляем отображение
            renderPartnerTasks();
            
            // Обновляем счетчики
            const tasks = getPartnerTasksData();
            updatePartnerTaskCounters(tasks);
        });
    }
    
    // Инициализируем отображение заданий при загрузке страницы
    renderPartnerTasks();
    
    // Добавляем обработчики для вкладок
    const tabSocial = document.getElementById('tab-social');
    const tabBooke = document.getElementById('tab-booke');
    
    if (tabSocial) {
        tabSocial.addEventListener('click', () => {
            // Убираем активное состояние со всех вкладок
            document.querySelectorAll('.task-tab').forEach(tab => {
                tab.style.background = 'none';
            });
            // Устанавливаем активное состояние
            tabSocial.style.background = '#2d2d2d';
            renderPartnerTasks('social');
        });
    }
    
    if (tabBooke) {
        tabBooke.addEventListener('click', () => {
            // Убираем активное состояние со всех вкладок
            document.querySelectorAll('.task-tab').forEach(tab => {
                tab.style.background = 'none';
            });
            // Устанавливаем активное состояние
            tabBooke.style.background = '#2d2d2d';
            renderPartnerTasks('booke');
        });
    }
    
    // Запускаем периодическую проверку выполнения заданий
    setInterval(checkPartnerTasksCompletion, 2000); // Проверяем каждые 2 секунды
});

// Система отслеживания выполнения партнерских заданий
const PARTNER_TASK_KEYS = {
    EXPLORE_TG: 'partner_explore_tg',
    JOIN_PISMAKOV: 'partner_join_pismakov',
    JOIN_BOOKE: 'partner_join_booke',
    SUBSCRIBE_BOOKE: 'partner_subscribe_booke',
    SHARE_ACHIEVEMENT: 'partner_share_achievement'
};

// Функция для получения данных партнерских заданий
function getPartnerTasksData(category = 'social') {
    const socialTasks = [
        {
            id: PARTNER_TASK_KEYS.EXPLORE_TG,
            title: 'Исследовать TG miniAP',
            description: 'Изучите возможности Telegram Mini App',
            reward: '10k',
            progress: 1,
            target: 1,
            status: getPartnerTaskStatus(PARTNER_TASK_KEYS.EXPLORE_TG, true), // Это задание всегда доступно
            category: 'social'
        },
        {
            id: PARTNER_TASK_KEYS.JOIN_PISMAKOV,
            title: 'Присоединиться к Pismakov Path',
            description: 'Станьте частью сообщества разработчиков',
            reward: '100k',
            progress: 0,
            target: 1,
            status: getPartnerTaskStatus(PARTNER_TASK_KEYS.JOIN_PISMAKOV, false),
            category: 'social'
        },
        {
            id: PARTNER_TASK_KEYS.JOIN_BOOKE,
            title: 'Присоединиться к BOOKE Path',
            description: 'Присоединитесь к официальному пути BOOKE',
            reward: '100k',
            progress: 0,
            target: 1,
            status: getPartnerTaskStatus(PARTNER_TASK_KEYS.JOIN_BOOKE, false),
            category: 'social'
        }
    ];

    const bookeTasks = [
        {
            id: PARTNER_TASK_KEYS.SUBSCRIBE_BOOKE,
            title: 'Подписаться на BOOKE',
            description: 'Подпишитесь на официальный канал BOOKE',
            reward: '50k',
            progress: 0,
            target: 1,
            status: getPartnerTaskStatus(PARTNER_TASK_KEYS.SUBSCRIBE_BOOKE, false),
            category: 'booke'
        },
        {
            id: PARTNER_TASK_KEYS.SHARE_ACHIEVEMENT,
            title: 'Поделиться достижением',
            description: 'Поделитесь своим прогрессом в социальных сетях',
            reward: '25k',
            progress: 0,
            target: 1,
            status: getPartnerTaskStatus(PARTNER_TASK_KEYS.SHARE_ACHIEVEMENT, false),
            category: 'booke'
        }
    ];

    return category === 'social' ? socialTasks : bookeTasks;
}

// Функция для получения статуса партнерского задания
function getPartnerTaskStatus(taskKey, isCompleted) {
    const wasClaimed = localStorage.getItem(`partner_task_claimed_${taskKey}`) === 'true';
    const wasCompleted = localStorage.getItem(`partner_task_completed_${taskKey}`) === 'true';
    
    if (wasClaimed) return 'claimed';
    if (wasCompleted) return 'completed';
    if (isCompleted) return 'completed';
    return 'pending';
}

// Функция для проверки выполнения партнерских заданий
function checkPartnerTasksCompletion() {
    // Здесь можно добавить логику для проверки выполнения заданий
    // Например, проверка подписки на каналы, переходов по ссылкам и т.д.
    let hasUpdates = false;
    
    // Для демонстрации, можно симулировать выполнение заданий
    // В реальной игре здесь будет проверка реальных действий пользователя
    
    // Если есть обновления, перерисовываем панель заданий
    if (hasUpdates) {
        renderPartnerTasks();
        // Также обновляем счетчики отдельно
        const tasks = getPartnerTasksData();
        updatePartnerTaskCounters(tasks);
    }
}

// Функция для отметки партнерского задания как выполненного
function markPartnerTaskAsCompleted(taskId) {
    localStorage.setItem(`partner_task_completed_${taskId}`, 'true');
    renderPartnerTasks();
    // Обновляем счетчики
    const tasks = getPartnerTasksData();
    updatePartnerTaskCounters(tasks);
}

// Функция для отметки партнерского задания как полученного
function markPartnerTaskAsClaimed(taskId) {
    localStorage.setItem(`partner_task_claimed_${taskId}`, 'true');
    renderPartnerTasks();
    // Обновляем счетчики
    const tasks = getPartnerTasksData();
    updatePartnerTaskCounters(tasks);
}

// Функция для рендеринга партнерских заданий
function renderPartnerTasks(category = 'social') {
    const container = document.getElementById('tasks-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Получаем актуальные данные заданий для выбранной категории
    const partnerTasks = getPartnerTasksData(category);
    
    // Обновляем счетчики выполненных заданий для текущей категории
    updatePartnerTaskCounters(partnerTasks, category);
    
    // Показываем задания для выбранной категории
    partnerTasks.forEach(task => {
        const taskDiv = document.createElement('div');
        // Используем единый цвет фона для всех заданий
        const backgroundColor = '#5a5a5a';
        taskDiv.style.cssText = `display:flex;align-items:center;background:${backgroundColor};border-radius:8px;padding:12px;gap:12px;min-height:80px;`;
        
        const statusText = task.status === 'completed' ? 'Завершено' : 
                          task.status === 'claimed' ? 'Получено' : 'В процессе';
        const statusColor = task.status === 'completed' ? '#4caf50' : 
                           task.status === 'claimed' ? '#4caf50' : '#fff';
        const statusStyle = task.status === 'completed' || task.status === 'claimed'
            ? 'background:#4caf50;color:#fff;padding:4px 8px;border-radius:4px;text-align:center;'
            : 'background:#666;color:#fff;padding:4px 8px;border-radius:4px;text-align:center;';
        
        // Создаем содержимое для центральной части
        const centerContent = `
            <div style="display:flex;flex-direction:column;gap:4px;flex:1;">
                <span style="font-size:14px;font-weight:600;color:#fff;">${task.title}</span>
                <span style="font-size:12px;color:#ccc;">${task.description}</span>
            </div>
        `;
        
        // Добавляем прогресс-бар для всех заданий
        const isDone = task.progress >= task.target;
        const progressBar = `
            <div style="background:#2b2b2b;border-radius:4px;height:4px;margin-top:4px;overflow:hidden;">
                <div style="height:100%;background:${isDone ? '#4caf50' : '#666'};width:${isDone ? '100' : '0'}%;transition:width 0.3s ease;"></div>
            </div>
            <div style="font-size:10px;color:#ccc;margin-top:2px;">${isDone ? '1/1' : '0/1'}</div>
        `;
        
        taskDiv.innerHTML = `
            <div style="color:${statusColor};font-size:12px;font-weight:600;min-width:60px;${statusStyle}">
                ${task.status === 'completed' ? '✓' : task.status === 'claimed' ? '✓' : statusText}
            </div>
            ${centerContent}
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;min-width:80px;">
                <button class="partner-task-reward-btn" style="background:#666;border:none;color:#fff;border-radius:6px;padding:6px 10px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px;${task.status === 'claimed' ? 'opacity:0.5;cursor:not-allowed;' : ''}">
                    <span style="font-size:10px;">💰</span>
                    +${task.reward}
                </button>
                ${progressBar}
            </div>
        `;
        
        // Добавляем обработчик клика для задания
        const rewardBtn = taskDiv.querySelector('.partner-task-reward-btn');
        rewardBtn.addEventListener('click', () => {
            if (task.status === 'claimed') {
                // Уже получено
                return;
            }
            if (task.status === 'pending') {
                // Еще не выполнено
                return;
            }
            if (task.status === 'completed') {
                // Отмечаем как полученное и даем награду
                markPartnerTaskAsClaimed(task.id);
                
                // Начисляем награду
                const rewardValue = task.reward.includes('k') 
                    ? parseInt(task.reward.replace('k', '')) * 1000 
                    : parseInt(task.reward);
                const currentBalance = window.getBalance ? window.getBalance() : parseFloat(localStorage.getItem('balance') || '100');
                const newBalance = currentBalance + rewardValue;
                
                if (window.setBalance) {
                    window.setBalance(newBalance);
                } else {
                    localStorage.setItem('balance', newBalance);
                    const moneyAmount = document.getElementById('money-amount');
                    if (moneyAmount) {
                        moneyAmount.textContent = window.formatNumber ? window.formatNumber(newBalance) : newBalance;
                    }
                }
                
                alert(`Награда получена! +${task.reward} 💰`);
            }
        });
        
        container.appendChild(taskDiv);
    });
    
    // Обновляем сумму наград в кнопке
    updatePartnerTotalReward();
}

// Функция для обновления счетчиков партнерских заданий
function updatePartnerTaskCounters(tasks, category = 'social') {
    // Получаем все задания из обеих категорий для общего подсчета
    const allSocialTasks = getPartnerTasksData('social');
    const allBookeTasks = getPartnerTasksData('booke');
    const allTasks = [...allSocialTasks, ...allBookeTasks];
    
    const completedCount = allTasks.filter(task => task.status === 'completed' || task.status === 'claimed').length;
    const totalCount = allTasks.length;
    
    // Находим все элементы с font-size:32px в панели партнерских заданий
    const tasksPanel = document.getElementById('tasks-panel');
    if (tasksPanel) {
        const counters = tasksPanel.querySelectorAll('div[style*="font-size:32px"]');
        
        // Первый счетчик - выполненные задания (общее количество)
        if (counters[0]) {
            counters[0].textContent = completedCount;
        }
        
        // Второй счетчик - общее количество заданий
        if (counters[1]) {
            counters[1].textContent = totalCount;
        }
    }
}

// Функция для расчета общей суммы наград партнерских заданий
function calculatePartnerTotalReward() {
    // Получаем все задания из обеих категорий
    const allSocialTasks = getPartnerTasksData('social');
    const allBookeTasks = getPartnerTasksData('booke');
    const allTasks = [...allSocialTasks, ...allBookeTasks];
    
    let total = 0;
    allTasks.forEach(task => {
        // Проверяем, что задание выполнено, но еще не получено
        const isCompleted = localStorage.getItem(`partner_task_completed_${task.id}`) === 'true';
        const isClaimed = localStorage.getItem(`partner_task_claimed_${task.id}`) === 'true';
        
        if (isCompleted && !isClaimed) {
            // Конвертируем строки в числа (убираем 'k' и умножаем на 1000)
            const rewardValue = task.reward.includes('k') 
                ? parseInt(task.reward.replace('k', '')) * 1000 
                : parseInt(task.reward);
            total += rewardValue;
        }
    });
    
    // Форматируем результат обратно в формат с 'k'
    return total >= 1000 ? `${Math.floor(total / 1000)}k` : total.toString();
}

// Функция для обновления суммы наград в кнопке партнерских заданий
function updatePartnerTotalReward() {
    const btnGetAllPartnerRewards = document.getElementById('btn-get-all-partner-rewards');
    if (btnGetAllPartnerRewards) {
        const totalReward = calculatePartnerTotalReward();
        const rewardSpan = btnGetAllPartnerRewards.querySelector('div span');
        if (rewardSpan) {
            rewardSpan.textContent = `+${totalReward}`;
        }
        
        // Проверяем, есть ли выполненные, но не полученные задания
        const hasCompletedTasks = totalReward !== '0';
        
        if (!hasCompletedTasks) {
            btnGetAllPartnerRewards.disabled = true;
            btnGetAllPartnerRewards.style.opacity = '0.5';
            btnGetAllPartnerRewards.style.cursor = 'not-allowed';
            btnGetAllPartnerRewards.style.background = '#333';
        } else {
            btnGetAllPartnerRewards.disabled = false;
            btnGetAllPartnerRewards.style.opacity = '1';
            btnGetAllPartnerRewards.style.cursor = 'pointer';
            btnGetAllPartnerRewards.style.background = '#5a5a5a';
        }
    }
}

// Делаем функции глобально доступными
window.renderPartnerTasks = renderPartnerTasks;
window.calculatePartnerTotalReward = calculatePartnerTotalReward;
window.updatePartnerTotalReward = updatePartnerTotalReward;
window.markPartnerTaskAsCompleted = markPartnerTaskAsCompleted;
window.markPartnerTaskAsClaimed = markPartnerTaskAsClaimed;
window.checkPartnerTasksCompletion = checkPartnerTasksCompletion;
window.updatePartnerTaskCounters = updatePartnerTaskCounters;

// Тестовые функции для разработки
window.testPartnerTaskSystem = {
    // Сбросить все партнерские задания
    resetAll: function() {
        Object.values(PARTNER_TASK_KEYS).forEach(key => {
            localStorage.removeItem(`partner_task_completed_${key}`);
            localStorage.removeItem(`partner_task_claimed_${key}`);
        });
        renderPartnerTasks();
        // Обновляем счетчики
        const tasks = getPartnerTasksData();
        updatePartnerTaskCounters(tasks);
        alert('Все партнерские задания сброшены!');
    },
    
    // Симулировать выполнение всех партнерских заданий
    completeAll: function() {
        // Отмечаем задания как выполненные
        Object.values(PARTNER_TASK_KEYS).forEach(key => {
            localStorage.setItem(`partner_task_completed_${key}`, 'true');
        });
        
        renderPartnerTasks();
        // Обновляем счетчики
        const tasks = getPartnerTasksData();
        updatePartnerTaskCounters(tasks);
        alert('Все партнерские задания выполнены!');
    },
    
    // Симулировать получение всех наград партнерских заданий
    claimAll: function() {
        Object.values(PARTNER_TASK_KEYS).forEach(key => {
            localStorage.setItem(`partner_task_claimed_${key}`, 'true');
        });
        renderPartnerTasks();
        // Обновляем счетчики
        const tasks = getPartnerTasksData();
        updatePartnerTaskCounters(tasks);
        alert('Все награды партнерских заданий получены!');
    }
}; 