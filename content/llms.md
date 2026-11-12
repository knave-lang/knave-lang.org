# Writing Knave with a language model

Language models have read far more Rust than Knave, so a model that writes Knave tends to reach for Rust's syntax and names. This page lists the places where Knave differs from Rust and explains how to read the errors Knave reports, so you and your model can fix code quickly. Every example on this page was checked with Knave 0.14.21.

## Idioms that differ from Rust

Knave compiles to Rust and keeps Rust's model, but the surface is a Lisp with its own names. Each entry shows the Rust habit, the Knave that works, and why.

### Ownership and borrowing

```rust
fn add_bonus(scores: &mut Vec<i64>) { scores.push(10) }
add_bonus(&mut scores);
let copy = scores.clone();
```

```knave
(defn add-bonus! (scores) (push! scores 10))

(defn main ()
  (local scores (vec 1 2 3))
  (add-bonus! scores)
  (local copy (clone scores))
  (println (len copy)))
```

Write no `&` or `&mut`. The compiler infers each parameter's mode from its uses, so `add-bonus!` takes `&mut Vec<i64>` and the call passes `&mut scores`. `&scores` is a symbol in Knave, and the check reports it as an unknown name. Write `(ref x)` or `(mut x)` only to force a borrow, and `(clone x)` for every copy of heap data, since the compiler never clones for you. Run `knave types file.knv` to see the modes it picked.

### Mutation

```rust
let mut count = 0;
count += 1;
```

```knave
(local count 0)
(set! count (+ count 1))
```

Every `local` can change, so there is no `mut` keyword, and `set!` replaces `+=`. The emitted Rust still uses `count += 1`.

### Loops

```rust
for i in 0..3 { println!("{}", i); }
while i < 3 { ... }
```

```knave
(for-each (range 0 3)
  (fn (i) (println i)))
(println (loop (i 0
                total 0)
           (if (< i 3)
             (recur (+ i 1) (+ total i))
             total)))
```

Knave has no `for` or `while`. `for-each` calls a function on each item, and `loop` with `recur` in tail position compiles to a Rust `loop`. A function that calls itself in tail position becomes a loop too.

### Conditionals

```rust
if n > 2 { println!("big"); }
```

```knave
(when (> n 2) (println "big"))
(println (if (> n 2) "big" "small"))
(cond
  ((> n 5) "large")
  ((> n 2) "medium")
  (else "small"))
```

`if` always takes both branches, so a one-armed `if` is an error that points to `when`. `cond` wraps each clause in its own list and a last `(else ...)` clause handles every other case, unlike Clojure's flat `cond`. Without `else`, every body must return unit.

### `match` and patterns

```rust
match n { Some(v) => v, None => 0 }
```

```knave
(defenum shape
  (circle f64)
  (rect f64 f64)
  point)

(defn area (s)
  (match s
    ((circle r) (* 3.0 r r))
    ((rect w h) (* w h))
    (point 0.0)))

(defn describe (n)
  (match n ((some v) v) (none 0)))
```

Each arm is one list: a pattern, then the body. There is no `=>`, and variants are lowercase, so `(Some v)` is not a pattern. A pattern may write the variant alone, `(circle r)`, or with its enum, `(shape/circle r)`. A `match` must cover every variant.

### Structs and enums

```rust
struct Point { x: f64, y: f64 }
let p = Point { x: 1.0, y: 2.0 };
p.x
Shape::Circle(1.0)
```

```knave
(defstruct point
  :x f64
  :y f64)

(defenum shape
  (circle f64)
  (labeled :text string :size f64)
  point)

(defn main ()
  (local p (->point :x 1.0 :y 2.0))
  (local q (->point 3.0 4.0))
  (println (+ (:x p) (:y q)))
  (local moved (assoc p :x 5.0))
  (println (:x moved))
  (prn (shape/circle 1.0))
  (prn (shape/labeled :text (str "box") :size 2.0))
  (prn shape/point))
```

`defstruct` defines the constructor `->point`, which takes the fields by `:label` or by position. `(:x p)` reads a field, since `p.x` is one symbol. `assoc` returns a copy with fields replaced. An enum variant is `shape/circle`, with a slash where Rust writes `::`.

### Traits

