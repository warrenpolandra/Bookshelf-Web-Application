// Sidebar Listener
const sidebarButton = document.getElementById('sidebarButton');
const sidebar = document.querySelector('.sidebar');
const main = document.querySelector('main');
const content = document.getElementById('content');
const storageKey = 'BOOK_STORAGE';

init();

function init() {
    loadContent('allBooks');
    
    // Sidebar Listener
    sidebarButton.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

}

// Load HTML based on menu
function loadContent(page) {
    const contentPaths = {
        allBooks: 'content/allBooks.html',
        addBook: 'content/addBook.html',
        unreadBooks: 'content/unreadBooks.html',
        readBooks: 'content/readBooks.html'
    };

    fetch(contentPaths[page])
        .then(response => response.text())
        .then(data => {
            content.innerHTML = data;
        })
        .then(addListener(page))
        .catch(error => {
            console.error('Error loading content:', error);
        });
    
}

// Check Web Storage
function checkForStorage() {
    return typeof (Storage) !== 'undefined';
}

// Add listener based on page
function addListener(page) {
    switch(page) {
        case 'addBook':
            const formExists = setInterval(() => {
                const textIsRead = document.getElementById('isRead');
                const submitForm = document.getElementById('inputBook');
                if (submitForm) {
                    clearInterval(formExists);
                    const isCompleted = document.getElementById('inputBookIsComplete');
                    isCompleted.addEventListener('change', function(event) {
                        if (event.target.checked) {
                            textIsRead.innerText = 'Read Books'
                        } else {
                            textIsRead.innerText = 'Unread Books'
                        }
                    });
                    submitForm.addEventListener('submit', function() {
                        const title = document.getElementById('inputBookTitle').value;
                        const author = document.getElementById('inputBookAuthor').value;
                        const year = parseInt((document.getElementById('inputBookYear').value));
                        
                        const newBookData = {
                            id: Date.now().toString(),
                            title: title,
                            author: author,
                            year: year,
                            isComplete: isCompleted.checked,
                        }
                        putBook(newBookData);
                    });
                }
            }, 100);
            break;
        case 'allBooks':
            const allBooksExists = setInterval(() => {
                const bookshelf = document.getElementById('bookshelfList');
                if (bookshelf) {
                    const searchButton = document.getElementById('searchSubmit');
                    searchButton.addEventListener('click', function (event) {
                        event.preventDefault();
                        const searchInput = document.getElementById('searchBookTitle');
                        const searchTerm = searchInput.value.trim();
                        searchBooks(searchTerm);
                    });
                    clearInterval(allBooksExists);
                    if (checkForStorage) {
                        if (localStorage.getItem(storageKey) !== null) {
                            renderBooks();
                        }
                    } else {
                        alert('Your browser does not supports web storage');
                    }      
                }
            }, 100);
            break;
        case 'readBooks':
            const readBooksExist = setInterval(() => {
                const bookshelf = document.getElementById('readBookshelfList');
                if (bookshelf) {
                    clearInterval(readBooksExist);
                    if (checkForStorage) {
                        if (localStorage.getItem(storageKey) !== null) {
                            renderSpecificBooks(true);
                        }
                    } else {
                        alert('Your browser does not supports web storage');
                    }      
                }
            }, 100);
            break;
        case 'unreadBooks':
            const unreadBooksExist = setInterval(() => {
                const bookshelf = document.getElementById('unreadBookshelfList');
                if (bookshelf) {
                    clearInterval(unreadBooksExist);
                    if (checkForStorage) {
                        if (localStorage.getItem(storageKey) !== null) {
                            renderSpecificBooks(false);
                        }
                    } else {
                        alert('Your browser does not supports web storage');
                    }      
                }
            }, 100);
            break;
        default:
            console.log("unknown page");
    }
}

// Get All Books
function getBookList() {
    if (checkForStorage()) {
        return JSON.parse(localStorage.getItem(storageKey)) || [];
    } else {
        return [];
    }
}

