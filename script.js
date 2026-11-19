const form = document.getElementById('expense-form');
const nameInput = document.getElementById('name');
const amountInput = document.getElementById('amount');
const list = document.getElementById('list');
const filters = document.querySelectorAll('.filter');
const payAllBtn = document.getElementById('pay-all');
const clearAllBtn = document.getElementById('clear-all');
const refreshNotice = document.getElementById('refresh-notice');

localStorage.removeItem('expenses');
let expenses = [];
let currentFilter = 'all';

function syncSessionFlag() {
    if (expenses.length > 0) {
        sessionStorage.setItem('hadExpenses', 'true');
    } else {
        sessionStorage.removeItem('hadExpenses');
    }
}

if (sessionStorage.getItem('hadExpenses') === 'true') {
    refreshNotice.hidden = false;

    setTimeout(() => {
        refreshNotice.classList.add('fade-out');
        setTimeout(() => {
            refreshNotice.hidden = true;
        }, 400);
    }, 3500);
} else {
    refreshNotice.hidden = true;
}

sessionStorage.removeItem('hadExpenses');

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function renderList() {
    list.innerHTML = '';

    const filtered = expenses.filter(expense => {
        if (currentFilter === 'paid') return expense.paid;
        if (currentFilter === 'unpaid') return !expense.paid;
        return true;
    });

    if (filtered.length === 0) {
        list.innerHTML = '<li class="empty-state"><button type="button" class="empty-btn" onclick="nameInput.focus()">No expenses to show.</button></li>';
    } else {
        filtered.forEach(expense => {
            const li = document.createElement('li');
            li.className = expense.paid ? 'expense paid' : 'expense';

            li.innerHTML = `
                <label class="expense-info">
                    <input type="checkbox" class="checkbox" ${expense.paid ? 'checked' : ''} onchange="toggleExpense(${expense.id})">
                    <span class="expense-name">${escapeHTML(expense.name)}</span>
                </label>
                <div class="expense-right">
                    <span class="expense-amount">$${expense.amount.toFixed(2)}</span>
                    <button type="button" class="delete-btn" onclick="deleteExpense(${expense.id})">&times;</button>
                </div>
            `;
            list.appendChild(li);
        });
    }

    updateSummary();
    syncSessionFlag();
}

function updateSummary() {
    const totalCount = expenses.length;
    const paidCount = expenses.filter(item => item.paid).length;
    const unpaidCount = totalCount - paidCount;

    document.getElementById('count-all').textContent = totalCount;
    document.getElementById('count-unpaid').textContent = unpaidCount;
    document.getElementById('count-paid').textContent = paidCount;

    const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);
    const paidAmount = expenses.filter(item => item.paid).reduce((sum, item) => sum + item.amount, 0);
    const remainingAmount = totalAmount - paidAmount;

    document.getElementById('total').textContent = totalAmount.toFixed(2);
    document.getElementById('paid').textContent = paidAmount.toFixed(2);
    document.getElementById('remaining').textContent = remainingAmount.toFixed(2);

    const percentage = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;
    document.getElementById('percent').textContent = percentage + '%';
    document.getElementById('progress-fill').style.width = percentage + '%';

    payAllBtn.hidden = unpaidCount === 0;
    clearAllBtn.hidden = totalCount === 0;
}

form.addEventListener('submit', e => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (!name || isNaN(amount) || amount <= 0) return;

    expenses.push({
        id: Date.now(),
        name: name,
        amount: amount,
        paid: false
    });

    nameInput.value = '';
    amountInput.value = '';
    renderList();
});

function toggleExpense(id) {
    const expense = expenses.find(item => item.id === id);
    if (expense) {
        expense.paid = !expense.paid;
        renderList();
    }
}

function deleteExpense(id) {
    expenses = expenses.filter(item => item.id !== id);
    renderList();
}

filters.forEach(button => {
    button.addEventListener('click', () => {
        filters.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentFilter = button.dataset.filter;
        renderList();
    });
});

payAllBtn.addEventListener('click', () => {
    expenses.forEach(item => item.paid = true);
    renderList();
});

clearAllBtn.addEventListener('click', () => {
    expenses = [];
    renderList();
});

renderList();