```rust
trait Shape { fn area(&self) -> f64; }
impl Shape for Circle { fn area(&self) -> f64 { 3.0 * self.radius * self.radius } }
impl fmt::Display for Point { ... }
```

```knave
(defstruct circle
  :radius f64)

(deftrait shape
  (area (fn ((ref self)) f64)))

(impl shape circle
  (area (c)
        (* 3.0 (:radius c) (:radius c))))

(defstruct point
  :x i64
  :y i64)

(display point (p)
  "("
  (:x p)
  ", "
  (:y p)
  ")")
```

`impl` names the trait, then the type. The receiver is the first parameter, named like any other. A method is called as a function, `(area c)`. `display` writes the `Display` impl from printing parts, so `(println (->point 1 2))` prints `(1, 2)`. Trait names are lowercase: `Display` is unknown, and the check suggests `display`.

### `use` and modules

```rust
use crate::geometry::{distance, Point};
```

```knave
; geometry.knv
(export ->point distance point)

(defstruct point
  :x f64
  :y f64)

(defn distance (a b)
  (local dx (- (:x a) (:x b)))
  (local dy (- (:y a) (:y b)))
  (sqrt (+ (* dx dx) (* dy dy))))

; main.knv
(use geometry ->point distance)

(defn main ()
  (println (distance (->point 0.0 0.0) (->point 3.0 4.0))))
```

One file is one module, and a module path is a file path without `.knv`. A name stays private until the file lists it in `export`. Knave has no `{}` import groups and no `std::` paths. List the names after the module, and use the prelude, which every module sees.

### Strings

```rust
let name = String::from("ana");
format!("hello {}", name)
```

```knave
(defstruct user
  :name string)

(defn greeting (name) (str "hello " name))

(defn main ()
  (local u (->user (str "ana")))
  (println (greeting (:name u)))
  (println (len "four"))
  (println (upper-case "shout")))
```

A literal is a `(ref str)`, so a `string` field needs `(str "ana")`. `str` joins its arguments into a `string` and replaces `format!`. Knave has no `format`.

### Errors with `result` and `try`

```rust
fn half(text: &str) -> Result<i64, ParseIntError> {
    let n = text.parse::<i64>()?;
    Ok(n / 2)
}
```

```knave
(type half
  (fn ((ref str))
    (result i64 parse-int-error)))

(defn half (text)
  (local n (try (parse text)))
  (ok (/ n 2)))

(defn sum-halves (a b)
  (let-try (x (half a)
            y (half b))
    (ok (+ x y))))

(defn main ()
  (println (unwrap-ok (half "10")))
  (match (sum-halves "4" "six")
    ((ok total) (println total))
    ((err e) (println "error: " e))))
```

`(try x)` is Rust's `x?`, since `?` after a form reads as a separate symbol. `ok`, `err`, `some` and `none` are lowercase. `let-try` applies `try` to each binding. `type` writes a signature apart from the `defn`, as Haskell does.

### Printing

```rust
println!("x = {}", x);
println!("{:?}", items);
```

```knave
(println "x = " x)
(print "no newline ")
(prn (vec 1 2 3))
(println (pr-str (some 4)))
(eprintln "to standard error")
```

`println` prints each argument in turn and takes no format string, so `(println "x = {}" x)` prints `x = {}3`. `prn` and `pr-str` print a value's Knave form, such as `(vec 1 2 3)` or `"quoted"`, where Rust would use `{:?}`.

### Types and signatures

```rust
fn double(x: i64) -> i64 { x * 2 }
let total: i64 = 13;
```

```knave
(type double (fn (i64) i64))

(defn double (x) (* x 2))

(defn triple ((x i64)) (* x 3))

(defn main ()
  (local (total i64)
    (+ (double 2) (triple 3)))
  (println total)
  (println (the u8 7)))
```

Most code needs no types. To pin one, write a `type` signature, a `(name type)` binder, or `(the type value)`. A type is lowercase and applied in a list: `(vec i64)`, not `Vec<i64>`. `x: i64` is a symbol `x:` followed by `i64`.

### Functions inside functions

```rust
fn main() { fn helper(n: i64) -> i64 { n * 2 } ... }
return 1;
```

```knave
(defn main ()
  (local helper (fn (n) (* n 2)))
  (println (helper 2)))
```

`defn` works only at module level, so bind a local `fn` instead. Knave has no `return`: a body's last form is its value.

### Collections

