import type {
  AssistantTask,
  AssistantTaskStep,
  ParsedAssistantCommand,
} from '@/types/assistant';

export interface StepExecutionResult {
  success: boolean;
  logMessage: string;
  resultSummary?: string;
  updatedDetails?: string;
}

export interface AssistantProviderAdapter {
  id: string;
  name: string;
  version: string;
  isLocal: boolean;
  parseCommand(prompt: string, context?: { locale: string }): Promise<ParsedAssistantCommand>;
  generateTaskPlan(task: AssistantTask): Promise<AssistantTaskStep[]>;
  executeStep(task: AssistantTask, step: AssistantTaskStep): Promise<StepExecutionResult>;
}
