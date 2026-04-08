"use strict";

// Модуль с массивом комментариев
let comments = [
    {
        name: "Глеб Фокин",
        date: "12.02.22 12:18",
        text: "Это будет первый комментарий на этой странице",
        likes: 3,
        isLiked: false
    },
    {
        name: "Варвара Н.",
        date: "13.02.22 19:22",
        text: "Мне нравится как оформлена эта страница! ❤",
        likes: 75,
        isLiked: true
    }
];

// Модуль вспомогательных функций (replaceAll и дата)
function escapeHtml(text) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function getCurrentDateTime() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

// Модуль рендера комментариев
function renderComments() {
    let commentsHTML = "";
    
    for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];
        const likeButtonClass = comment.isLiked ? "-active-like" : "";
        const escapedName = escapeHtml(comment.name);
        const escapedText = escapeHtml(comment.text);
        
        commentsHTML += `
            <li class="comment" data-index="${i}">
                <div class="comment-header">
                    <div>${escapedName}</div>
                    <div>${comment.date}</div>
                </div>
                <div class="comment-body">
                    <div class="comment-text">
                        ${escapedText}
                    </div>
                </div>
                <div class="comment-footer">
                    <div class="likes">
                        <span class="likes-counter">${comment.likes}</span>
                        <button class="like-button ${likeButtonClass}"></button>
                    </div>
                </div>
            </li>
        `;
    }
    
    const commentsList = document.querySelector(".comments");
    commentsList.innerHTML = commentsHTML;
}

// Модуль обработчиков событий
function handleLikeClick(event) {
    event.stopPropagation();
    const button = event.target;
    const li = button.closest(".comment");
    const index = parseInt(li.getAttribute("data-index"));
    
    if (comments[index].isLiked) {
        comments[index].likes--;
        comments[index].isLiked = false;
    } else {
        comments[index].likes++;
        comments[index].isLiked = true;
    }
    
    renderComments();
}

function handleCommentClick(event) {
    const li = event.target.closest(".comment");
    if (!li) return;
    
    const index = parseInt(li.getAttribute("data-index"));
    const comment = comments[index];
    const commentInput = document.getElementById("comments");
    
    const quotedText = `> ${comment.name}: ${comment.text}\n\n`;
    const currentText = commentInput.value;
    
    commentInput.value = quotedText + currentText;
    commentInput.focus();
}

function handleAddComment() {
    const nameInput = document.getElementById("name");
    const commentInput = document.getElementById("comments");
    
    let name = nameInput.value;
    let commentText = commentInput.value;
    
    if (name.trim() === "" || commentText.trim() === "") {
        return;
    }
    
    name = escapeHtml(name);
    commentText = escapeHtml(commentText);
    
    const newComment = {
        name: name,
        date: getCurrentDateTime(),
        text: commentText,
        likes: 0,
        isLiked: false
    };
    
    comments.push(newComment);
    
    nameInput.value = "";
    commentInput.value = "";
    
    renderComments();
}

// Инициализация (точка входа)
function init() {
    const nameInput = document.getElementById("name");
    const commentInput = document.getElementById("comments");
    const addButton = document.querySelector(".add-form-button");
    const commentsList = document.querySelector(".comments");
    
    nameInput.addEventListener("input", () => {
        console.log("Имя изменено");
    });
    
    commentInput.addEventListener("input", () => {
        console.log("Комментарий изменен");
    });
    
    addButton.addEventListener("click", handleAddComment);
    
    commentsList.addEventListener("click", (event) => {
        if (event.target.classList.contains("like-button")) {
            handleLikeClick(event);
        } else {
            handleCommentClick(event);
        }
    });
    
    renderComments();
    console.log("It works!");
}