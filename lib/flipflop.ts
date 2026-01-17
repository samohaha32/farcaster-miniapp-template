export const FLIPFLOP_ADDRESS =
  "0x6760B014CCA5CEc27Abdb586cbE8ad86C3f39998" as const;

export const FLIPFLOP_ABI = [
  {
    type: "function",
    name: "flip",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [
      { name: "heads", type: "bool" },
      { name: "id", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "Flipped",
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "heads", type: "bool" },
      { indexed: false, name: "id", type: "uint256" },
    ],
    anonymous: false,
  },
] as const;
