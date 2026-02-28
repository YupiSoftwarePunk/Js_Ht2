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

    formatCodeBlock: (code, language = 'javascript', theme = 'dark') => {
        const pre = document.createElement('pre');
        pre.className = `code-block code-theme-${theme}`;
        pre.setAttribute('data-lang', language);
        
        const codeElement = document.createElement('code');
        codeElement.textContent = code;
        
        pre.append(codeElement);
        return pre;
    },

    HighlightTodayPosts: () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; 
        const day = now.getDate();


        const todayString = `${year}-${month}-${day}`;

        const todayPosts = document.querySelectorAll(`li[data-date="${todayString}"]`);

        if (todayPosts.length > 0) {
            todayPosts.forEach(post => {
                post.classList.add('today-post');
            });
            console.log(`Подсвечено постов за сегодня: ${todayPosts.length}`);
        } 
        else {
            console.log("Сегодняшних постов не найдено для даты: " + todayString);
        }
    },

    createSanitizer: () => {
        const allowedTags = ['B', 'I', 'U', 'P', 'BR', 'STRONG', 'EM'];
        
        return (htmlString) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, 'text/html');
            const fragment = document.createDocumentFragment();

            const sanitize = (node, target) => {
                node.childNodes.forEach(child => {
                    if (child.nodeType === Node.TEXT_NODE) {
                        target.append(document.createTextNode(child.textContent));
                    } else if (child.nodeType === Node.ELEMENT_NODE && allowedTags.includes(child.tagName)) {
                        const newElement = document.createElement(child.tagName);
                        sanitize(child, newElement);
                        target.append(newElement);
                    }
                });
            };

            sanitize(doc.body, fragment);
            return fragment; 
        };
    },

    formatAsync: async (text, formatterFunc) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const result = formatterFunc(text);
                resolve(result);
            }, 0);
        });
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
                const postBox = document.createElement('div');
                postBox.className = 'modal-comparison-item';
                postBox.style.marginBottom = '20px';

                const title = document.createElement('h4');
                title.textContent = post.originalTitle;

                const diffContainer = document.createElement('div');
                diffContainer.style.display = 'flex';
                diffContainer.style.gap = '20px';

                const before = document.createElement('div');
                before.style.color = 'red';
                const beforeLabel = document.createElement('b');
                beforeLabel.textContent = 'До: ';
                before.append(beforeLabel, document.createTextNode(post.content));

                const after = document.createElement('div');
                after.style.color = 'green';
                const afterLabel = document.createElement('b');
                afterLabel.textContent = 'После: ';
                
                const afterContent = document.createElement('span');
                const truncatedText = myTruncate(post.content);
                myHighlight(truncatedText, afterContent); 

                after.append(afterLabel, afterContent);
                diffContainer.append(before, after);
                postBox.append(title, diffContainer);
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

document.addEventListener('DOMContentLoaded', () => {
    highlightActiveLink();
    FilterPosts(); 
});


function debounce(func, delay = 300) {
    let timeoutId;
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
}