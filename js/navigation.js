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


// function FilterPosts()
// {
//     var posts = document.querySelectorAll('ul li');
//     var inputFields = document.querySelector('input');
//     var noResultsMessage = document.getElementById('no-results');

//     var postList = [];
//     for (let i = 0; i < posts.length; i++)
//     {
//         postList.push(posts[i].innerText);
//     }

//     inputFields.addEventListener('input', function() {
//         const searchText = inputFields.value.toLowerCase(); 
//         let hasMatches = false;

//         const filteredList = postList.filter(post => {
//             return post.toLowerCase().includes(searchText);
//         });

//         posts.forEach(li => {
//             const text = li.innerText.toLowerCase();
//             if (text.includes(searchText)) {
//                 li.style.display = ""; 
//                 hasMatches = true;
//             } 
//             else {
//                 li.style.display = "none";
//             }
//         });

//         if (hasMatches) 
//         {
//             noResultsMessage.style.display = "none";
//         } 
//         else 
//         {
//             noResultsMessage.style.display = "block";
//         }
//     });
// }

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