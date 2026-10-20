/**
 * ==============================================================================
 * STUDENT EXPENSE TRACKER - MAIN JAVASCRIPT APPLICATION
 * ==============================================================================
 * A fully responsive, client-side personal finance tracker for college students.
 * Features:
 *   - LocalStorage persistence for expenses, budget, and theme preference
 *   - Comprehensive CRUD operations (Add, Edit, Delete, Filter, Sort)
 *   - Form validation with descriptive error messages
 *   - Dynamic monthly budget monitor with color-coded progress indicator
 *   - Interactive Chart.js category breakdown doughnut visualization
 *   - Export to CSV functionality
 *   - Accessible confirmation modals & non-intrusive toast notifications
 *   - Realistic sample data generation on first-time visit
 * ==============================================================================
 */

'use strict';

// ==============================================================================
// 1. CONSTANTS & STORAGE KEYS
// ==============================================================================
const STORAGE_KEYS = {
  EXPENSES: 'student_expense_records_v1',
  BUDGET: 'student_expense_monthly_budget_v1',
  THEME: 'student_expense_theme_preference_v1',
  INITIALIZED: 'student_expense_has_initialized_v1',
  SAMPLE_FLAG: 'student_expense_showing_sample_v1'
};

const CATEGORIES = ['Food', 'Travel', 'Books', 'Rent', 'Entertainment', 'Other'];

const CATEGORY_COLORS = {
  Food: '#ea580c',
  Travel: '#0284c7',
  Books: '#7c3aed',
  Rent: '#0d9488',
  Entertainment: '#db2777',
  Other: '#64748b'
};

const DEFAULT_BUDGET = 12000; // Default ₹12,000 monthly student budget

// ==============================================================================
// 2. APPLICATION STATE
// ==============================================================================
const AppState = {
  expenses: [],
  monthlyBudget: DEFAULT_BUDGET,
  currentTheme: 'light',
  editingExpenseId: null,
  activeConfirmCallback: null,
  filters: {
    search: '',
    category: 'ALL',
    month: 'ALL',
    sortBy: 'date-desc'
  },
  chartInstance: null
};

// ==============================================================================
// 3. DOM ELEMENT REFERENCES
// ==============================================================================
const DOM = {
  // Theme Toggle
  themeToggleBtn: document.getElementById('theme-toggle'),

  // Navigation & Hero
  navBudgetDisplay: document.getElementById('nav-budget-display'),
  currentPeriodText: document.getElementById('current-period-text'),
  copyrightYear: document.getElementById('copyright-year'),
  sampleDataBanner: document.getElementById('sample-data-banner'),
  clearSampleDataBtn: document.getElementById('clear-sample-data-btn'),

  // Dashboard Overview Metrics
  statTotalSpent: document.getElementById('stat-total-spent'),
  statMonthSpent: document.getElementById('stat-month-spent'),
  statMonthStatus: document.getElementById('stat-month-status'),
  statTopCategory: document.getElementById('stat-top-category'),
  statTopCatAmount: document.getElementById('stat-top-cat-amount'),
  statTransactionCount: document.getElementById('stat-transaction-count'),
  statMonthTxnCount: document.getElementById('stat-month-txn-count'),

  // Budget Section
  budgetSpentAmount: document.getElementById('budget-spent-amount'),
  budgetLimitAmount: document.getElementById('budget-limit-amount'),
  budgetProgressBar: document.getElementById('budget-progress-bar'),
  budgetProgressContainer: document.getElementById('budget-progress-container'),
  budgetPercentageBadge: document.getElementById('budget-percentage-badge'),
  budgetRemainingText: document.getElementById('budget-remaining-text'),
  editBudgetBtn: document.getElementById('edit-budget-btn'),
  openBudgetModalBtn: document.getElementById('open-budget-modal-btn'),

  // Expense Form
  expenseForm: document.getElementById('expense-form'),
  formCardTitle: document.getElementById('form-card-title'),
  editBadge: document.getElementById('edit-badge'),
  editExpenseIdInput: document.getElementById('edit-expense-id'),
  titleInput: document.getElementById('expense-title'),
  amountInput: document.getElementById('expense-amount'),
  categorySelect: document.getElementById('expense-category'),
  dateInput: document.getElementById('expense-date'),
  noteInput: document.getElementById('expense-note'),
  submitBtn: document.getElementById('submit-btn'),
  submitBtnText: document.getElementById('submit-btn-text'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),

  // Form Error Containers
  titleError: document.getElementById('title-error'),
  amountError: document.getElementById('amount-error'),
  categoryError: document.getElementById('category-error'),
  dateError: document.getElementById('date-error'),

  // Chart
  categoryChartCanvas: document.getElementById('category-chart'),
  chartTotalBadge: document.getElementById('chart-total-badge'),
  chartEmptyState: document.getElementById('chart-empty-state'),
  categoryLegend: document.getElementById('category-legend'),

  // Transactions & Filters
  filteredCount: document.getElementById('filtered-count'),
  totalCount: document.getElementById('total-count'),
  filterSearchInput: document.getElementById('filter-search-input'),
  clearSearchBtn: document.getElementById('clear-search-btn'),
  filterCategorySelect: document.getElementById('filter-category-select'),
  filterMonthSelect: document.getElementById('filter-month-select'),
  sortSelect: document.getElementById('sort-select'),
  resetFiltersBtn: document.getElementById('reset-filters-btn'),
  exportCsvBtn: document.getElementById('export-csv-btn'),
  clearAllBtn: document.getElementById('clear-all-btn'),

  // Table & Empty State
  expensesTableBody: document.getElementById('expenses-table-body'),
  emptyState: document.getElementById('empty-state'),
  emptyTitleText: document.getElementById('empty-title-text'),
  emptyDescText: document.getElementById('empty-desc-text'),
  emptyActions: document.getElementById('empty-actions'),
  loadSampleBtn: document.getElementById('load-sample-btn'),

  // Budget Modal
  budgetModal: document.getElementById('budget-modal'),
  budgetForm: document.getElementById('budget-form'),
  monthlyBudgetInput: document.getElementById('monthly-budget-input'),
  budgetInputError: document.getElementById('budget-input-error'),
  closeBudgetModal: document.getElementById('close-budget-modal'),
  cancelBudgetModal: document.getElementById('cancel-budget-modal'),

  // Confirm Modal
  confirmModal: document.getElementById('confirm-modal'),
  confirmModalTitle: document.getElementById('confirm-modal-title'),
  confirmModalMessage: document.getElementById('confirm-modal-message'),
  cancelConfirmBtn: document.getElementById('cancel-confirm-btn'),
  proceedConfirmBtn: document.getElementById('proceed-confirm-btn'),
  closeConfirmModal: document.getElementById('close-confirm-modal'),

  // Toast Container
  toastContainer: document.getElementById('toast-container')
};

