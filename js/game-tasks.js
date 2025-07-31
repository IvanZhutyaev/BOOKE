// Game Tasks Panel Handlers
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
    
    // Закрытие панели игровых заданий
    const gameTasksClose = document.getElementById('game-tasks-close');
    const gameTasksPanel = document.getElementById('game-tasks-panel');
    if (gameTasksClose && gameTasksPanel) {
        gameTasksClose.addEventListener('click', () => {
            if (window.hidePanelWithAnimation) {
                window.hidePanelWithAnimation('game-tasks-panel', () => {
                    // Сбрасываем подсветку кнопки
                    if (window.clearActiveSideButton) {
                        window.clearActiveSideButton();
                    }
                });
            } else {
            gameTasksPanel.style.display = 'none';
                // Сбрасываем подсветку кнопки
                if (window.clearActiveSideButton) {
                    window.clearActiveSideButton();
                }
            }
        });
    }
    
    // Обработчик кнопки "Получить все награды"
    const btnGetAllRewards = document.getElementById('btn-get-all-rewards');
    if (btnGetAllRewards) {
        btnGetAllRewards.addEventListener('click', () => {
            // Рассчитываем общую сумму наград
            const totalReward = calculateTotalReward();
            
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
            const gameTasks = getGameTasksData();
            gameTasks.forEach(task => {
                const isCompleted = localStorage.getItem(`task_completed_${task.id}`) === 'true';
                const isClaimed = localStorage.getItem(`task_claimed_${task.id}`) === 'true';
                
                if (isCompleted && !isClaimed) {
                    localStorage.setItem(`task_claimed_${task.id}`, 'true');
                }
            });
            
            // Обновляем отображение
            renderGameTasks();
            
            // Обновляем счетчики
            const tasks = getGameTasksData();
            updateTaskCounters(tasks);
        });
    }
    
    // Инициализируем отображение заданий при загрузке страницы
    renderGameTasks();
    
    // Запускаем периодическую проверку выполнения заданий
    setInterval(checkTasksCompletion, 2000); // Проверяем каждые 2 секунды
});

// Система отслеживания выполнения заданий
const TASK_KEYS = {
    EARN_100: 'task_earn_100',
    EARN_300: 'task_earn_300', 
    EARN_500: 'task_earn_500',
    HIRE_REGGI: 'task_hire_reggi',
    BUY_SOFA: 'task_buy_sofa',
    PRINT_BOOK: 'task_print_book'
};

// Функция для получения данных заданий с учетом сохраненного прогресса
function getGameTasksData() {
    const currentBalance = window.getBalance ? window.getBalance() : parseFloat(localStorage.getItem('balance') || '100');
    const hasReggi = localStorage.getItem('hasReggi') === 'true';
    const hasSofa = localStorage.getItem('hasSofa') === 'true';
    const hasPrintedBook = localStorage.getItem('hasPrintedBook') === 'true';
    
    // Получаем сохраненный прогресс для денежных заданий
    const earn100Progress = parseFloat(localStorage.getItem('task_progress_earn_100') || '0');
    const earn300Progress = parseFloat(localStorage.getItem('task_progress_earn_300') || '0');
    const earn500Progress = parseFloat(localStorage.getItem('task_progress_earn_500') || '0');
    
    return [
        {
            id: TASK_KEYS.EARN_100,
            title: 'Заработать 100$',
            description: 'Накопите 100 долларов для получения награды',
            reward: '35k',
            progress: Math.min(currentBalance, 100),
            target: 100,
            status: getTaskStatus(TASK_KEYS.EARN_100, currentBalance >= 100)
        },
        {
            id: TASK_KEYS.EARN_300,
            title: 'Заработать 300$',
            description: 'Накопите 300 долларов для получения награды',
            reward: '75k',
            progress: Math.min(currentBalance, 300),
            target: 300,
            status: getTaskStatus(TASK_KEYS.EARN_300, currentBalance >= 300)
        },
        {
            id: TASK_KEYS.HIRE_REGGI,
            title: 'Нанять Реджи',
            description: 'Наймите персонажа Реджи в свою команду',
            reward: '50k',
            progress: hasReggi ? 1 : 0,
            target: 1,
            status: getTaskStatus(TASK_KEYS.HIRE_REGGI, hasReggi)
        },
        {
            id: TASK_KEYS.BUY_SOFA,
            title: 'Купить диван',
            description: 'Приобретите диван для улучшения комфорта',
            reward: '5k',
            progress: hasSofa ? 1 : 0,
            target: 1,
            status: getTaskStatus(TASK_KEYS.BUY_SOFA, hasSofa)
        },
        {
            id: TASK_KEYS.PRINT_BOOK,
            title: 'Напечатать книгу',
            description: 'Создайте и напечатайте свою первую книгу',
            reward: '105k',
            progress: hasPrintedBook ? 1 : 0,
            target: 1,
            status: getTaskStatus(TASK_KEYS.PRINT_BOOK, hasPrintedBook)
        },
        {
            id: TASK_KEYS.EARN_500,
            title: 'Заработать 500$',
            description: 'Накопите 500 долларов для получения награды',
            reward: '305k',
            progress: Math.min(currentBalance, 500),
            target: 500,
            status: getTaskStatus(TASK_KEYS.EARN_500, currentBalance >= 500)
        }
    ];
}

