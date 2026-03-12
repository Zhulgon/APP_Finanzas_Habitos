import type { BackupRepository } from '../../../domain/repositories/BackupRepository';

export class NativeBackupRepository implements BackupRepository {
  async exportBackup(): Promise<string> {
    throw new Error('Backup en texto aun no esta habilitado en modo nativo.');
  }

  async importBackup(_serializedBackup: string): Promise<void> {
    throw new Error('Restore en texto aun no esta habilitado en modo nativo.');
  }
}
