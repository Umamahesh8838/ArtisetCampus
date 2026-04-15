const fs = require('fs');

const p = 'C:/Users/HP/OneDrive/Desktop/Artiset internship/ArtisetCampus/frontend/src/pages/student/Profile.tsx';
let content = fs.readFileSync(p, 'utf8');

const startStr = 'const handleFileSelect = async (file?: File) => {';
const endStr = 'const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {';
const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find start or end index.");
  process.exit(1);
}

const replacement = `const handleFileSelect = async (file?: File) => {
    if (!file) return;
    
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type) && !file.name.match(/\\.(pdf|docx)$/i)) {
      toast.error('Only PDF or DOCX files are supported');
      return;
    }

    // Immediately upload securely to Azure 
    setSelectedResumeFile(file);
    setResumeUploadStatus('Uploading securely to Azure Storage...');
    const loadingToastId = toast.loading("Uploading resume securely to Azure Storage...");
    
    try {
      const form = new FormData();
      form.append('file', file, file.name);

      const resp = await client.post('/upload/resume', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (resp.data && resp.data.success) {
        toast.dismiss(loadingToastId);
        toast.success("Resume stored securely in Azure Storage!");
        setResumeUploadStatus(file.name + ' uploaded securely.');
      } else {
        throw new Error("Failed response from Azure upload");
      }
    } catch (err: any) {
      console.error('[FRONTEND] Upload error:', err);
      toast.dismiss(loadingToastId);
      toast.error('Failed to upload resume to Azure. Please try again.');
      setResumeUploadStatus(null);
      setSelectedResumeFile(null);
    }
  };

  const handleParseResume = async () => {
    if (!selectedResumeFile) {
        toast.error("Please upload a resume first before parsing");
        return;
    }

    setParsing(true);
    setIsParsingResume(true);
    setParseStatusMessage('AI is reading your resume. This takes 1-3 minutes. Please wait...');
    const loadingToastId = toast.loading("Parsing your resume... this may take several minutes");
    
    try {
      const token = localStorage.getItem('authToken');
      const form = new FormData();
      form.append('file', selectedResumeFile, selectedResumeFile.name);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes

      const resp = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/resume/parse-preview', {
        method: 'POST',
        headers: token ? { Authorization: \`Bearer \${token}\` } : undefined,
        body: form,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!resp.ok) {
        let errMsg = 'Parsing failed';
        try {
            const err = await resp.json();
            errMsg = err.message || errMsg;
        } catch(e) {}
        throw new Error(errMsg);
      }

      const data = await resp.json();
      const parsedDraft = data.draft || {};
      const hash = data.resume_hash || null;
      const mappedDraft = mapRawResumeToDraftFormat(parsedDraft);

      // Save directly to the frontend's Context
      setDraftDataDirect(mappedDraft);
      if (hash) setResumeHash(hash);

      try {
        await client.put('/auth/registration/draft', { draft: mappedDraft, step: openSection || 'basic' });
      } catch (e) {
        console.error('Failed to save draft to backend:', e);
      }

      applyDraftToContext(parsedDraft, hash);
      setParseStatusMessage('Done!');
      toast.dismiss(loadingToastId);
      toast.success('Resume parsed successfully! We pre-filled the form below.');
    } catch (err: any) {
      console.error('Resume parse error', err);
      setParseStatusMessage('Failed. Please try again.');
      setErrorBanner('Could not parse resume automatically. Please fill in the form manually.');
      setShowSuccessBanner(false);
      toast.dismiss(loadingToastId);
      toast.error('Failed to parse resume.');
    } finally {
      setParsing(false);
      setIsParsingResume(false);
    }
  };

  `;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(p, content, 'utf8');
console.log("Patched successfully!");
const fs = require('fs');
const p = 'C:/Users/HP/OneDrive/Desktop/Artiset internship/ArtisetCampus/frontend/src/pages/student/Profile.tsx';
let content = fs.readFileSync(p, 'utf8');

const startStr = 'const handleFileSelect = async (file?: File) => {';
const endStr = 'const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {';
const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
  process.exit(1);
}

