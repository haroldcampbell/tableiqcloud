from fastapi import FastAPI
from app.api.routes import router as api_router
# import logging
# import uvicorn

# logger = logging.getLogger(__name__)
# logger.setLevel(logging.DEBUG)

app = FastAPI()
app.include_router(api_router)

# if __name__ == '__main__':
    # uvicorn.run(app, log_level="debug")