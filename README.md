# Digital Kagaaz

A comprehensive digital paperwork platform with two main applications:
- **Digital Kagaaz** - Your Digital Paperwork, Simplified
- **Acadify** - Smart Platform for Coaching Institutes

## Overview

Digital Kagaaz is a multi-platform web application that provides digital documentation solutions with Firebase backend integration. The project includes both a main documentation platform and a specialized coaching institute management system.

## Features

### Digital Kagaaz (Main Platform)
- **User Authentication**: Firebase-based email/password authentication
- **Blog System**: Dynamic blog posts with rich content
- **News Section**: Latest updates and announcements
- **Responsive Design**: Modern UI with Poppins font and gradient styling
- **Admin Dashboard**: Administrative interface for content management
- **No Popups Policy**: Clean UI without intrusive modals or alerts

### Acadify (Coaching Institute Platform)
- **Multi-Role System**: Student and Teacher roles with different interfaces
- **Real-time Chat**: Role-based chat functionality with Firebase
- **Institute Multi-tenancy**: Support for multiple institutes
- **Class & Board Management**: Educational organization features
- **Premium Animations**: Modern UI with micro-interactions and transitions
- **Role-based Navigation**: Different dashboards for students and teachers

## Technical Architecture

### Frontend Technologies
- **HTML5**: Semantic markup with modern standards
- **CSS3**: Advanced styling with gradients, animations, and responsive design
- **Vanilla JavaScript**: No framework dependencies, pure JS implementation
- **Firebase SDK**: Authentication and Firestore database integration

### Backend Services
- **Firebase Authentication**: User management and authentication
- **Firestore Database**: Real-time data storage and synchronization
- **Static File Servers**: Two Node.js servers for local development

### Deployment
- **GitHub Actions**: Automated deployment workflow
- **FTP Deployment**: Direct server deployment via GitHub Actions
- **Custom Domain**: digitalkaagaz.com

## Project Structure

```
digitalkaagaz/
  index.html              # Main Digital Kagaaz landing page
  acadify.html            # Acadify application
  acadify-entry.html      # Acadify landing/marketing page
  admin.html              # Admin dashboard interface
  
  app.js                  # Main Digital Kagaaz application logic
  acadify.js              # Acadify application logic
  
  style.css               # Main stylesheet for Digital Kagaaz
  
  serve.js                # Advanced static file server
  server.js               # Basic static file server
  
  .github/workflows/
    deploy.yml            # GitHub Actions deployment workflow
  
  images/                 # Static image assets
  components/             # Reusable UI components (empty)
  pages/                  # Additional pages (empty)
  utils/                  # Utility functions (empty)
  
  firestore.rules         # Firebase Firestore security rules
  CNAME                   # Custom domain configuration
  index.php              # PHP cache bypass for production
```

## Flow Diagram

<img width="1544" height="2420" alt="DigitalKaagaz_Flow_Diagram" src="https://github.com/user-attachments/assets/64f35d63-1dc5-46f4-8b04-54112b6c10e9" />


## Key Files Description

### HTML Files
- **index.html**: Main landing page with authentication, blog, and news sections
- **acadify.html**: Complete coaching institute management application
- **acadify-entry.html**: Marketing/entry page for Acadify with institute registration
- **admin.html**: Administrative dashboard for content management

### JavaScript Files
- **app.js**: Main application logic for Digital Kagaaz including blog data, authentication, and UI interactions
- **acadify.js**: Acadify-specific logic including role management, chat functionality, and institute features

### Server Files
- **serve.js**: Production-ready static file server with proper MIME types and error handling
- **server.js**: Simple development server for basic testing

### Configuration
- **firestore.rules**: Firebase security rules (currently open for development)
- **deploy.yml**: GitHub Actions workflow for automated FTP deployment

## Getting Started

### Prerequisites
- Node.js (for local development servers)
- Firebase project configuration
- FTP server credentials (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/mastergodlygamerz/digitalkaagaz.git
   cd digitalkaagaz
   ```

2. **Start development server**
   ```bash
   node serve.js
   ```
   or
   ```bash
   node server.js
   ```

3. **Access the applications**
   - Main Platform: http://localhost:8000/
   - Acadify: http://localhost:8000/acadify.html
   - Admin: http://localhost:8000/admin.html

### Firebase Configuration

Update the Firebase configuration in the HTML files:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Deployment

### Automatic Deployment
The project uses GitHub Actions for automatic deployment when pushing to the `main` branch.

### Manual Deployment
1. Build/prepare your files
2. Deploy to FTP server using the credentials in GitHub Secrets
3. Update CNAME record for custom domain

## Features in Detail

### Authentication System
- Email/password authentication via Firebase
- Role-based access (Student/Teacher for Acadify)
- Persistent login state
- Profile management

### Real-time Features
- Live chat with role-based message alignment
- Real-time data synchronization via Firestore
- Instant notifications and updates

### UI/UX Features
- Modern gradient designs
- Smooth animations and transitions
- Responsive layouts for all devices
- Dark theme with accent colors
- Micro-interactions and hover effects

### Data Management
- Firestore database for structured data
- Real-time listeners for live updates
- Query optimization with proper indexing
- Multi-tenancy support for institutes

## Security Considerations

- Firebase security rules need to be updated for production
- Input validation and sanitization
- HTTPS enforcement in production
- Proper authentication checks

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Progressive enhancement approach

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For support and inquiries, please contact the development team.


---

**Note**: This is an active development project with regular updates and feature additions.
