
import React from 'react';
import { ProgramItem } from '../types';

interface ProgramListProps {
  items: ProgramItem[];
  scale?: number;
  gap?: number;
}

export const ProgramList: React.FC<ProgramListProps> = ({ items, scale = 1, gap = 3 }) => {
  // Split items into two columns if there are many, otherwise one
  const midPoint = Math.ceil(items.length / 2);
  const leftColumn = items.slice(0, midPoint);
  const rightColumn = items.slice(midPoint);
  
  // Adjust base sizes based on scale
  const timeSize = `${0.75 * scale}rem`; // text-xs base
  const titleSize = `${0.875 * scale}rem`; // text-sm base
  const speakerSize = `${0.75 * scale}rem`;
  const descSize = `${0.65 * scale}rem`;

  const renderItem = (item: ProgramItem) => (
    <div key={item.id} className="border-l-2 border-cyan-500/50 pl-3 relative" style={{ marginBottom: `${gap * 0.25}rem` }}>
      <div className="flex items-baseline gap-2">
        <span className="font-orbitron text-cyan-300 font-bold shrink-0" style={{ fontSize: timeSize, width: `${3 * scale}rem` }}>{item.time}</span>
        <h4 className="font-bold text-white leading-tight" style={{ fontSize: titleSize }}>{item.title}</h4>
      </div>
      <div className="text-gray-300 mt-0.5 italic" style={{ fontSize: speakerSize }}>
        {item.speaker}
      </div>
      {item.description && (
        <p className="text-gray-400 leading-tight mt-0.5 line-clamp-2" style={{ fontSize: descSize }}>
          {item.description}
        </p>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-2 w-full h-full" style={{ gap: '1.5rem' }}>
      <div className="flex flex-col">
        {leftColumn.map(renderItem)}
        {leftColumn.length === 0 && (
          <div className="text-gray-500 text-center italic border border-dashed border-gray-600 p-4 rounded" style={{ fontSize: '0.8rem' }}>
            Espace Programme (Partie 1)
          </div>
        )}
      </div>
      <div className="flex flex-col">
        {rightColumn.map(renderItem)}
        {rightColumn.length === 0 && (
          <div className="text-gray-500 text-center italic border border-dashed border-gray-600 p-4 rounded" style={{ fontSize: '0.8rem' }}>
            Espace Programme (Partie 2)
          </div>
        )}
      </div>
    </div>
  );
};
