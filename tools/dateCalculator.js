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
            <div class="commonSection content-section">
                <div class="securityPopup-row">
                    <div class="section1-row1" id="section1">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px;">
                            <h3 style="margin: 0; white-space: nowrap;">System Schedule(s):</h3>                    
                            <select id="holidayScheduleDropdown" style="flex: 1; max-width: 350px; min-width: 0;"></select>
                        </div>
                        <div class="holidaysList" id="holidaysList"></div>     			      
                    </div>
                    <div class="section1-row1" id="section2">
                        <div class="calendar" id="calendar">
                            <div class="calendarHeader" id="calendarHeader">
                                <button id="prevMonth">&lt;</button>
                                <span id="monthYearLabel"></span>
                                <button id="nextMonth">&gt;</button>
                            </div>
                            <div class="calendarDays" id="calendarDays">
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
                <div class="securityPopup-row">
                    <div class="section1-row2" id="section3">
                        <div class="excludeSettingsWrapper">
                            <h4>Days Between Two Dates:</h4>                    
                            <div class="checkboxWrapper">
                                <input type="checkbox" id="excludeSchedule" name="excludeOptions" value="excludeSchedule">
                                <label for="excludeSchedule">Exclude System Schedule Days</label>
                            </div>                    
                            <div class="checkboxWrapper">
                                <input type="checkbox" id="excludeWeekends" name="excludeOptions" value="excludeWeekends">
                                <label for="excludeWeekends">Exclude Weekends</label>
                            </div>                    
                            <div class="checkboxWrapper excludeSpecificDaysWrapper">                        
                                <label for="excludeSpecificDays">Exclude Additional Days</label>
                                <input type="number" id="daysCount" name="daysCount" min="1" step="1" placeholder="Enter number">
                            </div>
                        </div>                
                        <div class="dateSection">
                            <div class="dateRow">
                                <div>
                                    <label for="startDate1">Start Date:</label>
                                    <input type="date" id="startDate1" name="startDate1">
                                </div>
                                <div>
                                    <label for="endDate1">End Date:</label>
                                    <input type="date" id="endDate1" name="endDate1">
                                </div>
                            </div>                          
                            <div class="calculationsWrapper">
                                <div class="calculationRow">
                                    <span>Days from Start Date to End Date:</span>
                                    <span>--  </span>
                                </div>
                                <div class="calculationRow">
                                    <span>Excluded Schedule Days:</span>
                                    <span>--  </span>
                                </div>
                                <div class="calculationRow">
                                    <span>Excluded Weekends:</span>
                                    <span>--  </span>
                                </div>
                                <div class="calculationRow">
                                    <span>Excluded Additional Days:</span>
                                    <span>--  </span>
                                </div>                   
                                <hr class="separator">
                                <div class="calculationRow">
                                    <span><strong>Total Days:</strong></span>
                                    <span><strong>--  </strong></span>
                                </div>                    
                            </div>                
                        </div>
                        <div class="section3-submitBtn">
                            <button id="section3SubmitBtn">Submit</button>
                        </div>
                        <div class="notes">
                            <strong>Note:</strong>                
                            <span>The calculation is inclusive - both Start Date and End Date are counted as full days. Holidays on weekends are not double-counted.</span>                          
                        </div>
                    </div>            
                    <div class="section1-row2" id="section4">                                 
                        <div class="addSettingsWrapper">
                            <h4>Add Days to a Date:</h4>                    
                            <div class="checkboxWrapper">
                                <input type="checkbox" id="addSchedule" name="addOptions" value="addSchedule">
                                <label for="addSchedule">Exclude System Schedule Days</label>
                            </div>                    
                            <div class="checkboxWrapper">
                                <input type="checkbox" id="addWeekends" name="addOptions" value="addWeekends">
                                <label for="addWeekends">Exclude Weekends</label>
                            </div>                                            
                        </div>                
                        <div class="dateSection">
                            <div class="addDateRow">
                                <div>
                                    <label for="pickDate">Start Date:</label>
                                    <input type="date" id="pickDate" name="pickDate">
                                </div>
                                <div>
                                    <label for="addSpecificDays">Days to add</label>
                                    <input type="number" id="addDaysCount" name="addDaysCount" min="1" step="1" placeholder="Enter number">
                                </div>
                            </div>                          
                            <div class="addCalculationsWrapper">                        
                                <div class="calculationRow">
                                    <span>Excluded Schedule Days:</span>
                                    <span>--  </span>
                                </div>
                                <div class="calculationRow">
                                    <span>Excluded Weekends:</span>
                                    <span>--  </span>
                                </div>
                                <div class="calculationRow">
                                    <span>Excluded Days:</span>
                                    <span>--  </span>
                                </div>                   
                                <hr class="addDateSeparator">
                                <div class="calculationRow">
                                    <span><strong>Final Date:</strong></span>
                                    <span><strong>--  </strong></span>
                                </div>
                            </div>                
                        </div>
                        <div class="section4-submitBtn">
                            <button id="section4SubmitBtn">Submit</button>
                        </div>                
                    </div>
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
            document.querySelectorAll('.calculationRow span:nth-child(2)').forEach(span => span.textContent = "-- ");
            return; 
        }
        
        // Date comparison using Date obj
        const startDateObj = createDateObject(calcDateDays.startDate);
        const endDateObj = createDateObject(calcDateDays.endDate);
        
        if (endDateObj < startDateObj) {
            showCustomAlert("End Date cannot be less than Start Date.");
            document.querySelectorAll('.calculationRow span:nth-child(2)').forEach(span => span.textContent = "-- ");
            return; 
        }

        const daysDifference = calculateDateDifference(calcDateDays.startDate, calcDateDays.endDate);        
        const isExcludeWeekendsChecked = document.getElementById('excludeWeekends').checked;        
        const isExcludeScheduleChecked = document.getElementById('excludeSchedule').checked;
        const holidaysCount = isExcludeScheduleChecked ? getHolidaysBetweenDates(calcDateDays.startDate, calcDateDays.endDate, isExcludeWeekendsChecked) : 0;        
        const weekendsCount = isExcludeWeekendsChecked ? countWeekendsBetweenDates(calcDateDays.startDate, calcDateDays.endDate) : 0;
        
        let remainingDays = daysDifference - holidaysCount - weekendsCount;        
        const additionalExcludedDays = Math.min(remainingDays, document.getElementById('daysCount').value || 0);

        document.querySelector(".calculationRow span:nth-child(2)").textContent = `${daysDifference} Day(s)`;        
        document.querySelector(".calculationRow:nth-child(2) span:nth-child(2)").textContent = `${holidaysCount} Day(s)`;        
        document.querySelector(".calculationRow:nth-child(3) span:nth-child(2)").textContent = `${weekendsCount} Day(s)`;
        document.querySelector(".calculationRow:nth-child(4) span:nth-child(2)").textContent = `${additionalExcludedDays} Day(s)`;

        // Set total days
        const totalDays = remainingDays - additionalExcludedDays;
        document.querySelector(".calculationRow:nth-child(6) span:nth-child(2)").textContent = 
            totalDays < 0 ? `${totalDays} Day(s)` : `${totalDays} Day(s)`;
        
        // Show note
        const noteElement = document.querySelector('.notes');
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
        
        document.querySelector('.addCalculationsWrapper .calculationRow:nth-child(1) span:nth-child(2)').textContent = `${holidaysCount} Day(s)`;
        document.querySelector('.addCalculationsWrapper .calculationRow:nth-child(2) span:nth-child(2)').textContent = `${weekendsCount} Day(s)`;
        document.querySelector('.addCalculationsWrapper .calculationRow:nth-child(3) span:nth-child(2)').textContent = `${totalExcludedDays} Day(s)`;
        document.querySelector('.addCalculationsWrapper .calculationRow:nth-child(5) span:nth-child(2)').textContent = formattedFinalDate;
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
