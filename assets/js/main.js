// =========================
// CARREGAR MENU E FOOTER
// =========================
// Antes: o fetch só começava quando o navegador chegava nesse <script>,
// no fim do body — depois de baixar todo o HTML, CSS e imagens da página.
// Isso deixava o menu (dentro da .banner) alguns instantes "em branco".
//
// Agora usamos cache do navegador (force-cache) para que, a partir da
// segunda visita, o menu e o footer apareçam instantaneamente sem nem
// precisar esperar a rede. Combinado com o <link rel="preload"> colocado
// no <head> de cada página (que já dispara esse download antes mesmo do
// <script> ser lido), a primeira visita também fica bem mais rápida.

function carregarInclude(url, elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;

    fetch(url, { cache: "force-cache" })
        .then(response => response.text())
        .then(data => {
            el.innerHTML = data;

            // Se acabamos de injetar o menu, avisa o resto do script
            // (útil caso algo dependa do menu já estar no DOM).
            if (elementId === "menu") {
                document.dispatchEvent(new CustomEvent("menu:pronto"));
            }
        })
        .catch(() => {
            // Falha de rede: evita deixar o espaço vazio sem explicação.
            el.innerHTML = "";
        });
}

carregarInclude("/includes/nav.html", "menu");
carregarInclude("/includes/footer.html", "footer");

// =========================
// SLIDER BANNER
// =========================
// Bug corrigido: antes, nenhum slide começava com a classe "active" via
// JS, e o showSlide(0) só era chamado indiretamente pelo setInterval
// depois de 5 segundos. Resultado: o banner ficava vazio (ou pulava
// direto pro 2º slide) por até 5s a cada carregamento de página.
// Agora o primeiro slide é ativado imediatamente, de forma síncrona.

const slides = document.querySelectorAll(".banner-slide");
const prevBtn = document.querySelector(".banner-btn.prev");
const nextBtn = document.querySelector(".banner-btn.next");
const indicators = document.querySelectorAll(".indicator");

if (slides.length > 0) {
    let currentIndex = 0;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove("active"));
        indicators.forEach(ind => ind.classList.remove("active"));

        slides[index].classList.add("active");
        if (indicators[index]) indicators[index].classList.add("active");

        currentIndex = index;
    }

    function nextSlide() {
        const newIndex = (currentIndex + 1) % slides.length;
        showSlide(newIndex);
    }

    function prevSlide() {
        const newIndex = (currentIndex - 1 + slides.length) % slides.length;
        showSlide(newIndex);
    }

    // Mostra o primeiro slide AGORA, sem esperar o timer.
    showSlide(0);

    if (nextBtn) nextBtn.addEventListener("click", nextSlide);
    if (prevBtn) prevBtn.addEventListener("click", prevSlide);

    indicators.forEach(indicator => {
        indicator.addEventListener("click", () => {
            const index = parseInt(indicator.getAttribute("data-index"), 10);
            showSlide(index);
        });
    });

    // Troca automática a cada 5 segundos
    setInterval(nextSlide, 5000);
}
