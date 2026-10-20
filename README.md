# 🎓 Student Expense Tracker

A clean, modern, and fully responsive personal finance website designed specifically for college students to track expenses, manage monthly budgets, and visualize their spending habits. Built purely with **semantic HTML5, modern CSS3, and vanilla JavaScript (ES6+)** with **zero external frameworks and no backend required**. All data is automatically persisted in the browser's `localStorage`.

---

## 📌 Project Preview

```
+-----------------------------------------------------------------------------------------+
| [🎓 Student Expense Tracker]                   [Budget: ₹12,000] [🌓 Theme Toggle]      |
+-----------------------------------------------------------------------------------------+
| Manage Your College Expenses with Confidence                                            |
| Track every rupee, keep hostel & academic spending in check, and hit your goals.        |
+-----------------------------------------------------------------------------------------+
| [ Total Spent: ₹10,130 ] [ This Month: ₹10,130 ] [ Top: Rent ] [ 5 Transactions ]       |
+-----------------------------------------------------------------------------------------+
| Monthly Budget: ₹10,130 of ₹12,000 (84% Used)  [===========>---]  Approaching limit     |
+-----------------------------------------------------------------------------------------+
| [ Add Expense Form ]                   | [ Spending Breakdown (Doughnut Chart) ]        |
| - Title & Amount (₹)                   |   • Food: ₹3,200 (32%)                         |
| - Category & Date                      |   • Rent: ₹4,500 (44%)                         |
| - Optional Note                        |   • Books: ₹1,450 (14%)                        |
+-----------------------------------------------------------------------------------------+
| [ Expense History ]   [ Search... ] [ Category: All ] [ Month: All ] [ Export CSV ]     |
| [Date]       [Title & Note]                    [Category]        [Amount]     [Actions] |
| 18 Oct 2026  Shared Room Rent & Maintenance    🏠 Rent           ₹4,500.00    [Edit][Del]
| 13 Oct 2026  Monthly College Mess Advance      🍔 Food           ₹3,200.00    [Edit][Del]
| 10 Oct 2026  Data Structures Reference Book    📚 Books          ₹1,450.00    [Edit][Del]
+-----------------------------------------------------------------------------------------+
```

*(Placeholder for Screenshot: Replace `preview-screenshot.png` with a capture of your running dashboard)*
![Student Expense Tracker Preview](preview-screenshot.png)

---

## ✨ Features

### 1. 📝 Add & Edit Expense Form
- Input fields: **Title**, **Amount (in ₹)**, **Category** (`Food`, `Travel`, `Books`, `Rent`, `Entertainment`, `Other`), **Date**, and an optional **Note**.
- **Robust Client-Side Validation**:
  - Catches empty submissions, negative amounts, zero amounts, and invalid dates.
  - Displays user-friendly, inline error messages beneath each input field.
- **In-Place Editing Mode**: Clicking the "Edit" button populates the form, switches to edit mode, and highlights the active record.

### 2. 📊 Dynamic Dashboard Overview
- **Total Spent Card**: Lifetime expenditure across all recorded transactions.
- **This Month's Spending Card**: Real-time spending for the current calendar month with a budget comparison percentage.
- **Top Expense Category Card**: Identifies where the largest share of money went (with percentage calculation).
- **Transaction Counter**: Total transaction count and current month count.

### 3. 🎯 Monthly Budget Tracker & Progress Indicator
- Set and adjust your monthly spending budget anytime (with quick ₹5,000, ₹8,000, ₹12,000, ₹15,000, and ₹20,000 presets).
- Dynamic progress bar with smart color thresholds:
  - 🟢 **Safe Zone (< 70%)**: Green bar indicating healthy spending pace.
  - 🟡 **Warning Zone (70% – 99%)**: Turns yellow when approaching or near 80% of budget.
  - 🔴 **Danger Zone (≥ 100%)**: Turns crimson red with an alert when the budget is exceeded.

### 4. 📈 Category Spending Breakdown (Chart.js via CDN)
- Interactive, responsive **Doughnut Chart** displaying spending distribution by category.
- Hover tooltips showing exact amounts in ₹ and percentage share.
- Custom accessible category legend.
- Seamless re-theming in dark mode and fallback empty state when no expenses exist.

### 5. 🔍 Real-Time Search, Filtering & Sorting
- **Live Search**: Instant keyword search matching expense titles and notes.
- **Category Filter**: Filter expenses by Food, Travel, Books, Rent, Entertainment, or Other.
- **Month Filter**: Dynamically aggregates all recorded months for quick historical analysis.
- **Sorting Options**: Sort by Newest First, Oldest First, Amount (High to Low), or Amount (Low to High).
- Quick **Reset Filters** button to restore full view with a single click.

