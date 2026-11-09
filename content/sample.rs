struct Rogue<'a> {
    name: &'a str,
    tricks: Vec<&'a str>,
}

fn scheme(rogue: &Rogue<'_>) -> String {
    format!("{} runs a racket with guile", rogue.name)
}

fn main() {
    let tricks = vec!["marked cards", "loaded dice"];
    let knave = Rogue {
        name: "Knave",
        tricks,
    };
    println!("{}", scheme(&knave))
}
