// Carregar menu
fetch("/includes/nav.html")
    .then(response => {
        if (!response.ok) {
            throw new Error("Erro ao carregar o menu.");
        }
        return response.text();
    })
    .then(data => {
        const menu = document.getElementById("menu");

        if (menu) {
            menu.innerHTML = data;
        }
    })
    .catch(error => {
        console.error("Erro ao carregar o menu:", error);
    });

// Carregar menu
fetch("/includes/footer.html")
    .then(response => {
        if (!response.ok) {
            throw new Error("Erro ao carregar o footer.");
        }
        return response.text();
    })
    .then(data => {
        const footer = document.getElementById("footer");

        if (footer) {
            footer.innerHTML = data;
        }
    })
    .catch(error => {
        console.error("Erro ao carregar o footer:", error);
    });

// =========================
// SLIDER BANNER
// =========================

document.addEventListener("DOMContentLoaded", () => {

    const slides = document.querySelectorAll(".banner-slide");
    const prevBtn = document.querySelector(".prev");
    const nextBtn = document.querySelector(".next");
    const indicators = document.querySelectorAll(".indicator");

    if (!slides.length) {
        return;
    }

    let currentIndex = 0;

    function showSlide(index) {

        // Garante que o índice fique dentro do limite
        if (index < 0) {
            index = slides.length - 1;
        }

        if (index >= slides.length) {
            index = 0;
        }

        slides.forEach(slide => {
            slide.classList.remove("active");
        });

        indicators.forEach(indicator => {
            indicator.classList.remove("active");
        });

        slides[index].classList.add("active");

        if (indicators[index]) {
            indicators[index].classList.add("active");
        }

        currentIndex = index;
    }

    function nextSlide() {
        showSlide(currentIndex + 1);
    }

    function prevSlide() {
        showSlide(currentIndex - 1);
    }

    // Primeiro banner
    showSlide(0);

    // Botão próximo
    if (nextBtn) {
        nextBtn.addEventListener("click", nextSlide);
    }

    // Botão anterior
    if (prevBtn) {
        prevBtn.addEventListener("click", prevSlide);
    }

    // Indicadores
    indicators.forEach(indicator => {

        indicator.addEventListener("click", () => {

            const index = parseInt(
                indicator.getAttribute("data-index"),
                10
            );

            if (!Number.isNaN(index)) {
                showSlide(index);
            }

        });

    });

    // Troca automática
    setInterval(nextSlide, 5000);

});