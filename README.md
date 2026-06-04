# UTM Shortener Pro

A professional web-based utility designed for marketing and SMM specialists to quickly generate and shorten multiple UTM-tagged links for various social media platforms and content types in a single batch.

## Features

- **Multi-Language Support**: Ukrainian and English with easy language switcher
- **Theme Support**: Light and Dark modes with persistent preferences
- **Batch UTM Generation**: Create multiple UTM-tagged links from a single form
- **URL Shortening**: Integration with TinyURL API for link shortening
- **History Management**: Keep track of generated links with automatic 1-week expiration
- **User Settings**: Store API keys and preferences locally
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Extensible Architecture**: Easy to add new platforms, mediums, and features

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Database**: MySQL with Drizzle ORM
- **Authentication**: NextAuth.js
- **API Integration**: TinyURL API

## Project Structure

```
utm-shortener-pro/
├── src/
│   ├── pages/
│   │   ├── api/
│   │   │   ├── links/
│   │   │   │   └── generate.ts          # Link generation API
│   │   │   └── user/
│   │   │       └── settings.ts          # User settings API
│   │   ├── _app.tsx                     # App wrapper
│   │   ├── _document.tsx                # Document wrapper
│   │   └── index.tsx                    # Home page
│   ├── components/
│   │   ├── Header.tsx                   # Header with language/theme switcher
│   │   ├── Form.tsx                     # Main form component
│   │   ├── Matrix.tsx                   # Platform/Medium selection matrix
│   │   ├── Results.tsx                  # Results display
│   │   ├── History.tsx                  # History panel
│   │   └── Settings.tsx                 # Settings modal
│   ├── db/
│   │   ├── schema.ts                    # Database schema
│   │   └── index.ts                     # Database connection
│   ├── utils/
│   │   ├── utm.ts                       # UTM URL building utilities
│   │   └── tinyurl.ts                   # TinyURL API integration
│   ├── store/
│   │   └── appStore.ts                  # Zustand store
│   ├── i18n/
│   │   └── translations.ts              # Translation strings
│   └── styles/
│       └── globals.css                  # Global styles
├── public/
│   └── logo.png                         # YS logo
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── .env.example
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd utm-shortener-pro
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Set up the database:
```bash
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

### Users Table
- Stores user information, preferences (theme, language), and TinyURL API key

### Generated Links Table
- Tracks all generated UTM links with their shortened versions
- Includes automatic expiration after 1 week

### Platforms Table
- Extensible list of supported platforms (Telegram, Facebook, LinkedIn, Instagram, Threads)
- Can be easily extended with new platforms

### Mediums Table
- Extensible list of supported mediums (Post, Story, Reels)
- Can be easily extended with new mediums

## API Endpoints

### POST `/api/links/generate`
Generates and shortens UTM links

**Request:**
```json
{
  "baseUrl": "https://example.com/page",
  "campaignName": "summer_sale",
  "combinations": [
    { "source": "tg", "medium": "post" },
    { "source": "fb", "medium": "story" }
  ],
  "apiKey": "your_tinyurl_api_key"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "source": "tg",
      "medium": "post",
      "fullUtmUrl": "https://example.com/page?utm_campaign=summer_sale&utm_source=tg&utm_medium=post",
      "shortUrl": "https://tinyurl.com/abc123",
      "status": "success"
    }
  ]
}
```

### GET/POST `/api/user/settings`
Get or update user settings

## Features to Implement

- [ ] User authentication (login/signup)
- [ ] Database persistence for history
- [ ] Advanced filtering in history
- [ ] Export history to CSV
- [ ] API key validation before use
- [ ] Rate limiting for API calls
- [ ] Custom domain support
- [ ] Link analytics integration
- [ ] Team collaboration features

## Security Considerations

- API keys are stored in user's local storage (browser)
- Never expose API keys in client-side code
- Use environment variables for sensitive data
- Validate all user inputs on both client and server
- Implement rate limiting on API endpoints
- Use HTTPS in production

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Proprietary - All rights reserved

## Support

For issues and feature requests, please contact the development team.
