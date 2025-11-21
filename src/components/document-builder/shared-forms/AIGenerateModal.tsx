"use client";

import React, { useState, useEffect, useRef } from "react";
import Modal from "@/components/ui/Modal";
import { Sparkles, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  generateCoverLetter,
  generateSummary,
  saveCredentials,
  loadCredentials,
  OpenAIAPIError,
} from "@/lib/services/openai";
import type { ResumeData } from "@/types";

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (content: string) => void;
  resumeData: ResumeData;
  mode: "coverLetter" | "summary";
}

const DEFAULT_API_URL = "https://api.openai.com";
const DEFAULT_MODEL = "gpt-4o-mini";

const AIGenerateModal: React.FC<AIGenerateModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  resumeData,
  mode,
}) => {
  // Form state
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [apiKey, setApiKey] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [rememberCredentials, setRememberCredentials] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamedContent, setStreamedContent] = useState("");
  const streamContainerRef = useRef<HTMLDivElement>(null);

  // Mode-specific configuration
  const config = {
    coverLetter: {
      title: "🤖 AI Cover Letter Generator",
      label: "Cover Letter",
      successMessage: "Cover letter generated successfully!",
      successDescription: "The AI has crafted your personalized cover letter.",
      errorMessage: "Failed to generate cover letter",
      streamingMessage: "AI is crafting your cover letter...",
      generateFunction: generateCoverLetter,
    },
    summary: {
      title: "🤖 AI Professional Summary Generator",
      label: "Professional Summary",
      successMessage: "Professional summary generated successfully!",
      successDescription: "The AI has crafted your tailored professional summary.",
      errorMessage: "Failed to generate professional summary",
      streamingMessage: "AI is crafting your professional summary...",
      generateFunction: generateSummary,
    },
  };

  const currentConfig = config[mode];

  // Load saved credentials and job description on mount
  useEffect(() => {
    if (isOpen) {
      const saved = loadCredentials();
      if (saved) {
        if (saved.rememberCredentials) {
          setApiUrl(saved.apiUrl);
          setApiKey(saved.apiKey);
          setRememberCredentials(true);
        }
        // Always load last job description if available
        if (saved.lastJobDescription) {
          setJobDescription(saved.lastJobDescription);
        }
      }
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setJobDescription("");
      setError(null);
      setIsGenerating(false);
      setStreamedContent("");
    }
  }, [isOpen]);

  // Auto-scroll to bottom when streaming content updates
  useEffect(() => {
    if (streamContainerRef.current) {
      streamContainerRef.current.scrollTop =
        streamContainerRef.current.scrollHeight;
    }
  }, [streamedContent]);

  // Validate form
  const isFormValid =
    apiUrl.trim() !== "" &&
    apiKey.trim() !== "" &&
    jobDescription.trim() !== "";

  // Handle form submission
  const handleGenerate = async () => {
    if (!isFormValid) {
      setError("Please fill in all fields");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setStreamedContent("");

    try {
      // Save credentials and job description
      saveCredentials({
        apiUrl,
        apiKey,
        rememberCredentials,
        lastJobDescription: jobDescription,
      });

      // Generate content with streaming
      const content = await currentConfig.generateFunction(
        {
          baseURL: apiUrl,
          apiKey: apiKey,
          model: DEFAULT_MODEL,
        },
        resumeData,
        jobDescription,
        (chunk) => {
          // Update streamed content in real-time
          if (chunk.content) {
            setStreamedContent((prev) => prev + chunk.content);
          }
        }
      );

      // Success!
      toast.success(currentConfig.successMessage, {
        description: currentConfig.successDescription,
      });

      onGenerate(content);
      onClose();
    } catch (err) {
      console.error(`${currentConfig.label} generation error:`, err);

      let errorMessage = currentConfig.errorMessage;

      if (err instanceof OpenAIAPIError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error("Generation failed", {
        description: errorMessage,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Enter key in textarea (Ctrl/Cmd+Enter to submit)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && isFormValid) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={currentConfig.title}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Collapsible API Settings */}
        <details className="group" open={!apiKey}>
          <summary className="cursor-pointer list-none">
            <div className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10">
              <div className="flex items-center gap-2">
                <div className="text-white/80 text-sm font-medium">
                  🔑 API Configuration
                </div>
                <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded-full">
                  Required
                </span>
                {apiKey && rememberCredentials && (
                  <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-300 rounded-full">
                    Saved
                  </span>
                )}
              </div>
              <svg
                className="w-5 h-5 text-white/60 transition-transform group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </summary>

          <div className="mt-4 space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
            {/* API URL */}
            <div className="space-y-2">
              <label
                htmlFor="api-url"
                className="block text-sm font-medium text-white flex items-center gap-2"
              >
                API URL
                <span className="text-xs text-white/50 font-normal">
                  (OpenAI or compatible)
                </span>
              </label>
              <input
                id="api-url"
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.openai.com"
                className="w-full px-4 py-2.5 bg-white/10 text-white rounded-lg text-sm border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all placeholder:text-white/30"
                disabled={isGenerating}
              />
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <label
                htmlFor="api-key"
                className="block text-sm font-medium text-white flex items-center gap-2"
              >
                API Key
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  Get key
                </a>
              </label>
              <div className="relative">
                <input
                  id="api-key"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full px-4 py-2.5 pr-12 bg-white/10 text-white rounded-lg text-sm border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all placeholder:text-white/30"
                  disabled={isGenerating}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  aria-label={showApiKey ? "Hide API key" : "Show API key"}
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember credentials checkbox */}
            <div className="flex items-start gap-2 pt-2">
              <input
                id="remember-credentials"
                type="checkbox"
                checked={rememberCredentials}
                onChange={(e) => setRememberCredentials(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-400/20"
                disabled={isGenerating}
              />
              <label
                htmlFor="remember-credentials"
                className="text-sm text-white/80 cursor-pointer leading-snug"
              >
                Remember my API credentials
                <span className="block text-xs text-white/50 mt-0.5">
                  Stored securely in your browser. Job description always saved
                  separately.
                </span>
              </label>
            </div>
          </div>
        </details>

        {/* Collapsible Job Description */}
        <details className="group" open={!jobDescription}>
          <summary className="cursor-pointer list-none">
            <div className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10">
              <div className="flex items-center gap-2">
                <div className="text-white/80 text-sm font-medium">
                  📄 Job Description
                </div>
                <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded-full">
                  Required
                </span>
                {jobDescription && (
                  <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-300 rounded-full">
                    {jobDescription.length} characters
                  </span>
                )}
              </div>
              <svg
                className="w-5 h-5 text-white/60 transition-transform group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </summary>

          <div className="mt-4 space-y-2 p-4 bg-white/5 rounded-lg border border-white/10">
            <label
              htmlFor="job-description"
              className="block text-sm font-medium text-white"
            >
              Job Description
            </label>
            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste the job posting here...

✓ Job title and requirements
✓ Responsibilities and qualifications
✓ Company info and benefits
✓ Any specific skills or experience needed"
              rows={12}
              className="w-full px-4 py-3 bg-white/10 text-white rounded-lg text-sm border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all resize-y min-h-[240px] placeholder:text-white/30 leading-relaxed"
              disabled={isGenerating}
            />
          </div>
        </details>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-300">Error</p>
              <p className="text-sm text-red-200 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Streaming content display - Fixed height above button */}
        {isGenerating && (
          <div>
            <div
              ref={streamContainerRef}
              className="bg-white/5 border border-white/10 rounded-lg p-3 h-32 overflow-y-auto scroll-smooth"
            >
              {streamedContent ? (
                <>
                  <p className="text-[10px] text-white/80 whitespace-pre-wrap leading-relaxed">
                    {streamedContent}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-blue-400">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    <span>Generating...</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center gap-2 text-[10px] text-white/40">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Waiting for response...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Generate button - only show when not generating */}
        {!isGenerating && (
          <div className="space-y-3 pt-2">
            <button
              onClick={handleGenerate}
              disabled={!isFormValid}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 group"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Generate {currentConfig.label}</span>
            </button>

            {/* Helper text */}
            {!isFormValid && (
              <p className="text-xs text-center text-white/50">
                {!apiKey
                  ? "⚠️ API key required"
                  : !jobDescription
                  ? "⚠️ Job description required"
                  : "Fill all fields to continue"}
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AIGenerateModal;
