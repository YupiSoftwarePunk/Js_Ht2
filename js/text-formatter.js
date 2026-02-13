const TextFormatter = {
    escapeHtml: (text) => {
        if (typeof text !== 'string') return '';
        const replacements = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;'
        };
        return text.replace(/[&<>"'/]/g, (match) => replacements[match]);
    },

    truncate: (maxLength, ellipsis = '...') => {
        if (typeof maxLength === 'string') {
            const text = maxLength;
            const limit = ellipsis === '...' ? 100 : ellipsis; 
            return text.length > limit ? text.substring(0, limit).trim() + '...' : text;
        }

        return (text) => {
            if (typeof text !== 'string') return '';
            return text.length > maxLength 
                ? text.substring(0, maxLength).trim() + ellipsis 
                : text;
        };
    },

    highlightKeywords: (keywords = [], className = 'highlight') => {
        return (text) => {
            if (!text) return '';
            if (!keywords.length) return TextFormatter.escapeHtml(text);

            let safeText = TextFormatter.escapeHtml(text);

            const pattern = keywords
                .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
                .join('|');
            
            const regex = new RegExp(`(${pattern})`, 'gi');

            return safeText.replace(regex, `<mark class="${className}">$1</mark>`);
        };
    },

    formatCodeBlock: (code, language = 'javascript') => {
        const safeCode = TextFormatter.escapeHtml(code);
        return `<pre class="code-block" data-lang="${language}"><code>${safeCode}</code></pre>`;
    }
};