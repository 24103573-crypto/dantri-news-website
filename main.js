
/*
 * main.js
 * Chức năng:
 * 1. Đọc bài viết từ posts.json.
 * 2. Sắp xếp bài viết mới nhất trước.
 * 3. Hiển thị 1 bài nổi bật + 2 bài nhỏ.
 * 4. Hiển thị các bài còn lại dạng danh sách dọc.
 * 5. Lọc bài viết theo chuyên mục.
 * 6. Nhấn bài viết để mở detail.html?id=...
 */

document.addEventListener("DOMContentLoaded", () => {
  // Các khu vực hiển thị bài viết trong index.html
  const featuredContainer = document.getElementById("featuredPost");
  const sideContainer = document.getElementById("sidePosts");
  const listContainer = document.getElementById("postList");
  const titleElement = document.getElementById("sectionTitle");
  const countElement = document.getElementById("postCount");

  // Dừng và báo lỗi rõ ràng nếu index.html chưa có các khu vực cần thiết.
  if (!featuredContainer || !sideContainer || !listContainer) {
    console.error(
      "Thiếu #featuredPost, #sidePosts hoặc #postList trong index.html."
    );
    return;
  }

  let allPosts = [];

  // Chuẩn hóa văn bản để so sánh tên chuyên mục.
  function normalizeText(value) {
    return String(value ?? "")
      .trim()
      .toLocaleLowerCase("vi");
  }

  // Lấy giá trị đầu tiên có dữ liệu.
  // Hỗ trợ một số cách đặt tên trường thường gặp trong JSON.
  function getValue(post, keys, fallback = "") {
    for (const key of keys) {
      const value = post[key];

      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }

    return fallback;
  }

  function getPostId(post) {
    return getValue(post, ["id", "postId", "slug"]);
  }

  function getTitle(post) {
    return getValue(post, ["title", "name"], "Chưa có tiêu đề");
  }

  function getSummary(post) {
    return getValue(
      post,
      ["summary", "excerpt", "description", "content"],
      "Chưa có phần tóm tắt."
    );
  }

  function getImage(post) {
    return getValue(
      post,
      ["image", "imageUrl", "thumbnail", "thumbnailUrl", "cover"],
      ""
    );
  }

  function getCategory(post) {
    return getValue(
      post,
      ["category", "categoryName", "categoryTitle"],
      "Tin tức"
    );
  }

  function getDate(post) {
    return getValue(
      post,
      ["publishedAt", "publishDate", "date", "createdAt", "publishedDate"],
      ""
    );
  }

  // Chuyển ngày đăng thành số để sắp xếp.
  function getTimestamp(post) {
    const timestamp = Date.parse(getDate(post));
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  function formatDate(post) {
    const timestamp = getTimestamp(post);

    if (!timestamp) return "";

    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(new Date(timestamp));
  }

  // Tạo phần tử HTML an toàn cho văn bản.
  function createTextElement(tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
  }

  // Tạo ảnh; nếu không có ảnh thì hiển thị thông báo thay thế.
  function createImage(post, className) {
    const imageUrl = getImage(post);

    if (!imageUrl) {
      return createTextElement(
        "div",
        `${className} image-placeholder`,
        "Chưa có hình ảnh"
      );
    }

    const image = document.createElement("img");
    image.className = className;
    image.src = imageUrl;
    image.alt = getTitle(post);
    image.loading = "lazy";

    image.addEventListener("error", () => {
      const placeholder = createTextElement(
        "div",
        `${className} image-placeholder`,
        "Không tải được hình ảnh"
      );

      image.replaceWith(placeholder);
    });

    return image;
  }

  // Khi bấm vào bài viết, mở trang chi tiết theo ID.
  function openDetail(post) {
    const id = getPostId(post);

    if (id === "" || id === undefined || id === null) {
      console.error("Bài viết thiếu trường id:", post);
      return;
    }

    window.location.href =
      "detail.html?id=" + encodeURIComponent(String(id));
  }

  // Tạo một thẻ bài viết nhỏ ở khu vực Top Section.
  function createSmallCard(post) {
    const card = document.createElement("article");
    card.className = "top-small-card";
    card.tabIndex = 0;
    card.setAttribute("role", "link");
    card.setAttribute("aria-label", "Đọc bài: " + getTitle(post));

    card.appendChild(createImage(post, "top-small-image"));

    const content = document.createElement("div");
    content.className = "top-small-content";

    content.appendChild(
      createTextElement("span", "post-category", getCategory(post))
    );
    content.appendChild(
      createTextElement("h3", "top-small-title", getTitle(post))
    );

    card.appendChild(content);

    card.addEventListener("click", () => openDetail(post));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDetail(post);
      }
    });

    return card;
  }

  // Tạo bài viết lớn nổi bật.
  function createFeaturedCard(post) {
    const card = document.createElement("article");
    card.className = "featured-card";
    card.tabIndex = 0;
    card.setAttribute("role", "link");
    card.setAttribute("aria-label", "Đọc bài: " + getTitle(post));

    card.appendChild(createImage(post, "featured-image"));

    const content = document.createElement("div");
    content.className = "featured-content";

    content.appendChild(
      createTextElement("span", "post-category", getCategory(post))
    );
    content.appendChild(
      createTextElement("h2", "featured-title", getTitle(post))
    );
    content.appendChild(
      createTextElement("p", "featured-summary", getSummary(post))
    );

    const date = formatDate(post);
    if (date) {
      content.appendChild(
        createTextElement("time", "post-date", date)
      );
    }

    card.appendChild(content);

    card.addEventListener("click", () => openDetail(post));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDetail(post);
      }
    });

    return card;
  }

  // Tạo một dòng trong danh sách bài viết còn lại.
  function createListItem(post) {
    const item = document.createElement("article");
    item.className = "post-list-item";

    const link = document.createElement("a");
    link.className = "post-list-link";
    link.href =
      "detail.html?id=" + encodeURIComponent(String(getPostId(post) ?? ""));

    link.appendChild(createImage(post, "post-list-image"));

    const content = document.createElement("div");
    content.className = "post-list-content";

    content.appendChild(
      createTextElement("span", "post-category", getCategory(post))
    );
    content.appendChild(
      createTextElement("h3", "post-list-title", getTitle(post))
    );
    content.appendChild(
      createTextElement("p", "post-list-summary", getSummary(post))
    );

    const date = formatDate(post);
    if (date) {
      content.appendChild(
        createTextElement("time", "post-date", date)
      );
    }

    link.appendChild(content);
    item.appendChild(link);

    return item;
  }

  // Hiển thị Top Section và danh sách dọc.
  function renderPosts(posts, categoryName = "") {
    // Xóa kết quả cũ trước khi hiển thị kết quả mới.
    featuredContainer.replaceChildren();
    sideContainer.replaceChildren();
    listContainer.replaceChildren();

    if (titleElement) {
      titleElement.textContent = categoryName
        ? "Tin tức: " + categoryName
        : "Tin tức mới nhất";
    }

    if (countElement) {
      countElement.textContent = `${posts.length} bài viết`;
    }

    if (posts.length === 0) {
      listContainer.appendChild(
        createTextElement(
          "p",
          "empty-message",
          "Chưa có bài viết trong chuyên mục này."
        )
      );
      return;
    }

    // Bài mới nhất làm bài lớn bên trái.
    featuredContainer.appendChild(createFeaturedCard(posts[0]));

    // Bài thứ 2 và thứ 3 hiển thị nhỏ bên phải.
    posts.slice(1, 3).forEach((post) => {
      sideContainer.appendChild(createSmallCard(post));
    });

    // Từ bài thứ 4 trở đi hiển thị thành danh sách dọc.
    posts.slice(3).forEach((post) => {
      listContainer.appendChild(createListItem(post));
    });
  }

  // Lọc theo chuyên mục.
  function filterByCategory(categoryName) {
    const category = normalizeText(categoryName);

    if (!category || category === "tất cả tin" || category === "tất cả") {
      renderPosts(allPosts);
      return;
    }

    const filtered = allPosts.filter((post) => {
      return normalizeText(getCategory(post)) === category;
    });

    renderPosts(filtered, categoryName);
  }

  // Cho phép các nút chuyên mục gọi hàm lọc.
  // Ví dụ: <button data-category="Thế giới">Thế giới</button>
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");

    if (!button) return;

    const categoryName = button.dataset.category;

    document.querySelectorAll("[data-category]").forEach((element) => {
      element.classList.toggle("active", element === button);
    });

    filterByCategory(categoryName);
  });

  // Đọc dữ liệu bài viết từ file JSON.
  async function loadPosts() {
    try {
      const response = await fetch("posts.json");

      if (!response.ok) {
        throw new Error(
          `Không thể tải posts.json (HTTP ${response.status}).`
        );
      }

      const data = await response.json();

      // Chấp nhận JSON là mảng hoặc object chứa mảng posts.
      const posts = Array.isArray(data)
        ? data
        : Array.isArray(data.posts)
          ? data.posts
          : [];

      if (posts.length === 0) {
        throw new Error(
          "posts.json không có danh sách bài viết hợp lệ."
        );
      }

      // Lọc bài có ID và sắp xếp theo ngày đăng mới nhất trước.
      allPosts = posts
        .filter((post) => getPostId(post) !== "")
        .sort((a, b) => getTimestamp(b) - getTimestamp(a));

      // Nếu URL có ?category=Thế%20giới thì tự lọc chuyên mục đó.
      const params = new URLSearchParams(window.location.search);
      const categoryFromUrl = params.get("category");

      if (categoryFromUrl) {
        filterByCategory(categoryFromUrl);
      } else {
        renderPosts(allPosts);
      }
    } catch (error) {
      console.error("Lỗi tải bài viết:", error);

      listContainer.replaceChildren(
        createTextElement(
          "p",
          "error-message",
          "Không tải được bài viết. Hãy kiểm tra file posts.json và tên các trường dữ liệu."
        )
      );
    }
  }

  loadPosts();
});
