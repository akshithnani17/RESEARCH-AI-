from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class MasterPromptResponse(BaseModel):
    id: int
    project_id: int
    prompt_text: str
    word_count: int
    char_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class GeneratePromptRequest(BaseModel):
    project_id: int
    custom_instructions: Optional[str] = None
