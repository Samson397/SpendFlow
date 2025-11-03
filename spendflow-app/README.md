# SpendFlow - Premium Financial Management

A professional, enterprise-grade expense tracking and financial management application built with Next.js, TypeScript, and Firebase.

## 🚀 Features

### Core Functionality
- **Expense Tracking**: Comprehensive expense categorization and management
- **Income Management**: Track all income sources and recurring payments
- **Advanced Analytics**: Deep insights into spending patterns with interactive charts
- **Multi-Currency Support**: Handle multiple currencies with real-time conversion
- **Card Management**: Organize and track multiple payment cards
- **Budget Planning**: Set and monitor spending limits by category

### Professional Features
- **Authentication & Authorization**: Secure Firebase Authentication with role-based access
- **Admin Dashboard**: Comprehensive admin panel for user and system management
- **Subscription Management**: Stripe-powered subscription system with tiered pricing
- **Real-time Presence**: Live user presence and activity monitoring
- **Audit Logging**: Complete activity logging for security and compliance
- **Rate Limiting**: API rate limiting to prevent abuse
- **Error Boundaries**: Graceful error handling with user-friendly fallbacks

### Developer Experience
- **TypeScript Strict Mode**: Maximum type safety and code quality
- **Comprehensive Testing**: Unit and integration tests with Jest
- **Professional Logging**: Structured logging system for debugging and monitoring
- **Input Validation**: Robust client and server-side validation
- **Loading States**: Professional skeleton loaders and loading indicators
- **Middleware Protection**: Route protection and security headers

## 🛠️ Technology Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Strict type checking and IntelliSense
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **React Hook Form**: Performant form handling
- **Recharts**: Interactive data visualization

### Backend & Infrastructure
- **Firebase**: Authentication, Firestore database, Cloud Functions
- **Stripe**: Payment processing and subscription management
- **Vercel**: Deployment and hosting platform

### Development & Testing
- **Jest**: Unit and integration testing
- **Testing Library**: Component testing utilities
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting

## 📁 Project Structure

```
spendflow-app/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/         # Authentication pages
│   │   ├── (dashboard)/    # Protected dashboard pages
│   │   ├── api/            # API routes
│   │   └── setup/          # Setup and seeding pages
│   ├── components/         # Reusable React components
│   │   ├── error/         # Error boundaries and handling
│   │   ├── ui/            # Base UI components
│   │   ├── layout/        # Layout components (Sidebar, Header)
│   │   ├── auth/          # Authentication components
│   │   ├── admin/         # Admin panel components
│   │   └── forms/         # Form components
│   ├── contexts/          # React Context providers
│   ├── lib/               # Utility libraries and services
│   │   ├── validation.ts  # Input validation utilities
│   │   ├── logger.ts      # Logging system
│   │   ├── services/      # External service integrations
│   │   └── utils/         # Helper functions
│   ├── types/             # TypeScript type definitions
│   ├── hooks/             # Custom React hooks
│   └── firebase/          # Firebase configuration
├── middleware.ts          # Next.js middleware for auth/routing
├── jest.config.ts         # Jest testing configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Firestore and Authentication enabled
- Stripe account for payment processing (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/spendflow.git
   cd spendflow/spendflow-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

   Configure your environment variables:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

   # Admin Configuration
   NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,admin2@example.com

   # Stripe (Optional)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...

   # Setup Mode (for initial setup)
   NEXT_PUBLIC_SETUP_MODE=false
   ```

4. **Firebase Setup**
   ```bash
   npm run firebase:login
   npm run firebase:init
   ```

5. **Database Seeding**
   ```bash
   # Set NEXT_PUBLIC_SETUP_MODE=true temporarily
   npm run dev
   # Navigate to /setup and seed the database
   ```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint
```

### Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🔒 Security Features

### Authentication & Authorization
- Firebase Authentication with email/password
- Role-based access control (User/Admin)
- Route protection middleware
- Session management

### API Security
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- CORS protection
- Security headers (CSP, HSTS, etc.)

### Data Protection
- Firebase security rules
- Input sanitization
- XSS prevention
- SQL injection protection (via Firestore)

## 📊 Admin Features

### User Management
- View all users with real-time presence
- Manage user roles (promote/demote admins)
- Account activation/deactivation
- User activity monitoring

### Subscription Management
- Create and manage subscription plans
- Assign tiers to users
- Monitor subscription analytics
- Handle Stripe webhooks

### System Monitoring
- Real-time activity logging
- Error tracking and reporting
- Performance monitoring
- System health checks

## 🧪 Testing Strategy

### Unit Tests
- Component rendering and interactions
- Utility functions and validation
- Business logic testing

### Integration Tests
- API endpoint testing
- Firebase integration
- Form submissions
- Authentication flows

### E2E Tests (Future)
- Critical user journeys
- Cross-browser compatibility
- Performance testing

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Firebase Hosting
```bash
npm run firebase:deploy:hosting
```

### Environment Variables
Ensure all production environment variables are set in your hosting platform:

- Firebase configuration
- Admin email addresses
- Stripe keys (if using payments)
- Logging and monitoring keys

## 📈 Performance

### Optimizations
- Next.js App Router for optimal loading
- Image optimization with Next.js
- Code splitting and lazy loading
- Efficient bundle sizes
- Caching strategies

### Monitoring
- Real user monitoring (RUM)
- Performance metrics
- Error tracking
- Analytics integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- TypeScript strict mode enabled
- ESLint configuration
- Prettier formatting
- Comprehensive test coverage
- Professional logging

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: Join GitHub Discussions for questions and community support

## 🎉 Acknowledgments

- Built with Next.js and the amazing React ecosystem
- Firebase for robust backend services
- Stripe for seamless payment processing
- The open-source community for incredible tools and libraries

---

**SpendFlow** - Professional expense tracking for modern businesses.
