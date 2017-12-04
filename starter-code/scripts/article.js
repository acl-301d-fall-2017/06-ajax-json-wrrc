'use strict';

function Article (rawDataObj) {
    this.author = rawDataObj.author;
    this.authorUrl = rawDataObj.authorUrl;
    this.title = rawDataObj.title;
    this.category = rawDataObj.category;
    this.body = rawDataObj.body;
    this.publishedOn = rawDataObj.publishedOn;
}

// REVIEW: Instead of a global `articles = []` array, let's attach this list of all articles directly to the constructor function. Note: it is NOT on the prototype. In JavaScript, functions are themselves objects, which means we can add properties/values to them at any time. In this case, the array relates to ALL of the Article objects, so it does not belong on the prototype, as that would only be relevant to a single instantiated Article.
Article.all = [];

// COMMENT: Why isn't this method written as an arrow function?
// This method is not written as an arrow function because it contains 'this'
Article.prototype.toHtml = function() {
    const template = Handlebars.compile($('#article-template').text());

    this.daysAgo = parseInt((new Date() - new Date(this.publishedOn)) / 60 / 60 / 24 / 1000);

    // COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
    // Not sure? Check the docs!
    // '?' is a shorthand 'if' statement, ':' represents the 'else'
    this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
    this.body = marked(this.body);

    return template(this);
};

// : There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENT: Where is this function called? What does 'rawData' represent now? How is this different from previous labs? Where did our forEach loop that looped through all articles and called .toHtml() move to?
// Article.loadAll is called in Article.fetchAll, rawData is the retrieved data from the server. This is different because the data is hosted on a server. The forEach loop was moved to articleView.initIndexPage.
Article.loadAll = rawData => {
    rawData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)));

    rawData.forEach(articleObject => Article.all.push(new Article(articleObject)));
};

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
    // COMMENT: What is this 'if' statement checking for? Where was the rawData set to local storage?
    // The 'if' statement is checking for the existence of rawData within localStorage. rawData is set to localStorage when article.fetchAll is run the first time through.
    if (localStorage.rawData) {
    // REVIEW: When rawData is already in localStorage we can load it with the .loadAll function above and then render the index page (using the proper method on the articleView object).

    //TODO: This function takes in an argument. What do we pass in to loadAll()?
        Article.loadAll(JSON.parse(localStorage.getItem('rawData')));

    //TODO: What method do we call to render the index page?
        articleView.initIndexPage();

    } else {
    // TODO: When we don't already have the rawData:
    // - we need to retrieve the JSON file from the server with AJAX (which jQuery method is best for this?)
    // - we need to cache it in localStorage so we can skip the server call next time
    // - we then need to load all the data into Article.all with the .loadAll function above
    // - then we can render the index page
        $.getJSON('/data/hackerIpsum.json').done((res) => {
            localStorage.setItem('rawData', (JSON.stringify(res)));
            Article.loadAll(res);
            articleView.initIndexPage();
        });

    // COMMENT: Discuss the sequence of execution in this 'else' conditional. Why are these functions executed in this order?
    // line 62 retrieves the data from the server and stores in in 'res', 63 sets 'res' to localStorage on the client, 64 calls the loadAll function which creates a new Article object, and 65 appends that Article object to the html.
    }
};
