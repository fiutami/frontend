export const environment = {
  production: false,
  environmentName: 'stage',
  // Backend API via nginx reverse proxy (same-origin, no CORS needed)
  apiUrl: '/api',
  oauth: {
    google: {
      clientId: '384947883378-eghthqhqvoau0m0ubqstvr9baq0pbtbb.apps.googleusercontent.com'
    },
    facebook: {
      appId: 'YOUR_FACEBOOK_APP_ID'  // TODO: Configure real Facebook App ID
    }
  }
};
