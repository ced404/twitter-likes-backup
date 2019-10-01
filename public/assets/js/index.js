/**
 * NodeList.prototype.forEach() polyfill
 * https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach#Polyfill
 */
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = function(callback, thisArg) {
    thisArg = thisArg || window;
    for (let i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}

(function() {
  "use strict";

  let State = {
    DEV: true,
    API: {
      likes: "https://twitter-likes-backup.glitch.me/api/likes"
    }
  };

  // Get the liked tweets from the database
  const getLikes = () => {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open("GET", State.API.likes);

      xhr.onload = function() {
        if (xhr.status == 200) resolve(JSON.parse(xhr.response));
        else reject(Error(xhr.statusText));
      };

      xhr.onerror = function() {
        reject(Error("Network Error"));
      };

      xhr.send();
    });
  };

  // Format search data for Jets
  const formatSearchData = (tweetID, content) => {
    content = content.replace(/\r?\n|\r/g, " ");
    content = content.replace(/^\s+|\s+$/g, "");
    content = content.replace(/ +(?= )/g, "");
    content = content.toLowerCase(); // Important for Jet!
    return content;
  };

  // Setup Jets when all tweets are rendered by TwitterWidgets
  const initJets = () => {
    State.DEV && console.info("initJets");

    //const container = document.querySelector("[data-tweets]");
    //container.classList.add("tweets-rendered");

    // setup Jets
    let jets = new window.Jets({
      searchTag: '[name="search"]',
      contentTag: "[data-tweets]",
      searchSelector: "*OR",
      diacriticsMap: {
        a: "ÀÁÂÃÄÅàáâãäåĀāąĄ",
        c: "ÇçćĆčČ",
        d: "đĐďĎ",
        e: "ÈÉÊËèéêëěĚĒēęĘ",
        i: "ÌÍÎÏìíîïĪī",
        l: "łŁ",
        n: "ÑñňŇńŃ",
        o: "ÒÓÔÕÕÖØòóôõöøŌō",
        r: "řŘ",
        s: "ŠšśŚ",
        t: "ťŤ",
        u: "ÙÚÛÜùúûüůŮŪū",
        y: "ŸÿýÝ",
        z: "ŽžżŻźŹ"
      }
    });
  };

  // Append tweets to the document
  const displayLikes = likes => {
    // format and insert Tweets
    const container = document.querySelector("[data-tweets]");
    container.innerHTML = "";

    likes.forEach(function(like) {
      window.requestAnimationFrame(function() {
        //State.DEV && console.log('like', like);

        let userUrl = `<a href="https://twitter.com/${like.screen_name}" target="_blank" rel="noreferrer">@${like.screen_name}</a>`;
        let oEmbedURL = `<a href="https://twitter.com/${like.screen_name}/status/${like.id_str}?ref_src=twsrc%5Etfw" target="_blank" rel="noreferrer">View tweet</a>`;
        let tweetContent = `<span lang="en" dir="ltr">${like.text}</span><br>${userUrl} • ${oEmbedURL}`;

        let tweetDate = new Date(like.createdAt);
        let date = tweetDate.getDate();
        let month = tweetDate.getMonth(); //Be careful! January is 0 not 1
        let year = tweetDate.getFullYear();
        let dateString = date + "-" + (month + 1) + "-" + year;


        // Tweeter Embed
        let item = document.createElement("li");
        item.classList.add("twitter-tweet");
        item.setAttribute("id", like.id);
        item.setAttribute("data-lang", "fr");
        item.innerHTML = tweetContent;

        // Concat the search data and store it
        let content = [like.text, like.screen_name, dateString].join(" ");

        // Format tweet content for Jets
        content = formatSearchData(like.id, content);

        // Setup the Jets attribute with the tweet's search data
        item.setAttribute("data-jets", content);

        // Append the tweet
        container.appendChild(item);
      });
    });

    initJets();
  };

  // Load then display tweets
  const init = () => {
    getLikes().then(
      function(likes) {
        displayLikes(likes);
      },
      function(error) {
        console.error(error);
      }
    );
  };

  init();
})();
