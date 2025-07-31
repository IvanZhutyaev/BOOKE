// Система управления уровнями сотрудников
const EMPLOYEE_KEYS = {
    bloomi: 'employee_bloomi_level',
    reggi: 'employee_reggi_level', 
    spikes: 'employee_spikes_level',
    grinni: 'employee_grinni_level',
    perpi: 'employee_perpi_level'
};

// Получение уровня сотрудника из localStorage
function getEmployeeLevel(employeeKey) {
    return parseInt(localStorage.getItem(EMPLOYEE_KEYS[employeeKey]) || '1');
}

// Установка уровня сотрудника
function setEmployeeLevel(employeeKey, level) {
    localStorage.setItem(EMPLOYEE_KEYS[employeeKey], level.toString());
    updateEmployeeLevelDisplay(employeeKey);
}

// Увеличение уровня сотрудника
function increaseEmployeeLevel(employeeKey, amount = 1) {
    const currentLevel = getEmployeeLevel(employeeKey);
    const newLevel = currentLevel + amount;
    setEmployeeLevel(employeeKey, newLevel);
    return newLevel;
}

// Обновление отображения уровня сотрудника в панели статистики
function updateEmployeeLevelDisplay(employeeKey) {
    const levelElement = document.querySelector(`[data-level="${employeeKey}"]`);
    if (levelElement) {
        const level = getEmployeeLevel(employeeKey);
        levelElement.textContent = level;
    }
}

// Обновление всех уровней сотрудников
function updateAllEmployeeLevels() {
    Object.keys(EMPLOYEE_KEYS).forEach(employeeKey => {
        updateEmployeeLevelDisplay(employeeKey);
    });
}

// Получение всех уровней сотрудников
function getAllEmployeeLevels() {
    const levels = {};
    Object.keys(EMPLOYEE_KEYS).forEach(employeeKey => {
        levels[employeeKey] = getEmployeeLevel(employeeKey);
    });
    return levels;
}

// Инициализация системы уровней сотрудников
function initEmployeeLevels() {
    // Устанавливаем начальные уровни, если их нет
    Object.keys(EMPLOYEE_KEYS).forEach(employeeKey => {
        if (!localStorage.getItem(EMPLOYEE_KEYS[employeeKey])) {
            // Устанавливаем разные начальные уровни для демонстрации
            const initialLevels = {
                bloomi: 12,
                reggi: 1,
                spikes: 8,
                grinni: 5,
                perpi: 3
            };
            setEmployeeLevel(employeeKey, initialLevels[employeeKey] || 1);
        }
    });
    
    // Обновляем отображение
    updateAllEmployeeLevels();
}

// Функция для тестирования - увеличение уровня случайного сотрудника
function testIncreaseRandomEmployee() {
    const employees = Object.keys(EMPLOYEE_KEYS);
    const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
    const newLevel = increaseEmployeeLevel(randomEmployee, 1);
    console.log(`Увеличен уровень ${randomEmployee} до ${newLevel}`);
}

// Экспорт функций для использования в других файлах
window.employeeLevels = {
    get: getEmployeeLevel,
    set: setEmployeeLevel,
    increase: increaseEmployeeLevel,
    updateAll: updateAllEmployeeLevels,
    getAll: getAllEmployeeLevels,
    test: testIncreaseRandomEmployee
};

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', initEmployeeLevels);

// Обновление уровней при открытии панели статистики
document.addEventListener('DOMContentLoaded', () => {
    // Находим кнопку статистики и добавляем обработчик
    const statsButton = document.getElementById('btn-news');
    if (statsButton) {
        statsButton.addEventListener('click', () => {
            // Небольшая задержка, чтобы панель успела открыться
            setTimeout(updateAllEmployeeLevels, 100);
        });
    }
}); 