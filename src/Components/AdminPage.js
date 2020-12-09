import React, {useEffect} from "react"
import {BasicLoader, FullPageMessage} from "./HomePage";
import { DataGrid } from '@material-ui/data-grid'
import {getData} from "../ClientCalls";
import {Button, Typography} from "@material-ui/core";


export function AdminPage() {
    const [error, setError] = React.useState(null)
    const [orders, setOrders] = React.useState([])
    const [isLoaded, setIsLoaded] = React.useState(true)
    const [clickCount, setClickCount] = React.useState(null)

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
                <div style={{ height: 400, width: '100%' }}>
                    <DataGrid rows={orders} columns={columns} pageSize={5} />
                </div>
                <div>
                    <Button color={"primary"} variant={"contained"} onClick={getAdClickCount}>Get Ad Click Count</Button>
                    <Button color={"secondary"} variant={"contained"} href={"/"}>Home</Button>
                    <Typography>Ad click count: {clickCount}</Typography>
                </div>
            </div>

        )
    }
}