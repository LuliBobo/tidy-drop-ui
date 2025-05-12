# Deploying DropTidy to Netlify

This document explains how to deploy the DropTidy web application to Netlify, including serverless functions.

## Prerequisites

- A Netlify account
- Git repository with the DropTidy codebase
- Proper configuration in `netlify.toml`

## Automatic Deployment

### Setting Up Continuous Deployment

1. Log in to your Netlify account
2. Click "New site from Git"
3. Select your Git provider (GitHub, GitLab, etc.)
4. Select the DropTidy repository
5. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

### Environment Variables

Set up these environment variables in the Netlify dashboard:

1. Go to Site settings > Build & deploy > Environment
2. Add the following variables:
   - `SENDGRID_API_KEY`: Your SendGrid API key for email functionality
   - `FEEDBACK_EMAIL`: Email address to receive feedback notifications

## Serverless Functions

### Configuration

The serverless functions are configured in `netlify.toml`:

```toml
[build]
  functions = "netlify/functions"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
```

### Deployment

The functions are automatically deployed when you push to the repository. They will be available at:

```
https://your-site-name.netlify.app/.netlify/functions/function-name
```

For example, the feedback function will be at:

```
https://your-site-name.netlify.app/.netlify/functions/feedback
```

### Testing Deployed Functions

You can test the deployed functions using curl or any API testing tool:

```bash
# Test the feedback function
curl -X POST \
  https://your-site-name.netlify.app/.netlify/functions/feedback \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message."
  }'
```

## Function Logs and Monitoring

To view logs for your serverless functions:

1. Go to your Netlify dashboard
2. Select your site
3. Go to Functions
4. Select the function you want to monitor
5. View the logs

## Troubleshooting

### Function Not Found

If you get a 404 error when trying to access your function:

1. Check that the function is properly deployed
2. Ensure the path is correct (should be `/.netlify/functions/function-name`)
3. Verify that the function is exporting a `handler` function

### Function Timeout

If your function times out:

1. Check that the function completes within the allowed time (default is 10 seconds)
2. Consider optimizing the function or increasing the timeout in `netlify.toml`

### CORS Issues

If you're getting CORS errors when calling your function from the frontend:

1. Verify that your function includes the proper CORS headers
2. Ensure that the `Access-Control-Allow-Origin` header is set correctly

## Security Considerations

### Rate Limiting

Consider implementing rate limiting to prevent abuse of your functions. This can be done using third-party services or by implementing a simple rate limiting solution in your function.

### Input Validation

Always validate input data to prevent security issues:

1. Ensure all required fields are present
2. Validate email addresses and other formatted data
3. Sanitize inputs to prevent injection attacks

### Authentication

For protected functions, consider implementing authentication:

1. Add a JWT or API key verification step
2. Use Netlify Identity for user authentication
3. Implement role-based access control if needed
