# Real Estate Platform - Complete Features Documentation

## 🏠 Overview
This is a comprehensive real estate platform built with Next.js that provides an integrated solution for property management, client relationship management, AI-powered call analysis, video generation, and automated matching systems. The platform supports Hebrew, Arabic, and English languages with automatic language detection.

## 🔐 Authentication & User Management

### User Registration & Login
- **Sign Up**: `/sign-up` - Complete agent registration with profile images and logos (automatic background removal)
- **Sign In**: `/sign-in` - User authentication with session management
- **Profile Management**: `/dashboard/profile` - Update personal information, profile images, and agency logos (automatic background removal)

### API Endpoints
- `POST /api/auth/register` - Create new agent account with media uploads
- `POST /api/auth/login` - Authenticate user with JWT
- `POST /api/auth/logout` - Secure sign out
- `GET /api/auth/check` - Verify authentication status
- `PUT /api/users/profile` - Update user profile and media
- `GET /api/users/[id]` - Get user information
- `GET /api/users/analytics` - User-specific analytics data

### Features
- **Multi-language Support**: Hebrew, Arabic, English interface
- **Profile Images**: Upload and manage professional profile photos
- **Agency Logos**: Upload custom agency logos with automatic overlay generation
- **Social Media Integration**: Instagram and Facebook profile links
- **Activity Tracking**: Profile views, interactions, and engagement metrics
- **Calendly Integration**: Book appointments directly through profiles
- **Role-based Access**: Agent and admin role management

## 🏡 Properties Management

### Property Listings
- **Browse Properties**: `/properties` - View all available properties with advanced filtering
- **Property Details**: `/properties/[id]` - Detailed property information with image carousels
- **Multi-language Descriptions**: Automatic Hebrew and Arabic description generation

### Property Management (Dashboard)
- **Property Upload**: `/dashboard/properties/upload` - Advanced property creation wizard
- **Edit Property**: `/dashboard/properties/[id]/edit` - Modify existing properties
- **My Properties**: `/dashboard/properties` - Manage your property listings
- **Bulk Upload**: Support for multiple image uploads and video generation

### API Endpoints
- `GET /api/properties` - Fetch all properties with filtering
- `POST /api/properties` - Create new property with media processing
- `GET /api/properties/[id]` - Get specific property details
- `PUT /api/properties/[id]` - Update property information
- `DELETE /api/properties/[id]` - Remove property listing
- `GET /api/properties/my-properties` - Get user's properties

### Advanced Features
- **Content Types**: Single image, carousel, video, video-from-images
- **AI Description Generation**: Automatic Hebrew and Arabic property descriptions
- **Media Processing**: Advanced image optimization and video generation
- **Logo Overlay**: Automatic agency logo application to property images
- **City Integration**: Comprehensive Israeli city options with search
- **Property Matching**: Intelligent property-to-client matching system

## 🎯 AI-Powered Call Analysis System

### Call Analysis Features
- **Audio Upload**: Support for MP3, WAV, M4A formats with automatic conversion
- **Language Detection**: Automatic detection of Hebrew, Arabic, English, and mixed languages
- **Speaker Identification**: Formatted transcripts with "Speaker 1:" and "Speaker 2:" labels
- **Structured Data Extraction**: Automatic extraction of property details, prices, and client intent

### Dashboard Interface
- **Call Analysis Page**: `/dashboard/call-analysis` - Upload and analyze calls
- **Call History**: View all analyzed calls with quick property previews
- **Call Details**: `/dashboard/call-analysis/[id]` - Detailed call analysis view
- **Tabbed Interface**: Transcription, Summary, Property Details, Follow-ups, Issues

### API Endpoints
- `POST /api/call-analysis` - Upload and analyze audio files
- `GET /api/calls` - Fetch call history
- `GET /api/calls/[id]` - Get specific call details
- `POST /api/calls` - Save call analysis results

### Advanced Analysis Features
- **OpenAI Whisper Integration**: Automatic speech-to-text conversion
- **GPT-4 Analysis**: Comprehensive call analysis with insights
- **Property Data Extraction**: Automatically extract rooms, area, price, location
- **Client Intent Detection**: Identify buyer, seller, or both intentions
- **Language-Aware Processing**: Handles Hebrew/Arabic mixing common in Israeli real estate
- **Actionable Insights**: Follow-up recommendations and improvement suggestions

## 👥 Client Management System

### Client Features
- **Client Dashboard**: `/dashboard/clients` - "לקוחות שלי" (My Clients) management
- **Client Profiles**: `/dashboard/clients/[id]` - Detailed client information
- **Add Client**: `/dashboard/clients/new` - Create new client profiles
- **Edit Client**: `/dashboard/clients/[id]/edit` - Modify client information

