export default class Carousel {
  constructor(element) {
    this.elements = {
      root: element,
      scroller: element.querySelector(".carousel__container"),
      previous: element.querySelectorAll(".pagination-button_back"),
      next: element.querySelectorAll(".pagination-button_forward"),
      pagination: element.querySelectorAll(".pagination"),
      dots: element.querySelector(".pagination__dots"),
      currentText: element.querySelector(".pagination__current"),
      totalText: element.querySelector(".pagination__total"),
    };
    console.log(this.elements);

    this.observerOptions = {
      root: element,
      rootMargin: "0px",
      threshold: 0.6,
    };

    /**
     * @param {boolean} isAutoPlay Change to next slide automatically
     */
    console.log(this.elements.root.dataset.autoplay);
    this.isAutoplay = this.elements.root.dataset.autoplay;

    this.autoplayTimer = null;

    /**
     * @param {boolean} isLooped Go to the first slide on reaching the last
     */
    this.isLooped = this.elements.root.dataset.looped;

    // this.current = new Set();
    this.current = null;

    /**
     * @property {number} currentIndex Index of the current slide
     */
    this.currentIndex = 0;

    this.total = this.elements.scroller.children.length;

    this.renderDots();
    this.updateText();
    this.updateControls();
    this.createObserver();
    this.setAutoplay();
    this.setListeners();
  }

  next() {
    const next = this.current.nextElementSibling;

    if (next) {
      this.goToElement(this.currentIndex + 1, next);
      return;
    }

    if (this.isLooped) {
      this.goToElement(0, this.elements.scroller.firstElementChild);
    }
  }

  prev() {
    const previous = this.current.previousElementSibling;
    if (previous) {
      this.goToElement(this.currentIndex - 1, previous);
      return;
    }

    if (this.isLooped) {
      this.goToElement(this.total - 1, this.elements.scroller.lastElementChild);
    }
  }

  goToElement(index, element) {
    const delta = Math.abs(
      this.elements.scroller.offsetLeft - element.offsetLeft
    );
    const scrollerPadding = parseInt(
      getComputedStyle(this.elements.scroller)["padding-left"]
    );

    this.elements.scroller.scrollTo({
      top: 0,
      left: delta - scrollerPadding,
      behavior: "smooth",
    });

    this.currentIndex = index;

    this.updateText();
    this.updateDots();
    this.updateControls();
  }

  updateText() {
    if (!this.elements.currentText) return;
    this.elements.currentText.innerText = this.currentIndex + 1;
    this.elements.totalText.innerText = this.total;
  }

  updateControls() {
    if (this.isLooped) return;

    const { lastElementChild: last, firstElementChild: first } =
      this.elements.scroller;

    const isAtEnd = this.current === last;
    const isAtStart = this.current === first;

    this.elements.next.forEach((element) => {
      element.toggleAttribute("disabled", isAtEnd);
    });
    this.elements.previous.forEach((element) => {
      element.toggleAttribute("disabled", isAtStart);
    });
  }

  updateDots() {
    if (!this.elements.dots) return;

    this.elements.dots
      .querySelectorAll(".pagination__dot_active")
      .forEach((element) => {
        element.classList.remove("pagination__dot_active");
      });
    this.elements.dots
      .querySelector(`[data-index="${this.currentIndex}"]`)
      .classList.add("pagination__dot_active");
  }

  renderDots() {
    if (!this.elements.dots) return;

    let i = 0;
    for (let element of this.elements.scroller.children) {
      this.elements.dots.appendChild(this.createMarker(i, element));
      i++;
    }
  }

  createMarker(index, element) {
    const marker = document.createElement("button");

    marker.className = "pagination__dot";
    marker.type = "button";
    marker.setAttribute("aria-label", "Перейти к карточке");
    marker.setAttribute("data-index", index);
    marker.addEventListener("click", () => {
      this.goToElement(index, element);
    });

    if (index === this.currentIndex)
      marker.classList.add("pagination__dot_active");

    return marker;
  }

  setListeners() {
    this.elements.next.forEach((element) => {
      element.addEventListener("click", this.next.bind(this));
      element.addEventListener("click", this.clearAutoplay.bind(this), {
        once: true,
      });
    });
    this.elements.previous.forEach((element) => {
      element.addEventListener("click", this.prev.bind(this));
      element.addEventListener("click", this.clearAutoplay.bind(this), {
        once: true,
      });
    });
    for (let element of this.elements.scroller.children) {
      this.observer.observe(element);
    }
  }

  createObserver() {
    this.observer = new IntersectionObserver((observations) => {
      for (let observation of observations) {
        if (observation.isIntersecting) {
          this.current = observation.target;
          this.currentIndex = Array.from(
            this.elements.scroller.children
          ).indexOf(observation.target);
        }
      }
      this.updateDots();
      this.updateText();
      this.updateControls();
    }, this.observerOptions);
  }

  setAutoplay() {
    if (this.isAutoplay) {
      this.autoplayTimer = setInterval(() => this.next(), 4000);
    }
  }

  clearAutoplay() {
    if (this.isAutoplay) {
      clearInterval(this.autoplayTimer);
      this.isAutoplay = false;
    }
  }
}
