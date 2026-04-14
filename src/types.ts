export type Severity = 'error' | 'warning';

export interface ValidationResult {
  rule: string;
  severity: Severity;
  key: string;
  message: string;
}

export type ParsedEnv = Map<string, string>;
