import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, FileText, X, Sparkles, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error("File size must be under 50MB");
      return;
    }
    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.replace(".pdf", ""));
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    setProgress(10);
    let uploadedDocumentId: string | null = null;

    try {
      // Sanitize filename: replace any character that isn't alphanumeric, dash, underscore, or dot
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      // Upload to storage
      const filePath = `${user.id}/${Date.now()}_${sanitizedName}`;
      setProgress(30);

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      setProgress(60);

      // Create document record
      const { data: doc, error: docError } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          title: title || file.name.replace(".pdf", ""),
          file_path: filePath,
          file_size: file.size,
          status: "processing",
        })
        .select()
        .single();

      if (docError) throw docError;
      uploadedDocumentId = doc.id;

      setProgress(70);

      const { extractPdfPages } = await import("@/lib/pdf");
      const extracted = await extractPdfPages(file);
      if (!extracted.text.trim()) {
        throw new Error("The PDF was uploaded, but no readable text could be extracted from it.");
      }

      setProgress(88);

      const { error: extractionError } = await supabase.functions.invoke("extract-text", {
        body: {
          documentId: doc.id,
          text: extracted.text,
          pages: extracted.pages,
        },
      });

      if (extractionError) {
        throw extractionError;
      }

      setProgress(100);

      toast.success("Document uploaded successfully!");
      
      // Navigate to study page
      setTimeout(() => {
        navigate(`/study/${doc.id}`);
      }, 500);

    } catch (error: any) {
      console.error("Upload error:", error);
      if (uploadedDocumentId) {
        await supabase
          .from("documents")
          .update({ status: "error" })
          .eq("id", uploadedDocumentId);
      }
      toast.error(error.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 sticky top-0 z-50 backdrop-blur-xl bg-background/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-text-secondary hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Upload Document</h1>
          <p className="text-text-secondary">
            Upload your study material to start learning with AI
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Drop zone */}
          <div
            className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all cursor-pointer ${
              dragActive
                ? "border-primary bg-primary/5"
                : file
                ? "border-success bg-success/5"
                : "border-border/50 hover:border-primary/50 hover:bg-primary/5"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {file ? (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{file.name}</p>
                  <p className="text-sm text-text-muted">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setTitle("");
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    Drop your PDF here or click to browse
                  </p>
                  <p className="text-sm text-text-muted">
                    Maximum file size: 50MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Title input */}
          {file && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6"
            >
              <label className="block text-sm font-medium mb-2">
                Document Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your document"
              />
            </motion.div>
          )}

          {/* Progress bar */}
          {uploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6"
            >
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-text-muted text-center mt-2">
                {progress < 100 ? "Uploading..." : "Complete!"}
              </p>
            </motion.div>
          )}

          {/* Upload button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <Button
              className="w-full btn-primary"
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? "Uploading..." : "Upload & Start Studying"}
            </Button>
          </motion.div>

          {/* Features */}
          <div className="mt-12 grid sm:grid-cols-3 gap-4 text-center">
            {[
              { icon: FileText, title: "PDF Support", desc: "Upload any PDF document" },
              { icon: Sparkles, title: "AI Processing", desc: "Automatic page extraction and retrieval indexing" },
              { icon: CheckCircle2, title: "Instant Access", desc: "Start studying as soon as indexing finishes" },
            ].map((feature) => (
              <div key={feature.title} className="p-4">
                <feature.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium">{feature.title}</h3>
                <p className="text-sm text-text-muted">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