// ==============================================================================
// 4. UTILITY & FORMATTING FUNCTIONS
// ==============================================================================

/**
 * Format a number as Indian Rupee (₹) currency
 * Uses standard Indian numbering system (e.g. ₹1,25,000.00)
 * @param {number} amount
 * @param {boolean} [includeDecimals=true]
 * @returns {string}
 */
function formatINR(amount, includeDecimals = true) {
  const numericAmount = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0
  }).format(numericAmount);
}

/**
 * Format an ISO date string (YYYY-MM-DD) into a friendly student-readable format (e.g., "18 Oct 2026")
 * @param {string} dateString 
 * @returns {string}
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;

  const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  if (isNaN(dateObj.getTime())) return dateString;

  return dateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Get today's date formatted as YYYY-MM-DD for date input values
 * @returns {string}
 */
function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate a unique ID for an expense entry
 * @returns {string}
 */
function generateId() {
  return 'exp_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
}

/**
 * Safely escape HTML to prevent XSS vulnerabilities
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Show a clean, non-intrusive toast notification
 * @param {string} message
 * @param {'success'|'danger'|'warning'|'info'} [type='info']
 */
function showToast(message, type = 'info') {
  if (!DOM.toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`;
  } else if (type === 'danger') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  } else if (type === 'warning') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  } else {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }

  toast.innerHTML = `
    <span class="toast-icon">${iconSvg}</span>
    <span class="toast-text">${escapeHTML(message)}</span>
  `;

  DOM.toastContainer.appendChild(toast);

  // Auto-remove after 3.5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3500);
}

// ==============================================================================
// 5. STORAGE SERVICE (LOCALSTORAGE MANAGEMENT)
// ==============================================================================
const StorageService = {
  /**
   * Load expenses array from localStorage
   * @returns {Array}
   */
  loadExpenses() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load expenses from localStorage:', e);
      return [];
    }
  },

  /**
   * Save expenses array to localStorage
   * @param {Array} expenses
   */
  saveExpenses(expenses) {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.error('Failed to save expenses to localStorage:', e);
      showToast('Storage quota exceeded. Unable to save data.', 'danger');
    }
  },

  /**
   * Load monthly budget from localStorage
   * @returns {number}
   */
  loadBudget() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGET);
      const parsed = parseFloat(saved);
      return !isNaN(parsed) && parsed > 0 ? parsed : DEFAULT_BUDGET;
    } catch (e) {
      console.error('Failed to load budget from localStorage:', e);
      return DEFAULT_BUDGET;
    }
  },

  /**
   * Save monthly budget to localStorage
   * @param {number} budget
   */
  saveBudget(budget) {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGET, budget.toString());
    } catch (e) {
      console.error('Failed to save budget to localStorage:', e);
    }
  },

  /**
   * Load saved theme preference ('light' | 'dark')
   * @returns {string}
   */
  loadTheme() {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    // Default to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  },

  /**
   * Save theme preference
   * @param {'light'|'dark'} theme
   */
  saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.error('Failed to save theme preference:', e);
    }
  },

  /**
   * Check if app has been initialized before
   * @returns {boolean}
   */
  hasInitialized() {
    return localStorage.getItem(STORAGE_KEYS.INITIALIZED) === 'true';
  },

  /**
   * Mark app as initialized
   */
  setInitialized() {
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  },

  /**
   * Check if sample banner should be shown
   * @returns {boolean}
   */
  isShowingSample() {
    return localStorage.getItem(STORAGE_KEYS.SAMPLE_FLAG) === 'true';
  },

  /**
   * Set sample flag
   * @param {boolean} flag
   */
  setShowingSample(flag) {
    localStorage.setItem(STORAGE_KEYS.SAMPLE_FLAG, flag ? 'true' : 'false');
  }
};

// ==============================================================================
// 6. SAMPLE DATA GENERATOR (FIRST-TIME VISIT)
// ==============================================================================
/**
 * Create realistic student expenses relative to the current date
 * @returns {Array}
 */
function generateSampleExpenses() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  // Helper to make date strings within the current month
  const makeDate = (offsetDays) => {
    const d = new Date(year, month, Math.max(1, day - offsetDays));
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dt = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dt}`;
  };

  return [
    {
      id: generateId(),
      title: 'Shared Room Rent & Maintenance',
      amount: 4500,
      category: 'Rent',
      date: makeDate(12),
      note: 'October room share split with hostel roommate',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12
    },
    {
      id: generateId(),
      title: 'Monthly College Mess Advance',
      amount: 3200,
      category: 'Food',
      date: makeDate(7),
      note: 'Mess payment receipt #1042',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7
    },
    {
      id: generateId(),
      title: 'Data Structures & Algorithms Reference Book',
      amount: 1450,
      category: 'Books',
      date: makeDate(4),
      note: 'Prescribed syllabus textbook from campus bookstore',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4
    },
    {
      id: generateId(),
      title: 'Metro Smartcard Transit Recharge',
      amount: 600,
      category: 'Travel',
      date: makeDate(2),
      note: 'Monthly commute to university campus',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2
    },
    {
      id: generateId(),
      title: 'Coding Club Pizza Party',
      amount: 380,
      category: 'Entertainment',
      date: makeDate(1),
      note: 'Department hackathon meet snacks',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1
    }
  ];
}

