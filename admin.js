
(() => {
  const cfg = window.OLIVER_FOTO_CONFIG || {albums:[]};
  const STORAGE_KEY = "oliver-foto-admin-albums-v1";
  const $ = id => document.getElementById(id);

  let albums = [];

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    albums = saved ? JSON.parse(saved) : (cfg.albums || []).map(a => ({...a}));
  } catch {
    albums = (cfg.albums || []).map(a => ({...a}));
  }

  function message(text, error = false) {
    const output = $("form-message");
    output.textContent = text;
    output.style.color = error ? "#ff9999" : "#d7ff5c";
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(albums));
      render();
    } catch (error) {
      message("Could not save: " + error.message, true);
    }
  }

  function extractFolderId(value) {
    const input = value.trim();

    const match =
      input.match(/drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]+)/) ||
      input.match(/[?&]id=([a-zA-Z0-9_-]+)/);

    if (match) return match[1];

    if (/^[a-zA-Z0-9_-]{15,}$/.test(input)) return input;

    return null;
  }

  function render() {
    $("album-count").textContent =
      `${albums.length} ALBUM${albums.length === 1 ? "" : "S"}`;

    const container = $("admin-albums");
    container.innerHTML = "";

    if (!albums.length) {
      container.innerHTML =
        '<div class="admin-empty">No albums added yet.<br>Your collections will appear here.</div>';
      return;
    }

    albums.forEach((album, index) => {
      const row = document.createElement("div");
      row.className = "admin-album";

      row.innerHTML = `
        <img class="album-thumb" alt="">
        <div class="admin-album-info">
          <strong></strong>
          <span></span>
        </div>
        <button class="remove-btn" type="button">REMOVE</button>
      `;

      row.querySelector("img").src =
        `https://drive.google.com/thumbnail?id=${encodeURIComponent(album.folderId)}&sz=w300`;

      row.querySelector("strong").textContent = album.title;

      row.querySelector("span").textContent =
        `${album.category} · ${album.date || "No date"}`;

      row.querySelector("button").addEventListener("click", () => {
        albums.splice(index, 1);
        save();
        message("Album removed.");
      });

      container.appendChild(row);
    });
  }

  $("album-form").addEventListener("submit", event => {
    event.preventDefault();

    const title = $("title").value.trim();
    const folderId = extractFolderId($("folder").value);

    if (!title) {
      message("Enter an album title.", true);
      return;
    }

    if (!folderId) {
      message("Invalid Google Drive folder link.", true);
      return;
    }

    albums.unshift({
      title: title,
      folderId: folderId,
      category: $("category").value,
      date: $("date").value,
      description: $("description").value.trim()
    });

    save();
    $("album-form").reset();

    message("Album added successfully! Export albums.json to publish it.");
  });

  $("export").addEventListener("click", () => {
    const blob = new Blob(
      [JSON.stringify(albums, null, 2)],
      {type: "application/json"}
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "albums.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    message("albums.json exported successfully!");
  });

  $("clear").addEventListener("click", () => {
    if (!confirm("Clear your local album list?")) return;

    albums = [];
    save();
    message("Album list cleared.");
  });

  render();
})();