### API Endpoints
- `GET /api/clients` - Fetch all clients with filtering
- `POST /api/clients` - Create new client
- `GET /api/clients/[id]` - Get specific client details
- `PUT /api/clients/[id]` - Update client information
- `DELETE /api/clients/[id]` - Remove client

### Client Management Features
- **Comprehensive Profiles**: Contact info, property preferences, status tracking
- **Priority Levels**: High, medium, low priority classification
- **Status Management**: Prospect, active, inactive, closed status tracking
- **Property Preferences**: Location, type, price range, room requirements
- **Communication Preferences**: Phone, WhatsApp, email contact methods
- **Call Integration**: Automatic client creation/linking from call analysis
- **Call History**: Linked call records with summaries and analysis
- **Notes System**: Detailed client notes and interaction history

## 🤝 Intelligent Matching System

### Property-to-Client Matching
- **Matching Dashboard**: `/dashboard/matching` - View all matching opportunities
- **Property Matching**: `/dashboard/matching/property/[id]` - Property-specific matches
- **Client Matching**: `/dashboard/matching/client/[id]` - Client-specific matches
- **Call Matching**: `/dashboard/matching/call/[id]` - Call-specific matches

### API Endpoints
- `GET /api/matching?type=properties-to-clients` - Property matching analysis
- `GET /api/matching?type=clients-to-properties` - Client matching analysis
- `GET /api/matching?type=calls-to-properties` - Call matching analysis

### Matching Features
- **Multi-criteria Matching**: Location, type, price, rooms, area matching
- **Priority System**: User properties prioritized over external properties
- **Score-based Ranking**: Detailed matching scores with explanations
- **Location Normalization**: Intelligent location matching (נצרת עילית → נוף הגליל)
- **Price Range Matching**: Flexible price matching with tolerance
- **Real-time Analysis**: Instant matching results with detailed breakdowns

## 📚 Educational Guide System

### Guide Pages
- **Seller Guide**: `/seller` - Complete 6-step selling process
- **Buyer Guide**: `/buyer` - Comprehensive 6-step buying guide
- **Renter Guide**: `/renter` - Detailed 6-step renting process
- **Landlord Guide**: `/landlord` - Complete 6-step rental management

### Individual Guide Steps
- **Seller Steps**: `/seller/[1-6]` - Legal prep, pricing, marketing, showings, negotiation, contracts
- **Buyer Steps**: `/buyer/[1-6]` - Financial prep, mortgage approval, search, visits, legal work, closing
- **Renter Steps**: `/renter/[1-6]` - Budget planning, search, visits, legal checks, signing, moving
- **Landlord Steps**: `/landlord/[1-6]` - Property prep, legal checks, pricing, marketing, contracts, management

### Guide Features
- **Progress Tracking**: Visual progress indicators for each step
- **Detailed Content**: Comprehensive information for each step
- **Hebrew Interface**: Fully localized in Hebrew
- **Interactive Navigation**: Step-by-step navigation with prev/next buttons
- **FAQ Integration**: Direct links to frequently asked questions

## 🎥 Video Generation System

### Video Creation Features
- **Video from Photos**: Generate professional real estate videos from property images
- **Dynamic Layouts**: Automatic video format optimization (vertical, horizontal, square)
- **Multi-language Support**: Hebrew and Arabic video content
- **Agency Branding**: Automatic logo overlay and contact information

### Video Generation Process
- **Image Analysis**: Determine optimal video dimensions and layout
- **Scene Creation**: 5-second scenes per image with smooth transitions
- **Text Overlay**: Property details, contact information, and branding
- **Audio Processing**: Background music and transitions
- **Cloud Upload**: Automatic upload to Cloudinary with optimization

### API Endpoints
- `POST /api/generate-descriptions` - Generate property descriptions
- Video generation integrated into property upload workflow

### Features
- **HTML5 Canvas Rendering**: High-quality video generation in browser
- **Cloudinary Integration**: Automatic upload and optimization
- **Webhook Notifications**: Real-time video processing updates
- **Profile Image Integration**: User profile images in contact scenes
- **Responsive Design**: Optimized for different screen sizes and social media

## 🔊 Audio Processing & Language Detection

### Audio Processing
- **Format Support**: MP3, WAV, M4A, OGG, FLAC formats
- **Automatic Conversion**: M4A to MP3 conversion via Cloudinary
- **File Validation**: Size limits and format verification
- **Quality Optimization**: Automatic audio optimization for transcription

### Language Detection
- **Automatic Detection**: OpenAI Whisper automatic language detection
- **Multi-language Support**: Hebrew, Arabic, English, and mixed languages
- **Character Analysis**: Unicode range detection for Hebrew and Arabic
- **Context-aware Processing**: Real estate terminology recognition

