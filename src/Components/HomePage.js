import React from "react"
import Loader from 'react-loader-spinner'
import {getData, postData} from "../ClientCalls";
import {Button, Grid, TextField} from "@material-ui/core"
import {Row, Col} from "react-bootstrap"
import Modal from 'react-modal';


export function HomePage() {
    const [cart, setCart] = React.useState([])
    const [error, setError] = React.useState(null)
    const [isLoaded, setIsloaded] = React.useState(false)
    const [products, setProducts] = React.useState([])

    React.useEffect(() => {
        getData('/products').then(
            (res) => {
                setIsloaded(true)
                setProducts(res.data || [])
            },
            (err) => {
                setError(err)
                setIsloaded(true)
                console.log(err)
            }
        )
    }, [])

    function checkCart(product) {
        for (let index = 0; index < cart.length; index++) {
            if (cart[index].product === product) {
                return index
            }
        }
        return -1
    }

    function handleAddToCart(product) {
        const index = checkCart(product)
        if (index < 0) {
            setCart([
                ...cart,
                {product: product, volume: 1}
            ])
        } else {
            const cartCopy = [...cart]
            cartCopy[index].volume += 1
            setCart(cartCopy)
        }
    }

    function handleRemoveFromCart(removedItem) {
        setCart(cart.filter(function (item) {
            return item !== removedItem
        }))
    }

    function handleSubtractFromCart(item) {
        if (item.volume - 1 === 0) {
            console.log('deleteing')
            handleRemoveFromCart(item)
        } else {
            console.log('subtracting')
            const index = checkCart(item.product)
            if (index < 0) {
                console.log('nope')
                return
            }
            const cartCopy = [...cart]
            cartCopy[index].volume -= 1
            setCart(cartCopy)
        }
    }

    if (error) {
        return <FullPageMessage value={"Ups. Something went wrong."}/>
    } else if (! isLoaded) {
        return <BasicLoader/>
    } else {
        return (
            <Row style={{margin: "0", height: "100vh"}}>
                <Col md={9} style={{backgroundColor: "white"}}>
                    <div>
                        <Button variant={"contained"} color={"secondary"} href={'/admin'}>Admin Page</Button>
                    </div>
                    <ProductsPage products={products} addToCart={handleAddToCart}/>
                </Col>
                <Col md={3} style={{backgroundColor: "orange", padding: "50px"}}>
                    <DisplayCart items={cart} addToCart={handleAddToCart} removeFromCart={handleRemoveFromCart} subtractFromCart={handleSubtractFromCart}/>
                </Col>
            </Row>
        )
    }
}

