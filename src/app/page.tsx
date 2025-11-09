import FileInput from "./components/FileInput";
import Info from "./components/Info";
import Button from "./components/Button";

export default async function Home() {
  return (
    <div>
      <div className="form">
        <FileInput />
        <Info />
      </div>
      <Button title="Check screen" />
      {/* <h2>Open windows:</h2> */}
    </div>
  );
}
