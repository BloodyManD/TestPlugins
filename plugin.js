(function () {
  var manifest = {
    id: "my_movie_scraper",
    name: "Мой источник фильмов",
    version: "0.1",
    description: "Поиск фильмов с сайта и воспроизведение mp4",
    author: "Вы"
  };

  function init() {
    console.log(manifest.name + " инициализирован");
  }

  // функция поиска
  function search(query) {
    return new Promise(function (resolve, reject) {
      // ⚠️ тут лучше обращаться к вашему прокси:
      // var url = "https://my-proxy.vercel.app/search?q=" + encodeURIComponent(query);

      var url = "https://hd.zetflix.zone/index.php?do=search&subaction=search&story=" + encodeURIComponent(query);

      fetch(url)
        .then(r => r.text())
        .then(html => {
          var results = [];

          // парсим HTML (простейший вариант — regex; лучше использовать DOMParser, но в Lampa не всегда есть)
          var regex = /<a class="movie-item" href="([^"]+)".*?<img src="([^"]+)".*?<div class="title">([^<]+)<\/div>/g;
          var match;
          while ((match = regex.exec(html)) !== null) {
            results.push({
              title: match[3],
              url: match[1],
              poster: match[2],
              year: "",
              info: ""
            });
          }

          resolve(results);
        })
        .catch(err => reject(err));
    });
  }

  // получение деталей (ссылки на mp4)
  function load(item) {
    return new Promise(function (resolve, reject) {
      fetch(item.url)
        .then(r => r.text())
        .then(html => {
          // ищем mp4 в HTML
          var match = html.match(/https?:\/\/[^"']+\.mp4/);
          var videoUrl = match ? match[0] : null;

          if (!videoUrl) return reject("Видео не найдено");

          var detail = {
            title: item.title,
            sources: [
              { url: videoUrl, type: "direct", quality: "HD" }
            ],
            poster: item.poster,
            description: item.info
          };

          resolve(detail);
        })
        .catch(err => reject(err));
    });
  }

  window.lampa_plugins = window.lampa_plugins || {};
  window.lampa_plugins[manifest.id] = {
    manifest: manifest,
    init: init,
    search: search,
    load: load
  };
})();
