function Output({ output }) {
  return (
    <div className="h-[40vh] sm:h-[35vh] md:h-[30vh] max-h-[50vh] bg-black text-white p-4 md:p-6 overflow-y-auto border-t border-gray-700">
      <div className="font-semibold text-gray-300 mb-2">Output:</div>
      <pre className="whitespace-pre-wrap text-sm md:text-base font-mono">
        {output || ""}
      </pre>
    </div>
  );
}

export default Output;
