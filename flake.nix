{
  description = "A command line utility for practicing typing";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-22.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        haskellPackages = pkgs.haskellPackages;

        gotta-go-fast = (haskellPackages.callCabal2nix "gotta-go-fast" ./. {}).overrideAttrs (oldAttrs: {
          postInstall = (oldAttrs.postInstall or "") + ''
            install -Dm644 gotta-go-fast.1 $out/share/man/man1/gotta-go-fast.1
            install -Dm644 completions/gotta-go-fast.fish $out/share/fish/vendor_completions.d/gotta-go-fast.fish
          '';
        });
      in
      {
        packages = {
          default = gotta-go-fast;
          gotta-go-fast = gotta-go-fast;
        };

        apps = {
          default = flake-utils.lib.mkApp {
            drv = gotta-go-fast;
          };
          gotta-go-fast = flake-utils.lib.mkApp {
            drv = gotta-go-fast;
          };
        };

        devShells.default = haskellPackages.shellFor {
          packages = p: [ gotta-go-fast ];
          buildInputs = with haskellPackages; [
            cabal-install
            haskell-language-server
            ghcid
          ];
          withHoogle = true;
        };
      });
}
