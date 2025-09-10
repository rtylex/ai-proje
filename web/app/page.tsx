'use client';

import { useEffect, useState } from 'react';
import { Image as ImageIcon, ArrowRight, Sparkles, TrendingUp, Users, Award } from 'lucide-react';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FeatureGrid } from '../components/ui/UploadArea';

export default function Landing() {
  const [recentNames, setRecentNames] = useState<string[]>([]);
  const [recentUrls, setRecentUrls] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const filenameFromKey = (key: string) => {
      if (!key) return 'edited-image.jpg';
      const parts = key.split('/');
      const last = parts[parts.length - 1] || 'image.jpg';
      return last.startsWith('original') ? `edited-${last}` : last;
    };
    const load = async () => {
      const imagesResult = await api.getImages(undefined, 12);
      if (imagesResult.error || !imagesResult.data) return;
      const items = imagesResult.data.items || [];
      const urls: string[] = [];
      const names: string[] = [];
      for (const it of items) {
        const vers = await api.getVersions(it.imageId, undefined, 1);
        if (vers.error || !vers.data) continue;
        const v = vers.data.items?.[0];
        if (!v?.editedUrl) continue;
        const view = await api.getViewUrl(v.editedUrl);
        if (view.data?.url) {
          urls.push(view.data.url);
          names.push(filenameFromKey(v.editedUrl));
        }
      }
      if (!cancelled) {
        setRecentUrls(urls);
        setRecentNames(names);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    { icon: <Users className="w-6 h-6" />, label: "Mutlu Kullanıcı", value: "1000+" },
    { icon: <TrendingUp className="w-6 h-6" />, label: "İşlenmiş Görsel", value: "5000+" },
    { icon: <Award className="w-6 h-6" />, label: "Başarı Oranı", value: "%98" },
    { icon: <Sparkles className="w-6 h-6" />, label: "İşlem Hızı", value: "< 5sn" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-32 sm:pb-24">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 dark:bg-primary-900/20 rounded-full blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-200 dark:bg-secondary-900/20 rounded-full blur-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-primary-700 bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300 border border-primary-200 dark:border-primary-800 mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Yeni Nesil AI Görsel Düzenleme Platformu
            </div>
            
            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-slate-100 mb-6 leading-tight">
              Görsellerinizi
              <span className="corporate-gradient-text block sm:inline"> Kurumsal Kalitede</span>
              <br />
              Dönüştürün
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl text-gray-600 dark:text-slate-400 max-w-3xl mx-auto mb-10 text-pretty">
              Google Gemini 2.5 Flash teknolojisi ile saniyeler içinde profesyonel arka plan değiştirme. 
              Markanızın kalitesini yansıtan sonuçlar elde edin.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                variant="corporate"
                className="group"
                href="/editor"
              >
                Hemen Başla
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                href="#features"
              >
                Özellikleri Keşfet
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <Card key={index} variant="glass" className="text-center p-4">
                  <div className="text-primary-600 dark:text-primary-400 mb-2 flex justify-center">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-slate-400">
                    {stat.label}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4">
              Neden Visual Editor?
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">
              Profesyonel özellikler ve kullanıcı dostu arayüz ile görsel düzenleme deneyimini bir üst seviyeye taşıyın.
            </p>
          </div>
          
          <FeatureGrid />
        </div>
      </section>

      {/* Recent Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4">
              Son Çalışmalarımız
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-400">
              Kullanıcılarımızın oluşturduğu bazı örnekler
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentUrls.length === 0 ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="aspect-square bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              ))
            ) : (
              recentUrls.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  download
                  className="group block animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="aspect-square overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-slate-700 group-hover:border-primary-400 transition-all duration-300 group-hover:shadow-corporal-lg">
                    <img
                      src={url}
                      alt={recentNames[index] || 'Edited image'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  {recentNames[index] && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-slate-400 truncate text-center">
                      {recentNames[index]}
                    </div>
                  )}
                </a>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Hemen Profesyonel Sonuçlar Elde Edin
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Binlerce kullanıcı görsellerini saniyeler içinde dönüştürüyor. Siz de hemen başlayın!
          </p>
          <Button 
            size="xl" 
            variant="ghost"
            className="bg-white text-primary-600 hover:bg-primary-50"
            href="/editor"
          >
            Ücretsiz Deneyin
          </Button>
        </div>
      </section>
    </div>
  );
}

