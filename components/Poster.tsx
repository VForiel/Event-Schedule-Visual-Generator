
import React from 'react';
import { PosterData, PosterTheme } from '../types';
import { ProgramList } from './ProgramList';

interface PosterProps {
  data: PosterData;
  scale?: number;
}

export const Poster: React.FC<PosterProps> = ({ data, scale = 1 }) => {
  
  // Theme Configuration
  const themeConfig = {
    modern: {
      fontHeading: 'font-orbitron',
      fontBody: 'font-inter',
      titleColor: 'text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-slate-300',
      subtitleColor: 'text-cyan-400',
      containerClasses: 'border border-white/10 backdrop-blur-sm', 
      containerBaseColor: '0, 0, 0', 
      accentColor: 'border-cyan-500',
      overlay: (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90 mix-blend-multiply pointer-events-none" />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] pointer-events-none" />
          <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
        </>
      )
    },
    classic: {
      fontHeading: 'font-serif-display',
      fontBody: 'font-inter',
      titleColor: 'text-amber-50',
      subtitleColor: 'text-amber-200/80',
      containerClasses: 'border-2 border-double border-amber-500/30', 
      containerBaseColor: '15, 23, 42', 
      accentColor: 'border-amber-500/50',
      overlay: (
        <>
          <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply pointer-events-none" />
          <div className="absolute inset-0 border-[20px] border-white/5 pointer-events-none" />
        </>
      )
    },
    minimal: {
      fontHeading: 'font-inter tracking-tight',
      fontBody: 'font-inter',
      titleColor: 'text-white',
      subtitleColor: 'text-gray-300',
      containerClasses: 'backdrop-blur-md border border-white/20',
      containerBaseColor: '255, 255, 255',
      accentColor: 'border-white',
      overlay: (
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      )
    }
  };

  const style = themeConfig[data.theme || 'modern'];
  const { backgroundBlur, backgroundDarkness, contentOpacity } = data.styleSettings || { backgroundBlur: 0, backgroundDarkness: 0.2, contentOpacity: 0.5 };
  
  // Default layout settings if missing (backward compatibility)
  const layout = data.layoutSettings || {
    headerScale: 1,
    programScale: 1,
    footerScale: 1,
    sectionGap: 4,
    contentMargin: 8,
    logoHeight: 48
  };

  const dynamicContainerStyle = {
    backgroundColor: `rgba(${style.containerBaseColor}, ${contentOpacity})`
  };

  return (
    <div 
      id="poster-wrapper"
      className="relative overflow-hidden shadow-2xl bg-slate-900 text-white"
      style={{
        width: '210mm', // A4 Width
        height: '297mm', // A4 Height
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
    >
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src={data.backgroundUrl} 
          alt="Background" 
          className="w-full h-full object-cover"
          style={{ filter: `blur(${backgroundBlur}px)` }}
        />
        <div 
          className="absolute inset-0 bg-black pointer-events-none transition-opacity" 
          style={{ opacity: backgroundDarkness }} 
        />
        {style.overlay}
      </div>

      {/* Main Flex Container */}
      <div 
        className={`relative z-10 flex flex-col h-full ${style.fontBody}`}
        style={{ 
          padding: `${layout.contentMargin * 4}px`,
          gap: `${layout.sectionGap * 4}px`
        }}
      >
        
        {/* Header Area */}
        <header 
          className="flex flex-col items-center origin-top mx-auto"
          style={{ 
            transform: `scale(${layout.headerScale})`,
            width: `${100 / layout.headerScale}%`
          }}
        >
          <div className="text-center space-y-2 mt-2 w-full">
            <h2 className={`${style.subtitleColor} tracking-[0.2em] text-sm ${style.fontHeading} uppercase font-bold`}>
              {data.subtitle}
            </h2>
            <h1 className={`text-5xl font-bold ${style.fontHeading} ${style.titleColor} drop-shadow-lg leading-tight px-4`}>
              {data.title}
            </h1>
            
            <div className="flex items-center justify-center gap-4 text-sm font-light mt-2">
              <span className={`px-3 py-1 rounded-full border ${data.theme === 'classic' ? 'bg-amber-900/40 border-amber-500/40 text-amber-100' : 'bg-cyan-500/20 border-cyan-500/30'}`}>
                📅 {data.date}
              </span>
              <span className={`px-3 py-1 rounded-full border ${data.theme === 'classic' ? 'bg-amber-900/40 border-amber-500/40 text-amber-100' : 'bg-purple-500/20 border-purple-500/30'}`}>
                📍 {data.location}
              </span>
            </div>

            {data.eventDescription && (
              <div className="max-w-2xl mx-auto mt-4 px-6">
                <p className={`text-center text-sm leading-relaxed ${data.theme === 'classic' ? 'text-amber-100/80 italic' : 'text-gray-300'}`}>
                  {data.eventDescription}
                </p>
              </div>
            )}
          </div>
        </header>

        {/* Main Content - Program */}
        <main 
          className={`flex-grow rounded-xl p-6 ${style.containerClasses} transition-all origin-top`}
          style={dynamicContainerStyle}
        >
            <div className="w-full h-full flex flex-col">
                <div 
                  className="flex items-center gap-4 mb-6 origin-left"
                  style={{ 
                    transform: `scale(${layout.programScale})`,
                    width: `${100 / layout.programScale}%`
                  }}
                >
                    <h3 className={`text-2xl ${style.fontHeading} font-semibold border-b-2 ${style.accentColor} pb-1 pr-4 uppercase whitespace-nowrap`}>
                        {data.programTitle || 'PROGRAMME'}
                    </h3>
                    <div className="h-[1px] bg-white/20 flex-grow"></div>
                </div>
                <div className="flex-grow">
                    <ProgramList 
                      items={data.items} 
                      scale={layout.programScale}
                    />
                </div>
            </div>
        </main>

        {/* Footer Area */}
        <footer 
          className="flex flex-col gap-4 origin-bottom mx-auto"
          style={{ 
            transform: `scale(${layout.footerScale})`,
            width: `${100 / layout.footerScale}%`
          }}
        >
            {/* Logos Section */}
            {data.logos.length > 0 && (
              <div 
                className={`w-full flex items-center justify-center flex-wrap gap-6 p-4 rounded-lg border backdrop-blur-sm ${data.theme === 'minimal' ? 'border-white/30' : 'border-white/10'}`}
                style={{ backgroundColor: `rgba(${data.theme === 'minimal' ? '255,255,255' : '255,255,255'}, ${data.theme === 'minimal' ? contentOpacity * 0.5 : 0.1})` }}
              >
                 {data.logos.map((logo, index) => (
                   <img 
                    key={index} 
                    src={logo} 
                    alt={`Partner Logo ${index}`} 
                    style={{ height: `${layout.logoHeight}px` }}
                    className="object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity max-w-full" 
                   />
                 ))}
              </div>
            )}

            <div className="flex justify-between items-end h-20 mt-2">
                <div className="text-xs text-gray-400 max-w-[60%] space-y-1">
                    <p className={`font-bold ${data.theme === 'classic' ? 'text-amber-100' : 'text-white'}`}>
                      {data.contactTitle}
                    </p>
                    <p className="whitespace-pre-line leading-relaxed">
                      {data.contactDetails}
                    </p>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                    <div className="w-16 h-16 bg-white p-1 rounded shadow-lg shrink-0">
                        {data.qrCodeUrl ? (
                          <img src={data.qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full border-2 border-dashed border-slate-800 flex items-center justify-center">
                              <span className="text-slate-800 text-[8px] font-bold text-center">QR CODE<br/>ICI</span>
                          </div>
                        )}
                    </div>
                </div>
            </div>
        </footer>

      </div>
    </div>
  );
};
