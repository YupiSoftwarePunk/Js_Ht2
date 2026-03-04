console.log("Сайт загружен");

var links = document.querySelectorAll('.nav-link');

for (var i = 0; i < links.length; i++) 
{
    links[i].addEventListener('click', function (event) 
    {
        event.preventDefault();

        console.log(this.textContent.trim());

        var clickedLink = this;

        setTimeout(function () 
        {
            window.location.href = clickedLink.href; 
        }, 1000);
    });
}

function CreatePosts(data)
{
    let posts = document.querySelector('#post-list');

    if (!posts)
    {
        return;
    }

    let newItem = document.createElement('li');
    newItem.setAttribute('data-date', data.date);
    newItem.setAttribute('data-views', data.views);
    newItem.setAttribute('data-tags', data.tags);
    newItem.setAttribute('data-content', data.content);

    let span = document.createElement('span');
    span.classList.add('post-title');
    span.textContent = data.title;

    let div = document.createElement('div');
    div.classList.add('post-stats-node');
    div.style.fontSize = '0.8em';
    div.style.color = 'gray';

    let spanDate = document.createElement('span');
    spanDate.classList.add('stats-date');
    
    let spanReadTime = document.createElement('span');
    spanReadTime.classList.add('stats-read-time');
    
    let spanDetails = document.createElement('span');
    spanDetails.classList.add('stats-details');

    div.append(spanDate, " | ", spanReadTime, " | ", spanDetails);
    newItem.append(span, div);
    
    posts.appendChild(newItem);
}

window.onload = function () 
{
    var header = document.querySelector('header');
    header.style.backgroundColor = 'lightblue';

    var footer = document.querySelector('footer');
    var date = new Date();

    var day = String(date.getDate()).padStart(2, '0'); 
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var year = date.getFullYear();

    var formattedDate = day + '.' + month + '.' + year;
    footer.textContent = "© 2026 Мистер Денискис. Все права защищены. Текущая дата: " + formattedDate;

    highlightActiveLink();

    FilterPosts();

    setTimeout(() => {
        if (typeof TextFormatter !== 'undefined' && TextFormatter.HighlightTodayPosts) {
            TextFormatter.HighlightTodayPosts();
        } else {
            console.error("Критическая ошибка: TextFormatter не определен!");
        }
    }, 100);
};


const postsData = [
{ date: "2023-10-01", views: "150", tags: "js, frontend", content: "Текст о формах", title: "Пост 1" },
{ date: "2024-01-15", views: "500", tags: "html, css", content: "Текст о верстке", title: "Пост 2" },
{ date: "2023-12-20", views: "50", tags: "life, blog", content: "Мои мысли сегодня", title: "Пост 3" },
{ date: "2024-02-01", views: "300", tags: "js, react", content: "Текст про реакт", title: "Пост 4" },
{ date: "2023-05-10", views: "1000", tags: "news", content: "Важное объявление", title: "Пост 5" },
{ date: "2026-2-26", views: "50", tags: "life, blog", content: "Мои мысли сегодня", title: "Пост 6" },
{ date: "2026-3-4", views: "50", tags: "life, blog", content: "Классный текст, ваще все круто", title: "Пост 7" }];
    
postsData.forEach(post => CreatePosts(post));

document.addEventListener('DOMContentLoaded', () => {
    if (typeof postsData !== 'undefined') {
        postsData.forEach(post => CreatePosts(post));
    }

    const postsInDom = document.querySelectorAll('#post-list li');
    
    const formattedPostsArray = Array.from(postsInDom).map(li => {
        return {
            element: li,
            originalTitle: li.querySelector('.post-title')?.textContent || "Без названия",
            content: li.getAttribute('data-content') || ""
        };
    });
});
setTimeout(() => {
        initPostDetails(postsData);
    }, 200);