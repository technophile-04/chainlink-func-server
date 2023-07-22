// server.js
const express = require("express");
require("dotenv").config();
const { ethers } = require("ethers");
const morgan = require("morgan");

const contractABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
      {
        internalType: "enum Sample.ProposalState",
        name: "state",
        type: "uint8",
      },
    ],
    name: "setProposalState",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
    ],
    name: "getPoposalState",
    outputs: [
      {
        internalType: "enum Sample.ProposalState",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "proposalState",
    outputs: [
      {
        internalType: "enum Sample.ProposalState",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const app = express();
app.use(express.json());
app.use(morgan("combined"));

const GOERLI_ADDRESS = "0x32419B24ee80b3eB9483ABea153dcB4c41F6d968";
const BSC_ADDRESS = "0x8940d80D0FBd2E07468404C9487D6E58B66E61Cb";

app.get("/", (_req, res) => {
  res.send("Hello World");
});
app.get("/api/getRandomNumber", (_req, res) => {
  res.send(`number: ${Math.random()}`);
});

app.post("/api/setstate/:proposalid/:proposalstate", async (req, res) => {
  try {
    const { proposalid, proposalstate } = req.params;
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
      return res.status(500).json({ message: "Private key not found" });
    }

    // setProposalState on Goerli and BSC scan

    // setProposalState on goerli
    const goerliProvider = new ethers.providers.JsonRpcProvider(
      "https://eth-goerli.alchemyapi.io/v2/oKxs-03sij-U_N0iOlrSsZFr29-IqbuF"
    );

    const goerliWallet = new ethers.Wallet(privateKey, goerliProvider);

    const contract = new ethers.Contract(
      GOERLI_ADDRESS,
      contractABI,
      goerliWallet
    );

    // setProposalState on BSC
    const bscProvider = new ethers.providers.JsonRpcProvider(
      "https://summer-boldest-lake.bsc-testnet.discover.quiknode.pro/fa93876224a6140fb7a16dc434245c08d4c1286b/"
    );
    const bscWallet = new ethers.Wallet(privateKey, bscProvider);
    const contractBSC = new ethers.Contract(
      BSC_ADDRESS,
      contractABI,
      bscWallet
    );

    const [gtx, btx] = await Promise.all([
      contract.setProposalState(proposalid, proposalstate),
      contractBSC.setProposalState(proposalid, proposalstate),
    ]);

    await Promise.all([gtx.wait(), btx.wait()]);

    return res.status(200).json({
      message: "Transaction successful",
      gtxHash: gtx.hash,
      btxHash: btx.hash,
    });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
