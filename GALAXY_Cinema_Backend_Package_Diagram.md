# GALAXY Cinema Backend - Package Diagram

## Tổng quan hệ thống

GALAXY Cinema là một hệ thống quản lý rạp chiếu phim trực tuyến với kiến trúc backend Node.js sử dụng Express.js và MS SQL Server.

## Kiến trúc Package Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GALAXY CINEMA BACKEND                             │
│                              (Node.js/Express)                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              ENTRY POINT                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  📁 src/server.js                                                          │
│  • Khởi tạo Express app                                                    │
│  • Cấu hình middleware (CORS, Helmet, Compression)                        │
│  • Kết nối database                                                        │
│  • Khởi động background services                                           │
│  • Swagger API documentation                                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              CONFIGURATION                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  📁 src/config/                                                            │
│  ├── database.js          • Kết nối MS SQL Server                         │
│  ├── swaggerConfig.js     • Cấu hình API documentation                    │
│  ├── appConfig.js         • Cấu hình ứng dụng                             │
│  ├── cache.js             • Cấu hình cache                                │
│  ├── email.js             • Cấu hình email service                        │
│  └── ticketPricing.json   • Cấu hình giá vé                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  📁 src/models/                                                            │
│  ├── index.js             • Sequelize ORM configuration                   │
│  ├── User.js              • User entity                                   │
│  ├── Movie.js             • Movie entity                                  │
│  ├── Cinema.js            • Cinema entity                                 │
│  ├── CinemaRoom.js        • Cinema room entity                            │
│  ├── Showtime.js          • Showtime entity                               │
│  ├── Ticket.js            • Ticket entity                                 │
│  ├── Booking.js           • Booking entity                                │
│  ├── Seat.js              • Seat entity                                   │
│  ├── SeatLayout.js        • Seat layout entity                            │
│  ├── Promotion.js         • Promotion entity                              │
│  ├── Payment.js           • Payment entity                                │
│  └── ... (other entities)                                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              BUSINESS LOGIC                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  📁 src/services/                                                          │
│  ├── authService.js           • Authentication & Authorization            │
│  ├── bookingService.js        • Booking management                        │
│  ├── movieService.js          • Movie management                          │
│  ├── cinemaService.js         • Cinema management                         │
│  ├── showtimeService.js       • Showtime management                       │
│  ├── ticketService.js         • Ticket management                         │
│  ├── seatLayoutService.js     • Seat layout management                    │
│  ├── promotionService.js      • Promotion management                      │
│  ├── payosService.js          • Payment processing (PayOS)                │
│  ├── emailService.js          • Email notifications                       │
│  ├── notificationService.js   • Push notifications                        │
│  ├── pointsService.js         • Loyalty points system                     │
│  ├── salesReportService.js    • Sales reporting                           │
│  ├── bookingExpirationService.js • Booking expiration handling           │
│  ├── showtimeExpirationService.js • Showtime expiration handling         │
│  ├── movieStatusService.js    • Movie status management                   │
│  └── ... (other business services)                                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              CONTROLLERS                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  📁 src/controllers/                                                        │
│  ├── authController.js        • Authentication endpoints                  │
│  ├── userController.js        • User management endpoints                 │
│  ├── movieController.js       • Movie management endpoints                │
│  ├── cinemaController.js      • Cinema management endpoints               │
│  ├── bookingController.js     • Booking endpoints                         │
│  ├── showtimeController.js    • Showtime endpoints                        │
│  ├── ticketController.js      • Ticket endpoints                          │
│  ├── seatLayoutController.js  • Seat layout endpoints                     │
│  ├── promotionController.js   • Promotion endpoints                       │
│  ├── payosController.js       • Payment endpoints                         │
│  ├── pointsController.js      • Points system endpoints                   │
│  ├── salesReportController.js • Sales report endpoints                    │
│  └── ... (other controllers)                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              ROUTES                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  📁 src/routes/                                                             │
│  ├── authRoutes.js           • Authentication routes                      │
│  ├── userRoutes.js           • User management routes                     │
│  ├── movieRoutes.js          • Movie management routes                    │
│  ├── cinemaRoutes.js         • Cinema management routes                   │
│  ├── bookingRoutes.js        • Booking routes                             │
│  ├── showtimeRoutes.js       • Showtime routes                            │
│  ├── ticketRoutes.js         • Ticket routes                              │
│  ├── seatLayoutRoutes.js     • Seat layout routes                         │
│  ├── promotionRoutes.js      • Promotion routes                           │
│  ├── payosRoutes.js          • Payment routes                             │
│  ├── pointsRoutes.js         • Points system routes                       │
│  ├── salesReportRoutes.js    • Sales report routes                        │
│  └── ... (other route files)                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              MIDDLEWARES                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  📁 src/middlewares/                                                        │
│  ├── authMiddleware.js       • JWT authentication                         │
│  ├── validation.js           • Request validation                         │
│  ├── errorHandler.js         • Global error handling                      │
│  ├── upload.js               • File upload handling                       │
│  ├── pointsMiddleware.js     • Points system middleware                   │
│  └── payosLogger.js          • Payment logging                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              UTILITIES                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  📁 src/utils/                                                              │
│  ├── logger.js               • Logging utilities                          │
│  ├── errorHandler.js         • Error handling utilities                   │
│  ├── validators.js           • Validation utilities                       │
│  └── passwordHelper.js       • Password utilities                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  🔗 External Integrations                                                   │
│  ├── MS SQL Server          • Primary database                            │
│  ├── PayOS                  • Payment gateway                             │
│  ├── Cloudinary             • Image storage                               │
│  ├── Nodemailer             • Email service                               │
│  ├── QR Code Generator      • QR code generation                          │
│  └── PDF Generator          • Ticket PDF generation                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKGROUND SERVICES                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  ⏰ Scheduled Tasks                                                         │
│  ├── Booking Expiration     • Auto-cancel expired bookings                │
│  ├── Showtime Expiration    • Auto-update showtime status                 │
│  ├── Movie Status Update    • Auto-update movie status                    │
│  └── Email Reminders        • Send booking reminders                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Luồng xử lý chính

