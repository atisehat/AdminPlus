// Date Calculator
let listOfHolidays = [];
let calcDateDays = { startDate: null, endDate: null };
const typeNames = { 0: "Default", 1: "Customer Service", 2: "Holiday Schedule", "-1": "Inner Calendar" };

async function fetchAllHolidaySchedules() {
    const fetchXml = `
        <fetch>
            <entity name="calendar">
                <attribute name="name" />
                <attribute name="type" />
                <filter>
                    <condition attribute="name" operator="not-null" />
                </filter>
            </entity>
        </fetch>
    `;
    try {
        const results = await Xrm.WebApi.retrieveMultipleRecords("calendar", `?fetchXml=${encodeURIComponent(fetchXml)}`);
        return results.entities.map(entity => ({
            name: `${entity.name} (Type: ${typeNames[entity.type] || "Unknown"})`,
            type: entity.type
        }));
    } catch (error) {
        console.error("Error fetching holiday schedules:", error);
        return [];
    }
}

async function setupHolidayScheduleDropdown() {
    const schedules = await fetchAllHolidaySchedules();
    const dropdown = document.getElementById('holidayScheduleDropdown');
    let defaultScheduleName = '';    
    const options = schedules.map(schedule => {
        const option = document.createElement('option');
        option.value = schedule.name;
        option.innerText = schedule.name;

        if (schedule.type === 2) {
            defaultScheduleName = schedule.name;
        }
        return option;
    });

    dropdown.append(...options); 
    dropdown.value = defaultScheduleName;
    displayHolidays(defaultScheduleName); 
    dropdown.addEventListener('change', (e) => {
        displayHolidays(e.target.value);
    }); 
}

async function getHolidaysForSchedule(scheduleName) {
    const actualScheduleName = extractActualScheduleName(scheduleName);
    const fetchXml = buildFetchXmlForHolidays(actualScheduleName);
    const results = await Xrm.WebApi.retrieveMultipleRecords("calendar", `?fetchXml=${encodeURIComponent(fetchXml)}`);    
    return formatHolidays(results.entities);
}

