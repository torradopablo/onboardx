export const PLATFORMS = {
  google_ads: {
    name: 'Google Ads',
    description: 'Grant access to your Google Ads account',
    icon: '📊',
  },
  meta_ads: {
    name: 'Meta Ads',
    description: 'Grant access to your Meta Business account',
    icon: '📱',
  },
  ga4: {
    name: 'Google Analytics 4',
    description: 'Grant access to your GA4 property',
    icon: '📈',
  },
  gtm: {
    name: 'Google Tag Manager',
    description: 'Grant access to your GTM container',
    icon: '🏷️',
  },
};

export const PLATFORM_INSTRUCTIONS = {
  google_ads: `
    1. Go to Google Ads: https://ads.google.com
    2. Click on the gear icon → Admin
    3. Click on "Users and permissions"
    4. Click the + button to add a new user
    5. Enter the agency email: [AGENCY_EMAIL]
    6. Grant "Admin" access
    7. Click "Invite"
  `,
  meta_ads: `
    1. Go to Meta Business Suite: https://business.facebook.com
    2. Click Settings (bottom left)
    3. Click "Users and Assets"
    4. Click "Users"
    5. Click "Add"
    6. Search for the agency email: [AGENCY_EMAIL]
    7. Grant "Admin" role
    8. Click "Confirm"
  `,
  ga4: `
    1. Go to Google Analytics: https://analytics.google.com
    2. Click Admin (gear icon, bottom left)
    3. Under "Account", click "Account Access Management"
    4. Click the + button
    5. Enter agency email: [AGENCY_EMAIL]
    6. Give "Editor" role
    7. Click "Invite"
  `,
  gtm: `
    1. Go to Google Tag Manager: https://tagmanager.google.com
    2. Select your account
    3. Click Admin
    4. Click "Users" tab
    5. Click "Add User"
    6. Enter agency email: [AGENCY_EMAIL]
    7. Check "Manage Users and Permissions" and "Edit"
    8. Click "Save"
  `,
};

export const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    price_monthly: 29,
    price_yearly: 290,
    max_projects: 10,
    features: [
      'Up to 10 active onboardings',
      'All platform integrations',
      'Email notifications',
      'Basic analytics',
    ],
  },
  pro: {
    name: 'Pro',
    price_monthly: 79,
    price_yearly: 790,
    max_projects: 50,
    features: [
      'Up to 50 active onboardings',
      'All platform integrations',
      'Email notifications',
      'Advanced analytics',
      'Priority support',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price_monthly: 199,
    price_yearly: 1990,
    max_projects: -1,
    features: [
      'Unlimited active onboardings',
      'All platform integrations',
      'Email notifications',
      'Advanced analytics',
      'Priority support',
      'Custom integrations',
    ],
  },
};
