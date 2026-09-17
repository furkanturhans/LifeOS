'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Truck,
  FileCheck2,
  Users,
  AlertCircle,
  Activity,
  ArrowUpRight,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useAdminStore } from '@/stores/useAdminStore';

export function AdminOverviewView() {
  const { overviewMetrics, setActiveTab, setApplicationTypeFilter, setApplicationStatusFilter } =
    useAdminStore();

  const metrics = overviewMetrics || {
    pendingInstructorApplications: 0,
    pendingProviderApplications: 0,
    documentsToReview: 0,
    newUsersToday: 0,
    openComplaints: 0,
    activity7DaysCount: 0,
    activityTrend: [],
  };

  const cards = [
    {
      id: 'pending_instructors',
      title: 'Bekleyen Eğitmen Başvuruları',
      value: metrics.pendingInstructorApplications,
      icon: GraduationCap,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      action: () => {
        setApplicationTypeFilter('instructor');
        setApplicationStatusFilter('pending');
        setActiveTab('applications');
      },
    },
    {
      id: 'pending_providers',
      title: 'Bekleyen Hizmet Sağlayıcıları',
      value: metrics.pendingProviderApplications,
      icon: Truck,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      action: () => {
        setApplicationTypeFilter('all');
        setApplicationStatusFilter('pending');
        setActiveTab('applications');
      },
    },
    {
      id: 'documents_to_review',
      title: 'İncelenecek Belgeler',
      value: metrics.documentsToReview,
      icon: FileCheck2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      action: () => {
        setActiveTab('applications');
      },
    },
    {
      id: 'new_users',
      title: 'Bugünkü Yeni Kullanıcılar',
      value: metrics.newUsersToday,
      icon: Users,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10 border-indigo-500/20',
      action: () => {
        setActiveTab('users');
      },
    },
    {
      id: 'open_complaints',
      title: 'Açık Şikâyetler & Güvenlik',
      value: metrics.openComplaints,
      icon: AlertCircle,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10 border-rose-500/20',
      action: () => {
        setActiveTab('complaints');
      },
    },
    {
      id: 'activity_7d',
      title: 'Son 7 Günlük Denetim Aktivitesi',
      value: metrics.activity7DaysCount,
      icon: Activity,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
      action: () => {
        setActiveTab('audit_logs');
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top 6 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.04 }}
            >
              <Card
                onClick={card.action}
                className="p-4 border-border bg-card shadow-xs hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${card.bgColor} ${card.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>

                <div className="mt-4">
                  <div className="text-2xl font-black tracking-tight text-foreground">
                    {card.value}
                  </div>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    {card.title}
                  </p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Activity Chart & Quick Governance Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Trend Chart */}
        <Card className="lg:col-span-2 p-5 border-border bg-card shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                Haftalık Yönetim ve Onay Trendi
              </h3>
            </div>
            <span className="text-[11px] text-muted-foreground">Son 7 Gün</span>
          </div>

          <div className="pt-2">
            <div className="flex items-end justify-between gap-3 h-36 px-2">
              {metrics.activityTrend.map((item, index) => {
                const maxAction = Math.max(...metrics.activityTrend.map((t) => t.actions), 1);
                const heightPercent = Math.max((item.actions / maxAction) * 100, 15);

                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {item.actions}
                    </span>
                    <div className="w-full max-w-[28px] bg-muted rounded-t-lg overflow-hidden h-28 flex items-end">
                      <div
                        className="w-full bg-primary/80 hover:bg-primary transition-all rounded-t-lg"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {item.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Security & Audit Guidelines */}
        <Card className="p-5 border-border bg-card shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-foreground">
              Yönetim İlkeleri & Güvenlik
            </h3>
          </div>

          <div className="space-y-2.5 text-xs text-muted-foreground">
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
              <strong className="text-foreground block text-[11px] mb-0.5">
                Değiştirilemez Denetim:
              </strong>
              Tüm onay, ret, askıya alma ve belge incelemeleri yönetici kimliğiyle loglanır.
            </div>
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
              <strong className="text-foreground block text-[11px] mb-0.5">
                Fiziksel Silme Yasağı:
              </strong>
              Hiçbir veri silinmez; durum değişiklikleri (`suspended`, `restricted`) uygulanır.
            </div>
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
              <strong className="text-foreground block text-[11px] mb-0.5">
                Veri Maskeleme:
              </strong>
              Kullanıcıların T.C. kimlik ve açık iletişim verileri korunur.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
