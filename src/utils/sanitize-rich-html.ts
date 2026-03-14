export function sanitizeRichHtml(html: string): string {
    if (!html) {
        return '';
    }

    let sanitized = html;

    // Remove elements that can execute scripts or mutate document metadata.
    sanitized = sanitized.replace(/<\s*(script|style|iframe|object|embed|form|input|button|textarea|select|option|meta|link|base)(\b[^>]*)?>[\s\S]*?<\s*\/\s*\1\s*>/gi, '');
    sanitized = sanitized.replace(/<\s*(script|style|iframe|object|embed|form|input|button|textarea|select|option|meta|link|base)(\b[^>]*)?\/?>/gi, '');

    // Remove inline event handlers and attributes that can inject HTML documents.
    sanitized = sanitized.replace(/\s+on[a-z-]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
    sanitized = sanitized.replace(/\s+srcdoc\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');

    // Neutralize dangerous URL-based attributes.
    sanitized = sanitized.replace(/\s+(href|src|action|formaction|xlink:href|poster)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi, (_match, attr, _rawValue, doubleQuoted, singleQuoted, unquoted) => {
        const value = doubleQuoted ?? singleQuoted ?? unquoted ?? '';
        const normalizedValue = value.replace(/\s+/g, '').toLowerCase();

        if (normalizedValue.startsWith('javascript:') || normalizedValue.startsWith('data:text/html')) {
            return ` ${attr}="#"`;
        }

        return ` ${attr}="${value}"`;
    });

    return sanitized;
}
