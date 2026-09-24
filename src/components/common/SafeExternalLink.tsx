import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { isSafeUrl } from '../../lib/normalization/url';

interface SafeExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  url: string;
  children: ReactNode;
}

/**
 * Only ever renders a real, navigable `href` for http(s) URLs. A
 * `javascript:`, `data:`, or other unsafe scheme (which could slip in from
 * a crafted bookmark export) renders as inert text instead — it is never
 * put into an `href` attribute, so it cannot be triggered by click,
 * keyboard, or middle-click.
 */
export function SafeExternalLink({ url, children, className, ...rest }: SafeExternalLinkProps) {
  if (!isSafeUrl(url)) {
    return (
      <span className={className} title="This link uses an unsupported scheme and can't be opened.">
        {children}
      </span>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className} {...rest}>
      {children}
    </a>
  );
}
