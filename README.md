# 🎉 NestJS Event Management API

## 🚀 Quick Start

### 📋 Prerequisites
- 🐳 Docker
- 🐳 Docker Compose

### 🔧 Installation
```bash
# Clone repository
git clone https://github.com/firasabdelaziz/NestJSEventProject.git
cd NestJSEventProject

# Create environment file
cp .env.example .env

# Start application
docker-compose up --build
```

## ✨ Key Features
- 🔐 User authentication
- 👥 Role-based access control
- 📅 Concurrent event RSVP
- 🔄 Transaction-safe operations
- 🐳 Dockerized deployment

## 🌐 API Endpoints

### 🔑 Authentication
- `POST /auth/register`: User registration
- `POST /auth/login`: User login

### 📆 Events
- `GET /events`: List events
- `POST /events`: Create event
- `PUT /events/:id`: Update event
- `DELETE /events/:id`: Delete event

### 🎫 RSVP
- `POST /events/:id/rsvp`: Register for event

## 💻 Development

### 🛠 Local Setup
```bash
# Install dependencies
npm install

# Run development server
npm run start:dev
```

### 🧪 Testing
```bash
# Run tests
npm test

# Generate coverage report
npm run test:cov
```

## 🗂 Project Structure
```
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── events/
│   └── rsvp/
├── common/
└── config/
```

## 🛡 Technologies
- 🚀 NestJS
- 📘 TypeScript
- 🐘 PostgreSQL
- 🗃 TypeORM
- 🐳 Docker
- 🔐 JWT Authentication

## 🤝 Contributing
1. 🍴 Fork repository
2. 🌿 Create feature branch
3. 💾 Commit changes
4. 📤 Push to branch
5. 🔀 Create pull request

## 📄 License
MIT License