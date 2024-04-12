import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'

import { contractABI, contractAddress } from '../utils/constants'

export const TransactionContext = React.createContext();

const { ethereum } = window

const getEtherContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer)
    return transactionContract;
}

export const TransactionContextProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState('')
    const [formData, setFormData] = useState({ addressTo: '', amount: '', message: '', ketword: '' })
    const [isLoading, setIsLoading] = useState(false)
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'))
    const [transactions, setTransactions] = useState([])

    const handleChange = (e, name) => {
        setFormData((preState) => ({ ...preState, [name]: e.target.value }))
    }

    const getAllTransactions = async () => {
        try {
            if (!ethereum) return alert('Make sure you have metamask!')
            const transactionContract = getEtherContract()
            const availableTransactions = await transactionContract.getAllTransactions()
            const structuredTransactions = availableTransactions.map((transaction) => ({
                addressTo: transaction.reciver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10 ** 18),
            }))
            console.log(structuredTransactions)
            setTransactions(structuredTransactions)
        } catch (error) {
            console.error(error)
            throw new Error('Error getting all transactions')
        }
    }


    const checkIfWalletIsConnected = async () => {
        try {
            if (!ethereum) return alert('Make sure you have metamask!')
            const accounts = await ethereum.request({ method: 'eth_accounts' })
            if (accounts.length) {
                setCurrentAccount(accounts[0])
                getAllTransactions();
            } else {
                console.log('No wallet connected')
            }
        } catch (error) {
            console.error(error)
            throw new Error('Error checking wallet connection')
        }
    }

    const checkIfTransactionsExist = async () => {
        try {
            const transactionContract = getEtherContract()
            const transactionCount = await transactionContract.getTransactionCount()
            window.localStorage.setItem('transactionCount', transactionCount.toNumber())
        } catch (error) {
            console.error(error)
            throw new Error('Error checking transactions')
        }
    }


    const connectWallet = async () => {
        try {
            if (!ethereum) return alert('Make sure you have metamask!')
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
            console.log('account===',accounts)
            setCurrentAccount(accounts[0])
            getAllTransactions();
        } catch (error) {
            console.error(error)
            throw new Error('Error connecting wallet')
        }
    }

    const sendTransaction = async () => {
        try {
            if (!ethereum) return alert('Make sure you have metamask!')
            const { addressTo, amount, keyword, message } = formData;
            const transactionContract = getEtherContract()
            const parsedAmount = ethers.utils.parseEther(amount)
            await ethereum.request({
                method: 'eth_sendTransaction', params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208', // 21000 Gwei
                    value: parsedAmount._hex,
                }]
            });

            const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword)
            setIsLoading(true)
            console.log(`Loading - ${transactionHash.hash}`)
            await transactionHash.wait()
            setIsLoading(false)
            console.log(`Success - ${transactionHash.hash}`)

            const transactionCount = await transactionContract.getTransactionCount()
            setTransactionCount(transactionCount.toNumber())
            // window.location.reload(); I don't like to reload the page
        } catch (error) {
            console.error(error)
            throw new Error('Error sending transaction')
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionsExist();
    }, [transactionCount])

    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, isLoading, handleChange, sendTransaction,transactions }}>
            {children}
        </TransactionContext.Provider>
    )
}