
import json
import re

class AIResponseParser:
    @staticmethod
    def parse_json_from_response(response_str: str):
        """
        Extract and parse the first valid JSON object from a string.
        Returns dict if success, else None.
        """
        if not response_str or not isinstance(response_str, str):
            return None
        # Try direct JSON parse first
        try:
            return json.loads(response_str)
        except Exception:
            pass
        # Try to extract first {...} block
        match = re.search(r'\{.*?\}', response_str, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except Exception:
                return None
        return None
