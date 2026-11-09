struct Rogue<'a> {
    name: &'a str,
    tricks: Vec<&'a str>,
}

fn scheme(rogue: &Rogue<'_>) -> String {
    let trick = &rogue.tricks[0];
    format!("{} runs a racket with guile and {}", rogue.name, trick)
}

fn main() {
    let tricks = vec!["marked cards", "loaded dice"];
    let knave = Rogue {
        name: "Knave",
        tricks,
    };
    println!("{}", scheme(&knave))
}
