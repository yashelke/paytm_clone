// main.js for Paytm Clone with localStorage logic

// Demo users
const demoUsers = [
  { id: 1, name: "Amit Sharma", upi: "amit@paytm" },
  { id: 2, name: "Paytm Mall", upi: "mall@paytm" },
  { id: 3, name: "Recharge", upi: "recharge@paytm" }
];

// Initialize localStorage if not present
function initWallet() {
  if (!localStorage.getItem('walletUsers')) {
    const users = demoUsers.map(u => ({ ...u, balance: 12500 }));
    localStorage.setItem('walletUsers', JSON.stringify(users));
  }
  if (!localStorage.getItem('walletTransactions')) {
    localStorage.setItem('walletTransactions', JSON.stringify([]));
  }
  if (!localStorage.getItem('currentUserId')) {
    localStorage.setItem('currentUserId', '1'); // Default to Amit
  }
}

// Get current user
function getCurrentUser() {
  const users = JSON.parse(localStorage.getItem('walletUsers'));
  const id = parseInt(localStorage.getItem('currentUserId'));
  return users.find(u => u.id === id);
}

// Set current user
function setCurrentUser(id) {
  localStorage.setItem('currentUserId', id.toString());
}

// Get all users
function getAllUsers() {
  return JSON.parse(localStorage.getItem('walletUsers'));
}

// Update user balance
function updateUserBalance(id, newBalance) {
  let users = getAllUsers();
  users = users.map(u => u.id === id ? { ...u, balance: newBalance } : u);
  localStorage.setItem('walletUsers', JSON.stringify(users));
}

// Add transaction
function addTransaction({ senderId, receiverId, amount, type }) {
  const txs = JSON.parse(localStorage.getItem('walletTransactions'));
  txs.unshift({ senderId, receiverId, amount, type, timestamp: new Date().toISOString() });
  localStorage.setItem('walletTransactions', JSON.stringify(txs));
}

// Get transactions for user
function getTransactionsForUser(userId) {
  const txs = JSON.parse(localStorage.getItem('walletTransactions'));
  return txs.filter(t => t.senderId === userId || t.receiverId === userId);
}

// On page load
initWallet();
window.getCurrentUser = getCurrentUser;
window.getAllUsers = getAllUsers;
window.setCurrentUser = setCurrentUser;
window.updateUserBalance = updateUserBalance;
window.addTransaction = addTransaction;
window.getTransactionsForUser = getTransactionsForUser;

// Render wallet balance and transaction history on dashboard
function renderDashboard() {
  const user = getCurrentUser();
  if (document.getElementById('wallet-balance')) {
    document.getElementById('wallet-balance').textContent = `₹${user.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
  }
  if (document.getElementById('transaction-list')) {
    const txs = getTransactionsForUser(user.id).slice(0, 5); // Show last 5
    const users = getAllUsers();
    document.getElementById('transaction-list').innerHTML = txs.map(tx => {
      const otherUser = tx.senderId === user.id ? users.find(u => u.id === tx.receiverId) : users.find(u => u.id === tx.senderId);
      const isCredit = tx.receiverId === user.id;
      const sign = isCredit ? '+' : '-';
      const color = isCredit ? 'text-green-600' : 'text-red-600';
      const avatar = otherUser ? `assets/user${otherUser.id}.png` : 'assets/user1.png';
      const name = otherUser ? otherUser.name : 'Unknown';
      return `<li class="flex items-center justify-between px-4 py-3">
        <div class="flex items-center gap-3">
          <img src="${avatar}" class="h-8 w-8 rounded-full" alt="User">
          <span class="font-medium">${name}</span>
        </div>
        <span class="${color} font-bold">${sign}₹${parseFloat(tx.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
      </li>`;
    }).join('') || '<li class="px-4 py-3 text-gray-400">No transactions yet.</li>';
  }
}

function setDarkMode(enabled) {
  if (enabled) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('paytm-dark-mode', '1');
    if (document.getElementById('dark-mode-icon')) document.getElementById('dark-mode-icon').innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.293 14.293A8 8 0 019.707 6.707a8.001 8.001 0 107.586 7.586z" />`;
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('paytm-dark-mode', '0');
    if (document.getElementById('dark-mode-icon')) document.getElementById('dark-mode-icon').innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m8.66-12.34l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.95 7.07l-.71-.71M4.05 4.93l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" />`;
  }
}
document.addEventListener('DOMContentLoaded', function() {
  // Set user switcher to current user
  const userSwitcher = document.getElementById('user-switcher');
  if (userSwitcher) {
    userSwitcher.value = getCurrentUser().id;
    userSwitcher.addEventListener('change', function() {
      setCurrentUser(parseInt(this.value));
      renderDashboard();
    });
  }

  // Add Money modal logic
  const addMoneyBtn = document.getElementById('add-money-btn');
  const addMoneyModal = document.getElementById('add-money-modal');
  const addMoneyCancel = document.getElementById('add-money-cancel');
  const addMoneyConfirm = document.getElementById('add-money-confirm');
  const addMoneyAmount = document.getElementById('add-money-amount');
  if (addMoneyBtn && addMoneyModal) {
    addMoneyBtn.onclick = () => { addMoneyModal.classList.remove('hidden'); addMoneyAmount.value = ''; };
    addMoneyCancel.onclick = () => addMoneyModal.classList.add('hidden');
    addMoneyConfirm.onclick = () => {
      const amt = parseFloat(addMoneyAmount.value);
      if (isNaN(amt) || amt <= 0) {
        alert('Enter a valid amount');
        return;
      }
      const user = getCurrentUser();
      updateUserBalance(user.id, user.balance + amt);
      addMoneyModal.classList.add('hidden');
      renderDashboard();
    };
  }

  // Reset Demo logic
  const resetDemoBtn = document.getElementById('reset-demo-btn');
  if (resetDemoBtn) {
    resetDemoBtn.onclick = () => {
      if (confirm('Reset all wallet data and transactions?')) {
        localStorage.clear();
        location.reload();
      }
    };
  }

  // Dark mode toggle
  const darkModeBtn = document.getElementById('dark-mode-toggle');
  if (darkModeBtn) {
    darkModeBtn.onclick = function() {
      const enabled = !(localStorage.getItem('paytm-dark-mode') === '1');
      setDarkMode(enabled);
    };
    // Set initial mode
    setDarkMode(localStorage.getItem('paytm-dark-mode') === '1');
  }
  renderDashboard();
});
window.renderDashboard = renderDashboard;
