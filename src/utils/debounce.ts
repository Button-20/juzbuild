export function debounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
) {
  let timeout: number;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => callback(...args), delay);
  };
}
