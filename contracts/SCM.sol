// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/functions/FunctionsClient.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SCMToken is ERC20, FunctionsClient, Ownable, ReentrancyGuard {
    enum DeliveryStatus { None, Pending, Shipped, Delivered }

    struct ItemRequest {
        uint256 weight;
        address seller;
        DeliveryStatus status;
        uint256 timestamp;
    }

    mapping(bytes32 => ItemRequest) public requests;

    // Chainlink state
    bytes32 public routerDONId;
    uint32 public gasLimit = 200_000;
    string public sourceJS;

    event RequestMinted(bytes32 indexed reqId, address indexed seller, uint256 weight);
    event DeliveryUpdated(bytes32 indexed reqId, DeliveryStatus status);

    constructor(address router, bytes32 _donId, string memory _sourceJS) FunctionsClient(router) ERC20("SCMToken","SCMT") {
        routerDONId = _donId;
        sourceJS = _sourceJS;
    }

    function createAndMint(uint64 subscriptionId, string calldata itemId) external returns (bytes32) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(sourceJS);
        bytes32 reqId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            routerDONId
        );

        requests[reqId] = ItemRequest(0, msg.sender, DeliveryStatus.None, block.timestamp);
        emit DeliveryUpdated(reqId, DeliveryStatus.None);
        return reqId;
    }

    function fulfillRequest(bytes32 reqId, bytes memory response, bytes memory err) internal override {
        require(err.length == 0, "CL response error");
        uint256 weight = abi.decode(slice(response, 0, 32), (uint256));
        ItemRequest storage it = requests[reqId];
        require(it.seller != address(0), "Invalid req");
        it.weight = weight;
        it.status = DeliveryStatus.Pending;
        _mint(it.seller, weight);
        emit RequestMinted(reqId, it.seller, weight);
        emit DeliveryUpdated(reqId, DeliveryStatus.Pending);
    }

    function updateStatus(bytes32 reqId, DeliveryStatus status) external onlyOwner {
        ItemRequest storage it = requests[reqId];
        require(it.seller != address(0), "Invalid req");
        it.status = status;
        emit DeliveryUpdated(reqId, status);
    }

    function slice(bytes memory data, uint256 start, uint256 len) private pure returns (bytes memory) {
        bytes memory out = new bytes(len);
        for (uint256 i=0; i < len; i++) {
            out[i] = data[start + i];
        }
        return out;
    }

    function getRequest(bytes32 reqId) external view returns(ItemRequest memory) {
        return requests[reqId];
    }
}
