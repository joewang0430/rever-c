from app.routers.schemas import Move, FetchAIMoveParams, AIMoveResult
from .prompt import Prompt
from openai import OpenAI
import google.generativeai as genai
import os
from dotenv import load_dotenv
import json

load_dotenv()
SYSTEM_PROMPT = "You are a helpful assistant"   # TODO: change it later

class PlayAgent:
    @staticmethod
    def get_put(aiId: str, params: FetchAIMoveParams):
        prompt = Prompt.get_put_prompt_normal(params)
        ai_methods = {
            "deepseek-r1": PlayAgent.get_put_deepseek_r1,
            "gemini-2pt5": PlayAgent.get_put_gemini_2pt5,
            "qwen-3": PlayAgent.get_put_qwen_3,
        }
        method = ai_methods.get(aiId)
        if not method:
            return {"error": f"Unknown aiId: {aiId}"}
        try:
            ai_return = method(params, prompt)
            return ai_return
        except json.JSONDecodeError:
            return {"error": "JSON Decode Error", "raw_content": ai_return}
        
    @staticmethod
    def get_put_deepseek_r1(params: FetchAIMoveParams, prompt: str):
        key = os.environ.get("DEEPSEEK_KEY")
        base_url = os.environ.get("DEEPSEEK_BASE_URL")
        model_name = os.environ.get("DEEPSEEK_R1_MODEL")

        client = OpenAI(api_key=key, base_url=base_url)

        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                stream=False
            )
            return response.choices[0].message.content
        except Exception as e:
            return {"error (get_put_deepseek_r1): ": str(e)}

    @staticmethod
    def get_put_gemini_2pt5(prompt: str):
        model_name = os.environ.get("GEMINI_2PT5_MODEL")
        key = os.environ.get("GEMINI_KEY")

        genai.configure(api_key=key)
        model = genai.GenerativeModel(model_name)

        try: 
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return {"error (get_put_gemini_2pt5): ": str(e)}

    @staticmethod
    def get_put_qwen_3(params: FetchAIMoveParams, prompt: str):
        pass


# Test only
if __name__ == "__main__":
    test_prompt = "Hello, who are you"

    print("Testing get_put_gemini_2pt5...")
    result = PlayAgent.get_put_gemini_2pt5(prompt=test_prompt)
    print("AI Response:")
    print(result)