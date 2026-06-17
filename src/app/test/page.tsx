"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      const result = await supabase
        .from("companies")
        .select("*");

      console.log(result);

      setData(result);
    };

    loadData();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">
        Test Supabase
      </h1>

      <pre>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}