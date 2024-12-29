function Output({ output }) {
  return (
    <div className="h-[30vh] bg-black text-white p-4 overflow-auto">
      <div className="font-bold mb-2">Output:</div>
      <pre className="whitespace-pre-wrap">{output}</pre>
    </div>
  );
}

export default Output;
