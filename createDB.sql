create sequence ad_hit_counter
    as integer
    minvalue 0;

alter sequence ad_hit_counter owner to postgres;

create table products
(
    id         serial           not null
        constraint products_pk
            primary key,
    name       varchar          not null,
    "imageSrc" varchar          not null,
    price      double precision not null
);

alter table products
    owner to postgres;

create unique index products_id_uindex
    on products (id);

create table customers
(
    id     serial  not null
        constraint customers_pk
            primary key,
    name   varchar not null,
    street varchar not null,
    number integer not null,
    city   varchar not null,
    zip    varchar not null
);

alter table customers
    owner to postgres;

create unique index customers_id_uindex
    on customers (id);

create unique index customers_name_uindex
    on customers (name);

create table orders
(
    id          serial                not null
        constraint orders_pk
            primary key,
    product_id  integer               not null
        constraint orders_products_id_fk
            references products,
    volume      integer default 1     not null,
    state       boolean default false not null,
    customer_id integer               not null
        constraint orders_customers_id_fk
            references customers
);

alter table orders
    owner to postgres;

create unique index orders_id_uindex
    on orders (id);

INSERT INTO public.products (id, name, "imageSrc", price) VALUES (1, 'Radiator', 'https://cdn.pixabay.com/photo/2014/01/23/17/09/thermostat-250556_1280.jpg', 20.99);
INSERT INTO public.products (id, name, "imageSrc", price) VALUES (2, 'Lobotomy', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Lobotomy_drill_norway_IMG_0982.JPG/1200px-Lobotomy_drill_norway_IMG_0982.JPG', 42.99);
INSERT INTO public.products (id, name, "imageSrc", price) VALUES (3, 'House', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Abad%C3%ADa_de_Bath%2C_Bath%2C_Inglaterra%2C_2014-08-12%2C_DD_07.JPG/1024px-Abad%C3%ADa_de_Bath%2C_Bath%2C_Inglaterra%2C_2014-08-12%2C_DD_07.JPG', 599.99);