const replacement = `
  const handleFileSelect = async (file?: File) => {
    if (!file) return;
    
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type) && !file.name.match(/\\.(pdf|docx)$/i)) {
      toast.error('Only PDF or DOCX files are supported');
      return;
    }

    // Immediately upload securely to Azure 
    setSelectedResumeFile(file);
    setResumeUploadStatus('Uploading securely to Azure Storage...');
    const loadingToastId = toast.loading("Uploading resume securely to Azure Storage...");
    
    try {
      const form = new FormData();
      form.append('file', file, file.name);

      const resp = await client.post('/upload/resume', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (resp.data?.success) {
        toast.dismiss(loadingToastId);
        toast.success("Resume stored securely in Azure Storage!");
        setResumeUploadStatus(file.name + ' uploaded securely.');
      } else {
        throw new Error("Failed response from Azure upload");
      }
    } catch (err: any) {
      console.error('[FRONTEND] Upload error:', err);
      toast.dismiss(loadingToastId);
      toast.error('Failed to upload resume to Azure. Please try again.');
      setResumeUploadStatus(null);
      setSelectedResumeFile(null);
    }
  };

  const handleParseResume = async () => {
    if (!selectedResumeFile) {
        toast.error("Please upload a resume first before parsing");
        return;
    }

    setParsing(true);
    setIsParsingResume(true);
    setParseStatusMessage('AI is reading your resume. This takes 1-3 minutes. Please wait...');
    const loadingToastId = toast.loading("Parsing your resume... this may take several minutes");
    
    try {
      const token = localStorage.getItem('authToken');
      const form = new FormData();
      form.append('file', selectedResumeFile, selectedResumeFile.name);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800000);

      const resp = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/resume/parse-preview', {
        method: 'POST',
        headers: token ? { Authorization: \`Bearer \${token}\` } : undefined,
        body: form,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || 'Parsing failed');
      }

      const data = await resp.json();
      const parsedDraft = data.draft || {};
      const hash = data.resume_hash || null;
      const mappedDraft = mapRawResumeToDraftFormat(parsedDraft);

      setDraftDataDirect(mappedDraft);
      if (hash) setResumeHash(hash);

      try {
        await client.put('/auth/registration/draft', { draft: mappedDraft, step: openSection || 'basic' });
      } catch (e) {
        console.error('Failed to save draft to backend:', e);
      }

      applyDraftToContext(parsedDraft, hash);
      setParseStatusMessage('Done!');
      toast.dismiss(loadingToastId);
      toast.success('Resume parsed successfully! We pre-filled the form below.');
    } catch (err: any) {
      console.error('Resume parse error', err);
      setParseStatusMessage('Failed. Please try again.');
      setErrorBanner('Could not parse resume automatically. Please fill in the form manually.');
      setShowSuccessBanner(false);
      toast.dismiss(loadingToastId);
      toast.error('Failed to parse resume.');
    } finally {
      setParsing(false);
      setIsParsingResume(false);
    }
  };

  `;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(p, content, 'utf8');
console.log("Patched successfully!");const fs = require('fs');
const path = 'C:/Users/HP/OneDrive/Desktop/Artiset internship/ArtisetCampus/frontend/src/pages/student/Profile.tsx';
let content = fs.readFileSync(path, 'utf8');

const startIndex = content.indexOf('const handleFileSelect = async (file?: File) => {');
const endIndex = content.indexOf('const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {');

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find bounds");
  process.exit(1);
}

const replacement = 
  const handleFileSelect = async (file?: File) => {
    if (!file) return;
    
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type) && !file.name.match(/\\.(pdf|docx)$/i)) {
      toast.error('Only PDF or DOCX files are supported');
      return;
    }

    // Immediately upload securely to Azure 
    setSelectedResumeFile(file);
    setResumeUploadStatus('Uploading...');
    const loadingToastId = toast.loading("Uploading resume securely to Azure Storage...");
    
    try {
      const form = new FormData();
      form.append('file', file, file.name);

      const resp = await client.post('/upload/resume', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (resp.data?.success) {
        toast.dismiss(loadingToastId);
        toast.success("Resume stored securely in Azure Storage!");
        setResumeUploadStatus(file.name + ' uploaded securely.');
      } else {
        throw new Error("Failed response from Azure upload");
      }
    } catch (err: any) {
      console.error('[FRONTEND] Upload error:', err);
      toast.dismiss(loadingToastId);
      toast.error('Failed to upload resume to Azure. Please try again.');
      setResumeUploadStatus(null);
      setSelectedResumeFile(null);
    }
  };

  const handleParseResume = async () => {
    if (!selectedResumeFile) {
        toast.error("Please upload a resume first before parsing");
        return;
    }

    setParsing(true);
    setIsParsingResume(true);
    setParseStatusMessage('AI is reading your resume. This takes 1-3 minutes. Please wait...');
    const loadingToastId = toast.loading("Parsing your resume... this may take several minutes");
    
    try {
      const token = localStorage.getItem('authToken');
      const form = new FormData();
      form.append('file', selectedResumeFile, selectedResumeFile.name);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800000);

      const resp = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/resume/parse-preview', {
        method: 'POST',
        headers: token ? { Authorization: \\\Bearer \\\\\\ } : undefined,
        body: form,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || 'Parsing failed');
      }

      const data = await resp.json();
      const parsedDraft = data.draft || {};
      const hash = data.resume_hash || null;
      const mappedDraft = mapRawResumeToDraftFormat(parsedDraft);

      setDraftDataDirect(mappedDraft);
      if (hash) setResumeHash(hash);

      try {
        await client.put('/auth/registration/draft', { draft: mappedDraft, step: openSection || 'basic' });
      } catch (e) {
        console.error('Failed to save draft to backend:', e);
      }

      applyDraftToContext(parsedDraft, hash);
      setParseStatusMessage('Done!');
      toast.dismiss(loadingToastId);
      toast.success('Resume parsed successfully! We pre-filled the form below.');
    } catch (err: any) {
      console.error('Resume parse error', err);
      setParseStatusMessage('Failed. Please try again.');
      setErrorBanner('Could not parse resume automatically. Please fill in the form manually.');
      setShowSuccessBanner(false);
      toast.dismiss(loadingToastId);
      toast.error('Failed to parse resume.');
    } finally {
      setParsing(false);
      setIsParsingResume(false);
    }
  };

  ;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(path, content, 'utf8');
console.log("Patched successfully!");
