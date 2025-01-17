import React, { useState, useEffect } from 'react';
import { create } from 'ipfs-http-client';
import Web3 from 'web3';

const OrderManagementUI = () => {
  // Existing states from OrderManagementUI
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [order, setOrder] = useState({
    product: '',
    quantity: '',
    totalCost: '',
    customerName: '',
    inputValues: ["0x0000000000000000000000000000000000000000000000000000000000000001",
      "0x0000000000000000000000000000000000000000000000000000000000000001",
      "0x0000000000000000000000000000000000000000000000000000000000000001",
      "0x0000000000000000000000000000000000000000000000000000000000000015"]
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orderId, setOrderId] = useState('');
  const [proof, setProof] = useState({});

  // New states for VON Network DID authentication
  const [did, setDid] = useState('');
  const [verkey, setVerkey] = useState('');
  const [alias, setAlias] = useState('');
  const [role, setRole] = useState('Endorser');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState('');


  // Initialize IPFS client
  const ipfs = create({ url: 'http://127.0.0.1:5001/api/v0' });

  // VON Network configuration
  const VON_NETWORK_URL = 'http://localhost:9000';

  // Register DID with VON Network
  const registerDID = async () => {
    if (role !== 'Endorser') {
      setAuthError('Only users with the role "Endorser" can register.');
      return;
    }

    try {
      setLoading(true);
      setAuthError('');
      setSuccess('');

      const response = await fetch(`${VON_NETWORK_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          did: did,
          verkey: verkey,
          alias: alias,
          role: role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthorized(true);
        setSuccess('DID successfully registered!');
      } else {
        throw new Error(data.message || 'Failed to register DID');
      }
    } catch (error) {
      console.error('DID registration error:', error);
      setAuthError(`Failed to register DID: ${error.message}`);
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  // Verify DID exists and is authorized
  const verifyDID = async (did) => {
    try {
      const response = await fetch(`${VON_NETWORK_URL}/did/${did}`);
      const data = await response.json();
      console.log('DID verification response:', data);

      if (response.ok && data) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('DID verification error:', error);
      return false;
    }
  };

  // Connect wallet after DID verification
  const connectWallet = async () => {
    if (!did) {
      setAuthError('Please register DID first');
      return;
    }

    if (isConnecting) return;

    try {
      setIsConnecting(true);
      setError('');
      setAuthError('');

      if (!window.ethereum) {
        throw new Error('Please install MetaMask to use this dApp');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });



      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      setAccount(accounts[0]);

      // Initialize contract
      const contractAddress = '0x6582a583FF50F379833c8af90F27845d520eC382';
      const contractABI = [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "verifierAddress",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "orderId",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "product",
              "type": "string"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "quantity",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "totalCost",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "status",
              "type": "string"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "customerName",
              "type": "string"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "ipfsHash",
              "type": "string"
            }
          ],
          "name": "OrderPlaced",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "orderId",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "bool",
              "name": "verified",
              "type": "bool"
            }
          ],
          "name": "OrderVerified",
          "type": "event"
        },
        {
          "inputs": [],
          "name": "orderCount",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "constant": true
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "orders",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "orderId",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "product",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "quantity",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalCost",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "status",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "customerName",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "customerAddress",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "ipfsHash",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "constant": true
        },
        {
          "inputs": [],
          "name": "verifier",
          "outputs": [
            {
              "internalType": "contract Verifier",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "constant": true
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "product",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "quantity",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalCost",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "customerName",
              "type": "string"
            },
            {
              "internalType": "uint256[]",
              "name": "inputValues",
              "type": "uint256[]"
            },
            {
              "internalType": "string",
              "name": "ipfsHash",
              "type": "string"
            }
          ],
          "name": "placeOrder",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "orderId",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "status",
              "type": "string"
            }
          ],
          "name": "updateOrderStatus",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "orderId",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "X",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "Y",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct Pairing.G1Point",
                  "name": "a",
                  "type": "tuple"
                },
                {
                  "components": [
                    {
                      "internalType": "uint256[2]",
                      "name": "X",
                      "type": "uint256[2]"
                    },
                    {
                      "internalType": "uint256[2]",
                      "name": "Y",
                      "type": "uint256[2]"
                    }
                  ],
                  "internalType": "struct Pairing.G2Point",
                  "name": "b",
                  "type": "tuple"
                },
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "X",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "Y",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct Pairing.G1Point",
                  "name": "c",
                  "type": "tuple"
                }
              ],
              "internalType": "struct Verifier.Proof",
              "name": "proof",
              "type": "tuple"
            }
          ],
          "name": "verifyOrder",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "orderId",
              "type": "uint256"
            }
          ],
          "name": "getOrder",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "orderId",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "product",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "quantity",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "totalCost",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "status",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "customerName",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "customerAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint256[]",
                  "name": "inputValues",
                  "type": "uint256[]"
                },
                {
                  "internalType": "string",
                  "name": "ipfsHash",
                  "type": "string"
                }
              ],
              "internalType": "struct OrderManagement.Order",
              "name": "",
              "type": "tuple"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "constant": true
        }
      ];
      const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
      setContract(contractInstance);

      // Load existing orders
      await loadOrders(contractInstance);

      setSuccess('Wallet connected successfully!');
    } catch (error) {
      console.error('Connection error:', error);
      setError(`Failed to connect: ${error.message}`);
      setIsAuthorized(false);
    } finally {
      setIsConnecting(false);
    }
  };

  // Load existing orders
  const loadOrders = async (contractInstance) => {
    if (!contractInstance) return;

    try {
      const orderCount = await contractInstance.methods.orderCount().call();
      const loadedOrders = [];

      for (let i = 1; i <= orderCount; i++) {
        const order = await contractInstance.methods.getOrder(i).call();
        loadedOrders.push(order);
      }

      setOrders(loadedOrders);
    } catch (err) {
      console.error('Load orders error:', err);
      setError('Failed to load orders: ' + err.message);
    }
  };

  // Handle order submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!web3 || !contract || !account) {
      setError('Please connect your wallet first');
      return;
    }


    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Convert input values to BigNumber format
      const inputValues = order.inputValues.map(val => {
        try {
          const strVal = val.toString();
          return web3.utils.toHex(strVal);
        } catch (err) {
          console.error('Conversion error:', err);
          throw new Error(`Failed to convert value ${val} to BigNumber`);
        }
      });

      const quantity = Number(order.quantity);
      const totalCost = Number(order.totalCost);

      const orderData = {
        ...order,
        inputValues,
        did // Include DID with order data
      };

      // Upload to IPFS
      const { cid } = await ipfs.add(JSON.stringify(orderData));
      const ipfsHash = cid.toString();

      // Send transaction to smart contract
      await contract.methods.placeOrder(
        order.product,
        quantity,
        totalCost,
        order.customerName,
        inputValues,
        ipfsHash
      ).send({ from: account });

      setSuccess('Order placed successfully!');
      await loadOrders(contract);

      // Reset form
      setOrder({
        product: '',
        quantity: '',
        totalCost: '',
        customerName: '',
        inputValues: ['1', '1', '1', '21']
      });
    } catch (err) {
      console.error('Place order error:', err);
      setError('Failed to place order: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify order
  const verifyOrder = async (orderId, proof) => {
    if (!contract || !account) {
      setError("Please connect your wallet first!");
      return;
    }



    try {
      setLoading(true);

      const isValid = await contract.methods.verifyOrder(orderId, proof).send({ from: account });
      setSuccess(`Order ${orderId} verified: ${isValid ? "Valid" : "Invalid"}`);
    } catch (err) {
      console.error("Verification error:", err);
      setError("Verification operation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle account changes
  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      setAccount('');
      setWeb3(null);
      setContract(null);
      setError('Please connect your wallet');
    } else {
      setAccount(accounts[0]);
    }
  };

  useEffect(() => {
    // Set up MetaMask event listeners
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
    },
    card: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      backgroundColor: 'white',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
    },
    input: {
      padding: '8px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px',
    },
    button: {
      padding: '10px',
      backgroundColor: '#0070f3',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    error: {
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      padding: '10px',
      borderRadius: '4px',
      marginTop: '10px',
    },
    success: {
      backgroundColor: '#dcfce7',
      color: '#16a34a',
      padding: '10px',
      borderRadius: '4px',
      marginTop: '10px',
    },
    orderItem: {
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '15px',
      marginBottom: '10px',
    },
    didInfo: {
      backgroundColor: '#f0f9ff',
      padding: '10px',
      borderRadius: '4px',
      marginBottom: '10px',
    }
  };

  // Render DID registration form if not authorized
  if (!isAuthorized) {
    return (
      <div style={styles.card}>
        <h2>Register DID</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          registerDID();
        }} style={styles.form}>
          <input
            style={styles.input}
            placeholder="DID"
            value={did}
            onChange={(e) => setDid(e.target.value)}
            required
          />
          <input
            style={styles.input}
            placeholder="Verkey"
            value={verkey}
            onChange={(e) => setVerkey(e.target.value)}
            required
          />
          <input
            style={styles.input}
            placeholder="Alias (optional)"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
          />
          <select
            style={styles.input}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="Endorser">Endorser</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Registering...' : 'Register DID'}
          </button>
        </form>
        {authError && <div style={styles.error}>{authError}</div>}
        {success && <div style={styles.success}>{success}</div>}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        style={styles.connectButton}
      >
        {isConnecting ? 'Connecting...' : account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
      </button>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.card}>
        <h2>Place New Order</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Product Name"
            value={order.product}
            onChange={(e) => setOrder({ ...order, product: e.target.value })}
            required
          />
          <input
            style={styles.input}
            type="number"
            placeholder="Quantity"
            value={order.quantity}
            onChange={(e) => setOrder({ ...order, quantity: e.target.value })}
            required
          />
          <input
            style={styles.input}
            type="number"
            placeholder="Total Cost"
            value={order.totalCost}
            onChange={(e) => setOrder({ ...order, totalCost: e.target.value })}
            required
          />
          <input
            style={styles.input}
            placeholder="Customer Name"
            value={order.customerName}
            onChange={(e) => setOrder({ ...order, customerName: e.target.value })}
            required
          />
          <button
            type="submit"
            style={styles.button}
            disabled={loading || !account}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      </div>

      <div style={styles.card}>
        <h2>Order Verification</h2>
        <input
          style={styles.input}
          placeholder="Order ID"
          onChange={(e) => setOrderId(e.target.value)}
        />
        <textarea
          style={styles.input}
          placeholder="Proof Data (JSON format)"
          onChange={(e) => {
            const value = e.target.value;
            try {
              if (value.trim() === '') {
                setProof({}); // Reset proof if input is empty
              } else {
                setProof(JSON.parse(value)); // Parse the JSON input
              }
            } catch (error) {
              console.error("Invalid JSON input:", error);
              setError("Invalid JSON format. Please enter valid JSON data.");
            }
          }}
        />
        <button
          onClick={() => verifyOrder(orderId, proof)}
          style={styles.button}
        >
          Verify Order
        </button>
      </div>

      <div style={styles.card}>
        <h2>Order History</h2>
        <div>
          {orders.map((order) => (
            <div key={order.orderId} style={styles.orderItem}>
              <h3>Order #{order.orderId}</h3>
              <p>Product: {order.product}</p>
              <p>Quantity: {order.quantity}</p>
              <p>Total Cost: {order.totalCost}</p>
              <p>Status: {order.status}</p>
              <p>Customer: {order.customerName}</p>
              <p>IPFS Hash: {order.ipfsHash}</p>
              {order.customerAddress === account && (
                <button
                  onClick={() =>
                    contract.methods
                      .updateOrderStatus(order.orderId, 'Completed')
                      .send({ from: account })
                  }
                  style={styles.button}
                >
                  Mark as Completed
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderManagementUI;