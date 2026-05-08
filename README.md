# ZOG Store - Game Store E-commerce Platform

A modern, full-stack e-commerce platform for buying and selling video games. Built with React, Node.js, Express, and MongoDB.

## Features

### User Features
- 🎮 Browse game catalog with search and filter functionality
- 🔍 Search games by title
- 🎯 Filter games by genre (RPG, Action, Adventure, Sports, etc.)
- 🛒 Shopping cart management
- 📦 Order tracking and history
- 👤 User authentication and profile management
- 💳 Secure checkout process
- 📱 Fully responsive design

### Admin Features
- 📊 Dashboard with analytics
- 🎲 Game management (Add, Edit, Delete games)
- 📦 Order management
- 👥 User management
- 📈 Inventory tracking
- 🔐 Role-based access control

## Tech Stack

### Frontend
- **React** (v19.0.0) - UI library
- **Vite** - Build tool and dev server
- **React Router** (v7.1.1) - Client-side routing
- **Tailwind CSS** (v4.1.0) - Utility-first CSS framework
- **Lucide React** - Icon library
- **Axios** - HTTP client

### Backend
- **Node.js** (v20+) - Runtime environment
- **Express** (v5.1.0) - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** (v9.6.1) - MongoDB ODM
- **Express Session** - Session management
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

## Project Structure

```
webProject/
├── backend/                 # Backend server
│   ├── models/             # Mongoose models
│   │   ├── User.js
│   │   ├── Game.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   └── Counter.js
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── games.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   └── admin.js
│   ├── middleware/         # Custom middleware
│   │   └── auth.js
│   ├── seed.js            # Database seeding script
│   ├── server.js          # Express server setup
│   └── package.json
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── AdminSidebar.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── Toast.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── user/     # User pages
│   │   │   │   ├── HomePage.jsx
│   │   │   │   ├── GameDetails.jsx
│   │   │   │   ├── CartPage.jsx
│   │   │   │   └── OrdersPage.jsx
│   │   │   ├── admin/    # Admin pages
│   │   │   │   ├── AdminPage.jsx
│   │   │   │   ├── GameManagement.jsx
│   │   │   │   ├── OrderManagement.jsx
│   │   │   │   ├── UserManagement.jsx
│   │   │   │   └── InventoryManagement.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── hooks/         # Custom React hooks
│   │   │   └── useAuthCheck.js
│   │   ├── main.jsx       # App entry point
│   │   └── App.jsx        # Main app component
│   ├── public/
│   │   └── game-icons/    # Game icon images
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md              # This file
```

## Installation

### Prerequisites
- Node.js (v20 or higher)
- MongoDB (running locally or MongoDB Atlas account)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/gamestore
SESSION_SECRET=your-secret-key-here
PORT=3000
```

4. Seed the database with initial data:
```bash
node seed.js
```

5. Start the backend server:
```bash
npm start
# or for development with auto-restart
npm run dev
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Default Credentials

After seeding the database, you can log in with:

### Admin Account
- Email: `admin@zogstore.com`
- Password: `admin123`

### User Account
- Email: `john@example.com`
- Password: `user123`

## API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/check` - Check authentication status

### Games
- `GET /games` - Get all games
- `GET /games/game?gameId=:id` - Get single game
- `GET /games/search?title=:query` - Search games
- `GET /games/filter?genre=:genre` - Filter by genre
- `GET /games/genres` - Get all genres

### Cart
- `GET /cart` - Get user's cart
- `POST /cart/add` - Add item to cart
- `PUT /cart/update/:itemId` - Update cart item
- `DELETE /cart/remove/:itemId` - Remove from cart
- `GET /cart/count` - Get cart item count

### Orders
- `POST /orders/create` - Create new order
- `GET /orders` - Get user's orders
- `GET /orders/:orderId` - Get order details

### Admin (Requires Admin Role)
- `GET /admin/stats` - Get dashboard statistics
- `POST /admin/games` - Add new game
- `PUT /admin/games/:id` - Update game
- `DELETE /admin/games/:id` - Delete game
- `GET /admin/orders` - Get all orders
- `PUT /admin/orders/:id` - Update order status
- `GET /admin/users` - Get all users
- `PUT /admin/users/:id` - Update user role

## Database Schema

### User
- `user_id` - Auto-incremented ID
- `username` - Unique username
- `email` - Unique email
- `password` - Hashed password
- `role` - User role (user/admin)

### Game
- `game_id` - Auto-incremented ID
- `title` - Game title
- `description` - Game description
- `price` - Game price
- `platform` - Platform (PC, PlayStation, Xbox, Nintendo)
- `genre` - Game genre
- `gameicon` - Icon image path
- `stock_quantity` - Available stock
- `is_deleted` - Soft delete flag

### Cart
- `cart_id` - Auto-incremented ID
- `user_id` - Reference to User
- `items` - Array of cart items
  - `game_id` - Reference to Game
  - `quantity` - Item quantity

### Order
- `order_id` - Auto-incremented ID
- `user_id` - Reference to User
- `total_amount` - Order total
- `status` - Order status (pending/completed/cancelled)
- `items` - Array of order items

## Features in Detail

### Search & Filter
- Real-time search by game title
- Filter by multiple genres (RPG, Action, Adventure, Sports, Racing, Shooter, Sandbox)
- Platform filtering (PC, PlayStation, Xbox, Nintendo)

### Shopping Cart
- Add multiple quantities of games
- Update quantities
- Remove items
- Real-time cart count in navbar
- Stock validation

### Order Management
- Create orders from cart
- View order history
- Track order status
- View order details

### Admin Dashboard
- Statistics cards showing:
  - Total revenue
  - Total orders
  - Total games
  - Total users
- Game inventory management
- Order status updates
- User role management

## Development

### Running in Development Mode

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongosh` or check MongoDB service
- Verify MONGODB_URI in .env file
- For MongoDB Atlas, ensure IP is whitelisted

### Port Already in Use
- Backend: Change PORT in .env file
- Frontend: Vite will prompt to use different port

### Images Not Loading
- Ensure game icons are present in `frontend/public/game-icons/`
- Check browser console for 404 errors

## Future Enhancements

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Email notifications
- [ ] Wishlist functionality
- [ ] Game reviews and ratings
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Social media integration

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please contact the development team.

---

**Built with ❤️ using React, Node.js, and MongoDB**