// Render All Books
function renderBooks(bookData = getBookList()) {

    const bookList = document.getElementById('bookshelfList');

    bookList.innerHTML = '';
    for (let book of bookData) {
        let article = document.createElement('article');
        article.className = 'book_item';

        let title = document.createElement('h3');
        title.innerText = book.title;
        let author = document.createElement('p');
        author.innerText = book.author;
        let year = document.createElement('p');
        year.innerText = book.year;
        let isFinished = document.createElement('p');
        if (book.isComplete) {
            isFinished.innerText = 'Finished';
            isFinished.style.color = 'greenyellow';
        } else {
            isFinished.innerText = 'Unread';
            isFinished.style.color = 'red';
        }

        let action = document.createElement('div');
        action.className = 'action';
        let deleteButton = document.createElement('button');
        deleteButton.className = 'red';
        deleteButton.innerText = 'Delete Book';
        deleteButton.addEventListener('click', function() {
            deleteBook(book.id);
            renderBooks();
        });
        action.appendChild(deleteButton);
        article.appendChild(title);
        article.appendChild(author);
        article.appendChild(year);
        article.appendChild(isFinished);
        article.appendChild(action);

        bookList.appendChild(article);
    }
}

// Render Books based on isComplete
function renderSpecificBooks(isComplete) {
    const bookData = getBookList();
    var bookList;
    if (isComplete) {
        bookList = document.getElementById('readBookshelfList');
    } else {
        bookList = document.getElementById('unreadBookshelfList');
    }

    bookList.innerHTML = '';
    for (let book of bookData) {
        if (isComplete && !book.isComplete || !isComplete && book.isComplete) {
            continue;
        } 
        let article = document.createElement('article');
        article.className = 'book_item';

        let title = document.createElement('h3');
        title.innerText = book.title;
        let author = document.createElement('p');
        author.innerText = book.author;
        let year = document.createElement('p');
        year.innerText = book.year;

        let isFinished = document.createElement('p');
        if (book.isComplete) {
            isFinished.innerText = 'Finished';
            isFinished.style.color = 'greenyellow';
        } else {
            isFinished.innerText = 'Unread';
            isFinished.style.color = 'red';
        }

        let action = document.createElement('div');
        action.className = 'action';
        let markButton = document.createElement('button');
        markButton.className = 'green';
        if (isComplete) {
            markButton.innerText = 'Mark as Unread';
        } else {
            markButton.innerText = 'Mark as Finished'
        }
        markButton.addEventListener('click', function() {
            changeBookStatus(book.id);
        });

        let deleteButton = document.createElement('button');
        deleteButton.className = 'red';
        deleteButton.innerText = 'Delete Book';
        deleteButton.addEventListener('click', function() {
            deleteBook(book.id);
            renderSpecificBooks(isComplete);
        });
        action.appendChild(markButton);
        action.appendChild(deleteButton);
        article.appendChild(title);
        article.appendChild(author);
        article.appendChild(year);
        article.appendChild(isFinished);
        article.appendChild(action);

        bookList.appendChild(article);
    }
}

// Add New Book
function putBook(data) {
    if (checkForStorage()) {
        let bookData = [];
        if (localStorage.getItem(storageKey) !== null) {
            bookData = JSON.parse(localStorage.getItem(storageKey));
        }

        bookData.unshift(data);
        if (bookData.length > 100) {
            bookData.pop();
        }

        localStorage.setItem(storageKey, JSON.stringify(bookData));
        alert('Buku ' + data.title + ' ditambahkan!');
    }
}

// Change Book Status
function changeBookStatus(bookId) {
    let books = getBookList();
    const bookTarget = findBookIndex(bookId);
    if(bookTarget === -1) return;
    let isComplete = books[bookTarget].isComplete
    books[bookTarget].isComplete = !isComplete;

    localStorage.setItem(storageKey, JSON.stringify(books));
    renderSpecificBooks(isComplete);
}

// Delete Book
function deleteBook(bookId) {
    let books = getBookList();
    const bookTarget = findBookIndex(bookId);
    if(bookTarget === -1) return;

    let currTitle = books[bookTarget].title

    books.splice(bookTarget, 1);
    localStorage.setItem(storageKey, JSON.stringify(books));
    alert('Buku ' + currTitle + ' dihapus!');
}

// Find Book Index
function findBookIndex(bookId) {
    let books = getBookList()
    for (const index in books) {
        if (books[index].id === bookId){
            return index;
        }
    }
    return -1;
}

// Search Books Based on Keywords
function searchBooks(keywords) {
    const data = getBookList();

    if (!data) {
        return [];
    }

    const results = data.filter(item => {
        return item.title.includes(keywords) || item.author.includes(keywords);
    });

    console.log(results);
    renderBooks(results);
}