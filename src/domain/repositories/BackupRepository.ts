export interface BackupRepository {
  exportBackup(): Promise<string>;
  importBackup(serializedBackup: string): Promise<void>;
}
