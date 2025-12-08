import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    isBot: boolean;
    timestamp: Date;
}

interface ChatWindowProps {
    onClose: () => void;
}

const MENU_OPTIONS = [
    { id: 1, text: "💰 견적/가격 구성이 궁금해요" },
    { id: 2, text: "📦 진행 절차와 소요 시간이 어떻게 되나요?" },
    { id: 3, text: "🛠️ 수정(A/S) 범위가 궁금해요" },
    { id: 4, text: "📅 월간 멤버십(정기 관리) 혜택은?" },
    { id: 5, text: "📸 촬영 전 준비물이 있나요? (필독)" },
];

const RESPONSES: Record<number, string> = {
    1: `**Q. 단품 가격이 생각보다 높은데 할인은 없나요?**
안녕하세요! 저희 단품 서비스는 단순 촬영이 아니라 **'기획+연출+보정+마케팅 소구점 분석'**이 모두 포함된 프리미엄 단가입니다.

하지만 합리적인 이용을 위해 **[패키지 구성]**을 강력 추천해 드려요!
낱개로 진행하실 때보다 30% 이상 할인된 금액으로 책정되어 있어, 실제 고객님의 90% 이상이 패키지를 선택하고 계십니다.

👉 추천 1. 기존 상세페이지 심폐소생이 필요하다면? → A. 심폐소생 팩 (약 30% SAVE)
👉 추천 2. 신제품 런칭/와디즈 펀딩 준비 중이라면? → B. 런칭 올인원 팩 (약 33% SAVE)`,

    2: `**Q. 작업 기간은 얼마나 걸리나요?**
평균적인 작업 소요 시간은 아래와 같습니다. (제품 수령일 기준)

*   이미지/GIF 단품: 영업일 기준 1~2일
*   패키지 제작: 영업일 기준 3~4일
*   영상 제작: 기획 포함 영업일 기준 4~5일

💡 **급행(Rush) 진행이 필요하신가요?**
스케줄 조정이 가능한 경우, 20%의 급행료 추가 시 우선 작업해 드립니다. 상담원에게 '급행 가능 여부'를 물어봐 주세요!`,

    3: `**Q. 마음에 안 들면 수정해주시나요?**
물론입니다! 꼼꼼한 작업을 위해 단계별 수정을 지원합니다.

✅ **무료 수정 범위** (기본 2회, 당사의 실수로 인한 수정은 차감 X)
*   색감 미세 조정, 누끼 마감 등 디테일 수정
*   영상 컷 편집 타이밍, 자막 수정 등

⚠️ **유료 수정 (재작업) 대상**
*   무료 수정 범위 초과 시
*   사전에 협의되지 않은 컨셉으로 전체 변경 요청
*   촬영 제품 자체의 변경 요청
*   (기획안 확정 후) 영상 구성 전체 변경

원활한 진행을 위해 작업 착수 전 **[원하시는 레퍼런스]**를 꼭 공유해 주세요!`,

    4: `**Q. 월간 멤버십을 하면 뭐가 좋은가요?**
월간 멤버십은 마케터 1명을 채용하는 비용의 50% 수준으로 콘텐츠 기획부터 제작까지 해결해 드리는 서비스입니다.

🏆 **멤버십 회원만의 특권**
1.  **우선 작업권:** 스케줄이 꽉 차 있어도 1순위로 작업해 드립니다.
2.  **톤앤매너 유지:** 브랜드 색깔을 꾸준히 유지하며 콘텐츠를 누적시킬 수 있습니다.
3.  **알아서 척척:** 매번 기획안을 주지 않으셔도, 저희가 시즌/이슈에 맞춰 제안해 드립니다.`,

    5: `**Q. 제가 무엇을 준비해서 보내드리면 되나요?**
성공적인 결과물을 위해 딱 2가지만 준비해 주세요!

1.  **촬영용 제품 이미지나 영상 (실물)**
2.  **원하시는 레퍼런스 (매우 중요! ⭐)**
    *   경쟁사 이미지, 핀터레스트 캡처 등 "이런 느낌이 좋아요"라고 보여주세요.
    *   만약 공유해주지 않으시면 전문가의 임의 기획으로 제작되며, 이 경우 전면 수정은 어렵습니다.

(+ 납품 사이즈: 웹/모바일 최적화 1000~1500px, 숏폼 HD 이상 기본 제공)`
};

const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            text: '안녕하세요! Visual Boost 입니다. \n궁금하신 내용을 아래 메뉴에서 선택해주세요.',
            isBot: true,
            timestamp: new Date()
        }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleOptionClick = (optionId: number) => {
        const option = MENU_OPTIONS.find(o => o.id === optionId);
        if (!option) return;

        // User Message
        const userMsg: Message = {
            id: Date.now().toString(),
            text: option.text,
            isBot: false,
            timestamp: new Date()
        };

        // Bot Response
        const botResponseText = RESPONSES[optionId];
        const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: botResponseText,
            isBot: true,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg, botMsg]);
    };

    return (
        <div className="fixed bottom-24 right-6 w-[360px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 ring-1 ring-gray-200 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Visual Boost 상담톡</h3>
                        <p className="text-xs text-slate-300">자동 응답 봇이 대기중입니다.</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50" ref={scrollRef}>
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                            {msg.isBot && (
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                                    <Bot className="w-4 h-4 text-slate-600" />
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${msg.isBot
                                    ? 'bg-white text-slate-800 rounded-tl-none ring-1 ring-gray-100'
                                    : 'bg-primary-600 text-white rounded-tr-none'
                                    }`}
                            >
                                <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Menu Options */}
            <div className="p-3 bg-white border-t border-gray-100 shrink-0">
                <p className="text-xs text-gray-400 mb-2 px-1 font-medium">자주 묻는 질문</p>
                <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                    {MENU_OPTIONS.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleOptionClick(option.id)}
                            className="text-left text-sm px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 transition-colors border border-slate-100 hover:border-slate-200"
                        >
                            {option.text}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default ChatWindow;
