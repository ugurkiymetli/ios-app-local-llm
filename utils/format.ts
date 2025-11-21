export const formatBytes = (bytes: number): string => {
  return (bytes / (1024 * 1024)).toFixed(1);
};

export const formatTime = (seconds: number, locale: string = 'en'): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)}${locale === 'tr' ? 's' : 's'}`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return locale === 'tr' 
      ? `${minutes}d ${secs}s` 
      : `${minutes}m ${secs}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return locale === 'tr'
      ? `${hours}sa ${minutes}d`
      : `${hours}h ${minutes}m`;
  }
};
