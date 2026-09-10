const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 */
exports.seed = async function (knex) {
  // Clear tables in dependency order
  if (await knex.schema.hasTable('mandi_announcements')) {
    await knex('mandi_announcements').del();
  }
  if (await knex.schema.hasTable('grievances')) {
    await knex('grievances').del();
  }
  if (await knex.schema.hasTable('farmer_land_records')) {
    await knex('farmer_land_records').del();
  }
  await knex('notifications').del();
  await knex('payments').del();
  await knex('bookings').del();
  await knex('time_slots').del();
  await knex('procurement_centres').del();
  await knex('farmers').del();

  // Seed MSP Master Rates
  if (await knex.schema.hasTable('msp_rates')) {
    await knex('msp_rates').del();
    await knex('msp_rates').insert([
      {
        commodity: 'Wheat',
        commodity_marathi: 'गहू',
        msp_rate_per_quintal: 2275.00,
        max_moisture_percentage: 12.0,
        season: 'Rabi 2024-25',
        category: 'Cereal',
      },
      {
        commodity: 'Rice (Paddy)',
        commodity_marathi: 'भात / धान',
        msp_rate_per_quintal: 2183.00,
        max_moisture_percentage: 14.0,
        season: 'Kharif 2024-25',
        category: 'Cereal',
      },
      {
        commodity: 'Mustard',
        commodity_marathi: 'मोहरी',
        msp_rate_per_quintal: 5650.00,
        max_moisture_percentage: 8.0,
        season: 'Rabi 2024-25',
        category: 'Oilseed',
      },
      {
        commodity: 'Maize',
        commodity_marathi: 'मका',
        msp_rate_per_quintal: 2090.00,
        max_moisture_percentage: 14.0,
        season: 'Kharif 2024-25',
        category: 'Coarse Cereal',
      },
      {
        commodity: 'Gram (Chana)',
        commodity_marathi: 'हरभरा / चणा',
        msp_rate_per_quintal: 5440.00,
        max_moisture_percentage: 10.0,
        season: 'Rabi 2024-25',
        category: 'Pulse',
      },
      {
        commodity: 'Soybean',
        commodity_marathi: 'सोयाबीन',
        msp_rate_per_quintal: 4892.00,
        max_moisture_percentage: 12.0,
        season: 'Kharif 2024-25',
        category: 'Oilseed',
      },
      {
        commodity: 'Cotton (Medium Staple)',
        commodity_marathi: 'कापूस',
        msp_rate_per_quintal: 7121.00,
        max_moisture_percentage: 8.0,
        season: 'Kharif 2024-25',
        category: 'Commercial',
      },
    ]);
  }

  const password_hash = await bcrypt.hash('password123', 10);

  // 1. Farmers, Mandi Admin & Super Admin (Maharashtra)
  const [farmer1, farmer2, farmer3, admin, superAdmin] = await knex('farmers')
    .insert([
      {
        name: 'तुकाराम पाटील (Tukaram Patil)',
        phone: '9876543210',
        password_hash,
        aadhaar_last4: '4521',
        village: 'हडपसर (Hadapsar)',
        district: 'Pune',
        state: 'Maharashtra',
        bank_name: 'State Bank of India',
        bank_account_number: '30495812903',
        bank_ifsc: 'SBIN0001245',
        bank_branch: 'Hadapsar Branch',
        role: 'farmer',
      },
      {
        name: 'ज्ञानेश्वर शिंदे (Dnyaneshwar Shinde)',
        phone: '9876543211',
        password_hash,
        aadhaar_last4: '8834',
        village: 'दिंडोरी (Dindori)',
        district: 'Nashik',
        state: 'Maharashtra',
        bank_name: 'Bank of Maharashtra',
        bank_account_number: '60129384756',
        bank_ifsc: 'MAHB0000312',
        bank_branch: 'Dindori Branch',
        role: 'farmer',
      },
      {
        name: 'सुनिता गायकवाड (Sunita Gaikwad)',
        phone: '9876543212',
        password_hash,
        aadhaar_last4: '1902',
        village: 'बारामती (Baramati)',
        district: 'Pune',
        state: 'Maharashtra',
        bank_name: 'HDFC Bank',
        bank_account_number: '50100482910',
        bank_ifsc: 'HDFC0000180',
        bank_branch: 'Baramati Branch',
        role: 'farmer',
      },
      {
        name: 'कृषी उत्पन्न बाजार समिती प्रशासक (APMC Mandi Admin)',
        phone: '9999999999',
        password_hash,
        aadhaar_last4: '0000',
        village: 'गुलटेकडी मार्केट यार्ड',
        district: 'Pune',
        state: 'Maharashtra',
        role: 'admin',
      },
      {
        name: 'जिल्हा कृषी व पणन नियंत्रण अधिकारी (District Nodal Officer / Super Admin)',
        phone: '8888888888',
        password_hash,
        aadhaar_last4: '9999',
        village: 'जिल्हाधिकारी कार्यालय (Collectorate Office)',
        district: 'Pune',
        state: 'Maharashtra',
        role: 'super_admin',
      },
    ])
    .returning('*');

  // 2. Maharashtra Procurement Centres (APMC Mandis)
  const [centre1, centre2, centre3, centre4] = await knex('procurement_centres')
    .insert([
      {
        name: 'पुणे मुख्य कृषी उत्पन्न बाजार समिती (Pune APMC Gultekdi)',
        location: 'गुलटेकडी मार्केट यार्ड, पुणे (Market Yard, Gultekdi, Pune)',
        district: 'Pune',
        state: 'Maharashtra',
        operating_hours: '08:00-17:00',
        max_daily_capacity: 120,
        status: 'active',
        commodities_accepted: JSON.stringify(['Wheat', 'Rice (Paddy)', 'Maize', 'Gram (Chana)', 'Mustard']),
      },
      {
        name: 'नाशिक कृषी खरेदी केंद्र (Nashik Main Mandi)',
        location: 'दिंडोरी रोड, पंचवटी, नाशिक (Dindori Road, Panchavati, Nashik)',
        district: 'Nashik',
        state: 'Maharashtra',
        operating_hours: '08:30-16:30',
        max_daily_capacity: 100,
        status: 'active',
        commodities_accepted: JSON.stringify(['Wheat', 'Gram (Chana)', 'Maize', 'Mustard']),
      },
      {
        name: 'बारामती शासकीय धान्य खरेदी केंद्र (Baramati Mandi)',
        location: 'इंदापूर रोड, बारामती (Indapur Road, Baramati)',
        district: 'Pune',
        state: 'Maharashtra',
        operating_hours: '09:00-17:00',
        max_daily_capacity: 80,
        status: 'active',
        commodities_accepted: JSON.stringify(['Wheat', 'Gram (Chana)', 'Maize']),
      },
      {
        name: 'छत्रपती संभाजीनगर खरेदी केंद्र (Sambhaji Nagar APMC)',
        location: 'जालना रोड, जाधववाडी (Jalna Road, Jadhavwadi)',
        district: 'Chhatrapati Sambhaji Nagar',
        state: 'Maharashtra',
        operating_hours: '08:00-16:00',
        max_daily_capacity: 90,
        status: 'active',
        commodities_accepted: JSON.stringify(['Wheat', 'Rice (Paddy)', 'Gram (Chana)']),
      },
    ])
    .returning('*');

  // 3. Time Slots for Today + Next 6 Days (always fresh on re-seed)
  const slotDays = [];
  for (let i = 0; i < 7; i++) {
    slotDays.push(new Date(Date.now() + i * 86400000).toISOString().split('T')[0]);
  }
  const today = slotDays[0];
  const tomorrow = slotDays[1];

  const slotRows = [];
  // Each centre gets slots for the next 7 days
  const centreSlotTemplates = [
    { centre: centre1, templates: [
      { start_time: '08:00', end_time: '10:00', max_farmers: 20 },
      { start_time: '10:00', end_time: '12:00', max_farmers: 20 },
      { start_time: '13:00', end_time: '15:00', max_farmers: 20 },
    ]},
    { centre: centre2, templates: [
      { start_time: '09:00', end_time: '11:00', max_farmers: 15 },
      { start_time: '11:30', end_time: '13:30', max_farmers: 15 },
    ]},
    { centre: centre3, templates: [
      { start_time: '09:00', end_time: '12:00', max_farmers: 25 },
    ]},
    { centre: centre4, templates: [
      { start_time: '08:00', end_time: '10:30', max_farmers: 18 },
      { start_time: '11:00', end_time: '14:00', max_farmers: 18 },
    ]},
  ];

  centreSlotTemplates.forEach(({ centre, templates }) => {
    slotDays.forEach((date) => {
      templates.forEach((tmpl) => {
        slotRows.push({
          centre_id: centre.id,
          date,
          start_time: tmpl.start_time,
          end_time: tmpl.end_time,
          max_farmers: tmpl.max_farmers,
          booked_count: 0,
          status: 'available',
        });
      });
    });
  });

  // Mark a couple of today's Pune slots with existing bookings for demo
  slotRows[0].booked_count = 2; // today 08:00-10:00 Pune
  slotRows[1].booked_count = 1; // today 10:00-12:00 Pune

  const slots = await knex('time_slots').insert(slotRows).returning('*');

  // 4. Sample Bookings with AI Quality Grading & Priority
  const [booking1, booking2, booking3] = await knex('bookings')
    .insert([
      {
        farmer_id: farmer1.id,
        slot_id: slots[0].id,
        token_number: 'KM-0001',
        commodity: 'Wheat',
        estimated_quantity_kg: 2500,
        status: 'in_progress',
        queue_position: 1,
        priority_level: 'express_grade_a',
        priority_weight: 2,
        quality_grade: 'Grade A (Premium)',
        quality_score: 95,
        quality_metrics: JSON.stringify({
          broken_grains_pct: 1.2,
          foreign_matter_pct: 0.3,
          moisture_est_pct: 10.4,
          uniformity_pct: 97,
        }),
        priority_reason: 'AI Pre-Scan: Grade A Premium Grain (10.4% Moisture, 97% Uniformity)',
        checked_in_at: knex.fn.now(),
      },
      {
        farmer_id: farmer2.id,
        slot_id: slots[0].id,
        token_number: 'KM-0002',
        commodity: 'Gram (Chana)',
        estimated_quantity_kg: 1800,
        status: 'checked_in',
        queue_position: 2,
        priority_level: 'standard',
        priority_weight: 0,
        quality_grade: 'Grade B (Standard FAQ)',
        quality_score: 82,
        quality_metrics: JSON.stringify({
          broken_grains_pct: 2.8,
          foreign_matter_pct: 1.1,
          moisture_est_pct: 11.8,
          uniformity_pct: 85,
        }),
        priority_reason: 'Standard Mandi Queue',
        checked_in_at: knex.fn.now(),
      },
      {
        farmer_id: farmer3.id,
        slot_id: slots[1].id,
        token_number: 'KM-0003',
        commodity: 'Rice (Paddy)',
        estimated_quantity_kg: 4000,
        status: 'booked',
        queue_position: 1,
        priority_level: 'standard',
        priority_weight: 0,
        quality_grade: null,
        quality_score: null,
        priority_reason: 'Standard Mandi Queue',
      },
    ])
    .returning('*');

  // 5. Payments
  await knex('payments').insert([
    {
      booking_id: booking1.id,
      amount: 56875.0, // 25 quintal * 2275 MSP
      msp_rate: 2275.0, // Rs/quintal for Wheat
      actual_quantity_kg: 2500,
      status: 'processing',
    },
    {
      booking_id: booking2.id,
      msp_rate: 5440.0, // Chana MSP
      status: 'pending',
    },
    {
      booking_id: booking3.id,
      msp_rate: 2183.0, // Paddy MSP
      status: 'pending',
    },
  ]);

  // 6. 7/12 Land Records
  if (await knex.schema.hasTable('farmer_land_records')) {
    await knex('farmer_land_records').insert([
      {
        farmer_id: farmer1.id,
        survey_number: 'Gat-412/1A',
        village: 'हडपसर (Hadapsar)',
        taluka: 'हवेली (Haveli)',
        district: 'Pune',
        total_land_acres: 6.0,
        cultivated_area_acres: 4.5,
        crop_sown: 'Wheat',
        season: 'Rabi 2024-25',
        verification_status: 'verified',
        verified_by: 'MahaBhumi Digital 7/12 Portal',
      },
      {
        farmer_id: farmer1.id,
        survey_number: 'Gat-208/3B',
        village: 'हडपसर (Hadapsar)',
        taluka: 'हवेली (Haveli)',
        district: 'Pune',
        total_land_acres: 3.5,
        cultivated_area_acres: 2.5,
        crop_sown: 'Gram (Chana)',
        season: 'Rabi 2024-25',
        verification_status: 'verified',
        verified_by: 'MahaBhumi Digital 7/12 Portal',
      },
      {
        farmer_id: farmer2.id,
        survey_number: 'Gat-105/2',
        village: 'दिंडोरी (Dindori)',
        taluka: 'दिंडोरी (Dindori)',
        district: 'Nashik',
        total_land_acres: 5.0,
        cultivated_area_acres: 3.8,
        crop_sown: 'Gram (Chana)',
        season: 'Rabi 2024-25',
        verification_status: 'verified',
        verified_by: 'MahaBhumi Digital 7/12 Portal',
      },
    ]);
  }

  // 7. Grievances (Including a direct report against mandi to Super Admin)
  if (await knex.schema.hasTable('grievances')) {
    await knex('grievances').insert([
      {
        ticket_number: 'GRV-MH-2024-8102',
        farmer_id: farmer1.id,
        booking_id: booking1.id,
        centre_id: centre1.id,
        category: 'payment_delay',
        subject: 'DBT Payment pending for Wheat procurement',
        description: 'Completed sale of 25 quintal wheat 4 days ago. DBT payment status still in processing.',
        priority: 'medium',
        status: 'open',
        target_authority: 'mandi_admin',
        is_against_mandi: false,
      },
      {
        ticket_number: 'VIG-MH-2024-9941',
        farmer_id: farmer2.id,
        booking_id: booking2.id,
        centre_id: centre2.id,
        category: 'weight_dispute',
        subject: 'Mandi weighbridge showing 200kg less than certified weight',
        description: 'At Nashik Mandi gate, private weighbridge weighed trolley at 3800kg tare-gross. Mandi electronic scale recorded only 3600kg. Reporting directly to District Nodal Officer for official scale calibration audit.',
        priority: 'urgent',
        status: 'open',
        target_authority: 'super_admin',
        is_against_mandi: true,
      },
    ]);
  }

  // 8. Mandi Announcements & Live Updates
  if (await knex.schema.hasTable('mandi_announcements')) {
    await knex('mandi_announcements').insert([
      {
        title: 'Central Government Announces MSP Revision for Rabi Season 2024-25',
        title_marathi: 'रब्बी हंगाम २०२४-२५ साठी केंद्र सरकारकडून हमीभावात वाढ जाहीर',
        content: 'Wheat MSP raised to ₹2,275/quintal (+₹150 increase). Gram (Chana) MSP increased to ₹5,440/quintal. Direct Benefit Transfer (DBT) transfers will be credited within 48-72 hours of J-Form generation.',
        content_marathi: 'गव्हाचा हमीभाव ₹२,२७५ प्रति क्विंटल (+₹१५० वाढ). हरभरा हमीभाव ₹५,४४० प्रति क्विंटल. जे-फॉर्म तयार झाल्यानंतर ४८ ते ७२ तासांत थेट बँक खात्यात (DBT) रक्कम जमा केली जाईल.',
        category: 'msp_update',
        priority: 'alert',
        is_active: true,
        created_by: 'Directorate of Marketing & APMC Board',
      },
      {
        title: 'Agricultural Weather Alert: Heavy Rainfall Expected in Western Maharashtra',
        title_marathi: 'कृषी हवामान इशारा: पश्चिम महाराष्ट्रात अवकाळी पावसाची शक्यता',
        content: 'IMD predicts unseasonal rain in Pune, Satara, and Nashik districts over next 48 hours. Farmers are advised to cover open harvested crops with tarpaulins and bring grain dry to procurement centres to prevent moisture deduction cuts.',
        content_marathi: 'पुणे, सातारा आणि नाशिक जिल्ह्यांमध्ये पुढील ४८ तासांत अवकाळी पावसाचा अंदाज. शेतकऱ्यांनी कापणी केलेले धान्य ताडपत्रीने झाकून ठेवावे आणि ओलावा कपात टाळण्यासाठी कोरडे धान्य खरेदी केंद्रात आणावे.',
        category: 'weather_advisory',
        priority: 'urgent',
        is_active: true,
        created_by: 'State Agricultural Weather Cell',
      },
      {
        title: 'PM-AASHA Price Support Scheme 100% Procurement Registration Open',
        title_marathi: 'पीएम-आशा (PM-AASHA) मूल्य समर्थन योजनेअंतर्गत १००% खरेदी नोंदणी सुरू',
        content: 'Government has removed 25% ceiling under PM-AASHA scheme for Tur, Urad, and Masur pulses. Farmers with verified 7/12 land records can book unlimited eligible yield quotas without deduction.',
        content_marathi: 'तूर, उडीद आणि मसूर डाळींसाठी केंद्र सरकारने २५% खरेदी मर्यादा रद्द केली आहे. ७/१२ नोंद असलेल्या शेतकऱ्यांना संपूर्ण उत्पादनावर हमीभाव खरेदीचा लाभ मिळेल.',
        category: 'gov_scheme',
        priority: 'normal',
        is_active: true,
        created_by: 'Ministry of Agriculture & Farmers Welfare',
      },
      {
        title: 'Nashik & Pune Mandis: Extended Procurement Gate Timings from Monday',
        title_marathi: 'नाशिक व पुणे खरेदी केंद्र: सोमवारपासून खरेदी वेळेत वाढ',
        content: 'Due to peak Rabi harvest arrivals, Pune Gultekdi and Nashik Mandis will operate from 07:30 AM to 06:30 PM with 4 electronic weighbridges active simultaneously.',
        content_marathi: 'रब्बी हंगामाची वाढती आवक पाहता पुणे गुलटेकडी व नाशिक केंद्रात सकाळी ०७:३० ते सायंकाळी ०६:३० या वेळेत खरेदी सुरू राहील. ४ वजनकाटे एकाच वेळी कार्यरत राहतील.',
        category: 'mandi_notice',
        priority: 'normal',
        is_active: true,
        created_by: 'District Mandi Administrator',
      },
    ]);
  }

  console.log('✅ Maharashtra APMC Mandi seed data inserted successfully!');
};
