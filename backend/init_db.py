import os
import subprocess
import sys

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.database import Base
from app.db.init_db import init_db

def main() -> None:
    """Initialize the database."""
    
    # Create the database if it doesn't exist
    db_url = os.getenv("DATABASE_URL", "postgresql+psycopg://postgres:postgres@localhost:5432/testflow")
    
    try:
        # Create engine without database name to connect to PostgreSQL server
        engine_server = create_engine(db_url.rsplit('/', 1)[0])
        conn = engine_server.connect()
        conn.execute("COMMIT")  # Close any open transaction
        
        # Check if database exists
        result = conn.execute("SELECT 1 FROM pg_database WHERE datname = 'testflow'")
        if not result.fetchone():
            conn.execute("CREATE DATABASE testflow")
            print("Database 'testflow' created.")
        
        conn.close()
        engine_server.dispose()
    except Exception as e:
        print(f"Error creating database: {e}")
        return
    
    # Run Alembic migrations
    try:
        print("Running database migrations...")
        subprocess.run(["alembic", "upgrade", "head"], check=True)
        print("Database migrations completed.")
    except Exception as e:
        print(f"Error running migrations: {e}")
        return
    
    # Initialize the database with default data
    engine = create_engine(db_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        init_db(db)
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Error initializing database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main() 