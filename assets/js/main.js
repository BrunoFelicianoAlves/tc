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

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove("active"));
    indicators.forEach(ind => ind.classList.remove("active"));

    slides[index].classList.add("active");
    indicators[index].classList.add("active");

    currentIndex = index;
}

function nextSlide() {
    let newIndex = (currentIndex + 1) % slides.length;
    showSlide(newIndex);
}

function prevSlide() {
    let newIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(newIndex);
}

// Eventos dos botões
nextBtn.addEventListener("click", nextSlide);
prevBtn.addEventListener("click", prevSlide);

// Evento dos indicadores
indicators.forEach(indicator => {
    indicator.addEventListener("click", () => {
        let index = parseInt(indicator.getAttribute("data-index"));
        showSlide(index);
    });
});

// Troca automática a cada 5 segundos
setInterval(nextSlide, 5000);