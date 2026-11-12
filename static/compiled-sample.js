class CodeForm {
  #element;

  constructor(lines) {
    this.#element = document.createElement("span");
    this.#element.className = "form";
    lines[0].before(this.#element);
    this.#element.append(...lines);
  }

  pairWith(counterpart) {
    this.#element.addEventListener("pointerenter", () => {
      this.highlight();
      counterpart.highlight();
    });
    this.#element.addEventListener("pointerleave", () => {
      this.unhighlight();
      counterpart.unhighlight();
    });
  }

  highlight() {
    this.#element.classList.add("matched");
  }

  unhighlight() {
    this.#element.classList.remove("matched");
  }

  top() {
    return this.#element.getBoundingClientRect().top;
  }
}

class CodePane {
  #code;

  constructor(code) {
    this.#code = code;
  }

  lineGroups() {
    const groups = [[]];
    for (const line of this.#code.querySelectorAll(".line")) {
      if (CodePane.#isBlank(line)) groups.push([]);
      else groups.at(-1).push(line);
    }
    return groups.filter((lines) => lines.length > 0);
  }

  static #isBlank(line) {
    return line.textContent.trim() === "";
  }
}

class PaneSwitch {
  static #LABELS = ["Knave", "Rust"];
  static #NARROW_LAYOUT = "(width < 62.4375em)";

  #session;
  #panes;
  #formsByPane;
  #bar;
  #buttons;
  #shown = 0;

  constructor(session, formsByPane) {
    this.#session = session;
    this.#panes = [...session.querySelectorAll(".pane")];
    this.#formsByPane = formsByPane;
    this.#buttons = PaneSwitch.#LABELS.map((label, index) => this.#button(label, index));
    this.#bar = document.createElement("div");
    this.#bar.className = "pane-switch";
    this.#bar.setAttribute("role", "group");
    this.#bar.setAttribute("aria-label", "Show the program in");
    this.#bar.append(...this.#buttons);
  }

  attach() {
    this.#session.prepend(this.#bar);
    this.#session.classList.add("switchable");
    this.#render();
  }

  #button(label, index) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button";
    button.textContent = label;
    button.addEventListener("click", () => this.#show(index));
    return button;
  }

  #show(index) {
    if (index === this.#shown) return;
    const position = this.#readingPosition();
    const offsetOnScreen = this.#formsByPane[this.#shown][position].top();
    this.#shown = index;
    this.#render();
    this.#keepOnScreen(this.#formsByPane[index][position], offsetOnScreen);
  }

  #readingPosition() {
    const bar = this.#bar.getBoundingClientRect();
    const readingLine = bar.bottom - bar.height;
    const forms = this.#formsByPane[this.#shown];
    const firstStartingOnScreen = forms.findIndex((form) => form.top() >= readingLine);
    return firstStartingOnScreen === -1 ? forms.length - 1 : firstStartingOnScreen;
  }

  #keepOnScreen(form, offsetOnScreen) {
    if (matchMedia(PaneSwitch.#NARROW_LAYOUT).matches) scrollBy(0, form.top() - offsetOnScreen);
  }

  #render() {
    this.#panes.forEach((pane, index) => pane.toggleAttribute("data-hidden", index !== this.#shown));
    this.#buttons.forEach((button, index) => button.setAttribute("aria-pressed", index === this.#shown));
  }
}

class CompiledSample {
  static enhance() {
    const session = document.querySelector(".session");
    const [source, emitted] = [...document.querySelectorAll(".session pre code")]
      .map((code) => new CodePane(code).lineGroups());
    if (!emitted || source.length !== emitted.length) return;
    const sourceForms = source.map((lines) => new CodeForm(lines));
    const emittedForms = emitted.map((lines) => new CodeForm(lines));
    sourceForms.forEach((form, index) => CompiledSample.#pair(form, emittedForms[index]));
    new PaneSwitch(session, [sourceForms, emittedForms]).attach();
  }

  static #pair(sourceForm, emittedForm) {
    sourceForm.pairWith(emittedForm);
    emittedForm.pairWith(sourceForm);
  }
}

CompiledSample.enhance();