// ==============================================================================
// 7. FORM VALIDATION & HANDLING
// ==============================================================================

/**
 * Clear all inline form error messages and validation classes
 */
function clearFormErrors() {
  DOM.titleError.textContent = '';
  DOM.amountError.textContent = '';
  DOM.categoryError.textContent = '';
  DOM.dateError.textContent = '';

  DOM.titleInput.classList.remove('is-invalid');
  DOM.amountInput.classList.remove('is-invalid');
  DOM.categorySelect.classList.remove('is-invalid');
  DOM.dateInput.classList.remove('is-invalid');
}

/**
 * Validate the expense input fields
 * Handles negative amounts, empty values, whitespace, and invalid dates
 * @returns {boolean} true if form is valid, false otherwise
 */
function validateExpenseForm() {
  clearFormErrors();
  let isValid = true;

  // Title validation
  const title = DOM.titleInput.value.trim();
  if (!title) {
    DOM.titleError.textContent = 'Please enter an expense title.';
    DOM.titleInput.classList.add('is-invalid');
    isValid = false;
  } else if (title.length < 2) {
    DOM.titleError.textContent = 'Title must be at least 2 characters.';
    DOM.titleInput.classList.add('is-invalid');
    isValid = false;
  } else if (title.length > 80) {
    DOM.titleError.textContent = 'Title cannot exceed 80 characters.';
    DOM.titleInput.classList.add('is-invalid');
    isValid = false;
  }

  // Amount validation
  const amountStr = DOM.amountInput.value.trim();
  const amount = parseFloat(amountStr);
  if (!amountStr || isNaN(amount)) {
    DOM.amountError.textContent = 'Please enter a valid amount.';
    DOM.amountInput.classList.add('is-invalid');
    isValid = false;
  } else if (amount <= 0) {
    DOM.amountError.textContent = 'Amount must be greater than ₹0.';
    DOM.amountInput.classList.add('is-invalid');
    isValid = false;
  } else if (amount > 1000000) {
    DOM.amountError.textContent = 'Amount exceeds maximum limit (₹10,00,000).';
    DOM.amountInput.classList.add('is-invalid');
    isValid = false;
  }

  // Category validation
  const category = DOM.categorySelect.value;
  if (!category || !CATEGORIES.includes(category)) {
    DOM.categoryError.textContent = 'Please select a category.';
    DOM.categorySelect.classList.add('is-invalid');
    isValid = false;
  }

  // Date validation
  const date = DOM.dateInput.value;
  if (!date) {
    DOM.dateError.textContent = 'Please select a date.';
    DOM.dateInput.classList.add('is-invalid');
    isValid = false;
  } else {
    // Sanity check: Ensure date is a valid real date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      DOM.dateError.textContent = 'Please enter a valid date.';
      DOM.dateInput.classList.add('is-invalid');
      isValid = false;
    }
  }

  return isValid;
}

/**
 * Handle form submission for both Add and Edit modes
 * @param {Event} e
 */
function handleExpenseSubmit(e) {
  e.preventDefault();

  if (!validateExpenseForm()) {
    return;
  }

  const title = DOM.titleInput.value.trim();
  const amount = parseFloat(parseFloat(DOM.amountInput.value).toFixed(2));
  const category = DOM.categorySelect.value;
  const date = DOM.dateInput.value;
  const note = DOM.noteInput.value.trim();
  const isEditing = Boolean(AppState.editingExpenseId);

  if (isEditing) {
    // Update existing expense
    const index = AppState.expenses.findIndex(exp => exp.id === AppState.editingExpenseId);
    if (index !== -1) {
      AppState.expenses[index] = {
        ...AppState.expenses[index],
        title,
        amount,
        category,
        date,
        note,
        updatedAt: Date.now()
      };
      StorageService.saveExpenses(AppState.expenses);
      showToast('Expense updated successfully!', 'success');
    }
    resetExpenseForm();
  } else {
    // Add new expense
    const newExpense = {
      id: generateId(),
      title,
      amount,
      category,
      date,
      note,
      createdAt: Date.now()
    };

    AppState.expenses.push(newExpense);
    StorageService.saveExpenses(AppState.expenses);
    showToast('Expense added successfully!', 'success');
    resetExpenseForm();
  }

  // Hide sample banner if user starts adding own data
  if (StorageService.isShowingSample()) {
    StorageService.setShowingSample(false);
    DOM.sampleDataBanner.style.display = 'none';
  }

  // Re-render UI components
  updateApplicationUI();
}

/**
 * Switch form into Edit Mode with the selected expense data
 * @param {string} expenseId
 */
