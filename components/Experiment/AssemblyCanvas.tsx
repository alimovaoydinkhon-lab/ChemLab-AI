import React, { useState, useRef, useEffect } from 'react';
import { CanvasItem, ExperimentData, Language } from '../../types';
import { analyzeAssembly } from '../../services/geminiService';
import { CheckCircle, AlertTriangle, RotateCcw, HelpCircle } from 'lucide-react';
import { translations } from '../../utils/translations';

interface AssemblyCanvasProps {
  experiment: ExperimentData;
  language: Language;
}

const AssemblyCanvas: React.FC<AssemblyCanvasProps> = ({ experiment, language }) => {
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  // Initialize items from experiment data
  useEffect(() => {
    if (experiment.initialAssembly && experiment.initialAssembly.length > 0 && canvasRef.current) {
        const { width, height } = canvasRef.current.getBoundingClientRect();
        
        const initialItems: CanvasItem[] = experiment.initialAssembly.map((item, index) => ({
            id: `init-${index}-${Date.now()}`,
            name: item.name,
            x: (item.x / 100) * width,
            y: (item.y / 100) * height
        }));
        
        setItems(initialItems);
    } else {
        // Fallback or empty if not provided, but ensuring we don't overwrite if items exist (e.g. re-render)
        // However, for this component lifecycle, we usually want to reset when experiment changes.
        // We can check if items is empty to initialize.
        if (items.length === 0 && experiment.initialAssembly) {
            // Need to wait for ref to be available, usually useEffect runs after mount so ref should be there.
            // If ref is null, we can't calculate pixels.
            // Using a default fallback width/height if ref missing (unlikely in effect)
            const width = canvasRef.current?.offsetWidth || 800;
            const height = canvasRef.current?.offsetHeight || 600;
            
             const initialItems: CanvasItem[] = experiment.initialAssembly.map((item, index) => ({
                id: `init-${index}-${Date.now()}`,
                name: item.name,
                x: (item.x / 100) * width,
                y: (item.y / 100) * height
            }));
            setItems(initialItems);
        }
    }
  }, [experiment.initialAssembly, experiment.title]); // Re-run when experiment changes

  // Generate available parts from experiment data (simplified mapping)
  const availableParts = experiment.equipment.map((eq, idx) => ({
    id: `proto-${idx}`,
    name: eq,
  }));

  const handleDragStart = (e: React.DragEvent, name: string) => {
    e.dataTransfer.setData('itemName', name);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const itemName = e.dataTransfer.getData('itemName');
    if (!itemName || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newItem: CanvasItem = {
      id: `${itemName}-${Date.now()}`,
      name: itemName,
      x,
      y,
    };

    setItems((prev) => [...prev, newItem]);
    setFeedback(null); // Clear old feedback on new action
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Internal drag for already placed items
  const handleItemDragStart = (e: React.MouseEvent, id: string) => {
    setDraggedItem(id);
    e.stopPropagation();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedItem && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setItems((prev) =>
        prev.map((item) => (item.id === draggedItem ? { ...item, x, y } : item))
      );
    }
  };

  const handleMouseUp = () => {
    setDraggedItem(null);
  };

  const checkAssembly = async () => {
    if (!canvasRef.current) return;
    setIsAnalyzing(true);
    const { width, height } = canvasRef.current.getBoundingClientRect();
    
    try {
      const result = await analyzeAssembly(experiment.title, items, width, height, language);
      setFeedback({ isCorrect: result.isCorrect, text: result.feedback });
    } catch (e) {
      setFeedback({ isCorrect: false, text: "Could not analyze assembly. Please try again." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetCanvas = () => {
    // Re-initialize with default assembly
     if (experiment.initialAssembly && canvasRef.current) {
        const { width, height } = canvasRef.current.getBoundingClientRect();
        const initialItems: CanvasItem[] = experiment.initialAssembly.map((item, index) => ({
            id: `reset-${index}-${Date.now()}`,
            name: item.name,
            x: (item.x / 100) * width,
            y: (item.y / 100) * height
        }));
        setItems(initialItems);
    } else {
        setItems([]);
    }
    setFeedback(null);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-serif font-bold text-slate-700">{t.virtualBench}</h3>
        <div className="flex gap-2">
          <button 
            onClick={resetCanvas}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> {t.reset}
          </button>
          <button
            onClick={checkAssembly}
            disabled={isAnalyzing || items.length === 0}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white transition-all shadow-sm
              ${isAnalyzing ? 'bg-slate-400' : 'bg-academic-500 hover:bg-academic-700'}
            `}
          >
            {isAnalyzing ? t.analyzing : t.checkAssembly}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Parts Palette */}
        <div className="w-48 bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">{t.equipment}</h4>
          <div className="space-y-3">
            {availableParts.map((part) => (
              <div
                key={part.id}
                draggable
                onDragStart={(e) => handleDragStart(e, part.name)}
                className="p-3 bg-white border border-slate-200 rounded-md cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all flex items-center justify-between"
              >
                <span className="text-sm font-medium text-slate-700 truncate">{part.name}</span>
                <div className="w-2 h-2 rounded-full bg-academic-500"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas Area */}
        <div 
          className="flex-1 relative bg-white"
          ref={canvasRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              onMouseDown={(e) => handleItemDragStart(e, item.id)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing group"
              style={{ left: item.x, top: item.y }}
            >
              <div className="relative">
                {/* Simple visual representation */}
                <div className="w-16 h-16 border-2 border-academic-500 bg-academic-50/80 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg group-hover:border-academic-700 group-hover:bg-academic-100 transition-colors">
                   <span className="text-[10px] font-bold text-center text-academic-900 leading-tight px-1 select-none">{item.name}</span>
                </div>
                {/* Connector dots */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-slate-400 rounded-full"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-slate-400 rounded-full"></div>
              </div>
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-slate-400 italic px-6 text-center">{t.dragEquipment}</p>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Panel */}
      {feedback && (
        <div className={`p-4 border-t ${feedback.isCorrect ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex gap-3">
            {feedback.isCorrect ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            )}
            <div>
              <h4 className={`font-bold ${feedback.isCorrect ? 'text-green-800' : 'text-amber-800'}`}>
                {feedback.isCorrect ? t.assemblyCorrect : t.assemblyIssues}
              </h4>
              <p className={`text-sm mt-1 ${feedback.isCorrect ? 'text-green-700' : 'text-amber-700'}`}>
                {feedback.text}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssemblyCanvas;