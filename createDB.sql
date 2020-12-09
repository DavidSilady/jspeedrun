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
    id         serial                not null
        constraint orders_pk
            primary key,
    product_id integer               not null
        constraint orders_products_id_fk
            references products,
    volume     integer default 1     not null,
    state      boolean default false not null
);

alter table orders
    owner to postgres;

create unique index orders_id_uindex
    on orders (id);
