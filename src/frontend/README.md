# Email Manager Frontend

A vanilla HTML/CSS/JavaScript application for sending emails using Azure Communication Services API.

## Features

- ✉️ **Send Emails**: Compose and send emails with a rich text editor
- 📋 **Message History**: View all sent messages stored locally
- 📊 **Status Tracking**: Check the delivery status of sent emails
- 🎨 **Material Design**: Clean and modern UI using Material CSS
- 📝 **Rich Text Editor**: Quill.js editor for formatted email content

## Tech Stack

- **HTML5**: Semantic markup
- **CSS3**: Material Design CSS (Materialize)
- **JavaScript**: Vanilla ES6+
- **Quill.js**: Rich text editor
- **LocalStorage**: Client-side message history

## Setup

### Prerequisites

Make sure your backend API is running on `http://localhost:3000`

### Running the Frontend

1. Open `index.html` in your web browser, or
2. Use a simple HTTP server:

#### Using Python:
```bash
python -m http.server 8080
```

#### Using Node.js (http-server):
```bash
npx http-server -p 8080
```

#### Using VS Code:
Install the "Live Server" extension and right-click on `index.html` → "Open with Live Server"

3. Navigate to `http://localhost:8080` (or the appropriate port)

## Configuration

The API base URL is configured in `app.js`:

```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

Update this if your backend runs on a different host or port.

## Usage

### Sending an Email

1. Click on **"Send Email"** in the top navigation
2. Fill in:
   - Your email address (from)
   - Recipient email address (to)
   - Subject
   - Message content using the rich text editor
3. Click **"Send Email"** button
4. You'll see a success toast notification when the email is sent

### Viewing Message History

1. Click on **"Message History"** in the top navigation
2. All sent messages are displayed with:
   - Message ID
   - Recipient
   - Subject
   - Timestamp
3. Click on any message to check its delivery status

### Checking Email Status

1. Go to Message History
2. Click on any message card
3. A modal will appear showing:
   - Message ID
   - Current delivery status
   - Additional details (if available)

## API Endpoints Used

### Send Email
```
POST /api/email
Content-Type: application/json

{
  "recipients": {
    "to": [{ "address": "recipient@example.com" }]
  },
  "subject": "Email Subject",
  "content": {
    "plainText": "Plain text content",
    "html": "<html>HTML content</html>"
  }
}
```

### Get Email Status
```
POST /api/email/status
Content-Type: application/json

{
  "messageId": "message-id-here"
}
```

## Features

### Rich Text Editor
- Text formatting (bold, italic, underline, strike)
- Headers (H1, H2, H3)
- Text and background colors
- Lists (ordered and unordered)
- Text alignment
- Links and images
- Clean formatting option

### Material Design Components
- Responsive navigation
- Form inputs with validation
- Buttons with ripple effects
- Cards for content organization
- Modals for status details
- Toast notifications for feedback

### Local Storage
Messages are stored in browser's localStorage for persistence across sessions. The storage includes:
- Message ID
- Recipient email
- Sender email
- Subject
- Timestamp

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- Message history is stored locally in the browser
- Clearing browser data will remove message history
- The frontend connects to the backend API running on localhost:3000
- Make sure CORS is properly configured on your backend if running on different ports

## Future Enhancements

- [ ] Export message history
- [ ] Search and filter messages
- [ ] Multiple recipient support
- [ ] File attachments
- [ ] Email templates
- [ ] Dark mode theme
