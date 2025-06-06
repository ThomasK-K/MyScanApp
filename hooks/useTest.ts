import { useRecoilState,atom } from 'recoil';

export const useImageNameList = () => {
  const [imagenameList, setImagenameList] = useRecoilState(imageNamesState);
  // Funktion zum Hinzufügen
  const addImageName = (imageName: string) => {
    setImagenameList((oldImageList) => [...oldImageList, imageName]);
  };
  return {
    imagenameList,
    addImageName,
  };
};
// Atom für die Image Liste
export const imageNamesState = atom<string[]>({
  key: 'imageNamesState', // Eindeutiger Schlüssel
  default: [], // Standardwert (leeres Array)
});