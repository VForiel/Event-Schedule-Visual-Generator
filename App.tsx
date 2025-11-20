
import React, { useState, useRef } from 'react';
import { Poster } from './components/Poster';
import { PosterData, ProgramItem, PosterTheme, PosterStyleSettings, PosterLayoutSettings } from './types';
import { generateSpaceBackground } from './services/gemini';
import { Loader2, Sparkles, FileDown, Plus, Trash2, Upload, Image as ImageIcon, X, Palette, Sliders, Download, FileJson, QrCode, Layout, GripVertical, Text, Type } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

// Default data
const DEFAULT_ITEMS: ProgramItem[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `default-${i}`,
  time: `${9 + i}:00`,
  title: `Session Scientifique ${i + 1}: Avancées Récentes`,
  speaker: `Dr. Chercheur ${String.fromCharCode(65 + i)}`,
  description: "Présentation des résultats préliminaires sur l'observation des nébuleuses."
}));

const DEFAULT_DATA: PosterData = {
  title: "JOURNÉE SCIENTIFIQUE",
  subtitle: "Laboratoire Lagrange",
  date: "14 Octobre 2025",
  location: "Grand Amphithéâtre, Nice",
  eventDescription: "Une journée dédiée à la présentation des travaux de recherche des doctorants et chercheurs du laboratoire, favorisant les échanges interdisciplinaires en astrophysique.",
  backgroundUrl: "https://picsum.photos/seed/lagrange/1200/1600", 
  items: DEFAULT_ITEMS,
  programTitle: "PROGRAMME",
  logos: [],
  theme: 'modern',
  styleSettings: {
    backgroundBlur: 0,
    backgroundDarkness: 0.2,
    contentOpacity: 0.5
  },
  layoutSettings: {
    titleSize: 3,
    subtitleSize: 0.875,
    metaSize: 0.9,
    descriptionSize: 0.9,
    programSize: 100,
    contactSize: 0.7,
    logoHeight: 40,
    qrCodeSize: 80,
    contentMargin: 8
  },
  contactTitle: "Contact & Organisation",
  contactDetails: "Laboratoire Lagrange - Observatoire de la Côte d'Azur\nBoulevard de l'Observatoire, CS 34229, 06304 Nice Cedex 4",
  qrCodeUrl: null
};

