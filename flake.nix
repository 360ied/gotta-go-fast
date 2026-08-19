{
  description = "A command line utility for practicing typing";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        haskellPackages = pkgs.haskellPackages;

        gotta-go-fast = (haskellPackages.callCabal2nix "gotta-go-fast" ./. { }).overrideAttrs (oldAttrs: {
          nativeBuildInputs = (oldAttrs.nativeBuildInputs or [ ]) ++ [ pkgs.installShellFiles ];
          postInstall = (oldAttrs.postInstall or "") + ''
            installManPage gotta-go-fast.1
            installShellCompletion --fish completions/gotta-go-fast.fish
          '';
        });

        gotta-go-fast-web = pkgs.buildNpmPackage {
          pname = "gotta-go-fast-web";
          version = "0.3.0";
          src = ./web;

          npmDepsHash = "sha256-JfCqhh74J9H9ms0nymRWkG+Pydd6wv1otxth08+6WH0=";

          installPhase = ''
            runHook preInstall
            mkdir -p $out
            cp -r dist/* $out/
            runHook postInstall
          '';

          doCheck = true;
          checkPhase = ''
            runHook preCheck
            npm test
            runHook postCheck
          '';
        };
      in
      {
        packages = {
          default = gotta-go-fast;
          gotta-go-fast = gotta-go-fast;
          gotta-go-fast-web = gotta-go-fast-web;
        };

        checks = {
          gotta-go-fast = gotta-go-fast;
          gotta-go-fast-web = gotta-go-fast-web;
        };

        apps = {
          default = flake-utils.lib.mkApp {
            drv = gotta-go-fast;
          };
          gotta-go-fast = flake-utils.lib.mkApp {
            drv = gotta-go-fast;
          };
          web-dev = flake-utils.lib.mkApp {
            drv = pkgs.writeShellScriptBin "gotta-go-fast-web-dev" ''
              if [ ! -d "web" ]; then
                echo "Error: Directory 'web' not found. Please run this command from the repository root." >&2
                exit 1
              fi
              cd web
              ${pkgs.bun}/bin/bun install --frozen-lockfile
              exec ${pkgs.bun}/bin/bun run dev "$@"
            '';
          };
        };

        devShells.default = haskellPackages.shellFor {
          packages = p: [ gotta-go-fast ];
          buildInputs =
            with haskellPackages;
            [
              cabal-install
              haskell-language-server
              ghcid
              hlint
            ]
            ++ [
              pkgs.nixfmt
              pkgs.nodejs
              pkgs.bun
              pkgs.biome
              pkgs.prefetch-npm-deps
            ];
          withHoogle = true;
        };
      }
    );
}
