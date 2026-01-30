from pydantic import BaseModel
from typing import Optional

class OrderRequestIn(BaseModel):
    product_id: str
    message: Optional[str] = "मला हा product घ्यायचा आहे."
