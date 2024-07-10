create table friends (
	id serial primary key,
    login text,
    "subscribedTo" text,
    "addedAt" TIMESTAMP
)