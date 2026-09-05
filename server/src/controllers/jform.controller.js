const db = require('../config/db');

/** GET /api/jform/:bookingId — Generate J-Form (Sale Receipt) as printable HTML */
const generateJForm = async (req, res, next) => {
  try {
    const bookingId = req.params.bookingId;

    // Fetch full booking with all related data
    const booking = await db('bookings')
      .join('time_slots', 'bookings.slot_id', 'time_slots.id')
      .join('procurement_centres', 'time_slots.centre_id', 'procurement_centres.id')
      .join('farmers', 'bookings.farmer_id', 'farmers.id')
      .leftJoin('payments', 'bookings.id', 'payments.booking_id')
      .where({ 'bookings.id': bookingId })
      .select(
        'bookings.*',
        'time_slots.date',
        'time_slots.start_time',
        'time_slots.end_time',
        'procurement_centres.name as centre_name',
        'procurement_centres.location as centre_location',
        'procurement_centres.district as centre_district',
        'farmers.name as farmer_name',
        'farmers.phone as farmer_phone',
        'farmers.village as farmer_village',
        'farmers.district as farmer_district',
        'farmers.state as farmer_state',
        'farmers.aadhaar_last4',
        'farmers.bank_name',
        'farmers.bank_account_number',
        'farmers.bank_ifsc',
        'farmers.bank_branch',
        'payments.actual_quantity_kg',
        'payments.msp_rate',
        'payments.amount',
        'payments.status as payment_status',
        'payments.payment_reference',
        'payments.paid_at',
        'payments.quality_grade',
        'payments.actual_moisture_percentage',
        'payments.max_allowed_moisture_percentage',
        'payments.moisture_deduction_kg',
        'payments.quality_deduction_percentage',
        'payments.net_quantity_kg',
        'payments.gross_amount',
        'payments.deduction_amount',
        'payments.quality_notes'
      )
      .first();

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Only allow the farmer who owns it or admin
    if (req.user.role !== 'admin' && booking.farmer_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const receiptNo = `JF-MH-${new Date().getFullYear()}-${String(booking.id).padStart(6, '0')}`;
    const generatedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const maskedAccount = booking.bank_account_number
      ? `****${booking.bank_account_number.slice(-4)}`
      : '---';
    const amountFormatted = booking.amount
      ? `₹${parseFloat(booking.amount).toLocaleString('en-IN')}`
      : '---';
    const quintals = booking.actual_quantity_kg
      ? (parseFloat(booking.actual_quantity_kg) / 100).toFixed(2)
      : '---';

    const paymentStatusText = booking.payment_status === 'paid'
      ? '✓ जमा (Credited)'
      : booking.payment_status === 'processing'
      ? '⏳ प्रक्रियेत (Processing)'
      : '○ प्रलंबित (Pending)';

    const paymentStatusColor = booking.payment_status === 'paid'
      ? '#059669'
      : booking.payment_status === 'processing'
      ? '#d97706'
      : '#6b7280';

    // Quality grade badge colors
    const gradeColors = {
      A: { bg: '#d1fae5', text: '#065f46', border: '#059669' },
      B: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
      C: { bg: '#fed7aa', text: '#9a3412', border: '#ea580c' },
      Rejected: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' }
    };
    const gradeColor = gradeColors[booking.quality_grade] || gradeColors.A;

    const html = `<!DOCTYPE html>
<html lang="mr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>J-Form Receipt | ${booking.token_number} | किसान मंडी</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0fdf4; color: #1a1a1a; }
    .page { max-width: 800px; margin: 20px auto; background: white; border: 3px solid #059669; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }

    /* Header */
    .header { background: linear-gradient(135deg, #065f46, #059669); color: white; padding: 24px 32px; text-align: center; }
    .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .emblem { font-size: 40px; }
    .govt-text { flex: 1; }
    .govt-text h1 { font-size: 18px; font-weight: 800; letter-spacing: 1px; }
    .govt-text h2 { font-size: 14px; font-weight: 600; opacity: 0.9; margin-top: 2px; }
    .title-bar { background: rgba(255,255,255,0.15); border-radius: 8px; padding: 10px 20px; margin-top: 12px; }
    .title-bar h3 { font-size: 20px; font-weight: 800; letter-spacing: 2px; }
    .title-bar p { font-size: 12px; opacity: 0.85; margin-top: 2px; }

    /* Receipt Meta */
    .meta-row { display: flex; justify-content: space-between; background: #ecfdf5; padding: 12px 32px; border-bottom: 2px solid #d1fae5; font-size: 13px; }
    .meta-row strong { color: #065f46; }

    /* Sections */
    .section { padding: 20px 32px; }
    .section-title { font-size: 14px; font-weight: 800; color: #065f46; border-bottom: 2px solid #d1fae5; padding-bottom: 6px; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 1px; }

    /* Two Column Info */
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .info-block { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
    .info-block h4 { font-size: 12px; font-weight: 700; color: #059669; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; border-bottom: 1px dotted #e5e7eb; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #6b7280; font-weight: 600; }
    .info-value { font-weight: 700; color: #1f2937; text-align: right; }

    /* Procurement Table */
    .proc-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .proc-table th { background: #065f46; color: white; padding: 10px 14px; font-size: 12px; text-align: left; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .proc-table td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #e5e7eb; }
    .proc-table tr:nth-child(even) { background: #f0fdf4; }
    .proc-table .amount-cell { font-size: 18px; font-weight: 900; color: #065f46; }

    /* Payment Box */
    .payment-box { background: linear-gradient(135deg, #ecfdf5, #d1fae5); border: 2px solid #059669; border-radius: 10px; padding: 20px; margin-top: 16px; display: flex; justify-content: space-between; align-items: center; }
    .payment-amount { font-size: 32px; font-weight: 900; color: #065f46; }
    .payment-status { padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; }

    /* Footer */
    .footer { background: #f8fafc; border-top: 2px solid #e2e8f0; padding: 16px 32px; text-align: center; font-size: 11px; color: #6b7280; }
    .footer p { margin: 3px 0; }
    .footer .disclaimer { font-weight: 700; color: #059669; margin-top: 8px; }

    /* Print Button */
    .print-bar { text-align: center; padding: 20px; }
    .print-btn { background: linear-gradient(135deg, #065f46, #059669); color: white; border: none; padding: 14px 40px; font-size: 16px; font-weight: 800; border-radius: 10px; cursor: pointer; letter-spacing: 1px; }
    .print-btn:hover { opacity: 0.9; }

    @media print {
      body { background: white; }
      .page { margin: 0; border: none; box-shadow: none; border-radius: 0; }
      .print-bar { display: none !important; }
    }
  </style>
</head>
<body>

  <div class="print-bar">
    <button class="print-btn" onclick="window.print()">🖨️ Print / Download PDF</button>
  </div>

  <div class="page">
    <!-- Government Header -->
    <div class="header">
      <div class="header-top">
        <span class="emblem">🏛️</span>
        <div class="govt-text">
          <h1>महाराष्ट्र शासन — कृषी पणन विभाग</h1>
          <h2>Government of Maharashtra — Agricultural Marketing Department</h2>
        </div>
        <span class="emblem">🌾</span>
      </div>
      <div class="title-bar">
        <h3>जे-फॉर्म / J-FORM</h3>
        <p>विक्री पावती / Farmer Sale Receipt (MSP Procurement)</p>
      </div>
    </div>

    <!-- Receipt Meta -->
    <div class="meta-row">
      <div><strong>पावती क्रमांक / Receipt No:</strong> ${receiptNo}</div>
      <div><strong>टोकन / Token:</strong> ${booking.token_number}</div>
      <div><strong>दिनांक / Date:</strong> ${booking.date}</div>
    </div>

    <!-- Farmer & Bank Details -->
    <div class="section">
      <div class="section-title">शेतकरी व बँक तपशील / Farmer & Bank Details</div>
      <div class="info-grid">
        <div class="info-block">
          <h4>👤 शेतकरी माहिती / Farmer Info</h4>
          <div class="info-row"><span class="info-label">नाव / Name</span><span class="info-value">${booking.farmer_name}</span></div>
          <div class="info-row"><span class="info-label">मोबाइल / Phone</span><span class="info-value">+91 ${booking.farmer_phone}</span></div>
          <div class="info-row"><span class="info-label">गाव / Village</span><span class="info-value">${booking.farmer_village || '---'}</span></div>
          <div class="info-row"><span class="info-label">जिल्हा / District</span><span class="info-value">${booking.farmer_district || '---'}</span></div>
          <div class="info-row"><span class="info-label">आधार (शेवटचे 4)</span><span class="info-value">${booking.aadhaar_last4 ? `XXXX-XXXX-${booking.aadhaar_last4}` : '---'}</span></div>
        </div>
        <div class="info-block">
          <h4>🏦 बँक खाते (DBT) / Bank Account</h4>
          <div class="info-row"><span class="info-label">बँक / Bank</span><span class="info-value">${booking.bank_name || '---'}</span></div>
          <div class="info-row"><span class="info-label">खाते क्र. / Acc No</span><span class="info-value">${maskedAccount}</span></div>
          <div class="info-row"><span class="info-label">IFSC</span><span class="info-value">${booking.bank_ifsc || '---'}</span></div>
          <div class="info-row"><span class="info-label">शाखा / Branch</span><span class="info-value">${booking.bank_branch || '---'}</span></div>
        </div>
      </div>
    </div>

    <!-- Procurement Details -->
    <div class="section">
      <div class="section-title">खरेदी तपशील / Procurement Details</div>
      <table class="proc-table">
        <thead>
          <tr>
            <th>तपशील / Detail</th>
            <th>माहिती / Value</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>खरेदी केंद्र / Centre</td><td><strong>${booking.centre_name}</strong><br/><small>${booking.centre_location || ''}</small></td></tr>
          <tr><td>टोकन क्रमांक / Token</td><td><strong>${booking.token_number}</strong></td></tr>
          <tr><td>दिनांक व वेळ / Date & Time</td><td>${booking.date} — ${booking.start_time} to ${booking.end_time}</td></tr>
          <tr><td>पीक / Commodity</td><td><strong>${booking.commodity}</strong></td></tr>
          <tr><td>अंदाजित वजन / Estimated Qty</td><td>${booking.estimated_quantity_kg} kg</td></tr>
          <tr><td>वजनकाट्यावरील वजन / Gross Weight</td><td><strong>${booking.actual_quantity_kg ? booking.actual_quantity_kg + ' kg' : 'Pending'}</strong></td></tr>
        </tbody>
      </table>
    </div>

    ${booking.quality_grade ? `
    <!-- Quality Inspection Report -->
    <div class="section">
      <div class="section-title">गुणवत्ता तपासणी अहवाल / Quality Inspection Report</div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
        <div style="background: ${gradeColor.bg}; border: 2px solid ${gradeColor.border}; border-radius: 10px; padding: 16px;">
          <div style="font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-bottom: 6px;">गुणवत्ता श्रेणी / Quality Grade</div>
          <div style="font-size: 28px; font-weight: 900; color: ${gradeColor.text}; display: flex; align-items: center;">
            ${booking.quality_grade === 'A' ? '✓' : booking.quality_grade === 'Rejected' ? '✕' : '●'} Grade ${booking.quality_grade}
          </div>
          <div style="font-size: 11px; color: ${gradeColor.text}; margin-top: 4px; font-weight: 600;">
            ${booking.quality_grade === 'A' ? 'FAQ (Fair Average Quality)' :
              booking.quality_grade === 'B' ? '2% Price Deduction' :
              booking.quality_grade === 'C' ? '5% Price Deduction' :
              'Not Acceptable'}
          </div>
        </div>

        <div style="background: #f0f9ff; border: 2px solid #3b82f6; border-radius: 10px; padding: 16px;">
          <div style="font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-bottom: 6px;">आर्द्रता चाचणी / Moisture Test</div>
          <div style="font-size: 18px; font-weight: 900; color: #1e40af;">
            ${booking.actual_moisture_percentage ? parseFloat(booking.actual_moisture_percentage).toFixed(1) + '%' : '---'}
          </div>
          <div style="font-size: 11px; color: #1e40af; margin-top: 4px; font-weight: 600;">
            Max Allowed: ${booking.max_allowed_moisture_percentage ? parseFloat(booking.max_allowed_moisture_percentage).toFixed(1) + '%' : '---'}
            ${booking.moisture_deduction_kg > 0 ? ' • ⚠️ Excess' : ' • ✓ Within Limit'}
          </div>
        </div>
      </div>

      <table class="proc-table">
        <thead>
          <tr>
            <th>गणना तपशील / Calculation Details</th>
            <th>रक्कम / Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>एकूण वजन / Gross Weight</td>
            <td><strong>${booking.actual_quantity_kg ? booking.actual_quantity_kg + ' kg' : '---'}</strong></td>
          </tr>
          ${booking.moisture_deduction_kg > 0 ? `
          <tr style="background: #fef3c7;">
            <td>आर्द्रता वजावट / Moisture Deduction</td>
            <td style="color: #92400e; font-weight: 800;">- ${parseFloat(booking.moisture_deduction_kg).toFixed(2)} kg</td>
          </tr>
          ` : ''}
          <tr>
            <td>निव्वळ वजन / Net Weight</td>
            <td><strong>${booking.net_quantity_kg ? parseFloat(booking.net_quantity_kg).toFixed(2) + ' kg (' + (parseFloat(booking.net_quantity_kg) / 100).toFixed(2) + ' quintal)' : '---'}</strong></td>
          </tr>
          <tr>
            <td>MSP दर / MSP Rate</td>
            <td><strong>${booking.msp_rate ? '₹' + parseFloat(booking.msp_rate).toLocaleString('en-IN') + ' / quintal' : '---'}</strong></td>
          </tr>
          <tr>
            <td>एकूण रक्कम / Gross Amount</td>
            <td><strong>${booking.gross_amount ? '₹' + parseFloat(booking.gross_amount).toLocaleString('en-IN') : '---'}</strong></td>
          </tr>
          ${booking.deduction_amount > 0 ? `
          <tr style="background: #fed7aa;">
            <td>गुणवत्ता वजावट / Quality Deduction (${booking.quality_deduction_percentage}%)</td>
            <td style="color: #9a3412; font-weight: 800;">- ₹${parseFloat(booking.deduction_amount).toLocaleString('en-IN')}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="font-size:14px; font-weight:800; color:#065f46;">निव्वळ देय रक्कम / Net Payable Amount</td>
            <td class="amount-cell">${amountFormatted}</td>
          </tr>
        </tbody>
      </table>

      ${booking.quality_notes ? `
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-top: 12px;">
        <div style="font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-bottom: 4px;">तपासणी टिपा / Inspection Notes</div>
        <div style="font-size: 13px; color: #374151;">${booking.quality_notes}</div>
      </div>
      ` : ''}
    </div>
    ` : `
    <!-- Simple Procurement (No Quality Data) -->
    <div class="section">
      <div class="section-title">खरेदी गणना / Procurement Calculation</div>
      <table class="proc-table">
        <tbody>
          <tr><td>MSP दर / MSP Rate</td><td><strong>${booking.msp_rate ? '₹' + parseFloat(booking.msp_rate).toLocaleString('en-IN') + ' / quintal' : '---'}</strong></td></tr>
          <tr>
            <td style="font-size:14px; font-weight:800; color:#065f46;">एकूण रक्कम / Total Amount</td>
            <td class="amount-cell">${amountFormatted}</td>
          </tr>
        </tbody>
      </table>
    </div>
    `}

    <!-- Payment Status -->
    <div class="section">
      <div class="section-title">देयक स्थिती / Payment Status</div>
      <div class="payment-box">
        <div>
          <div style="font-size:12px; color:#6b7280; font-weight:600;">DBT (Direct Benefit Transfer)</div>
          <div class="payment-amount">${amountFormatted}</div>
          <div style="font-size:12px; color:#6b7280; margin-top:4px;">Ref: ${booking.payment_reference || 'Processing...'}</div>
        </div>
        <div>
          <span class="payment-status" style="background:${paymentStatusColor}20; color:${paymentStatusColor}; border: 2px solid ${paymentStatusColor};">
            ${paymentStatusText}
          </span>
          ${booking.paid_at ? '<div style="font-size:11px; color:#6b7280; margin-top:8px; text-align:right;">Paid: ' + new Date(booking.paid_at).toLocaleDateString('en-IN') + '</div>' : ''}
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>हा दस्तऐवज संगणकीय प्रणालीद्वारे निर्मित आहे. स्वाक्षरीची आवश्यकता नाही.</p>
      <p>This is a computer-generated document. No signature required.</p>
      <p style="margin-top:6px;">Generated: ${generatedAt} IST | System: Kisan Mandi Digital Platform v1.0</p>
      <p class="disclaimer">📞 हेल्पलाइन / Helpline: 1800-180-1551 (Toll Free) | 🌐 kisanmandi.maharashtra.gov.in</p>
    </div>
  </div>

  <div class="print-bar">
    <button class="print-btn" onclick="window.print()">🖨️ Print / Download PDF</button>
  </div>

</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    next(err);
  }
};

module.exports = { generateJForm };
