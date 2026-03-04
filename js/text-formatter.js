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
            let safeText = TextFormatter.escapeHtml(text);
            if (!keywords.length) return safeText;

            // let safeText = TextFormatter.escapeHtml(text);

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

    getStats: (text) => {
        if (typeof text !== 'string' || !text.trim()) {
            return { words: 0, sentences: 0, readability: 0 };
        }

        const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const avgWordLen = chars / (words || 1);
    const complexity = words > 10 || avgWordLen > 6 ? "Сложный" : "Легкий";
    
    return { chars, words, complexity };
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
        modalContent.innerHTML = '';
        let hasChanges = false;

        const myTruncate = TextFormatter.truncate(40, '...');
        const myHighlight = TextFormatter.highlightKeywords(['js', 'текст', 'реакт', 'код']);

        posts.forEach(post => {
            if (post.element.style.display === 'none') return;

            const originalText = post.content;
            const truncatedText = myTruncate(originalText);

            // Проверяем: изменился ли текст (сократился или содержит ключевые слова для подсветки)
            const isChanged = originalText !== truncatedText || /js|текст|реакт|код/i.test(originalText);

            if (isChanged) {
                hasChanges = true;
                
                const postBox = document.createElement('div');
                postBox.className = 'modal-comparison-item';
                postBox.style.cssText = 'border-bottom: 1px solid #ddd; padding-bottom: 15px; margin-bottom: 15px;';

                const title = document.createElement('h4');
                title.textContent = post.originalTitle || 'Без названия';

                const grid = document.createElement('div');
                grid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 20px;';

                // Левая часть: "До" (то, что ввел пользователь)
                const before = document.createElement('div');
                const beforeLabel = document.createElement('b');
                beforeLabel.style.color = '#e74c3c';
                beforeLabel.textContent = 'До: ';
                before.append(beforeLabel, document.createTextNode(originalText));

                // Правая часть: "После" (авто-форматирование)
                const after = document.createElement('div');
                const afterLabel = document.createElement('b');
                afterLabel.style.color = '#27ae60';
                afterLabel.textContent = 'После: ';
                
                const afterTextContainer = document.createElement('div');
                myHighlight(truncatedText, afterTextContainer); // Сначала обрезаем, потом подсвечиваем

                after.append(afterLabel, afterTextContainer);
                grid.append(before, after);
                postBox.append(title, grid);
                modalContent.append(postBox);
            }
        });

        if (!hasChanges) {
            modalContent.innerHTML = '<p style="text-align:center">Нет изменений для отображения.</p>';
        }

        modal.style.display = 'block';
        overlay.style.display = 'block';
    });

    overlay.addEventListener('click', () => {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    });
}


function debounce(func, delay = 300) {
    let timeoutId;
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
}


function initPostDetails(postsData) {
    const modal = document.getElementById('post-detail-modal');
    const overlay = document.getElementById('post-detail-overlay');
    const contentEdit = document.getElementById('detail-content-edit');
    const previewContainer = document.getElementById('detail-preview-container');
    const previewResult = document.getElementById('detail-formatted-result');

    let currentPostIndex = null;

    const postElements = document.querySelectorAll('#post-list li');
    
    postElements.forEach((el, index) => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => {
            const post = postsData[index];
            currentPostIndex = index;
            
            document.getElementById('detail-title').textContent = post.title;
            document.getElementById('stat-date').textContent = post.date;
            document.getElementById('stat-views').textContent = post.views;
            contentEdit.value = post.content;
            
            updateLiveStats(post.content);

            previewContainer.style.display = 'none';
            
            modal.style.display = 'block';
            overlay.style.display = 'block';
        });
    });

    function updateLiveStats(text) {
        const stats = TextFormatter.getStats(text);
        document.getElementById('stat-chars').textContent = stats.chars;
        document.getElementById('stat-words').textContent = stats.words;
        document.getElementById('stat-readability').textContent = stats.complexity;
    }

    contentEdit.addEventListener('input', () => {
        updateLiveStats(contentEdit.value);
    });

    document.getElementById('detail-format-btn').addEventListener('click', () => {
        const text = contentEdit.value;
        const myTruncate = TextFormatter.truncate(50, '...'); 
        const myHighlight = TextFormatter.highlightKeywords(['js', 'текст', 'реакт', 'код']);
        
        const truncated = myTruncate(text);
        const highlightedHtml = myHighlight(truncated);
        
        previewResult.innerHTML = highlightedHtml;
        previewContainer.style.display = 'block';
    });

    document.getElementById('detail-save-btn').addEventListener('click', () => {
        if (currentPostIndex !== null) {
            const newText = contentEdit.value;
            postsData[currentPostIndex].content = newText;

            const li = postElements[currentPostIndex];
            li.setAttribute('data-content', newText);
            
            alert('Изменения сохранены!');
        }
    });

    const close = () => {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    };
    
    document.getElementById('detail-close-btn').addEventListener('click', close);
    overlay.addEventListener('click', close);
}