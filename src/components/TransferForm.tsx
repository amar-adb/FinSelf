"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Transfer, TRANSFER_MODE_LABELS } from "@/lib/types";
import { useApp } from "@/context/AppContext";

interface TransferFormProps {
  transfer?: Transfer | null;
  onClose: () => void;
}

export default function TransferForm({ transfer, onClose }: TransferFormProps) {
  const { addTransfer, updateTransfer } = useApp();
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    date: transfer?.date || today,
    sendTo: transfer?.sendTo || "",
    sendFrom: transfer?.sendFrom || "",
    receivedFrom: transfer?.receivedFrom || "",
    amount: transfer?.amount?.toString() || "",
    mode: transfer?.mode || ("upi" as Transfer["mode"]),
    description: transfer?.description || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount) return;

    const data: Transfer = {
      id: transfer?.id || uuidv4(),
      date: form.date,
      sendTo: form.sendTo,
      sendFrom: form.sendFrom,
      receivedFrom: form.receivedFrom,
      amount: parseFloat(form.amount),
      mode: form.mode,
      description: form.description,
      createdAt: transfer?.createdAt || new Date().toISOString(),
    };

    if (transfer) {
      updateTransfer(data);
    } else {
      addTransfer(data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {transfer ? "Edit Transfer" : "Add Transfer"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Send From</label>
            <input
              type="text"
              placeholder="Account / Person"
              value={form.sendFrom}
              onChange={(e) => setForm({ ...form, sendFrom: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Send To</label>
            <input
              type="text"
              placeholder="Account / Person"
              value={form.sendTo}
              onChange={(e) => setForm({ ...form, sendTo: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Received From</label>
            <input
              type="text"
              placeholder="Account / Person (if applicable)"
              value={form.receivedFrom}
              onChange={(e) => setForm({ ...form, receivedFrom: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Transfer</label>
            <select
              value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value as Transfer["mode"] })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {Object.entries(TRANSFER_MODE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              placeholder="Transfer details"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              {transfer ? "Update" : "Add Transfer"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
