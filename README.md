# 🏥 HospitaLink Frontend System

HospitaLink Frontend adalah sistem dashboard web untuk manajemen rumah sakit yang dibangun dengan **React + TypeScript + Vite** dengan antarmuka modern yang responsive dan user-friendly untuk Admin dan Dokter.

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v16 atau lebih tinggi)
- NPM atau Yarn
- HospitaLink Backend API running on `http://localhost:5000`

### Installation Steps
```bash
# Clone repository
git clone <repository-url>
cd HospitaLink-fe

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend berjalan di http://localhost:5173
```

## 👤 Default Login Accounts

### **Admin Dashboard Access**
| Email | Password | Role | Dashboard URL |
|-------|----------|------|--------------|
| `admin@hospitalink.com` | `admin123` | ADMIN | `http://localhost:5173/admin` |
| `sofwannuhaalfaruq@gmail.com` | `password123` | ADMIN | `http://localhost:5173/admin` |

### **Doctor Dashboard Access**
| Email | Password | Spesialisasi | Dashboard URL |
|-------|----------|-------------|--------------|
| `dr.sarah@hospitalink.com` | `doctor123` | Spesialis Penyakit Dalam | `http://localhost:5173/doctor` |
| `dr.ahmad@hospitalink.com` | `doctor123` | Spesialis Anak | `http://localhost:5173/doctor` |

## 🌟 Key Features

### **🔐 Multi-Dashboard Authentication System**
- **Separate Login Portals**: `/admin/login` dan `/doctor/login`
- **Role-based Routing**: Protected routes berdasarkan role
- **JWT Token Management**: Auto refresh & secure storage
- **Responsive Design**: Mobile-friendly interface

### **👨‍⚕️ Admin Dashboard Features**
1. **Patient Management Interface**
   - Modern data table dengan search, filter, dan pagination
   - Patient registration form dengan auto-generated QR code
   - Patient card PDF generation & download
   - QR scanner untuk patient check-in
   - Comprehensive patient profile dengan medical history

2. **Doctor Management System**
   - CRUD interface untuk doctor management
   - Schedule management dengan drag-and-drop calendar
   - Real-time doctor availability toggle
   - Performance metrics dashboard dengan charts
   - Doctor profile management dengan specialization

3. **Queue Management Dashboard**
   - Real-time queue monitoring dengan live updates
   - QR code scanner integration untuk check-in
   - Call next patient dengan notification system
   - Queue analytics dengan visual charts
   - Waiting time estimation display

4. **Prescription Management Portal**
   - Digital prescription verification interface
   - Medication inventory management dengan stock alerts
   - Payment status tracking dengan Midtrans integration
   - Prescription dispensing workflow
   - Analytics & reporting dashboard

### **👩‍⚕️ Doctor Dashboard Features**
1. **Real-time Patient Queue**
   - Live queue dashboard dengan patient details
   - Patient medical history viewer
   - Consultation completion interface
   - Diagnosis input dengan templates
   - Follow-up scheduling system

2. **Digital Prescription System**
   - Intuitive prescription creation form
   - Medication database dengan search functionality
   - Auto-generate prescription verification codes
   - Direct integration dengan pharmacy system
   - Prescription templates untuk efficiency

3. **Online Consultation Platform**
   - Real-time chat interface dengan patients
   - AI-powered symptom analysis dashboard
   - Appointment booking calendar
   - Patient consultation history
   - Video consultation interface (future)

### **📱 Modern UI/UX Features**
1. **Dashboard Components**
   - Interactive charts dan analytics
   - Real-time notifications dengan toast system
   - Modern card-based layout design
   - Responsive data tables dengan sorting
   - Advanced search & filter components

2. **User Experience**
   - Dark/Light theme support
   - Loading states dengan skeleton screens
   - Error handling dengan user-friendly messages
   - Form validation dengan real-time feedback
   - Keyboard shortcuts untuk efficiency

