// No secrets here: the database rules deny all client writes (only the n8n
// service account writes), and the webhook is rate-limited at the proxy.
export const environment = {
  production: true,
  /** Firebase Realtime Database base URL – recipes are stored here by the n8n workflow. */
  firebaseUrl: 'https://code-a-cuisine-4b8a6-default-rtdb.europe-west1.firebasedatabase.app',
  /** n8n webhook that generates recipe suggestions. */
  n8nWebhookUrl: 'https://flow.uniquehomebase.de/webhook/generate-recipe',
  /** n8n webhook returning how many generations the caller's IP has left today. */
  n8nQuotaUrl: 'https://flow.uniquehomebase.de/webhook/quota',
};