function extractActualScheduleName(scheduleName) {
    const matchedScheduleName = scheduleName.match(/^(.*?) \(Type:/);
    return matchedScheduleName ? matchedScheduleName[1] : scheduleName;
}

function buildFetchXmlForHolidays(scheduleName) {
    return `
        <fetch>
            <entity name="calendar">
                <filter>
                    <condition attribute="name" operator="eq" value="${scheduleName}" />
                </filter>
                <link-entity name="calendarrule" from="calendarid" to="calendarid" alias="rule">
                    <attribute name="name" />
                    <attribute name="starttime" />
                    <filter>
                        <condition attribute="starttime" operator="this-year" />
                    </filter>
                </link-entity>
            </entity>
        </fetch>
    `;
} 
function formatHolidays(entities) {
    return entities.map(entity => ({
        name: entity["rule.name"],
        date: new Date(entity["rule.starttime"])
    }));
}

async function displayHolidays(scheduleName) {
    try {
        const holidays = await getHolidaysForSchedule(scheduleName);       
        listOfHolidays = holidays.map(holiday => holiday.date.toISOString());              
        holidays.sort((a, b) => a.date - b.date);

        const holidaysList = document.getElementById('holidaysList');

       holidaysList.innerHTML = holidays.map(holiday => {
           const dateObj = new Date(holiday.date);
           const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
           const dayOfWeek = dayNames[dateObj.getUTCDay()];
           const formattedDate = `${dayOfWeek} - ${("0" + (dateObj.getUTCMonth() + 1)).slice(-2)}/${("0" + dateObj.getUTCDate()).slice(-2)}/${dateObj.getUTCFullYear()}`;
           return `<div class="holidayRow"><div class="holidayName"><b>${holiday.name}</b></div><div class="holidayDate">${formattedDate}</div></div>`;
       }).join('');               
           initCalendar(holidays);
    } catch (error) {
        console.error("Error fetching holidays: ", error);
    }
}

function createModalContent() {
    const container = document.createElement('div');
    container.className = 'commonPopup dateCalculatorPopup';
    
    container.innerHTML = `
        <div class="commonPopup-header">
            <span style="color: white;">Date Calculator</span>
            <span class="close-button">&times;</span>
        </div>
        <div class="popup-body">
            <!-- Top Section: Holidays & Calendar -->
            <div class="dateCalc-topSection">
                <!-- Holiday Schedule Panel -->
                <div class="dateCalc-panel">
                    <div class="dateCalc-panelHeader">
                        <h3>System Schedule(s):</h3>
                        <select id="holidayScheduleDropdown"></select>
                    </div>
                    <div class="holidaysList" id="holidaysList"></div>
                </div>
                
                <!-- Calendar Panel -->
                <div class="dateCalc-panel">
                    <div class="calendar">
                        <div class="calendarHeader">
                            <button id="prevMonth">&lt;</button>
                            <span id="monthYearLabel"></span>
                            <button id="nextMonth">&gt;</button>
                        </div>
                        <div class="calendarDays">
                            <div>Sun</div>
                            <div>Mon</div>
                            <div>Tue</div>
                            <div>Wed</div>
                            <div>Thu</div>
                            <div>Fri</div>
                            <div>Sat</div>
                        </div>
                        <div class="calendarDates" id="calendarDates"></div>
                    </div>
                </div>
            </div>
            
            <!-- Bottom Section: Calculations -->
            <div class="dateCalc-bottomSection">
                <!-- Days Between Dates Panel -->
                <div class="dateCalc-calcPanel">
                    <h4 class="dateCalc-calcTitle">Days Between Two Dates</h4>
                    
                    <div class="dateCalc-options">
                        <label class="dateCalc-checkbox">
                            <input type="checkbox" id="excludeSchedule">
                            <span>Exclude System Schedule Days</span>
                        </label>
                        <label class="dateCalc-checkbox">
                            <input type="checkbox" id="excludeWeekends">
                            <span>Exclude Weekends</span>
                        </label>
                        <label class="dateCalc-checkbox">
                            <span>Exclude Additional Days</span>
                            <input type="number" id="daysCount" min="1" step="1" placeholder="Enter number">
                        </label>
                    </div>
                    
                    <div class="dateCalc-inputs">
                        <div class="dateCalc-inputGroup">
                            <label for="startDate1">Start Date:</label>
                            <input type="date" id="startDate1">
                        </div>
                        <div class="dateCalc-inputGroup">
                            <label for="endDate1">End Date:</label>
                            <input type="date" id="endDate1">
                        </div>
                    </div>
                    
                    <div class="dateCalc-results">
                        <div class="dateCalc-resultRow">
                            <span>Days from Start to End:</span>
                            <span>--</span>
                        </div>
                        <div class="dateCalc-resultRow">
                            <span>Excluded Schedule Days:</span>
                            <span>--</span>
                        </div>
                        <div class="dateCalc-resultRow">
                            <span>Excluded Weekends:</span>
                            <span>--</span>
                        </div>
                        <div class="dateCalc-resultRow">
                            <span>Excluded Additional Days:</span>
                            <span>--</span>
                        </div>
                        <hr class="dateCalc-separator">
                        <div class="dateCalc-resultRow dateCalc-total">
                            <span><strong>Total Days:</strong></span>
                            <span><strong>--</strong></span>
                        </div>
                    </div>
                    
                    <button class="dateCalc-submitBtn" id="section3SubmitBtn">Calculate</button>
                    
                    <div class="dateCalc-note" style="display: none;">
                        <strong>Note:</strong> The calculation is inclusive - both Start Date and End Date are counted as full days. Holidays on weekends are not double-counted.
                    </div>
                </div>
                
                <!-- Add Days to Date Panel -->
                <div class="dateCalc-calcPanel">
                    <h4 class="dateCalc-calcTitle">Add Days to a Date</h4>
                    
                    <div class="dateCalc-options">
                        <label class="dateCalc-checkbox">
                            <input type="checkbox" id="addSchedule">
                            <span>Exclude System Schedule Days</span>
                        </label>
                        <label class="dateCalc-checkbox">
                            <input type="checkbox" id="addWeekends">
                            <span>Exclude Weekends</span>
                        </label>
                    </div>
                    
                    <div class="dateCalc-inputs">
                        <div class="dateCalc-inputGroup">
                            <label for="pickDate">Start Date:</label>
                            <input type="date" id="pickDate">
                        </div>
                        <div class="dateCalc-inputGroup">
                            <label for="addDaysCount">Days to Add:</label>
                            <input type="number" id="addDaysCount" min="1" step="1" placeholder="Enter number">
                        </div>
                    </div>
                    
                    <div class="dateCalc-results">
                        <div class="dateCalc-resultRow">
                            <span>Excluded Schedule Days:</span>
                            <span>--</span>
                        </div>
                        <div class="dateCalc-resultRow">
                            <span>Excluded Weekends:</span>
                            <span>--</span>
                        </div>
                        <div class="dateCalc-resultRow">
                            <span>Total Excluded Days:</span>
                            <span>--</span>
                        </div>
                        <hr class="dateCalc-separator">
                        <div class="dateCalc-resultRow dateCalc-total">
                            <span><strong>Final Date:</strong></span>
                            <span><strong>--</strong></span>
                        </div>
                    </div>
                    
                    <button class="dateCalc-submitBtn" id="section4SubmitBtn">Calculate</button>
                </div>
            </div>
        </div>
    `;    
    return container;    
}

function setupDateFormListeners() {
    document.getElementById('section3SubmitBtn').addEventListener('click', function() {
        calcDateDays.startDate = document.getElementById('startDate1').value;
        calcDateDays.endDate = document.getElementById('endDate1').value;

        if (!calcDateDays.startDate || !calcDateDays.endDate) {
            showCustomAlert(`Please provide both Start Date and End Date.`);            
            document.querySelectorAll('.dateCalc-calcPanel:first-child .dateCalc-resultRow span:nth-child(2)').forEach(span => span.textContent = "--");
            return; 
        }
        
        // Date comparison using Date obj
        const startDateObj = createDateObject(calcDateDays.startDate);
        const endDateObj = createDateObject(calcDateDays.endDate);
        
        if (endDateObj < startDateObj) {
            showCustomAlert("End Date cannot be less than Start Date.");
            document.querySelectorAll('.dateCalc-calcPanel:first-child .dateCalc-resultRow span:nth-child(2)').forEach(span => span.textContent = "--");
            return; 
        }

        const daysDifference = calculateDateDifference(calcDateDays.startDate, calcDateDays.endDate);        
        const isExcludeWeekendsChecked = document.getElementById('excludeWeekends').checked;        
        const isExcludeScheduleChecked = document.getElementById('excludeSchedule').checked;
        const holidaysCount = isExcludeScheduleChecked ? getHolidaysBetweenDates(calcDateDays.startDate, calcDateDays.endDate, isExcludeWeekendsChecked) : 0;        
        const weekendsCount = isExcludeWeekendsChecked ? countWeekendsBetweenDates(calcDateDays.startDate, calcDateDays.endDate) : 0;
        
        let remainingDays = daysDifference - holidaysCount - weekendsCount;        
        const additionalExcludedDays = Math.min(remainingDays, document.getElementById('daysCount').value || 0);

        const resultRows = document.querySelectorAll('.dateCalc-calcPanel:first-child .dateCalc-resultRow');
        resultRows[0].querySelector('span:nth-child(2)').textContent = `${daysDifference} Day(s)`;
        resultRows[1].querySelector('span:nth-child(2)').textContent = `${holidaysCount} Day(s)`;
        resultRows[2].querySelector('span:nth-child(2)').textContent = `${weekendsCount} Day(s)`;
        resultRows[3].querySelector('span:nth-child(2)').textContent = `${additionalExcludedDays} Day(s)`;

        // Set total days
        const totalDays = remainingDays - additionalExcludedDays;
        document.querySelector(".dateCalc-calcPanel:first-child .dateCalc-total span:nth-child(2)").textContent = 
            totalDays < 0 ? `${totalDays} Day(s)` : `${totalDays} Day(s)`;
        
        // Show note
        const noteElement = document.querySelector('.dateCalc-note');
        if (noteElement) {
            noteElement.style.display = 'block';
        }        
    });
}

function setupSection4FormListeners() {
    const section4SubmitBtn = document.getElementById('section4SubmitBtn');

    section4SubmitBtn.addEventListener('click', function() {
        const startDateStr = document.getElementById('pickDate').value;
        const daysToAdd = parseInt(document.getElementById('addDaysCount').value, 10);

        if (!startDateStr || isNaN(daysToAdd)) {
            showCustomAlert("Please provide both Start Date and Days to Add.");
            return;
        }
        
        // Validate that days to add is positive
        if (daysToAdd <= 0) {
            showCustomAlert("Days to Add must be greater than 0.");
            return;
        }

        const isAddWeekendsChecked = document.getElementById('addWeekends').checked;
        const isAddScheduleChecked = document.getElementById('addSchedule').checked;
        let startDate = createDateObject(startDateStr);
        let finalDate = new Date(startDate);

        let totalAddedDays = 0;
        let weekendsCount = 0;
        let holidaysCount = 0;
        
        while (totalAddedDays < daysToAdd) {
            finalDate.setDate(finalDate.getDate() + 1); // Use local time
            const dayOfWeek = finalDate.getDay();
            
            // Check if current date is a weekend
            const isWeekend = (dayOfWeek === 6 || dayOfWeek === 0);
            
            // Check if current date is a holiday
            const currentDateString = finalDate.toISOString().split('T')[0] + 'T00:00:00.000Z';
            const isHoliday = listOfHolidays.includes(currentDateString);
            
            // Skip weekends if option is checked
            if (isAddWeekendsChecked && isWeekend) {
                weekendsCount++;
                continue; 
            }
            
            // Skip holidays if option is checked
            if (isAddScheduleChecked && isHoliday && !(isAddWeekendsChecked && isWeekend)) {
                holidaysCount++;
                continue; 
            }
            
            totalAddedDays++; 
        }
        
        // Format date with zero-padding 
        const month = String(finalDate.getMonth() + 1).padStart(2, '0');
        const day = String(finalDate.getDate()).padStart(2, '0');
        const year = finalDate.getFullYear();
        const formattedFinalDate = `${month}-${day}-${year}`;
        
        // Calculate total excluded days (weekends + holidays)
        const totalExcludedDays = weekendsCount + holidaysCount;
        
        const addResultRows = document.querySelectorAll('.dateCalc-calcPanel:last-child .dateCalc-resultRow');
        addResultRows[0].querySelector('span:nth-child(2)').textContent = `${holidaysCount} Day(s)`;
        addResultRows[1].querySelector('span:nth-child(2)').textContent = `${weekendsCount} Day(s)`;
        addResultRows[2].querySelector('span:nth-child(2)').textContent = `${totalExcludedDays} Day(s)`;
        document.querySelector('.dateCalc-calcPanel:last-child .dateCalc-total span:nth-child(2)').textContent = formattedFinalDate;
    });
}

function attachModalEventHandlers(container) {
    // Close Btn
    const closeButton = container.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
      container.remove();
    });
    
    // Hover effect
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.backgroundColor = 'transparent';
    });
    
    makePopupMovable(container); 
    setupDateFormListeners();
    setupSection4FormListeners();
}

