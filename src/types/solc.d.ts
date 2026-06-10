declare module "solc" {
  type ImportResult = { contents: string } | { error: string };

  type Solc = {
    compile(
      input: string,
      callbacks?: { import?: (path: string) => ImportResult },
    ): string;
    version(): string;
  };

  const solc: Solc;
  export default solc;
}
