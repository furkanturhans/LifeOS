'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  MessageSquare,
  Stethoscope,
  Zap,
  Camera,
  Home,
  Baby,
  ShoppingBag,
  Cloud,
  Folder,
  AlertOctagon,
  FileText,
  Film,
  Languages,
  Award,
  Cpu,
  Boxes,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LockedFeatureModal } from '@/components/ui/LockedFeatureModal';

interface SystemTool {
  id: string;
  name: string;
  description: string;
  category: 'productivity' | 'health_home' | 'utility_media';
  icon: React.ElementType;
}

const SYSTEM_TOOLS: SystemTool[] = [
  {
    id: 'ai',
    name: 'Yapay Zeka Asistanı',
    description: 'Akıllı görev planlama, özetleme ve kişisel destek',
    category: 'productivity',
    icon: Bot,
  },
  {
    id: 'chat',
    name: 'Mesajlar & İletişim',
    description: 'Şifreli anlık mesajlaşma ve grup sohbetleri',
    category: 'productivity',
    icon: MessageSquare,
  },
  {
    id: 'medai',
    name: 'MedAI Sağlık',
    description: 'Semptom analizi ve sağlık takibi',
    category: 'health_home',
    icon: Stethoscope,
  },
  {
    id: 'smart-home',
    name: 'Akıllı Ev & Enerji',
    description: 'İnverter, solar sistem, ısı pompası, kamera, kW güç ve ev aletleri',
    category: 'health_home',
    icon: Home,
  },
  {
    id: 'camera',
    name: 'Kamera & Güvenlik',
    description: 'Akıllı kamera akışları ve güvenlik bildirimleri',
    category: 'health_home',
    icon: Camera,
  },
  {
    id: 'files',
    name: 'Dosya Yöneticisi',
    description: 'Yerel ve bulut dosya organizasyonu',
    category: 'productivity',
    icon: Folder,
  },
  {
    id: 'cloud',
    name: 'Bulut Depolama',
    description: 'Otomatik yedekleme ve senkronizasyon',
    category: 'productivity',
    icon: Cloud,
  },
  {
    id: 'store',
    name: 'Uygulama Mağazası',
    description: 'LifeOS eklenti ve mini uygulama dizini',
    category: 'utility_media',
    icon: ShoppingBag,
  },
  {
    id: 'media',
    name: 'Medya & Müzik',
    description: 'Çoklu ortam oynatıcı ve yayın merkezi',
    category: 'utility_media',
    icon: Film,
  },
  {
    id: 'translate',
    name: 'Çeviri Asistanı',
    description: 'Anlık metin ve ses çevirisi',
    category: 'productivity',
    icon: Languages,
  },
  {
    id: 'automation',
    name: 'Otomasyon Motoru',
    description: 'Rutin görevleri birbirine bağlayan kurallar',
    category: 'productivity',
    icon: Cpu,
  },
];

export function HomeSystemDirectory() {
  const [selectedTool, setSelectedTool] = useState<SystemTool | null>(null);

  return (
    <div className="px-4 mt-8 pb-8 sm:px-6">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Sistem Araçları & Yakındaki Modüller
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Geliştirme aşamasında olan LifeOS entegre servisleri
          </p>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          {SYSTEM_TOOLS.length} Modül
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SYSTEM_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              onClick={() => setSelectedTool(tool)}
              className="cursor-pointer"
            >
              <Card hover className="h-full border-border bg-card p-4 transition-all shadow-2xs hover:border-border/80">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted border border-border text-muted-foreground">
                      <Icon className="h-4.5 w-4.5 stroke-[1.75]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-bold text-foreground truncate">
                        {tool.name}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status="locked" label="Yakında" size="sm" />
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Feature Preview Modal */}
      <LockedFeatureModal
        isOpen={Boolean(selectedTool)}
        onClose={() => setSelectedTool(null)}
        title={selectedTool?.name || ''}
        description={
          selectedTool
            ? `${selectedTool.name} modülü LifeOS ekosistemine entegre edilmektedir. Güvenlik ve performans optimizasyonlarının ardından yakında kullanıma sunulacaktır.`
            : ''
        }
        moduleName="Gelecek Modül"
      />
    </div>
  );
}
