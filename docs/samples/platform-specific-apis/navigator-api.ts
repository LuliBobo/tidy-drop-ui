// This will work in web but not in a standard Node.js environment
export function checkOnline(): boolean {
  return navigator.onLine;
}

export function getGeolocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    }
  });
}