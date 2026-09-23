// Carregar menu
fetch("/includes/nav.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("menu").innerHTML = data;
    });

// Carregar footer
fetch("/includes/footer.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("footer").innerHTML = data;
    });

// =========================
// SLIDER BANNER
// =========================

const slides = document.querySelectorAll(".banner-slide");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");
const indicators = document.querySelectorAll(".indicator");

let currentIndex = 0;

// Carrega a imagem somente quando o slide for exibido.
// Isso evita baixar todos os banners logo na abertura da página.
function loadSlideImage(index) {
    const img = slides[index]?.querySelector("img[data-src]");

    if (img && !img.src) {
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
    }
}

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove("active"));
    indicators.forEach(ind => ind.classList.remove("active"));

    loadSlideImage(index);

    slides[index].classList.add("active");
    indicators[index].classList.add("active");

    currentIndex = index;
}

// Primeiro banner aparece imediatamente.
showSlide(0);

function nextSlide() {
    const newIndex = (currentIndex + 1) % slides.length;
    showSlide(newIndex);
}

function prevSlide() {
    const newIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(newIndex);
}

nextBtn.addEventListener("click", nextSlide);
prevBtn.addEventListener("click", prevSlide);

indicators.forEach(indicator => {
    indicator.addEventListener("click", () => {
        const index = parseInt(indicator.getAttribute("data-index"), 10);
        showSlide(index);
    });
});

// Troca automática a cada 5 segundos.
setInterval(nextSlide, 5000);

