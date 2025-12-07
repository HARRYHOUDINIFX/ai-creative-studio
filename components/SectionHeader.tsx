import React from 'react';
import Editable from './Editable';

interface SectionHeaderProps {
  number: string;
  title: string;
  subtitle: string;
  badge?: string;
  id: string; // 안정적인 ID를 위해 필수 prop으로 추가
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ number, title, subtitle, badge, id }) => {
  return (
    <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-16">
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm ring-4 ring-white">
          {number}
        </span>
        {badge && (
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
            {badge}
          </span>
        )}
      </div>
      <Editable
        id={`${id}-title`}
        tagName="h2"
        className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900"
        text={title}
      />
      <div className="mt-4">
        <Editable
          id={`${id}-subtitle`}
          tagName="p"
          className="text-lg leading-8 text-slate-600 whitespace-pre-line"
          text={subtitle}
        />
      </div>
    </div>
  );
};

export default SectionHeader;