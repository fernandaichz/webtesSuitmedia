const cardContainer = document.getElementById('card-container');
const metaInfo = document.getElementById('meta-info');
const pageSizeSelect = document.getElementById('page-size');
const sortSelect = document.getElementById('sort');
const pagination = document.getElementById('pagination');
const API_URL = 'https://suitmedia-backend.suitdev.com/api/ideas';

let currentPage = 1;
let totalItems = 100; // fallback
let totalPages = 10;

function loadArticles() {
  const pageSize = parseInt(pageSizeSelect.value);
  const sort = sortSelect.value;

  fetch(`${API_URL}?page[number]=${currentPage}&page[size]=${pageSize}&append[]=small_image&append[]=medium_image&sort=${sort}`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then(data => {
      const articles = data.data;
      totalItems = data.meta.total || 100;
      totalPages = Math.ceil(totalItems / pageSize);
      renderArticles(articles);
      renderPagination();
      metaInfo.textContent = `Showing ${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, totalItems)} of ${totalItems}`;
    })
    .catch(err => {
      console.error('API failed, fallback to demoData():', err);
      const articles = demoData();
      totalItems = 100;
      totalPages = Math.ceil(totalItems / pageSize);
      renderArticles(articles);
      renderPagination();
      metaInfo.textContent = `Showing ${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, totalItems)} of ${totalItems}`;
    });
}


function renderArticles(articles) {
  cardContainer.innerHTML = '';
  articles.forEach(article => {
    const imageUrl = article.small_image?.url || 'https://placehold.co/300x200?text=No+Image';
    const title = article.title || 'No Title';
    const published = article.published_at?.split('T')[0] || 'Unknown';

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${imageUrl}" alt="${title}" loading="lazy">
      <h4>${title}</h4>
      <p>${published}</p>
    `;
    cardContainer.appendChild(card);
  });
}


function renderPagination() {
  pagination.innerHTML = '';

  const createButton = (text, page, disabled = false, active = false) => {
    const btn = document.createElement('button');
    btn.textContent = text;
    if (disabled) btn.disabled = true;
    if (active) btn.classList.add('active');
    btn.addEventListener('click', () => {
      currentPage = page;
      loadArticles();
    });
    return btn;
  };

  const addDots = () => {
    const span = document.createElement('span');
    span.textContent = '...';
    pagination.appendChild(span);
  };

  // First & Prev
  pagination.appendChild(createButton('«', 1, currentPage === 1));
  pagination.appendChild(createButton('‹', currentPage - 1, currentPage === 1));

  // Page numbers
  let start = Math.max(1, currentPage - 1);
  let end = Math.min(totalPages, currentPage + 1);

  if (currentPage > 2) {
    pagination.appendChild(createButton('1', 1));
    if (start > 2) addDots();
  }

  for (let i = start; i <= end; i++) {
    pagination.appendChild(createButton(i, i, false, i === currentPage));
  }

  if (currentPage < totalPages - 1) {
    if (end < totalPages - 1) addDots();
    pagination.appendChild(createButton(totalPages, totalPages));
  }

  // Next & Last
  pagination.appendChild(createButton('›', currentPage + 1, currentPage === totalPages));
  pagination.appendChild(createButton('»', totalPages, currentPage === totalPages));
}

function demoData() {
  const pageSize = parseInt(pageSizeSelect.value);
  return Array(pageSize).fill(0).map((_, i) => ({
    small_image: `https://placekitten.com/300/200?${i + (currentPage - 1) * pageSize}`,
    title: `Demo Article ${i + 1 + (currentPage - 1) * pageSize}`,
    published_at: "2022-09-05"
  }));
}

// Event Listeners
pageSizeSelect.addEventListener('change', () => {
  currentPage = 1;
  loadArticles();
});
sortSelect.addEventListener('change', () => {
  currentPage = 1;
  loadArticles();
});

// Load on first render
loadArticles();