### API Integration
- **OpenAI Whisper**: State-of-the-art speech recognition
- **GPT-4 Analysis**: Advanced language understanding and analysis
- **Language-specific Prompts**: Tailored analysis for different languages

## 📝 Blog System

### Blog Features
- **Blog Listing**: `/blog` - Browse all blog posts with filtering
- **Read Blog**: `/blog/[slug]` - Individual blog post reading
- **SEO Optimization**: Automatic slug generation and meta tags

### Blog Management (Dashboard)
- **Create Blog**: `/dashboard/blog/new` - Rich text blog creation
- **Edit Blog**: `/dashboard/blog/[id]/edit` - Blog editing interface
- **My Blogs**: `/dashboard/blog` - Personal blog management

### API Endpoints
- `GET /api/blogs` - Fetch all blogs with filtering
- `POST /api/blogs` - Create new blog post
- `GET /api/blogs/[id]` - Get specific blog
- `PUT /api/blogs/[id]` - Update blog content
- `DELETE /api/blogs/[id]` - Remove blog post
- `GET /api/blogs/my-blogs` - Get user's blogs

### Blog Features
- **Rich Text Editor**: Advanced formatting with multimedia support
- **AI Enhancement**: OpenAI-powered blog improvement suggestions
- **Tag System**: Categorization and filtering
- **Author Profiles**: Integrated with user profiles

## 👥 Agent System

### Agent Directory
- **Browse Agents**: `/agents` - View all registered agents
- **Agent Profile**: `/agents/[id]` - Detailed agent information and listings
- **Performance Tracking**: View agent statistics and interactions

### API Endpoints
- `GET /api/agents` - Fetch all agents
- `GET /api/agents/[id]` - Get specific agent details
- `POST /api/agents/[id]/track` - Track agent interactions

### Agent Features
- **Performance Analytics**: Track calls, emails, WhatsApp interactions
- **Profile Views**: Monitor profile visit statistics
- **Property Showcase**: Display agent's property listings
- **Contact Integration**: Direct contact through multiple channels

## 🤖 AI-Powered Content Enhancement

### OpenAI Integration
- **Description Generation**: `/api/generate-description` - AI property descriptions
- **Blog Refactoring**: `/api/openai/refactor-blog` - Blog improvement
- **Description Enhancement**: `/api/openai/refactor-description` - Property description improvement

### AI Features
- **Multi-language Content**: Hebrew and Arabic content generation
- **Real Estate Optimization**: Industry-specific content optimization
- **SEO Enhancement**: Search engine optimized content
- **Emotional Appeal**: Persuasive marketing copy generation

## 📊 Analytics & Insights

### Analytics Dashboard
- **User Analytics**: `/dashboard/analytics` - Personal performance metrics
- **Property Analytics**: Track property views and inquiries
- **Call Analytics**: Monitor call analysis performance
- **Client Analytics**: Track client engagement and conversion

### API Endpoints
- `GET /api/analytics` - System-wide analytics
- `GET /api/users/analytics` - User-specific analytics

### Analytics Features
- **Interaction Tracking**: WhatsApp, email, phone call tracking
- **Performance Metrics**: Property views, inquiries, conversions
- **Client Insights**: Client engagement and behavior analysis
- **Real-time Data**: Live dashboard updates

## 🖼️ Advanced Media Management

### Cloudinary Integration
- **Image Optimization**: Automatic resizing and compression
- **Video Processing**: Upload and optimization
- **Logo Overlay**: Automatic agency logo application
- **Format Conversion**: Automatic format optimization

### API Endpoints
- `POST /api/upload/cloudinary` - Direct media upload
- `POST /api/cloudinary/signature` - Signed upload authentication
- `GET /api/cloudinary/test` - Connection testing
- `POST /api/cloudinary/delete` - Media deletion
- `POST /api/users/process-logo` - Logo processing with background removal (authenticated users and registration)

### Media Features
- **User Logo System**: Dynamic logo overlay application
- **Multi-format Support**: Images, videos, audio files
- **Automatic Optimization**: Size and quality optimization
- **Secure Upload**: Signed uploads with authentication
- **Background Removal**: Automatic logo background removal using Remove.bg API

### Background Removal System
- **Automatic Processing**: Seamless background removal for uploaded logos during registration and profile updates
- **Remove.bg Integration**: Professional-grade background removal service
- **Quality Preservation**: Maintains logo quality while removing backgrounds
- **Cloudinary Integration**: Processed logos automatically uploaded to Cloudinary
- **Error Handling**: Graceful handling of processing errors with user feedback
- **Overlay Generation**: Automatic generation of overlay IDs for video processing
- **Dual Endpoints**: Separate endpoints for registration and authenticated user updates
- **Fallback Support**: Automatically falls back to regular upload if background removal fails
- **Visual Feedback**: Real-time processing indicators and status updates

