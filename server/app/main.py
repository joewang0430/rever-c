from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.utils.call_c import call_test_layer1
import os

app = FastAPI(title="Reversi testing backend")

# ---- Cross-domain configuration, convenient for local development ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # TODO: Change to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ping")
async def ping():
    """ simple testing endpoint """
    return {"msg": "pong"}

@app.get("/test")
async def test_c_endpoint():
    """
    This endpoint calls a C function from a shared library and returns the result.
    """
    try:
        result = call_test_layer1()
    except FileNotFoundError as e:
        # if the shared library is not found, raise a 404 error
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"C 函数运行出错：{e}")

    return {"testLayer1_return": result}
