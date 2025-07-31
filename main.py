import sys
import os

# This line programmatically adds the project's root directory to the Python path.
# This is a robust way to ensure that modules can be found in deployment environments.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.user_routes import user_router
from routes.tool_routes import tool_router
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="AIBUDDIES",
    description="AI-powered tools for content creators.",
    version="1.0.0"
)

# CORS (Cross-Origin Resource Sharing)
# --- THIS SECTION IS UPDATED ---
# We are now allowing all origins. This is great for development and debugging.
# For final production, you might want to restrict this to your specific Vercel URL.
origins = ["*"] 

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Root"])
async def read_root():
    """A simple endpoint to check if the API is running."""
    return {"message": "Welcome to AIBUDDIES API!"}

# Include routers for different parts of the application
app.include_router(user_router, prefix="/users", tags=["User Management"])
app.include_router(tool_router, prefix="/tools", tags=["AI Tools"])
