export type {
  ModuleDefinition,
  UserModule,
  ModuleStatus,
  ModuleCategory,
  HomescreenLayout,
  HomescreenPage,
  HomescreenItem,
  DockItem,
} from '@/types/module';

// Modül bileşeni için lazy loader tipi
export type ModuleComponentLoader = () => Promise<{ default: React.ComponentType }>;

// Modül metadata extensions
export interface ModuleMetadata {
  id: string;
  screenshots?: string[];
  tags?: string[];
  minSubscriptionPlan?: 'free' | 'pro' | 'enterprise';
  isNew?: boolean;
  isFeatured?: boolean;
}
