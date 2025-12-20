export const environment = {
  production: false,
  // Use proxy to avoid CORS issues in development
  apiUrl: '/api',
  // App base URL for sharing/invites
  appUrl: 'https://fiutami.pet',
  // Legal pages URLs
  legalUrls: {
    terms: 'https://fiutami.pet/terms',
    privacy: 'https://fiutami.pet/privacy'
  },
  // OAuth configuration
  oauth: {
    google: {
      clientId: '384947883378-eghthqhqvoau0m0ubqstvr9baq0pbtbb.apps.googleusercontent.com'
    },
    facebook: {
      appId: 'YOUR_FACEBOOK_APP_ID'
    }
  }
};
