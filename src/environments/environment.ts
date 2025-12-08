export const environment = {
  production: false,
  // Use proxy to avoid CORS issues in development
  apiUrl: '/api',
  oauth: {
    google: {
      clientId: '384947883378-eghthqhqvoau0m0ubqstvr9baq0pbtbb.apps.googleusercontent.com'
    },
    facebook: {
      appId: 'YOUR_FACEBOOK_APP_ID'
    }
  }
};
