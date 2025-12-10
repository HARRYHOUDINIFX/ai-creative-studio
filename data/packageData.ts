import { PackageItem } from '../types';

export const PACKAGES: PackageItem[] = [
    {
        id: 'A',
        title: 'A. 상세페이지 심폐소생 팩',
        price: 290000,
        originalPrice: 340000,
        type: 'package',
        description: [
            '<strong class="text-gray-900">이미지 3종 + GIF 1종</strong>',
            '제품 연출컷 2장 (메인용)',
            '컨셉/패키지 연출컷 1장',
            '상세페이지용 움짤(GIF) 1건'
        ],
        recommendation: '기존 상세페이지의\n구매 전환율을 높이고 싶은 분'
    },
    {
        id: 'B',
        title: 'B. 런칭 올인원 팩',
        price: 850000,
        originalPrice: 1150000,
        isHot: true,
        type: 'package',
        description: [
            '<strong class="text-gray-900">이미지 5종 + GIF 3종 + 숏폼 영상 + 블로그</strong>',
            '고퀄리티 연출컷 3장',
            '모델 연출컷 2장 (초상권 해결)',
            '숏폼 영상(20~30초 내외) 1건 + GIF 변환 2건',
            '<span class="text-primary-600 font-bold">(서비스)</span> 블로그 홍보글 1건'
        ],
        recommendation: '신제품 출시,\n와디즈 펀딩,\n브랜딩이 필요한 분'
    }
];
