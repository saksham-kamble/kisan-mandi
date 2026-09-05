import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Navbar
    nav: {
      appName: 'Kisan Mandi',
      bookSlot: 'Book Slot',
      mySlots: 'My Slots',
      liveQueue: 'Live Queue',
      payments: 'Payments',
      landRecords: '7/12 Land',
      helpdesk: 'Helpdesk & Grievance',
      adminPanel: 'Admin Panel',
      superAdmin: 'Super Admin',
      profile: 'Profile & DBT Bank',
      updates: 'Live Updates',
      login: 'Login',
      register: 'Register as Farmer',
      logout: 'Logout',
    },

    // Home Page
    home: {
      hero: {
        welcome: 'Welcome to',
        appName: 'Kisan Mandi',
        tagline: 'Smart procurement platform for farmers. Book slots, track queue live, and get paid faster.',
        bookNow: 'Book Your Slot Now',
        registerFarmer: 'Register as Farmer',
      },
      features: {
        title: 'Why Kisan Mandi?',
        bookOnline: 'Book Slots Online',
        bookOnlineDesc: 'Reserve your time slot in advance. No more long waiting at mandis.',
        liveTracking: 'Live Queue Tracking',
        liveTrackingDesc: 'Track your position in real-time. Know exactly when it\'s your turn.',
        fastPayments: 'Fast Payments',
        fastPaymentsDesc: 'Track payment status and get MSP payments processed quickly.',
        transparent: 'Transparent Process',
        transparentDesc: 'See all your bookings, tokens, and payment history in one place.',
      },
      howItWorks: {
        title: 'How It Works',
        step1: 'Register',
        step1Desc: 'Sign up with your mobile number',
        step2: 'Book Slot',
        step2Desc: 'Choose procurement centre, date, and time slot',
        step3: 'Get Token',
        step3Desc: 'Receive your unique token number',
        step4: 'Track Queue',
        step4Desc: 'Watch live queue updates from home',
        step5: 'Arrive & Sell',
        step5Desc: 'Arrive at your slot time and sell your crop',
        step6: 'Get Paid',
        step6Desc: 'Track payment status and receive MSP',
      },
      welcome: {
        greeting: 'Welcome',
        viewBookings: 'View My Bookings',
        readyToBook: 'Ready to book your first slot?',
      },
    },

    // Book Slot Page
    bookSlot: {
      title: 'Book Your Slot',
      step1: 'Select Procurement Centre',
      step2: 'Select Time Slot',
      step3: 'Crop Details',
      noSlots: 'No slots available for this centre.',
      operatingHours: 'Operating Hours',
      farmersBooked: 'farmers booked',
      available: 'Available',
      full: 'FULL',
      closed: 'CLOSED',
      commodity: 'Commodity',
      estimatedQuantity: 'Estimated Quantity (kg)',
      quantityPlaceholder: 'e.g. 2500',
      confirmBooking: 'Confirm Booking',
      booking: 'Booking...',
      selectSlot: 'Please select a time slot',
      bookingSuccess: 'Slot booked! Your token:',
      bookingFailed: 'Booking failed',
      commodities: {
        wheat: 'Wheat',
        rice: 'Rice (Paddy)',
        mustard: 'Mustard',
        maize: 'Maize',
        gram: 'Gram (Chana)',
      },
    },

    // Live Queue Page
    liveQueue: {
      title: 'Live Queue Display',
      subtitle: 'Real-time status updates from procurement centres',
      nowServing: 'Now Serving',
      inQueue: 'In Queue',
      completedToday: 'Completed Today',
      totalBookings: 'Total Bookings',
      farmersWaiting: 'Farmers waiting',
      procurementsDone: 'Procurements done',
      scheduledToday: 'Scheduled today',
      centreReady: 'Centre ready',
      nextUp: 'Next Up in Queue',
      noMoreFarmers: 'No more farmers in queue.',
      noCompleted: 'No completed procurements yet.',
      checkedIn: 'Checked In',
      booked: 'Booked',
      noFarmerServing: 'No farmer currently being served',
    },

    // My Bookings Page
    myBookings: {
      title: 'My Bookings',
      noBookings: 'You have no bookings yet.',
      bookNow: 'Book a Slot',
      token: 'Token',
      status: 'Status',
      centre: 'Centre',
      date: 'Date',
      time: 'Time',
      commodity: 'Commodity',
      quantity: 'Quantity',
      payment: 'Payment',
      cancel: 'Cancel Booking',
      cancelling: 'Cancelling...',
      viewDetails: 'View Details',
      statuses: {
        booked: 'Booked',
        checked_in: 'Checked In',
        in_progress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
      },
    },

    // Payment Page
    payments: {
      title: 'Payment Tracking',
      noPayments: 'No payment records found.',
      token: 'Token',
      commodity: 'Commodity',
      weight: 'Actual Weight',
      mspRate: 'MSP Rate',
      amount: 'Amount',
      status: 'Status',
      paidOn: 'Paid On',
      reference: 'Reference',
      statuses: {
        pending: 'Pending',
        processing: 'Processing',
        paid: 'Paid',
        failed: 'Failed',
      },
    },

    // Auth Pages
    auth: {
      loginTitle: 'Login to Kisan Mandi',
      loginSubtitle: 'Access your bookings and manage procurement',
      registerTitle: 'Register as Farmer',
      registerSubtitle: 'Join thousands of farmers using Kisan Mandi',
      mobileNumber: 'Mobile Number',
      mobilePlaceholder: '10-digit mobile number',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      fullName: 'Full Name',
      namePlaceholder: 'Your full name',
      village: 'Village',
      villagePlaceholder: 'Your village name',
      district: 'District',
      districtPlaceholder: 'Your district',
      state: 'State',
      aadhaar: 'Aadhaar (Last 4 digits)',
      aadhaarPlaceholder: 'Last 4 digits only',
      loginButton: 'Login',
      registerButton: 'Register',
      loggingIn: 'Logging in...',
      registering: 'Registering...',
      newFarmer: 'New farmer?',
      registerHere: 'Register here',
      alreadyRegistered: 'Already registered?',
      loginHere: 'Login here',
      demoCredentials: 'Demo Credentials',
      farmer: 'Farmer',
      admin: 'Admin',
      superAdmin: 'District Super Admin',
    },

    // Common
    common: {
      loading: 'Loading...',
      save: 'Save Changes',
      cancel: 'Cancel',
      confirm: 'Confirm',
      kg: 'kg',
      rs: '₹',
      perQuintal: 'per quintal',
    },
  },

  mr: {
    // Navbar - मराठी
    nav: {
      appName: 'किसान मंडी',
      bookSlot: 'स्लॉट बुक करा',
      mySlots: 'माझे स्लॉट',
      liveQueue: 'लाइव्ह रांग',
      payments: 'देयके',
      landRecords: '७/१२ उतारा',
      helpdesk: 'तक्रार निवारण',
      adminPanel: 'प्रशासन पॅनेल',
      superAdmin: 'जिल्हा नियंत्रण',
      profile: 'प्रोफाईल व बँक खाते',
      updates: 'थेट सूचना',
      login: 'लॉगिन',
      register: 'शेतकरी नोंदणी',
      logout: 'लॉगआउट',
    },

    // Home Page - मराठी
    home: {
      hero: {
        welcome: 'स्वागत आहे',
        appName: 'किसान मंडी',
        tagline: 'शेतकऱ्यांसाठी स्मार्ट खरेदी व्यासपीठ. स्लॉट बुक करा, रांग लाइव्ह ट्रॅक करा आणि लवकर पैसे मिळवा.',
        bookNow: 'आत्ताच स्लॉट बुक करा',
        registerFarmer: 'शेतकरी नोंदणी',
      },
      features: {
        title: 'किसान मंडी का?',
        bookOnline: 'ऑनलाइन स्लॉट बुक करा',
        bookOnlineDesc: 'आगाऊच आपला वेळ राखून घ्या. मंडीत लांब प्रतीक्षा नाही.',
        liveTracking: 'लाइव्ह रांग ट्रॅकिंग',
        liveTrackingDesc: 'आपली स्थिती रिअल-टाइम ट्रॅक करा. आपली पाळी केव्हा येईल हे जाणून घ्या.',
        fastPayments: 'जलद देयके',
        fastPaymentsDesc: 'देयक स्थिती ट्रॅक करा आणि MSP देयके लवकर मिळवा.',
        transparent: 'पारदर्शक प्रक्रिया',
        transparentDesc: 'आपल्या सर्व बुकिंग, टोकन आणि देयक इतिहास एका ठिकाणी पहा.',
      },
      howItWorks: {
        title: 'हे कसे काम करते',
        step1: 'नोंदणी करा',
        step1Desc: 'आपल्या मोबाइल नंबरसह साइन अप करा',
        step2: 'स्लॉट बुक करा',
        step2Desc: 'खरेदी केंद्र, तारीख आणि वेळ निवडा',
        step3: 'टोकन मिळवा',
        step3Desc: 'आपला अनन्य टोकन नंबर प्राप्त करा',
        step4: 'रांग ट्रॅक करा',
        step4Desc: 'घरून लाइव्ह रांग अपडेट पहा',
        step5: 'येऊन विक्री करा',
        step5Desc: 'आपल्या स्लॉट वेळी येऊन पीक विका',
        step6: 'पैसे मिळवा',
        step6Desc: 'देयक स्थिती ट्रॅक करा आणि MSP मिळवा',
      },
      welcome: {
        greeting: 'स्वागत आहे',
        viewBookings: 'माझे बुकिंग पहा',
        readyToBook: 'आपले पहिले स्लॉट बुक करायला तयार आहात?',
      },
    },

    // Book Slot Page - मराठी
    bookSlot: {
      title: 'आपले स्लॉट बुक करा',
      step1: 'खरेदी केंद्र निवडा',
      step2: 'वेळेचा स्लॉट निवडा',
      step3: 'पिकाचा तपशील',
      noSlots: 'या केंद्रासाठी स्लॉट उपलब्ध नाहीत.',
      operatingHours: 'कार्य वेळ',
      farmersBooked: 'शेतकरी बुक केले',
      available: 'उपलब्ध',
      full: 'भरले',
      closed: 'बंद',
      commodity: 'पीक',
      estimatedQuantity: 'अंदाजे प्रमाण (किलो)',
      quantityPlaceholder: 'उदा. 2500',
      confirmBooking: 'बुकिंग निश्चित करा',
      booking: 'बुक करत आहे...',
      selectSlot: 'कृपया वेळेचा स्लॉट निवडा',
      bookingSuccess: 'स्लॉट बुक झाले! आपला टोकन:',
      bookingFailed: 'बुकिंग अयशस्वी',
      commodities: {
        wheat: 'गहू',
        rice: 'भात (धान)',
        mustard: 'मोहरी',
        maize: 'मका',
        gram: 'हरभरा (चणा)',
      },
    },

    // Live Queue Page - मराठी
    liveQueue: {
      title: 'लाइव्ह रांग डिस्प्ले',
      subtitle: 'खरेदी केंद्रांकडून रिअल-टाइम स्थिती अपडेट',
      nowServing: 'आता सेवा देत आहे',
      inQueue: 'रांगेत',
      completedToday: 'आज पूर्ण झाले',
      totalBookings: 'एकूण बुकिंग',
      farmersWaiting: 'शेतकरी प्रतीक्षा करत आहेत',
      procurementsDone: 'खरेदी पूर्ण झाली',
      scheduledToday: 'आज शेड्यूल केलेले',
      centreReady: 'केंद्र तयार आहे',
      nextUp: 'रांगेत पुढे',
      noMoreFarmers: 'रांगेत आणखी शेतकरी नाहीत.',
      noCompleted: 'अद्याप कोणतीही पूर्ण खरेदी नाही.',
      checkedIn: 'चेक-इन केले',
      booked: 'बुक केले',
      noFarmerServing: 'सध्या कोणत्याही शेतकऱ्याची सेवा केली जात नाही',
    },

    // My Bookings Page - मराठी
    myBookings: {
      title: 'माझे बुकिंग',
      noBookings: 'तुमच्याकडे अद्याप कोणतेही बुकिंग नाही.',
      bookNow: 'स्लॉट बुक करा',
      token: 'टोकन',
      status: 'स्थिती',
      centre: 'केंद्र',
      date: 'तारीख',
      time: 'वेळ',
      commodity: 'पीक',
      quantity: 'प्रमाण',
      payment: 'देयक',
      cancel: 'बुकिंग रद्द करा',
      cancelling: 'रद्द करत आहे...',
      viewDetails: 'तपशील पहा',
      statuses: {
        booked: 'बुक केले',
        checked_in: 'चेक-इन केले',
        in_progress: 'प्रगतीपथावर',
        completed: 'पूर्ण झाले',
        cancelled: 'रद्द केले',
      },
    },

    // Payment Page - मराठी
    payments: {
      title: 'देयक ट्रॅकिंग',
      noPayments: 'कोणतेही देयक रेकॉर्ड आढळले नाहीत.',
      token: 'टोकन',
      commodity: 'पीक',
      weight: 'खरे वजन',
      mspRate: 'MSP दर',
      amount: 'रक्कम',
      status: 'स्थिती',
      paidOn: 'दिनांक',
      reference: 'संदर्भ',
      statuses: {
        pending: 'प्रलंबित',
        processing: 'प्रक्रिया सुरू',
        paid: 'भरले',
        failed: 'अयशस्वी',
      },
    },

    // Auth Pages - मराठी
    auth: {
      loginTitle: 'किसान मंडी मध्ये लॉगिन करा',
      loginSubtitle: 'आपल्या बुकिंगमध्ये प्रवेश करा आणि खरेदी व्यवस्थापित करा',
      registerTitle: 'शेतकरी म्हणून नोंदणी करा',
      registerSubtitle: 'किसान मंडी वापरणाऱ्या हजारो शेतकऱ्यांमध्ये सामील व्हा',
      mobileNumber: 'मोबाइल नंबर',
      mobilePlaceholder: '10-अंकी मोबाइल नंबर',
      password: 'पासवर्ड',
      passwordPlaceholder: 'आपला पासवर्ड टाका',
      fullName: 'पूर्ण नाव',
      namePlaceholder: 'आपले पूर्ण नाव',
      village: 'गाव',
      villagePlaceholder: 'आपल्या गावाचे नाव',
      district: 'जिल्हा',
      districtPlaceholder: 'आपला जिल्हा',
      state: 'राज्य',
      aadhaar: 'आधार (शेवटचे 4 अंक)',
      aadhaarPlaceholder: 'फक्त शेवटचे 4 अंक',
      loginButton: 'लॉगिन',
      registerButton: 'नोंदणी',
      loggingIn: 'लॉगिन करत आहे...',
      registering: 'नोंदणी करत आहे...',
      newFarmer: 'नवीन शेतकरी?',
      registerHere: 'येथे नोंदणी करा',
      alreadyRegistered: 'आधीच नोंदणी केली आहे?',
      loginHere: 'येथे लॉगिन करा',
      demoCredentials: 'डेमो क्रेडेन्शियल्स',
      farmer: 'शेतकरी',
      admin: 'मंडी अधिकारी',
      superAdmin: 'जिल्हा नियंत्रण अधिकारी',
    },

    // Common - मराठी
    common: {
      loading: 'लोड होत आहे...',
      save: 'बदल जतन करा',
      cancel: 'रद्द करा',
      confirm: 'निश्चित करा',
      kg: 'किलो',
      rs: '₹',
      perQuintal: 'प्रति क्विंटल',
    },
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('kisanMandiLanguage') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('kisanMandiLanguage', language);
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation missing for key: ${key} in language: ${language}`);
        return key;
      }
    }

    return value;
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'mr' : 'en'));
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    isMarathi: language === 'mr',
    isEnglish: language === 'en',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
