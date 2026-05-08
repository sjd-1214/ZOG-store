# ZOG Store Backend

Backend server for the ZOG Game Store application - a full-featured e-commerce platform for video games built with Node.js, Express, and MongoDB.

## Features

- 🔐 User authentication and authorization with session-based login
- 🎮 Game catalog with search, filtering, and detailed game information
- 🛒 Shopping cart functionality with stock quantity validation
- 📦 Order processing and history tracking
- 📊 Admin dashboard with statistics
- 👥 User, game, and order management for administrators
- 🔄 Auto-incrementing IDs for better readability
- 🗑️ Soft delete functionality for games

## Tech Stack

- **Node.js** (v20+) - Runtime environment
- **Express** (v5.1.0) - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** (v9.6.1) - MongoDB ODM
- **Express Session** (v1.18.1) - Session management
- **bcrypt** (v5.1.1) - Password hashing
- **CORS** (v2.8.5) - Cross-origin resource sharing
- **connect-mongo** (v6.0.0) - MongoDB session store

## Project Structure

```
backend/
├── models/              # Mongoose models
│   ├── User.js          # User schema and model
│   ├── Game.js          # Game schema and model
│   ├── Cart.js          # Shopping cart schema
│   ├── Order.js         # Order schema
│   ├── OrderItem.js     # Order items schema
│   ├── Payment.js       # Payment schema
│   └── Counter.js       # Auto-increment counter schema
├── routes/              # API routes
│   ├── admin.js         # Admin routes for store management
│   ├── auth.js          # Authentication routes
│   ├── cart.js          # Shopping cart routes
│   ├── games.js         # Game catalog routes
│   └── orders.js        # Order processing routes
├── middleware/          # Express middleware
│   └── auth.js          # Authentication middleware
├── .env                 # Environment variables (not in repository)
├── db.js                # Database connection configuration
├── seed.js              # Database seeding script
├── server.js            # Main application entry point
├── package.json         # Dependencies and scripts
└── README.md            # This file
```

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create `.env` file**
   ```env
   MONGODB_URI=mongodb://localhost:27017/gamestore
   SESSION_SECRET=your-secret-key-here
   PORT=3000
   ```

3. **Seed the database** (optional - adds sample data)
   ```bash
   node seed.js
   ```

4. **Start the server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:3000`

## Default Credentials (After Seeding)

**Admin Account:**
- Email: `admin@zogstore.com`
- Password: `admin123`

**User Account:**
- Email: `john@example.com`
- Password: `user123`

## API Documentation

### Authentication Routes (`/auth`)

All routes except authentication require a valid session.

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/signup` | Register new user | Public |
| POST | `/auth/login` | User login | Public |
| POST | `/auth/logout` | User logout | Authenticated |
| GET | `/auth/check` | Check authentication status | Authenticated |

### Games Routes (`/games`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/games` | Get all games | Authenticated |
| GET | `/games/game?gameId=:id` | Get single game details | Authenticated |
| GET | `/games/search?title=:query` | Search games by title | Authenticated |
| GET | `/games/filter?genre=:genre` | Filter games by genre | Authenticated |
| GET | `/games/genres` | Get all available genres | Authenticated |

### Cart Routes (`/cart`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/cart` | Get user's cart items | Authenticated |
| GET | `/cart/count` | Get cart item count | Authenticated |
| POST | `/cart/add` | Add item to cart | Authenticated |
| PUT | `/cart/update/:itemId` | Update cart item quantity | Authenticated |
| DELETE | `/cart/remove/:itemId` | Remove item from cart | Authenticated |

**Request Body for `/cart/add`:**
```json
{
  "gameId": 1,
  "quantity": 2
}
```

### Orders Routes (`/orders`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/orders/create` | Create new order from cart | Authenticated |
| GET | `/orders` | Get user's order history | Authenticated |
| GET | `/orders/:orderId` | Get specific order details | Authenticated |

### Admin Routes (`/admin`)

All admin routes require authentication AND admin role.

**Statistics:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats` | Get dashboard statistics |

**Game Management:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/games` | Add new game |
| PUT | `/admin/games/:id` | Update game details |
| DELETE | `/admin/games/:id` | Delete game (soft delete) |

**Request Body for adding game:**
```json
{
  "title": "Game Title",
  "description": "Game description",
  "price": "49.99",
  "platform": "PC",
  "genre": "RPG",
  "gameicon": "/game-icons/game.png",
  "stock_quantity": 50
}
```

**Order Management:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/orders` | Get all orders |
| PUT | `/admin/orders/:id` | Update order status |

**User Management:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | Get all users |
| PUT | `/admin/users/:id` | Update user role |

## Database Schema

### User Model
```javascript
{
  user_id: Number (auto-increment),
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: String (enum: ["user", "admin"]),
  created_at: Date
}
```

### Game Model
```javascript
{
  game_id: Number (auto-increment),
  title: String,
  description: String,
  price: Decimal,
  platform: String,
  genre: String,
  gameicon: String (image path),
  stock_quantity: Number,
  is_deleted: Boolean,
  created_at: Date
}
```

### Cart Model
```javascript
{
  cart_id: Number (auto-increment),
  user_id: Number (ref: User),
  items: [{
    game_id: Number (ref: Game),
    quantity: Number
  }]
}
```

### Order Model
```javascript
{
  order_id: Number (auto-increment),
  user_id: Number (ref: User),
  total_amount: Decimal,
  status: String (enum: ["pending", "completed", "cancelled"]),
  items: [{
    game_id: Number (ref: Game),
    quantity: Number,
    price: Decimal
  }],
  created_at: Date
}
```

## Middleware

### Authentication Middleware
- **isAuthenticated**: Verifies user session exists
- **isAdmin**: Verifies user has admin role (requires isAuthenticated)

Usage:
```javascript
router.get('/protected', isAuthenticated, (req, res) => {
  // Route handler
});

router.get('/admin-only', isAuthenticated, isAdmin, (req, res) => {
  // Admin route handler
});
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | `mongodb://localhost:27017/gamestore` |
| SESSION_SECRET | Secret key for session encryption | `your-secret-key-123` |
| PORT | Server port number | `3000` |

## Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- Session-based authentication
- HTTP-only session cookies
- CORS configuration for frontend
- Role-based access control
- Input validation on all routes

## Development

```bash
# Install dependencies
npm install

# Run in development mode (with nodemon)
npm run dev

# Run in production mode
npm start

# Seed database with sample data
node seed.js
```

## Scripts

- `npm start` - Start the server
- `npm run dev` - Start with nodemon (auto-reload)

## License

ISC
