create table users (
	id serial primary key,
	login varchar(30),
	email varchar(50),
	password varchar(500),
	"countryCode" varchar(3),
	"isPublic" boolean,
	phone TEXT,
	image varchar(200)
	-- friends text[]
)