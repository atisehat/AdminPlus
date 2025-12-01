# Date Calculator - Calculation Logic Documentation

## Days Between Dates Calculation

### Overview
The "Days Between Dates" calculation computes the net business days between two dates, with options to exclude system schedule days, weekends, and additional custom days.

### Calculation Formula

```
Net Business Days = Total Days - Schedule Days - Weekend Days - Additional Days
```

### Step-by-Step Process

#### 1. **Total Days Calculation**
- Calculates the number of days from Start Date to End Date (inclusive)
- Both start and end dates are counted as full days
- Formula: `(End Date - Start Date) / (24 hours) + 1`
- Example: Jan 1 to Jan 5 = 5 days

#### 2. **System Schedule Days Exclusion**
When "Exclude System Schedule Days" is checked:
- Fetches holidays from the selected System Schedule (Dynamics 365 Calendar)
- Holidays are stored as UTC ISO strings
- Uses `getUTCDay()` to determine day of week
- **Important**: If "Exclude Weekends" is also checked, only weekday holidays are counted to prevent double-counting

#### 3. **Weekend Days Exclusion**
When "Exclude Weekends" is checked:
- Counts all Saturdays (day 6) and Sundays (day 0) in the date range
- Uses local time `.getDay()` since user-entered dates are in local time
- Counts weekends independently from holidays

#### 4. **Additional Days Exclusion**
- User can specify a custom number of additional days to exclude
- This value cannot exceed the remaining days after other exclusions
- Uses `Math.min(remainingDays, userInput)` to prevent negative results

### Double-Counting Prevention

The logic prevents double-counting holidays that fall on weekends through this mechanism:

**Scenario 1: Both "Exclude Schedule" AND "Exclude Weekends" checked**
- `getHolidaysBetweenDates()` is called with `excludeWeekends=true`
- This filters OUT holidays that fall on weekends
- Weekends are counted separately
- Result: No double-counting ✅

**Scenario 2: Only "Exclude Schedule" checked**
- All holidays (including weekend holidays) are counted
- Weekends are NOT counted separately
- Result: No double-counting ✅

**Scenario 3: Only "Exclude Weekends" checked**
- Holidays are NOT counted
- All weekends are counted
- Result: No double-counting ✅

### Example Calculation

**Date Range**: January 1-15, 2025 (15 days)
**System Schedule Holidays**: 
- Jan 3 (Friday)
- Jan 10 (Friday)
**Weekends in Range**:
- Jan 4 (Saturday)
- Jan 5 (Sunday)
- Jan 11 (Saturday)
- Jan 12 (Sunday)
**Additional Days**: 1

**With all exclusions enabled:**
```
Total Days:              15
- Schedule Days:         -2  (Jan 3, Jan 10 - only weekdays)
- Weekend Days:          -4  (Jan 4-5, 11-12)
- Additional Days:       -1
-----------------------------------
Net Business Days:        8
```

## Add Days to Date Calculation

### Overview
The "Add Days to Date" calculation determines the final date after adding a specified number of business days, optionally excluding weekends and system schedule days.

### Process

1. **Start Date**: User-selected starting date
2. **Days to Add**: Number of business days to add (can be 0)
3. **Iteration**: Loop through days, incrementing the date
4. **Exclusion Logic**:
   - If the current day is a weekend AND "Exclude Weekends" is checked: Skip, increment weekend counter
   - If the current day is a holiday AND "Exclude Schedule" is checked AND NOT already counted as a weekend: Skip, increment holiday counter
   - Otherwise: Count as a valid business day
5. **Result**: Final date after adding the specified number of business days

### Important Notes

- Holidays that fall on weekends are NOT double-counted
- The logic checks `!(isAddWeekendsChecked && isWeekend)` before counting a holiday
- If Days to Add is 0, the final date equals the start date
- The calculation tracks excluded weekends and holidays separately for reporting

## Data Consistency

### UTC vs Local Time
- **System Schedule Data**: Stored and processed in UTC
  - Uses `.getUTCDay()` for day-of-week checks
  - Uses `.toISOString()` for storage
- **User-Entered Dates**: Processed in local time
  - Uses `.getDay()` for day-of-week checks
  - Created with local timezone via `new Date(year, month-1, day)`

### Date Comparison
- All date objects have time set to `00:00:00.000` for consistent comparison
- Uses `.setHours(0, 0, 0, 0)` to normalize times

## Known Behaviors

1. **Inclusive Counting**: Both start and end dates are included in the calculation
2. **Negative Protection**: Additional days cannot exceed remaining days after other exclusions
3. **Weekend Definition**: Saturday (day 6) and Sunday (day 0)
4. **Holiday-Weekend Overlap**: Automatically handled without double-counting
5. **Empty Schedule**: If no schedule is selected or no holidays exist, schedule exclusion count is 0

## Testing Recommendations

To verify calculation accuracy:
1. Test with known date ranges and manually count business days
2. Verify holidays on weekends are not double-counted
3. Test edge cases: same-day dates, weekend-heavy periods, holiday-heavy periods
4. Verify both calculation modes (Days Between and Add Days) produce consistent results

