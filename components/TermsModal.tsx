import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-900">이용약관</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto text-slate-600 text-sm leading-relaxed space-y-6">
                    <section>
                        <h3 className="text-slate-900 font-bold mb-2">제1조 (목적)</h3>
                        <p>이 약관은 비주얼부스트(이하 "회사")가 제공하는 AI 기반 이미지 생성 및 디자인 서비스(이하 "서비스")의 이용 조건 및 절차, 회사와 회원의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                    </section>

                    <section>
                        <h3 className="text-slate-900 font-bold mb-2">제2조 (용어의 정의)</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>"서비스"라 함은 회사가 AI 기술을 활용하여 제공하는 이미지 생성, 편집 및 관련 디자인 용역을 말합니다.</li>
                            <li>"이용자"라 함은 회사에 접속하여 이 약관에 따라 회사가 제공하는 서비스를 이용하는 고객을 말합니다.</li>
                            <li>"결과물"이라 함은 회사가 서비스를 통해 제작하여 이용자에게 전달한 이미지 파일 등을 말합니다.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-slate-900 font-bold mb-2">제3조 (주문 및 결제)</h3>
                        <p className="mb-2">이용자는 회사가 정한 절차에 따라 서비스 이용을 신청하고, 회사는 이에 대해 승낙함으로써 계약이 체결됩니다.</p>
                        <p>서비스 비용은 선불을 원칙으로 하며, 회사가 지정한 계좌로 납입하거나 결제 수단을 통해 지급해야 작업이 시작됩니다. (단, 기업 간 계약 등 별도 협의가 있는 경우 예외로 합니다.)</p>
                    </section>

                    <section>
                        <h3 className="text-slate-900 font-bold mb-2">제4조 (환불 및 취소 규정)</h3>
                        <p className="mb-2">본 서비스는 AI 생성 및 디자이너의 작업 리소스가 즉시 투입되는 디지털 콘텐츠의 특성상, 작업이 착수된 이후(시안 생성 시작 시점)에는 단순 변심으로 인한 취소 및 환불이 불가능합니다.</p>
                        <p className="mb-2">단, 회사의 귀책 사유로 인하여 약속된 기한 내에 결과물을 전달하지 못한 경우에는 전액 환불이 가능합니다.</p>
                        <p>결과물의 스타일이나 품질이 주관적인 기대에 미치지 못한다는 사유로는 환불이 불가하며, 사전에 합의된 횟수 내에서 수정(Revision)을 요청할 수 있습니다.</p>
                    </section>

                    <section>
                        <h3 className="text-slate-900 font-bold mb-2">제5조 (저작권 및 라이선스 정책)</h3>
                        <p className="mb-2">회사가 납품한 결과물의 저작권은 원칙적으로 이용자(고객)에게 귀속됩니다. 단, 이용자는 구매한 상품의 종류에 따라 허용된 라이선스 범위를 준수해야 합니다.</p>
                        <div className="bg-slate-50 p-4 rounded border border-slate-100 my-2">
                            <h4 className="font-bold text-slate-800 mb-2">[라이선스 범위]</h4>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-medium text-slate-700">블로그용 패키지:</span> 제공된 이미지는 해당 블로그 포스팅 내에서만 사용 가능합니다. 상세페이지 제작, 유료 광고 집행, 2차 가공 등 상업적 재사용은 불가능합니다.</li>
                                <li><span className="font-medium text-slate-700">단품/상업용 패키지:</span> 용도 제한 없이 상업적으로 자유롭게 사용 가능합니다. (상세페이지, SNS 광고, 인쇄물 등)</li>
                            </ul>
                        </div>
                        <p>회사는 제작된 결과물을 회사의 포트폴리오(홈페이지, SNS 등) 용도로 사용할 수 있습니다. 이를 원치 않으실 경우 작업 착수 전에 말씀해 주시면 제외됩니다.</p>
                    </section>

                    <section>
                        <h3 className="text-slate-900 font-bold mb-2">제6조 (면책 조항)</h3>
                        <p className="mb-2">회사는 생성된 AI 이미지가 제3자의 저작권이나 초상권을 침해하지 않도록 최선을 다하나, AI 기술의 특성상 발생할 수 있는 우발적인 유사성에 대해서는 고의나 중과실이 없는 한 책임을 지지 않습니다.</p>
                        <p>회사는 이용자가 결과물을 활용하여 얻은 영업상 이익이나 손실에 대해 책임을 지지 않습니다.</p>
                    </section>

                    <section>
                        <h3 className="text-slate-900 font-bold mb-2">제7조 (기타)</h3>
                        <p>본 약관에 명시되지 않은 사항은 관계 법령 및 상관례에 따릅니다.</p>
                    </section>

                    <section>
                        <h3 className="text-slate-900 font-bold mb-2">(부칙)</h3>
                        <p>이 약관은 2025년 12월 12일부터 적용됩니다.</p>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
