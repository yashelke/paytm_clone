// receive.js for Receive Money page with localStorage wallet logic

document.addEventListener('DOMContentLoaded', function() {
  // Show current user's UPI
  const currentUser = window.getCurrentUser();
  const upiId = currentUser.upi;
  document.getElementById('upiId').textContent = upiId;

  // Generate QR code for current user's UPI
  const qrcode = new QRCode(document.getElementById("qrcode"), {
    text: upiId,
    width: 180,
    height: 180,
    colorDark : "#002970",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  });

  // Copy UPI ID
  document.getElementById('copyUpiBtn').addEventListener('click', function() {
    navigator.clipboard.writeText(upiId);
    this.textContent = 'Copied!';
    setTimeout(() => { this.textContent = 'Copy UPI ID'; }, 1500);
  });
});
