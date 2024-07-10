create table posts (
    id serial primary key,
    "postId" VARCHAR(100),
    content VARCHAR(1000),
    author VARCHAR(30),
    tags text[],
    "createdAt" TIMESTAMP WITH TIME ZONE,
    likes text[],
    dislikes text[]
)