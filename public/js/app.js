// BookShelf Frontend Application Logic
const API_URL = '/api/books';

// Application State
let allBooks = [];
let currentCategory = '';
let currentSearch = '';
let viewMode = 'grid'; // 'grid' | 'table'
let pendingDeleteId = null;

// DOM Elements
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const booksGrid = document.getElementById('booksGrid');
const booksTableWrapper = document.getElementById('booksTableWrapper');
const booksTableBody = document.getElementById('booksTableBody');

// Metrics Elements
const statTotalBooks = document.getElementById('statTotalBooks');
const statTotalStock = document.getElementById('statTotalStock');
const statTotalValue = document.getElementById('statTotalValue');
const statCategories = document.getElementById('statCategories');

// Filter & Search Elements
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const refreshBtn = document.getElementById('refreshBtn');
const refreshIcon = document.getElementById('refreshIcon');
const viewGridBtn = document.getElementById('viewGridBtn');
const viewTableBtn = document.getElementById('viewTableBtn');

// Modal Elements
const bookModal = document.getElementById('bookModal');
const modalTitle = document.getElementById('modalTitle');
const bookForm = document.getElementById('bookForm');
const bookIdInput = document.getElementById('bookId');
const formTitle = document.getElementById('formTitle');
const formAuthor = document.getElementById('formAuthor');
const formCategory = document.getElementById('formCategory');
const formPrice = document.getElementById('formPrice');
const formQuantity = document.getElementById('formQuantity');
const saveBookBtn = document.getElementById('saveBookBtn');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const emptyAddBtn = document.getElementById('emptyAddBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const modalBackdrop = document.getElementById('modalBackdrop');

// Delete Modal Elements
const deleteModal = document.getElementById('deleteModal');
const deleteBookTitle = document.getElementById('deleteBookTitle');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const toastContainer = document.getElementById('toastContainer');

// --- Toast Notifications ---
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-emerald-600' : 'bg-rose-600';
  const icon = isSuccess
    ? `<svg class="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`
    : `<svg class="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;

  toast.className = `${bgColor} text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-medium animate-fade-in pointer-events-auto transition-all duration-300`;
  toast.innerHTML = `
    ${icon}
    <span class="flex-1">${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-4');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// --- Category Badge Style Helper ---
function getCategoryClass(category) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('tech') || cat.includes('software') || cat.includes('computer')) return 'badge-tech';
  if (cat.includes('fiction') || cat.includes('novel')) return 'badge-fiction';
  if (cat.includes('science')) return 'badge-science';
  if (cat.includes('business') || cat.includes('finance')) return 'badge-business';
  return 'badge-default';
}

// --- Fetch & Load Books ---
async function fetchBooks() {
  setLoading(true);
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const result = await res.json();
    allBooks = result.data || [];

    updateMetrics(allBooks);
    populateCategoryFilter(allBooks);
    renderBooks();
  } catch (error) {
    console.error('Fetch error:', error);
    showToast('Failed to load books from database', 'error');
  } finally {
    setLoading(false);
  }
}

// --- UI Loading State ---
function setLoading(isLoading) {
  if (isLoading) {
    loadingState.classList.remove('hidden');
    booksGrid.classList.add('hidden');
    booksTableWrapper.classList.add('hidden');
    emptyState.classList.add('hidden');
    refreshIcon.classList.add('animate-spin');
  } else {
    loadingState.classList.add('hidden');
    refreshIcon.classList.remove('animate-spin');
  }
}

