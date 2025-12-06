"use client";

import { useState, useRef } from "react";
import { Flame, Upload, FileText, Loader2 } from "lucide-react";
import RoastChat from "@/components/RoastChat";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isRoasting, setIsRoasting] = useState(false);
  const [roastMessages, setRoastMessages] = useState<string>("");
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
    }
  };

  const handleRoast = async () => {
    if (!file) return;

    setIsRoasting(true);
    setShowResults(true);
    setRoastMessages("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Roast failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        setRoastMessages((prev) => prev + chunk);
      }
    } catch (error) {
      console.error("Error:", error);
      setRoastMessages("Error: No pudimos hacer el roast. Intenta de nuevo.");
    } finally {
      setIsRoasting(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setShowResults(false);
    setRoastMessages("");
    setIsRoasting(false);
  };

  if (showResults) {
    return (
      <RoastChat 
        messages={roastMessages} 
        isLoading={isRoasting} 
        onReset={resetUpload}
        fileName={file?.name || ""}
      />
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Flame className="w-12 h-12 text-fire-500 animate-flame" />
          <h1 className="font-display text-5xl md:text-7xl font-extrabold fire-text">
            ROAST MY STARTUP
          </h1>
          <Flame className="w-12 h-12 text-fire-500 animate-flame" />
        </div>
        <p className="text-gray-400 text-lg md:text-xl font-body max-w-2xl mx-auto">
          Sube tu pitch deck y 3 VCs de IA te van a destrozar sin piedad.
          <br />
          <span className="text-fire-400">Feedback disfrazado de roast.</span>
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`
          relative w-full max-w-xl p-8 rounded-2xl border-2 border-dashed 
          transition-all duration-300 cursor-pointer
          ${file 
            ? "border-fire-500 bg-fire-500/10" 
            : "border-gray-700 hover:border-fire-500/50 bg-dark-800/50"
          }
        `}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          {file ? (
            <>
              <FileText className="w-16 h-16 text-fire-500" />
              <div className="text-center">
                <p className="text-white font-semibold text-lg">{file.name}</p>
                <p className="text-gray-400 text-sm">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-16 h-16 text-gray-500" />
              <div className="text-center">
                <p className="text-white font-semibold text-lg">
                  Arrastra tu pitch deck aquí
                </p>
                <p className="text-gray-400 text-sm">o haz click para seleccionar (PDF)</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Roast Button */}
      {file && (
        <button
          onClick={handleRoast}
          disabled={isRoasting}
          className={`
            mt-8 px-12 py-4 rounded-xl font-display font-bold text-xl
            transition-all duration-300 animate-slide-up
            ${isRoasting
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-gradient-to-r from-fire-600 to-fire-500 hover:from-fire-500 hover:to-fire-400 glow-fire"
            }
          `}
        >
          {isRoasting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Roasting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Flame className="w-5 h-5" />
              🔥 ROAST MY DECK 🔥
            </span>
          )}
        </button>
      )}

      {/* VC Preview */}
      <div className="mt-16 flex gap-8 animate-fade-in">
        {[
          { name: "Marcus", role: "Ex-YC Partner", color: "vc-marcus", emoji: "😤" },
          { name: "Victoria", role: "Growth Obsessed", color: "vc-victoria", emoji: "📊" },
          { name: "David", role: "The 'Nice' One", color: "vc-david", emoji: "😬" },
        ].map((vc) => (
          <div key={vc.name} className="text-center">
            <div className={`w-16 h-16 rounded-full ${vc.color} flex items-center justify-center text-2xl mb-2`}>
              {vc.emoji}
            </div>
            <p className="text-white font-semibold">{vc.name}</p>
            <p className="text-gray-500 text-xs">{vc.role}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
