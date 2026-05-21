export const downloadIDCard = (student, qrCodeData) => {
  // Create a canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set dimensions (Credit Card Size Ratio)
  canvas.width = 600;
  canvas.height = 1000;

  // 1. Draw Background
  // Main gradient
  const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGradient.addColorStop(0, '#f8fafc'); // surface-50
  bgGradient.addColorStop(1, '#e2e8f0'); // surface-200
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Draw Header
  const headerGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  headerGradient.addColorStop(0, '#4f46e5'); // primary-600
  headerGradient.addColorStop(1, '#06b6d4'); // accent-500
  ctx.fillStyle = headerGradient;
  ctx.fillRect(0, 0, canvas.width, 220);

  // Header Pattern/Curve (simulated with a polygon)
  ctx.beginPath();
  ctx.moveTo(0, 220);
  ctx.quadraticCurveTo(canvas.width / 2, 280, canvas.width, 220);
  ctx.lineTo(canvas.width, 0);
  ctx.lineTo(0, 0);
  ctx.fill();

  // 3. Header Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SMARTSCHOOL', canvas.width / 2, 90);
  
  ctx.font = 'bold 20px "Inter", sans-serif';
  ctx.fillStyle = '#cffafe'; // accent-100
  ctx.letterSpacing = '4px';
  ctx.fillText('STUDENT E-WALLET CARD', canvas.width / 2, 130);

  // 4. Student Avatar Frame
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 260, 90, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#4f46e5';
  ctx.stroke();

  // Student Initials in Avatar
  ctx.fillStyle = '#4f46e5';
  ctx.font = 'bold 64px "Inter", sans-serif';
  ctx.textBaseline = 'middle';
  const initials = student.full_name ? student.full_name.charAt(0).toUpperCase() : 'S';
  ctx.fillText(initials, canvas.width / 2, 264);

  // Reset text baseline
  ctx.textBaseline = 'alphabetic';

  // 5. Student Details
  ctx.fillStyle = '#0f172a'; // surface-900
  ctx.font = 'bold 42px "Inter", sans-serif';
  ctx.fillText(student.full_name || 'Unknown Student', canvas.width / 2, 410);

  // Info Box Background
  ctx.fillStyle = '#ffffff';
  ctx.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  }
  ctx.roundRect(50, 450, 500, 160, 16).fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();

  // Info Labels and Values
  ctx.textAlign = 'left';
  
  // Left Column
  ctx.fillStyle = '#64748b'; // surface-500
  ctx.font = 'bold 16px "Inter", sans-serif';
  ctx.fillText('MATRIC NUMBER', 80, 490);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 24px "Inter", sans-serif';
  ctx.fillText(student.matric_no, 80, 520);

  // Right Column
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 16px "Inter", sans-serif';
  ctx.fillText('LEVEL', 350, 490);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 24px "Inter", sans-serif';
  ctx.fillText(student.level || 'N/A', 350, 520);

  // Bottom Row
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 16px "Inter", sans-serif';
  ctx.fillText('DEPARTMENT', 80, 560);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 24px "Inter", sans-serif';
  ctx.fillText(student.department || 'N/A', 80, 590);

  // 6. QR Code Area Background
  ctx.fillStyle = '#ffffff';
  ctx.roundRect(175, 650, 250, 250, 20).fill();
  ctx.shadowColor = 'rgba(0,0,0,0.1)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 5;
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Helper to load image
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // 7. Load and Draw QR Code
  // Using the qrserver API
  const qrUrl = \`https://api.qrserver.com/v1/create-qr-code/?size=210x210&data=\${encodeURIComponent(qrCodeData)}\`;
  
  loadImage(qrUrl).then((qrImg) => {
    ctx.drawImage(qrImg, 195, 670, 210, 210);

    // Footer
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 14px "Inter", sans-serif';
    ctx.fillText('Valid for SmartSchool Wallet Purchases Only', canvas.width / 2, 950);
    ctx.fillText('If found, please return to school administration', canvas.width / 2, 970);

    // Trigger Download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = \`ID_Card_\${student.matric_no}.png\`;
    link.href = dataUrl;
    link.click();
  }).catch((err) => {
    console.error('Failed to load QR code image for ID card', err);
    alert('Failed to generate ID card image.');
  });
};
