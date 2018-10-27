// ==UserScript==
// @name         Cleanreads
// @namespace    http://hermanfassett.me
// @version      1.1
// @description  Cleanreads userscript for Goodreads.com
// @author       Herman Fassett
// @match        https://www.goodreads.com/*
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
    #crSettingsDialog {
        width: 500px;
        height: 500px;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 1px solid rgba(0,0,0,0.15);
        display: none;
    }
    #crSettingsHeader {
        height: 50px;
        width: 100%;
        background: #F4F1EA;
        text-align: center;
        box-shadow: 0 1px 2px rgba(0,0,0,0.15);
    }
    #crSettingsHeader h1 {
        line-height: 50px;
        color: #382110;
        font-family: "Lato", "Helvetica Neue", "Helvetica", sans-serif;
    }
    #crSettingsBody { height: 400px; }
    #crSettingsFooter {
        height: 50px;
        width: 100%;
        box-shadow: 1px 0 2px rgba(0,0,0,0.15);
    }
    #crSettingsFooter button {
        float: right;
        margin: 10px;
    }
`);

(function(Cleanreads) {
    'use strict';

    // Search terms. Strings or regex
    Cleanreads.POSITIVE_SEARCH_TERMS = [
        { term: 'clean', exclude: { before: ['not', 'isn\'t'], after: ['ing'] }},
        { term: 'no sex', exclude: { before: [], after: [] }}
    ];
    Cleanreads.NEGATIVE_SEARCH_TERMS = [
        { term: 'sex', exclude: { before: ['no'], after: ['ist'] }},
        { term: 'adult', exclude: { before: ['young', 'new'], after: []}}
    ];

    function setupSettings() {
        // Add link to menu dropdown
        let links = Array.from(document.getElementsByClassName('menuLink')).filter(x => x.innerText == 'Account settings');
        if (links && links.length) {
            let li = document.createElement('li');
            li.className = 'menuLink';
            li.onclick = showSettings;
            li.innerHTML = `<a href='#' class='siteHeader__subNavLink'>Cleanreads settings</a>`;
            links[0].parentNode.insertBefore(li, links[0].nextSibling);
        }
        // Add dialog
        document.body.innerHTML += `
<div id="crSettingsDialog">
    <div id="crSettingsHeader"><h1>Cleanreads Settings</h1></div>
    <div id="crSettingsBody"></div>
    <div id="crSettingsFooter"></div>
