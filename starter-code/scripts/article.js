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
// It is not written as an arrow function because it uses the keyword this to instantiate each object, and in an arrow function, this would refer to the browser window, and not the instance. If the function was nested within another function, the 'this' would be local and an arrow function would work.

Article.prototype.toHtml = function() {
    const template = Handlebars.compile($('#article-template').text());

    this.daysAgo = parseInt((new Date() - new Date(this.publishedOn)) / 60 / 60 / 24 / 1000);

    // COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
    // Not sure? Check the docs!
    // The question mark and colon are used as conditional operators. If the condition (on the left of the question mark) evaluates to true, it returns the expression on the left side of the colon. If the condition evaluates to false, it returns the expression on the right of the colon. We've seen this logic represented in if / else statements.
    this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
    this.body = marked(this.body);

    return template(this);
};

// : There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENT: Where is this function called? What does 'rawData' represent now? How is this different from previous labs? Where did our forEach loop that looped through all articles and called .toHtml() move to?

// The function loadAll is called within the fetchAll function, if no localStorage data is found. Now it is being called inside another function (i.e., nested), and only called if needed. Before today's lab, the rawData was being represented as properties of the constructor function, used by the prototype to create an instance of the object. Now, those key-value propertie are housed within the class property 'all', attached to each Article, and no longer bound to the prototype.

Article.loadAll = rawData => {
    rawData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)));

    rawData.forEach(articleObject => Article.all.push(new Article(articleObject)));

};

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
    // COMMENT: What is this 'if' statement checking for? Where was the rawData set to local storage?
    // It's checking to see if rawData lives in local Storage. rawData would be set to local storage if user had previously loaded that script.
    if (localStorage.rawData) {
        const arrayOfObjects = JSON.parse(localStorage.rawData);
        // REVIEW: When rawData is already in localStorage we can load it with the .loadAll function above and then render the index page (using the proper method on the articleView object).
        // populate arrayOfObjects array
        // get local storage data to populate above

        //TODO: This function takes in an argument. What do we pass in to loadAll()?
        Article.loadAll(arrayOfObjects);
        console.log(arrayOfObjects);
    //TODO: What method do we call to render the index page?

    } else {
    // TODO: When we don't already have the rawData:
        $.getJSON('/data/hackerIpsum.json')
            .done(jsonData => {
                Article.loadAll(jsonData);
            })
            .fail((res, status, err) => console.error(err));
    // - we need to retrieve the JSON file from the server with AJAX (which jQuery method is best for this?)
    // - we need to cache it in localStorage so we can skip the server call next time
    // - we then need to load all the data into Article.all with the .loadAll function above
    // - then we can render the index page


    // COMMENT: Discuss the sequence of execution in this 'else' conditional. Why are these functions executed in this order?
    // PUT YOUR RESPONSE HERE
    }
};
