// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {FunctionsClient} from "@chainlink/contracts@1.4.0/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts@1.4.0/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts@1.4.0/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Minter is FunctionsClient, ConfirmedOwner, ReentrancyGuard, ERC20 {
    using FunctionsRequest for FunctionsRequest.Request;

    // Chainlink Functions state variables
    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;
    uint256 public s_lastWeight; // Weight in grams
    string public s_lastItemName;
    mapping(address => bool) public CoFIRouter;
    mapping(bytes32 => bool) public requestProcessed;
    mapping(address => RequestInfo) public requestsInfo;
    mapping(bytes32 => address) public requestIdToUser;
    uint256 public nonce;
    bool public isProcessingRequest;
    uint256 public constant REQUEST_TIMEOUT = 60;

    struct RequestInfo {
        bytes32 requestId;
        bytes32 requestKey;
        uint256 weight; // Weight in grams
        bool isPending;
        uint256 timestamp;
        string itemName;
    }

    // Errors
    error UnexpectedRequestID(bytes32 requestId);
    error DuplicateRequest(bytes32 requestKey);
    error InvalidArguments();
    error UnauthorizedCaller();
    error UserHasPendingRequest(address user);
    error RequestTimedOut(address user);
    error ContractLocked();

    // Events
    event Response(bytes32 indexed requestId, uint256 weight, string itemName, bytes response, bytes err);
    event RequestSent(bytes32 indexed requestId, address indexed user, uint256 weight, string itemName);
    event RequestCleared(address indexed user, bytes32 requestId);
    event TokensMinted(address indexed user, uint256 amount);

    // Chainlink Functions configuration
    address router = 0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0; // Avalanche Fuji router
    bytes32 donID = 0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000; // Fuji DON ID
    uint32 gasLimit = 500000;

    // JavaScript source for Chainlink Functions
    string source =
        "const apiResponse = await Functions.makeHttpRequest({"
        "  url: 'http://localhost:8080/scale-data',"
        "  timeout: 5000"
        "});"
        "if (apiResponse.error || !apiResponse.data) {"
        "  throw Error(`Request failed: ${apiResponse.error?.message || 'No data'}`);"
        "}"
        "const { weight, itemName } = apiResponse.data;"
        "if (!weight || !itemName) throw Error('Missing weight or itemName');"
        "const weightInGrams = Math.floor(Number(weight) * 1000);" 
        "if (isNaN(weightInGrams) || weightInGrams <= 0) throw Error(`Invalid weight: ${weight}`);"
        "return Functions.encodeUint256(weightInGrams).concat(Functions.encodeString(itemName));";

    constructor() FunctionsClient(router) ConfirmedOwner(msg.sender) ERC20("IoTWeightToken", "IWT") {}

    // Send a request to fetch IoT scale data
    function sendRequest(
        uint64 subscriptionId,
        address user
    ) external nonReentrant returns (bytes32 requestId) {
        if (!CoFIRouter[msg.sender]) revert UnauthorizedCaller();
        if (user == address(0)) revert InvalidArguments();
        if (isProcessingRequest) revert ContractLocked();

        isProcessingRequest = true;

        RequestInfo storage info = requestsInfo[user];
        if (info.isPending) {
            if (block.timestamp > info.timestamp + REQUEST_TIMEOUT) {
                emit RequestCleared(user, info.requestId);
                delete requestsInfo[user];
                delete requestIdToUser[info.requestId];
            } else {
                isProcessingRequest = false;
                revert UserHasPendingRequest(user);
            }
        }

        bytes32 requestKey = keccak256(abi.encode(user, nonce));
        if (requestProcessed[requestKey]) {
            isProcessingRequest = false;
            revert DuplicateRequest(requestKey);
        }

        nonce++;
        requestProcessed[requestKey] = true;
        info.requestKey = requestKey;
        info.isPending = true;
        info.timestamp = block.timestamp;

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);

        bytes32 newRequestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donID
        );

        s_lastRequestId = newRequestId;
        info.requestId = newRequestId;
        requestIdToUser[newRequestId] = user;

        isProcessingRequest = false;
        emit RequestSent(newRequestId, user, 0, "");
        return newRequestId;
    }

    // Add a router address
    function addRouter(address caller) external onlyOwner {
        CoFIRouter[caller] = true;
    }

    // Revoke a router address
    function revokeRouter(address caller) external onlyOwner {
        CoFIRouter[caller] = false;
    }

    // Chainlink Functions callback
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) revert UnexpectedRequestID(requestId);

        uint256 weightInGrams = 0;
        string memory itemName;

        if (response.length > 32 && err.length == 0) {
            weightInGrams = abi.decode(slice(response, 0, 32), (uint256));
            itemName = string(slice(response, 32, response.length - 32));
        }

        address user = requestIdToUser[requestId];
        if (user != address(0)) {
            RequestInfo storage info = requestsInfo[user];
            if (info.isPending && info.requestId == requestId) {
                info.isPending = false;
                info.weight = weightInGrams;
                info.itemName = itemName;
                emit RequestCleared(user, requestId);

                // Mint tokens: 1 token per 10,000 grams (10 kg)
                uint256 tokensToMint = weightInGrams / 10000;
                if (tokensToMint > 0) {
                    _mint(user, tokensToMint * 10**decimals());
                    emit TokensMinted(user, tokensToMint * 10**decimals());
                }
            }
            delete requestIdToUser[requestId];
        }

        s_lastResponse = response;
        s_lastError = err;
        s_lastWeight = weightInGrams;
        s_lastItemName = itemName;

        emit Response(requestId, weightInGrams, itemName, response, err);
    }

    // Helper function to slice bytes
    function slice(
        bytes memory data,
        uint256 start,
        uint256 len
    ) private pure returns (bytes memory) {
        bytes memory result = new bytes(len);
        for (uint256 i = 0; i < len; i++) {
            result[i] = data[start + i];
        }
        return result;
    }

    // Get the latest weight and item name
    function getResult() external view returns (uint256 weight, string memory itemName) {
        return (s_lastWeight, s_lastItemName);
    }

    // Clear timed-out requests
    function clearTimedOutRequest(address user) external {
        RequestInfo storage info = requestsInfo[user];
        if (!info.isPending) revert InvalidArguments();
        if (block.timestamp <= info.timestamp + REQUEST_TIMEOUT) revert InvalidArguments();

        info.isPending = false;
        delete requestIdToUser[info.requestId];
        emit RequestCleared(user, info.requestId);
    }
}