// --- Update Stats / Metrics ---
function updateMetrics(books) {
  const totalBooks = books.length;
  const totalStock = books.reduce((acc, b) => acc + (Number(b.quantity) || 0), 0);
  const totalValue = books.reduce((acc, b) => acc + ((Number(b.price) || 0) * (Number(b.quantity) || 0)), 0);
  const uniqueCategories = new Set(books.map(b => (b.category || '').trim()).filter(Boolean)).size;

  statTotalBooks.textContent = totalBooks.toLocaleString();
  statTotalStock.textContent = totalStock.toLocaleString();
  statTotalValue.textContent = `₹${totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  statCategories.textContent = uniqueCategories;
}

// --- Populate Category Dropdown ---
function populateCategoryFilter(books) {
  const currentVal = categoryFilter.value;
  const categories = [...new Set(books.map(b => (b.category || '').trim()).filter(Boolean))].sort();

  categoryFilter.innerHTML = '<option value="">All Categories</option>';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (cat === currentVal) opt.selected = true;
    categoryFilter.appendChild(opt);
  });
}

// --- Filtered Books Calculation ---
function getFilteredBooks() {
  return allBooks.filter(book => {
    const matchesCategory = !currentCategory || (book.category || '').toLowerCase() === currentCategory.toLowerCase();
    const query = currentSearch.toLowerCase().trim();
    const matchesSearch = !query || 
      (book.title && book.title.toLowerCase().includes(query)) ||
      (book.author && book.author.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });
}

// --- Render Books ---
function renderBooks() {
  const filtered = getFilteredBooks();

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    booksGrid.classList.add('hidden');
    booksTableWrapper.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  if (viewMode === 'grid') {
    renderGrid(filtered);
    booksGrid.classList.remove('hidden');
    booksTableWrapper.classList.add('hidden');
  } else {
    renderTable(filtered);
    booksTableWrapper.classList.remove('hidden');
    booksGrid.classList.add('hidden');
  }
}

// --- Render Cards Grid ---
function renderGrid(books) {
  booksGrid.innerHTML = books.map(book => {
    const catClass = getCategoryClass(book.category);
    const inStock = book.quantity > 0;
    const stockBadge = inStock
      ? `<span class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
           <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ${book.quantity} in stock
         </span>`
      : `<span class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
           <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Out of stock
         </span>`;

    return `
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden flex flex-col justify-between group">
        <div class="book-stripe"></div>
        <div class="p-5 flex-1 flex flex-col">
          <div class="flex items-start justify-between gap-2 mb-2">
            <span class="text-xs font-semibold px-2.5 py-1 rounded-lg ${catClass}">
              ${escapeHtml(book.category)}
            </span>
            ${stockBadge}
          </div>

          <h4 class="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 mt-1">
            ${escapeHtml(book.title)}
          </h4>
          <p class="text-xs font-medium text-slate-500 mt-1">
            by <span class="text-slate-700 font-semibold">${escapeHtml(book.author)}</span>
          </p>

          <div class="mt-auto pt-4 flex items-baseline justify-between border-t border-slate-100">
            <div>
              <span class="text-xs text-slate-400 font-medium">Price</span>
              <p class="text-xl font-extrabold text-slate-900">₹${Number(book.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div class="flex items-center gap-1">
              <button 
                onclick="openEditModal('${book._id}')" 
                title="Edit Book"
                class="p-2 rounded-xl text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button 
                onclick="openDeleteModal('${book._id}', '${escapeHtml(book.title)}')" 
                title="Delete Book"
                class="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// --- Render Table ---
function renderTable(books) {
  booksTableBody.innerHTML = books.map(book => {
    const catClass = getCategoryClass(book.category);
    return `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="px-6 py-4">
          <div class="font-bold text-slate-900">${escapeHtml(book.title)}</div>
          <div class="text-xs text-slate-500">by ${escapeHtml(book.author)}</div>
        </td>
        <td class="px-6 py-4">
          <span class="text-xs font-semibold px-2.5 py-1 rounded-lg ${catClass}">
            ${escapeHtml(book.category)}
          </span>
        </td>
        <td class="px-6 py-4 font-bold text-slate-900">
          ₹${Number(book.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
        <td class="px-6 py-4">
          <span class="text-xs font-semibold ${book.quantity > 0 ? 'text-emerald-700' : 'text-rose-700'}">
            ${book.quantity} copies
          </span>
        </td>
        <td class="px-6 py-4 text-right">
          <div class="inline-flex items-center gap-1">
            <button 
              onclick="openEditModal('${book._id}')" 
              class="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50"
              title="Edit"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </button>
            <button 
              onclick="openDeleteModal('${book._id}', '${escapeHtml(book.title)}')" 
              class="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
              title="Delete"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// --- Escape HTML to prevent XSS ---
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --- Modal Handlers ---
function openAddModal() {
  bookForm.reset();
  bookIdInput.value = '';
  modalTitle.textContent = 'Add New Book';
  saveBookBtn.textContent = 'Add Book';
  bookModal.classList.remove('hidden');
  formTitle.focus();
}

function openEditModal(id) {
  const book = allBooks.find(b => b._id === id);
  if (!book) return;

  bookIdInput.value = book._id;
  formTitle.value = book.title || '';
  formAuthor.value = book.author || '';
  formCategory.value = book.category || '';
  formPrice.value = book.price !== undefined ? book.price : '';
  formQuantity.value = book.quantity !== undefined ? book.quantity : '';

  modalTitle.textContent = 'Edit Book Details';
  saveBookBtn.textContent = 'Save Changes';
  bookModal.classList.remove('hidden');
  formTitle.focus();
}

function closeModal() {
  bookModal.classList.add('hidden');
  bookForm.reset();
  bookIdInput.value = '';
}

// --- Form Submit (POST or PUT) ---
bookForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = bookIdInput.value;
  const isEdit = Boolean(id);

  const payload = {
    title: formTitle.value.trim(),
    author: formAuthor.value.trim(),
    category: formCategory.value.trim(),
    price: parseFloat(formPrice.value),
    quantity: parseInt(formQuantity.value, 10)
  };

  saveBookBtn.disabled = true;
  saveBookBtn.textContent = 'Saving...';

  try {
    const url = isEdit ? `${API_URL}/${id}` : API_URL;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Error saving book');
    }

    showToast(isEdit ? 'Book updated successfully!' : 'Book added successfully!');
    closeModal();
    fetchBooks();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    saveBookBtn.disabled = false;
    saveBookBtn.textContent = isEdit ? 'Save Changes' : 'Add Book';
  }
});

// --- Delete Modal Handlers ---
function openDeleteModal(id, title) {
  pendingDeleteId = id;
  deleteBookTitle.textContent = `Are you sure you want to remove "${title}"?`;
  deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
  deleteModal.classList.add('hidden');
  pendingDeleteId = null;
}

confirmDeleteBtn.addEventListener('click', async () => {
  if (!pendingDeleteId) return;

  confirmDeleteBtn.disabled = true;
  confirmDeleteBtn.textContent = 'Deleting...';

  try {
    const res = await fetch(`${API_URL}/${pendingDeleteId}`, { method: 'DELETE' });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Failed to delete');

    showToast('Book removed successfully!');
    closeDeleteModal();
    fetchBooks();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.textContent = 'Delete';
  }
});

// --- Search & Filter Event Listeners ---
searchInput.addEventListener('input', (e) => {
  currentSearch = e.target.value;
  renderBooks();
});

categoryFilter.addEventListener('change', (e) => {
  currentCategory = e.target.value;
  renderBooks();
});

refreshBtn.addEventListener('click', () => {
  fetchBooks();
});

// --- View Switcher ---
viewGridBtn.addEventListener('click', () => {
  viewMode = 'grid';
  viewGridBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-800 shadow-sm transition-all';
  viewTableBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all';
  renderBooks();
});

viewTableBtn.addEventListener('click', () => {
  viewMode = 'table';
  viewTableBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-800 shadow-sm transition-all';
  viewGridBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all';
  renderBooks();
});

// --- Modal Trigger Events ---
openAddModalBtn.addEventListener('click', openAddModal);
emptyAddBtn.addEventListener('click', openAddModal);
closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);
cancelDeleteBtn.addEventListener('click', closeDeleteModal);

// Expose openEditModal and openDeleteModal to window for inline onclick attributes
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;

// Initial Load
fetchBooks();

