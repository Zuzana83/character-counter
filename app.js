const themeToggleBtnEl = document.getElementById("themeToggleBtn");
const textareaTextEl = document.getElementById("textToAnalyze");
const errMessageEl = document.getElementById("charLimitMsg");
const errMessageParagraphEl =  document.querySelector(".err-message p");
const excludeSpacesEl = document.getElementById("excludeSpaces");
const charLimitEl = document.getElementById("characterLimit");
const charLimitValueEl = document.getElementById("charLimit");
const readingTimeEl = document.getElementById("readingTime");
const charCountEl = document.getElementById("charCount");
const wordCountEl = document.getElementById("wordCount");
const sentenceCountEl = document.getElementById("sentenceCount");
const leadTextEl = document.querySelector(".lead-text");
const densityResultsEl = document.getElementById("densityResults");
const letterDensityListEl = document.getElementById("densityList");
const seeMoreBtnEl = document.getElementById("seeMoreBtn");
const seeMoreTxtEl= seeMoreBtnEl.querySelector("span");
const seeMoreSvgEl = seeMoreBtnEl.querySelector("svg");

function analyzeText() {
    let charCount = 0;
    let wordCount = 0;
    let sentenceCount = 0;

    let excludeSpaces = excludeSpacesEl.checked;
    let charLimit = charLimitEl.checked;

    // CHARACTER COUNT
    if(excludeSpaces) {
        charCount = textareaTextEl.value.replace(/\s/g, '').length
    } else {
        charCount = textareaTextEl.value.length;
    }
    // CHARACTER LIMIT
    errMessageEl.classList.remove("show");
    if(charLimit) {
        let charLimitValue = Number(charLimitValueEl.value);
        if(!isNaN(charLimitValue) && charLimitValue > 0) {
             if(charCount >= charLimitValue) {
                errMessageEl.classList.add("show");
                errMessageParagraphEl.textContent = `Limit reached! Your text exceeds ${charLimitValue} characters.`;
            }
        }
    }

    // WORD COUNT
    if(textareaTextEl.value.trim() !== "") {
        wordCount = textareaTextEl.value.trim().split(/\s+/).length
    }

    // SENTENCE COUNT
    // Split by sentence endings, filter out empty sentences
    sentenceCount = textareaTextEl.value.split(/[.!?]/).filter(sentence => sentence.trim() !== "").length;

    // READING TIME CALCULATION
    const averageWPM = 200;
    let readingTime = wordCount/averageWPM;
    
    if(readingTime === 0) {
        readingTimeEl.textContent = 0;
    } else if(readingTime < 1) {
        readingTimeEl.textContent = "<1";
    } else {
        readingTimeEl.textContent = `${Math.round(readingTime)}`;
    }
    
    charCountEl.textContent = charCount < 10 ? `0${charCount}` : charCount;
    wordCountEl.textContent = wordCount < 10 ? `0${wordCount}` : wordCount; 
    sentenceCountEl.textContent = sentenceCount < 10 ? `0${sentenceCount}` : sentenceCount;

    analyzeTextDensity();
}

textareaTextEl.addEventListener("input", analyzeText);
excludeSpacesEl.addEventListener("change", analyzeText);
charLimitEl.addEventListener("change", analyzeText);
charLimitValueEl.addEventListener("input", analyzeText);


function analyzeTextDensity() {
    const percentageArrayCalc = getLetterDensityArray(textareaTextEl);
    resetSeeMoreBtn();
    createLetterList(percentageArrayCalc.slice(0, 5));
}

function getLetterDensityArray(textareaEl) {
    const text = textareaEl.value.toLowerCase(); // lowercase for case-insensitivity
    const letterCounts = {};
    let totalLetters = 0;

    for(const char of text) {
        if(/[a-z]/.test(char)) {
            if(letterCounts[char] === undefined) {
                letterCounts[char] = 1;
            } else {
                letterCounts[char] = letterCounts[char] + 1;
            }
            totalLetters++;
      }
    }

    const letterArray = Object.entries(letterCounts);
    letterArray.sort((a, b) => b[1] - a[1]);
    
    let percentageArray = letterArray.map(([letter, count]) => {
        return {letter, count, percentage: ((count/totalLetters) * 100).toFixed(2)};
    });

    if(totalLetters > 0) {
        leadTextEl.classList.add("hide");
        densityResultsEl.classList.add("show");
    } else {
        leadTextEl.classList.remove("hide");
        densityResultsEl.classList.remove("show");
    }

    return percentageArray;
}

function createdHTMLElement(el, cssCl) {
    const element = document.createElement(el);
    element.classList.add(cssCl);
    return element;
}

function createLetterList(listArray) {
    // Clear previous list
    letterDensityListEl.innerHTML = "" ;

    for(const {letter, count, percentage} of listArray) {
        const li = createdHTMLElement("li", "letter-list-item");
        const pLetter = createdHTMLElement("p", "letter");
        const barMain = createdHTMLElement("div", "bar");
        const barInner = createdHTMLElement("div", "bar-inner");
        const pCalc = createdHTMLElement("p", "proportion-calc");
        const spanProportion = createdHTMLElement("span", "proportion");
        const spanPercentage = createdHTMLElement("span", "percentage");
        
        pLetter.textContent = letter.toUpperCase();
        barInner.style.width = `${percentage}%`;
        spanProportion.textContent = count;
        spanPercentage.textContent = `/${percentage}%`;

        pCalc.append(spanProportion);
        pCalc.append(spanPercentage);
        barMain.append(barInner);
        li.append(pLetter);
        li.append(barMain);
        li.append(pCalc);

        letterDensityListEl.append(li);
    }
}

function resetSeeMoreBtn() {
    seeMoreBtnEl.setAttribute("aria-expanded", "false");
    seeMoreSvgEl.style.transform = "rotate(0deg)";
    seeMoreTxtEl.textContent = "See More";
}

seeMoreBtnEl.addEventListener("click", function(e) {
    const isExpanded = seeMoreBtnEl.getAttribute("aria-expanded") === "true";
    
    if(isExpanded) {
       seeMoreTxtEl.textContent = "See More";
       seeMoreSvgEl.style.transform = "rotate(0deg)";
       seeMoreBtnEl.setAttribute("aria-expanded", String(!isExpanded));
       const percentageArray = getLetterDensityArray(textareaTextEl);
       createLetterList(percentageArray.slice(0, 5));
    } else {
        seeMoreTxtEl.textContent = "See Less";
        seeMoreSvgEl.style.transform = "rotate(180deg)";
        seeMoreBtnEl.setAttribute("aria-expanded", String(!isExpanded));
        const percentageArray = getLetterDensityArray(textareaTextEl);
        createLetterList(percentageArray);
    }
});

// THEME TOGGLE FUNCTION
if(themeToggleBtnEl) {
    themeToggleBtnEl.addEventListener("click", () => {
        const isLight = document.documentElement.classList.contains("lightTheme");
        
        let newTheme = isLight ? "darkTheme" : "lightTheme";
        document.documentElement.classList.toggle("lightTheme");

        themeToggleBtnEl.setAttribute("aria-label", newTheme === "lightTheme" ? "Switch to dark mode" : "Switch to light mode");

        localStorage.setItem("theme", newTheme);
    });
}

