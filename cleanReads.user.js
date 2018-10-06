// ==UserScript==
// @name         Cleanreads
// @namespace    http://hermanfassett.me
// @version      1.0
// @description  Cleanreads userscript for Goodreads.com
// @author       Herman Fassett
// @match        https://www.goodreads.com/book/show/*
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle( `
    .contentComment {
        padding: 10px 5px 10px 5px;
    }
    .contentClean {
        color: green;
    }
    .contentNotClean {
        color: red;
    }
    .contentUnknown {
        color: blue;
    }
`);

(function() {
    'use strict';

    // Search terms. Strings or regex
    const POSITIVE_SEARCH_TERMS = ['clean', 'no sex'];
    const NEGATIVE_SEARCH_TERMS = [/[^(!no)](^|\s)sex(y|\s|$|\W)/, /[^(young)](^|\s)adult(\s|$|\W)/];

    let reviews = [], attempts = 10, positives = 0, negatives = 0;
    let match = window.location.pathname.match(/show\/(\d+)/);
    if (match && match.length > 1) {
        let id = match[1];
        getReviews(id);
    }

    // Create container for rating
    let container = document.getElementById('descriptionContainer');
    let contentDescription = document.createElement('div');
    contentDescription.id = 'contentDescription';
    contentDescription.className = 'readable stacked u-bottomGrayBorder u-marginTopXSmall u-paddingBottomXSmall';
    contentDescription.innerHTML = `
        <h2 class="buyButtonContainer__title u-inlineBlock">Cleanreads Rating</h2>
        <h2 class="buyButtonContainer__title">
            Verdict: <span id="crVerdict">Loading...</span>
            (<span id="crPositives" class="contentClean">0</span>/<span id="crNegatives" class="contentNotClean">0</span>)
        </h2>
        <a id='expandCrDetails' href="#">(Details)</a>
        <div id="crDetails" style="display:none"></div>
    `;
    container.parentNode.insertBefore(contentDescription, container.nextSibling);
    let crDetails = document.getElementById('crDetails');
    document.getElementById('expandCrDetails').onclick = expandDetails;

    function start() {
        getReviews();
        // Reviews are delayed content so keep looking for a bit if nothing
        if (!reviews.length && attempts--) {
            setTimeout(start, 1000);
        } else {
            calculateContent();
        }
    }

    // Get reviews from page (only gets the first page of reviews, not easy to access others without API)
    function getReviews() {
        let reviewContainer = document.getElementById('bookReviews');
        let reviewElements = document.getElementsByClassName('reviewText');
        reviews = Array.from(reviewElements).map(x => (x.querySelector('[style]') || x).innerText.trim());
    }

    // Get title as text with series appended
    function getTitle() {
        return document.getElementById('bookTitle').innerText.trim() + document.getElementById('bookSeries').innerText.trim();
    }

    // Get book description text
    function getDescription() {
        let description = document.getElementById('description');
        return (description.querySelector('[style]') || description).innerText.trim();
    }

    // Calculate the cleanliness
    function calculateContent() {
        let count = 0, containing = [];
        // Insert containers for bases
        crDetails.innerHTML += `<h2 class="buyButtonContainer__title u-marginTopXSmall">Description Content Basis: </h2><div id="descriptionBasis"></div>`;
        crDetails.innerHTML += `<h2 class="buyButtonContainer__title u-marginTopXSmall">Clean Basis: </h2><div id="cleanBasis"></div>`;
        crDetails.innerHTML += `<h2 class="buyButtonContainer__title u-marginTopXSmall">Not Clean Basis: </h2><div id="notCleanBasis"></div>`;
        // Get containers
        let descriptionBasis = document.getElementById('descriptionBasis'),
            cleanBasis = document.getElementById('cleanBasis'),
            notCleanBasis = document.getElementById('notCleanBasis');
        // Search description
        let description = `Title: ${getTitle()}\nDescription: ${getDescription()}`;
        POSITIVE_SEARCH_TERMS.forEach(term => searchContent(term, description, descriptionBasis, true));
        NEGATIVE_SEARCH_TERMS.forEach(term => searchContent(term, description, descriptionBasis, false));
        // Search reviews
        reviews.forEach(review => {
            POSITIVE_SEARCH_TERMS.forEach(term => searchContent(term, review, cleanBasis, true));
            NEGATIVE_SEARCH_TERMS.forEach(term => searchContent(term, review, notCleanBasis, false));
        });
        // Fill bases if nothing
        if (!descriptionBasis.innerHTML) {
            descriptionBasis.innerHTML = '<i class="contentComment">None</i>';
        }
        if (!cleanBasis.innerHTML) {
            cleanBasis.innerHTML = '<i class="contentComment">None</i>';
        }
        if (!notCleanBasis.innerHTML) {
            notCleanBasis.innerHTML = '<i class="contentComment">None</i>';
        }
        // Update Clean Reads verdict
        updateVerdict();
    }

    // Search text for a given term, add found position to given container and increment positive/negative
    function searchContent(term, content, container, positive) {
        let contentMatch = content.toLowerCase().match(term);
        if (contentMatch) {
            positive ? positives++ : negatives++;
            console.log(contentMatch);
            container.innerHTML += `
                <div class="contentComment">
                    ...${content.slice(contentMatch.index - 50, contentMatch.index)}<b class="content${positive ? '' : 'Not'}Clean">${content.substr(contentMatch.index, contentMatch[0].length)}</b>${content.slice(contentMatch.index + contentMatch[0].length, contentMatch.index + 50)}...
                </div>`;
        }
    }

    function updateVerdict() {
        let verdict = document.getElementById('crVerdict');
        if (positives && positives > negatives) {
            verdict.innerText = `${negatives ? 'Probably' : 'Most likely'} clean`;
            verdict.className += 'contentClean';
        } else if (negatives && negatives > positives) {
            verdict.innerText = `${positives ? 'Probably' : 'Most likely'} not clean`;
            verdict.className += 'contentNotClean';
        } else {
            verdict.innerText = positives && negatives ? 'Could be clean or not clean' : 'Unknown';
            verdict.className += 'contentUnknown';
        }
        document.getElementById('crPositives').innerText = positives;
        document.getElementById('crNegatives').innerText = negatives;
    }

    function expandDetails() {
        let collapsedText = '(Details)',
            expandedText = '(Hide)';
        if (this.innerText == collapsedText) {
            crDetails.style.display = 'block';
            this.innerText = expandedText;
        } else if (this.innerText == expandedText) {
            crDetails.style.display = 'none';
            this.innerText = collapsedText;
        }
    }

    start();
})();