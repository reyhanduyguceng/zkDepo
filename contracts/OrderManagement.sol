// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Verifier.sol"; 

contract OrderManagement {
    Verifier public verifier; 

    struct Order {
        uint orderId;
        string product;
        uint256 quantity;
        uint256 totalCost;
        string status;
        string customerName;
        address customerAddress;
        uint256[] inputValues;  
        string ipfsHash; 
    }

    mapping(uint256 => Order) public orders;
    uint256 public orderCount = 0;

    event OrderPlaced(uint256 orderId, string product, uint256 quantity, uint256 totalCost, string status, string customerName, string ipfsHash);
    event OrderVerified(uint256 orderId, bool verified);

    constructor(address verifierAddress) {
        verifier = Verifier(verifierAddress); 
    }

    
    function placeOrder(
        string memory product,
        uint256 quantity,
        uint256 totalCost,
        string memory customerName,
        uint256[] memory inputValues, 
        string memory ipfsHash 
    ) public {
        orderCount++;
        orders[orderCount] = Order(orderCount, product, quantity, totalCost, "Pending", customerName, msg.sender, inputValues, ipfsHash);
        emit OrderPlaced(orderCount, product, quantity, totalCost, "Pending", customerName, ipfsHash);
    }

    
    function updateOrderStatus(uint256 orderId, string memory status) public {
        Order storage order = orders[orderId];
        require(msg.sender == order.customerAddress, "Only customer can update order");
        order.status = status;
    }
function verifyOrder(uint256 orderId, Verifier.Proof memory proof) public returns (bool) {
    Order memory order = orders[orderId];

  
    require(order.inputValues.length == 4, "Input values should be of length 4");
    uint256[4] memory inputValuesArray;
    for (uint256 i = 0; i < 4; i++) {
        inputValuesArray[i] = order.inputValues[i];
    }

   
    bool isVerified = verifier.verifyTx(proof, inputValuesArray);

   
    emit OrderVerified(orderId, isVerified);

    if (isVerified) {
        orders[orderId].status = "Verified"; 
    }

    return isVerified; 
}

    

   
    function getOrder(uint256 orderId) public view returns (Order memory) {
        return orders[orderId];
    }
}