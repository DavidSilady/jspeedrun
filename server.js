//Author: David Silady (2020)
require('dotenv').config()

const express = require('express')
const session = require('express-session')
const fs = require('fs')
const { promisify } = require('util');
const cookieParser = require('cookie-parser')
const Pool = require('pg').Pool





async function startServer() {
    let tries = 10
    let pool
    while (tries) {
        try {
            pool = new Pool({
                user: 'postgres',
                host: 'localhost',
                database: 'postgres',
                password: 'postgres',
                port: 5432,
            })
            break
        } catch (e) {
            console.log(e)
            await new Promise(res => setTimeout(res, 5000))
            tries -= 1
        }
        console.log(`Tries left: ${tries}`)
    }
    console.log('DB set up')

    const IS_HTTPS = false
    const PORT = 8080
    const COOKIE_AGE = 1000 * 60 * 60 * 24 * 30 // 30 days

    const app = express()
    await pool.query(`SELECT nextval('ad_hit_counter')`)

    //development only
    // app.use((req, res, next) => {
    //     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
    //     res.setHeader('Access-Control-Allow-Credentials', true)
    //     res.setHeader(
    //         'Access-Control-Allow-Headers',
    //         'Origin, X-Requested-Width, Content-Type, Accept, Authorization')
    //     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS, PUT')
    //     next()
    // })

    const sessionParser = session({
        secret: 'key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: COOKIE_AGE
        }
    })

    app.use(sessionParser)
    app.use(express.json({limit: '50mb'}));
    app.use(express.urlencoded({limit: '50mb', extended: true}));

    app.use(cookieParser())

    app.use(express.static('./build'))
    app.use(express.static('./media'))

    //REST
    app.get('/products', async function (req, res) {
        try {
            const query = 'SELECT * FROM public.products'
            const result = await pool.query(query)
            res.status(200).json({data: result.rows, msg: "Data served."})
        } catch (e) {
            console.log(e)
            res.status(500).json({msg: "Something went wrong."})
        }
    })

    app.post('/new_order', async function (req, res) {
        const customer = req.body.customer;
        if (! customer) return res.status(400).json({msg: "Missing customer info."})
        const items = req.body.cart;
        if (! items) return res.status(400).json({msg: "Missing items for purchase."})
        ;(async () => {
            // note: we don't try/catch this because if connecting throws an exception
            // we don't need to dispose of the client (it will be undefined)
            const client = await pool.connect()
            let id
            try {
                await client.query('BEGIN')
                const query = `SELECT id FROM public.customers WHERE name = $1`
                const result = await client.query(query, [customer.name])
                if (result.rows[0] && result.rows[0].id) {
                    id = result.rows[0].id
                    const statement =
                        `UPDATE public.customers
                        SET
                        street = $1,
                        number = $2,
                        city = $3,
                        zip = $4
                        WHERE id = $5`
                    await client.query(
                        statement,
                        [
                            customer.street,
                            customer.number,
                            customer.city,
                            customer.zip,
                            id
                        ]
                    )
                } else {
                    const statement =
                        `INSERT INTO public.customers
                        (name, street, number, city, zip) 
                        VALUES 
                        ($1, $2, $3, $4, $5)
                        RETURNING id`
                    const result = await client.query(
                        statement,
                        [
                            customer.name,
                            customer.street,
                            customer.number,
                            customer.city,
                            customer.zip
                        ]
                    )
                    id = result.rows[0].id
                }

                let item
                for (item of items) {
                    const statement = `INSERT INTO public.orders 
                        (product_id, volume, customer_id) 
                        VALUES 
                        ($1, $2, $3)`
                    await client.query(
                        statement,
                        [item.product.id, item.volume, id]
                    )
                }

                await client.query('COMMIT')
                res.status(200).json({msg: "Order successful!"})
            } catch (e) {
                await client.query('ROLLBACK')
                console.log(e)
                res.status(500).json({msg: "Something went wrong, please try again later."})
            } finally {
                client.release()
            }
        })().catch(e => console.error(e.stack))
    })

    app.post('/ad_click', async function (req, res){
        try {
            await pool.query(`SELECT nextval('ad_hit_counter')`)
            res.status(200).json({msg: "Click registered."})
        } catch (e) {
            res.status(500).json({msg: "Something went wrong."})
            console.log(e)
        }
    })

    app.get('/ad_clicks', async function (req, res) {
        try {
            const result = await pool.query(`SELECT currval('ad_hit_counter')`)
            res.status(200).json({msg: "Serving clicks.", data: result.rows[0].currval})
        } catch (e) {
            res.status(500).json({msg: "Something went wrong."})
            console.log(e)
        }
    })

    app.get('/orders', async function (req, res) {
        try {
            const result = await pool.query(
                `SELECT o.id id, o.state state, c.name, c.street, c.number, c.zip, c.city, p.name product, o.volume volume, p.price, (p.price * o.volume) total_price FROM orders o
                INNER JOIN customers c on c.id = o.customer_id
                INNER JOIN products p on p.id = o.product_id`
            )
            res.status(200).json({msg: "Fetch successful.", data: result.rows})
        } catch (e) {
            res.status(500).json({msg: "Something went wrong."})
            console.log(e)
        }
    })

    //For React Browser Routing
    app.get('*', function (req, res) {
        res.status(200).sendFile('./build/index.html', {root: __dirname})
    })

    //LISTEN
    app.listen(PORT, () => console.log(`Listening for HTTP connection on port: ${PORT}`));
}
startServer().then(r => {})