"use strict";

const personalKey = "xiloeiwqq";
const apiUrl = `https://wedev-api.sky.pro/api/v2/${personalKey}/comments`;
const loginApiUrl = "https://wedev-api.sky.pro/api/user/login";
const TOKEN_KEY = "userToken";
const USER_KEY = "userData";

const pageMain = document.getElementById("page-main");
const pageLogin = document.getElementById("page-login");
const userInfoEl = document.getElementById("user-info");
const authActionsEl = document.getElementById("auth-actions");
const addFormEl = document.getElementById("add-form");
const authPromptEl = document.getElementById("auth-prompt");
const goToLoginBtn = document.getElementById("go-to-login");
const backToMainBtn = document.getElementById("back-to-main");
const loginInput = document.getElementById("login-input");
const passwordInput = document.getElementById("password-input");
const loginButton = document.getElementById("login-button");
const commentInput = document.getElementById("comment-input");
const addButton = document.querySelector(".add-form-button");
const commentsList = document.querySelector(".comments");

let formData = {
  comment: "",
};

const getToken = () => localStorage.getItem(TOKEN_KEY);

const getUser = () => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

const setAuth = (user) => {
  localStorage.setItem(TOKEN_KEY, user.token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const isAuthorized = () => Boolean(getToken());

const getAuthHeaders = () => {
  const token = getToken();
  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

const showPage = (pageName) => {
  pageMain.classList.toggle("hidden", pageName !== "main");
  pageLogin.classList.toggle("hidden", pageName !== "login");
};

const renderAuthUI = () => {
  const user = getUser();

  if (isAuthorized() && user) {
    userInfoEl.textContent = user.name;
    authActionsEl.innerHTML =
      '<button class="app-header__button" id="logout-button">Выйти</button>';
    addFormEl.classList.remove("hidden");
    authPromptEl.classList.add("hidden");

    document.getElementById("logout-button").addEventListener("click", () => {
      clearAuth();
      renderAuthUI();
      fetchComments();
    });
  } else {
    userInfoEl.textContent = "Гость";
    authActionsEl.innerHTML =
      '<button class="app-header__button" id="header-login-button">Войти</button>';
    addFormEl.classList.add("hidden");
    authPromptEl.classList.remove("hidden");

    document
      .getElementById("header-login-button")
      .addEventListener("click", () => {
        showPage("login");
      });
  }
};

commentInput.addEventListener("input", () => {
  formData.comment = commentInput.value;
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} ${hours}:${minutes}`;
};

const renderComment = (comment) => {
  const likeButtonClass = comment.isLiked
    ? "like-button -active-like"
    : "like-button";

  return `
    <li class="comment">
      <div class="comment-header">
        <div>${comment.author.name}</div>
        <div>${formatDate(comment.date)}</div>
      </div>
      <div class="comment-body">
        <div class="comment-text">
          ${comment.text}
        </div>
      </div>
      <div class="comment-footer">
        <div class="likes">
          <span class="likes-counter">${comment.likes}</span>
          <button class="${likeButtonClass}"></button>
        </div>
      </div>
    </li>
  `;
};

const getComments = () => {
  return fetch(apiUrl, {
    headers: getAuthHeaders(),
  })
    .then((response) => {
      if (response.status === 500) {
        return Promise.reject(
          new Error("Ошибка сервера при загрузке комментариев"),
        );
      }
      return response.json();
    })
    .then((data) => data.comments)
    .catch((error) => {
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        return Promise.reject(
          new Error("Пропал интернет. Не удалось загрузить комментарии"),
        );
      }
      return Promise.reject(error);
    });
};

const renderComments = (comments) => {
  commentsList.innerHTML = comments
    .map((comment) => renderComment(comment))
    .join("");
  commentInput.value = formData.comment;
};

const fetchComments = () => {
  return getComments()
    .then((comments) => {
      renderComments(comments);
    })
    .catch((error) => {
      alert(error.message || "Не удалось загрузить комментарии");
    });
};

const addComment = (text) => {
  const parseResponse = (response) =>
    response.json().then((body) => ({ response, body }));

  return fetch(apiUrl, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ text }),
  })
    .then(parseResponse)
    .then(({ response, body }) => {
      if (response.status === 201) {
        commentInput.value = "";
        formData.comment = "";
        return fetchComments();
      }

      if (response.status === 401) {
        clearAuth();
        renderAuthUI();
        return Promise.reject(
          new Error("Необходима авторизация для добавления комментария"),
        );
      }

      if (response.status === 400) {
        return Promise.reject(
          new Error(body.error || "Ошибка валидации: проверьте введенные данные"),
        );
      }

      if (response.status === 500) {
        return Promise.reject(
          new Error("Ошибка сервера при добавлении комментария"),
        );
      }

      return Promise.reject(
        new Error(body.error || "Не удалось добавить комментарий"),
      );
    })
    .catch((error) => {
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        alert("Пропал интернет. Не удалось добавить комментарий");
        return;
      }

      if (error.message) {
        alert(error.message);
        return;
      }

      alert("Не удалось добавить комментарий");
    });
};

const login = (loginValue, password) => {
  const parseResponse = (response) =>
    response.json().then((body) => ({ response, body }));

  return fetch(loginApiUrl, {
    method: "POST",
    body: JSON.stringify({
      login: loginValue,
      password,
    }),
  })
    .then(parseResponse)
    .then(({ response, body }) => {
      if (response.status === 201) {
        setAuth(body.user);
        loginInput.value = "";
        passwordInput.value = "";
        renderAuthUI();
        showPage("main");
        return fetchComments();
      }

      if (response.status === 400) {
        return Promise.reject(
          new Error("Неверный логин или пароль"),
        );
      }

      if (response.status === 500) {
        return Promise.reject(new Error("Ошибка сервера при авторизации"));
      }

      return Promise.reject(new Error("Не удалось авторизоваться"));
    })
    .catch((error) => {
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        alert("Пропал интернет. Не удалось авторизоваться");
        return;
      }

      if (error.message) {
        alert(error.message);
        return;
      }

      alert("Не удалось авторизоваться");
    });
};

commentsList.addEventListener("click", (event) => {
  const likeButton = event.target.closest(".like-button");
  if (!likeButton) {
    return;
  }

  const likesCounter = likeButton
    .closest(".likes")
    .querySelector(".likes-counter");

  if (likeButton.classList.contains("-active-like")) {
    likeButton.classList.remove("-active-like");
    likesCounter.textContent = Number(likesCounter.textContent) - 1;
  } else {
    likeButton.classList.add("-active-like");
    likesCounter.textContent = Number(likesCounter.textContent) + 1;
  }
});

addButton.addEventListener("click", () => {
  if (!isAuthorized()) {
    showPage("login");
    return;
  }

  const commentText = commentInput.value.trim();

  if (commentText.length < 3) {
    alert("Комментарий должен содержать не менее 3 символов");
    return;
  }

  addButton.disabled = true;
  addButton.textContent = "Загрузка...";

  addComment(commentText).finally(() => {
    addButton.disabled = false;
    addButton.textContent = "Написать";
  });
});

goToLoginBtn.addEventListener("click", () => {
  showPage("login");
});

backToMainBtn.addEventListener("click", () => {
  showPage("main");
});

loginButton.addEventListener("click", () => {
  const loginValue = loginInput.value.trim();
  const password = passwordInput.value.trim();

  if (!loginValue || !password) {
    alert("Введите логин и пароль");
    return;
  }

  loginButton.disabled = true;
  loginButton.textContent = "Загрузка...";

  login(loginValue, password).finally(() => {
    loginButton.disabled = false;
    loginButton.textContent = "Войти";
  });
});

renderAuthUI();
fetchComments();