### 1. Authentication Flow

```
Client Request → authMiddleware → authController → authService → Database
```

### 2. Booking Flow

```
Client Request → bookingRoutes → bookingController → bookingService →
seatLayoutService → payosService → emailService → Database
```

### 3. Movie Management Flow

```
Client Request → movieRoutes → movieController → movieService →
cinemaService → showtimeService → Database
```

## Các tính năng chính

### 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control (Admin, Staff, Manager, User)
- Account locking mechanism
- Email verification

### 🎬 Movie Management

- Movie CRUD operations
- Movie status management
- Movie ratings and reviews
- Movie scheduling

### 🏢 Cinema Management

- Cinema branch management
- Cinema room management
- Seat layout configuration
- Room capacity management

### 🎫 Booking & Ticketing

- Online booking system
- Seat selection
- Ticket generation (PDF + QR Code)
- Booking expiration handling

### 💳 Payment Processing

- PayOS integration
- Multiple payment methods
- Payment verification
- Refund processing

### 🎁 Promotion System

- Discount codes
- Loyalty points
- Member benefits
- Promotion usage tracking

### 📊 Reporting & Analytics

- Sales reports
- Booking statistics
- Staff performance metrics
- Revenue analytics

### 📧 Communication

- Email notifications
- Booking reminders
- Payment confirmations
- System notifications

## Công nghệ sử dụng

### Core Technologies

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sequelize** - ORM for database
- **MS SQL Server** - Primary database

### Security & Performance

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request throttling
- **Compression** - Response compression
- **JWT** - Token-based authentication

### External Services

- **PayOS** - Payment gateway
- **Cloudinary** - Image storage
- **Nodemailer** - Email service
- **QRCode** - QR code generation
- **PDFKit** - PDF generation

### Development Tools

- **Swagger** - API documentation
- **Nodemon** - Development server
- **Winston** - Logging
- **Morgan** - HTTP request logging

## Cấu trúc Database

Hệ thống sử dụng MS SQL Server với các bảng chính:

- Users, Movies, Cinemas, CinemaRooms
- Showtimes, Bookings, Tickets, Seats
- Promotions, Payments, Points
- SeatLayouts, MovieRatings, Notifications

## Deployment & Environment

- **Development**: Local development with hot reload
- **Production**: Optimized for performance and security
- **Environment Variables**: Configuration via .env files
- **Health Checks**: System monitoring endpoints
- **Graceful Shutdown**: Proper resource cleanup
