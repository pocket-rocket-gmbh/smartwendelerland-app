export async function getBase64(file: File) {
  return new Promise(function(resolve, reject) {
    const reader = new FileReader()
    reader.onload = function() { resolve(reader.result) }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const fileToBase64 = (filePath: string) => {
  return new Promise<string>((resolve, reject) => {
    fetch(filePath)
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64String = reader.result as string;
          resolve(base64String);
        };
        reader.onerror = reject;
      })
      .catch(reject);
  });
};

export const dataURLtoFile = (dataURL: string, filename: string) => { 
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
      
  while(n--){
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], `${filename}.${mime.split("/")[1]}`, { type:mime });
}