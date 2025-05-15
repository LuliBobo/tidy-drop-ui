interface Props {
  onFileSelect: (filePath: string) => void;
  allowedExtensions: string[];
  maxFileSize: number; // In bytes
  isElectron: boolean;
}

export function FilePicker(props: Props) {
  if (props.isElectron) {
    return <ElectronFilePicker 
      onSelect={props.onFileSelect}
      extensions={props.allowedExtensions}
      maxSize={props.maxFileSize}
    />;
  } else {
    // Web version doesn't have maxFileSize validation at selection time
    return <WebFilePicker 
      onSelect={props.onFileSelect}
      extensions={props.allowedExtensions}
    />;
  }
}