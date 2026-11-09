struct Book {
    title: String,
    year: i64,
}

fn titles_after(books: &[Book], year: i64) -> Vec<&str> {
    books
        .iter()
        .filter(|b: &&Book| b.year > year)
        .map(|b: &Book| b.title.as_str())
        .collect::<Vec<_>>()
}
