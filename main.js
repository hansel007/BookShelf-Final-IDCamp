document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('bookForm');
  submitForm.addEventListener('submit', function (e) {
    e.preventDefault();
    addBook();
    e.target.reset();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

const books = [];
const RENDER_EVENT = 'render_books';
const SAVED_EVENT = 'saved_books';
const STORAGE_KEY = 'book_shelf';

function addBook() {
  const judul_buku = document.getElementById('bookFormTitle').value;
  const penulis_buku = document.getElementById('bookFormAuthor').value;
  const tahun_rilis_buku = document.getElementById('bookFormYear').value;
  const isCompleted = document.getElementById('bookFormIsComplete').checked;

  function generateBookObject(ID_buku, judul_buku, penulis_buku, tahun_rilis_buku, isCompleted) {
    return {
      ID_buku,
      judul_buku,
      penulis_buku,
      tahun_rilis_buku,
      isCompleted,
    };
  }
  const generatedID = generateID();

  function generateID() {
    return +new Date().getTime();
  }

  const bookObject = generateBookObject(generatedID, judul_buku, penulis_buku, tahun_rilis_buku, isCompleted);
  books.push(bookObject);

  document.dispatchEvent(new CustomEvent(RENDER_EVENT));
  saveData();
}

document.addEventListener(RENDER_EVENT, function () {
  const incompletedBookList = document.getElementById('incompleteBookList');
  incompletedBookList.innerHTML = '';

  const completedBookList = document.getElementById('completeBookList');
  completedBookList.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      incompletedBookList.append(bookElement);
    } else {
      completedBookList.append(bookElement);
    }
  }
});

function makeBook(bookObject) {
  const bookTitle = document.createElement('h3');
  bookTitle.innerText = bookObject.judul_buku;
  bookTitle.setAttribute('data-testid', 'bookItemTitle');

  const bookAuthor = document.createElement('p');
  bookAuthor.innerText = 'Penulis: ' + bookObject.penulis_buku;
  bookAuthor.setAttribute('data-testid', 'bookItemAuthor');

  const bookYear = document.createElement('p');
  bookYear.innerText = 'Tahun: ' + bookObject.tahun_rilis_buku;
  bookYear.setAttribute('data-testid', 'bookItemYear');

  const buttonContainer = document.createElement('div');
  if (bookObject.isCompleted) {
    const undoButton = document.createElement('button');
    undoButton.innerText = 'Ulang';
    undoButton.setAttribute('data-testid', 'bookItemEditButton');

    undoButton.addEventListener('click', function () {
      undoTaskFromCompleted(bookObject.ID_buku);
    });

    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Hapus';
    deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');

    deleteButton.addEventListener('click', function () {
      removeTaskFromCompleted(bookObject.ID_buku);
    });

    buttonContainer.append(undoButton, deleteButton);
  } else {
    const doneButton = document.createElement('button');
    doneButton.innerText = 'Selesai';
    doneButton.setAttribute('data-testid', 'bookItemIsCompleteButton');

    doneButton.addEventListener('click', function () {
      addTaskToCompleted(bookObject.ID_buku);
    });

    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Hapus';
    deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');

    deleteButton.addEventListener('click', function () {
      removeTaskFromCompleted(bookObject.ID_buku);
    });
    buttonContainer.append(doneButton, deleteButton);
  }
  const container = document.createElement('div');
  container.setAttribute('data-bookid', bookObject.ID_buku);
  container.setAttribute('data-testid', 'bookItem');
  container.append(bookTitle, bookAuthor, bookYear, buttonContainer);
  return container;
}

function addTaskToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new CustomEvent(RENDER_EVENT));
  saveData();
}

function undoTaskFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new CustomEvent(RENDER_EVENT));
  saveData();
}

function removeTaskFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new CustomEvent(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.ID_buku === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].ID_buku === bookId) {
      return index;
    }
  }
  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new CustomEvent(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new CustomEvent(RENDER_EVENT));
}

document.addEventListener(SAVED_EVENT, function () {
  alert('Data tersimpan');
});

document.getElementById('searchBook').addEventListener('submit', function (e) {
  e.preventDefault();
  const searchQuery = document.getElementById('searchBookTitle').value.trim().toLowerCase();
  const incompletedBookList = document.getElementById('incompleteBookList');
  const completedBookList = document.getElementById('completeBookList');

  Array.from(incompletedBookList.children).forEach((book) => {
    const bookTitle = book.querySelector('h3').innerText.toLowerCase();
    if (!bookTitle.includes(searchQuery)) {
      book.style.display = 'none';
    } else {
      book.style.display = 'block';
    }
  });
  Array.from(completedBookList.children).forEach((book) => {
    const bookTitle = book.querySelector('h3').innerText.toLowerCase();
    if (!bookTitle.includes(searchQuery)) {
      book.style.display = 'none';
    } else {
      book.style.display = 'block';
    }
  });
});

document.getElementById('searchBook').addEventListener('reset', function () {
  const incompletedBookList = document.getElementById('incompleteBookList');
  const completedBookList = document.getElementById('completeBookList');

  Array.from(incompletedBookList.children).forEach((book) => {
    book.style.display = 'block';
  });
  Array.from(completedBookList.children).forEach((book) => {
    book.style.display = 'block';
  });
});
