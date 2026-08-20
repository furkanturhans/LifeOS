export type ModuleStatus = 'ACTIVE' | 'COMING_SOON' | 'BETA' | 'PREMIUM' | 'DISABLED';
export type UserModuleStatus = 'ENABLED' | 'HIDDEN';
export type ModuleCategory = 'productivity' | 'health' | 'finance' | 'entertainment' | 'communication' | 'home' | 'utility';

export interface ModuleDefinition {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  gradient: string;
  category: ModuleCategory;
  status: ModuleStatus;
  description: string;
  descriptionEn: string;
  version: string;
  sortOrder: number;
}

export interface UserModule extends ModuleDefinition {
  userStatus: UserModuleStatus;
  addedAt: string;
}

export interface HomescreenPage {
  page: number;
  items: HomescreenItem[];
}

export interface HomescreenItem {
  moduleId: string;
  position: number; // 0-based index in grid
  size: 'small' | 'medium'; // small = 1x1, medium = 2x1 (future)
}

export interface DockItem {
  moduleId: string;
  position: number;
}

export interface HomescreenLayout {
  pages: HomescreenPage[];
  dockItems: DockItem[];
}
