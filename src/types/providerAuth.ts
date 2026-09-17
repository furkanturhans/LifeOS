export type ProviderUserStatus =
  | 'customer'
  | 'provider_applicant'
  | 'provider_verified'
  | 'provider_suspended';

export type ServiceCategoryKey = 'taxi' | 'travel' | 'moving' | 'craftsman';

export interface DocumentChecklistItem {
  type: string;
  titleTr: string;
  descriptionTr: string;
  isMandatory: boolean;
  status: 'pending' | 'submitted' | 'verified';
}

export interface ServiceSpecificProviderProfile {
  serviceType: ServiceCategoryKey;
  status: ProviderUserStatus;
  fullName?: string;
  businessTitle?: string;
  vehicleOrEquipmentInfo?: string;
  submittedAt?: string;
  reviewedAt?: string;
  documentChecklist: DocumentChecklistItem[];
  notes?: string;
}

export const SERVICE_DOCUMENT_REQUIREMENTS: Record<
  ServiceCategoryKey,
  DocumentChecklistItem[]
> = {
  moving: [
    {
      type: 'id_document',
      titleTr: 'T.C. Kimlik / Sürücü Belgesi',
      descriptionTr: 'Yetkili sürücüye ait kimlik ve ehliyet ön/arka yüzü',
      isMandatory: true,
      status: 'submitted',
    },
    {
      type: 'moving_k_permit',
      titleTr: 'Nakliye Yetki Belgesi (K3 / K1)',
      descriptionTr: 'Ulaştırma Bakanlığı eşya taşımacılığı yetki belgesi',
      isMandatory: true,
      status: 'submitted',
    },
    {
      type: 'vehicle_registration',
      titleTr: 'Nakliye Aracı Ruhsatı & Muayene',
      descriptionTr: 'Kapalı kasa kamyon / kamyonet araç ruhsatı',
      isMandatory: true,
      status: 'submitted',
    },
    {
      type: 'driver_src_license',
      titleTr: 'SRC-3 / SRC-4 & Psikoteknik',
      descriptionTr: 'Yük ve eşya taşıma mesleki yeterlilik belgesi',
      isMandatory: true,
      status: 'submitted',
    },
    {
      type: 'tax_plate',
      titleTr: 'Vergi Levhası / Esnaf Sicil',
      descriptionTr: 'Ticari faaliyet veya oda kayıt belgesi beyanı',
      isMandatory: false,
      status: 'pending',
    },
  ],
  taxi: [
    {
      type: 'id_document',
      titleTr: 'T.C. Kimlik / Sürücü Belgesi',
      descriptionTr: 'En az B sınıfı geçerli sürücü belgesi',
      isMandatory: true,
      status: 'submitted',
    },
    {
      type: 'taxi_permit',
      titleTr: 'Ticari Taksi Çalışma Ruhsatı',
      descriptionTr: 'Belediye / UKOME onaylı ticari plaka tahsis belgesi',
      isMandatory: true,
      status: 'submitted',
    },
    {
      type: 'taxi_vehicle_registration',
      titleTr: 'Taksi Araç Ruhsatı & Taksimetre',
      descriptionTr: 'Ruhsat ve taksimetre muayene onay kaydı',
      isMandatory: true,
      status: 'submitted',
    },
    {
      type: 'driver_src_psiko',
      titleTr: 'SRC-2 & Psikoteknik Raporu',
      descriptionTr: 'Yolcu taşımacılığı mesleki yeterlilik sertifikası',
      isMandatory: true,
      status: 'submitted',
    },
  ],
  travel: [
    {
      type: 'id_document',
      titleTr: 'T.C. Kimlik / Profesyonel Sürücü Belgesi',
      descriptionTr: 'D sınıfı otobüs sürücü ehliyeti',
      isMandatory: true,
      status: 'submitted',
    },
    {
      type: 'travel_d2_permit',
      titleTr: 'D2 / B2 Taşımacılık Yetki Belgesi',
      descriptionTr: 'Bakanlık onaylı tarifeli/tarifesiz yolcu taşıma yetki belgesi',
      isMandatory: true,
      status: 'submitted',
    },
    {
      type: 'bus_registration_insurance',
      titleTr: 'Otobüs Ruhsatı & Zorunlu Koltuk Sigortası',
      descriptionTr: 'Karayolu yolcu taşımacılığı mali sorumluluk poliçesi',
      isMandatory: true,
      status: 'submitted',
    },
    {
      type: 'travel_src1_license',
      titleTr: 'SRC-1 / SRC-2 & Mesleki Yeterlilik',
      descriptionTr: 'Uluslararası / şehirlerarası yolcu taşıma yetki sertifikası',
      isMandatory: true,
      status: 'submitted',
    },
  ],
  craftsman: [
    {
      type: 'id_document',
      titleTr: 'T.C. Kimlik Belgesi',
      descriptionTr: 'Usta / hizmet veren kimlik kartı ön/arka yüzü',
      isMandatory: true,
      status: 'submitted',
    },
    {
      type: 'craftsman_certificate',
      titleTr: 'Ustalık / Kalfalık / MYK Belgesi',
      descriptionTr: 'Mesleki Yeterlilik Kurumu veya MEB ustalık diploması',
      isMandatory: true,
      status: 'submitted',
    },
    {
      type: 'chamber_or_tax',
      titleTr: 'Esnaf Odası Sicil Kaydı / Vergi Levhası',
      descriptionTr: 'İlgili meslek odası veya basit usul vergi kaydı beyanı',
      isMandatory: false,
      status: 'submitted',
    },
  ],
};

export const SERVICE_DETAILS_CONFIG: Record<
  ServiceCategoryKey,
  {
    titleTr: string;
    roleNameTr: string;
    iconEmoji: string;
    descriptionTr: string;
    vehicleOrEquipmentPlaceholder: string;
  }
> = {
  moving: {
    titleTr: 'Nakliye & Taşıma',
    roleNameTr: 'Taşıyıcı / Nakliyeci',
    iconEmoji: '🚚',
    descriptionTr: 'Evden eve, parça eşya ve şehirlerarası taşımacılık',
    vehicleOrEquipmentPlaceholder: 'Örn: 34 ABC 123 - Kapalı Kasa Kamyonet / Asansörlü / K3',
  },
  taxi: {
    titleTr: 'Taksi',
    roleNameTr: 'Taksi Şoförü / Sürücü',
    iconEmoji: '🚕',
    descriptionTr: 'Sabit tarifeli, güvenli ve hızlı şehir içi taksi hizmeti',
    vehicleOrEquipmentPlaceholder: 'Örn: 34 TAA 01 - Sarı Taksi / UKOME Ruhsat No: 98765',
  },
  travel: {
    titleTr: 'Seyahat & Otobüs',
    roleNameTr: 'Seyahat Acentesi / Kaptan',
    iconEmoji: '🚌',
    descriptionTr: 'Şehirlerarası otobüs ve konforlu seyahat hizmeti',
    vehicleOrEquipmentPlaceholder: 'Örn: 34 BUS 100 - Travego 46 Kişilik / D2 Belgesi',
  },
  craftsman: {
    titleTr: 'Usta & Tamirat',
    roleNameTr: 'Usta / Tamirci',
    iconEmoji: '🛠️',
    descriptionTr: 'Elektrik, tesisat, montaj ve tadilat ustalık hizmetleri',
    vehicleOrEquipmentPlaceholder: 'Örn: Elektrik Tesisat & Pano Ustalık Belgesi No: 45210',
  },
};
