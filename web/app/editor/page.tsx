'use client';

import { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, Wand2, Download, Sparkles, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TextArea } from '../../components/ui/TextArea';
import { Banner, BannerKind } from '../../components/Banner';
import { AuthGuard } from '../../components/AuthGuard';
import { UploadArea, FeatureCard } from '../../components/ui/UploadArea';

function EditorPageInner() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [editedUrl, setEditedUrl] = useState<string>('');
  const [editedKey, setEditedKey] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [banner, setBanner] = useState<{ kind: BannerKind; msg: string } | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleFile = (file: File) => {
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      setBanner({ kind: 'error', msg: 'Sadece JPG ve PNG dosyaları desteklenir' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setBanner({ kind: 'error', msg: "Dosya boyutu 10MB'dan küçük olmalıdır" });
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setBanner(null);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleEdit = async () => {
    if (!selectedFile || !prompt.trim()) {
      setBanner({ kind: 'error', msg: 'Lütfen bir dosya seçin ve açıklama girin' });
      return;
    }
    
    setIsProcessing(true);
    setProcessingStatus('uploading');
    setProcessingProgress(0);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const uploadResult = await api.uploadFile(selectedFile);
      if (!uploadResult) {
        setBanner({ kind: 'error', msg: 'Dosya yükleme başarısız' });
        setProcessingStatus('error');
        return;
      }

      setProcessingStatus('processing');
      setProcessingProgress(50);

      const editResult = await api.editBackground(uploadResult.imageId, prompt);
      if (editResult.error || !editResult.data) {
        setBanner({ kind: 'error', msg: 'Düzenleme başlatılamadı: ' + (editResult.error?.message || '') });
        setProcessingStatus('error');
        return;
      }

      const { jobId } = editResult.data;
      let attempts = 0;
      const maxAttempts = 30;
      
      const pollStatus = async (): Promise<void> => {
        if (attempts >= maxAttempts) {
          setBanner({ kind: 'error', msg: 'İşlem zaman aşımına uğradı' });
          setProcessingStatus('error');
          return;
        }
        
        const statusResult = await api.getEditStatus(jobId);
        if (statusResult.error) {
          setBanner({ kind: 'error', msg: 'Durum sorgulanamadı: ' + statusResult.error.message });
          setProcessingStatus('error');
          return;
        }
        
        const { status, editedUrl: resultUrl, error } = statusResult.data!;
        
        if (status === 'done' && resultUrl) {
          clearInterval(progressInterval);
          setProcessingProgress(100);
          setProcessingStatus('done');
          
          const viewResult = await api.getViewUrl(resultUrl);
          if (viewResult.data) {
            setEditedUrl(viewResult.data.url);
            setEditedKey(resultUrl);
          }
          return;
        }
        
        if (status === 'failed') {
          clearInterval(progressInterval);
          setBanner({ kind: 'error', msg: 'İşlem başarısız: ' + (error || '') });
          setProcessingStatus('error');
          return;
        }
        
        attempts++;
        setTimeout(pollStatus, 2000);
      };
      
      await pollStatus();
    } catch (error) {
      console.error('Edit error:', error);
      setBanner({ kind: 'error', msg: 'Bir hata oluştu' });
      setProcessingStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const filenameFromKey = (key: string) => {
    if (!key) return 'edited-image.jpg';
    const parts = key.split('/');
    const last = parts[parts.length - 1] || 'image.jpg';
    return last.startsWith('original') ? `edited-${last}` : last;
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename || 'image';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  const promptSuggestions = [
    'Modern ofis ortamı',
    'Deniz kenarı gün batımı', 
    'Minimal stüdyo beyaz',
    'Şehir silüeti gece',
    'Orman manzarası',
    'Gökyüzü bulutlu'
  ];

  const getStatusIcon = () => {
    switch (processingStatus) {
      case 'uploading': return <Upload className="w-5 h-5" />;
      case 'processing': return <Sparkles className="w-5 h-5 animate-pulse" />;
      case 'done': return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-accent-600" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusText = () => {
    switch (processingStatus) {
      case 'uploading': return 'Dosya Yükleniyor...';
      case 'processing': return 'AI İşleniyor...';
      case 'done': return 'Tamamlandı!';
      case 'error': return 'Hata Oluştu';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-slate-100 mb-4">
            Profesyonel Görsel Düzenleme
          </h1>
          <p className="text-xl text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">
            Google Gemini 2.5 Flash ile saniyeler içinde kurumsal kalitede arka plan değiştirme
          </p>
        </div>

        {banner && (
          <div className="mb-8 animate-slide-down">
            <Banner kind={banner.kind} message={banner.msg} onClose={() => setBanner(null)} />
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Upload and Preview */}
          <div className="space-y-6 xl:col-span-1">
            {/* Upload Area */}
            <Card variant="corporate" hover={true}>
              <div
                className={`upload-area rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-105' : 
                  'border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-primary-400'
                } ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !isProcessing && document.getElementById('fileInput')?.click()}
              >
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
                  Görselinizi Yükleyin
                </h3>
                <p className="text-gray-600 dark:text-slate-400 mb-6">
                  Sürükleyip bırakın veya tıklayın
                </p>
                <div className="space-y-2 text-sm text-gray-500 dark:text-slate-500 mb-6">
                  <p>• PNG, JPG formatları</p>
                  <p>• Maksimum 10MB</p>
                  <p>• Maksimum 4096px çözünürlük</p>
                </div>
                <Button 
                  variant="outline" 
                  size="md"
                  disabled={isProcessing}
                  className="corporate-button"
                >
                  Dosya Seç
                </Button>
                <input 
                  id="fileInput" 
                  type="file" 
                  accept="image/jpeg,image/png" 
                  onChange={handleFileInput} 
                  className="hidden" 
                  disabled={isProcessing}
                />
              </div>
            </Card>

            {/* Before/After Preview */}
            {(previewUrl || editedUrl) && (
              <Card variant="elevated" header={
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold">Öncesi / Sonrası</span>
                </div>
              }>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-300">
                      <div className="w-3 h-3 bg-accent-500 rounded-full"></div>
                      Önce
                    </div>
                    {previewUrl ? (
                      <div className="relative group overflow-hidden rounded-xl border-2 border-gray-200 dark:border-slate-700">
                        <img 
                          src={previewUrl} 
                          alt="Önizleme" 
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                      </div>
                    ) : (
                      <div className="w-full h-48 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-300">
                      <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                      Sonra
                    </div>
                    {editedUrl ? (
                      <div className="relative group overflow-hidden rounded-xl border-2 border-success-200 dark:border-success-800">
                        <img 
                          src={editedUrl} 
                          alt="Düzenlenmiş" 
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                        <div className="absolute top-2 right-2 bg-success-500 text-white text-xs px-2 py-1 rounded-full">
                          Yeni
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-48 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center text-gray-400">
                        {isProcessing ? (
                          <div className="text-center">
                            <Sparkles className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                            <p className="text-xs">Hazırlanıyor...</p>
                          </div>
                        ) : (
                          <span>–</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedFile && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      <span className="font-medium">Dosya:</span> {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      <span className="font-medium">Boyut:</span> {((selectedFile.size ?? 0) / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Right Column - Editing Interface */}
          <div className="space-y-6 xl:col-span-2">
            {/* Prompt Input */}
            <Card variant="corporate" header={
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                <span className="font-semibold">Arka Plan Tanımı</span>
              </div>
            }>
              <div className="space-y-4">
                <TextArea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Örnek: modern ofis ortamı, deniz kenarı gün batımı, minimal stüdyo beyaz..."
                  rows={4}
                  maxLength={200}
                  disabled={isProcessing}
                  className="corporate-input resize-none"
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-slate-400">
                      {prompt.length}/200 karakter
                    </span>
                    {prompt.length > 180 && (
                      <AlertCircle className="w-4 h-4 text-warning-500" />
                    )}
                  </div>
                </div>

                {/* Quick Suggestions */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                    Hızlı Öneriler:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {promptSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setPrompt(suggestion)}
                        disabled={isProcessing}
                        className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-slate-700 
                                 text-gray-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 
                                 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Processing Status */}
                {isProcessing && (
                  <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon()}
                      <span className="font-medium text-primary-700 dark:text-primary-300">
                        {getStatusText()}
                      </span>
                    </div>
                    <div className="w-full bg-primary-200 dark:bg-primary-800 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${processingProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-primary-600 dark:text-primary-400 mt-2">
                      Lütfen bekleyin, bu işlem birkaç saniye sürebilir...
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  onClick={handleEdit}
                  disabled={!selectedFile || !prompt.trim() || isProcessing}
                  size="lg"
                  variant="corporate"
                  className="w-full group"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                      İşleniyor...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                      Arka Planı Değiştir
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Result Display */}
            {editedUrl && processingStatus === 'done' && (
              <Card variant="elevated" header={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success-600" />
                    <span className="font-semibold">Düzenlenmiş Görsel</span>
                  </div>
                  <div className="bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-300 text-xs px-2 py-1 rounded-full">
                    Başarılı
                  </div>
                </div>
              }>
                <div className="space-y-4">
                  <div className="relative group overflow-hidden rounded-2xl border-2 border-success-200 dark:border-success-800">
                    <img 
                      src={editedUrl} 
                      alt="Düzenlenmiş" 
                      className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={() => downloadFile(editedUrl, filenameFromKey(editedKey))}
                      variant="success"
                      size="lg"
                      className="flex-1 group"
                    >
                      <Download className="w-5 h-5 mr-2 group-hover:translate-y-1 transition-transform" />
                      İndir
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setEditedUrl('');
                        setEditedKey('');
                        setProcessingStatus('idle');
                      }}
                      variant="outline"
                      size="lg"
                      className="group"
                    >
                      Yeni Düzenleme
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <AuthGuard>
      <EditorPageInner />
    </AuthGuard>
  );
}