// Функция для получения статуса задания
function getTaskStatus(taskKey, isCompleted) {
    const wasClaimed = localStorage.getItem(`task_claimed_${taskKey}`) === 'true';
    const wasCompleted = localStorage.getItem(`task_completed_${taskKey}`) === 'true';
    
    if (wasClaimed) return 'claimed';
    if (wasCompleted) return 'completed';
    if (isCompleted) return 'completed';
    return 'pending';
}

// Функция для проверки выполнения заданий
function checkTasksCompletion() {
    const currentBalance = window.getBalance ? window.getBalance() : parseFloat(localStorage.getItem('balance') || '100');
    const hasReggi = localStorage.getItem('hasReggi') === 'true';
    const hasSofa = localStorage.getItem('hasSofa') === 'true';
    const hasPrintedBook = localStorage.getItem('hasPrintedBook') === 'true';
    
    let hasUpdates = false;
    
    // Проверяем денежные задания
    if (currentBalance >= 100 && localStorage.getItem(`task_completed_${TASK_KEYS.EARN_100}`) !== 'true') {
        localStorage.setItem(`task_completed_${TASK_KEYS.EARN_100}`, 'true');
        hasUpdates = true;
    }
    
    if (currentBalance >= 300 && localStorage.getItem(`task_completed_${TASK_KEYS.EARN_300}`) !== 'true') {
        localStorage.setItem(`task_completed_${TASK_KEYS.EARN_300}`, 'true');
        hasUpdates = true;
    }
    
    if (currentBalance >= 500 && localStorage.getItem(`task_completed_${TASK_KEYS.EARN_500}`) !== 'true') {
        localStorage.setItem(`task_completed_${TASK_KEYS.EARN_500}`, 'true');
        hasUpdates = true;
    }
    
    // Проверяем остальные задания
    if (hasReggi && localStorage.getItem(`task_completed_${TASK_KEYS.HIRE_REGGI}`) !== 'true') {
        localStorage.setItem(`task_completed_${TASK_KEYS.HIRE_REGGI}`, 'true');
        hasUpdates = true;
    }
    
    if (hasSofa && localStorage.getItem(`task_completed_${TASK_KEYS.BUY_SOFA}`) !== 'true') {
        localStorage.setItem(`task_completed_${TASK_KEYS.BUY_SOFA}`, 'true');
        hasUpdates = true;
    }
    
    if (hasPrintedBook && localStorage.getItem(`task_completed_${TASK_KEYS.PRINT_BOOK}`) !== 'true') {
        localStorage.setItem(`task_completed_${TASK_KEYS.PRINT_BOOK}`, 'true');
        hasUpdates = true;
    }
    
    // Если есть обновления, перерисовываем панель заданий
    if (hasUpdates) {
        renderGameTasks();
        // Также обновляем счетчики отдельно
        const tasks = getGameTasksData();
        updateTaskCounters(tasks);
    }
}

// Функция для отметки задания как выполненного
function markTaskAsCompleted(taskId) {
    localStorage.setItem(`task_completed_${taskId}`, 'true');
    renderGameTasks();
    // Обновляем счетчики
    const tasks = getGameTasksData();
    updateTaskCounters(tasks);
}

