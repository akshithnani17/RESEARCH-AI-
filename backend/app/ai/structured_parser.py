import json
import re
from typing import Any, Dict, Optional

class StructuredJSONParser:
    @staticmethod
    def parse_json(raw_text: str) -> Optional[Dict[str, Any]]:
        if not raw_text:
            return None
        
        # 1. Try direct json.loads
        try:
            return json.loads(raw_text.strip())
        except Exception:
            pass

        # 2. Extract ```json ... ``` markdown fence
        json_pattern = r'```(?:json)?\s*([\s\S]*?)\s*```'
        match = re.search(json_pattern, raw_text)
        if match:
            candidate = match.group(1).strip()
            try:
                return json.loads(candidate)
            except Exception:
                pass

        # 3. Find outermost curly braces { ... }
        start = raw_text.find('{')
        end = raw_text.rfind('}')
        if start != -1 and end != -1 and end > start:
            candidate = raw_text[start:end+1]
            try:
                return json.loads(candidate)
            except Exception:
                # Attempt minor syntax repairs: trailing commas
                repaired = re.sub(r',\s*([\}\]])', r'\1', candidate)
                try:
                    return json.loads(repaired)
                except Exception:
                    pass

        return None
