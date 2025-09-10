import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeToggle } from '../components/ThemeToggle';
import { UserMenu } from '../components/UserMenu';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Visual Editor - Profesyonel AI Görsel Düzenleme Platformu',
  description: 'Google Gemini 2.5 Flash ile kurumsal kalitede arka plan değiştirme. Saniyeler içinde profesyonel sonuçlar.',
  keywords: 'AI, görsel düzenleme, arka plan değiştirme, Gemini, yapay zeka, profesyonel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          {/* Kurumsal Navbar */}
          <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo ve Brand */}
                <div className="flex items-center space-x-8">
                  <a href="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-xl corporate-gradient flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Visual Editor</h1>
                      <p className="text-xs text-gray-500 dark:text-slate-400">AI Powered</p>
                    </div>
                  </a>
                  
                  {/* Navigation Links */}
                  <div className="hidden md:flex items-center space-x-6">
                    <a 
                      href="/editor" 
                      className="text-gray-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    >
                      Görsel Düzenleme
                    </a>
                    <a 
                      href="/chat" 
                      className="text-gray-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    >
                      Sohbet (Metin)
                    </a>
                  </div>
                </div>
                
                {/* User Controls */}
                <div className="flex items-center space-x-4">
                  <UserMenu />
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </nav>
          
          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl corporate-gradient flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Visual Editor</h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400">Profesyonel AI Çözümleri</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-slate-400 text-sm">
                    Google Gemini 2.5 Flash teknolojisi ile kurumsal kalitede görsel düzenleme deneyimi.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4">Ürünler</h4>
                  <ul className="space-y-2">
                    <li><a href="/editor" className="text-sm text-gray-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">Görsel Düzenleme</a></li>
                    <li><a href="/chat" className="text-sm text-gray-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">Metin Sohbeti</a></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4">Destek</h4>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-sm text-gray-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">Yardım Merkezi</a></li>
                    <li><a href="#" className="text-sm text-gray-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">İletişim</a></li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    © 2024 Visual Editor. Tüm hakları saklıdır.
                  </p>
                  <div className="flex items-center space-x-6 mt-4 sm:mt-0">
                    <a href="#" className="text-sm text-gray-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">Gizlilik Politikası</a>
                    <a href="#" className="text-sm text-gray-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">Kullanım Şartları</a>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
        
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const t = localStorage.getItem('theme'); if (t === 'dark') document.documentElement.classList.add('dark'); } catch (e) {} })();`,
          }}
        />
      </body>
    </html>
  );
}
