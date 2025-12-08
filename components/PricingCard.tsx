import React from 'react';
import { Check, Star, Flame } from 'lucide-react';
import { PackageItem } from '../types';
import Editable from './Editable';
import { useChat } from '../context/ChatContext';

interface PricingCardProps {
  item: PackageItem;
  cardId: string; // 안정적인 ID를 위해 추가
}

const PricingCard: React.FC<PricingCardProps> = ({ item, cardId }) => {
  const { openChat } = useChat();
  const formattedPrice = new Intl.NumberFormat('ko-KR').format(item.price);
  const formattedOriginalPrice = item.originalPrice ? new Intl.NumberFormat('ko-KR').format(item.originalPrice) : null;
  const discountRate = item.originalPrice ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0;

  return (
    <div
      className={`relative flex flex-col rounded-3xl p-8 shadow-xl ring-1 transition-all duration-300 hover:-translate-y-1 ${item.isHot
        ? 'bg-white ring-primary-600 shadow-primary-200 lg:z-10 lg:scale-105'
        : 'bg-white/60 ring-gray-200 text-gray-600 hover:bg-white'
        }`}
    >
      {item.isHot && (
        <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 text-center text-sm font-semibold text-white shadow-md flex items-center justify-center gap-1">
          <Flame className="w-4 h-4 fill-current" /> HOT CHOICE
        </div>
      )}

      <div className="mb-4">
        <Editable
          id={`${cardId}-title`}
          tagName="h3"
          className={`text-xl font-bold tracking-tight ${item.isHot ? 'text-gray-900' : 'text-gray-900'}`}
          text={item.title}
        />
        {item.subtitle && (
          <Editable id={`${cardId}-subtitle`} tagName="p" className="text-sm text-primary-600 font-medium mt-1" text={item.subtitle} />
        )}
      </div>

      <div className="mb-6">
        {item.originalPrice && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-400 line-through text-lg">{formattedOriginalPrice}원</span>
            <span className="text-red-500 font-bold text-lg">{discountRate}% OFF</span>
          </div>
        )}
        <div className="flex items-baseline gap-x-2">
          <div className="flex items-baseline">
            <Editable id={`${cardId}-price`} tagName="span" className="text-4xl font-bold tracking-tight text-gray-900" text={formattedPrice} />
            <span className="text-sm font-semibold leading-6 text-gray-500 ml-1">원</span>
          </div>
          {item.type === 'membership' && <span className="text-sm text-gray-400">/월</span>}
        </div>
      </div>

      <div className="mb-6 rounded-xl bg-gray-50 p-4">
        <div className="flex items-start gap-2">
          <Star className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0 fill-yellow-500" />
          <div className="w-full">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">추천 대상</span>
            <Editable
              id={`${cardId}-recommendation`}
              tagName="p"
              className="text-sm text-gray-700 font-medium mt-1 whitespace-pre-line leading-relaxed"
              text={item.recommendation.replace(/<br>/g, '\n')}
            />
          </div>
        </div>
      </div>

      <ul className="space-y-4 text-sm leading-6 text-gray-600 mb-8 flex-1">
        {item.description.map((feature, idx) => (
          <li key={idx} className="flex gap-x-3">
            <Check className={`h-6 w-5 flex-none ${item.isHot ? 'text-primary-600' : 'text-gray-400'}`} aria-hidden="true" />
            <div className="w-full">
              <Editable id={`${cardId}-feature-${idx}`} tagName="span" html={feature} />
            </div>
          </li>
        ))}
      </ul>

      <button
        onClick={openChat}
        className={`mt-auto block w-full rounded-xl px-3 py-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors ${item.isHot
          ? 'bg-primary-600 text-white shadow-sm hover:bg-primary-500 focus-visible:outline-primary-600'
          : 'bg-white text-primary-600 ring-1 ring-inset ring-primary-200 hover:ring-primary-300'
          }`}
      >
        <Editable id={`${cardId}-cta`} tagName="span" text="상담하기" />
      </button>
    </div>
  );
};

export default PricingCard;