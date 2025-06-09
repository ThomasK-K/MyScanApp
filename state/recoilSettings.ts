import { atom } from 'recoil';

export type AppSettings = {
  uploadUrl: string;
  docType: string
  theme: 'dark' | 'light';
};

export const settingsState = atom<AppSettings>({
  key: 'settingsState',
  default: {
    uploadUrl: '',
    docType: '',
    theme: 'light',
  },
});
