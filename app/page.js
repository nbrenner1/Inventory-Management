'use client'
import Image from "next/image";
import {useState, useEffect} from 'react'
import {firestore} from '@/firebase'
import { Box, Modal, Typography, Stack, TextField, Button, IconButton } from "@mui/material"
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove';
import {collection, doc, getDocs, query, getDoc, setDoc, deleteDoc} from 'firebase/firestore'

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemQuantity, setItemQuantity] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const {quantity} = docSnap.data()

      if (quantity ===1) {
        await deleteDoc(docRef)
      }
      else {
        await setDoc(docRef, {quantity: quantity - 1})
      }
    }

    await updateInventory()
  }

  const addItem = async (item, inputQuantity) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const {quantity} = docSnap.data()
      await setDoc(docRef, {quantity: quantity + Number(inputQuantity)})
    }
    else {
      await setDoc(docRef, {quantity: Number(inputQuantity)})
    }

    await updateInventory()
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <Box bgcolor="black" width="100vw" height="100vh" display="flex" justifyContent="center" alignItems="center" gap={2} flexDirection="column">
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%,-50%)",
          }}
        >
          <Typography varient="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              varient="outlined"
              label="Item Name"
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value)
              }}
            />
            <TextField
              varient="outlined"
              label="Quantity"
              value={itemQuantity}
              onChange={(e) => {
                setItemQuantity(e.target.value)
              }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName, itemQuantity)
                setItemName('')
                setItemQuantity('')
                handleClose()
              }}
            >Add</Button>
          </Stack>
        </Box>
      </Modal>
      <Box border="1px solid #80ffff">
        <Box width="800px" height="100px" bgcolor="#80ffff" display="flex" alignItems="center" justifyContent="center">
          <Typography variant="h2" color="#333">Inventory Items</Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow="auto">
          {
            inventory.map(({name, quantity}) => (
              <Box key={name} width="100%" minHeight="150px" display="flex" alignItems="center" justifyContent="space-between" bgColor="#80ffff" padding={5}>
                <Typography variant="h3" color="#80ffff" textAlign="center">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="h3" color="#80ffff" textAlign="center">
                  {quantity}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <IconButton fontSize="large" onClick={() => {
                    removeItem(name)
                  }}
                  ><RemoveIcon sx={{color: "#80ffff", fontSize: 40 }}/></IconButton>
                  <IconButton fontSize="large" onClick={() => {
                    addItem(name, 1)
                  }}
                  ><AddIcon sx={{color: "#80ffff", fontSize: 40 }}/></IconButton>
                </Stack>
              </Box>
            ))
          }
        </Stack>
      </Box>
      <Button
        variant="contained"
        onClick={()=> {
          handleOpen()
        }}
      >
        Add New Item
      </Button>
    </Box>
  );
}
