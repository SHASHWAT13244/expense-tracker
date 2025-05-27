const musicToggleBtn = document.getElementById('music-toggle');
const bgMusic = document.getElementById('bg-music');

// Initially paused and muted (no sound)
bgMusic.pause();
bgMusic.muted = true;

// Music toggle button event listener
musicToggleBtn.addEventListener('click', () => {
  if (bgMusic.paused) {
    bgMusic.muted = false;   // Unmute music
    bgMusic.play().catch(err => {
      console.error("Error playing audio:", err);
    });
    musicToggleBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
  } else {
    bgMusic.pause();
    musicToggleBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
  }
});


// ===== Theme toggle (dark/light) =====
const themeToggleBtn = document.getElementById('theme-toggle');
themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  // Swap icon
  if(document.body.classList.contains('dark-mode')){
    themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
  }
});

// ===== Expense Tracker Logic =====

const expenseForm = document.getElementById('expense-form');
const expenseTableBody = document.querySelector('#expense-table tbody');
const clearBtn = document.getElementById('clear-expenses');

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// Initialize date input with today
document.getElementById('date').valueAsDate = new Date();

function saveExpenses(){
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

function renderExpenses(){
  expenseTableBody.innerHTML = '';
  expenses.forEach((expense, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${expense.description}</td>
      <td>₹${parseFloat(expense.amount).toFixed(2)}</td>
      <td>${expense.category}</td>
      <td>${expense.date}</td>
      <td>
        <button class="btn btn-sm btn-danger btn-delete" data-index="${index}" title="Delete Expense">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    expenseTableBody.appendChild(tr);
  });
  updateCharts();
}

function updateCharts(){
  // Spending by category pie chart data
  const categoryTotals = {};
  const monthlyTotals = {};

  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + parseFloat(e.amount);

    const month = e.date.slice(0,7); // YYYY-MM
    monthlyTotals[month] = (monthlyTotals[month] || 0) + parseFloat(e.amount);
  });

  // Update categoryChart
  categoryChart.data.labels = Object.keys(categoryTotals);
  categoryChart.data.datasets[0].data = Object.values(categoryTotals);
  categoryChart.update();

  // Sort months chronologically for monthlyChart
  const months = Object.keys(monthlyTotals).sort();
  monthlyChart.data.labels = months;
  monthlyChart.data.datasets[0].data = months.map(m => monthlyTotals[m]);
  monthlyChart.update();
}

// Handle adding expense
expenseForm.addEventListener('submit', e => {
  e.preventDefault();

  const description = document.getElementById('description').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;

  if(description && amount > 0 && category && date){
    expenses.push({description, amount, category, date});
    saveExpenses();
    renderExpenses();
    expenseForm.reset();
    document.getElementById('date').valueAsDate = new Date();
  }
});

// Handle delete expense
expenseTableBody.addEventListener('click', e => {
  if(e.target.closest('.btn-delete')){
    const index = e.target.closest('.btn-delete').dataset.index;
    expenses.splice(index,1);
    saveExpenses();
    renderExpenses();
  }
});

// Clear all expenses
clearBtn.addEventListener('click', () => {
  if(confirm('Are you sure you want to clear all expenses?')){
    expenses = [];
    saveExpenses();
    renderExpenses();
  }
});

// ===== Chart.js setup =====
const categoryCtx = document.getElementById('categoryChart').getContext('2d');
const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');

const categoryChart = new Chart(categoryCtx, {
  type: 'pie',
  data: {
    labels: [],
    datasets: [{
      label: 'Spending by Category',
      data: [],
      backgroundColor: [
        '#007bff','#dc3545','#ffc107','#28a745','#6f42c1','#fd7e14'
      ],
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: { enabled: true }
    }
  }
});

const monthlyChart = new Chart(monthlyCtx, {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{
      label: 'Monthly Spending (₹)',
      data: [],
      backgroundColor: '#0d6efd',
      borderWidth: 1,
      borderRadius: 4
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    }
  }
});

// Initial render
renderExpenses();
