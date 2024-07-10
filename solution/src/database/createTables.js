const createTables = async (sequelize) => {
    try {
        await sequelize.query(`
            create table tokens (
                id serial primary key,
                token text,
                login varchar(30)
            );
            
            create table users (
                id serial primary key,
                login varchar(30),
                email varchar(50),
                password varchar(500),
                "countryCode" varchar(3),
                "isPublic" boolean,
                phone TEXT,
                image varchar(200)
            );

            create table posts (
                id serial primary key,
                "postId" VARCHAR(100),
                content VARCHAR(1000),
                author VARCHAR(30),
                tags text[],
                "createdAt" TIMESTAMP WITH TIME ZONE,
                likes text[],
                dislikes text[]
            );

            create table friends (
                id serial primary key,
                login text,
                "subscribedTo" text,
                "addedAt" TIMESTAMP
            );
        `)
        
    } catch (_error) {
        console.log(_error)
        return
    }
}

module.exports = {createTables}