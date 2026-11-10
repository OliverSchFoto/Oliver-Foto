
(() => {
  const cfg = window.OLIVER_FOTO_CONFIG || {albums: []};
  const albums = cfg.albums || [];
  const allPhotos = albums.flatMap(album =>
    (album.images || []).map(image => ({
      ...image,
      albumTitle: album.title
    }))
  );

  const pickRandom = items =>
    items.length ? items[Math.floor(Math.random() * items.length)] : null;

  document.getElementById("year").textContent = new Date().getFullYear();

  const hero = document.querySelector(".hero-image");
  const heroPhoto = pickRandom(allPhotos);

  if (heroPhoto && hero) {
    hero.src = heroPhoto.src;
    hero.alt = heroPhoto.albumTitle;
  }

  const grid = document.getElementById("album-grid");
  const lightbox = document.getElementById("lightbox");

  let currentPhotos = [];
  let currentIndex = 0;

  function showPhoto() {
    const photo = currentPhotos[currentIndex];
    const image = lightbox.querySelector("img");

    image.src = photo.src;
    image.alt = photo.name || "";
    lightbox.querySelector(".lightbox-caption").textContent =
      `${photo.albumTitle || ""} · ${currentIndex + 1} / ${currentPhotos.length}`;
  }

  function openAlbum(album) {
    currentPhotos = (album.images || []).map(image => ({
      ...image,
      albumTitle: album.title
    }));

    if (!currentPhotos.length) return;

    currentIndex = 0;
    showPhoto();

    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  }

  function closeGallery() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
  }

  if (albums.length) {
    grid.innerHTML = "";

    albums.forEach(album => {
      const photos = album.images || [];
      const cover = pickRandom(photos);

      if (!cover) return;

      const card = document.createElement("article");
      card.className = "album-card";

      const coverWrap = document.createElement("div");
      coverWrap.className = "album-cover";

      const image = document.createElement("img");
      image.src = cover.src;
      image.alt = album.title;
      image.loading = "lazy";

      const meta = document.createElement("div");
      meta.className = "album-meta";

      const info = document.createElement("div");

      const title = document.createElement("div");
      title.className = "album-title";
      title.textContent = album.title;

      const subtitle = document.createElement("div");
      subtitle.className = "album-sub";
      subtitle.textContent =
        `${album.category || "Photography"} · ${photos.length} PHOTOS`;

      const arrow = document.createElement("span");
      arrow.className = "album-arrow";
      arrow.textContent = "↗";

      info.append(title, subtitle);
      meta.append(info, arrow);
      coverWrap.appendChild(image);
      card.append(coverWrap, meta);

      card.addEventListener("click", () => openAlbum(album));
      grid.appendChild(card);
    });
  }

  lightbox.querySelector(".lightbox-close")
    .addEventListener("click", closeGallery);

  lightbox.querySelector(".lightbox-prev")
    .addEventListener("click", () => {
      currentIndex =
        (currentIndex - 1 + currentPhotos.length) % currentPhotos.length;
      showPhoto();
    });

  lightbox.querySelector(".lightbox-next")
    .addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % currentPhotos.length;
      showPhoto();
    });

  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) closeGallery();
  });

  document.addEventListener("keydown", event => {
    if (!lightbox.classList.contains("open")) return;

    if (event.key === "Escape") closeGallery();

    if (event.key === "ArrowRight") {
      lightbox.querySelector(".lightbox-next").click();
    }

    if (event.key === "ArrowLeft") {
      lightbox.querySelector(".lightbox-prev").click();
    }
  });

  if (!allPhotos.length && hero) {
    hero.alt = "Add your first photography album";
  }
})();
