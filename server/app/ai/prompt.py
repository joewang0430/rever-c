from app.routers.schemas import Move, FetchAIMoveParams, AIMoveResult


class Prompt:
    @staticmethod
    def get_put_prompt_normal(params: FetchAIMoveParams) -> list[dict]:
        return "Hello, who are u"   # TODO: change it later