3. **Technology Integration**
   - QR code scanner dengan camera access
   - Print functionality untuk documents
   - Export data ke Excel/PDF
   - Real-time WebSocket notifications
   - Progressive Web App (PWA) support

## 🛠 Tech Stack & Dependencies

### **Core Framework**
```json
{
  "react": "^18.3.1",
  "typescript": "^5.5.3",
  "@vitejs/plugin-react": "^4.3.1",
  "vite": "^5.4.1"
}
```

### **UI & Styling**
```json
{
  "@mui/material": "^5.16.7",
  "@mui/x-data-grid": "^7.12.1",
  "@mui/x-date-pickers": "^7.12.1",
  "@emotion/react": "^11.13.0",
  "@emotion/styled": "^11.13.0",
  "tailwindcss": "^3.4.1",
  "framer-motion": "^11.3.21"
}
```

### **State Management & HTTP**
```json
{
  "zustand": "^4.5.4",
  "@tanstack/react-query": "^5.51.23",
  "axios": "^1.7.4",
  "react-router-dom": "^6.26.1"
}
```

### **Utility Libraries**
```json
{
  "react-qr-scanner": "^1.0.0-alpha.11",
  "react-pdf": "^7.7.1",
  "recharts": "^2.12.7",
  "react-hook-form": "^7.52.2",
  "zod": "^3.23.8",
  "date-fns": "^3.6.0"
}
```

## 🎯 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components
│   ├── forms/           # Form components
│   ├── charts/          # Chart components
│   └── layout/          # Layout components
├── pages/               # Page components
│   ├── admin/           # Admin dashboard pages
│   ├── doctor/          # Doctor dashboard pages
│   └── auth/            # Authentication pages
├── hooks/               # Custom React hooks
├── services/            # API service functions
├── stores/              # Zustand store configurations
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── styles/              # Global styles & themes
```

## 🔧 Environment Configuration

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WS_BASE_URL=ws://localhost:5000

# App Configuration
VITE_APP_NAME="HospitaLink"
VITE_APP_VERSION="1.0.0"

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=false

# Development
VITE_MOCK_API=false
VITE_DEBUG_MODE=true
```

## 📱 Pages & Routes

### **Public Routes**
```
/                        # Landing page
/admin/login            # Admin login page
/doctor/login           # Doctor login page
```

### **Admin Protected Routes**
```
/admin                  # Admin dashboard home
/admin/patients         # Patient management
/admin/patients/new     # Patient registration
/admin/doctors          # Doctor management
/admin/queue            # Queue management
/admin/checkin          # QR check-in scanner
/admin/prescriptions    # Prescription management
/admin/analytics        # Analytics dashboard
/admin/settings         # System settings
```

### **Doctor Protected Routes**
```
/doctor                 # Doctor dashboard home
/doctor/queue           # Patient queue
/doctor/consultations   # Consultation management
/doctor/prescriptions   # Digital prescriptions
/doctor/patients        # Patient lookup
/doctor/chat            # Online consultations
/doctor/schedule        # Schedule management
/doctor/profile         # Doctor profile
```

## 🎨 UI Component Library

### **Form Components**
- `PatientRegistrationForm` - Complete patient registration
- `DoctorProfileForm` - Doctor profile management
- `PrescriptionForm` - Digital prescription creation
- `LoginForm` - Authentication forms

### **Data Display Components**
- `PatientTable` - Advanced patient data grid
- `QueueDashboard` - Real-time queue monitoring
- `AnalyticsCharts` - Various chart components
- `PrescriptionViewer` - Prescription display

### **Interactive Components**
- `QRScanner` - QR code scanning interface
- `ChatInterface` - Real-time messaging
- `Calendar` - Appointment scheduling
- `NotificationCenter` - System notifications

## 🚀 Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:mock         # Start with mock API
npm run dev:https        # Start with HTTPS

# Building
npm run build            # Production build
npm run build:analyze    # Build dengan bundle analyzer
npm run preview          # Preview production build

