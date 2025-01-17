const { create } = require('ipfs-http-client');
const OrderManagement = artifacts.require("OrderManagement");
const Verifier = artifacts.require("Verifier");
const ipfs = create({ url: 'http://127.0.0.1:5001/api/v0' });

contract("OrderManagement", accounts => {
    let orderManagement;
    let verifier;
    const owner = accounts[0];
    const customer = accounts[1];

    const proof = {
        a: [
            "0x2d8bf405f87a0b1158bca0f106595ed875c4fbc79dfb2235eac7bbf2bc3e1cef",
            "0x29b561ea77d69c911a6638c1da1ae2dbeb8b5a975296ae09e37a91351668c2df"
        ],
        b: [
            [
                "0x2c9021440eb4c32eb1bfc06dbf5c0297f32e6479b0766782de30d5699382cccf",
                "0x06ddcdf84837c580935def36c3a96db67c01b38bb0e4efece26382c159ee3a16"
            ],
            [
                "0x03484ac44a18288842bdb7fc607854b3d296fe53569328b76538270f74cedeb6",
                "0x2d267c8d53b0a5c78df39f28cdfc0df510f48850a00d6ccc09e04d31f13a6da5"
            ]
        ],
        c: [
            "0x18235b30b06c592eb319c301450cf6b2dfad7e839ecd5bee526577a6a7ece2fe",
            "0x0b2f2c150e5e901789706254528b5fd0e08b0eea99895c4787c6db73a02dfac1"
        ]
    };

    const inputs = [
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000000000000000000000000000015"
    ];

    let ipfsHash;

    beforeEach(async () => {
        verifier = await Verifier.new();
        orderManagement = await OrderManagement.new(verifier.address);
    });

    describe("Order Placement", () => {
        it("should place a new order successfully", async () => {
            const inputValues = inputs.map(input => web3.utils.toBN(input));
            const orderData = {
                product: "Test Product",
                quantity: 1,
                totalCost: 100,
                customerName: "John Doe",
                inputValues: inputValues
            };

          
            const { cid } = await ipfs.add(JSON.stringify(orderData));
            ipfsHash = cid.toString(); 

            const result = await orderManagement.placeOrder(
                orderData.product,
                orderData.quantity,
                orderData.totalCost,
                orderData.customerName,
                inputValues,
                ipfsHash, 
                { from: customer }
            );

            assert.equal(result.logs[0].event, "OrderPlaced");
            assert.equal(result.logs[0].args.orderId.toNumber(), 1);
            assert.equal(result.logs[0].args.product, "Test Product");
            assert.equal (result.logs[0].args.quantity.toNumber(), 1);
            assert.equal(result.logs[0].args.totalCost.toNumber(), 100);
            assert.equal(result.logs[0].args.status, "Pending");
            assert.equal(result.logs[0].args.customerName, "John Doe");
            assert.equal(result.logs[0].args.ipfsHash, ipfsHash); 

            const order = await orderManagement.getOrder(1);
            assert.equal(order.orderId, 1);
            assert.equal(order.product, "Test Product");
            assert.equal(order.quantity, 1);
            assert.equal(order.totalCost, 100);
            assert.equal(order.status, "Pending");
            assert.equal(order.customerName, "John Doe");
            assert.equal(order.customerAddress, customer);
            assert.equal(order.ipfsHash, ipfsHash); 
        });
    });

    describe("Order Verification", () => {
        it("should verify an order with valid proof", async () => {
            const inputValues = inputs.map(input => web3.utils.toBN(input));
            await orderManagement.placeOrder(
                "Test Product",
                1,
                100,
                "John Doe",
                inputValues,
                ipfsHash,
                { from: customer }
            );


            const verifyResult = await orderManagement.verifyOrder(1, proof);
            assert.equal(verifyResult.logs[0].event, "OrderVerified");
            assert.equal(verifyResult.logs[0].args.orderId.toNumber(), 1);
            assert.equal(verifyResult.logs[0].args.verified, true);

          
            const isVerified = await orderManagement.verifyOrder.call(1, proof);
            assert.equal(isVerified, true);
        });
    });

    describe("Order Status Update", () => {
        it("should allow customer to update order status", async () => {
            const inputValues = inputs.map(input => web3.utils.toBN(input));
            
            await orderManagement.placeOrder(
                "Test Product",
                1,
                100,
                "John Doe",
                inputValues,
                ipfsHash,
                { from: customer } 
            );
    
            await orderManagement.updateOrderStatus(1, "Completed", { from: customer }); 
    
            const order = await orderManagement.getOrder(1);
            assert.equal(order.status, "Completed");
        });

        it("should revert when non-customer tries to update status", async () => {
            const inputValues = inputs.map(input => web3.utils.toBN(input));
            
            await orderManagement.placeOrder(
                "Test Product",
                1,
                100,
                "John Doe",
                inputValues,
                ipfsHash,
                { from: customer }
            );

            try {
                await orderManagement.updateOrderStatus(1, "Completed", { from: owner });
                assert.fail("The transaction should have thrown an error");
            } catch (err) {
                assert.include(err.message, "revert", "The error message should contain 'revert'");
            }
        });
    });
});