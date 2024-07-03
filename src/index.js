import Carousel from "./scripts/carousel.js";

document.querySelectorAll(".carousel").forEach((element) => {
  console.log(element);
  new Carousel(element);
});
