(() => {
  const cfg = window.OLIVER_FOTO_CONFIG || {albums:[]};
  const STORAGE_KEY = "oliver-foto-admin-albums-v1";
  const $ = id => document.getElementById(id);
  let albums = loadAlbums();

  function loadAlbums() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : (cfg.albums || []).map(a => ({...a}));
    } catch { return (cfg.albums || []).map(a => ({...a})); }
  }
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(albums)); render(); }
  function extractFolderId(value) {
    const trimmed = value.trim();
    const match = trimmed.match(/drive\\.google\\.com\\/drive\\/folders\\/([a-zA-Z0-9_-]+)/) ||
                  trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match) return match[1];
    if (/^[a-zA-Z0-9_-]{15,}$/.test(trimmed)) return trimmed;
    return null;
  }
  function render() {
    $("album-count").textContent = `${albums.length} ALBUM${albums.length===1?"":"S"}`;
    const container = $("admin-albums");
    if (!albums.length) { container.innerHTML = '<div class="admin-empty">No albums added yet.<br>Your collections will appear here.</div>'; return; }
    container.innerHTML = "";
    albums.forEach((album,index) => {
      const row = document.createElement("div");
      row.className = "admin-album";
      row.innerHTML = `<img class="album-thumb" src="https://drive.google.com/thumbnail?id=${encodeURIComponent(album.folderId)}&sz=w300" alt=""><div class="admin-album-info"><strong></strong><span></span></div><button class="remove-btn" type="button">REMOVE</button>`;
      row.querySelector("strong").textContent = album.title;
      row.querySelector("span").textContent = `${album.category} · ${album.date || "No date"}`;
      row.querySelector("button").addEventListener("click",()=>{albums.splice(index,1);save();});
      container.appendChild(row);
    });
  }
  $("album-form").addEventListener("submit",e=>{
    e.preventDefault();
    const folderId = extractFolderId($("folder").value);
    if (!folderId) { $("form-message").textContent = "That doesn't look like a Google Drive folder link. Copy the folder URL from Google Drive."; return; }
    const title = $("title").value.trim();
    if (!title) return;
    albums.unshift({title,folderId,category:$("category").value,date:$("date").value,description:$("description").value.trim()});
    save();
    $("album-form").reset();
    $("form-message").textContent = "Album added to this browser's admin list. Export albums.json when you're ready to publish.";
  });
  $("export").addEventListener("click",()=>{
    const blob = new Blob([JSON.stringify(albums,null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");a.href=url;a.download="albums.json";a.click();URL.revokeObjectURL(url);
    $("form-message").textContent = "Exported albums.json. Update config.js in your GitHub repository to publish.";
  });
  $("clear").addEventListener("click",()=>{
    if (!confirm("Clear the albums saved in this browser? This does not change the published website.")) return;
    albums=[];save();$("form-message").textContent="Local album list cleared.";
  });
  render();
})();