### 6. 💾 100% Client-Side LocalStorage Persistence
- All transactions, budget configurations, and theme selections are stored in browser `localStorage`.
- Data remains intact across page refreshes and browser restarts.

### 7. 📥 Export to CSV
- One-click export that formats all expense records into an RFC 4180 compliant `.csv` spreadsheet (`student_expenses_YYYY-MM-DD.csv`).
- Handles special characters, quotes, and commas cleanly.

### 8. 🛡️ Confirmation Modals & Toast Feedback
- Non-blocking confirmation modal before deleting an expense or clearing all data to prevent accidental loss.
- Non-intrusive, floating toast notifications for user actions (e.g. Added, Updated, Deleted, Exported).

### 9. 🌓 Light & Dark Theme Toggle
- Minimalist navy blue and white aesthetic for daytime study sessions.
- High-contrast, easy-on-the-eyes dark navy theme for late-night studying.
- Remembers user's preference and honors system color scheme by default.

### 10. 🎒 Realistic Sample Data for First-Year Students
- Automatically loads 5 realistic student expenses on first launch so the dashboard immediately looks vibrant and populated.
- Provides a one-click **"Clear Sample Data"** banner to wipe demo data whenever you're ready to start fresh.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **HTML5** | Semantic structure, accessible forms, ARIA attributes |
| **CSS3** | Modern CSS Variables, Flexbox, Grid, animations, and responsive media queries |
| **Vanilla JavaScript (ES6+)** | State management, DOM manipulation, LocalStorage API, data calculations |
| **Chart.js (v4.4.7 CDN)** | Interactive doughnut chart for category breakdown |
| **Google Fonts** | `Inter` (readable UI body) & `Poppins` (modern geometric headings) |

---

## 📂 Project Structure

```
student-expense-tracker/
│
├── index.html          # Semantic HTML5 layout and modal templates
│
├── css/
│   └── style.css       # Design system, CSS variables, dark theme, responsive rules
│
├── js/
│   └── script.js       # App logic, CRUD functions, validation, chart & storage handlers
│
├── .gitignore          # Ignores OS, IDE, and temporary files
└── README.md           # Comprehensive project documentation
```

---

## 🚀 How to Run the Project

No build step, package manager, or server installation is needed!

### Method 1: Direct File Opening
1. Download or clone this repository:
   ```bash
   git clone https://github.com/your-username/student-expense-tracker.git
   ```
2. Navigate into the project folder.
3. Double-click `index.html` to open it directly in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.

### Method 2: VS Code Live Server (Recommended)
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` and select **"Open with Live Server"**.
4. The site will launch automatically at `http://127.0.0.1:5500`.

### Method 3: Python Built-In Local Server
Run in your terminal from inside the project directory:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

---

## 💡 Edge Cases Handled

- **Negative & Zero Values**: Prevents entry of zero or negative amounts with inline validation warnings.
- **Empty & Whitespace-only Inputs**: Strips surrounding whitespace and requires meaningful titles.
- **Invalid Date Inputs**: Validates date formats and prevents corrupt date entries.
- **Safe CSV Escaping**: Double-quotes fields containing commas or quotes so spreadsheet programs (Excel, Google Sheets) parse them correctly.
- **Zero Division / Empty States**: Gracefully displays empty state graphics when no expenses match filters or when the database is empty.
- **Keyboard Navigation**: Pressing `Escape` closes any open modal dialog.

---

## 🔮 Future Improvements & Roadmap

- [ ] **Recurring Expenses**: Automatically schedule recurring monthly expenses (e.g. hostel rent, mess fees, mobile recharge).
- [ ] **PDF Receipt Generator**: Export formatted monthly statements as printable PDF receipts.
- [ ] **Receipt Image Attachment**: Store compressed thumbnails of bills/receipts using IndexedDB.
- [ ] **Multi-Currency Support**: Add dropdown toggles for USD (\$), EUR (€), and GBP (£).
- [ ] **Cloud Sync Option**: Optional Firebase or Supabase authentication to sync data across college laptop and mobile phone.

---

## 👨‍💻 Author & Acknowledgements

- **Author**: First-Year Computer Science Undergraduate
- **License**: MIT License — feel free to use, modify, and learn from this project!
- Special thanks to [Chart.js](https://www.chartjs.org/) for the lightweight charting library and [Google Fonts](https://fonts.google.com/) for the typography.
