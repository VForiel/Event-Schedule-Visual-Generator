
import React from 'react';
import { ProgramItem } from '../types';

interface ProgramListProps {
  items: ProgramItem[];
  fontSizePercentage?: number;
}

export const ProgramList: React.FC<ProgramListProps> = ({ items, fontSizePercentage = 100 }) => {
  // Split items into two columns if there are many, otherwise one
  const midPoint = Math.ceil(items.length / 2);
  const leftColumn = items.slice(0, midPoint);
  const rightColumn = items.slice(midPoint);
  
  // Base scale factor derived from percentage (100% = 1.0)
  const s = fontSizePercentage / 100;

  // Font sizes in Rem based on the multiplier
  const timeSize = `${0.8 * s}rem`; 
  const titleSize = `${0.9 * s}rem`;
  const speakerSize = `${0.75 * s}rem`;
  const descSize = `${0.7 * s}rem`;

  const renderItem = (item: ProgramItem) => (
    <div key={item.id} className="border-l-2 border-cyan-500/50 pl-3 relative mb-3 break-inside-avoid">
      <div className="flex items-baseline gap-2">
        <span className="font-orbitron text-cyan-300 font-bold shrink-0 leading-none" style={{ fontSize: timeSize, width: `${3.5 * s}rem` }}>{item.time}</span>
        <h4 className="font-bold text-white leading-tight" style={{ fontSize: titleSize }}>{item.title}</h4>
      </div>
      <div className="text-gray-300 mt-0.5 italic leading-tight" style={{ fontSize: speakerSize }}>
        {item.speaker}
      </div>
      {item.description && (
        <p className="text-gray-400 leading-snug mt-0.5" style={{ fontSize: descSize }}>
          {item.description}
        </p>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-2 w-full h-full content-start gap-x-8">
      <div className="flex flex-col">
        {leftColumn.map(renderItem)}
      </div>
      <div className="flex flex-col">
        {rightColumn.map(renderItem)}
      </div>
    </div>
  );
};