function startEditingExpense(expenseId) {
  const expense = AppState.expenses.find(exp => exp.id === expenseId);
  if (!expense) return;

  AppState.editingExpenseId = expense.id;

  DOM.formCardTitle.textContent = 'Edit Expense';
  DOM.editBadge.style.display = 'inline-flex';
  DOM.submitBtnText.textContent = 'Update Expense';
  DOM.cancelEditBtn.style.display = 'block';

  DOM.editExpenseIdInput.value = expense.id;
  DOM.titleInput.value = expense.title;
  DOM.amountInput.value = expense.amount;
  DOM.categorySelect.value = expense.category;
  DOM.dateInput.value = expense.date;
  DOM.noteInput.value = expense.note || '';

  clearFormErrors();

  // Smooth scroll to form
  DOM.expenseForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  DOM.titleInput.focus();
}

/**
 * Reset form back to Add Expense mode
 */
function resetExpenseForm() {
  AppState.editingExpenseId = null;

  DOM.expenseForm.reset();
  DOM.editExpenseIdInput.value = '';
  DOM.dateInput.value = getTodayDateString();

  DOM.formCardTitle.textContent = 'Add New Expense';
  DOM.editBadge.style.display = 'none';
  DOM.submitBtnText.textContent = 'Add Expense';
  DOM.cancelEditBtn.style.display = 'none';

  clearFormErrors();
}

// ==============================================================================
// 8. DELETION & MODAL DIALOGS
// ==============================================================================

/**
 * Open the confirmation modal with custom message & callback
 * @param {string} title
 * @param {string} message
 * @param {Function} onConfirm
 */
function openConfirmModal(title, message, onConfirm) {
  DOM.confirmModalTitle.textContent = title;
  DOM.confirmModalMessage.textContent = message;
  AppState.activeConfirmCallback = onConfirm;

  DOM.confirmModal.style.display = 'flex';
  DOM.proceedConfirmBtn.focus();
}

/**
 * Close the confirmation modal
 */
function closeConfirmModal() {
  DOM.confirmModal.style.display = 'none';
  AppState.activeConfirmCallback = null;
}

/**
 * Initiate deletion of an individual expense
 * @param {string} expenseId
 */
function promptDeleteExpense(expenseId) {
  const expense = AppState.expenses.find(exp => exp.id === expenseId);
  if (!expense) return;

  const msg = `Are you sure you want to delete "${expense.title}" (${formatINR(expense.amount)})? This cannot be undone.`;
  openConfirmModal('Delete Expense', msg, () => {
    AppState.expenses = AppState.expenses.filter(exp => exp.id !== expenseId);
    StorageService.saveExpenses(AppState.expenses);

    // If currently editing this item, reset form
    if (AppState.editingExpenseId === expenseId) {
      resetExpenseForm();
    }

    showToast('Expense deleted.', 'info');
    updateApplicationUI();
  });
}

/**
 * Initiate clearing of all expense records
 */
function promptClearAllExpenses() {
  if (AppState.expenses.length === 0) {
    showToast('There are no expenses to clear.', 'info');
    return;
  }

  const msg = `Are you sure you want to permanently delete all ${AppState.expenses.length} expense record(s)? This action cannot be recovered.`;
  openConfirmModal('Clear All Expenses', msg, () => {
    AppState.expenses = [];
    StorageService.saveExpenses(AppState.expenses);
    StorageService.setShowingSample(false);
    DOM.sampleDataBanner.style.display = 'none';

    resetExpenseForm();
    showToast('All expense records cleared.', 'danger');
    updateApplicationUI();
  });
}

// ==============================================================================
// 9. MONTHLY BUDGET CALCULATIONS & MODAL
// ==============================================================================

/**
 * Open the budget modal
 */
function openBudgetModal() {
  DOM.monthlyBudgetInput.value = AppState.monthlyBudget;
  DOM.budgetInputError.textContent = '';
  DOM.budgetModal.style.display = 'flex';
  DOM.monthlyBudgetInput.focus();
}

/**
 * Close the budget modal
 */
function closeBudgetModal() {
  DOM.budgetModal.style.display = 'none';
}

/**
 * Save updated monthly budget
 * @param {Event} e
 */
function handleBudgetSubmit(e) {
  e.preventDefault();
  const val = parseFloat(DOM.monthlyBudgetInput.value);

  if (isNaN(val) || val <= 0) {
    DOM.budgetInputError.textContent = 'Please enter a valid monthly budget greater than ₹0.';
    return;
  }
  if (val > 10000000) {
    DOM.budgetInputError.textContent = 'Budget exceeds allowed limit.';
    return;
  }

  AppState.monthlyBudget = val;
  StorageService.saveBudget(val);
  closeBudgetModal();
  showToast(`Monthly budget set to ${formatINR(val, false)}!`, 'success');

  renderDashboardStats();
  renderBudgetSection();
}

/**
 * Get current year and month as a string key 'YYYY-MM'
 * @returns {string}
 */
function getCurrentMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Calculate total spending in the current calendar month
 * @returns {number}
 */
function calculateThisMonthSpending() {
  const currentKey = getCurrentMonthKey();
  return AppState.expenses.reduce((sum, exp) => {
    if (exp.date && exp.date.startsWith(currentKey)) {
      return sum + (Number(exp.amount) || 0);
    }
    return sum;
  }, 0);
}

/**
 * Render the monthly budget monitor with dynamic color progress bar
 */
