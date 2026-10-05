"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Activity, AudioLines, Check, CircleAlert, FileAudio2, ImagePlus, LoaderCircle, Mic, ShieldCheck, Sparkles, Square, Stethoscope, Trash2, Video, X } from "lucide-react";
import { ThemeToggle } from "@/components/skin-specialist-ui";

type AnalysisResult = {
  transcript: string;
  guidance: string;
  audio_data_url: string;
};

const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

function fileSize(bytes: number) {
  return bytes < 1_000_000 ? `${Math.max(1, Math.round(bytes / 1_000))} KB` : `${(bytes / 1_000_000).toFixed(1)} MB`;
}

export default function HomePage() {
  const [patientText, setPatientText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingSecondsRef = useRef(0);
  const imagePreviewRef = useRef("");

  useEffect(() => {
    if (!isRecording) return;
    const interval = window.setInterval(() => {
      recordingSecondsRef.current += 1;
      setRecordingSeconds(recordingSecondsRef.current);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRecording]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (imagePreviewRef.current) URL.revokeObjectURL(imagePreviewRef.current);
  }, []);

  function formatTime(seconds: number) {
    return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
  }

  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (imagePreviewRef.current) URL.revokeObjectURL(imagePreviewRef.current);
    const preview = URL.createObjectURL(file);
    imagePreviewRef.current = preview;
    setImagePreview(preview);
    setImageFile(file);
    setResult(null);
    setErrorMessage("");
  }

  function removeImage() {
    if (imagePreviewRef.current) URL.revokeObjectURL(imagePreviewRef.current);
    imagePreviewRef.current = "";
    setImagePreview("");
    setImageFile(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  function acceptAudio(file: File) {
    setAudioFile(file);
    setResult(null);
    setErrorMessage("");
  }

  function handleAudioUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) acceptAudio(file);
    event.target.value = "";
  }

  async function toggleRecording() {
    setErrorMessage("");
    if (isRecording) {
      recorderRef.current?.stop();
      return;
    }

    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        throw new Error("Voice recording is not supported in this browser. Upload an audio file instead.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      streamRef.current = stream;
      recorderRef.current = recorder;
      recordingSecondsRef.current = 0;
      setRecordingSeconds(0);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = () => {
        const audio = new File(chunks, "patient-voice-note.webm", { type: recorder.mimeType || "audio/webm" });
        acceptAudio(audio);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setIsRecording(false);
      };
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Microphone access is unavailable.");
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  async function analyzeConcern(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!imageFile) {
      setErrorMessage("Upload an image of the affected area before analysis.");
      return;
    }
    if (!audioFile && !patientText.trim()) {
      setErrorMessage("Describe your concern or record/upload a voice note.");
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("patient_text", patientText);
    if (audioFile) formData.append("audio", audioFile);
    if (videoFile) formData.append("video", videoFile);

    setIsSubmitting(true);
    setErrorMessage("");
    setResult(null);
    try {
      const response = await fetch(`${apiUrl}/api/analyze`, { method: "POST", body: formData });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || "The consultation could not be completed.");
      setResult(payload as AnalysisResult);
    } catch (error) {
      setErrorMessage(error instanceof Error && error.message !== "Failed to fetch" ? error.message : "Could not reach the analysis service. Start the Python API and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetConsultation() {
    removeImage();
    setPatientText("");
    setAudioFile(null);
    setVideoFile(null);
    setResult(null);
    setErrorMessage("");
    if (audioInputRef.current) audioInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  }

  const canSubmit = Boolean(imageFile && (audioFile || patientText.trim()) && !isSubmitting);

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--page)] text-[var(--text)]">
      <header className="relative z-40 mx-auto max-w-[980px] border-x border-b border-[var(--border)] bg-[var(--surface)] sm:rounded-b-2xl">
        <div className="flex min-h-[66px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
          <a href="#top" className="flex items-center gap-3" aria-label="AI Skin Specialist home"><span className="grid size-9 place-items-center rounded-xl bg-[#edf2ff] text-[#3866dd]"><Stethoscope size={18}/></span><span><span className="block text-[15px] font-semibold leading-5">AI Skin Specialist</span><span className="hidden text-[9px] font-medium tracking-[.08em] text-[var(--muted)] sm:block">VOICE, IMAGE, AND VIDEO BASED SKIN CONSULTATION ASSISTANT</span></span></a>
          <nav className="order-3 flex w-full items-center justify-center gap-5 text-[10px] font-medium text-[var(--muted)] sm:order-none sm:w-auto sm:gap-4" aria-label="Page navigation"><a href="#top" className="transition hover:text-[#3866dd]">Home</a><a href="#patient-input" className="transition hover:text-[#3866dd]">Patient Input</a><a href="#response" className="transition hover:text-[#3866dd]">Doctor Response</a></nav>
          <div className="flex items-center gap-2"><span className="hidden items-center gap-1.5 text-[9px] font-semibold text-[var(--muted)] sm:flex"><ShieldCheck size={14} className="text-[#3866dd]"/> Privacy-first consultation</span><ThemeToggle/></div>
        </div>
      </header>

      <div id="top" className="mx-auto max-w-[980px] px-3 pb-8 pt-5 sm:px-4">
        <div className="mb-3 grid gap-3 sm:grid-cols-[minmax(0,.72fr)_minmax(0,1fr)]"><h1 className="flex items-center gap-2 text-[17px] font-semibold"><Activity size={17} className="text-[#3866dd]"/> Patient Input</h1><h2 className="hidden items-center gap-2 text-[17px] font-semibold sm:flex"><Sparkles size={17} className="text-[#3866dd]"/> Doctor Response</h2></div>
        <form onSubmit={analyzeConcern} className="grid items-start gap-4 sm:grid-cols-[minmax(0,.72fr)_minmax(0,1fr)]">
          <motion.section id="patient-input" initial={false} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_10px_30px_rgba(35,48,79,.05)] sm:p-5">
            <div className="mb-4"><h2 className="text-[13px] font-semibold">Describe your skin concern</h2><p className="mt-1 text-[10px] text-[var(--muted)]">Record your voice or type a short description.</p></div>

            <label htmlFor="patient-description" className="mb-2 block text-[11px] font-semibold">Describe your concern</label>
            <textarea id="patient-description" value={patientText} onChange={(event) => setPatientText(event.target.value)} maxLength={10_000} rows={4} placeholder="When did it start? Does it feel itchy, sore, or change over time?" className="w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-3 text-[12px] leading-5 text-[var(--text)] outline-none transition placeholder:text-[var(--muted)] focus:border-[#8698e9] focus:ring-2 focus:ring-[#8092ed]/15"/>
            <div className="mt-1 flex justify-between text-[9px] text-[var(--muted)]"><span>Share only what feels useful.</span><span>{patientText.length}/10,000</span></div>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <motion.button type="button" onClick={toggleRecording} whileTap={{ scale: .96 }} className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-[10px] font-semibold transition ${isRecording ? "bg-[#fff0f2] text-[#bd4662] ring-1 ring-[#f0cad2] dark:bg-[#48263b]" : "bg-[#344fc4] text-white shadow-[0_6px_18px_rgba(67,88,203,.22)] hover:bg-[#293fae]"}`}>{isRecording ? <Square size={13} fill="currentColor"/> : <Mic size={15}/ >}{isRecording ? `Stop · ${formatTime(recordingSeconds)}` : "Record patient voice"}</motion.button>
              <input ref={audioInputRef} className="sr-only" type="file" accept="audio/*" onChange={handleAudioUpload}/>
              <button type="button" onClick={() => audioInputRef.current?.click()} className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-[10px] font-semibold text-[var(--text-soft)] transition hover:border-[#aab7ed] hover:text-[#5368d8]"><FileAudio2 size={14}/> Upload voice note</button>
            </div>
            {audioFile && <div className="mt-3 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2"><AudioLines size={15} className="shrink-0 text-[#5e72d7]"/><span className="min-w-0 flex-1 truncate text-[10px] text-[var(--text-soft)]">{audioFile.name}</span><span className="text-[9px] text-[var(--muted)]">{fileSize(audioFile.size)}</span><button type="button" onClick={() => setAudioFile(null)} className="grid size-7 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[#c15068]" aria-label="Remove patient voice file"><X size={14}/></button></div>}

            <div className="my-4 flex items-center gap-2.5"><span className="text-[9px] font-semibold text-[var(--muted)]">SKIN IMAGE & VIDEO</span><span className="h-px flex-1 bg-[var(--border)]"/></div>
            <div className="grid grid-cols-2 gap-2.5">
              <div><label htmlFor="skin-image" className="mb-1.5 flex items-center gap-1 text-[9px] font-medium text-[var(--muted)]"><ImagePlus size={11}/> Skin Image</label><input ref={imageInputRef} id="skin-image" className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage}/>{imagePreview ? <div className="relative h-[150px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]"><Image src={imagePreview} alt="Selected skin area" fill unoptimized className="object-cover"/><div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-2 pt-7 text-white"><span className="flex items-center gap-1 text-[9px] font-semibold"><Check size={11}/> Ready</span><button type="button" onClick={removeImage} aria-label="Remove skin image" className="grid size-6 place-items-center rounded-md border border-white/40 bg-black/20"><Trash2 size={12}/></button></div></div> : <button type="button" onClick={() => imageInputRef.current?.click()} className="flex h-[150px] w-full flex-col items-center justify-center gap-2 rounded-xl bg-[#f1f3f5] px-2 text-center transition hover:bg-[#eaf0ff] dark:bg-[#1b2742] dark:hover:bg-[#243253]"><UploadPlaceholder/><span className="text-[10px] leading-4">Drop image here<br/>or click to upload</span></button>}</div>
              <div><label htmlFor="skin-video" className="mb-1.5 flex items-center gap-1 text-[9px] font-medium text-[var(--muted)]"><Video size={11}/> Skin Video</label><input ref={videoInputRef} id="skin-video" className="sr-only" type="file" accept="video/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) setVideoFile(file); }}/>{videoFile ? <div className="flex h-[150px] flex-col items-center justify-center gap-2 rounded-xl bg-[#f1f3f5] p-2 text-center dark:bg-[#1b2742]"><Video size={18} className="text-[#6377dc]"/><span className="max-w-full truncate text-[9px]">{videoFile.name}</span><button type="button" onClick={() => setVideoFile(null)} className="text-[9px] text-[#5368d8]">Remove</button></div> : <button type="button" onClick={() => videoInputRef.current?.click()} className="flex h-[150px] w-full flex-col items-center justify-center gap-2 rounded-xl bg-[#f1f3f5] px-2 text-center transition hover:bg-[#eaf0ff] dark:bg-[#1b2742] dark:hover:bg-[#243253]"><UploadPlaceholder/><span className="text-[10px] leading-4">Drop video here<br/>or click to upload</span></button>}</div>
            </div>

            {errorMessage && <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#f0d5d4] bg-[#fff5f4] px-3 py-2.5 text-[10px] leading-4 text-[#a54349] dark:border-[#57343c] dark:bg-[#351f2b] dark:text-[#ffc1c8]" role="alert"><CircleAlert size={14} className="mt-0.5 shrink-0"/>{errorMessage}</div>}
            <motion.button type="submit" disabled={!canSubmit} whileTap={canSubmit ? { scale: .99 } : undefined} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3856c9] to-[#665bd8] px-4 text-[11px] font-semibold text-white shadow-[0_9px_23px_rgba(62,82,194,.2)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? <><LoaderCircle className="animate-spin" size={16}/> Analyzing your concern...</> : <><Sparkles size={15}/> Analyze skin concern</>}</motion.button>
            <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-[9px] leading-4 text-[var(--muted)]"><ShieldCheck size={12} className="shrink-0 text-[#6076d9]"/> Uploaded files are processed for this request and temporary server copies are removed.</p>
          </motion.section>

          <motion.section id="response" initial={false} animate={{ opacity: 1, y: 0 }} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_10px_30px_rgba(35,48,79,.05)]">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3.5"><h2 className="flex items-center gap-2 text-[13px] font-semibold"><Sparkles size={16} className="text-[#3866dd]"/> Doctor Response</h2><span className="flex items-center gap-1.5 text-[9px] font-medium text-[var(--muted)]"><span className={`size-1.5 rounded-full ${result ? "bg-[#55b988]" : "bg-[#9aa4b2]"}`}/>{isSubmitting ? "Analyzing" : result ? "Analysis complete" : "Ready for analysis"}</span></div>
            <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
              {!result && <div className="flex flex-col items-center py-2 text-center"><span className="mb-2 grid size-14 place-items-center rounded-full bg-[#f0f2f5] text-[#788391]"><AudioLines size={23}/></span><h3 className="text-[13px] font-semibold">Ready for Analysis</h3><p className="mt-1 text-[10px] text-[var(--muted)]">Your transcript and guidance will appear below after analysis.</p></div>}
              {result && <div className="flex items-center gap-2 text-[10px] font-semibold text-[#40856d]"><span className="grid size-6 place-items-center rounded-full bg-[#e8f5ee]"><Check size={13}/></span> Analysis complete</div>}
              <label className="block"><span className="mb-1.5 block text-[9px] font-bold tracking-[.09em] text-[var(--text-soft)]">YOUR SPEECH TRANSCRIPT</span><textarea readOnly rows={3} value={result?.transcript ?? ""} placeholder="The patient voice transcript will appear here." className="w-full resize-y rounded-xl border border-[var(--border)] bg-[#f1f3f5] px-3 py-2.5 text-[10px] leading-5 text-[var(--text)] outline-none placeholder:text-[#8b949e] dark:bg-[#1b2742]"/></label>
              <label className="block"><span className="mb-1.5 block text-[9px] font-bold tracking-[.09em] text-[var(--text-soft)]">DOCTOR&apos;S GUIDANCE</span><textarea readOnly rows={5} value={result?.guidance ?? ""} placeholder="Image-based guidance will appear here." className="w-full resize-y rounded-xl border border-[var(--border)] bg-[#f1f3f5] px-3 py-2.5 text-[11px] leading-5 text-[var(--text)] outline-none placeholder:text-[#8b949e] dark:bg-[#1b2742]"/></label>
              <div><span className="mb-1.5 block text-[9px] font-bold tracking-[.09em] text-[var(--text-soft)]">DOCTOR VOICE RESPONSE</span>{result ? <audio controls src={result.audio_data_url} className="h-10 w-full">Audio playback is not supported by this browser.</audio> : <div className="flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[#f1f3f5] px-3 text-[9px] text-[var(--muted)] dark:bg-[#1b2742]"><AudioLines size={13}/> Spoken response will be available after analysis.</div>}</div>
              {result && <button type="button" onClick={resetConsultation} className="self-start rounded-lg border border-[var(--border)] px-3 py-2 text-[9px] font-semibold text-[var(--text-soft)] transition hover:border-[#aab7ed] hover:text-[#5368d8]">Start a new consultation</button>}
            </div>

            <div id="care-note" className="flex items-start gap-2.5 border-t border-[#f0dfcf] bg-[#fffaf2] px-5 py-3.5 text-[#765c41] dark:border-[#493d35] dark:bg-[#2a2525] dark:text-[#d9c4a9]"><span className="grid size-5 shrink-0 place-items-center rounded-full border border-current font-serif text-[10px]">i</span><p className="text-[9px] leading-4"><strong>Important:</strong> This tool provides general information, not a diagnosis. Consult a licensed dermatologist for medical advice; seek urgent care for severe or rapidly worsening symptoms.</p></div>
          </motion.section>
        </form>

        <footer className="flex flex-col items-start justify-between gap-2 py-5 text-[9px] text-[var(--muted)] sm:flex-row sm:items-center"><span className="font-semibold tracking-[.08em]">AI SKIN SPECIALIST <span className="px-1 text-[#7587df]">·</span> VOICE + IMAGE CONSULTATION</span><span className="flex items-center gap-1.5"><ShieldCheck size={12}/> Review results with a qualified clinician</span></footer>
      </div>
    </main>
  );
}

function UploadPlaceholder() {
  return <span className="grid size-8 place-items-center rounded-lg text-[#687480]"><ImagePlus size={17}/></span>;
}
