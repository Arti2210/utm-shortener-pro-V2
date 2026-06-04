# UTM Shortener Pro - Architecture Documentation

## System Overview

UTM Shortener Pro is a full-stack web application designed to help marketing specialists efficiently generate and shorten multiple UTM-tagged links in batch operations. The application follows a modern, scalable architecture with clear separation of concerns.

## Architecture Layers

### 1. Presentation Layer (Frontend)

The frontend is built with Next.js and React, providing a responsive user interface with support for multiple languages and themes.

**Key Components:**
- **Header**: Navigation, language/theme switcher, user menu
- **Form Module**: Base URL and campaign name input with validation
- **Matrix Selector**: Interactive grid for platform and medium selection
- **Results Display**: Table showing generated links with copy functionality
- **History Panel**: Persistent storage of generated links with expiration
- **Settings Modal**: User preferences and API key management

**Technology Stack:**
- Next.js 14 (React framework)
- React 18 (UI library)
- TypeScript (type safety)
- Tailwind CSS (styling)
- Zustand (state management)

### 2. State Management

Zustand is used for client-side state management with persistence to localStorage.

**Store Structure:**
- **Settings**: Language, theme, API key preferences
- **Current Links**: Active generated links
- **History**: Persistent history of generated links
- **UI State**: Loading and error states

### 3. API Layer

RESTful API endpoints built with Next.js API routes.

**Key Endpoints:**
- `POST /api/links/generate` - Generate and shorten UTM links
- `GET/POST /api/user/settings` - User preferences management
- `GET /api/user/history` - Retrieve link history (to be implemented)
- `POST /api/user/history/clear` - Clear history (to be implemented)

### 4. Business Logic Layer

Utility functions handle core business logic with no external dependencies.

**Modules:**
- **UTM Builder** (`src/utils/utm.ts`): URL construction and validation
- **TinyURL Integration** (`src/utils/tinyurl.ts`): API communication and error handling

### 5. Data Layer

MySQL database with Drizzle ORM for type-safe database operations.

**Database Schema:**
- **users**: User accounts and preferences
- **generated_links**: History of generated links
- **platforms**: Supported social media platforms
- **mediums**: Supported content types

## Data Flow

### Link Generation Flow

```
User Input (Form)
    ↓
Validation (Client-side)
    ↓
POST /api/links/generate
    ↓
UTM URL Construction
    ↓
TinyURL API Integration
    ↓
Response Processing
    ↓
Results Display + History Storage
```

### State Management Flow

```
User Action
    ↓
Update Zustand Store
    ↓
Component Re-render
    ↓
Persist to localStorage
```

## Security Considerations

### API Key Management
- User provides TinyURL API key through settings
- Key stored in browser's localStorage (user-controlled)
- Key sent with each request to backend
- Backend should validate key on each request

### Input Validation
- Client-side validation for UX
- Server-side validation for security
- URL format validation using Web API
- Campaign name length and character validation

### Data Protection
- HTTPS only in production
- No sensitive data in URLs
- Secure session management with NextAuth.js
- Environment variables for sensitive configuration

## Extensibility

### Adding New Platforms

1. Add platform to database `platforms` table
2. Update `PLATFORM_CODES` in utilities
3. Add translation strings
4. Update matrix selector component

### Adding New Mediums

1. Add medium to database `mediums` table
2. Update `MEDIUM_CODES` in utilities
3. Add translation strings
4. Update matrix selector component

### Adding New Features

The architecture supports adding features through:
- New API endpoints
- Extended database schema
- Additional Zustand store slices
- New React components
- Utility function modules

## Performance Considerations

### Frontend Optimization
- Code splitting with Next.js dynamic imports
- Image optimization with Next.js Image component
- CSS-in-JS optimization with Tailwind
- Component lazy loading

### Backend Optimization
- Database connection pooling
- Batch API requests to TinyURL
- Caching strategies for platforms/mediums
- Rate limiting implementation

### Database Optimization
- Proper indexing on frequently queried fields
- Pagination for history queries
- Automatic cleanup of expired links
- Query optimization with Drizzle ORM

## Deployment Architecture

### Development Environment
- Local Next.js dev server
- Local MySQL database
- Environment variables from `.env.local`

### Production Environment
- Next.js production build
- Managed MySQL database
- Environment variables from hosting platform
- CDN for static assets
- Monitoring and logging

## Error Handling Strategy

### Client-Side Errors
- Form validation errors displayed inline
- API errors shown in toast notifications
- Retry mechanism for failed requests
- Graceful degradation

### Server-Side Errors
- Structured error responses
- Proper HTTP status codes
- Detailed error logging
- User-friendly error messages

## Testing Strategy

### Unit Tests
- Utility functions (UTM, TinyURL)
- Store actions
- Component rendering

### Integration Tests
- API endpoints
- Database operations
- Authentication flow

### E2E Tests
- Complete user workflows
- Error scenarios
- Cross-browser compatibility

## Monitoring & Analytics

### Metrics to Track
- API response times
- Error rates
- User engagement
- Link generation volume
- API quota usage

### Logging
- Server-side request logging
- Error tracking and reporting
- Performance monitoring
- User action tracking

## Future Architecture Enhancements

- Microservices architecture for scaling
- GraphQL API for flexible queries
- Real-time updates with WebSockets
- Advanced caching with Redis
- Message queue for async operations
- Analytics dashboard
- Admin panel for management
