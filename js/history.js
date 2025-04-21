// history.js - for All Transactions page

document.addEventListener('DOMContentLoaded', function() {
  // Set user switcher to current user
  const userSwitcher = document.getElementById('user-switcher');
  if (userSwitcher) {
    userSwitcher.value = getCurrentUser().id;
    userSwitcher.addEventListener('change', function() {
      setCurrentUser(parseInt(this.value));
      renderAllTransactions();
    });
  }
  renderAllTransactions();
});

function renderAllTransactions() {
  const user = getCurrentUser();
  const txs = getTransactionsForUser(user.id);
  const users = getAllUsers();
  const list = document.getElementById('all-transaction-list');
  list.innerHTML = txs.length ? txs.map(tx => {
    const otherUser = tx.senderId === user.id ? users.find(u => u.id === tx.receiverId) : users.find(u => u.id === tx.senderId);
    const isCredit = tx.receiverId === user.id;
    const sign = isCredit ? '+' : '-';
    const color = isCredit ? 'text-green-600' : 'text-red-600';
    const avatar = otherUser ? `assets/user${otherUser.id}.png` : 'assets/user1.png';
    const name = otherUser ? otherUser.name : 'Unknown';
    const type = isCredit ? 'Received from' : 'Sent to';
    const date = new Date(tx.timestamp).toLocaleString();
    return `<li class="flex items-center justify-between px-4 py-3">
      <div class="flex items-center gap-3">
        <img src="${avatar}" class="h-8 w-8 rounded-full" alt="User">
        <div class="flex flex-col">
          <span class="font-medium">${name}</span>
          <span class="text-xs text-gray-400">${type}</span>
        </div>
      </div>
      <div class="flex flex-col items-end">
        <span class="${color} font-bold">${sign}₹${parseFloat(tx.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
        <span class="text-xs text-gray-400">${date}</span>
      </div>
    </li>`;
  }).join('') : '<li class="px-4 py-3 text-gray-400">No transactions yet.</li>';
}
