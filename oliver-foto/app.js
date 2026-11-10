(() => {
  const cfg = window.OLIVER_FOTO_CONFIG || {albums:[],googleDriveApiKey:""};
  const grid = document.getElementById("album-grid");
  const keyReady = cfg.googleDriveApiKey && !cfg.googleDriveApiKey.includes("PASTE_");
  const lightbox = document.getElementById("lightbox");
  let currentImages = [], currentIndex = 0;

  document.getElementById("year").textContent = new Date().getFullYear();

  async function getFolderImages(folderId) {
    if (!keyReady) throw new Error("Google Drive API key has not been configured.");
    const q = encodeURIComponent(`'${folderId}' in parents and trashed = false and mimeType contains 'image/'`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&key=${encodeURIComponent(cfg.googleDriveApiKey)}&fields=files(id,name,mimeType,thumbnailLink,imageMediaMetadata)&pageSize=100&orderBy=name`;
    const response = await fetch(url);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error?.message || "Could not read this Drive folder.");
    }
    const data = await response.json();
    return (data.files || []).map(file => ({
      id: file.id,
      name: file.name,
      thumb: `https://drive.google.com/thumbnail?id=${file.id}&sz=w1600`
    }));
  }

  function fallbackCover(album, index) {
    const photos = [
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=85"
    ];
    return photos[index % photos.length];
  }

  function renderAlbums() {
    const albums = cfg.albums || [];
    if (!albums.length) {
      grid.innerHTML = `<div class="empty-state"><span class="empty-mark">OF.</span><h3>Your next story starts here.</h3><p>Add your first Google Drive album through the admin dashboard.</p><a href="admin.html" class="text-link">OPEN ALBUM MANAGER ↗</a></div>`;
      return;
    }
    grid.innerHTML = "";
    albums.forEach((album, index) => {
      const card = document.createElement("article");
      card.className = "album-card";
      card.innerHTML = `<div class="album-cover"><img alt="" src="${fallbackCover(album,index)}" loading="lazy"></div><div class="album-meta"><div><div class="album-title"></div><div class="album-sub"></div></div><span class="album-arrow">↗</span></div>`;
      card.querySelector(".album-title").textContent = album.title || "Untitled album";
      card.querySelector(".album-sub").textContent = [album.category || "Photography", album.date || ""].filter(Boolean).join(" / ");
      const img = card.querySelector("img");
      card.addEventListener("click", () => openAlbum(album));
      grid.appendChild(card);
      if (album.folderId && keyReady) {
        getFolderImages(album.folderId).then(images => {
          if (images[0]) img.src = images[0].thumb;
          card.dataset.images = JSON.stringify(images);
        }).catch(err => console.warn("Album image loading:", err.message));
      }
    });
  }

  async function openAlbum(album) {
    if (!album.folderId) return;
    try {
      const images = await getFolderImages(album.folderId);
      if (!images.length) throw new Error("No images found. Check that the folder contains images and is shared publicly.");
      currentImages = images;
      currentIndex = 0;
      showImage();
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden","false");
    } catch (err) {
      alert(err.message);
    }
  }
  function showImage() {
    const item = currentImages[currentIndex];
    lightbox.querySelector("img").src = item.thumb;
    lightbox.querySelector("img").alt = item.name;
    lightbox.querySelector(".lightbox-caption").textContent = `${item.name}  —  ${currentIndex+1} / ${currentImages.length}`;
  }
  function closeLightbox(){lightbox.classList.remove("open");lightbox.setAttribute("aria-hidden","true");}
  lightbox.querySelector(".lightbox-close").addEventListener("click",closeLightbox);
  lightbox.querySelector(".lightbox-prev").addEventListener("click",()=>{if(!currentImages.length)return;currentIndex=(currentIndex-1+currentImages.length)%currentImages.length;showImage();});
  lightbox.querySelector(".lightbox-next").addEventListener("click",()=>{if(!currentImages.length)return;currentIndex=(currentIndex+1)%currentImages.length;showImage();});
  lightbox.addEventListener("click",e=>{if(e.target===lightbox)closeLightbox();});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeLightbox();if(e.key==="ArrowRight")lightbox.querySelector(".lightbox-next").click();if(e.key==="ArrowLeft")lightbox.querySelector(".lightbox-prev").click();});
  renderAlbums();
})();