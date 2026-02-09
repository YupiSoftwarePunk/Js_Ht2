function highlightActiveLink()
{
    var link = document.querySelectorAll('.nav-link');
    let currentUrl = window.location.pathname.split('/').pop() || 'index.html';

    for (var i = 0; i < link.length; i++) 
    {
        if (link[i].getAttribute('href') === currentUrl) 
        {
            link[i].classList.add('active');
        }
        else 
        {
            link[i].classList.remove('active');
        }
    }
}


function FilterPosts() {
    const inputField = document.querySelector('input');
    const noResultsMessage = document.getElementById('no-results');
    const sortSelect = document.getElementById('sort-posts');
    const list = document.getElementById('post-list');
    const blogStatsContainer = document.getElementById('blog-stats'); 
    
    const posts = Array.from(list.querySelectorAll('li')).map(li => {
        const rawContent = li.dataset.content || "";
        const stats = analyzeText(rawContent); 
        
        return {
            element: li,
            title: li.innerText,
            content: rawContent.toLowerCase(),
            tags: li.dataset.tags.toLowerCase(),
            date: new Date(li.dataset.date),
            views: parseInt(li.dataset.views),
            stats: stats 
        };
    });

    function update() {
        const searchText = inputField.value.toLowerCase();
        const sortBy = sortSelect.value;
        let hasMatches = false;

        posts.forEach(post => {
            const fullSearchText = (post.title + post.content + post.tags).toLowerCase();
            const isMatch = fullSearchText.includes(searchText);

            if (isMatch) {
                post.element.style.display = "";
                hasMatches = true;
                
                const dateInfo = getFriendlyDate(post.element.dataset.date);
                const highlightClass = (new Date(post.element.dataset.date).toDateString() === new Date().toDateString()) ? 'today-post' : '';
                
                let titleHTML = post.title;
                if (searchText !== "") {
                    const regex = new RegExp(`(${searchText})`, "gi");
                    titleHTML = post.title.replace(regex, '<mark>$1</mark>');
                }

                post.element.innerHTML = `
                    <div class="${highlightClass}">
                        <strong>${titleHTML}</strong>
                        <div class="stats" style="font-size: 0.8em; color: gray;">
                            ${dateInfo} | Читать: ${post.stats.readTime} мин. | Слов: ${post.stats.words}
                            <br>Символов: ${post.stats.chars} (без пр.: ${post.stats.charsNoSpace}) | Предл.: ${post.stats.sentences} | Сложность: ${post.stats.readability}
                        </div>
                    </div>
                `;
            } else {
                post.element.style.display = "none";
            }
        });

        const visiblePosts = posts.filter(p => p.element.style.display !== "none");
        
        if (sortBy !== "default") {
            visiblePosts.sort((a, b) => {
                return sortBy === 'date' ? b.date - a.date : b.views - a.views;
            });
            visiblePosts.forEach(post => list.appendChild(post.element));
        }

        noResultsMessage.style.display = hasMatches ? "none" : "block";
        updateBlogStats(visiblePosts);
    }

    function updateBlogStats(visiblePosts) {
        if (!blogStatsContainer) return;
        
        const totalWords = visiblePosts.reduce((acc, p) => acc + p.stats.words, 0);
        const avgReadTime = visiblePosts.length ? (totalWords / (visiblePosts.length * 200)).toFixed(1) : 0;
        
        const allTags = visiblePosts.flatMap(p => p.tags.split(',').map(t => t.trim()));
        const tagCounts = allTags.reduce((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {});
        const topTag = Object.keys(tagCounts).reduce((a, b) => tagCounts[a] > tagCounts[b] ? a : b, "—");

        blogStatsContainer.innerHTML = `
            <h3>Общая статистика:</h3>
            <p>Всего слов: ${totalWords} | Ср. время чтения: ${avgReadTime} мин.</p>
            <p>Популярный тег: ${topTag}</p>
        `;
    }

    inputField.addEventListener('input', update);
    sortSelect.addEventListener('change', update);
    update(); 
}


function getFriendlyDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 24 && diffInHours >= 0) {
        return diffInHours === 0 ? "Только что" : `${diffInHours} ч. назад`;
    } 
    else if (diffInDays === 1) {
        return "Вчера";
    } 
    else {

        return new Intl.DateTimeFormat('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    }
}


function analyzeText(text) {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const charCountWithSpace = text.length;
    const charCountNoSpace = text.replace(/\s+/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordLength = words.length ? (charCountNoSpace / words.length).toFixed(1) : 0;
    
    const longWords = words.filter(w => w.length > 6).length;
    const readability = sentences > 0 ? (words.length / sentences) + (longWords * 100 / words.length) : 0;
    const readTime = Math.ceil(words.length / 200); 

    return {
        words: words.length,
        chars: charCountWithSpace,
        charsNoSpace: charCountNoSpace,
        sentences: sentences,
        avgWord: avgWordLength,
        readability: readability.toFixed(1),
        readTime: readTime
    };
}


