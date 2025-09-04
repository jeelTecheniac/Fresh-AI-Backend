# Fresh AI Backend

A production-ready Node.js backend project scaffold built with TypeScript, PostgreSQL, and TypeORM. Features a clean, layered architecture with clear separation of concerns, comprehensive testing, and modern development tooling.

## 🚀 Features

- **TypeScript** - Full type safety and modern ES2022+ features
- **PostgreSQL** - Robust relational database with TypeORM
- **Layered Architecture** - Controllers → Services → Repositories → Entities
- **JWT Authentication** - Secure token-based authentication
- **Comprehensive Testing** - Jest unit tests with mocking
- **Code Quality** - ESLint + Prettier + Husky pre-commit hooks
- **Database Migrations** - TypeORM CLI with migration support
- **Security** - Helmet, CORS, rate limiting, input validation
- **Logging** - Structured logging with configurable levels
- **Error Handling** - Global error handling with consistent responses

## 🛠️ Tech Stack

- **Runtime**: Node.js 22+ (LTS recommended)
- **Language**: TypeScript 5.3+
- **Framework**: Express.js 4.18+
- **Database**: PostgreSQL 12+
- **ORM**: TypeORM 0.3+
- **Authentication**: JWT with bcrypt
- **Testing**: Jest + ts-jest
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged

## 📋 Prerequisites

- Node.js 22+ installed
- PostgreSQL 12+ installed and running
- Git for version control

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Fresh-AI-backend
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit .env with your database credentials
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=fresh_ai_db
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_chars
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb fresh_ai_db

# Run migrations
npm run migration:run
```

### 4. Start Development Server

```bash
npm run dev
```

Your API will be available at `http://localhost:3000`

## 📚 Available Scripts

| Script                  | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Start development server with hot reload |
| `npm run build`         | Build TypeScript to JavaScript           |
| `npm run start`         | Start production server                  |
| `npm run test`          | Run unit tests                           |
| `npm run test:watch`    | Run tests in watch mode                  |
| `npm run test:coverage` | Run tests with coverage report           |
| `npm run lint`          | Run ESLint                               |
| `npm run lint:fix`      | Fix ESLint issues automatically          |
| `npm run format`        | Format code with Prettier                |
| `npm run typecheck`     | Type check without building              |

## 🗄️ Database Migrations

### Development vs Production

This project supports two migration workflows:

- **Development**: Uses TypeScript files directly with tsx for faster development
- **Production**: Uses compiled JavaScript files for better performance and reliability

### Development Migrations (TypeScript)

```bash
# Generate new migration
npm run migration:generate -- migrations/CreateUserTable

# Run pending migrations
npm run migration:run

# Show migration status
npm run migration:show

# Revert last migration
npm run migration:revert
```

### Production Migrations (JavaScript)

```bash
# Run pending migrations in production
npm run migration:run:prod

# Show migration status in production
npm run migration:show:prod

# Revert last migration in production
npm run migration:revert:prod
```

> **Note**: Production commands automatically build the project first and set NODE_ENV=production

### Migration Naming Convention

Use descriptive names that indicate what the migration does:
- `CreateUserTable` - Initial table creation
- `AddUserFields` - Adding new columns
- `UpdateUserSchema` - Modifying existing schema

## 🏗️ Project Structure

```
src/
├── controllers/     # HTTP request handlers
├── services/       # Business logic layer
├── repositories/   # Data access layer
├── entities/       # TypeORM database models
├── middleware/     # Express middleware
├── routes/         # API route definitions
├── utils/          # Utility functions
├── config/         # Configuration files
├── app.ts          # Express app setup
└── server.ts       # Server bootstrap
```

## 🔐 API Endpoints

### Authentication

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| `POST` | `/api/auth/register` | User registration |
| `POST` | `/api/auth/login`    | User login        |

### Users

| Method | Endpoint             | Description                 | Auth Required |
| ------ | -------------------- | --------------------------- | ------------- |
| `GET`  | `/api/users/profile` | Get current user profile    | ✅            |
| `PUT`  | `/api/users/profile` | Update current user profile | ✅            |
| `GET`  | `/api/users`         | Get all users (paginated)   | ✅            |
| `GET`  | `/api/users/:id`     | Get user by ID              | ✅            |

### Health Check

| Method | Endpoint      | Description                |
| ------ | ------------- | -------------------------- |
| `GET`  | `/`           | API info and health status |
| `GET`  | `/api/health` | Detailed health check      |

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### JWT Configuration

- **Secret**: Set via `JWT_SECRET` environment variable (minimum 32 characters)
- **Expiration**: Configurable via `JWT_EXPIRES_IN` (default: 24h)
- **Algorithm**: HS256 (HMAC SHA256)

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Test individual service methods
- **Mocking**: Repository layer is mocked for isolation
- **Coverage**: Jest provides detailed coverage reports

## 🔧 Development Tools

### Code Quality

- **ESLint**: TypeScript-aware linting with strict rules
- **Prettier**: Automatic code formatting
- **Husky**: Git hooks for pre-commit validation
- **lint-staged**: Run linters only on staged files

### Pre-commit Hooks

Automatically runs on every commit:

- ESLint validation
- TypeScript type checking
- Code formatting

## 🚀 Production Deployment

### Environment Variables

Set these in production:

- `NODE_ENV=production`
- `PORT` (your server port)
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET` (strong, unique secret)
- `ALLOWED_ORIGINS` (comma-separated list of allowed CORS origins)

### Build and Start

```bash
npm run build
npm start
```

## 🔍 Adding New Features

### 1. Create Entity

```typescript
// src/entities/NewEntity.ts
@Entity("new_entities")
export class NewEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // ... other fields
}
```

### 2. Create Repository

```typescript
// src/repositories/NewEntityRepository.ts
export class NewEntityRepository {
  private repository: Repository<NewEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(NewEntity);
  }

  // ... CRUD methods
}
```

### 3. Create Service

```typescript
// src/services/NewEntityService.ts
export class NewEntityService {
  private repository: NewEntityRepository;

  constructor() {
    this.repository = new NewEntityRepository();
  }

  // ... business logic methods
}
```

### 4. Create Controller

```typescript
// src/controllers/NewEntityController.ts
export class NewEntityController {
  private service: NewEntityService;

  constructor() {
    this.service = new NewEntityService();
  }

  // ... HTTP handler methods
}
```

### 5. Create Routes

```typescript
// src/routes/newEntity.ts
const router = Router();
const controller = new NewEntityController();

router.get("/", async (req, res) => {
  await controller.getAll(req, res);
});

export default router;
```

### 6. Create Migration

```bash
npm run migration:create -- --name=CreateNewEntityTable
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Create a GitHub issue for bugs or feature requests
- **Documentation**: Check the code comments and this README
- **Community**: Reach out to the development team

## 🔄 Changelog

### v3.0.0

- **Implemented Joi validation system** 🎯
- **Improved code structure** with BaseController and centralized configuration
- **Removed class-validator** in favor of more performant Joi validation
- **Enhanced error handling** with comprehensive error middleware
- **Better separation of concerns** between validation, business logic, and data access

### v2.0.0

- **Upgraded to Node.js 22 LTS** 🚀
- Enhanced TypeScript configuration for ES2024
- Updated all dependencies to latest LTS versions
- Improved performance and security
- Better ES modules support

### v1.0.0

- Initial project scaffold
- User authentication system
- TypeORM integration with PostgreSQL
- Comprehensive testing setup
- Development tooling (ESLint, Prettier, Husky)
- Production-ready configuration

---

**Happy Coding! 🎉**
