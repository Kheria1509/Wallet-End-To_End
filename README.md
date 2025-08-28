# 💰 Wallet - Full Stack Payment Application

**Wallet** is a modern, full-stack MERN application for peer-to-peer money transfers, similar to popular payment platforms like Google Pay, PayTM, and Venmo. Built with security, scalability, and user experience in mind.

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based authentication with rate limiting
- 💸 **Instant Transfers** - Real-time money transfers between users
- 🔄 **Recurring Payments** - Schedule automatic recurring transfers
- 📊 **Transaction History** - Complete transaction tracking and history
- 🔔 **Notifications** - Real-time notifications for all transactions
- 📱 **Responsive Design** - Mobile-first responsive interface
- 🐳 **Docker Support** - Complete containerization with Docker Compose
- ⚡ **Hot Reloading** - Development-friendly with hot reload support

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **UI Components**: React Hot Toast, React Icons
- **Build Tool**: Vite with ESLint

### Backend
- **Runtime**: Node.js 18.x
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt, password validation, rate limiting
- **Validation**: Zod schema validation
- **Scheduling**: Node-cron for recurring transfers

### DevOps & Deployment
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (production)
- **Process Management**: PM2 (production)
- **Cloud Platforms**: Vercel, Render.com ready

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Wallet-End-to-End-main
   ```

2. **Start with Docker Compose**
   ```bash
   # Start all services (MongoDB, Backend, Frontend)
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   
   # Stop all services
   docker-compose down
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - MongoDB Admin (optional): http://localhost:8081

### Option 2: Manual Setup

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd Wallet-End-to-End-main
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env file with your configuration
   npm run dev  # or npm start
   ```

3. **Setup Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env file with your configuration
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

#### Backend Configuration (`.env`)

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ | - | `mongodb://localhost:27017/wallet_db` |
| `JWT_SECRET` | Secret key for JWT signing | ✅ | - | `your-super-secret-jwt-key` |
| `JWT_EXPIRY` | JWT token expiration time | ❌ | `24h` | `24h`, `7d`, `30m` |
| `PORT` | Backend server port | ❌ | `3000` | `3000` |
| `MAX_LOGIN_ATTEMPTS` | Max failed login attempts | ❌ | `5` | `5` |
| `LOGIN_TIMEOUT` | Login cooldown (milliseconds) | ❌ | `900000` | `900000` (15 min) |

#### Frontend Configuration (`.env`)

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|----------|
| `VITE_API_URL` | Backend API base URL | ✅ | - | `http://localhost:3000` |
| `VITE_API_TIMEOUT` | API request timeout (ms) | ❌ | `30000` | `30000` |
| `VITE_ENABLE_MOCK_API` | Enable mock API for testing | ❌ | `false` | `true`/`false` |

### 🔑 API Keys and Secrets Setup

#### JWT Secret Key
The JWT secret is critical for security. **Never use the default value in production!**

```bash
# Generate a strong JWT secret (Linux/Mac/WSL)
openssl rand -hex 64

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Windows PowerShell alternative
[System.Web.Security.Membership]::GeneratePassword(64, 10)
```

#### MongoDB Setup Options

1. **Local MongoDB**
   ```bash
   # Install MongoDB locally
   # macOS: brew install mongodb-community
   # Ubuntu: apt install mongodb
   # Windows: Download from MongoDB official site
   
   MONGODB_URI=mongodb://localhost:27017/wallet_db
   ```

2. **MongoDB Atlas (Cloud)**
   ```bash
   # Create account at https://cloud.mongodb.com/
   # Get connection string from Atlas dashboard
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wallet_db
   ```

3. **Docker MongoDB** (included in docker-compose.yml)
   ```bash
   MONGODB_URI=mongodb://admin:walletpass123@mongodb:27017/wallet_db?authSource=admin
   ```

## 🐳 Docker Development

### Prerequisites
- Docker Desktop installed
- Docker Compose v3.8+

### Development Commands

```bash
# Start all services in development mode
docker-compose up -d

# View logs from all services
docker-compose logs -f

# View logs from specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild services after code changes
docker-compose build
docker-compose up -d --build

# Access container shell for debugging
docker-compose exec backend sh
docker-compose exec frontend sh

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️  deletes database data)
docker-compose down -v
```

### Production Deployment

```bash
# Build for production
docker-compose -f docker-compose.yml build --target production

# Deploy with production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📂 Project Structure

```
Wallet-End-to-End-main/
├── 📁 backend/              # Node.js API server
│   ├── 📁 routes/           # API route definitions
│   ├── 📁 middleware/       # Custom middleware functions
│   ├── 📁 scripts/          # Utility scripts (recurring transfers)
│   ├── 📄 db.js             # Database models and connection
│   ├── 📄 index.js          # Main application entry point
│   ├── 📄 package.json      # Backend dependencies
│   ├── 📄 .env.example      # Environment variables template
│   └── 📄 Dockerfile        # Backend container configuration
├── 📁 frontend/             # React frontend application
│   ├── 📁 src/              # React source code
│   ├── 📁 public/           # Static assets
│   ├── 📄 package.json      # Frontend dependencies
│   ├── 📄 vite.config.js    # Vite build configuration
│   ├── 📄 .env.example      # Environment variables template
│   ├── 📄 Dockerfile        # Frontend container configuration
│   └── 📄 nginx.conf        # Nginx configuration for production
├── 📄 docker-compose.yml    # Main Docker Compose configuration
├── 📄 docker-compose.override.yml # Development overrides
├── 📄 .env.docker           # Docker environment template
└── 📄 README.md             # Project documentation
```

## 🔒 Security Features

- **Password Security**: bcrypt hashing with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Zod schema validation for all inputs
- **CORS Protection**: Configured cross-origin resource sharing
- **Environment Isolation**: Separate configurations for dev/prod

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test

# Run tests in Docker
docker-compose exec backend npm test
docker-compose exec frontend npm test
```

## 🚀 Deployment

### Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Render.com (Backend)
1. Connect repository to Render
2. Configure environment variables
3. Set build command: `npm install`
4. Set start command: `npm start`

### Docker Production
1. Build production images
2. Configure production environment variables
3. Deploy using Docker Swarm or Kubernetes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Ensure MongoDB is running
- Check connection string format
- Verify network connectivity in Docker

**Frontend Can't Connect to Backend**
- Check API URL configuration
- Verify CORS settings in backend
- Ensure backend is running and healthy

**Docker Issues**
```bash
# Reset Docker environment
docker-compose down -v
docker system prune -f
docker-compose build --no-cache
```

### Debug Commands

```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs [service-name]

# Execute commands in running container
docker-compose exec [service-name] sh

# Check network connectivity
docker-compose exec backend ping mongodb
```

## 📝 License

This project is licensed under the ISC License.



