// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SpendLedger
/// @notice An append-only onchain record of autonomous agent purchases.
/// Each entry proves who spent, how much, against which pre-authorized cap and
/// merchant category, and links back to the Rain card transaction that settled
/// it — an immutable "who spent what, on whose authority" trail on Monad.
contract SpendLedger {
    uint256 public count;

    event PurchaseRecorded(
        uint256 indexed id,
        address indexed agent,
        string merchant,
        uint32 amountCents,
        uint32 capCents,
        string mcc,
        string rainTxnId,
        uint64 timestamp
    );

    /// @notice Record one autonomous purchase. Emits an event; cheap and verifiable.
    /// @return id The sequential id of this receipt.
    function recordPurchase(
        string calldata merchant,
        uint32 amountCents,
        uint32 capCents,
        string calldata mcc,
        string calldata rainTxnId
    ) external returns (uint256 id) {
        id = count;
        count = id + 1;
        emit PurchaseRecorded(
            id,
            msg.sender,
            merchant,
            amountCents,
            capCents,
            mcc,
            rainTxnId,
            uint64(block.timestamp)
        );
    }
}
