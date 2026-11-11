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

class CompiledSample {
  static highlightMatchingForms() {
    const [source, emitted] = [...document.querySelectorAll(".session pre code")]
      .map((code) => new CodePane(code).lineGroups());
    if (!emitted || source.length !== emitted.length) return;
    const sourceForms = source.map((lines) => new CodeForm(lines));
    const emittedForms = emitted.map((lines) => new CodeForm(lines));
    sourceForms.forEach((form, index) => CompiledSample.#pair(form, emittedForms[index]));
  }

  static #pair(sourceForm, emittedForm) {
    sourceForm.pairWith(emittedForm);
    emittedForm.pairWith(sourceForm);
  }
}

CompiledSample.highlightMatchingForms();
