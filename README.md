# TestFlow

A comprehensive test case management system with visual test flow editor, AI test case generation, and advanced reporting.

## Technology Stack

### Backend
- Python FastAPI
- PostgreSQL
- SQLAlchemy ORM
- Pydantic validation
- Authentication with JWT

### Frontend
- React 18
- TypeScript
- React Router
- Material Tailwind UI components
- MUI X Charts for data visualization
- React Flow for test flow visualization
- Axios for API requests
- TailwindCSS for styling

## Project Structure

```
/
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core functionality
│   │   ├── db/             # Database configuration
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── utils/          # Utility functions
│   │   └── main.py         # Main application
│   ├── Dockerfile          # Backend Dockerfile
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── public/             # Static files
│   ├── src/                # Source code
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   ├── App.tsx         # Main App component
│   │   └── index.tsx       # Entry point
│   ├── Dockerfile          # Frontend Dockerfile
│   └── package.json        # NPM dependencies
└── docker-compose.yml      # Docker Compose configuration
```

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js (for local development)
- Python 3.11+ (for local development)

### Running with Docker

1. Clone the repository:
```bash
git clone https://github.com/yourusername/testtrack.git
cd testtrack
```

2. Start the application:
```bash
docker-compose up -d
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Local Development

#### Backend

1. Create a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
uvicorn app.main:app --reload
```

#### Frontend

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run the application:
```bash
npm start
```

## Features

- **Authentication**: Secure user authentication and authorization
- **Visual Test Flow Editor**: Interactive node-based editor for test case visualization
- **Test Case Management**: Create, edit, and organize test cases
- **AI Test Case Generation**: Generate test cases from feature descriptions
- **Dashboard**: Visualize test metrics with interactive charts
- **Project Management**: Organize test cases by projects 