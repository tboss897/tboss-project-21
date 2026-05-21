export const downloadIDCard = async (student, qrCodeData, logoUrl = null, passportUrl = null) => {
  // Create a canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set dimensions (Credit Card Size Ratio)
  canvas.width = 600;
  canvas.height = 1000;

  // 1. Draw Background
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

  // Helper to load image
  const loadImage = (src) => {
    if (!src) return Promise.resolve(null);
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null); // fail gracefully
      img.src = src;
    });
  };

  // Pre-load all images
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=210x210&data=${encodeURIComponent(qrCodeData)}`;
  const [logoImg, passportImg, qrImg] = await Promise.all([
    loadImage(logoUrl),
    loadImage(passportUrl),
    loadImage(qrUrl)
  ]);

  // 3. Header Text or Logo
  if (logoImg) {
    // Center the logo in the header
    const logoHeight = 100;
    const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
    ctx.drawImage(logoImg, (canvas.width - logoWidth) / 2, 40, logoWidth, logoHeight);
    
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.fillStyle = '#cffafe';
    ctx.letterSpacing = '2px';
    ctx.textAlign = 'center';
    ctx.fillText('STUDENT E-WALLET CARD', canvas.width / 2, 160);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SMARTSCHOOL', canvas.width / 2, 90);
    
    ctx.font = 'bold 20px "Inter", sans-serif';
    ctx.fillStyle = '#cffafe'; // accent-100
    ctx.letterSpacing = '4px';
    ctx.fillText('STUDENT E-WALLET CARD', canvas.width / 2, 130);
  }

  // 4. Student Avatar Frame
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 260, 90, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#4f46e5';
  ctx.stroke();

  // Draw Passport or Initials
  if (passportImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 260, 90, 0, Math.PI * 2);
    ctx.clip();
    
    // Draw image centered and covering the circle
    const size = Math.min(passportImg.width, passportImg.height);
    const scale = 180 / size;
    const drawW = passportImg.width * scale;
    const drawH = passportImg.height * scale;
    const drawX = (canvas.width / 2) - (drawW / 2);
    const drawY = 260 - (drawH / 2);
    
    ctx.drawImage(passportImg, drawX, drawY, drawW, drawH);
    ctx.restore();
  } else {
    ctx.fillStyle = '#4f46e5';
    ctx.font = 'bold 64px "Inter", sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    const initials = student.full_name ? student.full_name.charAt(0).toUpperCase() : 'S';
    ctx.fillText(initials, canvas.width / 2, 264);
  }

  // Reset text baseline
  ctx.textBaseline = 'alphabetic';

  // 5. Student Details
  ctx.fillStyle = '#0f172a'; // surface-900
  ctx.font = 'bold 42px "Inter", sans-serif';
  ctx.textAlign = 'center';
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

  // 7. Draw QR Code
  if (qrImg) {
    ctx.drawImage(qrImg, 195, 670, 210, 210);
  }

  // Footer
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 14px "Inter", sans-serif';
  ctx.fillText('Valid for SmartSchool Wallet Purchases Only', canvas.width / 2, 950);
  ctx.fillText('If found, please return to school administration', canvas.width / 2, 970);

  // Trigger Download
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `ID_Card_${student.matric_no}.png`;
  link.href = dataUrl;
  link.click();
};