const App: React.FC = () => {
  const [data, setData] = useState<PosterData>(DEFAULT_DATA);
  const [isGenerating, setIsGenerating] = useState(false);
  const [zoom, setZoom] = useState(0.6);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Drag and Drop State
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [draggedLogoIndex, setDraggedLogoIndex] = useState<number | null>(null);

  const handleGenerateBackground = async () => {
    setIsGenerating(true);
    try {
      const url = await generateSpaceBackground();
      setData(prev => ({ ...prev, backgroundUrl: url }));
    } catch (e) {
      alert("Erreur lors de la génération de l'image. Vérifiez la clé API.");
    } finally {
      setIsGenerating(false);
    }
  };

  const updateField = (field: keyof PosterData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateStyleSetting = (field: keyof PosterStyleSettings, value: number) => {
    setData(prev => ({
      ...prev,
      styleSettings: {
        ...prev.styleSettings,
        [field]: value
      }
    }));
  };

  const updateLayoutSetting = (field: keyof PosterLayoutSettings, value: number) => {
    setData(prev => ({
      ...prev,
      layoutSettings: {
        ...(prev.layoutSettings || DEFAULT_DATA.layoutSettings),
        [field]: value
      }
    }));
  };

  const addProgramItem = () => {
    const newItem: ProgramItem = {
      id: Date.now().toString(),
      time: "12:00",
      title: "Nouvelle Présentation",
      speaker: "Nom de l'intervenant",
      description: "Description courte de la présentation."
    };
    setData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeProgramItem = (id: string) => {
    setData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  const updateProgramItem = (id: string, field: keyof ProgramItem, value: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  // Drag and Drop Logic for Program Items
  const handleItemDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const newItems = [...data.items];
    const draggedItem = newItems[draggedItemIndex];
    newItems.splice(draggedItemIndex, 1);
    newItems.splice(index, 0, draggedItem);

    setData(prev => ({ ...prev, items: newItems }));
    setDraggedItemIndex(index);
  };

  // Drag and Drop Logic for Logos
  const handleLogoDragStart = (index: number) => {
    setDraggedLogoIndex(index);
  };

  const handleLogoDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedLogoIndex === null || draggedLogoIndex === index) return;

    const newLogos = [...data.logos];
    const draggedLogo = newLogos[draggedLogoIndex];
    newLogos.splice(draggedLogoIndex, 1);
    newLogos.splice(index, 0, draggedLogo);

    setData(prev => ({ ...prev, logos: newLogos }));
    setDraggedLogoIndex(index);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'background' | 'logo' | 'qr') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (type === 'background') {
        setData(prev => ({ ...prev, backgroundUrl: result }));
      } else if (type === 'qr') {
        setData(prev => ({ ...prev, qrCodeUrl: result }));
      } else {
        setData(prev => ({ ...prev, logos: [...prev.logos, result] }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDownloadBackground = () => {
    const link = document.createElement('a');
    link.href = data.backgroundUrl;
    link.download = `lagrange-background-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const removeLogo = (index: number) => {
    setData(prev => ({
      ...prev,
      logos: prev.logos.filter((_, i) => i !== index)
    }));
  };

  const handleExportPDF = async () => {
    const node = document.getElementById('poster-wrapper');
    if (!node) return;

    setIsExportingPDF(true);
    try {
      const dataUrl = await toPng(node, {
        quality: 1.0,
        pixelRatio: 2,
        cacheBust: true,
        width: 794,
        height: 1123,
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('lagrange-programme.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Erreur lors de l\'exportation PDF.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportImage = async () => {
    const node = document.getElementById('poster-wrapper');
    if (!node) return;
    setIsExportingImage(true);
    try {
      const dataUrl = await toPng(node, {
        quality: 1.0,
        pixelRatio: 3,
        cacheBust: true,
        width: 794,
        height: 1123,
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });
      const link = document.createElement('a');
      link.download = 'lagrange-poster.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Erreur lors de l\'exportation de l\'image.');
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleExportJSON = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(data))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "lagrange-poster-config.json";
    link.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const mergedData: PosterData = {
           ...DEFAULT_DATA,
           ...json,
           styleSettings: { ...DEFAULT_DATA.styleSettings, ...(json.styleSettings || {}) },
           layoutSettings: { ...DEFAULT_DATA.layoutSettings, ...(json.layoutSettings || {}) },
           items: Array.isArray(json.items) ? json.items : DEFAULT_DATA.items,
           logos: Array.isArray(json.logos) ? json.logos : DEFAULT_DATA.logos
        };
        setData(mergedData);
      } catch (error) {
        console.error("Error parsing JSON", error);
        alert("Erreur lors de la lecture du fichier.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const themes: { id: PosterTheme; label: string; color: string }[] = [
    { id: 'modern', label: 'Moderne', color: 'bg-cyan-600' },
    { id: 'classic', label: 'Classique', color: 'bg-amber-600' },
    { id: 'minimal', label: 'Minimaliste', color: 'bg-gray-600' },
  ];

  // Helper component for Size Sliders
  const SizeSlider = ({ label, value, onChange, min, max, step = 0.1 }: { label: string, value: number, onChange: (v: number) => void, min: number, max: number, step?: number }) => (
    <div className="flex items-center gap-2 mt-1 bg-slate-900/30 p-1.5 rounded border border-slate-700/50">
      <Type size={12} className="text-slate-500" />
      <span className="text-[10px] text-slate-400 w-16 truncate">{label}</span>
      <input 
        type="range" 
        min={min} max={max} step={step} 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-grow h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer" 
      />
    </div>
  );

  return (
    <div id="app-container" className="flex h-screen w-screen bg-slate-900 overflow-hidden text-slate-100 font-inter">
      
      {/* Sidebar */}
      <aside id="control-panel" className="w-[400px] flex-shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col h-full z-20 shadow-xl">
        <div className="p-6 border-b border-slate-700 bg-slate-900/50">
          <h1 className="text-xl font-orbitron font-bold text-cyan-400 mb-1">Lagrange Gen</h1>
          <p className="text-xs text-slate-400">Générateur de Visuel Scientifique</p>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Style/Theme Section */}
          <section className="space-y-4">
             <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
               <Palette size={16} /> Style du Visuel
             </h3>
             <div className="grid grid-cols-3 gap-2">
               {themes.map((theme) => (
                 <button
                   key={theme.id}
                   onClick={() => updateField('theme', theme.id)}
                   className={`py-2 px-1 rounded text-xs font-medium transition-all border-2 ${
                     data.theme === theme.id 
                       ? 'border-white bg-slate-700 text-white' 
                       : 'border-transparent bg-slate-900 text-slate-400 hover:bg-slate-800'
                   }`}
                 >
                   <div className={`w-3 h-3 rounded-full ${theme.color} mx-auto mb-1`}></div>
                   {theme.label}
                 </button>
               ))}
             </div>
          </section>

          {/* Global Info Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              Informations Générales
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Titre Principal</label>
                <input type="text" value={data.title} onChange={(e) => updateField('title', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none transition-colors" />
                <SizeSlider label="Taille Titre" value={data.layoutSettings?.titleSize || 3} min={1.5} max={5} onChange={(v) => updateLayoutSetting('titleSize', v)} />
              </div>
              
              <div>
                <label className="block text-xs text-slate-400 mb-1">Sous-titre</label>
                <input type="text" value={data.subtitle} onChange={(e) => updateField('subtitle', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none" />
                <SizeSlider label="Taille Sous-titre" value={data.layoutSettings?.subtitleSize || 1} min={0.5} max={2} onChange={(v) => updateLayoutSetting('subtitleSize', v)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <div className="flex gap-3 mb-1">
                    <div className="flex-1">
                       <label className="block text-xs text-slate-400 mb-1">Date</label>
                       <input type="text" value={data.date} onChange={(e) => updateField('date', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm" />
                    </div>
                    <div className="flex-1">
                       <label className="block text-xs text-slate-400 mb-1">Lieu</label>
                       <input type="text" value={data.location} onChange={(e) => updateField('location', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <SizeSlider label="Taille Infos" value={data.layoutSettings?.metaSize || 0.9} min={0.5} max={1.5} onChange={(v) => updateLayoutSetting('metaSize', v)} />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Description</label>
                <textarea value={data.eventDescription} onChange={(e) => updateField('eventDescription', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none resize-none h-20" />
                <SizeSlider label="Taille Desc." value={data.layoutSettings?.descriptionSize || 0.9} min={0.5} max={1.5} onChange={(v) => updateLayoutSetting('descriptionSize', v)} />
              </div>
            </div>
          </section>

           {/* Background */}
           <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              Fond & Apparence
            </h3>
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-3">
              <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium text-white border border-slate-600 flex items-center justify-center gap-2">
                    <Upload size={16} /> Importer <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'background')} />
                  </label>
                  <button onClick={handleDownloadBackground} className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium text-white border border-slate-600 flex items-center justify-center gap-2">
                    <Download size={16} /> Sauvegarder
                  </button>
              </div>
            </div>
            
            {/* Global Margin Slider moved here */}
            <div className="space-y-1">
                 <div className="flex justify-between text-[10px] text-slate-400"><span>Marge Globale</span><span>{data.layoutSettings?.contentMargin || 8}</span></div>
                 <input type="range" min="0" max="16" step="1" value={data.layoutSettings?.contentMargin || 8} onChange={(e) => updateLayoutSetting('contentMargin', parseInt(e.target.value))} className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-4">
               <div className="flex items-center gap-2 text-xs text-slate-300 mb-1"><Sliders size={12} /> Réglages Fins</div>
               <div className="space-y-1">
                 <div className="flex justify-between text-[10px] text-slate-400"><span>Opacité</span><span>{Math.round(data.styleSettings?.contentOpacity * 100)}%</span></div>
                 <input type="range" min="0" max="1" step="0.05" value={data.styleSettings?.contentOpacity} onChange={(e) => updateStyleSetting('contentOpacity', parseFloat(e.target.value))} className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer" />
               </div>
               <div className="space-y-1">
                 <div className="flex justify-between text-[10px] text-slate-400"><span>Flou</span><span>{data.styleSettings?.backgroundBlur}px</span></div>
                 <input type="range" min="0" max="20" step="1" value={data.styleSettings?.backgroundBlur} onChange={(e) => updateStyleSetting('backgroundBlur', parseInt(e.target.value))} className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer" />
               </div>
               <div className="space-y-1">
                 <div className="flex justify-between text-[10px] text-slate-400"><span>Assombrissement</span><span>{Math.round(data.styleSettings?.backgroundDarkness * 100)}%</span></div>
                 <input type="range" min="0" max="0.9" step="0.05" value={data.styleSettings?.backgroundDarkness} onChange={(e) => updateStyleSetting('backgroundDarkness', parseFloat(e.target.value))} className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer" />
               </div>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <button onClick={handleGenerateBackground} disabled={isGenerating} className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded text-sm font-bold text-white shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} Générer Nouveau Fond
              </button>
            </div>
          </section>

          {/* Logos (Drag & Drop) */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            Logos (Drag & Drop)
            </h3>
            
            <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-3">
               <div className="grid grid-cols-3 gap-2 mb-3">
                  {data.logos.map((logo, idx) => (
                    <div 
                      key={idx} 
                      draggable
                      onDragStart={() => handleLogoDragStart(idx)}
                      onDragOver={(e) => handleLogoDragOver(e, idx)}
                      className={`relative group aspect-square bg-white/10 rounded flex items-center justify-center overflow-hidden border cursor-move ${draggedLogoIndex === idx ? 'border-cyan-500 opacity-50' : 'border-white/10'}`}
                    >
                      <img src={logo} alt="logo" className="w-full h-full object-contain p-1 pointer-events-none" />
                      <button onClick={() => removeLogo(idx)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"><X size={12} /></button>
                    </div>
                  ))}
                  <label className="cursor-pointer aspect-square bg-slate-800 border border-dashed border-slate-600 hover:border-cyan-500 hover:text-cyan-500 rounded flex flex-col items-center justify-center text-slate-500 transition-colors">
                    <Plus size={20} /><span className="text-[10px] mt-1">Ajouter</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'logo')} />
                  </label>
               </div>
               <div className="space-y-2 pt-2 border-t border-slate-700/30">
                 <SizeSlider label="Taille Logos" value={data.layoutSettings?.logoHeight || 40} min={20} max={150} step={5} onChange={(v) => updateLayoutSetting('logoHeight', v)} />
                 <p className="text-[10px] text-slate-500 text-center">Glissez-déposez pour réorganiser.</p>
               </div>
            </div>
          </section>

          {/* Program Section (Drag & Drop) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Programme ({data.items.length})</h3>
              <button onClick={addProgramItem} className="text-cyan-400 hover:text-cyan-300 p-1"><Plus size={16} /></button>
            </div>
            <div className="mb-2">
              <label className="block text-xs text-slate-400 mb-1">Titre Section</label>
              <input type="text" value={data.programTitle} onChange={(e) => updateField('programTitle', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm font-bold uppercase" />
              <SizeSlider label="Taille Texte Prog." value={data.layoutSettings?.programSize || 100} min={50} max={150} step={5} onChange={(v) => updateLayoutSetting('programSize', v)} />
            </div>
            <div className="space-y-3">
              {data.items.map((item, index) => (
                <div 
                  key={item.id} 
                  draggable
                  onDragStart={() => handleItemDragStart(index)}
                  onDragOver={(e) => handleItemDragOver(e, index)}
                  className={`bg-slate-700/30 p-3 rounded border flex gap-2 group transition-all cursor-move ${draggedItemIndex === index ? 'border-cyan-500 opacity-50' : 'border-slate-700/50'}`}
                >
                  <div className="flex flex-col items-center pt-1 text-slate-500">
                    <GripVertical size={16} />
                    <span className="text-[10px] font-mono mt-1">#{index + 1}</span>
                  </div>
                  <div className="flex-grow space-y-2">
                    <div className="flex justify-between items-start">
                        <div className="grid grid-cols-4 gap-2 w-full pr-2">
                            <input value={item.time} onChange={(e) => updateProgramItem(item.id, 'time', e.target.value)} className="col-span-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs" />
                            <input value={item.title} onChange={(e) => updateProgramItem(item.id, 'title', e.target.value)} className="col-span-3 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs font-bold" />
                        </div>
                        <button onClick={() => removeProgramItem(item.id)} className="text-slate-600 hover:text-red-400"><Trash2 size={12} /></button>
                    </div>
                    <input value={item.speaker} onChange={(e) => updateProgramItem(item.id, 'speaker', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs" placeholder="Intervenant" />
                    <textarea value={item.description} onChange={(e) => updateProgramItem(item.id, 'description', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs h-12 resize-none" placeholder="Description..." />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer & Contact */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              Pied de page
            </h3>
            <div className="space-y-3">
               <div>
                <label className="block text-xs text-slate-400 mb-1">Titre Contact</label>
                <input type="text" value={data.contactTitle} onChange={(e) => updateField('contactTitle', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Détails Contact</label>
                <textarea value={data.contactDetails} onChange={(e) => updateField('contactDetails', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none resize-none h-20" />
                <SizeSlider label="Taille Contact" value={data.layoutSettings?.contactSize || 0.7} min={0.4} max={1.2} onChange={(v) => updateLayoutSetting('contactSize', v)} />
              </div>

              <div className="p-3 bg-slate-900/50 rounded border border-slate-700">
                 <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-2">
                        {data.qrCodeUrl ? <img src={data.qrCodeUrl} className="w-10 h-10 object-contain bg-white rounded p-0.5" alt="QR" /> : <div className="w-10 h-10 bg-slate-700 rounded flex items-center justify-center"><QrCode size={20} className="text-slate-400" /></div>}
                        <div className="flex flex-col">
                            <span className="text-xs font-bold">QR Code</span>
                            <span className="text-[10px] text-slate-500">{data.qrCodeUrl ? 'Image chargée' : 'Aucune image'}</span>
                        </div>
                     </div>
                     <div className="flex gap-1">
                        {data.qrCodeUrl && <button onClick={() => updateField('qrCodeUrl', null)} className="p-2 bg-red-900/50 text-red-400 rounded hover:bg-red-900"><Trash2 size={14} /></button>}
                        <label className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded cursor-pointer"><Upload size={14} /><input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'qr')} /></label>
                     </div>
                 </div>
                 <SizeSlider label="Taille QR" value={data.layoutSettings?.qrCodeSize || 80} min={40} max={150} step={5} onChange={(v) => updateLayoutSetting('qrCodeSize', v)} />
              </div>
            </div>
          </section>

        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-900/50 flex flex-col gap-2">
          <div className="flex gap-2 mb-1">
             <button onClick={handleExportJSON} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded text-xs flex items-center justify-center gap-2"><FileJson size={14} /> Sauver</button>
             <label className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded text-xs flex items-center justify-center gap-2 cursor-pointer"><Upload size={14} /> Charger<input type="file" accept=".json" className="hidden" onChange={handleImportJSON} /></label>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportImage} disabled={isExportingImage || isExportingPDF} className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold text-xs flex items-center justify-center gap-2">{isExportingImage ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />} PNG</button>
            <button onClick={handleExportPDF} disabled={isExportingImage || isExportingPDF} className="flex-1 py-3 bg-slate-100 hover:bg-white text-slate-900 rounded font-bold text-xs flex items-center justify-center gap-2">{isExportingPDF ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />} PDF</button>
          </div>
        </div>
      </aside>

      <main className="flex-grow relative flex flex-col h-full bg-black/20 overflow-hidden">
        <div id="zoom-controls" className="absolute top-4 right-4 z-30 flex bg-slate-800 rounded-lg shadow border border-slate-700">
          <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="p-2 hover:bg-slate-700 border-r border-slate-700 text-slate-300">-</button>
          <div className="px-3 py-2 text-xs font-mono text-slate-300 flex items-center min-w-[60px] justify-center">{Math.round(zoom * 100)}%</div>
          <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="p-2 hover:bg-slate-700 text-slate-300">+</button>
        </div>
        <div className="flex-grow overflow-auto flex items-start justify-center pt-10 pb-20 custom-scrollbar">
           <Poster data={data} scale={zoom} />
        </div>
      </main>
    </div>
  );
};

export default App;
