import { ImgHTMLAttributes, useEffect, useState } from 'react';
import { resolveImageSource } from '@/lib/storage';

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string;
}

export default function StoredImage({ src, ...props }: Props) {
  const [resolvedSrc, setResolvedSrc] = useState(src || '');

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    if (!src) {
      setResolvedSrc('');
      return;
    }

    resolveImageSource(src).then((result) => {
      if (!active) {
        if (result.startsWith('blob:')) URL.revokeObjectURL(result);
        return;
      }

      setResolvedSrc(result);
      if (result.startsWith('blob:')) objectUrl = result;
    });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (!resolvedSrc) return null;
  return <img src={resolvedSrc} {...props} />;
}
