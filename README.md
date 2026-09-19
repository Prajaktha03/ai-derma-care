
## 📌 Problem Statement

Over **2 billion people worldwide** face limited access to immediate dermatological care, which can contribute to delays in receiving preliminary guidance for common skin concerns.
Traditional healthcare interfaces can also create accessibility barriers for users with:

* Limited literacy
* Visual impairments
* Mobile-only access
* Difficulty describing symptoms through text

### 💡 Proposed Solution

AI Derma Care addresses these challenges through a **multimodal AI interface** that allows users to:

1. 🎙️ Describe their symptoms using their voice.
2. 📷 Upload or provide an image of the affected skin area.
3. 🤖 Process the voice and image information using AI.
4. 📝 Receive a written response.
5. 🔊 Listen to the response through AI-generated speech.

This creates a more accessible and interactive preliminary skin-health experience.

---

## ✨ Key Features

* 🎙️ **Voice Input** — Record a patient's description using a microphone.
* 📝 **Speech-to-Text** — Convert patient audio into text using Groq-powered Whisper.
* 📷 **Skin Image Analysis** — Analyze uploaded skin images using a vision-capable Llama model.
* 🧠 **AI Medical Reasoning** — Generate preliminary insights based on the provided information.
* 🔊 **Text-to-Speech** — Convert the AI response into natural speech using Deepgram.
* ⚡ **Low-Latency Processing** — Designed for fast multimodal interaction.
* 🖥️ **Gradio Interface** — Simple browser-based interface for interacting with the application.
* 🔐 **Environment-Based API Keys** — API credentials are stored through environment variables.

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │       Patient        │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
             🎙️ Voice                    📷 Image
                 │                           │
                 ▼                           ▼
       ┌──────────────────┐       ┌────────────────────┐
       │ Groq Whisper     │       │ Llama Vision Model │
       │ Speech-to-Text   │       │ Image Analysis     │
       └────────┬─────────┘       └──────────┬─────────┘
                │                            │
                └────────────┬───────────────┘
                             ▼
                   ┌─────────────────────┐
                   │   AI Doctor Brain   │
                   │ Groq / Llama Model  │
                   └──────────┬──────────┘
                              │
                         AI Response
                              │
                 ┌────────────┴────────────┐
                 │                         │
                 ▼                         ▼
          📝 Written Response        🔊 Deepgram TTS
                                           │
                                           ▼
                                    🎧 Voice Response
```

---

## 📂 Project Structure

```text
ai-skin-specialist/
│
├── main.py
│   └── Gradio application entry point
│
├── voice_of_the_patient.py
│   └── Microphone recording and Groq transcription
│
├── brain_of_the_doctor_groq.py
│   └── Groq vision/text response generation
│
├── brain_of_the_doctor.py
│   └── Alternative MiniMax/Anthropic-compatible implementation
│
├── voice_of_the_doctor.py
│   └── Deepgram text-to-speech generation
│
├── free_text_to_speech.py
│   └── Additional text-to-speech experiment/helper
│
├── sample.env
│   └── Environment variable template
│
├── pyproject.toml
│   └── Python project metadata and dependencies
│
├── uv.lock
│   └── Locked dependency versions
│
├── .python-version
│   └── Python version configuration
│
└── README.md
    └── Project documentation
```

---

## 🔄 How It Works

### 1. Patient provides information

The user provides:

* A description of their symptoms through the microphone
* An image of the affected skin area

### 2. Voice is converted to text

The patient's recorded audio is processed using **Groq's Whisper model**.

```text
Patient Voice
     ↓
Audio Processing
     ↓
Groq Whisper
     ↓
Transcribed Text
```

### 3. Image is analyzed

The uploaded skin image is passed to a **vision-capable Llama model through Groq**.

The model processes the visual information along with the patient's description.

### 4. AI generates a response

The AI doctor combines the available information and generates preliminary guidance, such as:

* Possible conditions to consider
* General observations
* Suggested next steps
* When professional medical attention may be appropriate

### 5. Response is converted to speech

The generated text is sent to **Deepgram Text-to-Speech**, which produces an audio response.

```text
AI Response
     ↓