```knave
(defn main ()
  (local items (vec 3 1 2))
  (push! items 4)
  (sort! items)
  (prn items)
  (println (at items 0))
  (println (unwrap-or (get items 9) 0))
  (local doubled
    (collect (map (copied items) (fn (n) (* n 2)))))
  (prn doubled)
  (local ages (hash-map "ana" 31 "bo" 27))
  (println (unwrap (get ages "ana"))))
```

`(vec ...)` replaces `vec![...]`, and the reader rejects `[` and `{`. Functions take the collection first, `(len items)`, in place of `.len()`.

## Reading Knave's errors

### The shape of a diagnostic

Knave prints errors in rustc's layout:

```text
error[L0201]: cannot find `shape::circle` in this scope
 --> bad_enum_colons.knv:4:13
  |
4 |   (local s (shape::circle 1.0))
  |             ^^^^^^^^^^^^^ not found in this scope
  |
help: a name with a similar spelling exists
  |
4 -   (local s (shape::circle 1.0))
4 +   (local s (shape/circle 1.0))
  |
```

- The first line gives the severity, the code and a plain statement of the fault.
- `-->` gives the file, line and column.
- The carets mark the smallest form at fault, with a short label.
- `-` labels mark other forms that explain the error, such as where a value moved.
- `note:` lines state facts. `help:` lines state a fix, and when the fix is an edit they show it as a diff.

A warning has the same shape and does not stop the build.

### Codes

Each Knave error has a code `L` plus four digits. The first two digits name the stage that found it:

| Codes | Stage |
|---|---|
| `L01xx` | Reading the text |
| `L02xx` | Names, modules and hygiene |
| `L03xx` | Macros |
| `L04xx` | Types |
| `L05xx` | Ownership |
| `L06xx` | Building the Rust |
| `L07xx` | The project file |
| `L08xx` | Lints |

A code such as `E0515` comes from rustc. Knave maps it back to the source and adds `note: reported by rustc while compiling the generated Rust`.

### Errors inside a macro call

Many forms, such as `defn`, `when`, `cond` and `let-try`, are macros. An error inside a macro's output keeps a label on the call you wrote and names the macro:

```text
error[L0201]: cannot find `upcase` in this scope
 --> bad_user_macro_name.knv:1:22
  |
1 | (defrule shout ((x) (upcase x)))
  |                      ^^^^^^ not found in this scope
...
4 |   (println (shout "hi")))
  |            ------------ in this macro call
  |
  = note: in this expansion of `shout`
help: a name with a similar spelling exists
  |
1 - (defrule shout ((x) (upcase x)))
1 + (defrule shout ((x) (update x)))
  |
```

A call that fits no shape of the macro reports `L0301` with the shape it accepts:

```text
error[L0301]: no rule of `when` matches this form
 --> bad_macro_shape.knv:2:3
  |
2 |   (when))
  |   ^^^^^^ here
  |
  = help: write it as `(when test body ...)`
```

### Common errors

**`L0201` cannot find a name.** Rust and Clojure spellings fail here first, and so does a Rust `=>` in a `match` arm. Take the suggestion when it fits, but check it: for `for` it suggests `or`, and for `upcase` above it suggests `update` where `upper-case` is meant.

```knave
(+= count 1)
```

```text
error[L0201]: cannot find `+=` in this scope
 --> bad_plus_eq.knv:3:4
  |
3 |   (+= count 1)
  |    ^^ not found in this scope
  |
help: a name with a similar spelling exists
  |
3 -   (+= count 1)
3 +   (+ count 1)
  |
```

Fix: `(set! count (+ count 1))`.

**`L0501` use of moved value.**

```knave
(defn keep (names) names)

(defn main ()
  (local names (vec (str "ana") (str "bo")))
  (local kept (keep names))
  (println (len names)))
```

```text
error[L0501]: use of moved value `names`
 --> bad_moved.knv:6:17
  |
5 |   (local kept (keep names))
  |                     ----- value moved here
6 |   (println (len names)))
  |                 ^^^^^ value used here after it moved
  |
help: clone the value if both places need it
  |
5 -   (local kept (keep names))
5 +   (local kept (keep (clone names)))
  |
```

Fix: clone it as the help shows, or reorder so the last use moves it.

**`L0401` mismatched types.** A string literal is `(ref str)`, not `string`.

