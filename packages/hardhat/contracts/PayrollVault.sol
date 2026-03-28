//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PayrollVault
 * @dev Individual vault for each company managing employee salaries and withdrawals.
 * 
 * Features:
 * - Employee management (add/remove with salary amount)
 * - Configurable payment schedule (withdrawal day of month)
 * - Time-based withdrawal locking
 * - Vault freezing capability
 * - Deposit functionality
 * 
 * @author Rootstock Payroll Vault
 */
contract PayrollVault is ReentrancyGuard {
    // State Variables
    address public registry;           // reference to VaultRegistry
    address public company;            // company/admin address
    string public companyName;         // company identifier
    bool public frozen;                // vault freeze status
    uint8 public withdrawalDay;        // day of month for withdrawals (1-28)
    uint256 public cycleStart;         // timestamp of current cycle start
    
    // Employee data
    struct Employee {
        uint256 salaryAmount;           // monthly salary in wei
        uint256 firstSalaryAmount;     // first month salary (can be different)
        uint256 lastWithdrawTime;       // timestamp of last withdrawal
        uint256 joinedAt;              // timestamp when employee was added
        bool hasWithdrawnFirstSalary;  // whether first salary has been withdrawn
        bool isActive;                 // employment status
    }
    mapping(address => Employee) public employees;
    address[] public employeeList;      // list of employee addresses
    
    // Events for off-chain indexing (MongoDB)
    event Deposit(
        address indexed from, 
        uint256 amount, 
        uint256 newBalance,
        uint256 timestamp
    );
    event EmployeeAdded(
        address indexed employee, 
        uint256 salaryAmount,
        address indexed addedBy,
        uint256 timestamp
    );
    event EmployeeRemoved(
        address indexed employee,
        address indexed removedBy,
        uint256 timestamp
    );
    event EmployeeUpdated(
        address indexed employee,
        uint256 oldSalary,
        uint256 newSalary,
        uint256 timestamp
    );
    event Withdrawal(
        address indexed employee, 
        uint256 amount,
        uint256 timestamp
    );
    event VaultFrozen(
        bool status,
        address indexed frozenBy,
        uint256 timestamp
    );
    event WithdrawalDayChanged(
        uint8 oldDay, 
        uint8 newDay,
        address indexed changedBy,
        uint256 timestamp
    );
    event CompanyUpdated(
        string oldName,
        string newName,
        uint256 timestamp
    );
    event VaultEmptied(
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    // Modifiers
    modifier onlyCompany() {
        require(msg.sender == company, "Caller is not the company admin");
        _;
    }

    modifier whenNotFrozen() {
        require(!frozen, "Vault is frozen");
        _;
    }

    /**
     * @dev Initialize the vault (called via proxy)
     * @param _company Company admin address
     * @param _companyName Name of the company
     * @param _registry Address of the VaultRegistry
     */
    function initialize(
        address _company,
        string memory _companyName,
        address _registry
    ) external {
        require(company == address(0), "Already initialized");
        require(_company != address(0), "Invalid company address");
        require(_registry != address(0), "Invalid registry address");
        
        company = _company;
        companyName = _companyName;
        registry = _registry;
        withdrawalDay = 25; // Default to 25th of month
        cycleStart = block.timestamp;
    }

    /**
     * @dev Deposit funds to the vault
     * @notice This function accepts native RBTC/ETH
     */
    function deposit() external payable whenNotFrozen {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        
        emit Deposit(
            msg.sender, 
            msg.value, 
            address(this).balance,
            block.timestamp
        );
    }

    /**
     * @dev Add a new employee to the vault
     * @param _employee Employee address
     * @param _salaryAmount Monthly salary in wei
     * @param _firstSalaryAmount First month salary in wei (can be different from regular salary)
     */
    function addEmployee(address _employee, uint256 _salaryAmount, uint256 _firstSalaryAmount) 
        external 
        onlyCompany 
    {
        require(_employee != address(0), "Invalid employee address");
        require(_salaryAmount > 0, "Salary must be greater than 0");
        // First salary is optional - if 0, use regular salary for first month
        require(!employees[_employee].isActive, "Employee already exists");
        
        employees[_employee] = Employee({
            salaryAmount: _salaryAmount,
            firstSalaryAmount: _firstSalaryAmount > 0 ? _firstSalaryAmount : _salaryAmount,
            lastWithdrawTime: 0,
            joinedAt: block.timestamp,
            hasWithdrawnFirstSalary: false,
            isActive: true
        });
        
        employeeList.push(_employee);
        
        emit EmployeeAdded(
            _employee, 
            _salaryAmount,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Remove an employee from the vault
     * @param _employee Employee address
     */
    function removeEmployee(address _employee) 
        external 
        onlyCompany 
    {
        require(employees[_employee].isActive, "Employee not found");
        
        employees[_employee].isActive = false;
        
        emit EmployeeRemoved(
            _employee,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Update an employee's salary
     * @param _employee Employee address
     * @param _newSalary New monthly salary in wei
     */
    function updateEmployeeSalary(address _employee, uint256 _newSalary)
        external
        onlyCompany
    {
        require(employees[_employee].isActive, "Employee not found");
        require(_newSalary > 0, "Salary must be greater than 0");
        
        uint256 oldSalary = employees[_employee].salaryAmount;
        employees[_employee].salaryAmount = _newSalary;
        
        emit EmployeeUpdated(
            _employee,
            oldSalary,
            _newSalary,
            block.timestamp
        );
    }

    /**
     * @dev Employee withdraw their salary
     * @notice Uses ReentrancyGuard for security
     * @notice Employees can only withdraw from 25th until end of month
     * @notice First salary has separate tracking from regular monthly salary
     */
    function withdraw() 
        external 
        nonReentrant 
        whenNotFrozen 
    {
        Employee storage employee = employees[msg.sender];
        
        require(employee.isActive, "Not an active employee");
        require(employee.salaryAmount > 0, "No salary configured");
        require(address(this).balance >= employee.salaryAmount, "Insufficient vault balance");
        
        // Check if withdrawal is allowed based on schedule
        require(canWithdraw(msg.sender), "Withdrawal not allowed yet");
        
        // Determine which salary to pay
        uint256 amount;
        if (!employee.hasWithdrawnFirstSalary) {
            // Pay first salary
            amount = employee.firstSalaryAmount;
            employee.hasWithdrawnFirstSalary = true;
        } else {
            // Pay regular salary
            amount = employee.salaryAmount;
        }
        
        // Update last withdrawal time
        employee.lastWithdrawTime = block.timestamp;
        
        // Transfer salary to employee
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(
            msg.sender, 
            amount,
            block.timestamp
        );
    }

    /**
     * @dev Check if an employee can withdraw
     * @param _employee Employee address
     * @return True if employee can withdraw
     */
    function canWithdraw(address _employee) public view returns (bool) {
        Employee memory employee = employees[_employee];
        
        if (!employee.isActive) return false;
        if (employee.salaryAmount == 0) return false;
        
        // Get current date info
        (uint256 currentYear, uint256 currentMonth, uint256 currentDay) = getCurrentDate();
        
        // Get employee's join date info
        (uint256 joinYear, uint256 joinMonth, uint256 joinDay) = getDateFromTimestamp(employee.joinedAt);
        
        // If employee joined after the withdrawal day in the same month, they must wait until next month
        if (joinYear == currentYear && joinMonth == currentMonth && joinDay > withdrawalDay) {
            return false;
        }
        
        // Check if we're in the withdrawal window (25th to end of month)
        if (currentDay < withdrawalDay) {
            return false;
        }
        
        // If first salary not yet withdrawn, they can withdraw now (if above conditions met)
        if (!employee.hasWithdrawnFirstSalary) {
            return true;
        }
        
        // For subsequent withdrawals, check if we're in a new month after last withdrawal
        // Get last withdrawal date info
        if (employee.lastWithdrawTime > 0) {
            (uint256 lastYear, uint256 lastMonth, ) = getDateFromTimestamp(employee.lastWithdrawTime);
            
            // Can only withdraw in a new month after the withdrawal day has passed
            if (currentYear == lastYear && currentMonth == lastMonth) {
                return false; // Already withdrawn this month
            }
        }
        
        return true;
    }
    
    /**
     * @dev Get date from timestamp (accurate calculation)
     * @param timestamp Unix timestamp
     * @return year The year
     * @return month The month (1-12)
     * @return day The day (1-31)
     */
    function getDateFromTimestamp(uint256 timestamp) public pure returns (uint256 year, uint256 month, uint256 day) {
        if (timestamp == 0) {
            return (0, 0, 0);
        }
        
        // Days since epoch (Jan 1, 1970)
        uint256 totalDays = timestamp / 86400;
        
        // Calculate year
        year = 1970;
        while (true) {
            uint256 daysInYear = _isLeapYear(year) ? 366 : 365;
            if (totalDays < daysInYear) {
                break;
            }
            totalDays -= daysInYear;
            year++;
        }
        
        // Calculate month and day
        uint256[12] memory daysInMonths = _getDaysInMonths(year);
        month = 1;
        for (uint256 i = 0; i < 12; i++) {
            if (totalDays < daysInMonths[i]) {
                day = totalDays + 1;
                break;
            }
            totalDays -= daysInMonths[i];
            month++;
        }
    }

    /**
     * @dev Check if year is a leap year
     */
    function _isLeapYear(uint256 year) internal pure returns (bool) {
        if (year % 4 != 0) return false;
        if (year % 100 != 0) return true;
        return year % 400 == 0;
    }

    /**
     * @dev Get days in each month for a given year
     */
    function _getDaysInMonths(uint256 year) internal pure returns (uint256[12] memory) {
        bool leap = _isLeapYear(year);
        uint256[12] memory monthDays;
        // January
        monthDays[0] = 31;
        // February (28 or 29)
        monthDays[1] = leap ? 29 : 28;
        // March - December
        monthDays[2] = 31;
        monthDays[3] = 30;
        monthDays[4] = 31;
        monthDays[5] = 30;
        monthDays[6] = 31;
        monthDays[7] = 31;
        monthDays[8] = 30;
        monthDays[9] = 31;
        monthDays[10] = 30;
        monthDays[11] = 31;
        return monthDays;
    }

    /**
     * @dev Check if current time is the withdrawal day
     * @return True if it's the withdrawal day or later in the month
     */
    function isWithdrawalDay() public view returns (bool) {
        (uint256 year, uint256 month, uint256 day) = getCurrentDate();
        
        // If we're past the withdrawal day in the current month
        if (day >= withdrawalDay) {
            return true;
        }
        
        // If we're in a new month after the withdrawal day
        uint256 lastMonthDay = getDaysInMonth(year, month);
        if (lastMonthDay < withdrawalDay && day >= lastMonthDay) {
            return true;
        }
        
        return false;
    }

    /**
     * @dev Get current date from block.timestamp (accurate calculation)
     * @return year The current year
     * @return month The current month (1-12)
     * @return day The current day (1-31)
     */
    function getCurrentDate() public view returns (uint256 year, uint256 month, uint256 day) {
        return getDateFromTimestamp(block.timestamp);
    }

    /**
     * @dev Get days in a month
     */
    function getDaysInMonth(uint256 year, uint256 month) public pure returns (uint256) {
        if (month == 2) {
            return _isLeapYear(year) ? 29 : 28;
        }
        if (month == 4 || month == 6 || month == 9 || month == 11) {
            return 30;
        }
        return 31;
    }

    /**
     * @dev Freeze or unfreeze the vault
     * @param _status Freeze status
     */
    function freezeVault(bool _status) external onlyCompany {
        require(frozen != _status, "Status already set");
        
        frozen = _status;
        
        emit VaultFrozen(
            _status,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Set the withdrawal day
     * @param _day Day of month (1-28)
     */
    function setWithdrawalDay(uint8 _day) external onlyCompany {
        require(_day >= 1 && _day <= 28, "Withdrawal day must be between 1 and 28");
        
        uint8 oldDay = withdrawalDay;
        withdrawalDay = _day;
        
        emit WithdrawalDayChanged(
            oldDay,
            _day,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Update company name
     * @param _newName New company name
     */
    function updateCompanyName(string memory _newName) external onlyCompany {
        string memory oldName = companyName;
        companyName = _newName;
        
        emit CompanyUpdated(
            oldName,
            _newName,
            block.timestamp
        );
    }

    /**
     * @dev Get employee information
     * @param _employee Employee address
     * @return salaryAmount The employee's monthly salary
     * @return lastWithdrawTime Timestamp of last withdrawal
     * @return isActive Whether employee is active
     * @return canWithdrawNow Whether employee can withdraw now
     */
    function getEmployeeInfo(address _employee) 
        external 
        view 
        returns (
            uint256 salaryAmount,
            uint256 lastWithdrawTime,
            bool isActive,
            bool canWithdrawNow
        ) 
    {
        Employee memory emp = employees[_employee];
        return (
            emp.salaryAmount,
            emp.lastWithdrawTime,
            emp.isActive,
            canWithdraw(_employee)
        );
    }

    /**
     * @dev Get the number of employees
     * @return Number of employees
     */
    function getEmployeeCount() external view returns (uint256) {
        return employeeList.length;
    }

    /**
     * @dev Get all active employee addresses
     * @return Array of employee addresses
     */
    function getActiveEmployees() external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < employeeList.length; i++) {
            if (employees[employeeList[i]].isActive) {
                count++;
            }
        }
        
        address[] memory result = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < employeeList.length; i++) {
            if (employees[employeeList[i]].isActive) {
                result[index] = employeeList[i];
                index++;
            }
        }
        
        return result;
    }

    /**
     * @dev Get vault balance
     * @return Current balance of the vault
     */
    function getVaultBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Allow company to withdraw excess funds (emergency)
     * @param _amount Amount to withdraw
     */
    function withdrawExcess(uint256 _amount) external onlyCompany {
        require(_amount <= address(this).balance, "Insufficient balance");
        
        // Ensure there's enough for pending salaries
        uint256 pendingSalaries = getTotalPendingSalaries();
        require(address(this).balance - _amount >= pendingSalaries, "Cannot withdraw funds needed for salaries");
        
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Transfer failed");
        
        emit VaultEmptied(msg.sender, _amount, block.timestamp);
    }

    /**
     * @dev Calculate total pending salaries for all active employees
     * @return Total salary amount needed
     */
    function getTotalPendingSalaries() public view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < employeeList.length; i++) {
            if (employees[employeeList[i]].isActive) {
                total += employees[employeeList[i]].salaryAmount;
            }
        }
        return total;
    }

    /**
     * @dev Receive ETH/RBTC
     */
    receive() external payable {}
}
