import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Image as ImageIcon, Download } from 'lucide-react';
import { editLabImage } from '../services/geminiService';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface ImageLabProps {
  language: Language;
}

const ImageLab: React.FC<ImageLabProps> = ({ language }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const t = translations[language];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Strip prefix for API if needed, but the service handles the full data URI
        const pureBase64 = base64String.split(',')[1];
        setSelectedImage(pureBase64);
        setGeneratedImage(null); // Reset previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!selectedImage || !prompt) return;

    setIsLoading(true);
    try {
      const result = await editLabImage(selectedImage, prompt);
      if (result) {
        setGeneratedImage(result);
      }
    } catch (e) {
      console.error("Editing failed", e);
      alert("Failed to edit image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-slate-800 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-academic-500" />
            {t.imageLabTitle}
          </h2>
          <p className="text-slate-600 mt-2">
            {t.imageLabDesc}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors min-h-[300px] relative overflow-hidden"
            >
               <input 
                 type="file" 
                 accept="image/*" 
                 className="hidden" 
                 ref={fileInputRef} 
                 onChange={handleFileChange}
               />
               
               {selectedImage ? (
                 <img 
                   src={`data:image/png;base64,${selectedImage}`} 
                   alt="Original" 
                   className="absolute inset-0 w-full h-full object-contain p-4"
                 />
               ) : (
                 <>
                   <div className="w-16 h-16 bg-academic-100 rounded-full flex items-center justify-center mb-4 text-academic-500">
                     <Upload className="w-8 h-8" />
                   </div>
                   <p className="font-medium text-slate-700">{t.clickUpload}</p>
                   <p className="text-sm text-slate-400 mt-1">{t.uploadSub}</p>
                 </>
               )}
            </div>

            <div className="space-y-4">
               <label className="block text-sm font-medium text-slate-700">{t.editingInstruction}</label>
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={prompt}
                   onChange={(e) => setPrompt(e.target.value)}
                   placeholder={t.promptPlaceholder}
                   className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-academic-500 focus:border-transparent outline-none"
                 />
                 <button 
                   onClick={handleEdit}
                   disabled={!selectedImage || !prompt || isLoading}
                   className="bg-academic-600 text-white px-6 py-2 rounded-lg hover:bg-academic-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                 >
                   {isLoading ? t.generating : t.process}
                 </button>
               </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full min-h-[400px]">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-slate-500" />
              {t.result}
            </h3>
            
            <div className="flex-1 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden relative">
              {generatedImage ? (
                <img 
                  src={generatedImage} 
                  alt="Generated" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <p>...</p>
                </div>
              )}
            </div>

            {generatedImage && (
              <div className="mt-4 flex justify-end">
                <a 
                  href={generatedImage} 
                  download="lab_edit.png" 
                  className="flex items-center gap-2 text-academic-600 hover:text-academic-800 font-medium text-sm"
                >
                  <Download className="w-4 h-4" /> {t.download}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageLab;