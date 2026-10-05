import base64
import logging
import os
import tempfile
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from brain_of_doctor_groq import brain_of_the_doctor
from voice_of_doctor import convert_text_to_doctor_audio
from voice_of_patient import transcribe_patient_voice


load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MAX_IMAGE_BYTES = 20 * 1024 * 1024
MAX_AUDIO_BYTES = 20 * 1024 * 1024
MAX_VIDEO_BYTES = 80 * 1024 * 1024

app = FastAPI(title="AI Skin Specialist API")
origins = os.environ.get(
    "FRONTEND_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in origins if origin.strip()],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def _save_upload(upload: UploadFile, expected_type: str, max_bytes: int) -> Path:
    if not upload.content_type or not upload.content_type.startswith(expected_type):
        raise HTTPException(
            status_code=415,
            detail=f"Please upload a valid {expected_type.rstrip('/')} file.",
        )

    content = upload.file.read(max_bytes + 1)
    if not content:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")
    if len(content) > max_bytes:
        raise HTTPException(status_code=413, detail="The uploaded file is too large.")

    suffix = Path(upload.filename or "upload").suffix.lower()[:12] or ".bin"
    with tempfile.NamedTemporaryFile(
        prefix="skin-specialist-", suffix=suffix, delete=False
    ) as file:
        file.write(content)
        return Path(file.name)


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/analyze")
def analyze_skin(
    image: UploadFile = File(...),
    patient_text: str = Form(default=""),
    audio: UploadFile | None = File(default=None),
    video: UploadFile | None = File(default=None),
) -> dict[str, str]:
    if len(patient_text) > 10_000:
        raise HTTPException(status_code=413, detail="The concern description is too long.")
    if not audio and not patient_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Add a written description or record/upload a voice note.",
        )

    temporary_paths: list[Path] = []
    try:
        image_path = _save_upload(image, "image/", MAX_IMAGE_BYTES)
        temporary_paths.append(image_path)

        audio_path = None
        if audio:
            audio_path = _save_upload(audio, "audio/", MAX_AUDIO_BYTES)
            temporary_paths.append(audio_path)

        video_path = None
        if video:
            video_path = _save_upload(video, "video/", MAX_VIDEO_BYTES)
            temporary_paths.append(video_path)

        transcript = (
            transcribe_patient_voice(str(audio_path))
            if audio_path
            else patient_text.strip()
        )
        if audio_path and patient_text.strip():
            transcript = f"{transcript}\nAdditional written notes: {patient_text.strip()}"
        guidance = brain_of_the_doctor(
            patient_text=transcript,
            image_filepath=str(image_path),
            video_filepath=str(video_path) if video_path else None,
        )

        with tempfile.NamedTemporaryFile(
            prefix="skin-specialist-", suffix=".mp3", delete=False
        ) as file:
            audio_response_path = Path(file.name)
        temporary_paths.append(audio_response_path)
        convert_text_to_doctor_audio(guidance, audio_response_path)
        audio_data = base64.b64encode(audio_response_path.read_bytes()).decode("ascii")

        return {
            "transcript": transcript,
            "guidance": guidance,
            "audio_data_url": f"data:audio/mpeg;base64,{audio_data}",
        }
    except HTTPException:
        raise
    except Exception as error:
        logger.exception("Skin consultation analysis failed")
        raise HTTPException(
            status_code=502,
            detail="Analysis could not be completed. Check the AI service configuration and try again.",
        ) from error
    finally:
        for path in temporary_paths:
            path.unlink(missing_ok=True)