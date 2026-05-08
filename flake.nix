{
  description = "Node.js + TypeScript development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      devShells = forAllSystems (system:
        let
          pkgs = import nixpkgs { inherit system; };
          commonPackages = with pkgs; [ nodejs_24 pnpm ];
          bannerMessage = ''echo "🟢 Node.js $(node --version) + pnpm $(pnpm --version) ready"'';
        in
        {
          default =
            if pkgs.stdenv.isLinux then
              (pkgs.buildFHSEnv {
                name = "blueshift-dashboard-dev";
                targetPkgs = pkgs: commonPackages;
                runScript = "bash";
                profile = bannerMessage;
              }).env
            else
              pkgs.mkShell {
                packages = commonPackages;
                shellHook = bannerMessage;
              };
        }
      );
    };
}