```knave
(local u (->user "ana"))
```

```text
error[L0401]: mismatched types
 --> bad_literal.knv:4:20
  |
4 |   (local u (->user "ana"))
  |                    ^^^^^ expected `string`, found `str`
```

Fix: `(->user (str "ana"))`. Numbers do not convert either: `(* width 1.5)` with a width declared `i64` reports ``expected `i64`, found a float``.

**`L0402` wrong argument count.**

```text
error[L0402]: this function takes 2 arguments but 1 was given
 --> bad_arity.knv:4:12
  |
4 |   (println (area 2)))
  |            ^^^^^^^^ expected 2 arguments
```

**`L0433` non-exhaustive `match`.**

```text
error[L0433]: non-exhaustive `match`
 --> bad_match.knv:6:3
  |
6 | /   (match s
7 | |     ((circle r) (* 3.0 r r))))
  | |_____________________________^ this `match` does not cover every value
  |
  = note: missing 1 case: `(rect _ _)`
  = help: add an arm for each missing case
```

Fix: add `((rect w h) ...)` or a `_` arm.

**`L0210` malformed form.** A form has the wrong shape, such as an `if` with one branch.

```text
error[L0210]: malformed `if`
 --> bad_if.knv:3:3
  |
3 |   (if (> n 2) (println "big")))
  |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ this does not fit the shape of `if`
  |
  = help: write `(when test body ...)` to run forms only when the test holds
```

**`L0208` definition inside a body.**

```text
error[L0208]: `defn` can only appear at module level
 --> bad_defn.knv:2:3
  |
2 |   (defn helper (n) (* n 2))
  |   ^^^^^^^^^^^^^^^^^^^^^^^^^ not allowed inside an expression
  |
  = help: use `local` to bind a name inside a body
```

Fix: `(local helper (fn (n) (* n 2)))`.

**`L0514` changing a copy.** A function that `set!`s its parameter needs a place, not a computed value.

```text
error[L0514]: this argument is a copy, so changing it changes nothing
 --> bad_copy.knv:4:10
  |
1 | (defn bump! (n) (set! n (+ n 1)))
  |                 ---------------- `bump!` changes its parameter here
...
4 |   (bump! (+ 1 2)))
  |          ^^^^^^^ this is a copy, not a place
  |
  = help: bind it to a local and pass the local: `(local value (+ 1 2))`
```

**`L0106` a character outside the syntax.** `[`, `]`, `{` and `}` are errors. Write every list with parentheses.

```text
error[L0106]: `[` is not part of the syntax
 --> bad_bracket.knv:2:12
  |
2 |   (println [1 2 3]))
  |            ^ not allowed here
  |
help: every list uses `(` and `)`
  |
2 -   (println [1 2 3]))
2 +   (println (1 2 3]))
  |

error[L0106]: `]` is not part of the syntax
 --> bad_bracket.knv:2:18
  |
2 |   (println [1 2 3]))
  |                  ^ not allowed here
  |
help: every list uses `(` and `)`
  |
2 -   (println [1 2 3]))
2 +   (println [1 2 3)))
  |
```

Fix: `(prn (vec 1 2 3))`. Plain parentheses, `(1 2 3)`, report `L0403` because the first item is called as a function, and `println` reports `L0404` for a vector, which has no `display`.

**`E0515` and other rustc codes.** Some lifetime errors surface only when rustc compiles the output, so they appear on `knave run` or `knave build` and not on `knave check`.

```knave
(defn dangling-name ()
  (local someone (->person (str "Grace") 85))
  (:name someone))
```

```text
error[E0515]: cannot return reference to local data `someone.name`
 --> bad_rustc.knv:7:3
  |
7 |   (:name someone))
  |   ^^^^^^^^^^^^^^^ returns a reference to data owned by the current function
  |
  = note: reported by rustc while compiling the generated Rust
```

Fix: return an owned value, `(clone (:name someone))`.

### Tips for a model

- Run `knave check` after each edit. It runs every stage before rustc and builds no Rust.
- Fix the first error first, because later errors often follow from it.
- Look up a prelude form with `knave doc <name>`, such as `knave doc cond`.
- Run `knave types` to see the signatures and borrows the compiler inferred.

## Names from other languages

A table that maps common Rust and Clojure names to their Knave forms will be added to this page later.