async function dateCalc() {
    // Close all popups
    const existingPopups = document.querySelectorAll('.commonPopup');
    existingPopups.forEach(popup => popup.remove());    
    const modalContent = createModalContent();
    modalContent.setAttribute('data-popup-id', 'dateCalculator');
    document.body.appendChild(modalContent);
    attachModalEventHandlers(modalContent);    
    const defaultSchedule = await setupHolidayScheduleDropdown();   
}

// Calendar functionality
function initCalendar(holidays) {    
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();    
    // Dates to string.
    const holidayDates = new Set(holidays.map(h => (h.date instanceof Date ? h.date.toISOString() : h.date).split('T')[0]));

    function displayCalendar(holidays, month, year) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();    
        
        const today = new Date();
        const todayDate = today.getDate();
        const todayMonth = today.getMonth();
        const todayYear = today.getFullYear();
    
        let calendarHTML = '';            
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarHTML += '<div></div>';
        }        
        for (let i = 1; i <= daysInMonth; i++) {
            let currentDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`; 
            let dateClass = '';
            let titleAttr = '';            
            if (holidayDates.has(currentDate)) {
                const holidayObject = holidays.find(h => {
                    const formattedDate = (h.date instanceof Date ? h.date.toISOString() : h.date).split('T')[0];
                    return formattedDate === currentDate;
                });
                const holidayName = holidayObject ? holidayObject.name : "Unknown Holiday";
                dateClass = 'holidayDate';
                titleAttr = `title="${holidayName}"`;
            } 
            if (i === todayDate && month === todayMonth && year === todayYear) {
                dateClass += ' todayDate'; 
            }    
            calendarHTML += `<div class="${dateClass}" ${titleAttr}>${i}</div>`;
        }    
        document.getElementById('calendarDates').innerHTML = calendarHTML;    
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        document.getElementById('monthYearLabel').innerText = `${monthNames[month]} ${year}`;
    }

    function goToPrevMonth() {
        if(currentMonth === 0) {
            currentMonth = 11;
            currentYear -= 1;
        } else {
            currentMonth -= 1;
        }
        displayCalendar(holidays, currentMonth, currentYear);
    }

    function goToNextMonth() {
        if(currentMonth === 11) {
            currentMonth = 0;
            currentYear += 1;
        } else {
            currentMonth += 1;
        }
        displayCalendar(holidays, currentMonth, currentYear);
    }

    document.getElementById('prevMonth').addEventListener('click', goToPrevMonth);
    document.getElementById('nextMonth').addEventListener('click', goToNextMonth);    
    
    displayCalendar(holidays, currentMonth, currentYear);    
}

function createDateObject(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);    
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
}

function calculateDateDifference(startDate, endDate) {
    const start = createDateObject(startDate);
    const end = createDateObject(endDate);    
    const diffInDays = (end - start) / (1000 * 60 * 60 * 24) + 1; 
    return Math.round(diffInDays); 
}

function getHolidaysBetweenDates(startDate, endDate, excludeWeekends = false) {
    const start = createDateObject(startDate);
    const end = createDateObject(endDate);
    return listOfHolidays.reduce((count, holidayDateStr) => {
        const holiday = new Date(holidayDateStr);        
        holiday.setHours(0, 0, 0, 0);
        const dayOfWeek = holiday.getDay(); // Use local time
        
        if (holiday >= start && holiday <= end) {
            if (excludeWeekends) {
                // Only count holidays, NOT on weekends                
                if (dayOfWeek !== 6 && dayOfWeek !== 0) {
                    count++;
                }
            } else {
                // Count all holidays
                count++;
            }
        }
        return count;
    }, 0);
}

function countWeekendsBetweenDates(startDate, endDate) {
    const start = createDateObject(startDate);
    const end = createDateObject(endDate);    
    let count = 0;    
    let currentDate = new Date(start);
    
    while (currentDate <= end) {
        if (currentDate.getDay() === 6 || currentDate.getDay() === 0) {
            count++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return count;
}
