const nodemailer = require('nodemailer');
const Logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.from = process.env.EMAIL_FROM || 'noreply@endelave.dk';
    this.to = process.env.EMAIL_TO || 'manager@endelave.dk';
    this.initTransporter();
  }

  /**
   * Initialize email transporter
   */
  initTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      
      Logger.info('Email transporter initialized');
    } catch (error) {
      Logger.error('Error initializing email transporter', error);
    }
  }

  /**
   * Send forecast email
   */
  async sendForecastEmail(forecastData) {
    try {
      if (!this.transporter) {
        Logger.warn('Email transporter not configured. Email not sent.');
        return false;
      }

      const { date, predicted_guests, confidence, explanation, suggestions } = forecastData;
      
      const htmlContent = this.createEmailHTML(forecastData);
      
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject: `🍽️ Gæsteprognose for ${date} - ${predicted_guests} gæster forventet`,
        html: htmlContent,
        text: this.createEmailText(forecastData)
      };

      const info = await this.transporter.sendMail(mailOptions);
      Logger.info('Forecast email sent:', info.messageId);
      
      return true;
    } catch (error) {
      Logger.error('Error sending forecast email', error);
      return false;
    }
  }

  /**
   * Escape HTML special characters to prevent XSS
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Create HTML email content
   */
  createEmailHTML(forecastData) {
    const { date, predicted_guests, confidence, explanation, suggestions } = forecastData;
    const confidencePercent = Math.round(confidence * 100);
    
    // Escape all user-generated content
    const safeDate = this.escapeHtml(String(date));
    const safeExplanation = this.escapeHtml(String(explanation));
    const safeStaffing = this.escapeHtml(String(suggestions.staffing));
    const safeOpenHours = this.escapeHtml(String(suggestions.open_hours));
    const safeIngredients = suggestions.ingredients.map(item => this.escapeHtml(String(item)));
    
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2c3e50; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background-color: #ecf0f1; padding: 20px; }
    .forecast-box { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #3498db; }
    .suggestions-box { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
    .metric { font-size: 32px; font-weight: bold; color: #2c3e50; margin: 10px 0; }
    .confidence { color: #27ae60; font-weight: bold; }
    .footer { background-color: #34495e; color: white; padding: 10px; text-align: center; border-radius: 0 0 5px 5px; }
    ul { margin: 10px 0; padding-left: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ Kroen Endelave - Gæsteprognose</h1>
      <p>Dato: ${safeDate}</p>
    </div>
    
    <div class="content">
      <div class="forecast-box">
        <h2>Forventet antal gæster</h2>
        <div class="metric">${predicted_guests} gæster</div>
        <p class="confidence">Sikkerhed: ${confidencePercent}%</p>
        <p><strong>Forklaring:</strong> ${safeExplanation}</p>
      </div>
      
      <div class="suggestions-box">
        <h3>💡 Anbefalinger</h3>
        
        <h4>👥 Bemanding</h4>
        <p>${safeStaffing}</p>
        
        <h4>🛒 Indkøbsliste</h4>
        <ul>
          ${safeIngredients.map(item => `<li>${item}</li>`).join('')}
        </ul>
        
        <h4>🕐 Åbningstider</h4>
        <p>${safeOpenHours}</p>
      </div>
    </div>
    
    <div class="footer">
      <p>Genereret af Endelave Forecast Agent</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Create plain text email content
   */
  createEmailText(forecastData) {
    const { date, predicted_guests, confidence, explanation, suggestions } = forecastData;
    const confidencePercent = Math.round(confidence * 100);
    
    return `
Kroen Endelave - Gæsteprognose
================================
Dato: ${date}

FORVENTET ANTAL GÆSTER: ${predicted_guests}
Sikkerhed: ${confidencePercent}%

Forklaring: ${explanation}

ANBEFALINGER
------------
Bemanding: ${suggestions.staffing}

Indkøbsliste:
${suggestions.ingredients.map(item => `- ${item}`).join('\n')}

Åbningstider: ${suggestions.open_hours}

---
Genereret af Endelave Forecast Agent
    `;
  }
}

module.exports = new EmailService();
