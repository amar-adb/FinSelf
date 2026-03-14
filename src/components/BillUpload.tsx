"use client";

import { useState, useRef } from "react";
import { Expense } from "@/lib/types";
import ExpenseForm from "./ExpenseForm";

export default function BillUpload() {
  const [prefill, setPrefill] = useState<Partial<Expense> | null>(null);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const extractDataFromImage = (file: File): Promise<Partial<Expense>> => {
    return new Promise((resolve) => {
      // Simulate OCR extraction - in production, integrate with an OCR API
      setTimeout(() => {
        const today = new Date().toISOString().split("T")[0];
        // Extract mock data based on filename hints
        const name = file.name.toLowerCase();
        let category = "Other";
        let subcategory = "Miscellaneous";
        let amount = Math.floor(Math.random() * 500 + 50);

        if (name.includes("grocery") || name.includes("food")) {
          category = "Food & Dining";
          subcategory = "Groceries";
        } else if (name.includes("fuel") || name.includes("petrol")) {
          category = "Transportation";
          subcategory = "Fuel";
        } else if (name.includes("electric") || name.includes("bill")) {
          category = "Bills";
          subcategory = "Electricity";
        } else if (name.includes("medical") || name.includes("pharma")) {
          category = "Health";
          subcategory = "Medicine";
        }

        resolve({
          date: today,
          amount,
          category,
          subcategory,
          account: "debit_card",
          description: `Bill from ${file.name.replace(/\.[^/.]+$/, "")}`,
        });
      }, 1500);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setProcessing(true);
    const data = await extractDataFromImage(file);
    setProcessing(false);
    setPrefill(data);
  };

  const handleClose = () => {
    setPrefill(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="bill-upload"
        />
        <label htmlFor="bill-upload" className="cursor-pointer">
          <div className="text-4xl mb-3">📸</div>
          <p className="text-gray-600 font-medium">Upload Bill Image</p>
          <p className="text-gray-400 text-sm mt-1">Click to select or drag & drop</p>
        </label>
      </div>

      {processing && (
        <div className="mt-4 flex items-center justify-center gap-2 text-gray-600">
          <div className="animate-spin h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full" />
          <span>Processing bill...</span>
        </div>
      )}

      {preview && !processing && !prefill && (
        <div className="mt-4">
          <img src={preview} alt="Bill preview" className="max-h-48 mx-auto rounded-lg" />
        </div>
      )}

      {prefill && (
        <div className="mt-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
            <p className="text-yellow-800 text-sm font-medium">
              Auto-detected expense details below. Please review and edit if needed before saving.
            </p>
          </div>
          <ExpenseForm prefill={prefill} onClose={handleClose} />
        </div>
      )}
    </div>
  );
}
