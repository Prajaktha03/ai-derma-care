import base64
import os
from dotenv import load_dotenv
from groq import Groq

folder = os.path.dirname(__file__)
env_path = os.path.join(folder, ".env")
load_dotenv(env_path)

api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    raise ValueError("Missing GROQ_API_KEY in .env or environment")
image_path = os.path.join(folder, "sample-image.png")
with open(image_path, "rb") as file:
    image_data = base64.b64encode(file.read()).decode("utf-8")
client = Groq(api_key=api_key)
response = client.chat.completions.create(
    model=os.environ.get("GROQ_MODEL", "qwen/qwen3.8-27b"),
    max_completion_tokens=1000,
    messages = [
    {
        "role": "system",
        "content": (
            "You are a cautious skin-care assistant. First determine whether the image shows a real, visible abnormality on human skin. "
            "If there is no visible skin abnormality, the image is normal, unclear, an animal, an object, fictional, impossible, or unrelated to human skin, do not generate a diagnosis or name a disease; say that no diagnosis can be made from the image. "
            "Only when a visible human skin abnormality is present may you provide a tentative possible diagnosis, clearly state that it is not confirmed, describe the visible features, and give general skin-care guidance. "
            "Recommend a qualified clinician for persistent or concerning symptoms."
        ),
    },
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": (
                    "Inspect the image in two steps. First decide whether there is a visible abnormality on human skin. "
                    "If not, do not generate a diagnosis. This includes a normal or unclear image, an animal, an object, "
                    "or an impossible scenario such as a monkey on the moon. Say that no diagnosis can be made from the image. "
                    "Only if a visible human skin abnormality exists, give a tentative possible diagnosis, label it as unconfirmed, "
                    "and provide general skin-care advice."
                ),
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{image_data}",
                },
            },
        ],
    },
]
)

print(response.choices[0].message.content)