function renderBudgetSection() {
  const thisMonthSpent = calculateThisMonthSpending();
  const budget = AppState.monthlyBudget;

  DOM.navBudgetDisplay.textContent = formatINR(budget, false);
  DOM.budgetSpentAmount.textContent = formatINR(thisMonthSpent);
  DOM.budgetLimitAmount.textContent = formatINR(budget, false);

  const percentage = budget > 0 ? (thisMonthSpent / budget) * 100 : 0;
  const clampedPercentage = Math.min(percentage, 100);

  // Update progress bar width
  DOM.budgetProgressBar.style.width = `${clampedPercentage}%`;
  DOM.budgetProgressContainer.setAttribute('aria-valuenow', Math.round(percentage));

  // Remove existing status classes
  DOM.budgetProgressBar.classList.remove('status-safe', 'status-warning', 'status-danger');
  DOM.budgetPercentageBadge.classList.remove('status-warning', 'status-danger');

  // Badge text
  DOM.budgetPercentageBadge.textContent = `${Math.round(percentage)}% Used`;

  // Dynamic color coding: Safe (<70%), Warning near 80% (70-99%), Red when exceeded (>=100%)
  if (percentage >= 100) {
    DOM.budgetProgressBar.classList.add('status-danger');
    DOM.budgetPercentageBadge.classList.add('status-danger');
    const overspent = thisMonthSpent - budget;
    DOM.budgetRemainingText.textContent = `⚠️ Budget exceeded by ${formatINR(overspent)}!`;
    DOM.budgetRemainingText.style.color = 'var(--danger)';
  } else if (percentage >= 70) {
    DOM.budgetProgressBar.classList.add('status-warning');
    DOM.budgetPercentageBadge.classList.add('status-warning');
    const remaining = budget - thisMonthSpent;
    DOM.budgetRemainingText.textContent = `⚡ Approaching limit: ${formatINR(remaining)} remaining`;
    DOM.budgetRemainingText.style.color = 'var(--warning)';
  } else {
    DOM.budgetProgressBar.classList.add('status-safe');
    const remaining = budget - thisMonthSpent;
    DOM.budgetRemainingText.textContent = `✓ ${formatINR(remaining)} remaining for this month`;
    DOM.budgetRemainingText.style.color = 'var(--text-secondary)';
  }
}

// ==============================================================================
// 10. DASHBOARD OVERVIEW CARDS
// ==============================================================================

/**
 * Render top 4 metric overview cards
 */
function renderDashboardStats() {
  const totalSpent = AppState.expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const thisMonthSpent = calculateThisMonthSpending();
  const txnCount = AppState.expenses.length;

  const currentKey = getCurrentMonthKey();
  const thisMonthTxns = AppState.expenses.filter(exp => exp.date && exp.date.startsWith(currentKey)).length;

  // 1. Total Spent
  DOM.statTotalSpent.textContent = formatINR(totalSpent);

  // 2. This Month's Spending
  DOM.statMonthSpent.textContent = formatINR(thisMonthSpent);
  const percentOfBudget = AppState.monthlyBudget > 0 
    ? Math.round((thisMonthSpent / AppState.monthlyBudget) * 100)
    : 0;
  DOM.statMonthStatus.textContent = `${percentOfBudget}% of ${formatINR(AppState.monthlyBudget, false)} budget`;

  // 3. Transactions Count
  DOM.statTransactionCount.textContent = txnCount.toLocaleString('en-IN');
  DOM.statMonthTxnCount.textContent = `${thisMonthTxns} transaction(s) this month`;

  // 4. Highest Category Calculation
  const categoryTotals = {};
  CATEGORIES.forEach(cat => { categoryTotals[cat] = 0; });

  AppState.expenses.forEach(exp => {
    if (categoryTotals[exp.category] !== undefined) {
      categoryTotals[exp.category] += Number(exp.amount) || 0;
    }
  });

  let topCategory = 'None';
  let topAmount = 0;

  for (const [cat, amt] of Object.entries(categoryTotals)) {
    if (amt > topAmount) {
      topAmount = amt;
      topCategory = cat;
    }
  }

  if (topAmount > 0) {
    DOM.statTopCategory.textContent = topCategory;
    const catPercent = totalSpent > 0 ? Math.round((topAmount / totalSpent) * 100) : 0;
    DOM.statTopCatAmount.textContent = `${formatINR(topAmount)} (${catPercent}% of total)`;
  } else {
    DOM.statTopCategory.textContent = 'None';
    DOM.statTopCatAmount.textContent = '₹0 recorded';
  }
}

// ==============================================================================
// 11. CHART.JS CATEGORY BREAKDOWN VISUALIZATION
// ==============================================================================

/**
 * Render the Chart.js doughnut chart and category legend
 */
function renderCategoryChart() {
  const categoryTotals = {};
  CATEGORIES.forEach(cat => { categoryTotals[cat] = 0; });

  AppState.expenses.forEach(exp => {
    if (categoryTotals[exp.category] !== undefined) {
      categoryTotals[exp.category] += Number(exp.amount) || 0;
    }
  });

  const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  DOM.chartTotalBadge.textContent = `${formatINR(totalSpent)} Total`;

  // Filter categories that have spending > 0 for chart display
  const activeCategories = CATEGORIES.filter(cat => categoryTotals[cat] > 0);
  const activeAmounts = activeCategories.map(cat => categoryTotals[cat]);
  const activeColors = activeCategories.map(cat => CATEGORY_COLORS[cat]);

  // Handle empty state
  if (totalSpent === 0 || activeCategories.length === 0) {
    if (AppState.chartInstance) {
      AppState.chartInstance.destroy();
      AppState.chartInstance = null;
    }
    DOM.categoryChartCanvas.style.display = 'none';
    DOM.chartEmptyState.style.display = 'flex';
    DOM.categoryLegend.innerHTML = '';
    return;
  }

  // Hide empty state, show canvas
  DOM.categoryChartCanvas.style.display = 'block';
  DOM.chartEmptyState.style.display = 'none';

  // Render Custom Legend
  renderCustomLegend(categoryTotals, totalSpent);

  // Theme check for chart styling
  const isDark = AppState.currentTheme === 'dark';
  const borderColor = isDark ? '#1c2541' : '#ffffff';
  const tooltipBg = isDark ? '#253252' : '#0f172a';
  const tooltipText = '#ffffff';

  // Destroy previous chart instance before redrawing
  if (AppState.chartInstance) {
    AppState.chartInstance.destroy();
  }

  // Create new Chart instance
  const ctx = DOM.categoryChartCanvas.getContext('2d');
  AppState.chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: activeCategories,
      datasets: [{
        data: activeAmounts,
        backgroundColor: activeColors,
        borderColor: borderColor,
        borderWidth: 2,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false // Using custom accessible legend below
        },
        tooltip: {
          backgroundColor: tooltipBg,
          titleColor: tooltipText,
          bodyColor: tooltipText,
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const pct = totalSpent > 0 ? ((value / totalSpent) * 100).toFixed(1) : 0;
              return ` ${label}: ${formatINR(value)} (${pct}%)`;
            }
          }
        }
      },
      cutout: '70%',
      animation: {
        animateScale: true,
        animateRotate: true,
        duration: 800
      }
    }
  });
}

