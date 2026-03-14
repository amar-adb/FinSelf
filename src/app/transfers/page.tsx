"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import TransferForm from "@/components/TransferForm";
import { Transfer, TRANSFER_MODE_LABELS } from "@/lib/types";

export default function TransfersPage() {
  const { transfers, deleteTransfer } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null);

  const sortedTransfers = [...transfers].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transfers</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          + Add Transfer
        </button>
      </div>

      {transfers.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🔄</div>
          <p className="text-lg">No transfers yet. Record your first transfer!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedTransfers.map((transfer) => (
            <div key={transfer.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold text-gray-800">
                      ₹{transfer.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      {TRANSFER_MODE_LABELS[transfer.mode]}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                    <p><span className="text-gray-400">Date:</span> {transfer.date}</p>
                    {transfer.sendFrom && (
                      <p><span className="text-gray-400">From:</span> {transfer.sendFrom}</p>
                    )}
                    {transfer.sendTo && (
                      <p><span className="text-gray-400">To:</span> {transfer.sendTo}</p>
                    )}
                    {transfer.receivedFrom && (
                      <p><span className="text-gray-400">Received From:</span> {transfer.receivedFrom}</p>
                    )}
                  </div>
                  {transfer.description && (
                    <p className="text-sm text-gray-500 mt-2">{transfer.description}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setEditingTransfer(transfer)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this transfer?")) deleteTransfer(transfer.id);
                    }}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showForm || editingTransfer) && (
        <TransferForm
          transfer={editingTransfer}
          onClose={() => {
            setShowForm(false);
            setEditingTransfer(null);
          }}
        />
      )}
    </div>
  );
}
