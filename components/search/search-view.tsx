"use client";

import { useSearchParams } from "next/navigation";

export function SearchView() {
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  return (
    <div className="px-[16px] py-[24px] sm:px-[32px]">
      <h1 className="text-subheading-semibold">Search</h1>
      <p className="mt-[8px] max-w-xl text-body-sm-regular text-text-secondary">
        {query ? `No Around places matched “${query}”.` : "Search places, restaurants, events and offers."} This box is the city search from the navbar. Employer jobs stay under My Jobs. TODO: connect the city search API.
      </p>
    </div>
  );
}