/**
 * Render custom accessible legend list below the doughnut chart
 * @param {Object} categoryTotals
 * @param {number} totalSpent
 */
function renderCustomLegend(categoryTotals, totalSpent) {
  DOM.categoryLegend.innerHTML = '';

  CATEGORIES.forEach(cat => {
    const amount = categoryTotals[cat];
    if (amount <= 0) return;

    const percent = totalSpent > 0 ? ((amount / totalSpent) * 100).toFixed(0) : 0;
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <div class="legend-left">
        <span class="legend-color-dot" style="background-color: ${CATEGORY_COLORS[cat]}"></span>
        <span class="legend-name">${cat}</span>
      </div>
      <div class="legend-right">
        <span class="legend-amount">${formatINR(amount, false)} <small style="color: var(--text-muted); font-weight: normal;">(${percent}%)</small></span>
      </div>
    `;
    DOM.categoryLegend.appendChild(item);
  });
}

// ==============================================================================
// 12. FILTERING, SEARCHING & SORTING
// ==============================================================================

/**
 * Populate Month filter dropdown with all distinct months found in expenses
 */
function populateMonthFilter() {
  const currentSelection = DOM.filterMonthSelect.value;
  const monthMap = new Map();

  AppState.expenses.forEach(exp => {
    if (exp.date) {
      const parts = exp.date.split('-');
      if (parts.length === 3) {
        const key = `${parts[0]}-${parts[1]}`;
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
        const label = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        monthMap.set(key, label);
      }
    }
  });

  // Sort months descending (newest month first)
  const sortedMonthKeys = Array.from(monthMap.keys()).sort((a, b) => b.localeCompare(a));

  DOM.filterMonthSelect.innerHTML = '<option value="ALL">All Months</option>';
  sortedMonthKeys.forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = monthMap.get(key);
    DOM.filterMonthSelect.appendChild(option);
  });

  // Restore selection if still valid
  if (sortedMonthKeys.includes(currentSelection)) {
    DOM.filterMonthSelect.value = currentSelection;
    AppState.filters.month = currentSelection;
  } else {
    DOM.filterMonthSelect.value = 'ALL';
    AppState.filters.month = 'ALL';
  }
}

/**
 * Filter and sort expenses based on AppState.filters
 * @returns {Array} filtered and sorted expenses
 */
function getFilteredAndSortedExpenses() {
  let result = [...AppState.expenses];

  // 1. Text Search Filter (Title or Note)
  const search = AppState.filters.search.trim().toLowerCase();
  if (search) {
    result = result.filter(exp => {
      const matchTitle = exp.title && exp.title.toLowerCase().includes(search);
      const matchNote = exp.note && exp.note.toLowerCase().includes(search);
      return matchTitle || matchNote;
    });
  }

  // 2. Category Filter
  if (AppState.filters.category !== 'ALL') {
    result = result.filter(exp => exp.category === AppState.filters.category);
  }

  // 3. Month Filter
  if (AppState.filters.month !== 'ALL') {
    result = result.filter(exp => exp.date && exp.date.startsWith(AppState.filters.month));
  }

  // 4. Sorting
  const sortBy = AppState.filters.sortBy;
  result.sort((a, b) => {
    if (sortBy === 'date-desc') {
      // Newest date first; if equal date, newest createdAt
      const diff = new Date(b.date) - new Date(a.date);
      return diff !== 0 ? diff : (b.createdAt || 0) - (a.createdAt || 0);
    }
    if (sortBy === 'date-asc') {
      const diff = new Date(a.date) - new Date(b.date);
      return diff !== 0 ? diff : (a.createdAt || 0) - (b.createdAt || 0);
    }
    if (sortBy === 'amount-desc') {
      return (Number(b.amount) || 0) - (Number(a.amount) || 0);
    }
    if (sortBy === 'amount-asc') {
      return (Number(a.amount) || 0) - (Number(b.amount) || 0);
    }
    return 0;
  });

  return result;
}

// ==============================================================================
// 13. EXPENSE LIST TABLE RENDERING
// ==============================================================================

/**
 * Render the expense table rows and empty state
 */
function renderExpenseTable() {
  const filtered = getFilteredAndSortedExpenses();
  const total = AppState.expenses.length;

  DOM.filteredCount.textContent = filtered.length;
  DOM.totalCount.textContent = total;

  // Toggle "Reset Filters" button visibility
  const isFiltered = AppState.filters.search !== '' ||
                     AppState.filters.category !== 'ALL' ||
                     AppState.filters.month !== 'ALL';
  DOM.resetFiltersBtn.style.display = isFiltered ? 'inline-flex' : 'none';

  // Toggle search clear button
  DOM.clearSearchBtn.style.display = AppState.filters.search ? 'block' : 'none';

  DOM.expensesTableBody.innerHTML = '';

  if (filtered.length === 0) {
    document.getElementById('expenses-table').style.display = 'none';
    DOM.emptyState.style.display = 'block';

    if (total === 0) {
      DOM.emptyTitleText.textContent = 'No Expenses Recorded Yet';
      DOM.emptyDescText.textContent = 'Track your college spending by adding your first expense above or load sample expenses to explore.';
      DOM.emptyActions.style.display = 'flex';
    } else {
      DOM.emptyTitleText.textContent = 'No Matching Transactions';
      DOM.emptyDescText.textContent = 'No expenses match your current search or filter criteria. Try resetting your filters.';
      DOM.emptyActions.style.display = 'none';
    }
    return;
  }

  // Show table and hide empty state
  document.getElementById('expenses-table').style.display = 'table';
  DOM.emptyState.style.display = 'none';

  // Populate table rows
  filtered.forEach(exp => {
    const tr = document.createElement('tr');
    tr.dataset.id = exp.id;

    // Category emoji helper
    const categoryIcons = {
      Food: '🍔',
      Travel: '🚌',
      Books: '📚',
      Rent: '🏠',
      Entertainment: '🎬',
      Other: '💡'
    };
    const icon = categoryIcons[exp.category] || '•';

    tr.innerHTML = `
      <td class="td-date" style="white-space: nowrap;">
        <span style="font-weight: 500;">${formatDate(exp.date)}</span>
      </td>
      <td class="td-title">
        <div class="expense-title-cell">
          <span class="expense-title-text">${escapeHTML(exp.title)}</span>
          ${exp.note ? `<span class="expense-note-text">${escapeHTML(exp.note)}</span>` : ''}
        </div>
      </td>
      <td class="td-category">
        <span class="cat-tag cat-${exp.category}">
          <span>${icon}</span>
          <span>${exp.category}</span>
        </span>
      </td>
      <td class="td-amount text-right">
        <span class="expense-amount-text">${formatINR(exp.amount)}</span>
      </td>
      <td class="td-actions text-center">
        <div class="table-row-actions">
          <button 
            type="button" 
            class="action-btn action-btn-edit" 
            data-id="${exp.id}" 
            title="Edit ${escapeHTML(exp.title)}"
            aria-label="Edit expense ${escapeHTML(exp.title)}"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button 
            type="button" 
            class="action-btn action-btn-delete" 
            data-id="${exp.id}" 
            title="Delete ${escapeHTML(exp.title)}"
            aria-label="Delete expense ${escapeHTML(exp.title)}"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </td>
    `;
    DOM.expensesTableBody.appendChild(tr);
  });
}

// ==============================================================================
// 14. EXPORT TO CSV
// ==============================================================================

/**
 * Export all recorded expenses to a CSV file download
 */
function exportExpensesToCSV() {
  if (AppState.expenses.length === 0) {
    showToast('No expenses available to export.', 'warning');
    return;
  }

  // CSV Headers
  const headers = ['ID', 'Date', 'Title', 'Category', 'Amount (INR)', 'Note'];

  // Helper to escape CSV cell values
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '""';
    const stringValue = String(value);
    if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('\r')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return `"${stringValue}"`;
  };

  // Sort expenses newest first for export
  const sorted = [...AppState.expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  const csvRows = [];
  csvRows.push(headers.join(','));

  sorted.forEach(exp => {
    const row = [
      escapeCSV(exp.id),
      escapeCSV(exp.date),
      escapeCSV(exp.title),
      escapeCSV(exp.category),
      escapeCSV(Number(exp.amount).toFixed(2)),
      escapeCSV(exp.note || '')
    ];
    csvRows.push(row.join(','));
  });

  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement('a');
  const today = getTodayDateString();
  downloadLink.setAttribute('href', url);
  downloadLink.setAttribute('download', `student_expenses_${today}.csv`);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);

  showToast('Expenses exported to CSV successfully!', 'success');
}

// ==============================================================================
// 15. THEME TOGGLING (LIGHT / DARK)
// ==============================================================================

/**
 * Apply the selected theme to document and persist preference
 * @param {'light'|'dark'} theme
 */
function applyTheme(theme) {
  AppState.currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  StorageService.saveTheme(theme);

  // Redraw chart with theme colors if active
  if (AppState.chartInstance) {
    renderCategoryChart();
  }
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
  const nextTheme = AppState.currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  showToast(`Switched to ${nextTheme} mode`, 'info');
}

// ==============================================================================
// 16. CENTRAL UI UPDATE COORDINATOR
// ==============================================================================

/**
 * Re-render all dashboard and view components
 */
function updateApplicationUI() {
  renderDashboardStats();
  renderBudgetSection();
  populateMonthFilter();
  renderCategoryChart();
  renderExpenseTable();
}

// ==============================================================================
// 17. INITIALIZATION & EVENT LISTENERS
// ==============================================================================

/**
 * Initialize application state, sample data, and bind event handlers
 */
function initializeApp() {
  // 1. Setup Theme
  const savedTheme = StorageService.loadTheme();
  applyTheme(savedTheme);

  // 2. Setup Monthly Budget
  AppState.monthlyBudget = StorageService.loadBudget();

  // 3. Setup Date Input Default (Today)
  DOM.dateInput.value = getTodayDateString();

  // 4. Setup Current Period Display in Hero
  const now = new Date();
  DOM.currentPeriodText.textContent = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  DOM.copyrightYear.textContent = now.getFullYear();

  // 5. First-time initialization & sample data check
  if (!StorageService.hasInitialized()) {
    const samples = generateSampleExpenses();
    AppState.expenses = samples;
    StorageService.saveExpenses(samples);
    StorageService.setInitialized();
    StorageService.setShowingSample(true);
    DOM.sampleDataBanner.style.display = 'flex';
  } else {
    AppState.expenses = StorageService.loadExpenses();
    if (StorageService.isShowingSample() && AppState.expenses.length > 0) {
      DOM.sampleDataBanner.style.display = 'flex';
    } else {
      DOM.sampleDataBanner.style.display = 'none';
    }
  }

  // 6. Bind Event Listeners
  bindEvents();

  // 7. Initial UI Render
  updateApplicationUI();
}

/**
 * Attach all interactive DOM event listeners
 */
function bindEvents() {
  // Theme Toggle Button
  DOM.themeToggleBtn.addEventListener('click', toggleTheme);

  // Form Submission
  DOM.expenseForm.addEventListener('submit', handleExpenseSubmit);

  // Cancel Edit Button
  DOM.cancelEditBtn.addEventListener('click', resetExpenseForm);

  // Clear Sample Data Button
  DOM.clearSampleDataBtn.addEventListener('click', () => {
    AppState.expenses = [];
    StorageService.saveExpenses(AppState.expenses);
    StorageService.setShowingSample(false);
    DOM.sampleDataBanner.style.display = 'none';
    showToast('Sample data removed. Ready for your expenses!', 'info');
    updateApplicationUI();
  });

  // Load Sample Button from Empty State
  DOM.loadSampleBtn.addEventListener('click', () => {
    const samples = generateSampleExpenses();
    AppState.expenses = samples;
    StorageService.saveExpenses(samples);
    StorageService.setShowingSample(true);
    DOM.sampleDataBanner.style.display = 'flex';
    showToast('Loaded 5 sample expenses!', 'success');
    updateApplicationUI();
  });

  // Table Delegated Click for Edit and Delete buttons
  DOM.expensesTableBody.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.action-btn-edit');
    if (editBtn) {
      const id = editBtn.dataset.id;
      startEditingExpense(id);
      return;
    }

    const deleteBtn = e.target.closest('.action-btn-delete');
    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      promptDeleteExpense(id);
      return;
    }
  });

  // Search Filter Input
  DOM.filterSearchInput.addEventListener('input', (e) => {
    AppState.filters.search = e.target.value;
    renderExpenseTable();
  });

  // Clear Search Input Button
  DOM.clearSearchBtn.addEventListener('click', () => {
    DOM.filterSearchInput.value = '';
    AppState.filters.search = '';
    DOM.filterSearchInput.focus();
    renderExpenseTable();
  });

  // Category Filter Select
  DOM.filterCategorySelect.addEventListener('change', (e) => {
    AppState.filters.category = e.target.value;
    renderExpenseTable();
  });

  // Month Filter Select
  DOM.filterMonthSelect.addEventListener('change', (e) => {
    AppState.filters.month = e.target.value;
    renderExpenseTable();
  });

  // Sort Order Select
  DOM.sortSelect.addEventListener('change', (e) => {
    AppState.filters.sortBy = e.target.value;
    renderExpenseTable();
  });

  // Reset Filters Button
  DOM.resetFiltersBtn.addEventListener('click', () => {
    AppState.filters.search = '';
    AppState.filters.category = 'ALL';
    AppState.filters.month = 'ALL';
    AppState.filters.sortBy = 'date-desc';

    DOM.filterSearchInput.value = '';
    DOM.filterCategorySelect.value = 'ALL';
    DOM.filterMonthSelect.value = 'ALL';
    DOM.sortSelect.value = 'date-desc';

    renderExpenseTable();
  });

  // Export to CSV Button
  DOM.exportCsvBtn.addEventListener('click', exportExpensesToCSV);

  // Clear All Data Button
  DOM.clearAllBtn.addEventListener('click', promptClearAllExpenses);

  // Open Budget Modal Buttons
  DOM.openBudgetModalBtn.addEventListener('click', openBudgetModal);
  DOM.editBudgetBtn.addEventListener('click', openBudgetModal);

  // Close Budget Modal Buttons
  DOM.closeBudgetModal.addEventListener('click', closeBudgetModal);
  DOM.cancelBudgetModal.addEventListener('click', closeBudgetModal);
  DOM.budgetModal.addEventListener('click', (e) => {
    if (e.target === DOM.budgetModal) closeBudgetModal();
  });

  // Save Budget Form
  DOM.budgetForm.addEventListener('submit', handleBudgetSubmit);

  // Preset Budget Buttons inside Modal
  const presetButtons = document.querySelectorAll('.btn-preset');
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const amt = btn.dataset.amount;
      if (amt) DOM.monthlyBudgetInput.value = amt;
    });
  });

  // Confirmation Modal Buttons
  DOM.closeConfirmModal.addEventListener('click', closeConfirmModal);
  DOM.cancelConfirmBtn.addEventListener('click', closeConfirmModal);
  DOM.confirmModal.addEventListener('click', (e) => {
    if (e.target === DOM.confirmModal) closeConfirmModal();
  });

  DOM.proceedConfirmBtn.addEventListener('click', () => {
    if (typeof AppState.activeConfirmCallback === 'function') {
      AppState.activeConfirmCallback();
    }
    closeConfirmModal();
  });

  // Global Keyboard Accessibility (Close modals on Escape)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (DOM.budgetModal.style.display !== 'none') {
        closeBudgetModal();
      }
      if (DOM.confirmModal.style.display !== 'none') {
        closeConfirmModal();
      }
    }
  });
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