function DisplayCart({items, addToCart, removeFromCart, subtractFromCart}) {
    const [showingModal, setShowingModal] = React.useState(false)
    const [customer, setCustomer] = React.useState({})
    const [orderResult, setOrderResult] = React.useState("")
    const [showingResultModal, setShowingResultModal] = React.useState(false)

    const modalStyles = {
        content : {
            top                   : '50%',
            left                  : '50%',
            right                 : 'auto',
            bottom                : 'auto',
            marginRight           : '-30%',
            transform             : 'translate(-50%, -50%)'
        }
    };

    function handleModalOpen() {
        setShowingModal(true)
    }

    function handleModalClose() {
        setShowingModal(false)
    }

    function handleSubmit(event) {
        event.preventDefault()
        postData('/new_order', {cart: items, customer: customer}).then(
            (res) => {
                setOrderResult(res.msg)
                setShowingResultModal(true)
            },
            (err) => {
                console.log(err)
            }
        )
    }

    function handleInfoChange(event) {
        setCustomer({
            ...customer,
            [event.target.name]: event.target.value
        })
    }

    async function adClick() {
        await postData('/ad_click', {})
        window.location.replace('/')
    }

    return (
        <>
            <h2>C A R T</h2>
            <div style={{minHeight: "200px"}}>
                {items.length === 0 && <div style={{paddingTop: "70px", textAlign: "center"}}><span>Cart is empty.</span></div>}
                {items.map(item => (
                        <div style={{padding: "20px"}}>
                            <h4>{item.product.name}</h4>
                            <Grid container>
                                <Grid item xs={6}>
                                    Quantity: {item.volume}

                                </Grid>
                                <Grid item xs={6} style={{textAlign: "right"}}>
                                    {(item.volume * item.product.price).toFixed(2)}€
                                </Grid>
                                <Grid item xs={12}>
                                    <Button style={{padding: "0px"}} variant={"contained"} color={"primary"} onClick={() => addToCart(item.product)}>add</Button>
                                    <Button style={{padding: "0px"}} variant={"contained"} onClick={() => subtractFromCart(item)}>sub</Button>
                                    <Button style={{padding: "0px"}} variant={"contained"} onClick={() => removeFromCart(item)}>del</Button>
                                </Grid>
                            </Grid>
                        </div>
                    )
                )}
            </div>
            <Modal
                isOpen={showingModal}
                onRequestClose={handleModalClose}
                style={modalStyles}
                contentLabel="Order"
            >
                <div style={{padding: "50px"}}>
                    <h3 style={{textAlign: "center"}}>ORDER</h3>
                <Row>
                    <Col>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={5}>
                                <Grid item xs={12} md={12}>
                                    <TextField
                                        required
                                        id="name"
                                        name="name"
                                        label="Name"
                                        fullWidth
                                        autoComplete="name"
                                        onChange={handleInfoChange}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={5}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        required
                                        id="street"
                                        name="street"
                                        label="Street"
                                        fullWidth
                                        autoComplete="street-address"
                                        onChange={handleInfoChange}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        required
                                        id="number"
                                        name="number"
                                        label="Number"
                                        fullWidth
                                        autoComplete="address-line1"
                                        onChange={handleInfoChange}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={5}>
                                <Grid item md={6} xs={12}>
                                    <TextField
                                        required
                                        id="city"
                                        name="city"
                                        label="City"
                                        fullWidth
                                        autoComplete="shipping address-level2"
                                        onChange={handleInfoChange}
                                    />
                                </Grid>
                                <Grid item md={6} xs={12}>
                                    <TextField
                                        required
                                        id="zip"
                                        name="zip"
                                        label="Zip Code"
                                        fullWidth
                                        autoComplete="shipping postal-code"
                                        onChange={handleInfoChange}
                                    />
                                </Grid>
                            </Grid>
                            <div style={{padding: "20px", textAlign: "center"}}>
                                <Button variant={"contained"} color={"primary"} type={"submit"}>Submit Order</Button>
                            </div>
                        </form>
                    </Col>
                    <Col>
                        {items.map(item => (
                                <div style={{padding: "20px"}}>
                                    <h4>{item.product.name}</h4>
                                    <Grid container>
                                        <Grid item xs={6}>
                                            Quantity: {item.volume}

                                        </Grid>
                                        <Grid item xs={6} style={{textAlign: "right"}}>
                                            {(item.volume * item.product.price).toFixed(2)}€
                                        </Grid>
                                    </Grid>
                                </div>
                            )
                        )}
                    </Col>
                </Row>


                    <Modal
                        isOpen={showingResultModal}
                        onRequestClose={() => setShowingResultModal(false)}
                        style={modalStyles}
                        contentLabel="Result"
                    >
                        <div style={{padding: "20px", textAlign: "center"}}>
                            <Button onClick={adClick} style={{padding: "40px"}}>
                                i am an ad, click me
                            </Button>
                            <h5>{orderResult}</h5>
                            <Button
                                variant={"contained"}
                                onClick={() => setShowingResultModal(false)}
                            >
                                OK
                            </Button>
                        </div>
                    </Modal>
                </div>
            </Modal>
            <Button
                variant={"contained"}
                color={"primary"}
                onClick={items.length > 0 ? handleModalOpen : () => {}}>
                Order
            </Button>
        </>
    )
}

function ProductsPage({products, addToCart}) {
    return (
        <Grid container style={{width: "100%"}}>
            {products.map(product => (
                <DisplayProduct product={product} addToCart={addToCart}/>
            ))}
        </Grid>
    )
}

function DisplayProduct({product, addToCart}) {
    return (
        <Grid item md={4} xs={4} style={{padding: "20px"}}>
            <h2>{product.name}</h2>
            <div style={{height: "200px"}}>
                <img src={product.imageSrc} alt={`${product.name} illustration`} width={250} height={200}/>
            </div>
            <Grid container>
                <Grid item md={4}>
                    Price: {product.price}€
                </Grid>
                <Grid item md={5} style={{textAlign: "right"}}>
                    <Button variant={"contained"} onClick={() => {addToCart(product)}}>
                        Add To Cart
                    </Button>
                </Grid>

            </Grid>
        </Grid>
    )
}

export function FullPageMessage({value}) {
    return (
        <div style={{padding: "200px", textAlign: "center"}}>
            {value}
        </div>
    )
}

export function BasicLoader({value}) {
    return (
        <div style={{padding: "200px", textAlign: "center"}}>
            <Loader type="TailSpin" color="#00BFFF" height={50} width={50} />
            {value}
        </div>
    )
}