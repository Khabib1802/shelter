function initBurger() {
  const burgerButton = document.querySelector(".burger");
  const navLinks = document.querySelectorAll(".nav__link");
  const overlay = document.querySelector(".overlay");
  const body = document.body;

  const toggleMenu = () => {
    body.classList.toggle("is-open");
  };

  const closeMenu = () => {
    body.classList.remove("is-open");
  };

  if (burgerButton) {
    burgerButton.addEventListener("click", toggleMenu);
  }

  if (overlay) {
    overlay.addEventListener("click", closeMenu);
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

export default initBurger;
