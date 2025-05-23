import * as React from "react";
import * as ReactDOM from "react-dom";
import "./styles/globals.css";
import { pluginApi } from "./api";
import { Button } from "./components/ui/button";

declare function require(path: string): any;

function App() {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const onCreate = () => {
    const count = Number(inputRef.current?.value || 0);
    pluginApi.createRectangle(count);
    pluginApi.notify(`Added ${count} rectangles`);
  };

  const onCancel = () => {
    pluginApi.exit();
  };

  return (
    <main className="bg-white h-[100vh] flex flex-col justify-center items-center w-full">
      <header className="flex flex-col items-center justify-center mb-4">
        <img src={require("./logo.svg")} />
        <h2 className="text-2xl">Rectangle Creator</h2>
      </header>
      <section className="flex flex-row items-center justify-center mb-4 space-x-2">
        <label htmlFor="input">Count</label>
        <input
          className="p-2 border rounded-md border-neutral-100"
          id="input"
          type="number"
          min="0"
          ref={inputRef}
        />
      </section>
      <footer className="flex flex-row items-center justify-center space-x-2">
        <Button onClick={onCreate}>Create</Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </footer>
    </main>
  );
}

ReactDOM.render(<App />, document.getElementById("react-page"));
