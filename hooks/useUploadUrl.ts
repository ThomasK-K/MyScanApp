import { useRecoilValue } from 'recoil';
import { settingsState } from '../state/recoilSettings';

export function useUploadUrl() {
  const settings = useRecoilValue(settingsState);
  return settings.uploadUrl;
}
