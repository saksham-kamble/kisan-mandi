const https = require('https');
const db = require('../config/db');

/**
 * OTP Service for Phone Verification
 * Generates and verifies 6-digit OTPs for farmer registration
 * Sends OTP via Fast2SMS (OTP Route) or simulation fallback
 */
class OTPService {
  constructor() {
    this.apiKey = process.env.FAST2SMS_API_KEY || '';
    this.otpExpiry = 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Generate random 6-digit OTP
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Helper to make HTTP POST requests using native https module
   */
  postRequest(url, data, headers) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const postData = JSON.stringify(data);

      const options = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname + (urlObj.search || ''),
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve({ raw: body });
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.write(postData);
      req.end();
    });
  }

  /**
   * Send OTP via SMS
   */
  async sendOTP(phone, otp) {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const apiKey = process.env.FAST2SMS_API_KEY || this.apiKey;

    // Try Fast2SMS if API key is set
    if (apiKey && apiKey.trim() !== '') {
      try {
        console.log(`📡 [Fast2SMS] Sending OTP ${otp} to +91${cleanPhone}...`);

        // Fast2SMS dedicated OTP route
        const response = await this.postRequest(
          `https://www.fast2sms.com/dev/bulkV2`,
          {
            route: 'otp',
            variables_values: otp,
            numbers: cleanPhone,
          },
          {
            authorization: apiKey.trim(),
          }
        );

        console.log('📡 [Fast2SMS Response]:', JSON.stringify(response, null, 2));

        if (response && (response.return === true || response.status_code === 200)) {
          console.log(`\n✅ [OTP SMS DELIVERED VIA FAST2SMS] -> +91 ${cleanPhone}\n`);
          return { success: true, simulated: false, response };
        } else {
          console.warn(`⚠️ [Fast2SMS Info]:`, response.message || response);
        }
      } catch (apiErr) {
        console.error('⚠️ [Fast2SMS Request Error]:', apiErr.message);
      }
    }

    // Terminal display for instant verification
    console.log(`\n======================================================`);
    console.log(`🔐 [KISAN MANDI OTP CODE]`);
    console.log(`   Phone Number : +91 ${cleanPhone}`);
    console.log(`   👉 OTP CODE  :  ${otp}  👈`);
    console.log(`   Valid For    :  15 Minutes`);
    console.log(`======================================================\n`);

    return { success: true, simulated: true };
  }

  /**
   * Store OTP in database
   */
  async storeOTP(phone, otp) {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const expiresAt = new Date(Date.now() + this.otpExpiry);

    // Clean old OTPs for this phone
    await db('otp_verifications')
      .where({ phone: cleanPhone })
      .del();

    // Insert new OTP
    await db('otp_verifications').insert({
      phone: cleanPhone,
      otp_code: otp,
      expires_at: expiresAt,
      verified: false,
    });
  }

  /**
   * Verify OTP during Step 2
   */
  async verifyOTP(phone, otp) {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    const record = await db('otp_verifications')
      .where({ phone: cleanPhone, otp_code: otp })
      .where('expires_at', '>', db.fn.now())
      .first();

    if (!record) {
      return { valid: false, message: 'Invalid or expired OTP' };
    }

    // Mark as verified
    await db('otp_verifications')
      .where({ id: record.id })
      .update({ verified: true });

    return { valid: true, message: 'OTP verified successfully' };
  }

  /**
   * Check if phone is verified for final registration Step 3
   */
  async isPhoneVerified(phone, otp) {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    const record = await db('otp_verifications')
      .where({ phone: cleanPhone, otp_code: otp, verified: true })
      .where('expires_at', '>', db.fn.now())
      .first();

    return !!record;
  }

  /**
   * Cleanup OTP after successful registration
   */
  async cleanupOTP(phone) {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    await db('otp_verifications').where({ phone: cleanPhone }).del();
  }

  /**
   * Request OTP (send to phone)
   */
  async requestOTP(phone) {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    // Check if phone is already registered
    const existing = await db('farmers').where({ phone: cleanPhone }).first();
    if (existing) {
      return { success: false, message: 'Phone number already registered. Please login instead.' };
    }

    const otp = this.generateOTP();
    await this.storeOTP(cleanPhone, otp);
    await this.sendOTP(cleanPhone, otp);

    return {
      success: true,
      message: 'OTP sent successfully to your mobile number',
      expiresIn: this.otpExpiry / 1000,
    };
  }
}

module.exports = new OTPService();