# Code Quality
npm run lint             # ESLint checking
npm run lint:fix         # Auto-fix ESLint issues
npm run type-check       # TypeScript type checking
npm run format           # Prettier formatting

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:e2e         # End-to-end tests
```

## 🔒 Security Features

### **Authentication & Authorization**
- JWT token management dengan auto-refresh
- Role-based route protection
- Secure API token storage
- Session timeout handling

### **Data Security**
- Input sanitization & validation
- XSS protection
- CSRF protection
- Secure HTTP headers

## 📊 State Management

### **Global Stores**
```typescript
// Auth Store
interface AuthStore {
  user: User | null
  token: string | null
  login: (credentials: LoginData) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

// Patient Store
interface PatientStore {
  patients: Patient[]
  currentPatient: Patient | null
  fetchPatients: () => Promise<void>
  addPatient: (patient: CreatePatientData) => Promise<void>
  updatePatient: (id: string, data: UpdatePatientData) => Promise<void>
}

// Queue Store
interface QueueStore {
  queue: QueueItem[]
  currentNumber: number
  estimatedWaitTime: number
  fetchQueue: () => Promise<void>
  callNextPatient: () => Promise<void>
}
```

## 🎯 API Integration

### **Service Functions**
```typescript
// Auth Service
export const authService = {
  adminLogin: (credentials) => api.post('/web/admin/login', credentials),
  doctorLogin: (credentials) => api.post('/web/doctor/login', credentials),
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout')
}

// Patient Service
export const patientService = {
  getPatients: () => api.get('/web/admin/patients'),
  createPatient: (data) => api.post('/web/admin/patients', data),
  updatePatient: (id, data) => api.put(`/web/admin/patients/${id}`, data),
  generateCard: (id) => api.get(`/web/admin/patients/${id}/card`)
}
```

## 📱 Responsive Design

### **Breakpoints**
```css
/* Mobile First Approach */
sm: '640px'     # Mobile landscape
md: '768px'     # Tablet
lg: '1024px'    # Desktop
xl: '1280px'    # Large desktop
2xl: '1536px'   # Extra large
```

### **Layout Components**
- `AdminLayout` - Admin dashboard layout dengan sidebar
- `DoctorLayout` - Doctor dashboard layout
- `AuthLayout` - Authentication pages layout
- `MobileNavigation` - Mobile responsive navigation

## 🔧 Build & Deployment

### **Production Build**
```bash
npm run build
# Output: dist/ folder ready for deployment
```

### **Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["npx", "serve", "-s", "dist", "-l", "3000"]
```

### **Static Hosting**
- **Netlify**: Drag & drop `dist/` folder
- **Vercel**: Connect GitHub repository
- **AWS S3**: Upload `dist/` ke S3 bucket
- **GitHub Pages**: Deploy dari `gh-pages` branch

## 🧪 Testing Strategy

### **Unit Tests**
- Component testing dengan React Testing Library
- Hook testing dengan custom test utilities
- Service function testing dengan MSW

### **Integration Tests**
- API integration testing
- Form submission flows
- Authentication flows

### **E2E Tests**
- Critical user journeys
- Cross-browser compatibility
- Mobile responsiveness

## 📈 Performance Optimization

### **Code Splitting**
- Route-based code splitting
- Component lazy loading
- Dynamic imports untuk heavy components

### **Caching Strategy**
- React Query untuk API caching
- Service Worker untuk asset caching
- Browser storage untuk user preferences

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow coding standards (ESLint + Prettier)
4. Write tests untuk new features
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 📞 Support & Contact

- **Email**: frontend@hospitalink.com
- **Documentation**: [Frontend Documentation](https://docs.hospitalink.com/frontend)
- **Design System**: [Figma Design System](https://figma.com/hospitalink-design)
- **Issues**: [GitHub Issues](https://github.com/hospitalink/frontend/issues)

---

**HospitaLink Frontend** - Modern Healthcare Management Interface 🏥✨
