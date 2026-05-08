# ZOG Store Frontend

A modern, responsive e-commerce frontend application for the ZOG Game Store - built with React, Vite, and Tailwind CSS.

## Features

### User Features
- 🎮 Browse game catalog with beautiful card layouts
- 🔍 Real-time search functionality
- 🎯 Filter games by genre
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🛒 Shopping cart with quantity management
- 📦 Order history and tracking
- 👤 User authentication (login/signup)
- 🎨 Modern UI with smooth animations

### Admin Features
- 📊 Dashboard with statistics
- 🎲 Game management (CRUD operations)
- 📦 Order management
- 👥 User management
- 📈 Inventory tracking
- 🎨 Dedicated admin interface

## Tech Stack

- **React** (v19.0.0) - UI library
- **Vite** (v6.0.11) - Build tool and dev server
- **React Router** (v7.1.1) - Client-side routing
- **Tailwind CSS** (v4.1.0) - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client (if used)

## Project Structure

```
frontend/
├── public/
│   ├── game-icons/          # Game icon images
│   └── logo.svg             # App logo
├── src/
│   ├── assets/              # Static assets
│   │   ├── logo.svg
│   │   ├── overlay.png
│   │   └── react.svg
│   ├── components/          # Reusable components
│   │   ├── Navbar.jsx       # Navigation bar with cart count
│   │   ├── AdminSidebar.jsx # Admin navigation sidebar
│   │   ├── Loader.jsx       # Loading spinner
│   │   ├── Toast.jsx        # Toast notifications
│   │   └── MobileAdminRedirect.jsx
│   ├── pages/               # Page components
│   │   ├── user/           # User-facing pages
│   │   │   ├── HomePage.jsx
│   │   │   ├── GameDetails.jsx
│   │   │   ├── CartPage.jsx
│   │   │   └── OrdersPage.jsx
│   │   ├── admin/          # Admin pages
│   │   │   ├── AdminPage.jsx
│   │   │   ├── GameManagement.jsx
│   │   │   ├── OrderManagement.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   └── InventoryManagement.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── hooks/              # Custom React hooks
│   │   └── useAuthCheck.js # Authentication hook
│   ├── App.jsx             # Main app component with routes
│   └── main.jsx            # Application entry point
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── eslint.config.js        # ESLint configuration
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Installation

### Prerequisites
- Node.js (v20 or higher)
- npm or yarn

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   Navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## Configuration

### Backend API URL
The frontend connects to the backend at `http://localhost:3000`. Update the API base URL in component files if your backend runs on a different port.

### Vite Configuration
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

## Pages & Routes

### Public Routes
- `/` - Redirect to login
- `/login` - User login page
- `/signup` - User registration page

### User Routes (Protected)
- `/home` - Game catalog homepage
- `/game/:gameId` - Game details page
- `/cart` - Shopping cart
- `/orders` - Order history

### Admin Routes (Protected - Admin Only)
- `/admin` - Admin dashboard
- `/admin/games` - Game management
- `/admin/orders` - Order management
- `/admin/users` - User management
- `/admin/inventory` - Inventory management

### Error Routes
- `*` - 404 Not Found page

## Components

### Navbar
- Logo and branding
- Navigation links
- Search functionality
- Shopping cart icon with count
- User profile menu

### AdminSidebar
- Navigation for admin pages
- Active route highlighting
- Logout functionality

### Loader
- Full-screen loading spinner
- Used during data fetching

### Toast
- Success/error notifications
- Auto-dismiss after 3 seconds
- Customizable message and type

## Custom Hooks

### useAuthCheck
Handles authentication verification and redirects:
```javascript
const useAuthCheck = () => {
  // Checks if user is authenticated
  // Redirects to login if not authenticated
  // Checks admin access for admin routes
};
```

## Styling

### Tailwind CSS
The app uses Tailwind CSS v4 with custom configuration:

**Color Palette:**
- Primary: `#7C5DF9` (Purple)
- Background: `#0A0A0B` (Dark)
- Cards: `#1E1E2E` (Dark Navy)

**Custom Classes:**
- Gradient backgrounds
- Backdrop blur effects
- Custom animations
- Responsive breakpoints

### Design System
- Modern glassmorphism effects
- Smooth hover transitions
- Purple accent colors
- Dark theme throughout
- Card-based layouts

## Features in Detail

### Search & Filter
- Real-time search by game title
- Genre-based filtering
- Platform badges
- Search results with highlighting

### Shopping Cart
- Add/remove items
- Quantity adjustment
- Stock validation
- Real-time price calculation
- Cart count badge in navbar

### Game Cards
- Game icon/cover image
- Title and pricing
- Genre and platform tags
- Hover effects
- Click to view details

### Admin Dashboard
- Statistics cards (Revenue, Orders, Games, Users)
- Quick action buttons
- Data tables with sorting
- CRUD operations for games
- Order status management

## Development Tips

### Hot Module Replacement (HMR)
Vite provides fast HMR for instant updates during development.

### Component Organization
- Keep components small and focused
- Use custom hooks for reusable logic
- Separate user and admin components

### State Management
- React hooks (useState, useEffect)
- URL state for search/filters
- Session storage for cart persistence

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Lazy loading of images
- Code splitting by routes
- Vite's optimized bundling
- Minimal re-renders with proper hooks usage

## Troubleshooting

### Port Already in Use
Vite will automatically use the next available port (5174, 5175, etc.)

### API Connection Issues
- Verify backend is running on port 3000
- Check CORS configuration in backend
- Ensure proper credentials are included in fetch requests

### Images Not Loading
- Verify images exist in `public/game-icons/`
- Check image paths in database
- Clear browser cache

## Future Enhancements

- [ ] Wishlist functionality
- [ ] Game reviews and ratings
- [ ] Advanced search filters
- [ ] Price sorting
- [ ] User profile page
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Dark/Light theme toggle

## Contributing

1. Follow the existing code style
2. Use meaningful component and variable names
3. Add comments for complex logic
4. Test responsive design on multiple devices

## License

ISC

---

**Built with ❤️ using React, Vite, and Tailwind CSS**
