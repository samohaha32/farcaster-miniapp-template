"use client";

import { useMemo, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  usePublicClient,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { injected } from "wagmi/connectors";
import { decodeEventLog } from "viem";
import { FLIPFLOP_ABI, FLIPFLOP_ADDRESS } from "@/lib/flipflop";

const BASE_CHAIN_ID = 8453;

export default function Page() {
  const [result, setResult] = useState<null | "HEADS" | "TAILS">(null);
  const [lastTx, setLastTx] = useState<`0x${string}` | null>(null);

  // 1) Account
  const { address, isConnected, chainId } = useAccount();

  // 2) Connect / Disconnect
  const { connectAsync, isPending: isConnecting, error: connectError } =
    useConnect();
  const { disconnect } = useDisconnect();

  // 3) Switch chain
  const { switchChainAsync, isPending: isSwitching, error: switchError } =
    useSwitchChain();

  // 4) Public client (for receipt logs)
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID });

  // 5) Tx write
  const { writeContractAsync, isPending, error } = useWriteContract();

  const status = useMemo(() => {
    if (isConnecting) return "Connecting wallet…";
    if (isSwitching) return "Switching to Base…";
    if (isPending) return "Sending transaction…";
    if (lastTx) return "Waiting for confirmation and reading onchain result…";
    return "";
  }, [isConnecting, isSwitching, isPending, lastTx]);

  async function onConnect() {
    await connectAsync({ connector: injected() });
  }

  async function onFlip() {
    setResult(null);
    setLastTx(null);

    // Ensure connected
    if (!isConnected) {
      await onConnect();
    }

    // Ensure Base network
    if (chainId !== BASE_CHAIN_ID) {
      await switchChainAsync({ chainId: BASE_CHAIN_ID });
    }

    // Send tx
    const txHash = await writeContractAsync({
      address: FLIPFLOP_ADDRESS,
      abi: FLIPFLOP_ABI,
      functionName: "flip",
      chainId: BASE_CHAIN_ID,
    });

    setLastTx(txHash);

    // Wait for receipt (includes logs)
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    // Decode event Flipped(user, heads, id)
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: FLIPFLOP_ABI,
          data: log.data,
          topics: log.topics,
        });

        if (decoded.eventName === "Flipped") {
          const heads = (decoded.args as any).heads as boolean;
          setResult(heads ? "HEADS" : "TAILS");
          return;
        }
      } catch {
        // Not our event, ignore
      }
    }

    // If event wasn't found (ABI mismatch or different event name)
    setResult(null);
  }

  const anyError = connectError ?? switchError ?? error;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 16,
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 16,
          padding: 18,
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Flip Flop</h1>
        <p style={{ opacity: 0.75, marginTop: 8 }}>
          Click Flip → tx on Base → result comes from onchain event.
        </p>

        {/* CONNECT BAR */}
        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 10,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.8, wordBreak: "break-all" }}>
            {isConnected ? `Connected: ${address}` : "Not connected"}
            {isConnected && (
              <span style={{ opacity: 0.7 }}>
                {" "}
                · Chain: {chainId ?? "—"}
              </span>
            )}
          </div>

          {isConnected ? (
            <button
              onClick={() => disconnect()}
              style={{
                padding: "8px 10px",
                borderRadius: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              style={{
                padding: "8px 10px",
                borderRadius: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {isConnecting ? "Connecting…" : "Connect"}
            </button>
          )}
        </div>

        {/* COIN RESULT */}
        <div
          style={{
            marginTop: 16,
            height: 140,
            borderRadius: 14,
            display: "grid",
            placeItems: "center",
            border: "1px dashed rgba(255,255,255,0.18)",
            fontSize: 34,
            fontWeight: 900,
          }}
        >
          {result ?? "🪙"}
        </div>

        {/* FLIP BUTTON */}
        <button
          onClick={onFlip}
          disabled={isConnecting || isSwitching || isPending}
          style={{
            marginTop: 16,
            width: "100%",
            padding: "12px 16px",
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {isConnecting
            ? "Connecting…"
            : isSwitching
              ? "Switching…"
              : isPending
                ? "Sending…"
                : "Flip"}
        </button>

        {status && <p style={{ marginTop: 10 }}>{status}</p>}

        {lastTx && (
          <p style={{ marginTop: 8, wordBreak: "break-all", opacity: 0.8 }}>
            Tx: {lastTx}
          </p>
        )}

        {anyError && (
          <p style={{ marginTop: 8, opacity: 0.9 }}>
            Error: {String(anyError.message ?? anyError)}
          </p>
        )}

        <p style={{ marginTop: 12, opacity: 0.6, fontSize: 12 }}>
          If the result doesn’t appear after confirmation, the event/ABI may be
          different — send me the tx hash and I’ll adjust the decoder.
        </p>
      </div>
    </main>
  );
}
