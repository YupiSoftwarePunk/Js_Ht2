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


function initFormatting(posts) {
    const btn = document.getElementById('format-posts-btn');
    const modal = document.getElementById('format-modal');
    const overlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');

    if (!btn || !modal) return;

    btn.addEventListener('click', () => {
        while (modalContent.firstChild) {
            modalContent.removeChild(modalContent.firstChild);
        }

        const myTruncate = TextFormatter.truncate(40, '...'); 
        const myHighlight = TextFormatter.highlightKeywords(['js', 'текст', 'реакт']);

        posts.forEach(post => {
            if (post.element.style.display !== 'none') {
                const originalText = post.content;
                const formattedHtml = myHighlight(myTruncate(originalText));

                const postBox = document.createElement('div');
                postBox.className = 'modal-comparison-item';
                postBox.style.marginBottom = '20px';

                const title = document.createElement('h4');
                title.textContent = post.originalTitle;

                const diffContainer = document.createElement('div');
                diffContainer.style.display = 'flex';
                diffContainer.style.gap = '10px';

                const before = document.createElement('div');
                before.style.color = 'red';
                const beforeLabel = document.createElement('b');
                beforeLabel.textContent = 'До: ';
                before.append(beforeLabel, document.createTextNode(originalText));

                const after = document.createElement('div');
                after.style.color = 'green';
                const afterLabel = document.createElement('b');
                afterLabel.textContent = 'После: ';
                after.append(afterLabel);

                const afterSpan = document.createElement('span');
                afterSpan.innerHTML = formattedHtml; 
                after.append(afterSpan);

                postBox.append(title, before, after);
                modalContent.append(postBox);
            }
        });

        modal.style.display = 'block';
        overlay.style.display = 'block';
    });

    overlay.addEventListener('click', () => {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    });
}