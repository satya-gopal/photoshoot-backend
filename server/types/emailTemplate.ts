export const contactHtmlContent = (data:any) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 20px;
    }
    .email-wrapper {
      max-width: 640px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      padding: 60px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(100px, -100px);
    }
    .header-content {
      position: relative;
      z-index: 1;
    }
    .header-icon {
      font-size: 48px;
      margin-bottom: 16px;
      display: inline-block;
    }
    .header h1 {
      color: #ffffff;
      font-size: 36px;
      font-weight: 800;
      margin-bottom: 10px;
      letter-spacing: -0.8px;
    }
    .header p {
      color: rgba(255, 255, 255, 0.95);
      font-size: 15px;
      font-weight: 500;
    }
    .content {
      padding: 50px 40px;
      background-color: #ffffff;
    }
    .sender-card {
      background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%);
      border: 2px solid #e0f2fe;
      border-radius: 12px;
      padding: 28px;
      margin-bottom: 35px;
    }
    .sender-name {
      font-size: 24px;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 16px;
      letter-spacing: -0.3px;
    }

    /* 🔥 FIX: Email and phone in separate lines */
    .sender-contact {
      display: block;
    }
    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 6px 0;
      font-size: 15px;
      color: #334155;
    }

    .contact-icon {
      color: #2563eb;
      font-weight: 700;
      font-size: 18px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .contact-value {
      word-break: break-word;
      line-height: 1.5;
      color: #1e293b;
      font-weight: 500;
    }
    .section {
      margin-bottom: 35px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #2563eb;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .section-divider {
      flex-grow: 1;
      height: 2px;
      background: linear-gradient(90deg, #2563eb 0%, #e0f2fe 100%);
      border-radius: 1px;
    }
    .subject-field {
      background: linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%);
      border: 2px solid #fcd34d;
      border-radius: 10px;
      padding: 20px 24px;
      margin-bottom: 20px;
    }
    .subject-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #92400e;
      margin-bottom: 8px;
    }
    .subject-value {
      font-size: 16px;
      color: #1e293b;
      font-weight: 600;
      line-height: 1.5;
      word-break: break-word;
    }
    .message-box {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-left: 5px solid #2563eb;
      border-radius: 8px;
      padding: 24px;
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }
    .message-box p {
      color: #334155;
      font-size: 15px;
      line-height: 1.8;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-weight: 400;
    }
    .cta-note {
      background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
      border: 2px solid #0ea5e9;
      border-radius: 10px;
      padding: 18px 22px;
      margin-top: 25px;
      font-size: 14px;
      color: #0c4a6e;
    }
    .cta-highlight {
      color: #0369a1;
      font-weight: 700;
    }
    .footer {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-top: 1px solid #e2e8f0;
      padding: 35px 40px;
      text-align: center;
    }
    .footer-text {
      color: #64748b;
      font-size: 13px;
      line-height: 1.7;
      font-weight: 400;
    }
    .footer-brand {
      color: #2563eb;
      font-weight: 700;
    }
    .footer-timestamp {
      color: #94a3b8;
      font-size: 12px;
      margin-top: 16px;
      font-weight: 500;
    }
    @media (max-width: 480px) {
      .email-wrapper { border-radius: 8px; }
      .header { padding: 40px 24px; }
      .header-icon { font-size: 40px; }
      .header h1 { font-size: 28px; }
      .content { padding: 30px 24px; }
      .sender-card { padding: 20px; }
      .sender-name { font-size: 20px; }
      .footer { padding: 25px 24px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="header-content">
        <div class="header-icon">💬</div>
        <h1>New Message</h1>
        <p>You have received a new inquiry</p>
      </div>
    </div>

    <div class="content">
      <div class="sender-card">
        <div class="sender-name">${data.name}</div>
        <div class="sender-contact">
          <div class="contact-item">
            <span class="contact-icon">✉</span>
            <span class="contact-value">${data.email}</span>
          </div>
          ${data.phone ? `
          <div class="contact-item">
            <span class="contact-icon">📞</span>
            <span class="contact-value">${data.phone}</span>
          </div>` : ''}
        </div>
      </div>

      ${data.subject ? `
      <div class="section">
        <div class="section-title">
          <span>Subject</span>
          <div class="section-divider"></div>
        </div>
        <div class="subject-field">
          <div class="subject-label">Message Topic</div>
          <div class="subject-value">${data.subject}</div>
        </div>
      </div>` : ''}

      <div class="section">
        <div class="section-title">
          <span>Message</span>
          <div class="section-divider"></div>
        </div>
        <div class="message-box">
          <p>${data.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        </div>
      </div>

      <div class="cta-note">
        <span class="cta-highlight">Action Required:</span> Please respond within 24 hours.
      </div>
    </div>

    <div class="footer">
      <p class="footer-text">
        This is an automated notification from <span class="footer-brand">Shooting Zone</span><br>
        Do not reply directly.
      </p>
      <p class="footer-timestamp">
        ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
      </p>
    </div>
  </div>
</body>
</html>
`;


export const preRegisterHtmlContent =(data: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 28px;
      font-weight: 600;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 10px 0 0 0;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
    }
    .content {
      padding: 40px 30px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #667eea;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #f0f0f0;
    }
    .info-row {
      display: table;
      width: 100%;
      margin-bottom: 12px;
    }
    .info-label {
      display: table-cell;
      width: 40%;
      font-size: 14px;
      color: #666666;
      padding: 8px 0;
    }
    .info-value {
      display: table-cell;
      width: 60%;
      font-size: 14px;
      color: #333333;
      font-weight: 500;
      padding: 8px 0;
    }
    .special-requests {
      background-color: #f9fafb;
      border-left: 4px solid #667eea;
      padding: 15px 20px;
      border-radius: 4px;
      margin-top: 10px;
    }
    .special-requests p {
      margin: 0;
      font-size: 14px;
      color: #333333;
      line-height: 1.6;
    }
    .footer {
      background-color: #f9fafb;
      padding: 25px 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 0;
      font-size: 12px;
      color: #999999;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background-color: #e0e7ff;
      color: #667eea;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>📸 New Pre-Registration</h1>
      <p>You have received a new booking inquiry</p>
    </div>

    <div class="content">
      <div class="section">
        <div class="section-title">Client Information</div>
        <div class="info-row">
          <div class="info-label">Full Name</div>
          <div class="info-value">${data.firstName} ${data.lastName || ""}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Email</div>
          <div class="info-value">${data.email}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Phone</div>
          <div class="info-value">${data.phone}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Booking Details</div>
        <div class="info-row">
          <div class="info-label">Photoshoot Type</div>
          <div class="info-value">
            ${data.photoshootType}
            <div class="badge">${data.photoshootType}</div>
          </div>
        </div>
        <div class="info-row">
          <div class="info-label">Preferred Date</div>
          <div class="info-value">${data.preferredDate || "Not specified"}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Preferred Time</div>
          <div class="info-value">${data.preferredTime || "Not specified"}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Participants</div>
          <div class="info-value">${data.participants || "Not specified"}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Location Type</div>
          <div class="info-value">${data.locationType || "Not specified"}</div>
        </div>
      </div>

      ${
        data.specialRequests
          ? `
      <div class="section">
        <div class="section-title">Special Requests</div>
        <div class="special-requests">
          <p>${data.specialRequests}</p>
        </div>
      </div>
      `
          : ""
      }
    </div>

    <div class="footer">
      <p>This is an automated notification from Shooting Zone</p>
      <p style="margin-top: 8px;">Please respond to the client within 24 hours</p>
    </div>
  </div>
</body>
</html>
`;