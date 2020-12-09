import React, {useEffect} from "react"
import {BasicLoader, FullPageMessage} from "./HomePage";
import { DataGrid } from '@material-ui/data-grid'
import {getData, postData} from "../ClientCalls";
import {Button, Typography} from "@material-ui/core";


export function AdminPage() {
    const [error, setError] = React.useState(null)
    const [orders, setOrders] = React.useState([])
    const [isLoaded, setIsLoaded] = React.useState(true)
    const [clickCount, setClickCount] = React.useState(null)
    const [selection, setSelection] = React.useState([])

    useEffect(() => {
        getData('/orders').then(
            (res) => {
                setOrders(res.data)
                setIsLoaded(true)
            },
            (err) => {
                console.log(err)
                setError(err)
            }
        )
    }, [])

    function getAdClickCount() {
        getData('/ad_clicks').then(
            (res) => {
                setClickCount(res.data)
            },
            (err) => {
                console.log(err)
            }
        )
    }

    function handlePayed() {
        if (selection.length > 0) {
            postData('/update_orders', {idArray: selection}).then(
                (res) => {
                    console.log(res.msg)
                    const ordersCopy = [...orders]
                    ordersCopy.forEach(order => {
                        if (selection.some(s => parseInt(s) === order.id)) {
                            order.state = true;
                        }
                    })
                    setOrders(ordersCopy)
                    setSelection([])
                }, (err) => {
                    console.log(err)
                }
            )
        }
    }

    const columns = [
        {field: "id", headerName: "ID"},
        {field: "state", headerName: "State", description: "Is done?"},
        {field: "name", headerName: "Name"},
        {field: "street", headerName: "Street"},
        {field: "number", headerName: "Num"},
        {field: "zip", headerName: "Zip"},
        {field: "city", headerName: "City"},
        {field: "product", headerName: "Product"},
        {field: "volume", headerName: "Volume"},
        {field: "price", headerName: "Price"},
        {field: "total_price", headerName: "Total Price"},
    ]

    if (error) {
        return <FullPageMessage value={"Something went wrong."}/>
    } else if (! isLoaded) {
        return <BasicLoader value={"Loading"}/>
    } else {
        return (
            <div>
                <div style={{ height: 600, width: '100%' }}>
                    <DataGrid
                        onSelectionChange={(newSelection) => {
                            setSelection(newSelection.rowIds);
                        }}
                        rows={orders} columns={columns} pageSize={10} checkboxSelection />
                </div>
                <div>
                    <Button color={"primary"} variant={"contained"} onClick={getAdClickCount}>Get Ad Click Count</Button>
                    <Button color={"primary"} variant={"contained"} onClick={handlePayed}>Mark as paid</Button>
                    <Button color={"secondary"} variant={"contained"} href={"/"}>Home</Button>
                    <Typography>Ad click count: {clickCount}</Typography>
                </div>
            </div>

        )
    }
}