import initBurger from "./burger.js";
import initCarousel from "./carousel.js";
import initPagination from "./pagination.js";

function init() {
  initBurger();

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
