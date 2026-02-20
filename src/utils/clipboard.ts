/**
 * Clipboard utility with fallback for environments where Clipboard API is blocked
 */

export const copyToClipboard = (text: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      // Use document.execCommand as the primary method since Clipboard API may be blocked
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        resolve(successful);
      } catch (err) {
        document.body.removeChild(textArea);
        resolve(false);
      }
    } catch (err) {
      resolve(false);
    }
  });
};
