function highlightActiveLink()
{
    var link = document.querySelectorAll('.nav-link');
    var currentUrl = window.location.href;

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
    
    const posts = Array.from(list.querySelectorAll('li')).map(li => ({
        element: li,
        title: li.innerText,
        content: li.dataset.content.toLowerCase(),
        tags: li.dataset.tags.toLowerCase(),
        date: new Date(li.dataset.date),
        views: parseInt(li.dataset.views)
    }));

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
                
                if (searchText !== "") {
                    const regex = new RegExp(`(${searchText})`, "gi");
                    post.element.innerHTML = post.title.replace(regex, '<mark>$1</mark>');
                } else {
                    post.element.innerText = post.title;
                }
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
    }

    inputField.addEventListener('input', update);
    sortSelect.addEventListener('change', update);
}


function getFriendlyDate(dateStr) 
{
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 86400 && diffInSeconds >= 0) 
    {
        const hours = Math.floor(diffInSeconds / 3600);
        return hours === 0 ? "Только что" : `${hours} часа(ов) назад`;
    } 
    else if (diffInSeconds < 172800 && diffInSeconds >= 0) 
    {
        return "Вчера";
    } 
    else 
    {
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    }
}