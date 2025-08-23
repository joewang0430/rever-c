from app.routers.schemas import Move, FetchAIMoveParams, AIMoveResult
from app.ai.utils import AIResponseParser
from .prompt import Prompt
from openai import OpenAI
import google.generativeai as genai
import os
from dotenv import load_dotenv
import json

env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(dotenv_path=env_path)

TEST_PROMPT = "You are a helpful assistant"   
REVERSI_PROMPT = "You are a master of playing Reversi (Othello) game"


class PlayAgent:
    # Pre-initialize clients for efficiency
    try:
        # Validate environment variables
        required_env_vars = {
            "DEEPSEEK_KEY": os.environ.get("DEEPSEEK_KEY"),
            "DEEPSEEK_BASE_URL": os.environ.get("DEEPSEEK_BASE_URL"),
            "QWEN_KEY": os.environ.get("QWEN_KEY"),
            "QWEN_BASE_URL": os.environ.get("QWEN_BASE_URL"),
            "GEMINI_KEY": os.environ.get("GEMINI_KEY"),
            "GEMINI_2PT5_MODEL": os.environ.get("GEMINI_2PT5_MODEL"),
        }
        
        missing_vars = [k for k, v in required_env_vars.items() if not v]
        if missing_vars:
            print(f"WARNING: Missing environment variables: {missing_vars}")
        
        deepseek_client = OpenAI(
            api_key=os.environ.get("DEEPSEEK_KEY"),
            base_url=os.environ.get("DEEPSEEK_BASE_URL")
        ) if os.environ.get("DEEPSEEK_KEY") else None
        
        qwen_client = OpenAI(
            api_key=os.environ.get("QWEN_KEY"),
            base_url=os.environ.get("QWEN_BASE_URL")
        ) if os.environ.get("QWEN_KEY") else None
        
        if os.environ.get("GEMINI_KEY"):
            genai.configure(api_key=os.environ.get("GEMINI_KEY"))
            gemini_model = genai.GenerativeModel(os.environ.get("GEMINI_2PT5_MODEL"))
        else:
            gemini_model = None
            
    except Exception as e:
        print(f"FATAL: Failed to initialize AI clients - {e}")
        deepseek_client = qwen_client = gemini_model = None

    @staticmethod
    def get_put(aiId: str, params: FetchAIMoveParams):
        # Validate aiId first
        ai_methods = {
            "deepseek-v3": PlayAgent.get_put_deepseek_v3,
            "gemini-2pt5": PlayAgent.get_put_gemini_2pt5,
            "qwen-3": PlayAgent.get_put_qwen_3,
        }
        method = ai_methods.get(aiId)
        if not method:
            return {"error": f"Unknown aiId: {aiId}"}
        
        try:
            prompt = Prompt.get_put_prompt_normal(params)
            ai_response_str = method(params, prompt)

            # Enhanced error handling for AI response
            if not ai_response_str or not isinstance(ai_response_str, str):
                return {"error": "Empty or invalid AI response"}

            # Remove code block markers if present
            if "```json" in ai_response_str:
                ai_response_str = ai_response_str.split("```json")[1].split("```", 1)[0].strip()

            parsed_json = AIResponseParser.parse_json_from_response(ai_response_str)

            if not parsed_json or not isinstance(parsed_json, dict):
                return {"error": "AI response is not a JSON object", "raw_content": ai_response_str}

            # Check for required fields
            if "row" not in parsed_json or "col" not in parsed_json:
                return {"error": "Missing row or col in AI response", "raw_content": ai_response_str}

            # Validate row/col are integers
            try:
                parsed_json["row"] = int(parsed_json["row"])
                parsed_json["col"] = int(parsed_json["col"])
            except (ValueError, TypeError):
                return {"error": "row and col must be integers", "raw_content": ai_response_str}

            return parsed_json

        except (json.JSONDecodeError, IndexError) as e:
            return {"error": "JSON Decode Error", "raw_content": ai_response_str, "details": str(e)}
        except Exception as e:
            return {"error": "Unexpected error in AI processing", "raw_content": ai_response_str if 'ai_response_str' in locals() else "N/A", "details": str(e)}
        
    @staticmethod
    def get_put_deepseek_v3(params: FetchAIMoveParams, prompt: str):
        # Use pre-initialized client for performance
        model_name = os.environ.get("DEEPSEEK_V3_MODEL")
        try:
            response = PlayAgent.deepseek_client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": REVERSI_PROMPT}, # Use Reversi prompt for better context
                    {"role": "user", "content": prompt},
                ],
                stream=False
            )
            return response.choices[0].message.content
        except Exception as e:
            return f'{{"error": "Error from DeepSeek API: {str(e)}"}}'

    @staticmethod
    def get_put_gemini_2pt5(params: FetchAIMoveParams, prompt: str):
        # Use pre-initialized model for performance
        try:
            # Combine system prompt and user prompt for better context
            full_prompt = f"{REVERSI_PROMPT}\n\n{prompt}"
            response = PlayAgent.gemini_model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            return f'{{"error": "Error from Gemini API: {str(e)}"}}'

    @staticmethod
    def get_put_qwen_3(params: FetchAIMoveParams, prompt: str):
        # Use pre-initialized client for performance
        model_name = os.environ.get("QWEN_3_MODEL")
        try:
            completion = PlayAgent.qwen_client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": REVERSI_PROMPT}, # Use Reversi prompt for better context
                    {"role": "user", "content": prompt},
                ],
                extra_body={"enable_thinking": False}, # Disable thinking for non-stream output
            )
            return completion.choices[0].message.content
        except Exception as e:
            return f'{{"error": "Error from Qwen API: {str(e)}"}}'

# Test only
if __name__ == "__main__":
    test_prompt = "Hello, who are you"
    print("Testing...")
    # Pass params=None for testing
    result = PlayAgent.get_put_qwen_3(params=None, prompt=test_prompt)
    print("AI Response:")
    print(result)