// Функция для отметки задания как полученного
function markTaskAsClaimed(taskId) {
    localStorage.setItem(`task_claimed_${taskId}`, 'true');
    renderGameTasks();
    // Обновляем счетчики
    const tasks = getGameTasksData();
    updateTaskCounters(tasks);
}

// Функция для рендеринга игровых заданий
function renderGameTasks() {
    const container = document.getElementById('game-tasks-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Получаем актуальные данные заданий
    const gameTasks = getGameTasksData();
    
    // Обновляем счетчики выполненных заданий
    updateTaskCounters(gameTasks);
    
    gameTasks.forEach(task => {
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
        
        // Добавляем прогресс-бар для ВСЕХ заданий (даже с target=1)
        let progressBar = '';
        if (task.target > 1) {
            const progressPercent = Math.min(100, (task.progress / task.target) * 100);
            progressBar = `
                <div style="background:#2b2b2b;border-radius:4px;height:4px;margin-top:4px;overflow:hidden;">
                    <div style="height:100%;background:#4caf50;width:${progressPercent}%;transition:width 0.3s ease;"></div>
                </div>
                <div style="font-size:10px;color:#ccc;margin-top:2px;">${task.progress}/${task.target}</div>
            `;
        } else {
            // Для заданий с target=1 показываем простой индикатор
            const isDone = task.progress >= task.target;
            progressBar = `
                <div style="background:#2b2b2b;border-radius:4px;height:4px;margin-top:4px;overflow:hidden;">
                    <div style="height:100%;background:${isDone ? '#4caf50' : '#666'};width:${isDone ? '100' : '0'}%;transition:width 0.3s ease;"></div>
                </div>
                <div style="font-size:10px;color:#ccc;margin-top:2px;">${isDone ? '1/1' : '0/1'}</div>
            `;
        }
        
        taskDiv.innerHTML = `
            <div style="color:${statusColor};font-size:12px;font-weight:600;min-width:60px;${statusStyle}">
                ${task.status === 'completed' ? '✓' : task.status === 'claimed' ? '✓' : statusText}
            </div>
            ${centerContent}
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;min-width:80px;">
                <button class="game-task-reward-btn" style="background:#666;border:none;color:#fff;border-radius:6px;padding:6px 10px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px;${task.status === 'claimed' ? 'opacity:0.5;cursor:not-allowed;' : ''}">
                    <span style="font-size:10px;">💰</span>
                    +${task.reward}
                </button>
                ${progressBar}
            </div>
        `;
        
        // Добавляем обработчик клика для задания
        const rewardBtn = taskDiv.querySelector('.game-task-reward-btn');
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
                markTaskAsClaimed(task.id);
                
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
    updateTotalReward();
}

// Функция для обновления счетчиков заданий
function updateTaskCounters(tasks) {
    const completedCount = tasks.filter(task => task.status === 'completed' || task.status === 'claimed').length;
    const totalCount = tasks.length;
    
    // Находим все элементы с font-size:32px в панели заданий
    const gameTasksPanel = document.getElementById('game-tasks-panel');
    if (gameTasksPanel) {
        const counters = gameTasksPanel.querySelectorAll('div[style*="font-size:32px"]');
        
        // Первый счетчик - выполненные задания
        if (counters[0]) {
            counters[0].textContent = completedCount;
        }
        
        // Второй счетчик - общее количество заданий
        if (counters[1]) {
            counters[1].textContent = totalCount;
        }
    }
}

// Делаем функцию глобально доступной
window.renderGameTasks = renderGameTasks;
window.calculateTotalReward = calculateTotalReward;
window.updateTotalReward = updateTotalReward;
window.markCompletedTasksAsClaimed = markCompletedTasksAsClaimed;

// Функции для интеграции с игровыми событиями
window.markTaskAsCompleted = markTaskAsCompleted;
window.markTaskAsClaimed = markTaskAsClaimed;
window.checkTasksCompletion = checkTasksCompletion;

// Функции для конкретных игровых событий
window.onMoneyEarned = function(amount) {
    // Вызывается при получении денег
    checkTasksCompletion();
};

window.onReggiHired = function() {
    // Вызывается при найме Реджи
    localStorage.setItem('hasReggi', 'true');
    markTaskAsCompleted(TASK_KEYS.HIRE_REGGI);
};

window.onSofaBought = function() {
    // Вызывается при покупке дивана
    localStorage.setItem('hasSofa', 'true');
    markTaskAsCompleted(TASK_KEYS.BUY_SOFA);
};

window.onBookPrinted = function() {
    // Вызывается при печати книги
    localStorage.setItem('hasPrintedBook', 'true');
    markTaskAsCompleted(TASK_KEYS.PRINT_BOOK);
};

// Тестовые функции для разработки
window.testTaskSystem = {
    // Сбросить все задания
    resetAll: function() {
        Object.values(TASK_KEYS).forEach(key => {
            localStorage.removeItem(`task_completed_${key}`);
            localStorage.removeItem(`task_claimed_${key}`);
        });
        localStorage.removeItem('hasReggi');
        localStorage.removeItem('hasSofa');
        localStorage.removeItem('hasPrintedBook');
        localStorage.removeItem('gameTasksRewardsClaimed');
        renderGameTasks();
        // Обновляем счетчики
        const tasks = getGameTasksData();
        updateTaskCounters(tasks);
        alert('Все задания сброшены!');
    },
    
    // Симулировать выполнение всех заданий
    completeAll: function() {
        // Устанавливаем баланс для денежных заданий
        if (window.setBalance) {
            window.setBalance(1000); // Больше 500 для выполнения всех денежных заданий
        }
        
        // Отмечаем остальные задания как выполненные
        localStorage.setItem('hasReggi', 'true');
        localStorage.setItem('hasSofa', 'true');
        localStorage.setItem('hasPrintedBook', 'true');
        
        // Отмечаем задания как выполненные
        Object.values(TASK_KEYS).forEach(key => {
            localStorage.setItem(`task_completed_${key}`, 'true');
        });
        
        renderGameTasks();
        // Обновляем счетчики
        const tasks = getGameTasksData();
        updateTaskCounters(tasks);
        alert('Все задания выполнены!');
    },
    
    // Симулировать получение всех наград
    claimAll: function() {
        Object.values(TASK_KEYS).forEach(key => {
            localStorage.setItem(`task_claimed_${key}`, 'true');
        });
        renderGameTasks();
        // Обновляем счетчики
        const tasks = getGameTasksData();
        updateTaskCounters(tasks);
        alert('Все награды получены!');
    }
};

// Функция для расчета общей суммы наград
function calculateTotalReward() {
    const gameTasks = getGameTasksData();
    
    let total = 0;
    gameTasks.forEach(task => {
        // Проверяем, что задание выполнено, но еще не получено
        const isCompleted = localStorage.getItem(`task_completed_${task.id}`) === 'true';
        const isClaimed = localStorage.getItem(`task_claimed_${task.id}`) === 'true';
        
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

// Функция для обновления суммы наград в кнопке
function updateTotalReward() {
    const btnGetAllRewards = document.getElementById('btn-get-all-rewards');
    if (btnGetAllRewards) {
        const totalReward = calculateTotalReward();
        const rewardSpan = btnGetAllRewards.querySelector('div span');
        if (rewardSpan) {
            rewardSpan.textContent = `+${totalReward}`;
        }
        
        // Проверяем, есть ли выполненные, но не полученные задания
        const hasCompletedTasks = totalReward !== '0';
        
        if (!hasCompletedTasks) {
            btnGetAllRewards.disabled = true;
            btnGetAllRewards.style.opacity = '0.5';
            btnGetAllRewards.style.cursor = 'not-allowed';
            btnGetAllRewards.style.background = '#333';
        } else {
            btnGetAllRewards.disabled = false;
            btnGetAllRewards.style.opacity = '1';
            btnGetAllRewards.style.cursor = 'pointer';
            btnGetAllRewards.style.background = '#5a5a5a';
        }
    }
}

// Функция для отметки завершенных заданий как полученных (устарела)
function markCompletedTasksAsClaimed() {
    // Эта функция больше не используется, так как теперь каждое задание отмечается индивидуально
    console.log('markCompletedTasksAsClaimed is deprecated');
} 