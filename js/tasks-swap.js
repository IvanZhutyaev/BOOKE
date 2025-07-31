// Tasks Panel Swap - переопределяем обработчики кнопок
document.addEventListener('DOMContentLoaded', () => {
    // Небольшая задержка чтобы убедиться что все обработчики из main.js загружены
    setTimeout(() => {
        console.log('Tasks-swap.js: Начинаем переопределение обработчиков');
        
        // Удаляем старый обработчик нижней кнопки "Задания" и создаем новый
        const bottomNavButton = document.querySelector('#bottom-nav button:nth-child(4)');
        if (bottomNavButton) {
            console.log('Tasks-swap.js: Найдена нижняя кнопка "Задания"');
            
            // Клонируем кнопку чтобы удалить все старые обработчики
            const newButton = bottomNavButton.cloneNode(true);
            bottomNavButton.parentNode.replaceChild(newButton, bottomNavButton);
            
            // Создаем новый обработчик для нижней кнопки
            newButton.addEventListener('click', (e) => {
                console.log('Tasks-swap.js: Клик по нижней кнопке "Задания"');
                e.preventDefault();
                e.stopPropagation();
                
                // Проверяем, не открыта ли уже какая-то панель
                const isAnyPanelOpen = () => {
                    const panels = [
                        'shop-panel',
                        'characters-panel', 
                        'city-panel',
                        'tasks-panel',
                        'profile-panel',
                        'inventory-panel',
                        'friends-panel',
                        'phone-panel',
                        'game-tasks-panel'
                    ];
                    return panels.some(id => document.getElementById(id)?.style.display === 'flex');
                };
                
                if (isAnyPanelOpen()) return;
                
                // Устанавливаем активное состояние
                if (window.setActiveNavButton) {
                    window.setActiveNavButton(4);
                }
                
                // Открываем новую панель игровых заданий
                const gameTasksPanel = document.getElementById('game-tasks-panel');
                if (gameTasksPanel) {
                    console.log('Tasks-swap.js: Открываем game-tasks-panel');
                    // Рендерим игровые задания и открываем панель
                    if (window.renderGameTasks) {
                        window.renderGameTasks();
                    }
                    if (window.showPanelWithAnimation) {
                        window.showPanelWithAnimation('game-tasks-panel');
                    } else {
                    gameTasksPanel.style.display = 'flex';
                    }
                } else {
                    console.error('Tasks-swap.js: game-tasks-panel не найден');
                }
            });
        } else {
            console.error('Tasks-swap.js: Нижняя кнопка "Задания" не найдена');
        }
        
        // Боковая кнопка btn-tasks теперь открывает панель с партнерскими заданиями
        const btnTasks = document.getElementById('btn-tasks');
        const tasksPanel = document.getElementById('tasks-panel');
        
        if (btnTasks && tasksPanel) {
            console.log('Tasks-swap.js: Найдена боковая кнопка btn-tasks');
            btnTasks.addEventListener('click', () => {
                console.log('Tasks-swap.js: Клик по боковой кнопке btn-tasks');
                
                // Проверяем, не открыта ли уже какая-то панель
                const isAnyPanelOpen = () => {
                    const panels = [
                        'shop-panel',
                        'characters-panel', 
                        'city-panel',
                        'tasks-panel',
                        'profile-panel',
                        'inventory-panel',
                        'friends-panel',
                        'phone-panel',
                        'game-tasks-panel'
                    ];
                    return panels.some(id => document.getElementById(id)?.style.display === 'flex');
                };
                
                if (isAnyPanelOpen()) return;
                
                // Рендерим партнерские задания и открываем панель
                if (window.renderPartnerTasks) {
                    window.renderPartnerTasks();
                }
                console.log('Tasks-swap.js: Открываем tasks-panel');
                if (window.showPanelWithAnimation) {
                    window.showPanelWithAnimation('tasks-panel');
                } else {
                tasksPanel.style.display = 'flex';
                }
                
                // Подсвечиваем кнопку белым цветом
                if (window.setActiveSideButton) {
                    window.setActiveSideButton('btn-tasks');
                }
            });
        } else {
            console.error('Tasks-swap.js: Боковая кнопка btn-tasks или tasks-panel не найдены');
        }
        
        console.log('Tasks-swap.js: Переопределение обработчиков завершено');
    }, 100); // Задержка 100мс
}); 