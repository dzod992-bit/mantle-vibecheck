declare module "solc" {
  type Solc = {
    compile(input: string): string;
    version(): string;
  };

  const solc: Solc;
  export default solc;
}
