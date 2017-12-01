'use strict';

function Article (rawDataObj) {
    this.author = rawDataObj.author;
    this.authorUrl = rawDataObj.authorUrl;
    this.title = rawDataObj.title;
    this.category = rawDataObj.category;
    this.body = rawDataObj.body;
    this.publishedOn = rawDataObj.publishedOn;
}

// [X] REVIEW: Instead of a global `articles = []` array, let's attach this list of all articles directly to the constructor function. Note: it is NOT on the prototype. In JavaScript, functions are themselves objects, which means we can add properties/values to them at any time. In this case, the array relates to ALL of the Article objects, so it does not belong on the prototype, as that would only be relevant to a single instantiated Article.
Article.all = [];

// [X] COMMENT: Why isn't this method written as an arrow function?
// If we were to create this as an arrow function the .this would relate to the window but it wouldn't relate to the object of this function.

Article.prototype.toHtml = function() {
    const template = Handlebars.compile($('#article-template').text());

    this.daysAgo = parseInt((new Date() - new Date(this.publishedOn)) / 60 / 60 / 24 / 1000);

    // [X] COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
    // Not sure? Check the docs!
    // This is giving us the publishing information. The ${this.daysAgo} is the expression that produces the days of publication. It then renders that information on the site. We used these on tuesday to return the value of an author within the author filter. 
    this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
    this.body = marked(this.body);

    return template(this);
};

// : There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENT: Where is this function called? What does 'rawData' represent now? How is this different from previous labs? Where did our forEach loop that looped through all articles and called .toHtml() move to?
// This function is called within the Article.fetchAll. 'rawData' now represents the data in hackerlpsum.json folder. We are creating rawData as a JSON object now. The forEach is moved below to the push method in JSON.
Article.loadAll = rawData => {
    rawData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)));

    rawData.forEach(articleObject => Article.all.push(new Article(articleObject)));
};

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
    // COMMENT: What is this 'if' statement checking for? Where was the rawData set to local storage?
    // The 'if' statement below is checking for the rawData in localStorage. Currently, there is not data in local storage. We will be setting the data in this function.
    if (localStorage['rawData']) {
    // REVIEW: When rawData is already in localStorage we can load it with the .loadAll function above and then render the index page (using the proper method on the articleView object).

    //TODO: This function takes in an argument. What do we pass in to loadAll()?    
        const articleArray = JSON.parse(localStorage.rawData);
        Article.loadAll(articleArray);

        //TODO: What method do we call to render the index page?
        Article.all.forEach(function(item) {
            $('#articles').append(item.toHtml());
        });

    } else {
    // TODO: When we don't already have the rawData:
    // - we need to retrieve the JSON file from the server with AJAX (which jQuery method is best for this?)
    // - we need to cache it in localStorage so we can skip the server call next time
    // - we then need to load all the data into Article.all with the .loadAll function above
    // - then we can render the index page

        const cacheData = $.getJSON('data/hackerIpsum.json', function (){
            console.log('success');
        })
            .done(jsonData => {
                localStorage.setItem('rawData',JSON.stringify(jsonData));
            });
    // COMMENT: Discuss the sequence of execution in this 'else' conditional. Why are these functions executed in this order?
    // PUT YOUR RESPONSE HERE
    }
};
