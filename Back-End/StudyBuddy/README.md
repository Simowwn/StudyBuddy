# Study Buddy Backend

A Django REST API backend for the Study Buddy learning platform with JWT authentication.

## Features

- 🔐 JWT Authentication with Simple JWT
- 🛡️ CORS configuration for frontend integration
- 📊 PostgreSQL database support
- 🐳 Docker support
- 🔄 RESTful API design
- 📝 Comprehensive API documentation

## Setup

### Prerequisites

- Python 3.8+
- PostgreSQL
- pip

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create environment file:
Create a `.env` file in the root directory with the following content:
```env
# Database Configuration
POSTGRES_DB=studybuddy_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Django Configuration
SECRET_KEY=your-secret-key-here
DEBUG=True
```

3. Run migrations:
```bash
python manage.py migrate
```

4. Create superuser (optional):
```bash
python manage.py createsuperuser
```

5. Start the development server:
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register/` | Register a new user |
| POST | `/api/users/login/` | Login user and get JWT tokens |
| POST | `/api/token/refresh/` | Refresh JWT access token |

### Quizzes (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quizzes/` | Get all quizzes for authenticated user |
| POST | `/api/quizzes/` | Create a new quiz |
| GET | `/api/quizzes/{id}/` | Get specific quiz |
| PUT | `/api/quizzes/{id}/` | Update quiz |
| DELETE | `/api/quizzes/{id}/` | Delete quiz |

### Users (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/users/` | Get all users |
| GET | `/api/users/users/{id}/` | Get specific user |
| PUT | `/api/users/users/{id}/` | Update user |
| DELETE | `/api/users/users/{id}/` | Delete user |

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Login**: Send credentials to `/api/users/login/` to receive access and refresh tokens
2. **Protected Requests**: Include `Authorization: Bearer <access_token>` header
3. **Token Refresh**: Use refresh token at `/api/token/refresh/` when access token expires

### Example Login Request

```bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "password": "password"}'
```

Response:
```json
{
  "username": "user",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Example Protected Request

```bash
curl -X GET http://localhost:8000/api/quizzes/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

## Models

### User
- `id`: Primary key
- `username`: Unique username
- `password`: Hashed password

### Quiz
- `id`: Primary key
- `title`: Quiz title
- `description`: Quiz description
- `user`: Foreign key to User
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## CORS Configuration

The backend is configured to allow requests from:
- `http://localhost:3000` (React development server)
- `http://127.0.0.1:3000`

## Docker Support

### Using Docker Compose

1. Build and start services:
```bash
docker-compose up --build
```

2. Run migrations:
```bash
docker-compose exec web python manage.py migrate
```

3. Create superuser:
```bash
docker-compose exec web python manage.py createsuperuser
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_DB` | Database name | `studybuddy_db` |
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | - |
| `POSTGRES_HOST` | Database host | `localhost` |
| `POSTGRES_PORT` | Database port | `5432` |
| `SECRET_KEY` | Django secret key | - |
| `DEBUG` | Debug mode | `True` |

## Development

### Running Tests

```bash
python manage.py test
```

### Creating Migrations

```bash
python manage.py makemigrations
```

### Applying Migrations

```bash
python manage.py migrate
```

## Security Features

- JWT token-based authentication
- Password hashing with Django's built-in hashers
- CORS configuration for secure cross-origin requests
- Environment-based configuration
- Database connection security

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