</div>
`;
        // Add link to profile page
        let settingsLink = document.createElement('a');
        settingsLink.href = '#';
        settingsLink.innerText = 'Cleanreads settings';
        settingsLink.onclick = showSettings;
        document.getElementsByClassName('userInfoBoxContent')[0].appendChild(settingsLink);
        // Add close button to dialog
        let closeButton = document.createElement('button');
        closeButton.innerText = 'Close';
        closeButton.className = 'gr-button';
        closeButton.onclick = hideSettings;
        document.getElementById('crSettingsFooter').appendChild(closeButton);
    }
    function setupRating() {
        let match = window.location.pathname.match(/book\/show\/(\d+)/);
        if (match && match.length > 1) {
            Cleanreads.reviews = [];
            Cleanreads.attempts = 10;
            Cleanreads.positives = 0;
            Cleanreads.negatives = 0;

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
            Cleanreads.crDetails = document.getElementById('crDetails');
            document.getElementById('expandCrDetails').onclick = expandDetails;
            startReviews();
        }
    }

    function startReviews() {
        getReviews();
        // Reviews are delayed content so keep looking for a bit if nothing
        if (!Cleanreads.reviews.length && Cleanreads.attempts--) {
            setTimeout(startReviews, 1000);
        } else {
            calculateContent();
        }
    }

    // Get reviews from page (only gets the first page of reviews, not easy to access others without API)
    function getReviews() {
        let reviewContainer = document.getElementById('bookReviews');
        let reviewElements = document.getElementsByClassName('reviewText');
        Cleanreads.reviews = Array.from(reviewElements).map(x => (x.querySelector('[style]') || x).innerText.trim());
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
        Cleanreads.crDetails.innerHTML += `<h2 class="buyButtonContainer__title u-marginTopXSmall">Description Content Basis: </h2><div id="descriptionBasis"></div>`;
        Cleanreads.crDetails.innerHTML += `<h2 class="buyButtonContainer__title u-marginTopXSmall">Clean Basis: </h2><div id="cleanBasis"></div>`;
        Cleanreads.crDetails.innerHTML += `<h2 class="buyButtonContainer__title u-marginTopXSmall">Not Clean Basis: </h2><div id="notCleanBasis"></div>`;
        // Get containers
        let descriptionBasis = document.getElementById('descriptionBasis'),
            cleanBasis = document.getElementById('cleanBasis'),
            notCleanBasis = document.getElementById('notCleanBasis');
        // Search description
        let description = `Title: ${getTitle()}\nDescription: ${getDescription()}`;
        Cleanreads.POSITIVE_SEARCH_TERMS.forEach(term => searchContent(term, description, descriptionBasis, true));
        Cleanreads.NEGATIVE_SEARCH_TERMS.forEach(term => searchContent(term, description, descriptionBasis, false));
        // Search reviews
        Cleanreads.reviews.forEach(review => {
            Cleanreads.POSITIVE_SEARCH_TERMS.forEach(term => searchContent(term, review, cleanBasis, true));
            Cleanreads.NEGATIVE_SEARCH_TERMS.forEach(term => searchContent(term, review, notCleanBasis, false));
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
        let regex = new RegExp(`(^|[^(${term.exclude.before.join`|`}|\\s*)])(\\s*)(${term.term})(\\s*)($|[^(${term.exclude.after.join`|`}|\\s*)])`);
        let contentMatch = content.toLowerCase().match(regex);
        if (contentMatch) {
            positive ? Cleanreads.positives++ : Cleanreads.negatives++;
            let index = contentMatch.index + contentMatch[1].length + contentMatch[2].length;
            container.innerHTML += `
                <div class="contentComment">
                    ...${content.slice(index - 50, index)}<b class="content${positive ? '' : 'Not'}Clean">${content.substr(index, contentMatch[3].length)}</b>${content.slice(index + contentMatch[3].length, index + 50)}...
                </div>`;
        }
    }

    function updateVerdict() {
        let verdict = document.getElementById('crVerdict');
        if (Cleanreads.positives && Cleanreads.positives > Cleanreads.negatives) {
            verdict.innerText = `${Cleanreads.negatives ? 'Probably' : 'Most likely'} clean`;
            verdict.className += 'contentClean';
        } else if (Cleanreads.negatives && Cleanreads.negatives > Cleanreads.positives) {
            verdict.innerText = `${Cleanreads.positives ? 'Probably' : 'Most likely'} not clean`;
            verdict.className += 'contentNotClean';
        } else {
            verdict.innerText = Cleanreads.positives && Cleanreads.negatives ? 'Could be clean or not clean' : 'Unknown';
            verdict.className += 'contentUnknown';
        }
        document.getElementById('crPositives').innerText = Cleanreads.positives;
        document.getElementById('crNegatives').innerText = Cleanreads.negatives;
    }

    function expandDetails() {
        let collapsedText = '(Details)',
            expandedText = '(Hide)';
        if (this.innerText == collapsedText) {
            Cleanreads.crDetails.style.display = 'block';
            this.innerText = expandedText;
        } else if (this.innerText == expandedText) {
            Cleanreads.crDetails.style.display = 'none';
            this.innerText = collapsedText;
        }
    }

    function showSettings() {
        console.log("cr settings");
        document.getElementById("crSettingsDialog").style.display = 'block';
        return false;
    }

    function hideSettings() {
        document.getElementById("crSettingsDialog").style.display = 'none';
        return false;
    }

    setupSettings();
    setupRating();
})(window.Cleanreads = window.Cleanreads || {});