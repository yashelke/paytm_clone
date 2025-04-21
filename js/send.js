// send.js for Send Money page with localStorage wallet logic

document.addEventListener('DOMContentLoaded', function() {
  const scanQrBtn = document.getElementById('scanQrBtn');
  const qrScannerContainer = document.getElementById('qrScannerContainer');
  const closeQrScanner = document.getElementById('closeQrScanner');

  // Show QR scanner
  scanQrBtn.addEventListener('click', function() {
    qrScannerContainer.classList.remove('hidden');
    if (!window.qrScannerInitialized) {
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        qrCodeMessage => {
          // Try to find user by UPI from QR
          const allUsers = window.getAllUsers();
          const receiver = allUsers.find(u => u.upi === qrCodeMessage);
          if (receiver) {
            document.querySelector('#sendMoneyForm input[type="text"]').value = receiver.upi;
            alert('UPI ID auto-filled from QR!');
          } else {
            alert('Scanned UPI not found in demo users.');
          }
          html5QrCode.stop();
          qrScannerContainer.classList.add('hidden');
        },
        errorMessage => {
          // Ignore scan errors
        }
      ).then(() => {
        window.qrScannerInitialized = true;
      });
    }
  });

  // Close QR scanner
  closeQrScanner.addEventListener('click', function() {
    qrScannerContainer.classList.add('hidden');
    location.reload(); // Reload to reset scanner
  });

  // Handle send money form
  document.getElementById('sendMoneyForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const upi = this.querySelector('input[type="text"]').value.trim();
    const amount = parseFloat(this.querySelector('input[type="number"]').value);
    const allUsers = window.getAllUsers();
    const receiver = allUsers.find(u => u.upi === upi);
    const sender = window.getCurrentUser();

    if (!receiver) {
      alert('Receiver UPI not found!');
      return;
    }
    if (receiver.id === sender.id) {
      alert('Cannot send money to yourself!');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      alert('Enter a valid amount!');
      return;
    }
    if (sender.balance < amount) {
      alert('Insufficient balance!');
      return;
    }

    // Update balances
    window.updateUserBalance(sender.id, sender.balance - amount);
    window.updateUserBalance(receiver.id, receiver.balance + amount);

    // Add transactions (send for sender, receive for receiver)
    window.addTransaction({ senderId: sender.id, receiverId: receiver.id, amount, type: 'send' });
    window.addTransaction({ senderId: sender.id, receiverId: receiver.id, amount, type: 'receive' });

    alert('Money sent successfully!');
    this.reset();
    if (window.renderDashboard) window.renderDashboard();
    if (window.renderAllTransactions) window.renderAllTransactions();
  });
});
