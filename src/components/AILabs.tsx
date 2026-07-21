import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Image as ImageIcon,
  Video,
  Eye,
  Mic,
  MessageSquare,
  Sparkles,
  Zap,
  Globe,
  MapPin,
  Brain,
  Upload,
  Play,
  Pause,
  Download,
  Send,
  Loader,
  AlertCircle,
  FileVideo,
  Volume2,
  Trash2,
  RefreshCw,
  LogOut,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { db, auth, googleProvider, signInWithPopup, signOut } from '../lib/firebase';
import { Task, Project, Event, ValueRule, Memory } from '../types';

interface AILabsProps {
  userId: string | null;
  onAddGeneratedMedia: (item: any) => void;
  projects: Project[];
}

export default function AILabs({ userId, onAddGeneratedMedia, projects }: AILabsProps) {
  const [activeTab, setActiveTab] = useState<'music' | 'image' | 'video' | 'chat' | 'vision' | 'transcribe'>('music');
  
  // Universal loader/error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- 1. Music Lab States ---
  const [musicPrompt, setMusicPrompt] = useState('Generate a fast synthwave driving soundtrack for late night coding sessions');
  const [musicLength, setMusicLength] = useState<'clip' | 'pro'>('clip');
  const [generatedMusic, setGeneratedMusic] = useState<{ audioUrl: string; lyrics: string; prompt: string } | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- 2. Image Lab States ---
  const [imagePrompt, setImagePrompt] = useState('An ultra-detailed cinematic portrait of J.A.R.V.I.S. hologram core emitting cyan light in a high-tech workshop');
  const [imgAspectRatio, setImgAspectRatio] = useState('1:1');
  const [imgSize, setImgSize] = useState('1K');
  const [imgQuality, setImgQuality] = useState<'standard' | 'studio'>('studio');
  const [imageFile, setImageFile] = useState<string | null>(null); // base64 for image edit
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // --- 3. Veo Video Lab States ---
  const [videoPrompt, setVideoPrompt] = useState('A sleek futuristic sports car speeding through a neon-lit cyberpunk city, high speed motion');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoStartImage, setVideoStartImage] = useState<string | null>(null); // base64
  const [generatedVideo, setGeneratedVideo] = useState<{ url: string; mimeType: string } | null>(null);

  // --- 4. Chat / Grounded Cognitive Assistant States ---
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; content: string; info?: string }>>([
    { role: 'model', content: "Systems fully initialized, Sam. Ready for cognitive cooperation. What strategy should we analyze today?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatRole, setChatRole] = useState('ceo');
  const [useSearch, setUseSearch] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  const [useHighThinking, setUseHighThinking] = useState(false);
  const [useLowLatency, setUseLowLatency] = useState(false);

  // --- 5. vision & Media Analyzer States ---
  const [visionPrompt, setVisionPrompt] = useState('Explain what is happening in this media file and summarize key operational action items.');
  const [mediaFile, setMediaFile] = useState<{ base64: string; mimeType: string; name: string } | null>(null);
  const [visionResponse, setVisionResponse] = useState<string | null>(null);

  // --- 6. Audio Transcription States ---
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // --- Cleanup Audio Playback ---
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Timer for audio recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingDuration(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image-lab' | 'video-lab' | 'vision-lab') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const cleanBase64 = base64String.split(',')[1];
      if (type === 'image-lab') {
        setImageFile(cleanBase64);
      } else if (type === 'video-lab') {
        setVideoStartImage(cleanBase64);
      } else if (type === 'vision-lab') {
        setMediaFile({
          base64: cleanBase64,
          mimeType: file.type,
          name: file.name
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // --- A. Generate Music ---
  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim()) return;
    setLoading(true);
    setError(null);
    setGeneratedMusic(null);

    try {
      const res = await fetch('/api/jarvis/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: musicPrompt, length: musicLength })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to generate music');

      const binary = window.atob(data.audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);

      const musicItem = {
        audioUrl,
        lyrics: data.lyrics,
        prompt: musicPrompt
      };
      setGeneratedMusic(musicItem);

      // Save generated media to App & Firebase
      const mediaDoc = {
        id: `music_${Date.now()}`,
        type: 'music',
        prompt: musicPrompt,
        url: audioUrl,
        createdAt: new Date().toISOString(),
        size: musicLength === 'pro' ? 'Full Track' : '30s Clip'
      };
      onAddGeneratedMedia(mediaDoc);

      if (userId) {
        await addDoc(collection(db, 'generatedMedia'), {
          ...mediaDoc,
          userId
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error generating track');
    } finally {
      setLoading(false);
    }
  };

  const togglePlayMusic = () => {
    if (!generatedMusic) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(generatedMusic.audioUrl);
      audioRef.current.onended = () => setIsPlayingMusic(false);
    }

    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play();
      setIsPlayingMusic(true);
    }
  };

  // --- B. Generate Image ---
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const res = await fetch('/api/jarvis/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: imgAspectRatio,
          size: imgSize,
          quality: imgQuality,
          base64Image: imageFile,
          mimeType: 'image/png'
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to generate image');

      setGeneratedImage(data.imageUrl);

      const mediaDoc = {
        id: `img_${Date.now()}`,
        type: 'image',
        prompt: imagePrompt,
        url: data.imageUrl,
        createdAt: new Date().toISOString(),
        aspectRatio: imgAspectRatio,
        size: imgSize
      };
      onAddGeneratedMedia(mediaDoc);

      if (userId) {
        await addDoc(collection(db, 'generatedMedia'), {
          ...mediaDoc,
          userId
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error generating image');
    } finally {
      setLoading(false);
    }
  };

  // --- C. Generate Video (Veo) ---
  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim() && !videoStartImage) return;
    setLoading(true);
    setError(null);
    setGeneratedVideo(null);

    try {
      const res = await fetch('/api/jarvis/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          aspectRatio: videoAspectRatio,
          base64Image: videoStartImage,
          mimeType: 'image/png'
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to generate video');

      const binary = window.atob(data.video);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: data.mimeType || 'video/mp4' });
      const videoUrl = URL.createObjectURL(blob);

      setGeneratedVideo({ url: videoUrl, mimeType: data.mimeType || 'video/mp4' });

      const mediaDoc = {
        id: `vid_${Date.now()}`,
        type: 'video',
        prompt: videoPrompt,
        url: videoUrl,
        createdAt: new Date().toISOString(),
        aspectRatio: videoAspectRatio
      };
      onAddGeneratedMedia(mediaDoc);

      if (userId) {
        await addDoc(collection(db, 'generatedMedia'), {
          ...mediaDoc,
          userId
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error generating video clip');
    } finally {
      setLoading(false);
    }
  };

  // --- D. Grounded Cognitive Chatbot ---
  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setLoading(true);
    setError(null);

    try {
      let endpoint = '/api/jarvis/chat';
      let requestBody: any = {
        prompt: userMsg,
        history: chatMessages.slice(-10), // pass recent turns
        systemInstruction: getSystemInstructionByRole(chatRole)
      };

      if (useLowLatency) {
        requestBody.modelType = 'low-latency';
      } else if (useHighThinking) {
        endpoint = '/api/jarvis/think-high';
        requestBody = { prompt: userMsg };
      } else if (useSearch || useMaps) {
        endpoint = '/api/jarvis/grounding';
        requestBody = {
          prompt: userMsg,
          useSearch,
          useMaps
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to get intelligence reply');

      let replyText = data.text;
      let infoString = "";

      if (endpoint === '/api/jarvis/grounding' && data.steps) {
        const searchStep = data.steps.find((s: any) => s.type === 'google_search_result');
        if (searchStep) {
          infoString = "Grounded with Google Search";
        }
        const mapsStep = data.steps.find((s: any) => s.type === 'google_maps_result');
        if (mapsStep) {
          infoString = "Grounded with Google Maps";
        }
      }

      setChatMessages((prev) => [...prev, {
        role: 'model',
        content: replyText,
        info: infoString || (useHighThinking ? "Verified via Deep Thinking Mode" : undefined)
      }]);
    } catch (err: any) {
      setError(err.message || 'Error processing speech core command');
    } finally {
      setLoading(false);
    }
  };

  const getSystemInstructionByRole = (role: string) => {
    switch (role) {
      case 'ceo':
        return "You are CEO Jarvis, an elite strategist. You prioritize Sam's high-leverage goals and protect peace. Direct and strategic.";
      case 'developer':
        return "You are Dev Jarvis, Lead Architect. You analyze bugs, draft code, and discuss complex systems directly and technically.";
      case 'therapist':
        return "You are Therapist Jarvis. Gently guide Sam away from anxiety loops and overthinking. Compassionate, warm, and restorative.";
      case 'finance':
        return "You are Finance Jarvis. Evaluate margins, expenses, business strategies, and wealth creation precisely.";
      default:
        return "You are J.A.R.V.I.S., a witty and supportive personal advisor.";
    }
  };

  // --- E. vision & Video Analyzer ---
  const handleAnalyzeMedia = async () => {
    if (!mediaFile) return;
    setLoading(true);
    setError(null);
    setVisionResponse(null);

    try {
      const res = await fetch('/api/jarvis/analyze-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data: mediaFile.base64,
          mimeType: mediaFile.mimeType,
          prompt: visionPrompt
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Analysis failed');

      setVisionResponse(data.text);
    } catch (err: any) {
      setError(err.message || 'Error analyzing media content');
    } finally {
      setLoading(false);
    }
  };

  // --- F. Audio Transcription ---
  const startRecording = async () => {
    setError(null);
    setTranscriptionResult(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        // Transcribe right away
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result as string;
          const cleanBase64 = base64String.split(',')[1];
          await transcribeAudio(cleanBase64);
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      setError('Could not access microphone: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (base64Audio: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/jarvis/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Audio, mimeType: 'audio/wav' })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed transcription');

      setTranscriptionResult(data.text);
    } catch (err: any) {
      setError(err.message || 'Transcription failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[620px] font-mono">
      {/* Sidebar Tool selection */}
      <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-white/10">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs uppercase font-bold tracking-wider text-cyan-300">Cognitive Studio</h3>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => { setActiveTab('music'); setError(null); }}
              className={`w-full flex items-center space-x-2.5 p-2.5 rounded-lg text-left text-xs border transition ${
                activeTab === 'music'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : 'bg-transparent border-transparent text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Music className="w-4 h-4 shrink-0" />
              <span>Lyria Music Lab</span>
            </button>

            <button
              onClick={() => { setActiveTab('image'); setError(null); }}
              className={`w-full flex items-center space-x-2.5 p-2.5 rounded-lg text-left text-xs border transition ${
                activeTab === 'image'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : 'bg-transparent border-transparent text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4 shrink-0" />
              <span>Image Creator & Editor</span>
            </button>

            <button
              onClick={() => { setActiveTab('video'); setError(null); }}
              className={`w-full flex items-center space-x-2.5 p-2.5 rounded-lg text-left text-xs border transition ${
                activeTab === 'video'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : 'bg-transparent border-transparent text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4 shrink-0" />
              <span>Veo 3 Video Studio</span>
            </button>

            <button
              onClick={() => { setActiveTab('chat'); setError(null); }}
              className={`w-full flex items-center space-x-2.5 p-2.5 rounded-lg text-left text-xs border transition ${
                activeTab === 'chat'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : 'bg-transparent border-transparent text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Grounded Chatbot</span>
            </button>

            <button
              onClick={() => { setActiveTab('vision'); setError(null); }}
              className={`w-full flex items-center space-x-2.5 p-2.5 rounded-lg text-left text-xs border transition ${
                activeTab === 'vision'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : 'bg-transparent border-transparent text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4 shrink-0" />
              <span>Vision & Video Pro</span>
            </button>

            <button
              onClick={() => { setActiveTab('transcribe'); setError(null); }}
              className={`w-full flex items-center space-x-2.5 p-2.5 rounded-lg text-left text-xs border transition ${
                activeTab === 'transcribe'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : 'bg-transparent border-transparent text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4 shrink-0" />
              <span>Voice Transcriber</span>
            </button>
          </div>
        </div>

        {/* Security / values compliance info */}
        <div className="mt-4 p-2.5 rounded border border-emerald-500/20 bg-emerald-500/5 text-[9px] text-emerald-400 leading-relaxed">
          🔒 System complies with strict user-privacy credentials. Generated media files are saved securely under your personal account.
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.4)] flex flex-col justify-between backdrop-blur-md relative overflow-hidden">
        {/* Glowing holographic ambient nodes */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] pointer-events-none rounded-full" />
        
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
            <div className="flex items-center space-x-2">
              {activeTab === 'music' && <Music className="w-5 h-5 text-cyan-400" />}
              {activeTab === 'image' && <ImageIcon className="w-5 h-5 text-cyan-400" />}
              {activeTab === 'video' && <Video className="w-5 h-5 text-cyan-400" />}
              {activeTab === 'chat' && <MessageSquare className="w-5 h-5 text-cyan-400" />}
              {activeTab === 'vision' && <Eye className="w-5 h-5 text-cyan-400" />}
              {activeTab === 'transcribe' && <Mic className="w-5 h-5 text-cyan-400" />}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-white">
                  {activeTab === 'music' && 'Lyria AI Music Lab'}
                  {activeTab === 'image' && 'High-Quality Image Lab'}
                  {activeTab === 'video' && 'Veo 3 Video Laboratory'}
                  {activeTab === 'chat' && 'Grounded Multi-turn Chatbot'}
                  {activeTab === 'vision' && 'Vision & Video Pro Analyzer'}
                  {activeTab === 'transcribe' && 'Gemini Transcriber & Speech Core'}
                </h2>
                <span className="text-[9px] text-white/40 uppercase tracking-wider block">
                  {activeTab === 'music' && 'Powered by lyria-3-pro-preview'}
                  {activeTab === 'image' && 'Powered by gemini-3-pro-image'}
                  {activeTab === 'video' && 'Powered by veo-3.1-fast-generate-preview'}
                  {activeTab === 'chat' && 'Grounded in Google Search & Maps'}
                  {activeTab === 'vision' && 'Powered by gemini-3.1-pro-preview'}
                  {activeTab === 'transcribe' && 'Powered by gemini-3.5-flash'}
                </span>
              </div>
            </div>

            {loading && (
              <div className="flex items-center space-x-2 text-cyan-400 text-[10px] animate-pulse font-mono">
                <Loader className="w-3.5 h-3.5 animate-spin" />
                <span>ORCHESTRATING MODEL...</span>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-2 mb-4 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* --- Tab Content --- */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            {/* 1. MUSIC TAB */}
            {activeTab === 'music' && (
              <div className="space-y-4">
                <div className="bg-black/20 border border-white/5 p-4 rounded-lg space-y-3">
                  <label className="text-[10px] text-white/50 uppercase tracking-wider block">Describe the music you wish to synthesize:</label>
                  <textarea
                    value={musicPrompt}
                    onChange={(e) => setMusicPrompt(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/40 transition font-mono min-h-[70px] resize-none"
                    placeholder="E.g., cinematic grand orchestral melody with dramatic brass horns and gentle strings..."
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-[10px] text-white/50 uppercase tracking-wider">Track Length:</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setMusicLength('clip')}
                          className={`px-2.5 py-1 rounded text-[10px] border transition ${
                            musicLength === 'clip'
                              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                              : 'bg-transparent border-white/15 text-white/60 hover:text-white'
                          }`}
                        >
                          Short Clip (30s)
                        </button>
                        <button
                          onClick={() => setMusicLength('pro')}
                          className={`px-2.5 py-1 rounded text-[10px] border transition ${
                            musicLength === 'pro'
                              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                              : 'bg-transparent border-white/15 text-white/60 hover:text-white'
                          }`}
                        >
                          Full-Length Track (Lyria Pro)
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleGenerateMusic}
                      disabled={loading || !musicPrompt.trim()}
                      className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 rounded text-xs text-cyan-400 hover:text-cyan-300 transition"
                    >
                      Synthesize Soundtrack
                    </button>
                  </div>
                </div>

                {generatedMusic && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-lg space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Volume2 className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-bold text-cyan-100">Generation Succeeded</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={togglePlayMusic}
                          className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 rounded-full text-cyan-400 transition"
                        >
                          {isPlayingMusic ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <a
                          href={generatedMusic.audioUrl}
                          download="jarvis-music-output.wav"
                          className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/80 hover:text-white transition"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    {generatedMusic.lyrics && (
                      <div className="space-y-1.5 border-t border-cyan-500/10 pt-3">
                        <span className="text-[10px] text-cyan-400/70 uppercase">Generated Lyrics & Structure:</span>
                        <pre className="text-xs text-white/80 bg-black/35 p-3 rounded overflow-x-auto leading-relaxed max-h-[140px] whitespace-pre-wrap font-mono">
                          {generatedMusic.lyrics}
                        </pre>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {/* 2. IMAGE TAB */}
            {activeTab === 'image' && (
              <div className="space-y-4">
                <div className="bg-black/20 border border-white/5 p-4 rounded-lg space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/50 uppercase tracking-wider block">Visual Prompt:</label>
                    <textarea
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/40 transition font-mono min-h-[70px] resize-none"
                      placeholder="Input the scene description..."
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <span className="text-[9px] text-white/40 uppercase block">Aspect Ratio:</span>
                      <select
                        value={imgAspectRatio}
                        onChange={(e) => setImgAspectRatio(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 text-white text-xs px-2 py-1.5 rounded outline-none"
                      >
                        <option value="1:1">1:1 (Square)</option>
                        <option value="3:2">3:2 (Landscape)</option>
                        <option value="2:3">2:3 (Portrait)</option>
                        <option value="4:3">4:3 (Photo)</option>
                        <option value="3:4">3:4 (Portrait)</option>
                        <option value="16:9">16:9 (Cinematic)</option>
                        <option value="9:16">9:16 (Story)</option>
                        <option value="21:9">21:9 (Panoramic)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-white/40 uppercase block">Resolution Size:</span>
                      <select
                        value={imgSize}
                        onChange={(e) => setImgSize(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 text-white text-xs px-2 py-1.5 rounded outline-none"
                      >
                        <option value="1K">1K (Standard)</option>
                        <option value="2K">2K (High Res)</option>
                        <option value="4K">4K (Studio UHD)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-white/40 uppercase block">Rendering Engine:</span>
                      <select
                        value={imgQuality}
                        onChange={(e) => setImgQuality(e.target.value as 'standard' | 'studio')}
                        className="w-full bg-black/30 border border-white/10 text-white text-xs px-2 py-1.5 rounded outline-none"
                      >
                        <option value="standard">Standard (Fast)</option>
                        <option value="studio">Studio Pro (Image 3)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-white/40 uppercase block">Image-To-Image (Optional):</span>
                      <label className="w-full bg-black/30 border border-white/10 text-white text-[10px] px-2 py-2 rounded flex items-center justify-center cursor-pointer hover:border-white/20 transition">
                        <Upload className="w-3.5 h-3.5 mr-1" />
                        <span>{imageFile ? 'Uploaded' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'image-lab')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/5 pt-3">
                    {imageFile && (
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] text-green-400">✓ Image Loaded as reference</span>
                        <button onClick={() => setImageFile(null)} className="text-red-400 hover:text-red-300 text-[9px] underline">Clear</button>
                      </div>
                    )}
                    <div className="flex-1" />
                    <button
                      onClick={handleGenerateImage}
                      disabled={loading || !imagePrompt.trim()}
                      className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 rounded text-xs text-cyan-400 hover:text-cyan-300 transition"
                    >
                      Synthesize Frame
                    </button>
                  </div>
                </div>

                {generatedImage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-black/20 border border-white/10 rounded-lg p-3 flex flex-col items-center justify-center space-y-3"
                  >
                    <img src={generatedImage} alt="AI Generated" className="rounded-lg max-h-[300px] object-contain border border-white/10" />
                    <a
                      href={generatedImage}
                      download="jarvis-image-frame.png"
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-white transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download high quality image</span>
                    </a>
                  </motion.div>
                )}
              </div>
            )}

            {/* 3. VIDEO TAB (Veo) */}
            {activeTab === 'video' && (
              <div className="space-y-4">
                <div className="bg-black/20 border border-white/5 p-4 rounded-lg space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/50 uppercase tracking-wider block">Veo Motion Prompt:</label>
                    <textarea
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/40 transition font-mono min-h-[70px] resize-none"
                      placeholder="Input the scene description..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] text-white/40 uppercase block">Aspect Ratio:</span>
                      <select
                        value={videoAspectRatio}
                        onChange={(e) => setVideoAspectRatio(e.target.value as '16:9' | '9:16')}
                        className="w-full bg-black/30 border border-white/10 text-white text-xs px-2 py-1.5 rounded outline-none"
                      >
                        <option value="16:9">16:9 Landscape</option>
                        <option value="9:16">9:16 Portrait</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-white/40 uppercase block">Animate Starting Photo (Image-to-Video):</span>
                      <label className="w-full bg-black/30 border border-white/10 text-white text-[10px] px-2 py-2 rounded flex items-center justify-center cursor-pointer hover:border-white/20 transition">
                        <Upload className="w-3.5 h-3.5 mr-1" />
                        <span>{videoStartImage ? 'Photo Loaded' : 'Upload Start Frame'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'video-lab')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/5 pt-3">
                    {videoStartImage && (
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] text-green-400">✓ Animate starting frame active</span>
                        <button onClick={() => setVideoStartImage(null)} className="text-red-400 hover:text-red-300 text-[9px] underline">Clear</button>
                      </div>
                    )}
                    <div className="flex-1" />
                    <button
                      onClick={handleGenerateVideo}
                      disabled={loading || (!videoPrompt.trim() && !videoStartImage)}
                      className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 rounded text-xs text-cyan-400 hover:text-cyan-300 transition"
                    >
                      Synthesize Veo Video
                    </button>
                  </div>
                </div>

                {generatedVideo && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-black/20 border border-white/10 rounded-lg p-3 flex flex-col items-center justify-center space-y-3"
                  >
                    <video src={generatedVideo.url} controls className="rounded-lg max-h-[350px] border border-white/10 w-full" />
                    <a
                      href={generatedVideo.url}
                      download="jarvis-video-clip.mp4"
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-white transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Veo video clip</span>
                    </a>
                  </motion.div>
                )}
              </div>
            )}

            {/* 4. GROUNDED CHATBOT */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-[400px] border border-white/5 rounded-lg bg-black/10 overflow-hidden relative">
                {/* HUD controls */}
                <div className="p-3 bg-black/25 border-b border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                  <div className="flex items-center space-x-2">
                    <span className="text-white/40">Role:</span>
                    <select
                      value={chatRole}
                      onChange={(e) => setChatRole(e.target.value)}
                      className="bg-black/30 border border-white/10 text-white rounded p-1 outline-none text-[10px]"
                    >
                      <option value="ceo">CEO Jarvis</option>
                      <option value="developer">Lead Dev</option>
                      <option value="therapist">Compass Therapist</option>
                      <option value="finance">Wealth Advisor</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setUseSearch(!useSearch)}
                    className={`flex items-center justify-center space-x-1 p-1 border rounded transition ${
                      useSearch ? 'bg-cyan-500/15 border-cyan-500/35 text-cyan-400' : 'border-white/10 text-white/50 hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Search Grounding</span>
                  </button>

                  <button
                    onClick={() => setUseMaps(!useMaps)}
                    className={`flex items-center justify-center space-x-1 p-1 border rounded transition ${
                      useMaps ? 'bg-cyan-500/15 border-cyan-500/35 text-cyan-400' : 'border-white/10 text-white/50 hover:text-white'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Maps Grounding</span>
                  </button>

                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setUseHighThinking(!useHighThinking);
                        if (!useHighThinking) setUseLowLatency(false);
                      }}
                      title="Pro model deep reasoning"
                      className={`flex-1 flex items-center justify-center space-x-1 p-1 border rounded transition ${
                        useHighThinking ? 'bg-cyan-500/15 border-cyan-500/35 text-cyan-400 font-bold' : 'border-white/10 text-white/50 hover:text-white'
                      }`}
                    >
                      <Brain className="w-3.5 h-3.5" />
                      <span>Thinking Mode</span>
                    </button>

                    <button
                      onClick={() => {
                        setUseLowLatency(!useLowLatency);
                        if (!useLowLatency) setUseHighThinking(false);
                      }}
                      title="Low latency Flash Lite"
                      className={`flex-1 flex items-center justify-center space-x-1 p-1 border rounded transition ${
                        useLowLatency ? 'bg-orange-500/15 border-orange-500/35 text-orange-400 font-bold' : 'border-white/10 text-white/50 hover:text-white'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Fast</span>
                    </button>
                  </div>
                </div>

                {/* Thread */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col max-w-[85%] rounded-lg p-3 border leading-relaxed text-xs ${
                        msg.role === 'user'
                          ? 'ml-auto bg-white/10 border-white/20 text-white font-mono'
                          : 'bg-cyan-500/5 border border-cyan-500/20 text-cyan-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[8px] text-white/40 mb-1">
                        <span>{msg.role === 'user' ? 'SAM' : 'JARVIS'}</span>
                        {msg.info && <span className="text-cyan-400 font-bold">{msg.info}</span>}
                      </div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
                </div>

                {/* Chat input footer */}
                <div className="p-3 border-t border-white/5 flex items-center space-x-2 bg-black/10">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                    placeholder="Enter query into cognitive grid..."
                    className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-xs text-white outline-none focus:border-cyan-500/40 transition placeholder-white/25"
                  />
                  <button
                    onClick={handleSendChatMessage}
                    disabled={loading || !chatInput.trim()}
                    className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 5. Vision TAB */}
            {activeTab === 'vision' && (
              <div className="space-y-4">
                <div className="bg-black/20 border border-white/5 p-4 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-[10px] text-white/50 uppercase block">1. Upload Image or Video File:</span>
                      <label className="border border-dashed border-white/15 hover:border-cyan-500/30 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer bg-black/15 transition h-[130px]">
                        <Upload className="w-6 h-6 text-cyan-400/70 mb-2" />
                        <span className="text-xs text-white/80">{mediaFile ? mediaFile.name : 'Drag or Upload File'}</span>
                        <span className="text-[9px] text-white/30 mt-1">Accepts images/videos</span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={(e) => handleImageUpload(e, 'vision-lab')}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] text-white/50 uppercase block">2. Analysis Prompts:</span>
                      <textarea
                        value={visionPrompt}
                        onChange={(e) => setVisionPrompt(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/40 transition font-mono h-[130px] resize-none"
                        placeholder="E.g., What is in this video? Extract logs or bug details..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/5 pt-3">
                    {mediaFile && (
                      <div className="flex items-center space-x-2">
                        {mediaFile.mimeType.startsWith('video/') ? (
                          <FileVideo className="w-4 h-4 text-cyan-400 animate-pulse" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-cyan-400 animate-pulse" />
                        )}
                        <span className="text-[9px] text-green-400">File Loaded ({mediaFile.name})</span>
                        <button onClick={() => setMediaFile(null)} className="text-red-400 hover:text-red-300 text-[9px] underline">Clear</button>
                      </div>
                    )}
                    <div className="flex-1" />
                    <button
                      onClick={handleAnalyzeMedia}
                      disabled={loading || !mediaFile}
                      className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 rounded text-xs text-cyan-400 hover:text-cyan-300 transition"
                    >
                      Analyze Content
                    </button>
                  </div>
                </div>

                {visionResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-lg space-y-2"
                  >
                    <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">Analysis Result:</span>
                    <p className="text-xs text-white/90 leading-relaxed whitespace-pre-wrap">{visionResponse}</p>
                  </motion.div>
                )}
              </div>
            )}

            {/* 6. TRANSCRIBE TAB */}
            {activeTab === 'transcribe' && (
              <div className="space-y-4">
                <div className="bg-black/20 border border-white/5 p-6 rounded-lg flex flex-col items-center justify-center space-y-4">
                  <span className="text-[11px] text-white/50 uppercase tracking-widest text-center">Record or Stream Voice Capture</span>

                  <div className="relative">
                    {isRecording && (
                      <div className="absolute inset-[-10px] bg-red-500/10 rounded-full blur animate-ping" />
                    )}
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-6 rounded-full border transition ${
                        isRecording
                          ? 'bg-red-500/10 border-red-500/30 text-red-400'
                          : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/10'
                      }`}
                    >
                      <Mic className="w-8 h-8" />
                    </button>
                  </div>

                  <span className="text-xs text-white/80">
                    {isRecording ? `Recording... (${recordingDuration}s)` : 'Click Mic to Begin Transcribing'}
                  </span>

                  {isRecording && (
                    <div className="flex space-x-1.5 h-6 items-end pb-1">
                      <div className="w-1 bg-red-400 rounded h-2 animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1 bg-red-400 rounded h-4 animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-1 bg-red-400 rounded h-3 animate-bounce" style={{ animationDelay: '0.3s' }} />
                      <div className="w-1 bg-red-400 rounded h-5 animate-bounce" style={{ animationDelay: '0.4s' }} />
                      <div className="w-1 bg-red-400 rounded h-2 animate-bounce" style={{ animationDelay: '0.5s' }} />
                    </div>
                  )}
                </div>

                {transcriptionResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-lg space-y-2"
                  >
                    <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">Transcribed Spoken Audio:</span>
                    <p className="text-xs text-white/90 leading-relaxed bg-black/20 p-3 rounded border border-white/5 font-mono">
                      "{transcriptionResult}"
                    </p>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
