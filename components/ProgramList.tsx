import React from 'react';
import { ProgramItem } from '../types';

interface ProgramListProps {
  items: ProgramItem[];
}

export const ProgramList: React.FC<ProgramListProps> = ({ items }) => {
  // Split items into two columns if there are many, otherwise one
  const midPoint = Math.ceil(items.length / 2);
  const leftColumn = items.slice(0, midPoint);
  const rightColumn = items.slice(midPoint);
  
  const renderItem = (item: ProgramItem) => (
    <div key={item.id} className="mb-3 border-l-2 border-cyan-500/50 pl-3 relative">
      <div className="flex items-baseline gap-2">
        <span className="font-orbitron text-cyan-300 text-xs font-bold w-12 shrink-0">{item.time}</span>
        <h4 className="font-bold text-white text-sm leading-tight">{item.title}</h4>
      </div>
      <div className="text-xs text-gray-300 mt-0.5 italic">
        {item.speaker}
      </div>
      {item.description && (
        <p className="text-[10px] text-gray-400 leading-tight mt-0.5 line-clamp-2">
          {item.description}
        </p>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-6 w-full h-full">
      <div className="flex flex-col">
        {leftColumn.map(renderItem)}
        {leftColumn.length === 0 && (
          <div className="text-gray-500 text-center text-sm italic border border-dashed border-gray-600 p-4 rounded">
            Espace Programme (Partie 1)
          </div>
        )}
      </div>
      <div className="flex flex-col">
        {rightColumn.map(renderItem)}
        {rightColumn.length === 0 && (
          <div className="text-gray-500 text-center text-sm italic border border-dashed border-gray-600 p-4 rounded">
            Espace Programme (Partie 2)
          </div>
        )}
      </div>
    </div>
  );
};