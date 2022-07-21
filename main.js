'use strict'
const log = console.log;

const form = document.getElementById('form');
const query = document.getElementById('query');
const articleContainer = document.querySelector('.article-container');
const paginationContainer = document.querySelector('.pagination-container');


class  App {
    constructor() {
        
        form.addEventListener('submit', this.getFormData.bind(this));
        //this.sendQueryAndGetDataAPI();
    }
    
    #myToken = '07e6fded0ab089a90360fb12d25e4dbd';
    query;
    quantity = 3;

    // getting query from form
    getFormData(event) {
        event.preventDefault();
        const string = form.querySelector('.query').value.trim();
//        const string = query.value.trim();
        this.query = string;
        this.sendQueryAndGetDataAPI(this.query, this.#myToken);
    }

    // send query to API & get data
    sendQueryAndGetDataAPI(query, token){
        
        fetch(`https://gnews.io/api/v4/search?q=${query}&token=${token}`)
        .then(
            response => {
                log(response);
                if (!response.ok) 
                    throw new Error(response.status);
                
                return response.json();
            }
        )
        .then(data => {
                let arrayOfArticles = data.articles; 

                const pagination = new Pagination(arrayOfArticles, this.quantity);
            })
        .catch(
            error => {
                this.displayErrorMessage(`Something wrong. ${error}. Make sure for the input is not empty.`)
            }
        )
    }

    //извлечение данных из полученного массива и отрисовка (НЕ АКТУАЛЬНО. ОТРИСОВКА ЧЕРЕЗ ПАГИНАЦИЮ)
    getArticleFromApiArray(array) {
        array.forEach(element => {
            const article = new Article(element).display();
        });
    }
    
    // очистка DOM (НЕ АКТУАЛЬНО. ОТРИСОВКА ЧЕРЕЗ ПАГИНАЦИЮ)
    clear(elem) {
        log(elem.children);
        while (elem.firstChild) {
            elem.firstChild.remove();
        }
    }

    //анимация

    static animationArticles() {
        return (() => {
            const articles = document.querySelectorAll('.article');
            for (let el of articles) {
                if (el.classList.contains('hidden')) {
                    el.classList.remove('hidden');
                }
                if (!el.classList.contains('animated')) {
                    el.classList.add('animated');
                }
            }
        })();
    }

    displayErrorMessage(message) {
        articleContainer.insertAdjacentText('beforeend', message);
    }

}

class Article {

    title;
    description;
    content;
    url;
    image;
    publishedAt;

    constructor(data) {
        this.title = data.title;
        this.description = data.description;
        this.content = data.content;
        this.url = data.url;
        this.image = data.image;
        this.publishedAt = data.publishedAt;
        
    }
    // отрисовка HTML блока со статьей
    display() {
        let htmlBlockArticle = `
        <div class="article hidden">
            <h3 class="title">${this.title}</h3>
            <div class="imageBlock"><img src="${this.image}"></div>
            <p class="date">${this.publishedAt}</p>
            <p class="description">${this.description}</p>
            
            <a href="${this.url}">Read more</a>
        </div>`;

        articleContainer.insertAdjacentHTML('beforeend', htmlBlockArticle);
    }

}

class Pagination {
    articlesQuantity;
    articlesOnPage;
    arrayOfArticles;
    activePage = {
        activeColor: '',
        currentNumber: 1
    };
    paginationItems = [];
    paginationItemQuantity;

    constructor(array, quantity) {
        this.articlesQuantity = array.length;
        this.articlesOnPage = quantity;
        this.arrayOfArticles = array;
        this.displayedQuantityOfArticles(this.arrayOfArticles);
        this.paginationDisplay();

        this.activePageInit(this.paginationItems);
    }
    // переключение отобрацение активной страницы
    activePageDisable() {
        if (this.activePage.activeColor) {
            this.activePage.activeColor.classList.remove('active');
        }
    }
    // отображение активной страницы
    activePageInit(array) {
        
        array.forEach(element => {
            if(+element.innerHTML === this.activePage.currentNumber) {
                this.activePageDisable();
                this.activePage.activeColor = element;
                element.classList.add('active');
            }
        });
    }
    // удаление стрелки назад 
    previousButton() {
        if(this.activePage.currentNumber > 1) {
            const paginationList = document.querySelector('.pagination-list');
            const previous = paginationList.firstChild;
            previous.classList.remove('hidden');
        } else {
            const paginationList = document.querySelector('.pagination-list');
            const previous = paginationList.firstChild;
            previous.classList.add('hidden');
        }
    }
    // удаление стрелки вперед 
    nextButton() {
        if(this.activePage.currentNumber === this.paginationItemQuantity) {
            const paginationList = document.querySelector('.pagination-list');
            const previous = paginationList.lastChild;
            previous.classList.add('hidden');
        } else {
            const paginationList = document.querySelector('.pagination-list');
            const previous = paginationList.lastChild;
            previous.classList.remove('hidden');
        }
    }
    // отрисовка пагинации
    paginationDisplay() {

        paginationContainer.innerHTML = '';
        let ul = document.createElement('ul');
        paginationContainer.append(ul);
        ul.classList.add('pagination-list');
        this.paginationItemQuantity = Math.ceil(this.articlesQuantity / this.articlesOnPage);
        for (let currentPage = 1; currentPage <= this.paginationItemQuantity; currentPage++) {

            //стрелка назад
            if (currentPage === 1) {
                let li = document.createElement('li');
                li.classList.add('pagi-item', 'hidden');
                li.innerHTML = '<<';
                ul.append(li);
                li.addEventListener('click', (function() {
                    this.activePage.currentNumber -= 1;
                    this.previousButton();
                    this.nextButton();
                    this.displayedQuantityOfArticles(this.arrayOfArticles, this.activePage.currentNumber);
                    this.activePageInit(this.paginationItems);})
                    .bind(this));
                    this.paginationItems.push(li);
            }

            //номер страницы
            let li = document.createElement('li');
            li.classList.add('pagi-item');
            li.innerHTML = currentPage;
            ul.append(li);
            this.paginationItems.push(li);
            li.addEventListener('click', (function () {
                this.activePage.currentNumber = currentPage;
                this.activePageInit(this.paginationItems);
                this.previousButton();
                this.nextButton();
                this.activePage.currentNumber = currentPage;
                this.displayedQuantityOfArticles(this.arrayOfArticles, currentPage)}).bind(this));

            //стрелка вперед
            if(currentPage === this.paginationItemQuantity) {
                let li = document.createElement('li');
                li.classList.add('pagi-item');
                li.innerHTML = '>>';
                ul.append(li);
                li.addEventListener('click', (function() {
                    this.activePage.currentNumber += 1;
                    this.previousButton();
                    this.nextButton();
                    this.displayedQuantityOfArticles(this.arrayOfArticles, this.activePage.currentNumber);
                    this.activePageInit(this.paginationItems);})
                    .bind(this));
                this.paginationItems.push(li);
            }
            
        }
        if(this.activePage.currentNumber > 1) {
            const previous = paginationContainer.firstChild;
            previous.classList.remove('hidden');
        }
    }
    // отрисовывается нужное количество статей
    displayedQuantityOfArticles(array, currentPage=1) {
        articleContainer.innerHTML = '';
        let start = this.articlesOnPage * currentPage - this.articlesOnPage;
        let end = start + this.articlesOnPage;
        let newArray = array.slice(start, end);
        newArray.forEach(element => {
            const article = new Article(element).display();
        });
        App.animationArticles();

    }
}

const app = new App();












