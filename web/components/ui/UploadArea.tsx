import React from 'react';
import { Upload, Image as ImageIcon, Sparkles, Shield, Zap, Brain } from 'lucide-react';

interface UploadAreaProps {
  onUpload: (file: File) => void;
  loading?: boolean;
  className?: string;
}

export function UploadArea({ onUpload, loading = false, className = '' }: UploadAreaProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      onUpload(imageFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div
      className={`upload-area ${isDragOver ? 'drag-over' : ''} ${loading ? 'loading-pulse' : ''} ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-center p-8">
        <div className="mx-auto mb-4 w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
          <Upload className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
          Görselinizi Yükleyin
        </h3>
        <p className="text-gray-600 dark:text-slate-400 mb-6">
          Sürükleyip bırakın veya dosya seçin
        </p>
        <div className="space-y-2 text-sm text-gray-500 dark:text-slate-500">
          <p>• PNG, JPG formatları</p>
          <p>• Maksimum 10MB</p>
          <p>• Maksimum 4096px çözünürlük</p>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={loading}
        />
        <label
          htmlFor="file-upload"
          className="mt-6 inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl cursor-pointer hover:bg-primary-700 transition-colors corporate-button"
        >
          {loading ? 'Yükleniyor...' : 'Dosya Seç'}
        </label>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, className = '' }: FeatureCardProps) {
  return (
    <div className={`group p-6 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:shadow-corporal-lg transition-all duration-300 hover:-translate-y-1 ${className}`}>
      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

export function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <FeatureCard
        icon={<Brain className="w-6 h-6 text-primary-600" />}
        title="Yapay Zeka Gücü"
        description="Google Gemini 2.5 Flash ile profesyonel kalitede arka plan değiştirme"
      />
      <FeatureCard
        icon={<Zap className="w-6 h-6 text-primary-600" />}
        title="Hızlı Sonuç"
        description="Saniyeler içinde öncesi/sonrası karşılaştırma ile anında sonuçlar"
      />
      <FeatureCard
        icon={<Shield className="w-6 h-6 text-primary-600" />}
        title="Güvenli Depolama"
        description="Verileriniz şifrelenir ve sadece sizin erişiminiz için saklanır"
      />
      <FeatureCard
        icon={<Sparkles className="w-6 h-6 text-primary-600" />}
        title="Kurumsal Kalite"
        description="Marka standartlarınıza uygun yüksek kaliteli çıktılar"
      />
    </div>
  );
}