## 🔗 Integration & Notifications

### Webhook System
- **Real-time Notifications**: Instant processing updates
- **External Integration**: Connect to external services
- **Event-driven Architecture**: Automated workflow triggers

### API Endpoints
- `POST /api/notify-upload` - Single media upload notifications
- `POST /api/notify-carousel` - Multi-media upload notifications
- `POST /api/save-listing` - Property listing notifications

### Google Sheets Integration
- **Data Export**: Automatic data export to Google Sheets
- **Call Analysis Export**: Export call analysis results
- **Client Data Export**: Export client information
- **Real-time Sync**: Live data synchronization

### Notification Features
- **Multi-channel Notifications**: Email, webhook, sheet integration
- **Processing Status**: Real-time processing updates
- **Error Handling**: Graceful error handling and retry logic

## 📞 Contact & Communication

### Contact System
- **Contact Page**: `/contact` - General inquiry form
- **Agent Contact**: Direct agent communication
- **Multi-channel Support**: Phone, email, WhatsApp integration

### API Endpoints
- `POST /api/contact` - Handle contact form submissions

### Communication Features
- **WhatsApp Integration**: Direct WhatsApp communication
- **Email Templates**: Automated email responses
- **Phone Tracking**: Call interaction monitoring
- **Response Analytics**: Communication effectiveness tracking

## 🎨 User Interface & Experience

### Responsive Design
- **Mobile Optimization**: Full mobile responsiveness
- **Tablet Support**: Optimized for tablet devices
- **Desktop Experience**: Rich desktop interface
- **Touch Interfaces**: Touch-friendly interactions

### UI Components
- **Image Carousel**: Interactive property galleries
- **Property Cards**: Consistent property display
- **Dashboard Widgets**: Real-time data displays
- **Form Components**: Advanced form handling
- **Modal System**: Contextual modal dialogs

### Accessibility
- **RTL Support**: Right-to-left language support
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader**: Screen reader compatibility
- **Color Contrast**: WCAG compliant color schemes

## 🏗️ Technical Architecture

### Framework & Technologies
- **Next.js 14**: Modern React framework with App Router
- **React 18**: Latest React features with concurrent rendering
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling framework

### Database & Storage
- **MongoDB**: Primary database with Mongoose ODM
- **Cloudinary**: Cloud media storage and processing
- **Google Sheets**: Data export and integration
- **Session Management**: Secure session handling

### AI & Machine Learning
- **OpenAI GPT-4**: Advanced language understanding
- **OpenAI Whisper**: Speech recognition and transcription
- **Language Detection**: Multi-language content processing
- **Intelligent Matching**: AI-powered property matching

### Security & Performance
- **JWT Authentication**: Secure user authentication
- **API Rate Limiting**: Protected API endpoints
- **Data Validation**: Comprehensive input validation
- **Error Handling**: Graceful error management
- **Caching**: Optimized data caching
- **CDN Integration**: Global content delivery

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Environment Setup
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret
NEXTAUTH_SECRET=your_nextauth_secret

# OpenAI Integration
OPENAI_API_KEY=your_openai_api_key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Background Removal
REMOVEBG_API_KEY=your_removebg_api_key

# Google Sheets
GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account_json
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id

# Notifications
WEBHOOK_URL=your_webhook_url
```

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 🌐 Multi-language Support

### Supported Languages
- **Hebrew**: Native RTL support with full localization
- **Arabic**: Complete Arabic interface and content
- **English**: Full English language support
- **Mixed Languages**: Intelligent handling of language mixing

### Language Features
- **Automatic Detection**: AI-powered language detection
- **Content Generation**: Multi-language content creation
- **UI Localization**: Fully localized user interfaces
- **Cultural Adaptation**: Culturally appropriate content

## 📱 Mobile & Responsive Features

### Mobile Optimization
- **Touch-friendly Interface**: Optimized for mobile interactions
- **Responsive Images**: Automatic image optimization
- **Mobile Navigation**: Optimized mobile menu system
- **Touch Gestures**: Swipe and touch gesture support

### Progressive Web App
- **Offline Support**: Basic offline functionality
- **Push Notifications**: Real-time push notifications
- **App-like Experience**: Native app feel
- **Fast Loading**: Optimized loading performance

## 🔮 Future Enhancements

### Planned Features
- **Real-time Chat**: Live chat between agents and clients
- **Virtual Tours**: 360-degree property tours
- **Advanced Analytics**: Machine learning insights
- **Mobile App**: Native mobile application
- **Multi-tenant Architecture**: Support for multiple agencies
- **Advanced Matching**: AI-powered recommendation engine

---

This comprehensive real estate platform provides a complete solution for modern real estate professionals, combining traditional property management with cutting-edge AI technology and intelligent automation systems. 