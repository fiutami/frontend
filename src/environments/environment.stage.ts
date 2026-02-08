export const environment = {
  production: false,
  environmentName: 'stage',
  // Backend API via nginx reverse proxy (same-origin, no CORS needed)
  apiUrl: '/api',
  // App base URL for sharing/invites
  appUrl: 'https://stage.fiutami.pet',
  // Legal pages URLs
  legalUrls: {
    terms: 'https://fiutami.pet/terms',
    privacy: 'https://fiutami.pet/privacy'
  },
  oauth: {
    google: {
      clientId: '384947883378-eghthqhqvoau0m0ubqstvr9baq0pbtbb.apps.googleusercontent.com'
    },
    facebook: {
      appId: 'YOUR_FACEBOOK_APP_ID'  // TODO: Configure real Facebook App ID
    }
  },
  clipdropApiKey: '${CLIPDROP_API_KEY}'
};
