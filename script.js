// script.js
const searchBtn = document.getElementById('search-btn');
const voiceBtn = document.getElementById('voice-search');
const searchInput = document.getElementById('search-input');
const foodGrid = document.getElementById('food-grid');
const loader = document.getElementById('loader');
const errorDiv = document.getElementById('error');
const recentSearches = document.getElementById('recent-searches');

const API = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';

function showLoader() {
  loader.classList.remove('hidden');
}

function hideLoader() {
  loader.classList.add('hidden');
}

function showError(msg = 'No food found.') {
  errorDiv.textContent = msg;
  errorDiv.classList.remove('hidden');
}

function hideError() {
  errorDiv.classList.add('hidden');
}

function addRecentSearch(query) {
  let searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
  if (!searches.includes(query)) {
    searches.unshift(query);
    if (searches.length > 5) searches.pop();
    localStorage.setItem('recentSearches', JSON.stringify(searches));
  }
  renderRecentSearches();
}

function renderRecentSearches() {
  let searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
  recentSearches.innerHTML = '<strong>Recent:</strong> ' + searches.map(s => `<span class="recent-item">${s}</span>`).join(', ');
  document.querySelectorAll('.recent-item').forEach(item => {
    item.addEventListener('click', () => {
      searchInput.value = item.textContent;
      searchFood(item.textContent);
    });
  });
}

function renderCategoryPanel(meals) {
  foodGrid.insertAdjacentHTML('beforebegin', `<div class="category-panel"><span class="label">Categories:</span> ${[...new Set(meals.map(m => m.strCategory))].map(c => `<span class="category">${c}</span>`).join(' ')}</div>`);
}


async function searchFood(query) {
  showLoader();
  hideError();
  foodGrid.innerHTML = '';
  const oldPanel = document.querySelector('.category-panel');
  if (oldPanel) oldPanel.remove();
  try {
    const res = await fetch(`${API}${query}`);
    const data = await res.json();
    if (!data.meals) throw new Error();
    renderCategoryPanel(data.meals);
    data.meals.forEach(meal => {
      const div = document.createElement('div');
      div.className = 'food-card';
      div.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
        <h4>${meal.strMeal}</h4>
        <p><strong>Category:</strong> ${meal.strCategory}</p>
        <p><strong>Area:</strong> ${meal.strArea}</p>
        <a href="${meal.strYoutube}" target="_blank">📺 Watch Recipe</a>
      `;
      foodGrid.appendChild(div);
    });
    addRecentSearch(query);
  } catch {
    showError();
  } finally {
    hideLoader();
  }
}

searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query) searchFood(query);
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const query = searchInput.value.trim();
    if (query) searchFood(query);
  }
});

voiceBtn.addEventListener('click', () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();
  recognition.onresult = function (e) {
    const voiceText = e.results[0][0].transcript;
    searchInput.value = voiceText;
    searchFood(voiceText);
  };
});

renderRecentSearches();
