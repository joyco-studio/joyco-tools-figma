import * as React from "react";
import { Button } from "../components/ui/button";

export function RectangleCreator() {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const onCreate = () => {
    const count = Number(inputRef.current?.value || 0);
    // TODO: Implement rectangle creation logic
  };

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold">Rectangle Creator</h2>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="count" className="text-sm">
            Count
          </label>
          <input
            id="count"
            type="number"
            min="0"
            ref={inputRef}
            className="p-2 text-sm border rounded-md border-neutral-100"
          />
        </div>
        <Button onClick={onCreate}>Create Rectangles</Button>
      </div>
    </div>
  );
}
