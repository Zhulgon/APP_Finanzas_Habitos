import { Platform } from 'react-native';

const BACKUP_FILE_PREFIX = 'habitos-finanzas-backup';

const formatTimestamp = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}${month}${day}-${hour}${minute}`;
};

export const downloadBackupFile = async (serializedBackup: string): Promise<void> => {
  if (Platform.OS !== 'web') {
    throw new Error('La descarga de backup esta disponible en web.');
  }

  const blob = new Blob([serializedBackup], { type: 'application/json' });
  const url = globalThis.URL.createObjectURL(blob);
  const anchor = globalThis.document.createElement('a');
  anchor.href = url;
  anchor.download = `${BACKUP_FILE_PREFIX}-${formatTimestamp()}.json`;
  globalThis.document.body.appendChild(anchor);
  anchor.click();
  globalThis.document.body.removeChild(anchor);
  globalThis.URL.revokeObjectURL(url);
};

export const pickBackupFileText = async (): Promise<string | null> => {
  if (Platform.OS !== 'web') {
    throw new Error('La carga de backup desde archivo esta disponible en web.');
  }

  return new Promise((resolve) => {
    const input = globalThis.document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.style.display = 'none';

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === 'string' ? reader.result : null;
        resolve(text);
      };
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    };

    globalThis.document.body.appendChild(input);
    input.click();
    globalThis.document.body.removeChild(input);
  });
};
