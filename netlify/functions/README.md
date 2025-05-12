# DropTidy Netlify Serverless Functions

This directory contains serverless functions that run on Netlify for the web version of DropTidy.

## Available Functions

### `feedback.js`

Handles user feedback submissions from the web application.

#### Endpoint

```
POST /.netlify/functions/feedback
```

#### Request Body

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "message": "This is my feedback message",
  "category": "feature" // Optional: "bug", "feature", "question", or "other"
}
```

#### Responses

**Success (200 OK)**
```json
{
  "success": true,
  "message": "Thank you for your feedback! We appreciate your input."
}
```

**Error (400 Bad Request)**
```json
{
  "success": false,
  "error": "Error message explaining the issue"
}
```

## Development

To test these functions locally:

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Start the development server:
```bash
netlify dev
```

3. The functions will be available at `http://localhost:8888/.netlify/functions/[function-name]`

## Deployment

These functions are automatically deployed when the application is deployed to Netlify.

## Environment Variables

The following environment variables are used by the serverless functions:

- `SENDGRID_API_KEY` - API key for SendGrid email service (future integration)
- `FEEDBACK_EMAIL` - Email address to send feedback notifications to (future integration)

## Security Considerations

- Input validation is performed on all requests
- CORS is configured for specific domains in production
- Rate limiting is implemented to prevent abuse (future integration)
