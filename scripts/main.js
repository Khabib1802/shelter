import initBurger from "./burger.js";
import initCarousel from "./carousel.js";
import initPagination from "./pagination.js";
import initPopup from "./popup.js";

function init() {
  initBurger();
  initPopup();

  const carouselContainer = document.querySelector(".friends__slider");
  const paginationContainer = document.querySelector(".friends-full__slider");

  if (carouselContainer) {
    initCarousel();
  }

  if (paginationContainer) {
    initPagination();
  }
}

init();