Deepgram TTS
     ↓
Audio Response
     ↓
Patient
```

---

## 🛠️ Technologies Used

| Technology       | Purpose                                      |
| ---------------- | -------------------------------------------- |
| **Python**       | Application development                      |
| **Gradio**       | Web interface                                |
| **Groq**         | AI inference and speech transcription        |
| **Whisper**      | Speech-to-text                               |
| **Llama Vision** | Skin-image analysis                          |
| **Deepgram**     | Text-to-speech                               |
| **PyAudio**      | Microphone/audio input                       |
| **Pydub**        | Audio processing                             |
| **FFmpeg**       | Audio conversion and media processing        |
| **uv**           | Python environment and dependency management |

---

## ⚙️ Requirements

Before running the project, make sure you have:

* **Python 3.11 or newer**
* **uv package manager**
* **FFmpeg**
* **PortAudio**
* Groq API key
* Deepgram API key

### 3. Install Python dependencies

## 🔑 Environment Variables

Create an environment file based on `sample.env`.

Example:

```env
GROQ_API_KEY=your_groq_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key

WHISPER_MODEL=whisper-large-v3
GROQ_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
DEEPGRAM_TTS_MODEL=aura-2-thalia-en
```

### API Keys

The application requires:

* `GROQ_API_KEY` — Used for speech transcription and AI image/text analysis.
* `DEEPGRAM_API_KEY` — Used for generating the spoken AI response.

> 🔐 **Never commit real API keys to GitHub.** Add your environment file to `.gitignore`.

Example:

```gitignore
.env
.env.*
!.env.example
```

---

## ▶️ Running the Application

Start the application using:

```bash
uv run python main.py
```

Gradio will start a local server and display a URL similar to:

```text
http://127.0.0.1:7860
```

Open the URL in your browser to use the application.

---

## 🎯 Example Interaction

```text
Patient:
"I have had this red patch on my arm for several days.
It is slightly itchy."

        +
        
📷 Skin Image

        ↓

🎙️ Groq Whisper
Converts the patient's voice into text

        ↓

🧠 Llama Vision
Processes the image and patient description

        ↓

🤖 AI Doctor
Generates preliminary guidance

        ↓

📝 Written Response
        +
🔊 Deepgram Voice Response
```

---

## 🚧 Challenges Faced

During development, several technical challenges were addressed:

### Audio Processing

Handling microphone input and converting audio into a format suitable for transcription required additional audio-processing dependencies such as **PyAudio, Pydub, and FFmpeg**.

### Multimodal Processing

The application needs to combine information from two different modalities:

```text
Voice → Text
Image → Visual Information
```

The system then combines both inputs before generating the response.

### Model Compatibility

Different AI models have different API formats and capabilities, so model configuration and compatibility had to be handled carefully.

### API Configuration

Environment variables were used to keep API credentials separate from the source code and reduce the risk of accidentally exposing secrets.

### Low-Latency Interaction

The project was designed to minimize unnecessary processing steps so that users can receive responses quickly.

---

## 🔮 Future Improvements

Potential improvements include:

* 🌐 Deploy the application as a public web application
* 📱 Improve mobile responsiveness
* 🗣️ Add multilingual voice support
* 📊 Add patient interaction history
* 🧾 Generate downloadable consultation summaries
* 🔐 Add stronger privacy and data-handling controls
* 🩺 Add structured symptom collection
* 👨‍⚕️ Add optional human dermatologist review
* 📈 Evaluate model responses against curated datasets

---

## ⚠️ Medical Disclaimer

AI Derma Care is an **educational and experimental AI project**.

It does not provide definitive medical diagnoses and should not replace a qualified dermatologist or other healthcare professional.

Users should seek professional medical advice for persistent, worsening, severe, or concerning symptoms.

---

## 👩‍💻 Author

**Prajaktha**

Data Analyst | Automation Enthusiast | AI & ML Explorer

🔗 GitHub: [Prajaktha03](https://github.com/Prajaktha03)

---

## ⭐ Support

If you find this project interesting, consider giving the repository a ⭐ on GitHub.
