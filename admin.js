
(() => {
  const $ = id => document.getElementById(id);
  let albums = (window.OLIVER_FOTO_CONFIG?.albums || []).map(a => ({...a, images:[...(a.images || [])]}));
  let newFiles = [];

  function message(text, error = false) {
    $("form-message").textContent = text;
    $("form-message").style.color = error ? "#ff9999" : "#d7ff5c";
  }

  function slug(text) {
    return text.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "album";
  }

  $("photos").addEventListener("change", () => {
    newFiles = Array.from($("photos").files || []);
    $("photo-count").textContent =
      `${newFiles.length} photograph${newFiles.length === 1 ? "" : "s"} selected.`;
  });

  function render() {
    $("album-count").textContent =
      `${albums.length} ALBUM${albums.length === 1 ? "" : "S"}`;

    const container = $("admin-albums");
    container.innerHTML = "";

    if (!albums.length) {
      container.innerHTML =
        '<div class="admin-empty">No albums yet. Add your first collection.</div>';
      return;
    }

    albums.forEach((album, index) => {
      const row = document.createElement("div");
      row.className = "admin-album";

      const info = document.createElement("div");
      info.className = "admin-album-info";

      const title = document.createElement("strong");
      title.textContent = album.title;

      const details = document.createElement("span");
      details.textContent =
        `${album.category} · ${album.images.length} photos · ${album.date || "No date"}`;

      info.append(title, details);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove-btn";
      remove.textContent = "REMOVE";
      remove.addEventListener("click", () => {
        albums.splice(index, 1);
        render();
        message("Album removed. Export a new package to publish the change.");
      });

      row.append(info, remove);
      container.appendChild(row);
    });
  }

  $("album-form").addEventListener("submit", event => {
    event.preventDefault();

    const title = $("title").value.trim();

    if (!title) {
      message("Enter an album name.", true);
      return;
    }

    if (!newFiles.length) {
      message("Select at least one photograph.", true);
      return;
    }

    const albumSlug = slug(title) + "-" + Date.now();
    const images = newFiles.map((file, index) => {
      const extension = file.name.split(".").pop().toLowerCase();
      const filename = `${albumSlug}-${String(index + 1).padStart(3, "0")}.${extension}`;

      return {
        src: `uploads/${filename}`,
        name: file.name,
        file: file
      };
    });

    albums.push({
      title,
      category: $("category").value,
      date: $("date").value,
      description: $("description").value.trim(),
      images
    });

    $("album-form").reset();
    newFiles = [];
    $("photo-count").textContent = "No photographs selected.";

    render();
    message("Album added! Export your website package to publish it.");
  });

  $("export").addEventListener("click", async () => {
    if (!window.JSZip) {
      message("ZIP library did not load. Refresh the page and try again.", true);
      return;
    }

    if (!albums.length) {
      message("Add an album before exporting.", true);
      return;
    }

    const button = $("export");
    button.disabled = true;
    button.textContent = "BUILDING PACKAGE...";

    try {
      const zip = new JSZip();
      const uploadFolder = zip.folder("uploads");

      const cleanAlbums = albums.map(album => ({
        title: album.title,
        category: album.category,
        date: album.date,
        description: album.description,
        images: album.images.map(image => ({
          src: image.src,
          name: image.name
        }))
      }));

      for (const album of albums) {
        for (const image of album.images) {
          if (image.file) {
            uploadFolder.file(
              image.src.replace("uploads/", ""),
              image.file
            );
          }
        }
      }

      const config = `window.OLIVER_FOTO_CONFIG = ${JSON.stringify({
        albums: cleanAlbums
      }, null, 2)};`;

      zip.file("config.js", config);

      const blob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE"
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "oliver-foto-website.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);

      message("Website package exported! Extract it and upload config.js and uploads/ to GitHub.");
    } catch (error) {
      message("Export failed: " + error.message, true);
    } finally {
      button.disabled = false;
      button.textContent = "EXPORT WEBSITE PACKAGE ↗";
    }
  });

  render();
})();
