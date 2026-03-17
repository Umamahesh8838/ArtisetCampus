import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRegistration } from "@/contexts/RegistrationContext";
import { toast } from "sonner";
import { Upload, FileText, Sparkles, X, Loader2 } from "lucide-react";

const RESUME_API_URL = "https://your-friends-api.com/parse-resume"; // Replace with actual API

const ResumeUploader = () => {
  const { setResumeData } = useRegistration();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setParsed(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && (dropped.type === "application/pdf" || dropped.name.endsWith(".doc") || dropped.name.endsWith(".docx"))) {
      setFile(dropped);
      setParsed(false);
    } else {
      toast.error("Please upload a PDF or DOC file");
    }
  };

  const handleFillFromResume = async () => {
    if (!file) {
      toast.error("Please upload a resume first");
      return;
    }

    setParsing(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch(RESUME_API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to parse resume");

      const data = await response.json();
      setResumeData({ ...data, resumeFileName: file.name });
      setParsed(true);
      toast.success("Resume parsed! Fields have been auto-filled. Please review and complete any missing information.");
    } catch (error) {
      console.error("Resume parsing error:", error);
      toast.error("Failed to parse resume. Please fill the form manually or try again.");
    } finally {
      setParsing(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setParsed(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/[0.03] to-accent/30">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-primary" />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-display font-semibold text-lg text-foreground">
                Quick Fill with Resume
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Upload your resume to auto-fill the registration form. You can also fill everything manually below.
              </p>
            </div>

            {!file ? (
              <div
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-accent/50 transition-colors"
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
              >
                <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground">
                  Drag & drop your resume here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse (PDF, DOC, DOCX)
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                    {parsed && <span className="text-success ml-2">✓ Parsed successfully</span>}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={clearFile}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <Button
                onClick={handleFillFromResume}
                disabled={!file || parsing}
                className="gap-2"
              >
                {parsing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {parsing ? "Parsing Resume..." : "Fill Data from Resume"}
              </Button>

              <span className="text-xs text-muted-foreground">
                or scroll down to fill manually
              </span>
            </div>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileChange}
        />
      </CardContent>
    </Card>
  );
};

export default ResumeUploader;
