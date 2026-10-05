# Step1: Create API keys

# Step2: Create Client and send request
from deepgram import DeepgramClient
import os
from pathlib import Path
from dotenv import load_dotenv
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_DOCTOR_AUDIO = BASE_DIR / "doctor_response.mp3"
def convert_text_to_doctor_audio(text, output_filepath=DEFAULT_DOCTOR_AUDIO):
    deepgram_api_key = os.environ.get("DEEPGRAM_API_KEY")
    deepgram = DeepgramClient(api_key=deepgram_api_key)
    audio = deepgram.speak.v1.audio.generate(
        text=text,
        model=os.environ.get("DEEPGRAM_TTS_MODEL", "aura-2-thalia-en"),
        encoding="mp3",
    )

    output_filepath = Path(output_filepath)
    with output_filepath.open("wb") as file:
        for chunk in audio:
            file.write(chunk)

    return output_filepath

import subprocess
import platform
def play_audio(audio_filepath):
    audio_filepath = str(audio_filepath)

    if platform.system() == "Darwin":
        subprocess.run(["afplay", audio_filepath], check=False)
    elif platform.system() == "Windows":
        os.startfile(audio_filepath)
    else:
        subprocess.run(["xdg-open", audio_filepath], check=False)


if __name__ == "__main__":
    text = "Hi, my name is prajaktha, who are you?. I am very happy."
    audio_path = convert_text_to_doctor_audio(
        text,
        Path(__file__).with_name("test-output.mp3"),
    )
    play_audio(audio_path)