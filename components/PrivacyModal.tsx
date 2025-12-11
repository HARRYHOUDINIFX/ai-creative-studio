import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface PrivacyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
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
                    <h2 className="text-lg font-bold text-slate-900">비주얼부스트 개인정보처리방침</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto text-slate-600 text-sm leading-relaxed space-y-6">
                    <p>
                        비주얼부스트(이하 '회사')는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
                    </p>

                    <section>
                        <h3 className="text-slate-900 font-bold mb-2">제1조 (개인정보의 처리 목적)</h3>
                        <p className="mb-2">회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>서비스 제공 및 상담: 견적 산출, 서비스 계약 체결, 결과물 발송, 콘텐츠 제공</li>
                            <li>고객 관리: 문의에 대한 답변, 불만 처리 등 민원 처리</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-slate-900 font-bold mb-2">제2조 (개인정보의 수집 항목)</h3>
                        <p className="mb-2">회사는 상담 및 서비스 제공을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>수집 항목: 성명(또는 업체명), 연락처(휴대전화번호), 이메일</li>
                            <li>수집 방법: 홈페이지 문의 양식, 전화, 이메일 상담</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-slate-900 font-bold mb-2">제3조 (개인정보의 처리 및 보유 기간)</h3>
                        <p className="mb-2">① 회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.</p>
                        <p className="mb-2">② 구체적인 개인정보 처리 및 보유 기간은 다음과 같습니다.</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>고객 문의 및 상담 기록: 문의 처리 완료 후 1년</li>
                            <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
                            <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-slate-900 font-bold mb-2">제4조 (개인정보의 파기)</h3>
                        <p className="mb-2">① 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</p>
                        <p className="mb-2">② 파기 방법은 다음과 같습니다.</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>전자적 파일: 복구 및 재생이 불가능한 기술적 방법을 사용하여 삭제</li>
                            <li>종이 문서: 분쇄기로 분쇄하거나 소각</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-slate-900 font-bold mb-2">제5조 (개인정보의 제3자 제공)</h3>
                        <p>
                            회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다. 현재 회사는 개인정보를 제3자에게 제공하고 있지 않습니다.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-slate-900 font-bold mb-2">제6조 (정보주체의 권리·의무 및 행사 방법)</h3>
                        <p>
                            정보주체는 회사에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다. 권리 행사는 회사에 대해 서면, 전자우편 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-slate-900 font-bold mb-2">제7조 (개인정보 자동 수집 장치의 설치·운영 및 거부에 관한 사항)</h3>
                        <p className="mb-2">① 회사는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 이용정보를 저장하고 수시로 불러오는 ‘쿠키(cookie)’를 사용합니다.</p>
                        <p className="mb-2">② 이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 따라서 웹브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수도 있습니다.</p>
                        <div className="bg-slate-50 p-3 rounded text-xs text-slate-500 mt-2">
                            거부 방법 예시(크롬): 웹브라우저 상단의 설정 &gt; 개인정보 및 보안 &gt; 쿠키 및 기타 사이트 데이터 &gt; 쿠키 차단 설정
                        </div>
                    </section>

                    <section>
                        <h3 className="text-slate-900 font-bold mb-2">제8조 (개인정보 보호책임자)</h3>
                        <p className="mb-2">회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만 처리 및 피해 구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
                        <ul className="list-none space-y-1 bg-slate-50 p-3 rounded border border-slate-100">
                            <li>성명: 장순용</li>
                            <li>직책: 대표</li>
                            <li>연락처: skilling@naver.com</li>
                            <li>주소: 인천광역시 서구 원당동 822-2</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-slate-900 font-bold mb-2">제9조 (개인정보 처리방침의 변경)</h3>
                        <p>이 개인정보 처리방침은 2025년 12월 12일부터 적용됩니다.</p>
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

export default PrivacyModal;
